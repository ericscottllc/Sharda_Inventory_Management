import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { MasterData } from './pages/MasterData';
import { TransactionManagement } from './pages/TransactionManagement';
import { Reports } from './pages/Reports';
import { Navigation } from './components/Navigation';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <Dashboard />
                </main>
              </>
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <ProtectedRoute>
              <>
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/master-data" element={<MasterData />} />
                    <Route path="/transactions" element={<TransactionManagement />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;