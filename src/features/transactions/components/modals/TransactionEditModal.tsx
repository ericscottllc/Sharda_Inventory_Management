// /home/project/src/features/transactions/components/modals/TransactionEditModal.tsx

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TransactionHeader, TransactionDetail, InventoryStatus, TransactionStatus } from '../../types';

interface TransactionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionHeader | null;
  detailIndex: number | null; // which detail in transaction.details is being edited
  onSaveHeader: (transactionId: string, fields: Partial<TransactionHeader>) => Promise<boolean>;
  onSaveDetail: (transactionId: string, detail: TransactionDetail) => Promise<boolean>;
}

// Helper to convert a stored date into YYYY-MM-DD for the input.
// Returns an empty string if invalid.
const formatDateForInput = (dateVal: string | Date): string => {
  const dateObj = new Date(dateVal);
  return isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().split('T')[0];
};

// Convert a YYYY-MM-DD string to DB format ("YYYY-MM-DD 00:00:00+00")
const convertDateToDBFormat = (dateStr: string): string => {
  return `${dateStr} 00:00:00+00`;
};

export function TransactionEditModal({
  isOpen,
  onClose,
  transaction,
  detailIndex,
  onSaveHeader,
  onSaveDetail
}: TransactionEditModalProps) {
  const [headerFields, setHeaderFields] = useState<Partial<TransactionHeader>>({});
  const [editedDetail, setEditedDetail] = useState<TransactionDetail | null>(null);
  const [dateInput, setDateInput] = useState<string>(''); // raw date string from user input
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      // Initialize header fields and the date input.
      setHeaderFields({
        transaction_date: transaction.transaction_date,
        warehouse: transaction.warehouse || '',
        shipment_carrier: transaction.shipment_carrier || '',
        shipping_document: transaction.shipping_document || '',
        customer_po: transaction.customer_po || '',
        customer_name: transaction.customer_name || '',
        comments: transaction.comments || ''
      });
      setDateInput(formatDateForInput(transaction.transaction_date));

      // Initialize the detail being edited (if any)
      if (detailIndex != null && detailIndex >= 0 && transaction.details?.[detailIndex]) {
        setEditedDetail({ ...transaction.details[detailIndex] });
      } else {
        setEditedDetail(null);
      }
    } else {
      setHeaderFields({});
      setEditedDetail(null);
      setDateInput('');
    }
  }, [transaction, detailIndex]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    // Validate the dateInput only on submit.
    const newDate = new Date(dateInput);
    if (isNaN(newDate.getTime())) {
      alert('Please enter a valid date.');
      return;
    }

    try {
      setSubmitting(true);
      // Convert the raw date input to DB format and update headerFields.
      const updatedHeaderFields = {
        ...headerFields,
        transaction_date: convertDateToDBFormat(dateInput)
      };

      // Save header fields (including the updated date)
      const headerSuccess = await onSaveHeader(transaction.transaction_id, updatedHeaderFields);
      if (!headerSuccess) throw new Error('Header update failed');

      // Then update the detail if one is being edited
      if (editedDetail) {
        const detailSuccess = await onSaveDetail(transaction.transaction_id, editedDetail);
        if (!detailSuccess) throw new Error('Detail update failed');
      }
      onClose();
    } catch (err) {
      console.error('Error saving transaction edits:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Allowed statuses based on transaction type for the detail
  let allowedStatuses: TransactionStatus[] = ['Pending', 'Shipped', 'Received', 'Completed'];
  if (transaction.transaction_type === 'Inbound') {
    allowedStatuses = ['Pending', 'Received'];
  } else if (transaction.transaction_type === 'Outbound') {
    allowedStatuses = ['Pending', 'Shipped'];
  } else if (transaction.transaction_type === 'Adjustment') {
    allowedStatuses = ['Pending', 'Completed'];
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-2xl font-semibold">Edit Transaction</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Transaction Header Section */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Transaction Header</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse</label>
                <input
                  type="text"
                  value={headerFields.warehouse ?? ''}
                  onChange={(e) =>
                    setHeaderFields({ ...headerFields, warehouse: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipment Carrier</label>
                <input
                  type="text"
                  value={headerFields.shipment_carrier ?? ''}
                  onChange={(e) =>
                    setHeaderFields({ ...headerFields, shipment_carrier: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Document</label>
                <input
                  type="text"
                  value={headerFields.shipping_document ?? ''}
                  onChange={(e) =>
                    setHeaderFields({ ...headerFields, shipping_document: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer PO</label>
                <input
                  type="text"
                  value={headerFields.customer_po ?? ''}
                  onChange={(e) =>
                    setHeaderFields({ ...headerFields, customer_po: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={headerFields.customer_name ?? ''}
                  onChange={(e) =>
                    setHeaderFields({ ...headerFields, customer_name: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Header Comments</label>
                <textarea
                  value={headerFields.comments ?? ''}
                  onChange={(e) =>
                    setHeaderFields({ ...headerFields, comments: e.target.value })
                  }
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Transaction Detail Section */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 whitespace-nowrap text-left">Item</th>
                    <th className="px-3 py-2 whitespace-nowrap text-left">Quantity</th>
                    <th className="px-3 py-2 whitespace-nowrap text-left">Inventory Status</th>
                    <th className="px-3 py-2 whitespace-nowrap text-left">Status</th>
                    <th className="px-3 py-2 whitespace-nowrap text-left">Lot Number</th>
                    <th className="px-3 py-2 whitespace-nowrap text-left">Detail Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transaction.details && transaction.details.length > 0 ? (
                    transaction.details.map((detail, idx) => {
                      const isEditing = detailIndex === idx;
                      return (
                        <tr key={detail.detail_id} className={isEditing ? 'bg-yellow-50' : ''}>
                          <td className="px-3 py-2 whitespace-nowrap">{detail.item_name}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editedDetail?.quantity ?? ''}
                                onChange={(e) =>
                                  setEditedDetail({
                                    ...editedDetail!,
                                    quantity: parseFloat(e.target.value)
                                  })
                                }
                                className="w-20 border rounded-lg px-2 py-1"
                              />
                            ) : (
                              detail.quantity
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <select
                                value={editedDetail?.inventory_status}
                                onChange={(e) =>
                                  setEditedDetail({
                                    ...editedDetail!,
                                    inventory_status: e.target.value as InventoryStatus
                                  })
                                }
                                className="border rounded-lg px-2 py-1"
                              >
                                <option value="Stock">Stock</option>
                                <option value="Consignment">Consignment</option>
                                <option value="Hold">Hold</option>
                              </select>
                            ) : (
                              detail.inventory_status
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <select
                                value={editedDetail?.status}
                                onChange={(e) =>
                                  setEditedDetail({
                                    ...editedDetail!,
                                    status: e.target.value as TransactionStatus
                                  })
                                }
                                className="border rounded-lg px-2 py-1"
                              >
                                {allowedStatuses.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              detail.status
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedDetail?.lot_number || ''}
                                onChange={(e) =>
                                  setEditedDetail({
                                    ...editedDetail!,
                                    lot_number: e.target.value
                                  })
                                }
                                className="w-24 border rounded-lg px-2 py-1"
                              />
                            ) : (
                              detail.lot_number
                            )}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {isEditing ? (
                              <textarea
                                value={editedDetail?.comments || ''}
                                onChange={(e) =>
                                  setEditedDetail({
                                    ...editedDetail!,
                                    comments: e.target.value
                                  })
                                }
                                rows={1}
                                className="w-full border rounded-lg px-2 py-1"
                              />
                            ) : (
                              detail.comments
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-2 text-center text-gray-400">
                        No details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
