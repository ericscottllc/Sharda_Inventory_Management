import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { tables, tableStructure } from '../features/master-data/config/tableConfig';
import { TableActions } from '../features/master-data/components/TableActions';
import { RecordModal } from '../features/master-data/components/RecordModal';
import { useMasterData } from '../features/master-data/hooks/useMasterData';
import { Record } from '../features/master-data/types';

export function MasterData() {
  const [activeTable, setActiveTable] = useState('product');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentRecord, setCurrentRecord] = useState<Record>({});

  const {
    data,
    loading,
    foreignKeyData,
    addRecord,
    updateRecord,
    deleteRecord
  } = useMasterData(activeTable);

  const handleSave = async () => {
    const success = modalMode === 'add' 
      ? await addRecord(currentRecord)
      : await updateRecord(currentRecord);
    
    if (success) {
      setShowModal(false);
      setCurrentRecord({});
    }
  };

  const handleEdit = (record: Record) => {
    setCurrentRecord(record);
    setModalMode('edit');
    setShowModal(true);
  };

  const filteredData = data.filter(row => {
    const searchableValues = Object.values(row)
      .map(val => val?.toString().toLowerCase() || '');
    return searchableValues.some(val => val.includes(searchTerm.toLowerCase()));
  });

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      return Object.values(value)[0] || '-';
    }
    return value.toString();
  };

  return (
    <div>
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-8">Master Data Management</h1>
      
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {tables.map(table => (
          <button
            key={table}
            onClick={() => setActiveTable(table)}
            className={`px-4 py-2 rounded whitespace-nowrap ${
              activeTable === table
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {table.replace(/_/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">
                {activeTable.replace(/_/g, ' ').toUpperCase()} Table
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setModalMode('add');
                setCurrentRecord({});
                setShowModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Record
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {tableStructure[activeTable]?.columns.map(column => (
                      <th
                        key={column}
                        className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.replace(/_/g, ' ')}
                      </th>
                    ))}
                    <th className="px-6 py-3 bg-gray-50">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((row, i) => (
                    <tr key={i}>
                      {tableStructure[activeTable]?.columns.map(column => (
                        <td key={column} className="px-6 py-4 whitespace-nowrap">
                          {renderCellValue(row[column])}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TableActions
                          onEdit={() => handleEdit(row)}
                          onDelete={() => deleteRecord(row)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <RecordModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setCurrentRecord({});
        }}
        onSave={handleSave}
        record={currentRecord}
        setRecord={setCurrentRecord}
        mode={modalMode}
        table={activeTable}
        tableStructure={tableStructure}
        foreignKeyData={foreignKeyData}
      />
    </div>
  );
}