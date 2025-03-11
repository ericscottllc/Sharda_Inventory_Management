import React, { useEffect } from 'react';
import { Record, TableStructure, ForeignKeyData } from '../types';

type RecordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  record: Record;
  setRecord: (record: Record) => void;
  mode: 'add' | 'edit';
  table: string;
  tableStructure: TableStructure;
  foreignKeyData: ForeignKeyData;
};

export function RecordModal({
  isOpen,
  onClose,
  onSave,
  record,
  setRecord,
  mode,
  table,
  tableStructure,
  foreignKeyData
}: RecordModalProps) {
  if (!isOpen) return null;

  // Function to generate item name when product and pack size are selected
  const generateItemName = (productName: string, packSize: string) => {
    if (productName && packSize) {
      return `${productName} ${packSize}`;
    }
    return '';
  };

  // Handle changes for item table specifically
  const handleItemChange = (field: string, value: string) => {
    if (table === 'item') {
      if (field === 'product_name' || field === 'pack_size') {
        const newRecord = { ...record, [field]: value };
        // Auto-generate item name when both product and pack size are selected
        if (field === 'product_name' && record.pack_size) {
          newRecord.item_name = generateItemName(value, record.pack_size);
        } else if (field === 'pack_size' && record.product_name) {
          newRecord.item_name = generateItemName(record.product_name, value);
        }
        setRecord(newRecord);
      } else {
        setRecord({ ...record, [field]: value });
      }
    } else {
      setRecord({ ...record, [field]: value });
    }
  };

  // Sort pack sizes by id in descending order
  const getSortedPackSizes = () => {
    if (foreignKeyData.pack_size) {
      return [...foreignKeyData.pack_size].sort((a, b) => b.id - a.id);
    }
    return [];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {mode === 'add' ? 'Add New' : 'Edit'} {table.replace(/_/g, ' ').toUpperCase()} Record
        </h3>
        <div className="space-y-4">
          {tableStructure[table]?.columns.map(column => {
            const foreignKey = tableStructure[table].foreignKeys[column];
            
            if (foreignKey) {
              // Special handling for pack_size in item table
              if (table === 'item' && column === 'pack_size') {
                const sortedPackSizes = getSortedPackSizes();
                return (
                  <div key={column}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.replace(/_/g, ' ')}
                    </label>
                    <select
                      className="w-full border rounded-lg px-3 py-2"
                      value={record[column] || ''}
                      onChange={(e) => handleItemChange(column, e.target.value)}
                    >
                      <option value="">Select {column}</option>
                      {sortedPackSizes.map((item: any) => (
                        <option key={item[foreignKey.column]} value={item[foreignKey.column]}>
                          {item[foreignKey.column]}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              return (
                <div key={column}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column.replace(/_/g, ' ')}
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={record[column] || ''}
                    onChange={(e) => handleItemChange(column, e.target.value)}
                  >
                    <option value="">Select {column}</option>
                    {foreignKeyData[column]?.map((item: any) => (
                      <option key={item[foreignKey.column]} value={item[foreignKey.column]}>
                        {item[foreignKey.column]}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            // For item table, make item_name read-only when it's auto-generated
            if (table === 'item' && column === 'item_name') {
              return (
                <div key={column}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column.replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                    value={record[column] || ''}
                    readOnly
                    placeholder="Auto-generated from Product and Pack Size"
                  />
                </div>
              );
            }

            return (
              <div key={column}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {column.replace(/_/g, ' ')}
                </label>
                <input
                  type={column.includes('id') ? 'number' : 'text'}
                  className="w-full border rounded-lg px-3 py-2"
                  value={record[column] || ''}
                  onChange={(e) => handleItemChange(column, e.target.value)}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {mode === 'add' ? 'Add' : 'Save'} Record
          </button>
        </div>
      </div>
    </div>
  );
}