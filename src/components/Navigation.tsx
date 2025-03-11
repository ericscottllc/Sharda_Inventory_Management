import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Database, Truck as TruckDelivery, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/hooks/useAuth';

export function Navigation() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="text-xl font-bold text-gray-800">
            Inventory System
          </NavLink>
          <div className="flex items-center space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </NavLink>
            
            <NavLink
              to="/inventory"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <Package className="w-4 h-4 mr-2" />
              Inventory
            </NavLink>

            <NavLink
              to="/master-data"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <Database className="w-4 h-4 mr-2" />
              Master Data
            </NavLink>

            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <TruckDelivery className="w-4 h-4 mr-2" />
              Transactions
            </NavLink>

            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`
              }
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </NavLink>

            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 rounded text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}