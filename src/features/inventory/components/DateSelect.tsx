import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface DateSelectProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onBack: () => void;
}

export function DateSelect({ selectedDate, onSelect, onBack }: DateSelectProps) {
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);

  const handleNext = () => {
    if (date) {
      onSelect(date);
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
          <h2 className="text-xl font-semibold">Select Count Date</h2>
          <p className="text-gray-600 mt-1">
            Choose the date for which you want to reconcile inventory.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Count Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The system will calculate inventory as of the end
          of the selected date (11:59 PM).
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
          onClick={handleNext}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          disabled={!date}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}