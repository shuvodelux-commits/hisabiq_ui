import React from 'react';
import { TenantSettingsPage } from './settings/TenantSettingsPage';
import {SaasProvider} from './saas/SaasProvider';
import {SaasShell,Guard} from './saas/SaasShell';
import {PlansPage} from './saas/billing/PlansPage';
import {SubscriptionsPage} from './saas/billing/SubscriptionsPage';
import {InvoicesPage,InvoicePage} from './saas/billing/InvoicesPage';
import {PaymentsPage,PaymentReview} from './saas/billing/PaymentsPage';
import {SmsPage} from './saas/messaging/SmsPage';
import {ServicesPage,ServiceOrderPage} from './saas/services/ServicesPage';
import {TicketsPage,TicketPage} from './saas/support/TicketsPage';
import {KnowledgePage} from './saas/support/KnowledgePage';
import {TenantSubscription,TenantSupport} from './saas/TenantPortal';
import {AnnouncementsPage} from './saas/admin/AnnouncementsPage';
import {ReportsPage as SaasReports} from './saas/admin/ReportsPage';
import {AuditPage} from './saas/admin/AuditPage';
import {SettingsPage} from './saas/admin/SettingsPage';
import {OverviewPage} from './saas/OverviewPage';
import {TeamPage} from './saas/admin/TeamPage';
import {TenantsPage,TenantPage} from './saas/tenants/TenantsPage';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { Toaster } from 'sonner';
import { BrandGuide } from './pages/BrandGuide';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Pos } from './pages/Pos';
import { Sales } from './pages/Sales';
import {Quotations} from './pages/Quotations';
import { Warranty } from './pages/Warranty';
import { Reconciliation } from './pages/Reconciliation';
import { Finance } from './pages/Finance';
import { Products } from './pages/Products';
import { Parties } from './pages/Parties';
import { Purchases } from './pages/Purchases';
import { PurchaseEditor } from './pages/PurchaseEditor';
import { Expenses } from './pages/Expenses';
import { Reports } from './pages/Reports';
import { Daybook } from './pages/Daybook';
import { Accounts } from './pages/Accounts';
import { AuditLedger } from './pages/AuditLedger';

export function App() {
  const { resolvedTheme } = useTheme();
  return (
    <SaasProvider><HashRouter>
      <Toaster theme={resolvedTheme} position="bottom-right" toastOptions={{ style: { fontFamily: 'Geist' } }} />
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/design-system" element={<BrandGuide />} />
        <Route path="/saas" element={<SaasShell />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="plans" element={<Guard permission="plans.view"><PlansPage /></Guard>} />
          <Route path="subscriptions" element={<Guard permission="subscriptions.view"><SubscriptionsPage /></Guard>} />
          <Route path="invoices" element={<Guard permission="billing.view"><InvoicesPage /></Guard>} />
          <Route path="invoices/:id" element={<Guard permission="billing.view"><InvoicePage /></Guard>} />
          <Route path="payments" element={<Guard permission="payments.view"><PaymentsPage /></Guard>} />
          <Route path="payments/:id" element={<Guard permission="payments.view"><PaymentReview /></Guard>} />
          <Route path="sms" element={<Guard permission="sms.view"><SmsPage /></Guard>} />
          <Route path="services" element={<Guard permission="services.view"><ServicesPage /></Guard>} />
          <Route path="services/:id" element={<Guard permission="services.view"><ServiceOrderPage /></Guard>} />
          <Route path="support" element={<Guard permission="support.view"><TicketsPage /></Guard>} />
          <Route path="support/:id" element={<Guard permission="support.view"><TicketPage /></Guard>} />
          <Route path="knowledge" element={<Guard permission="knowledge.view"><KnowledgePage /></Guard>} />
          <Route path="announcements" element={<Guard permission="announcements.view"><AnnouncementsPage /></Guard>} />
          <Route path="reports" element={<Guard permission="reports.view"><SaasReports /></Guard>} />
          <Route path="audit" element={<Guard permission="audit.view"><AuditPage /></Guard>} />
          <Route path="settings" element={<Guard permission="settings.view"><SettingsPage /></Guard>} />
          <Route path="team" element={<Guard permission="team.view"><TeamPage /></Guard>} />
          <Route path="tenants" element={<Guard permission="tenants.view"><TenantsPage /></Guard>} />
          <Route path="tenants/:id" element={<Guard permission="tenants.view"><TenantPage /></Guard>} />
        </Route>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="subscription" element={<TenantSubscription />} /><Route path="support" element={<TenantSupport />} /><Route path="support/:id" element={<TenantSupport detail />} />
          <Route path="settings" element={<Navigate to="business" replace />} />
          <Route path="settings/:section" element={<TenantSettingsPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<Pos />} />
          <Route path="sales" element={<Sales />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="warranty" element={<Warranty />} />
          <Route path="reconciliation" element={<Reconciliation />} />
          <Route path="finance" element={<Finance />} />
          <Route path="daybook" element={<Daybook />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="audit-ledger" element={<AuditLedger />} />
          <Route path="products" element={<Products />} />
          <Route path="parties" element={<Parties />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/new" element={<PurchaseEditor />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter></SaasProvider>
  );
}

