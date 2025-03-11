import React from 'react';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Variance } from '../types';

interface AdjustmentReviewProps {
  variances: Variance[];
  onGenerateAdjustment: () => Promise<string | null>;
  onBack: () => void;
}

export function AdjustmentReview({
  variances,
  onGenerateAdjustment,
  onBack
}: AdjustmentReviewProps) {
  const significantVariances = variances.filter(v => v.variance !== 0);

  const handleGenerateAdjustment = async () => {
    const adjustmentId = await onGenerateAdjustment();
    if (adjustmentId) {
      // Redirect to transaction details or show success message
      window.location.href = '/transactions';
    }
  };

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
          <h2 className="text-xl font-semibold">Generate Adjustment</h2>
          <p className="text-gray-600 mt-1">
            Review and confirm inventory adjustments
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {significantVariances.map((variance) => (
          <div
            key={variance.itemName}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center">
              {variance.variance > 0 ? (
                <Plus className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <Minus className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span className="font-medium">{variance.itemName}</span>
            </div>
            <span
              className={`font-medium ${
                variance.variance > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {variance.variance > 0 ? '+' : ''}
              {variance.variance}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This will create an adjustment transaction to
          reconcile the physical count with system records.
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleGenerateAdjustment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Adjustment
        </button>
      </div>
    </div>
  );
}