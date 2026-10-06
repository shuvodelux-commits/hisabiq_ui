import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CashSessionDialog } from './CashSessionDialog';
import { CashSessionProvider } from '../../contexts/CashSessionContext';

export function AppShell() {
  return (
    <CashSessionProvider>
      <div className="flex min-h-screen w-full bg-ink-50/60">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-5 lg:px-6">
            <Outlet />
          </main>
        </div>
      </div>
      <CashSessionDialog />
    </CashSessionProvider>);

}