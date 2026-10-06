import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { BrandGuide } from './pages/BrandGuide';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Pos } from './pages/Pos';
import { Sales } from './pages/Sales';
import { Warranty } from './pages/Warranty';
import { Reconciliation } from './pages/Reconciliation';
import { Finance } from './pages/Finance';
import { Products } from './pages/Products';
import { Parties } from './pages/Parties';
import { Purchases } from './pages/Purchases';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';

export function App() {
  return (
    <HashRouter>
      <Toaster position="bottom-right" toastOptions={{ style: { fontFamily: 'Geist' } }} />
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/design-system" element={<BrandGuide />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<Pos />} />
          <Route path="sales" element={<Sales />} />
          <Route path="warranty" element={<Warranty />} />
          <Route path="reconciliation" element={<Reconciliation />} />
          <Route path="finance" element={<Finance />} />
          <Route path="products" element={<Products />} />
          <Route path="parties" element={<Parties />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
