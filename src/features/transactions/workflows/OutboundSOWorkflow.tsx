import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { TransactionFormData, InventoryStatus, TransactionStatus } from '../types';
import { TransactionFormFields } from '../components/TransactionFormFields';

interface OutboundSOWorkflowProps {
  onComplete: () => void;
  onBack: () => void;
}

export function OutboundSOWorkflow({ onComplete, onBack }: OutboundSOWorkflowProps) {
  const { createTransaction } = useTransactions();
  const { warehouses, items, loading } = useTransactionForm();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<TransactionFormData>>({
    type: 'Outbound',
    referenceType: 'Sales Order',
    date: new Date().toISOString().split('T')[0],
    status: 'Shipped' as TransactionStatus,
    inventoryStatus: 'Stock' as InventoryStatus,
    items: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouse || !formData.items?.length) {
      return;
    }

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
        <h3 className="text-xl font-semibold">Outbound Sales Order</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TransactionStatus })}
              className="w-full border rounded-lg px-3 py-2"
              required
            >
              <option value="Shipped">Shipped</option>
              <option value="Pending">Pending</option>
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
              required
            >
              <option value="Stock">Stock</option>
              <option value="Hold">Hold</option>              
              <option value="Consignment">Consignment</option>
            </select>
          </div>
        </div>

        <TransactionFormFields
          formData={formData}
          setFormData={setFormData}
          warehouses={warehouses}
          items={items}
        />

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border rounded hover:bg-gray-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || !formData.warehouse || !formData.items?.length}
          >
            {submitting ? 'Creating...' : 'Create Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}