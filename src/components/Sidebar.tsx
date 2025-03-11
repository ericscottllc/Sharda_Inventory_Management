import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Database, Truck as TruckDelivery } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory System</h1>
      </div>
      <nav className="mt-6">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              isActive ? 'bg-gray-100' : ''
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              isActive ? 'bg-gray-100' : ''
            }`
          }
        >
          <Package className="w-5 h-5 mr-3" />
          Inventory
        </NavLink>
        <NavLink
          to="/master-data"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              isActive ? 'bg-gray-100' : ''
            }`
          }
        >
          <Database className="w-5 h-5 mr-3" />
          Master Data
        </NavLink>
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              isActive ? 'bg-gray-100' : ''
            }`
          }
        >
          <TruckDelivery className="w-5 h-5 mr-3" />
          Transactions
        </NavLink>
      </nav>
    </div>
  );
}