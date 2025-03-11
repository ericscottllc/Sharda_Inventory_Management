import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import { InventoryFilters as IInventoryFilters } from '../types';

interface InventoryFilterProps {
  filters: IInventoryFilters;
  setFilters: (filters: IInventoryFilters) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  onRefresh: () => void;
}

export function InventoryFilterBar({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  onRefresh
}: InventoryFilterProps) {
  const clearFilters = () => {
    setFilters({
      search: ''
    });
  };

  return (
    <div className="p-4 border-b space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search items, warehouses, or inventory status..."
            className="pl-9 pr-4 py-2 border rounded-lg w-full"
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
          {(filters.search || filters.status) && (
            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-800 flex items-center"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFilters({ ...filters, status: 'Stock' })}
            className={`px-3 py-2 rounded-lg flex-1 ${
              filters.status === 'Stock'
                ? 'bg-blue-600 text-white'
                : 'border hover:bg-gray-50'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'Consignment' })}
            className={`px-3 py-2 rounded-lg flex-1 ${
              filters.status === 'Consignment'
                ? 'bg-purple-600 text-white'
                : 'border hover:bg-gray-50'
            }`}
          >
            Consignment
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'Hold' })}
            className={`px-3 py-2 rounded-lg flex-1 ${
              filters.status === 'Hold'
                ? 'bg-red-600 text-white'
                : 'border hover:bg-gray-50'
            }`}
          >
            Hold
          </button>
          {filters.status && (
            <button
              onClick={() => setFilters({ ...filters, status: undefined })}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50"
              title="Clear status filter"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}