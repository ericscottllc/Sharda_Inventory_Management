import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import { TransactionType, TransactionStatus } from '../types';

interface TransactionFiltersState {
  type?: TransactionType | '';
  status?: TransactionStatus | '';
  reference?: string;
}

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  setFilters: (filters: TransactionFiltersState) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  clearFilters: () => void;
}

export function TransactionFilters({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  clearFilters
}: TransactionFiltersProps) {
  return (
    <div className="p-4 border-b space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reference..."
            className="pl-9 pr-4 py-2 border rounded-lg w-64"
            value={filters.reference || ''}
            onChange={(e) => setFilters({ ...filters, reference: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          {(filters.type || filters.status || filters.reference) && (
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as TransactionType })}
            >
              <option value="">All</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
              <option value="Adjustment">Adjustment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as TransactionStatus })}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Received">Received</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
