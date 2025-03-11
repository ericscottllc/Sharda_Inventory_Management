// /home/project/src/features/transactions/components/TransactionList.tsx

import React, { useState, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { TransactionHeader } from '../types';
import { supabase } from '../../../lib/supabase';
import toast from 'react-hot-toast';
import { TransactionFilters, TransactionFiltersState } from './TransactionFilters';

const ITEMS_PER_PAGE = 50;

// Define getNextStepLabel so that it's available for button labels
const getNextStepLabel = (transactionType: string) => {
  const type = transactionType.toLowerCase();
  if (type === 'inbound') return 'Receive';
  if (type === 'outbound') return 'Ship';
  if (type === 'adjustment') return 'Complete';
  return 'Advance';
};

interface TransactionListProps {
  loading: boolean;
  transactions: TransactionHeader[];
  getStatusColor: (status: string) => string;
  onEditClick: (transaction: TransactionHeader, detailIndex: number) => void;
  onEditHeaderClick?: (transaction: TransactionHeader) => void;
  onAdvanceClick?: (transaction: TransactionHeader) => void;
  showAdvanceButton?: boolean;
}

export function TransactionList({
  loading,
  transactions,
  getStatusColor,
  onEditClick,
  onEditHeaderClick,
  onAdvanceClick,
  showAdvanceButton = false,
}: TransactionListProps) {
  // Local state for filters (using the existing TransactionFilters component)
  const [filters, setFilters] = useState<TransactionFiltersState>({
    type: '',
    status: '',
    reference: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filtered, setFiltered] = useState<TransactionHeader[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const clearFilters = () => {
    setFilters({ type: '', status: '', reference: '' });
  };

  // Simple filter logic based on type, status, and reference
  const applyFilterLogic = () => {
    let results = [...transactions];
    if (filters.type) {
      results = results.filter((tx) => tx.transaction_type === filters.type);
    }
    if (filters.status) {
      results = results.filter((tx) =>
        tx.details?.some((d) => d.status === filters.status)
      );
    }
    if (filters.reference) {
      results = results.filter((tx) =>
        tx.reference_number.toLowerCase().includes(filters.reference.toLowerCase())
      );
    }
    setFiltered(results);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilterLogic();
  }, [filters, transactions]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedTx = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDeleteHeader = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transaction_header')
        .delete()
        .eq('transaction_id', transactionId);
      if (error) throw error;
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleDeleteDetail = async (transaction: TransactionHeader, detailId: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction detail?')) return;
    try {
      const { error } = await supabase
        .from('transaction_detail')
        .delete()
        .eq('detail_id', detailId);
      if (error) throw error;
      toast.success('Transaction detail deleted successfully');
      // If this was the only detail, delete the header as well.
      if ((transaction.details?.length ?? 0) === 1) {
        await handleDeleteHeader(transaction.transaction_id);
      }
    } catch (error) {
      console.error('Error deleting transaction detail:', error);
      toast.error('Failed to delete transaction detail');
    }
  };

  if (loading) {
    return <div className="px-4 py-2 text-center">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return <div className="px-4 py-2 text-center">No transactions found.</div>;
  }

  return (
    <div>
      {/* Render filter controls */}
      <TransactionFilters
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        clearFilters={clearFilters}
      />
      <div className="overflow-x-auto">
        <table className="table-auto min-w-max divide-y divide-gray-200 text-sm whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2">Actions</th>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Ref #</th>
              {/* Transaction Status column removed */}
              <th className="px-3 py-2">Warehouse</th>
              <th className="px-3 py-2">Inv. Status</th>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Volume</th>
              <th className="px-3 py-2">Comments</th>
              <th className="px-3 py-2">Shipment Carrier</th>
              <th className="px-3 py-2">Shipping Doc</th>
              <th className="px-3 py-2">Customer PO</th>
              <th className="px-3 py-2">Lot Number</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedTx.map((transaction) => {
              const details = transaction.details || [];
              if (details.length === 0) {
                return (
                  <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        {onEditHeaderClick && (
                          <button
                            onClick={() => onEditHeaderClick(transaction)}
                            title="Edit Header"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {showAdvanceButton && onAdvanceClick && (
                          <button
                            onClick={() => onAdvanceClick(transaction)}
                            className="px-2 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
                          >
                            {getNextStepLabel(transaction.transaction_type)}
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteHeader(transaction.transaction_id)}
                          title="Delete Transaction"
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{transaction.reference_number}</td>
                    <td className="px-3 py-2">{transaction.warehouse || '-'}</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2 text-gray-400 italic">No details</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">-</td>
                    <td className="px-3 py-2">-</td>
                  </tr>
                );
              }
              return details.map((detail, idx) => {
                const isFirstDetail = idx === 0;
                const hasPending = detail.status === 'Pending';
                return (
                  <tr key={detail.detail_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="flex items-center space-x-2">
                        {isFirstDetail && onEditHeaderClick && (
                          <button
                            onClick={() => onEditHeaderClick(transaction)}
                            title="Edit Header"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {isFirstDetail && showAdvanceButton && hasPending && onAdvanceClick && (
                          <button
                            onClick={() => onAdvanceClick(transaction)}
                            className="px-2 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
                          >
                            {getNextStepLabel(transaction.transaction_type)}
                          </button>
                        )}
                        <button
                          onClick={() => onEditClick(transaction, idx)}
                          title="Edit Detail"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDetail(transaction, detail.detail_id)}
                          title="Delete Detail"
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{transaction.reference_number}</td>
                    <td className="px-3 py-2">{transaction.warehouse || '-'}</td>
                    <td className="px-3 py-2">{detail.inventory_status || '-'}</td>
                    <td className="px-3 py-2">{detail.item_name || '-'}</td>
                    <td className="px-3 py-2">
                      {detail.quantity != null ? detail.quantity : '-'}
                    </td>
                    <td className="px-3 py-2">{detail.comments || '-'}</td>
                    <td className="px-3 py-2">{detail.shipment_carrier || '-'}</td>
                    <td className="px-3 py-2">{detail.shipping_document || '-'}</td>
                    <td className="px-3 py-2">{detail.customer_po || '-'}</td>
                    <td className="px-3 py-2">{detail.lot_number || '-'}</td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-end items-center space-x-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
