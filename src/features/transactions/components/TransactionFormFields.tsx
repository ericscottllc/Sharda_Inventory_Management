import React from 'react';
import { TransactionFormData } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { ComboBox } from '../../../components/ComboBox'; // or update path if different

interface TransactionFormFieldsProps {
  formData: Partial<TransactionFormData>;
  setFormData: (data: Partial<TransactionFormData>) => void;
  showSourceWarehouse?: boolean;
  showDestinationWarehouse?: boolean;
  warehouses: { "Common Name": string }[];
  items: { item_name: string }[];
  hideCustomerFields?: boolean;
}

export function TransactionFormFields({
  formData,
  setFormData,
  showSourceWarehouse = false,
  showDestinationWarehouse = false,
  warehouses,
  items,
  hideCustomerFields = false
}: TransactionFormFieldsProps) {
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...(formData.items || []), {
        item_name: '',
        quantity: '',
        lot_number: '',
        comments: ''
      }]
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems.splice(index, 1);
    setFormData({ ...formData, items: updatedItems });
  };

  const warehouseOptions = warehouses.map(w => w["Common Name"]);
  const itemOptions = items.map(i => i.item_name);

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Date *
          </label>
          <input
            type="date"
            value={formData.date || ''}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        {showSourceWarehouse && (
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
        )}

        {showDestinationWarehouse && (
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
        )}

        {!showSourceWarehouse && !showDestinationWarehouse && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse *
            </label>
            <ComboBox
              options={warehouseOptions}
              value={formData.warehouse || ''}
              onChange={(value) => setFormData({ ...formData, warehouse: value })}
              placeholder="Search warehouses..."
            />
          </div>
        )}

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
            placeholder="Enter doc number"
          />
        </div>

        {!hideCustomerFields && (
          <>
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
          </>
        )}
      </div>

      {/* Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Comments
        </label>
        <textarea
          value={formData.comments || ''}
          onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          rows={3}
          placeholder="Additional comments"
        />
      </div>

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-medium">Items *</h4>
          <button
            type="button"
            onClick={addItem}
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
                    options={itemOptions}
                    value={item.item_name || ''}
                    onChange={(val) => handleItemChange(index, 'item_name', val)}
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
                    onChange={(e) => handleItemChange(
                      index,
                      'quantity',
                      e.target.value ? parseFloat(e.target.value) : ''
                    )}
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
                    onChange={(e) => handleItemChange(index, 'lot_number', e.target.value)}
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
                      onChange={(e) => handleItemChange(index, 'comments', e.target.value)}
                      className="flex-1 border rounded-lg px-3 py-2"
                      placeholder="Enter comments"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
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
            No items added. Click "Add Item" to begin.
          </div>
        )}
      </div>
    </div>
  );
}
