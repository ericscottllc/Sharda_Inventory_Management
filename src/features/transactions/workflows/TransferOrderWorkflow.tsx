import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { TransactionFormData, InventoryStatus, TransactionStatus } from '../types';
import { addBusinessDays } from '../utils/dateUtils';
import { ComboBox } from '../../../components/ComboBox';

interface TransferOrderWorkflowProps {
  onComplete: () => void;
  onBack: () => void;
}

export function TransferOrderWorkflow({ onComplete, onBack }: TransferOrderWorkflowProps) {
  const { createTransaction } = useTransactions();
  const { warehouses, items, loading } = useTransactionForm();
  const [submitting, setSubmitting] = useState(false);

  // Calculate default dates
  const today = new Date();
  const inboundDate = addBusinessDays(today, 2);

  const [formData, setFormData] = useState<Partial<TransactionFormData>>({
    type: 'Outbound',
    referenceType: 'Transfer Order',
    date: today.toISOString().split('T')[0],
    status: 'Shipped' as TransactionStatus,
    inventoryStatus: 'Stock' as InventoryStatus,
    transferToInventoryStatus: 'Stock' as InventoryStatus,
    transferDate: inboundDate.toISOString().split('T')[0],
    items: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sourceWarehouse || !formData.destinationWarehouse || !formData.items?.length) {
      return;
    }

    try {
      setSubmitting(true);
      // Create outbound transaction
      const outboundResult = await createTransaction({
        ...formData,
        type: 'Outbound',
        status: 'Shipped',
        warehouse: formData.sourceWarehouse,
        inventoryStatus: formData.inventoryStatus
      } as TransactionFormData);

      if (outboundResult) {
        // Create corresponding inbound transaction
        await createTransaction({
          ...formData,
          type: 'Inbound',
          status: 'Pending',
          warehouse: formData.destinationWarehouse,
          inventoryStatus: formData.transferToInventoryStatus,
          date: formData.transferDate,
          relatedTransactionId: outboundResult.transaction_id
        } as TransactionFormData);
        onComplete();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const warehouseOptions = warehouses.map(w => w["Common Name"]);

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-semibold">Transfer Order</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-lg font-medium mb-4">From (Outbound)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Warehouse *
              </label>
              <ComboBox
                options={warehouseOptions}
                value={formData.sourceWarehouse || ''}
                onChange={(value) => setFormData({ ...formData, sourceWarehouse: value })}
                placeholder="Search warehouses..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outbound Status
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
                Outbound Inventory Status
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outbound Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-lg font-medium mb-4">To (Inbound)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Warehouse *
              </label>
              <ComboBox
                options={warehouseOptions}
                value={formData.destinationWarehouse || ''}
                onChange={(value) => setFormData({ ...formData, destinationWarehouse: value })}
                placeholder="Search warehouses..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inbound Status
              </label>
              <input
                type="text"
                value="Pending"
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inbound Inventory Status
              </label>
              <select
                value={formData.transferToInventoryStatus}
                onChange={(e) => setFormData({ ...formData, transferToInventoryStatus: e.target.value as InventoryStatus })}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="Stock">Stock</option>
                <option value="Hold">Hold</option>                
                <option value="Consignment">Consignment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inbound Date
              </label>
              <input
                type="date"
                value={formData.transferDate}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="bg-white p-4 rounded-lg border mb-6">
          <h4 className="text-lg font-medium mb-4">Additional Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipment Carrier
              </label>
              <input
                type="text"
                value={formData.shipmentCarrier || ''}
                onChange={(e) => setFormData({ ...formData, shipmentCarrier: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter carrier name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Document
              </label>
              <input
                type="text"
                value={formData.shippingDocument || ''}
                onChange={(e) => setFormData({ ...formData, shippingDocument: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter document number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer PO
              </label>
              <input
                type="text"
                value={formData.customerPO || ''}
                onChange={(e) => setFormData({ ...formData, customerPO: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter PO number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={formData.customerName || ''}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter customer name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                value={formData.comments || ''}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                placeholder="Enter any additional comments"
              />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium">Items *</h4>
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                items: [...(formData.items || []), {
                  item_name: '',
                  quantity: '',
                  lot_number: '',
                  comments: ''
                }]
              })}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items?.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item *
                    </label>
                    <ComboBox
                      options={items.map(i => i.item_name)}
                      value={item.item_name || ''}
                      onChange={(value) => {
                        const updatedItems = [...(formData.items || [])];
                        updatedItems[index] = { ...item, item_name: value };
                        setFormData({ ...formData, items: updatedItems });
                      }}
                      placeholder="Search items..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => {
                        const updatedItems = [...(formData.items || [])];
                        updatedItems[index] = { ...item, quantity: e.target.value ? parseFloat(e.target.value) : '' };
                        setFormData({ ...formData, items: updatedItems });
                      }}
                      className="w-full border rounded-lg px-3 py-2"
                      min="0"
                      step="0.01"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lot Number
                    </label>
                    <input
                      type="text"
                      value={item.lot_number || ''}
                      onChange={(e) => {
                        const updatedItems = [...(formData.items || [])];
                        updatedItems[index] = { ...item, lot_number: e.target.value };
                        setFormData({ ...formData, items: updatedItems });
                      }}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Enter lot number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Comments
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.comments || ''}
                        onChange={(e) => {
                          const updatedItems = [...(formData.items || [])];
                          updatedItems[index] = { ...item, comments: e.target.value };
                          setFormData({ ...formData, items: updatedItems });
                        }}
                        className="flex-1 border rounded-lg px-3 py-2"
                        placeholder="Enter comments for this item"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedItems = [...(formData.items || [])];
                          updatedItems.splice(index, 1);
                          setFormData({ ...formData, items: updatedItems });
                        }}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {formData.items?.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              No items added. Click "Add Item" to start adding items to this transaction.
            </div>
          )}
        </div>

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
            disabled={submitting || !formData.sourceWarehouse || !formData.destinationWarehouse || !formData.items?.length}
          >
            {submitting ? 'Creating...' : 'Create Transfer Order'}
          </button>
        </div>
      </form>
    </div>
  );
}