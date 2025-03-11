import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Database, Truck as TruckDelivery, BarChart3 } from 'lucide-react';

export function Dashboard() {
  const features = [
    {
      title: 'Inventory Management',
      description: 'Track and manage inventory across all warehouses',
      icon: Package,
      path: '/inventory',
      color: 'bg-blue-500'
    },
    {
      title: 'Master Data',
      description: 'Manage products, warehouses, and other master data',
      icon: Database,
      path: '/master-data',
      color: 'bg-purple-500'
    },
    {
      title: 'Transaction Management',
      description: 'Handle inbound, outbound, and adjustment transactions',
      icon: TruckDelivery,
      path: '/transactions',
      color: 'bg-green-500'
    },
    {
      title: 'Reports',
      description: 'View analytics and generate reports',
      icon: BarChart3,
      path: '/reports',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Inventory Management System
        </h1>
        <p className="text-xl text-gray-600">
          Select a feature to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.path}
              to={feature.path}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-lg p-6 transition-transform duration-200 ease-in-out transform hover:-translate-y-1">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${feature.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold ml-4 text-gray-900">
                    {feature.title}
                  </h2>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
                <div className="mt-4 flex justify-end">
                  <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    Access feature →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}