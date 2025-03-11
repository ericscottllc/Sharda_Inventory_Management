import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search } from 'lucide-react';

interface WarehouseSelectProps {
  selectedWarehouse: string;
  onSelect: (warehouse: string) => void;
}

export function WarehouseSelect({ selectedWarehouse, onSelect }: WarehouseSelectProps) {
  const [warehouses, setWarehouses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWarehouses() {
      try {
        const { data, error } = await supabase
          .from('warehouse')
          .select('"Common Name"');

        if (error) throw error;
        setWarehouses(data?.map(w => w['Common Name']) || []);
      } catch (err) {
        console.error('Error fetching warehouses:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWarehouses();
  }, []);

  const filteredWarehouses = warehouses.filter(w =>
    w.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Select Warehouse</h2>
        <p className="text-gray-600">
          Choose the warehouse where you'll be conducting the inventory count.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
          placeholder="Search warehouses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-4">Loading warehouses...</div>
      ) : (
        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
          {filteredWarehouses.map((warehouse) => (
            <button
              key={warehouse}
              onClick={() => onSelect(warehouse)}
              className={`p-4 text-left rounded-lg border transition-colors ${
                selectedWarehouse === warehouse
                  ? 'bg-blue-50 border-blue-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              {warehouse}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}