import React, { useState } from 'react';
import {
  FileText,
  Package,
  Warehouse as WarehouseIcon,
  BarChart3,
  AlertCircle,
} from 'lucide-react';

import { CustomerReport } from '../features/reports/components/CustomerReport';
import { ItemReport } from '../features/reports/components/ItemReport';
import { ProductReport } from '../features/reports/components/ProductReport';
import { WarehouseReport } from '../features/reports/components/WarehouseReport';
import { NegativeInventoryReport } from '../features/reports/components/NegativeInventoryReport';

/**
 * Top-level Reports page with 5 "tabs":
 * - Customer
 * - Item
 * - Product
 * - Warehouse
 * - Negative
 *
 * Each report handles its own filtering and data loading.
 */
export function Reports() {
  const [activeReport, setActiveReport] = useState<
    'customer' | 'item' | 'product' | 'warehouse' | 'negative'
  >('customer');

  // If user clicks an item in Negative Inventory, we store it here
  const [selectedItemFromNegative, setSelectedItemFromNegative] = useState('');

  const handleNegativeItemClick = (itemName: string) => {
    setSelectedItemFromNegative(itemName);
    setActiveReport('item');
  };

  const reports = [
    {
      id: 'customer',
      name: 'Customer Report',
      icon: BarChart3,
      description: 'Customer transactions',
      color: 'bg-orange-500',
    },
    {
      id: 'item',
      name: 'Item Report',
      icon: Package,
      description: 'Item details',
      color: 'bg-blue-500',
    },
    {
      id: 'product',
      name: 'Product Report',
      icon: FileText,
      description: 'Product breakdown',
      color: 'bg-green-500',
    },
    {
      id: 'warehouse',
      name: 'Warehouse Report',
      icon: WarehouseIcon,
      description: 'Warehouse stock',
      color: 'bg-purple-500',
    },
    {
      id: 'negative',
      name: 'Negative Inventory',
      icon: AlertCircle,
      description: 'Investigate negatives',
      color: 'bg-red-500',
    },
  ];

  const renderActiveReport = () => {
    switch (activeReport) {
      case 'customer':
        return <CustomerReport />;
      case 'item':
        return <ItemReport initialItemName={selectedItemFromNegative} />;
      case 'product':
        return <ProductReport />;
      case 'warehouse':
        return <WarehouseReport />;
      case 'negative':
        return <NegativeInventoryReport onItemClick={handleNegativeItemClick} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Reports</h1>

      {/* Tab Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          const isActive = activeReport === report.id;
          return (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id as any)}
              className={`p-4 rounded-lg shadow text-left ${
                isActive
                  ? `${report.color} text-white`
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? 'text-white' : 'text-gray-500'
                }`}
              />
              <h2 className="text-lg font-semibold mt-2">{report.name}</h2>
              <p className={isActive ? 'text-white/80' : 'text-gray-600'}>
                {report.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">{renderActiveReport()}</div>
    </div>
  );
}
