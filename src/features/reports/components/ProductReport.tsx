import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useReports } from '../hooks/useReports';
import {
  ProductReport as ProductReportType,
  TransactionDetail,
} from '../types';

export function ProductReport() {
  const { getProductReport } = useReports();

  const [allProducts, setAllProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [report, setReport] = useState<ProductReportType | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch distinct product names once
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('product')
        .select('product_name');

      if (!error && data) {
        // Filter out nulls and empty strings, then sort alphabetically
        const uniqueProducts = [...new Set(data
          .map(r => r.product_name)
          .filter(name => name && name.trim() !== '')
        )].sort();
        
        setAllProducts(uniqueProducts);
      }
    })();
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSelectProduct(name: string) {
    setSelectedProduct(name);
    setSearchTerm(name);
    setOpen(false);
    setLoading(true);
    try {
      const data = await getProductReport(name);
      setReport(data);
    } catch (err) {
      console.error('Error loading product report:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter the list based on search term
  const filteredProducts = searchTerm
    ? allProducts.filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allProducts;

  // Flatten transaction details
  const flattenedTransactions = (report?.transactions || []).flatMap(tx =>
    tx.details.map((d: TransactionDetail) => ({
      id: `${tx.transaction_id}-${d.detail_id}`,
      date: tx.transaction_date,
      reference_number: tx.reference_number || '',
      warehouse: tx.warehouse,
      item_name: d.item_name,
      quantity: d.quantity,
    }))
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Product Report</h2>

      <div className="relative w-full max-w-md" ref={wrapperRef}>
        <label className="block font-semibold mb-1">
          Search or Select Product
        </label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {open && filteredProducts.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded w-full max-h-60 overflow-auto mt-1 shadow-lg">
            {filteredProducts.map((name) => (
              <li
                key={`product-${name}`}
                onClick={() => handleSelectProduct(name)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedProduct && (
        <div>
          {loading ? (
            <div>Loading product report...</div>
          ) : report ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{report.product_name}</h3>

              {/* Items */}
              <div>
                <h4 className="font-semibold">Items for this product</h4>
                {report.items.map((item, itemIndex) => (
                  <div key={`item-${item.item_name}-${itemIndex}`} className="bg-gray-50 p-4 rounded-lg mb-2">
                    <p className="font-medium">{item.item_name}</p>
                    <p>
                      Total On-Hand: {item.total_on_hand.total.toLocaleString()}
                    </p>
                    <p>Stock: {item.total_on_hand.stock.toLocaleString()}</p>
                    <p>
                      Consign: {item.total_on_hand.consign.toLocaleString()}
                    </p>
                    <p>Hold: {item.total_on_hand.hold.toLocaleString()}</p>

                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-700">
                        By Warehouse
                      </summary>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                        {item.by_warehouse.map((wh, whIndex) => (
                          <div key={`wh-${item.item_name}-${wh.warehouse}-${whIndex}`} className="bg-gray-100 p-2 rounded">
                            <p className="font-medium">{wh.warehouse}</p>
                            <p>
                              On-Hand Total: {wh.on_hand.total.toLocaleString()}
                            </p>
                            <p>
                              Stock: {wh.on_hand.stock.toLocaleString()}
                            </p>
                            <p>
                              Consign: {wh.on_hand.consign.toLocaleString()}
                            </p>
                            <p>Hold: {wh.on_hand.hold.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))}
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-semibold">
                  Recent Transactions ({report.transaction_count})
                </h4>
                {flattenedTransactions.length === 0 ? (
                  <p className="mt-2">No transactions found.</p>
                ) : (
                  <table className="min-w-full bg-white mt-2">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Reference #</th>
                        <th className="px-4 py-2">Warehouse</th>
                        <th className="px-4 py-2">Item</th>
                        <th className="px-4 py-2">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flattenedTransactions.map((row) => (
                        <tr key={row.id}>
                          <td className="border px-4 py-2">
                            {row.date
                              ? new Date(row.date).toLocaleDateString()
                              : ''}
                          </td>
                          <td className="border px-4 py-2">
                            {row.reference_number}
                          </td>
                          <td className="border px-4 py-2">{row.warehouse}</td>
                          <td className="border px-4 py-2">{row.item_name}</td>
                          <td className="border px-4 py-2">
                            {row.quantity.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div>No report data.</div>
          )}
        </div>
      )}
    </div>
  );
}