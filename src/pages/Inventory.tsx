import React, { useState } from 'react';
import { useInventoryCount } from '../features/inventory/hooks/useInventoryCount';
import { WarehouseSelect } from '../features/inventory/components/WarehouseSelect';
import { DateSelect } from '../features/inventory/components/DateSelect';
import { CountEntry } from '../features/inventory/components/CountEntry';
import { VarianceReview } from '../features/inventory/components/VarianceReview';
import { AdjustmentReview } from '../features/inventory/components/AdjustmentReview';

type Step = 'warehouse' | 'date' | 'count' | 'variance' | 'adjustment';

export function Inventory() {
  const [step, setStep] = useState<Step>('warehouse');
  const {
    selectedWarehouse,
    selectedDate,
    countData,
    calculatedInventory,
    variances,
    pendingTransactions,
    setSelectedWarehouse,
    setSelectedDate,
    setCountData,
    calculateVariances,
    generateAdjustment,
    loading,
    error
  } = useInventoryCount();

  const renderStep = () => {
    switch (step) {
      case 'warehouse':
        return (
          <WarehouseSelect
            selectedWarehouse={selectedWarehouse}
            onSelect={(warehouse) => {
              setSelectedWarehouse(warehouse);
              setStep('date');
            }}
          />
        );

      case 'date':
        return (
          <DateSelect
            selectedDate={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setStep('count');
            }}
            onBack={() => setStep('warehouse')}
          />
        );

      case 'count':
        return (
          <CountEntry
            warehouse={selectedWarehouse}
            date={selectedDate}
            countData={countData}
            onCountUpdate={setCountData}
            onComplete={() => {
              calculateVariances();
              setStep('variance');
            }}
            onBack={() => setStep('date')}
          />
        );

      case 'variance':
        return (
          <VarianceReview
            variances={variances}
            pendingTransactions={pendingTransactions}
            onComplete={() => setStep('adjustment')}
            onBack={() => setStep('count')}
          />
        );

      case 'adjustment':
        return (
          <AdjustmentReview
            variances={variances}
            onGenerateAdjustment={generateAdjustment}
            onBack={() => setStep('variance')}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Warehouse Inventory Count</h1>
        <p className="text-gray-600 mt-2">
          Complete a physical inventory count and reconcile with system records
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['warehouse', 'date', 'count', 'variance', 'adjustment'].map((s) => (
            <div
              key={s}
              className={`flex items-center ${
                step === s ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === s
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                {step === s ? (
                  <span className="text-blue-600">•</span>
                ) : (
                  <span className="text-gray-400">○</span>
                )}
              </div>
              <span className="ml-2 text-sm font-medium">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {s !== 'adjustment' && (
                <div className="w-full border-t border-gray-300 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderStep()}
      </div>
    </div>
  );
}