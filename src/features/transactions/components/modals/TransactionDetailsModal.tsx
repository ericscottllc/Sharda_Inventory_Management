import React from 'react';
import { X } from 'lucide-react';
import { TransactionHeader, TransactionStatus } from '../../types';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionHeader | null;
  onUpdateStatus: (status: TransactionStatus) => Promise<void>;
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
  onUpdateStatus
}: TransactionDetailsModalProps) {

  if (!isOpen || !transaction) return null;

  const totalVolume = transaction.details?.reduce((sum, d) => sum + d.quantity, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Transaction Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-1">Transaction Info</h3>
              <p className="text-sm">Reference: {transaction.reference_number}</p>
              <p className="text-sm">Type: {transaction.transaction_type}</p>
              <p className="text-sm">Date: {new Date(transaction.transaction_date).toLocaleDateString()}</p>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                <select
                  value={transaction.details?.[0]?.status || 'Pending'}
                  onChange={(e) => onUpdateStatus(e.target.value as TransactionStatus)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Received">Received</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Additional</h3>
              <p className="text-sm">Carrier: {transaction.shipment_carrier || '-'}</p>
              <p className="text-sm">Shipping Doc: {transaction.shipping_document || '-'}</p>
              <p className="text-sm">Customer PO: {transaction.customer_po || '-'}</p>
              <p className="text-sm">Customer Name: {transaction.customer_name || '-'}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="py-2 px-3 text-left">Item</th>
                    <th className="py-2 px-3 text-left">Qty</th>
                    <th className="py-2 px-3 text-left">Inv Status</th>
                    <th className="py-2 px-3 text-left">Lot</th>
                    <th className="py-2 px-3 text-left">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.details?.map((d, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 px-3">{d.item_name}</td>
                      <td className="py-2 px-3">{d.quantity}</td>
                      <td className="py-2 px-3">{d.inventory_status}</td>
                      <td className="py-2 px-3">{d.lot_number || '-'}</td>
                      <td className="py-2 px-3">{d.comments || '-'}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 px-3 font-semibold">Total Volume</td>
                    <td className="py-2 px-3 font-semibold">{totalVolume}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {transaction.comments && (
            <div>
              <h3 className="font-semibold mb-1">Overall Comments</h3>
              <p className="text-sm text-gray-700">{transaction.comments}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
