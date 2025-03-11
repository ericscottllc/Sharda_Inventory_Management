import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useReports } from '../hooks/useReports';
import { ItemReport as ItemReportType, TransactionDetail } from '../types';

interface ItemReportProps {
  initialItemName?: string;
}

export function ItemReport({ initialItemName = '' }: ItemReportProps) {
  const { getItemReport } = useReports();

  const [allItems, setAllItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(initialItemName);

  const [report, setReport] = useState<ItemReportType | null>(null);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Fetch all item names once
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('item')
        // If you want distinct item names, you can do:
        // .select('item_name', { distinct: true });
        .select('item_name');
      if (!error && data) {
        const names = data.map((i) => i.item_name);
        setAllItems(names);
      }
    })();
  }, []);

  // If we have an initial item from negative inventory
  useEffect(() => {
    if (initialItemName) {
      handleSelectItem(initialItemName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialItemName]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSelectItem(itemName: string) {
    setSelectedItem(itemName);
    setSearchTerm(itemName);
    setOpen(false);
    setLoading(true);
    try {
      const data = await getItemReport(itemName);
      setReport(data);
    } catch (err) {
      console.error('Error loading item report:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filtered list for the autocomplete
  const filteredItems = searchTerm
    ? allItems.filter((nm) =>
        nm.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allItems;

  // Flatten transactions: Date, Reference #, Warehouse, Item, Quantity
  const flattenedTransactions = (report?.transactions || []).flatMap((tx) =>
    tx.details.map((d: TransactionDetail) => ({
      date: tx.transaction_date,
      reference_number: tx.reference_number || '',
      warehouse: tx.warehouse,
      item_name: d.item_name,
      quantity: d.quantity,
    }))
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Item Report</h2>

      <div className="relative w-full max-w-md" ref={wrapperRef}>
        <label className="block font-semibold mb-1">Search or Select Item</label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {open && filteredItems.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded w-full max-h-60 overflow-auto mt-1 shadow-lg">
            {filteredItems.map((name) => (
              <li
                key={name}
                onClick={() => handleSelectItem(name)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedItem && (
        <div>
          {loading ? (
            <div>Loading item report...</div>
          ) : report ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{report.item_name}</h3>

              {/* On-Hand totals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <strong>Total On-Hand:</strong>{' '}
                  {report.total_on_hand.total.toLocaleString()}
                </div>
                <div>
                  <strong>Stock:</strong>{' '}
                  {report.total_on_hand.stock.toLocaleString()}
                </div>
                <div>
                  <strong>Consign:</strong>{' '}
                  {report.total_on_hand.consign.toLocaleString()}
                </div>
                <div>
                  <strong>Hold:</strong>{' '}
                  {report.total_on_hand.hold.toLocaleString()}
                </div>
              </div>

              {/* By Warehouse */}
              <div>
                <h4 className="font-semibold">By Warehouse</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  {report.by_warehouse.map((wh, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{wh.warehouse}</p>
                      <p>On-Hand Total: {wh.on_hand.total.toLocaleString()}</p>
                      <p>Stock: {wh.on_hand.stock.toLocaleString()}</p>
                      <p>Consign: {wh.on_hand.consign.toLocaleString()}</p>
                      <p>Hold: {wh.on_hand.hold.toLocaleString()}</p>
                      <p>Inbound: {wh.inbound.total.toLocaleString()}</p>
                      <p>
                        Scheduled Outbound:{' '}
                        {wh.scheduled_outbound.total.toLocaleString()}
                      </p>
                      <p>
                        Future Inventory:{' '}
                        {wh.future_inventory.total.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-semibold">
                  Recent Transactions ({report.transaction_count})
                </h4>
                {flattenedTransactions.length === 0 ? (
                  <p className="mt-2">No recent transactions.</p>
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
                      {flattenedTransactions.map((row, i) => (
                        <tr key={i}>
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
            <div>No report data available.</div>
          )}
        </div>
      )}
    </div>
  );
}
