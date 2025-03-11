import React from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Variance, PendingTransaction } from '../types';

interface VarianceReviewProps {
  variances: Variance[];
  pendingTransactions: PendingTransaction[];
  onComplete: () => void;
  onBack: () => void;
}

export function VarianceReview({
  variances,
  pendingTransactions,
  onComplete,
  onBack
}: VarianceReviewProps) {
  // Only show variances that aren't zero
  const significantVariances = variances.filter(v => v.variance !== 0);

  // Group pending transactions by item
  const pendingByItem = pendingTransactions.reduce((acc, tx) => {
    tx.details.forEach(detail => {
      if (!acc[detail.item_name]) {
        acc[detail.item_name] = [];
      }
      acc[detail.item_name].push({
        ...tx,
        quantity: detail.quantity
      });
    });
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-semibold">Review Variances</h2>
          <p className="text-gray-600 mt-1">
            Review and verify inventory count variances
          </p>
        </div>
      </div>

      {significantVariances.length === 0 ? (
        <div className="text-center py-8 bg-green-50 rounded-lg">
          <p className="text-green-800 font-medium">
            No variances found! Physical count matches system records.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {significantVariances.map((variance) => (
            <div
              key={variance.itemName}
              className="border rounded-lg overflow-hidden"
            >
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-medium">{variance.itemName}</h3>
                <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Physical Count:</span>
                    <span className="ml-2 font-medium">
                      {variance.physicalCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">System Count:</span>
                    <span className="ml-2 font-medium">
                      {variance.calculatedCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Variance:</span>
                    <span
                      className={`ml-2 font-medium ${
                        variance.variance > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {variance.variance > 0 ? '+' : ''}
                      {variance.variance}
                    </span>
                  </div>
                </div>
              </div>

              {pendingByItem[variance.itemName]?.length > 0 && (
                <div className="p-4 bg-yellow-50">
                  <div className="flex items-center text-yellow-800 mb-2">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">Pending Transactions</span>
                  </div>
                  <div className="space-y-2">
                    {pendingByItem[variance.itemName].map((tx: any) => (
                      <div
                        key={tx.transaction_id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {tx.transaction_type} - {tx.reference_number}
                        </span>
                        <span className="font-medium">{tx.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Generate Adjustment
        </button>
      </div>
    </div>
  );
}