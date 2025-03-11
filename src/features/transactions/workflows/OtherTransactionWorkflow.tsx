import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { TransactionFormData, TransactionType } from '../types';
import { TransactionFormFields } from '../components/TransactionFormFields';

interface OtherTransactionWorkflowProps {
  onComplete: () => void;
  onBack: () => void;
}

export function OtherTransactionWorkflow({ onComplete, onBack }: OtherTransactionWorkflowProps) {
  const { createTransaction } = useTransactions();
  const { warehouses, items, loading } = useTransactionForm();
  const [formData, setFormData] = useState<Partial<TransactionFormData>>({
    date: new Date().toISOString().split('T')[0],
    items: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type && formData.items?.length) {
      await createTransaction(formData as TransactionFormData);
      onComplete();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold">Other Transaction</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <select
              value={formData.type || ''}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="">Select Type</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
              <option value="Adjustment">Adjustment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Type
            </label>
            <input
              type="text"
              value={formData.referenceType || ''}
              onChange={(e) => setFormData({ ...formData, referenceType: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Enter reference type"
              required
            />
          </div>
        </div>

        <TransactionFormFields
          formData={formData}
          setFormData={setFormData}
          showSourceWarehouse={formData.type === 'Outbound' || formData.type === 'Adjustment'}
          showDestinationWarehouse={formData.type === 'Inbound'}
          warehouses={warehouses}
          items={items}
        />

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!formData.type || !formData.items?.length}
          >
            Create Transaction
          </button>
        </div>
      </form>
    </div>
  );
}