import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { InboundPOWorkflow } from '../../workflows/InboundPOWorkflow';
import { OutboundSOWorkflow } from '../../workflows/OutboundSOWorkflow';
import { TransferOrderWorkflow } from '../../workflows/TransferOrderWorkflow';
import { OtherTransactionWorkflow } from '../../workflows/OtherTransactionWorkflow';

interface TransactionCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialWorkflow?: 'inbound-po' | 'outbound-so' | 'transfer' | 'other' | null;
}

export function TransactionCreateModal({
  isOpen,
  onClose,
  onComplete,
  initialWorkflow = null
}: TransactionCreateModalProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  useEffect(() => {
    if (initialWorkflow) {
      setSelectedWorkflow(initialWorkflow);
    } else {
      setSelectedWorkflow(null);
    }
  }, [initialWorkflow]);

  if (!isOpen) return null;

  const renderWorkflow = () => {
    switch (selectedWorkflow) {
      case 'inbound-po':
        return <InboundPOWorkflow onComplete={onComplete} onBack={() => setSelectedWorkflow(null)} />;
      case 'outbound-so':
        return <OutboundSOWorkflow onComplete={onComplete} onBack={() => setSelectedWorkflow(null)} />;
      case 'transfer':
        return <TransferOrderWorkflow onComplete={onComplete} onBack={() => setSelectedWorkflow(null)} />;
      case 'other':
        return <OtherTransactionWorkflow onComplete={onComplete} onBack={() => setSelectedWorkflow(null)} />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Select a workflow below:</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setSelectedWorkflow('inbound-po')}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Inbound PO
              </button>
              <button
                onClick={() => setSelectedWorkflow('outbound-so')}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Outbound SO
              </button>
              <button
                onClick={() => setSelectedWorkflow('transfer')}
                className="px-4 py-2 bg-purple-600 text-white rounded"
              >
                Transfer
              </button>
              <button
                onClick={() => setSelectedWorkflow('other')}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Other
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            New Transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{renderWorkflow()}</div>
      </div>
    </div>
  );
}
