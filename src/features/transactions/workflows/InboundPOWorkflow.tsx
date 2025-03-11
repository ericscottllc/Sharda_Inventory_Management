import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { TransactionFormData, InventoryStatus, TransactionStatus } from '../types';
import { TransactionFormFields } from '../components/TransactionFormFields';

interface InboundPOWorkflowProps {
  onComplete: () => void;
  onBack: () => void;
}

export function InboundPOWorkflow({ onComplete, onBack }: InboundPOWorkflowProps) {
  const { createTransaction } = useTransactions();
  const { warehouses, items, loading } = useTransactionForm();
  const [submitting, setSubmitting] = useState(false);

  // Inbound can only be "Pending" or "Received."
  const [formData, setFormData] = useState<Partial<TransactionFormData>>({
    type: 'Inbound',
    referenceType: 'Purchase Order',
    date: new Date().toISOString().split('T')[0],
    status: 'Received', // or 'Pending'
    inventoryStatus: 'Stock',
    items: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouse || !(formData.items || []).length) return;

    try {
      setSubmitting(true);
      const result = await createTransaction(formData as TransactionFormData);
      if (result) {
        onComplete();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading warehouses & items...</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-center">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 mr-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold">Inbound Purchase Order</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restrict statuses to 'Pending' or 'Received' */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TransactionStatus })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="Pending">Pending</option>
              <option value="Received">Received</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inventory Status
            </label>
            <select
              value={formData.inventoryStatus}
              onChange={(e) => setFormData({ ...formData, inventoryStatus: e.target.value as InventoryStatus })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="Stock">Stock</option>
              <option value="Consignment">Consignment</option>
              <option value="Hold">Hold</option>
            </select>
          </div>
        </div>

        <TransactionFormFields
          formData={formData}
          setFormData={setFormData}
          warehouses={warehouses}
          items={items}
          hideCustomerFields={true}
        />

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded hover:bg-gray-50"
            disabled={submitting}
          >
            Back
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
