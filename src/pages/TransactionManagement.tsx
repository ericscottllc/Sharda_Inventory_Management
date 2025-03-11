import React, { useState } from 'react';
import { Package, Truck as TruckDelivery, ArrowRightLeft, FileText } from 'lucide-react';
import { useTransactions } from '../features/transactions/hooks/useTransactions';
import {
  TransactionHeader,
  TransactionDetail
} from '../features/transactions/types';

import { TransactionCreateModal } from '../features/transactions/components/modals/TransactionCreateModal';
import { TransactionEditModal } from '../features/transactions/components/modals/TransactionEditModal';
import { TransactionList } from '../features/transactions/components/TransactionList';

export function TransactionManagement() {
  const {
    transactions,
    loading,
    createTransaction,
    updateTransactionDetail,
    updateTransactionHeader,
    advanceTransactionToNextStep
  } = useTransactions();

  // Create Transaction Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalType, setCreateModalType] =
    useState<'inbound-po' | 'outbound-so' | 'transfer' | 'other' | null>(null);

  // Edit Transaction Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHeader | null>(null);
  const [selectedDetailIndex, setSelectedDetailIndex] = useState<number | null>(null);

  // Identify "pending" transactions - any that has at least one detail with status 'Pending'
  const pendingTransactions = transactions.filter(t =>
    t.details?.some(d => d.status === 'Pending')
  );

  // The rest are "history"
  const transactionHistory = transactions.filter(t => !pendingTransactions.includes(t));

  // Provide color classes for statuses
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Received':
        return 'bg-purple-100 text-purple-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handlers
  const handleNewTransaction = (type: 'inbound-po' | 'outbound-so' | 'transfer' | 'other') => {
    setCreateModalType(type);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalType(null);
    setShowCreateModal(false);
  };

  // Called when user clicks "Edit" in the table
  const handleEditClick = (transaction: TransactionHeader, detailIndex: number) => {
    setSelectedTransaction(transaction);
    setSelectedDetailIndex(detailIndex);
    setShowEditModal(true);
  };

  // Save header changes
  const handleSaveHeader = async (transactionId: string, fields: Partial<TransactionHeader>) => {
    return updateTransactionHeader(transactionId, fields);
  };

  // Save detail changes
  const handleSaveDetail = async (transactionId: string, detail: TransactionDetail) => {
    return updateTransactionDetail(transactionId, detail);
  };

  // Called after user closes or successful creation
  const handleCompleteCreate = () => {
    setCreateModalType(null);
    setShowCreateModal(false);
  };

  // Advance next step
  const handleAdvanceNextStep = async (transaction: TransactionHeader) => {
    await advanceTransactionToNextStep(transaction);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Transaction Management</h1>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => handleNewTransaction('inbound-po')}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700"
        >
          <Package className="w-5 h-5" />
          <span>Inbound PO</span>
        </button>
        <button
          onClick={() => handleNewTransaction('outbound-so')}
          className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700"
        >
          <TruckDelivery className="w-5 h-5" />
          <span>Outbound SO</span>
        </button>
        <button
          onClick={() => handleNewTransaction('transfer')}
          className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700"
        >
          <ArrowRightLeft className="w-5 h-5" />
          <span>Transfer</span>
        </button>
        <button
          onClick={() => handleNewTransaction('other')}
          className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700"
        >
          <FileText className="w-5 h-5" />
          <span>Other</span>
        </button>
      </div>

      {/* Pending Transactions Section */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Pending Transactions</h2>
        </div>
        <TransactionList
          loading={loading}
          transactions={pendingTransactions}
          getStatusColor={getStatusColor}
          onEditClick={handleEditClick}
          onAdvanceClick={handleAdvanceNextStep}
          showAdvanceButton={true}
        />
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Transaction History</h2>
        </div>
        <TransactionList
          loading={loading}
          transactions={transactionHistory}
          getStatusColor={getStatusColor}
          onEditClick={handleEditClick}
          showAdvanceButton={false}
        />
      </div>

      {/* Create Modal */}
      <TransactionCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onComplete={handleCompleteCreate}
        initialWorkflow={createModalType}
      />

      {/* Edit Modal */}
      <TransactionEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
          setSelectedDetailIndex(null);
        }}
        transaction={selectedTransaction}
        detailIndex={selectedDetailIndex}
        onSaveHeader={handleSaveHeader}
        onSaveDetail={handleSaveDetail}
      />
    </div>
  );
}
