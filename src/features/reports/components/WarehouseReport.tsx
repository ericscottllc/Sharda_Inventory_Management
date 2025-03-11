import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

interface InventoryItem {
  Item: string;
  Warehouse: string;
  on_hand_total: number;
  on_hand_stock: number;
  on_hand_consign: number;
  on_hand_hold: number;
  inbound_total: number;
  scheduled_outbound_total: number;
  future_inventory_total: number;
}

export function WarehouseReport() {
  const [allWarehouses, setAllWarehouses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Load distinct warehouse names once
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('warehouse')
        .select('"Common Name"');
      if (!error && data) {
        const names = data
          .map((w) => w['Common Name'])
          .filter((x): x is string => x != null && x.trim() !== '')
          .sort();
        setAllWarehouses(names);
      }
    })();
  }, []);

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

  async function handleSelectWarehouse(name: string) {
    setSelectedWarehouse(name);
    setSearchTerm(name);
    setOpen(false);
    setLoading(true);

    try {
      // Query the transactions_inventory_summary view for this warehouse
      const { data, error } = await supabase
        .from('transactions_inventory_summary')
        .select('*')
        .eq('Warehouse', name)
        .or('on_hand_total.gt.0,inbound_total.gt.0,scheduled_outbound_total.gt.0,future_inventory_total.gt.0')
        .order('Item', { ascending: true });

      if (error) throw error;

      // Filter out rows where all values are 0
      const activeInventory = (data || []).filter(row => 
        row.on_hand_total !== 0 ||
        row.inbound_total !== 0 ||
        row.scheduled_outbound_total !== 0 ||
        row.future_inventory_total !== 0
      );

      setInventory(activeInventory);
    } catch (err) {
      console.error('Error loading warehouse inventory:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter the warehouse list
  const filteredWarehouses = searchTerm
    ? allWarehouses.filter((w) =>
        w.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allWarehouses;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Warehouse Report</h2>

      <div className="relative w-full max-w-md" ref={wrapperRef}>
        <label className="block font-semibold mb-1">
          Search or Select Warehouse
        </label>
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          placeholder="Search warehouses..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {open && filteredWarehouses.length > 0 && (
          <ul className="absolute z-10 bg-white border rounded w-full max-h-60 overflow-auto mt-1 shadow-lg">
            {filteredWarehouses.map((name) => (
              <li
                key={`warehouse-${name}`}
                onClick={() => handleSelectWarehouse(name)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedWarehouse && (
        <div>
          {loading ? (
            <div>Loading warehouse inventory...</div>
          ) : inventory.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{selectedWarehouse}</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-right">On Hand Total</th>
                      <th className="px-4 py-2 text-right">Stock</th>
                      <th className="px-4 py-2 text-right">Consignment</th>
                      <th className="px-4 py-2 text-right">Hold</th>
                      <th className="px-4 py-2 text-right">Inbound</th>
                      <th className="px-4 py-2 text-right">Scheduled Out</th>
                      <th className="px-4 py-2 text-right">Future Inventory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, index) => (
                      <tr key={`${item.Item}-${index}`} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">{item.Item}</td>
                        <td className="border px-4 py-2 text-right">
                          {item.on_hand_total?.toLocaleString() || '0'}
                        </td>
                        <td className="border px-4 py-2 text-right">
                          {item.on_hand_stock?.toLocaleString() || '0'}
                        </td>
                        <td className="border px-4 py-2 text-right">
                          {item.on_hand_consign?.toLocaleString() || '0'}
                        </td>
                        <td className="border px-4 py-2 text-right">
                          {item.on_hand_hold?.toLocaleString() || '0'}
                        </td>
                        <td className="border px-4 py-2 text-right">
                          {item.inbound_total?.toLocaleString() || '0'}
                        </td>
                        <td className="border px-4 py-2 text-right">
                          {item.scheduled_outbound_total?.toLocaleString() || '0'}
                        </td>
                        <td className="border px-4 py-2 text-right">
                          {item.future_inventory_total?.toLocaleString() || '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>No inventory data found for this warehouse.</div>
          )}
        </div>
      )}
    </div>
  );
}