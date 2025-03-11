import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { CountData } from '../types';

interface CountEntryProps {
  warehouse: string;
  date: string;
  countData: CountData[];
  onCountUpdate: (data: CountData[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function CountEntry({
  warehouse,
  date,
  countData,
  onCountUpdate,
  onComplete,
  onBack
}: CountEntryProps) {
  const [items, setItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'counted' | 'uncounted'>('all');

  useEffect(() => {
    async function fetchItems() {
      try {
        const { data, error } = await supabase
          .from('item')
          .select('item_name')
          .order('item_name');

        if (error) throw error;
        setItems(data?.map(i => i.item_name) || []);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Filter items based on search term and count status
  const filteredItems = items.filter(item => {
    const matchesSearch = item.toLowerCase().includes(searchTerm.toLowerCase());
    const isInCountData = countData.some(d => d.itemName === item);
    
    switch (filter) {
      case 'counted':
        return matchesSearch && isInCountData;
      case 'uncounted':
        return matchesSearch && !isInCountData;
      default:
        return matchesSearch;
    }
  });

  const addItem = (itemName: string) => {
    if (countData.some(d => d.itemName === itemName)) return;
    onCountUpdate([...countData, { itemName, quantity: 0 }]);
  };

  const updateCount = (index: number, quantity: number) => {
    const newData = [...countData];
    newData[index] = { ...newData[index], quantity };
    onCountUpdate(newData);
  };

  const removeItem = (index: number) => {
    const newData = [...countData];
    newData.splice(index, 1);
    onCountUpdate(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (countData.length === 0) return;
    onComplete();
  };

  // Get stats for the count
  const stats = {
    total: countData.length,
    counted: countData.filter(d => d.quantity > 0).length,
    remaining: countData.filter(d => d.quantity === 0).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold">Enter Count Data</h2>
            <p className="text-gray-600 mt-1">
              Record the physical count for each item
            </p>
          </div>
        </div>
      </div>

      {/* Count Progress */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{stats.counted}</div>
            <div className="text-sm text-gray-600">Counted</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{stats.remaining}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>
        {stats.total > 0 && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-green-500 rounded-full transition-all"
                style={{ width: `${(stats.counted / stats.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('counted')}
            className={`px-3 py-1 rounded ${
              filter === 'counted'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Counted
          </button>
          <button
            onClick={() => setFilter('uncounted')}
            className={`px-3 py-1 rounded ${
              filter === 'uncounted'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Uncounted
          </button>
        </div>
      </div>

      {/* Add New Item */}
      {searchTerm && !countData.some(d => d.itemName.toLowerCase() === searchTerm.toLowerCase()) && (
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {filteredItems.map((item) => (
            <button
              key={item}
              onClick={() => addItem(item)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
              disabled={countData.some(d => d.itemName === item)}
            >
              <Plus className="w-4 h-4 mr-2 text-gray-400" />
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Count List */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {countData.map((item, index) => (
            <div
              key={item.itemName}
              className={`flex items-center space-x-4 p-4 border rounded-lg ${
                item.quantity > 0 ? 'bg-green-50 border-green-200' : ''
              }`}
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  {item.itemName}
                </label>
              </div>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateCount(index, parseInt(e.target.value) || 0)
                }
                className="w-32 border rounded-lg px-3 py-2"
                min="0"
                required
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={countData.length === 0}
          >
            Review Variances
          </button>
        </div>
      </form>
    </div>
  );
}