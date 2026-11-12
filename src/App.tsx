import './settings/navigationGuard';
import './recovery/adapters';
import { lazy } from 'react';
import { PageBoundary } from './components/layout/PageBoundary';
import { MagicSaasEntry } from './magic-saas/MagicSaasEntry';

import {SaasProvider} from './saas/SaasProvider';

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { Toaster } from 'sonner';

import { AppShell } from './components/layout/AppShell';
import { readIntegrationMode } from './integration/config.ts';
import { SessionProvider } from './integration/SessionProvider.tsx';
import { ConnectedWorkspaceGate } from './integration/ConnectedWorkspaceGate.tsx';

const TenantSettingsPage = lazy(() => import('./settings/TenantSettingsPage').then(module => ({ default: module.TenantSettingsPage })));
const TenantSubscription = lazy(() => import('./saas/TenantPortal').then(module => ({ default: module.TenantSubscription })));
const TenantSupport = lazy(() => import('./saas/TenantPortal').then(module => ({ default: module.TenantSupport })));
const BrandGuide = lazy(() => import('./pages/BrandGuide').then(module => ({ default: module.BrandGuide })));
const LoginPreviewPage = lazy(() => import('./features/auth/LoginPreviewPage').then(module => ({ default: module.LoginPreviewPage })));
const SignupPreviewPage = lazy(() => import('./features/auth/AuthFlowPage').then(module => ({ default: module.SignupPreviewPage })));
const RecoveryPreviewPage = lazy(() => import('./features/auth/AuthFlowPage').then(module => ({ default: module.RecoveryPreviewPage })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Pos = lazy(() => import('./pages/Pos').then(module => ({ default: module.Pos })));
const RecycleBin = lazy(() => import('./pages/RecycleBin').then(module=>({default:module.RecycleBin})));
const Sales = lazy(() => import('./pages/Sales').then(module => ({ default: module.Sales })));
const OnlineSales = lazy(() => import('./pages/OnlineSales').then(module => ({ default: module.OnlineSales })));
const ErpNotifications = lazy(() => import('./pages/ErpNotifications').then(module => ({ default: module.ErpNotifications })));
const Quotations = lazy(() => import('./pages/Quotations').then(module => ({ default: module.Quotations })));
const Warranty = lazy(() => import('./pages/Warranty').then(module => ({ default: module.Warranty })));
const Reconciliation = lazy(() => import('./pages/Reconciliation').then(module => ({ default: module.Reconciliation })));
const Finance = lazy(() => import('./pages/Finance').then(module => ({ default: module.Finance })));
const Products = lazy(() => import('./pages/Products').then(module => ({ default: module.Products })));
const Parties = lazy(() => import('./pages/Parties').then(module => ({ default: module.Parties })));
const Purchases = lazy(() => import('./pages/Purchases').then(module => ({ default: module.Purchases })));
const Vendors = lazy(() => import('./pages/Vendors').then(module => ({ default: module.Vendors })));
const VendorV2 = lazy(() => import('./pages/VendorV2').then(module => ({ default: module.VendorV2 })));
const PurchaseEditor = lazy(() => import('./pages/PurchaseEditor').then(module => ({ default: module.PurchaseEditor })));
const Expenses = lazy(() => import('./pages/Expenses').then(module => ({ default: module.Expenses })));
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Daybook = lazy(() => import('./pages/Daybook').then(module => ({ default: module.Daybook })));
const Accounts = lazy(() => import('./pages/Accounts').then(module => ({ default: module.Accounts })));
const AuditLedger = lazy(() => import('./pages/AuditLedger').then(module => ({ default: module.AuditLedger })));
const GlobalSearch = lazy(() => import('./pages/GlobalSearch').then(module => ({ default: module.GlobalSearch })));

const MagicMyWork = lazy(() => import('./magic-saas/pages/saas/home/MyWork').then(m => ({ default: m.MyWork })));
const MagicBusinesses = lazy(() => import('./magic-saas/pages/saas/customers/Businesses').then(m => ({ default: m.Businesses })));
const MagicTenantWorkspace = lazy(() => import('./magic-saas/pages/saas/TenantWorkspace').then(m => ({ default: m.TenantWorkspace })));
const MagicSubscriptions = lazy(() => import('./magic-saas/pages/saas/revenue/Subscriptions').then(m => ({ default: m.Subscriptions })));
const MagicInvoices = lazy(() => import('./magic-saas/pages/saas/revenue/Invoices').then(m => ({ default: m.Invoices })));
const MagicPayments = lazy(() => import('./magic-saas/pages/saas/Payments').then(m => ({ default: m.Payments })));
const MagicRefunds = lazy(() => import('./magic-saas/pages/saas/revenue/Refunds').then(m => ({ default: m.Refunds })));
const MagicPackagesOffers = lazy(() => import('./magic-saas/pages/saas/PackagesOffers').then(m => ({ default: m.PackagesOffers })));
const MagicTickets = lazy(() => import('./magic-saas/pages/saas/ops/Tickets').then(m => ({ default: m.Tickets })));
const MagicSupportAccessQueue = lazy(() => import('./magic-saas/pages/saas/SupportAccessQueue').then(m => ({ default: m.SupportAccessQueue })));
const MagicServices = lazy(() => import('./magic-saas/pages/saas/ops/Services').then(m => ({ default: m.Services })));
const MagicSmsAdmin = lazy(() => import('./magic-saas/pages/saas/SmsAdmin').then(m => ({ default: m.SmsAdmin })));
const MagicDataRequests = lazy(() => import('./magic-saas/pages/saas/ops/DataRequests').then(m => ({ default: m.DataRequests })));
const MagicKnowledgeBase = lazy(() => import('./magic-saas/pages/saas/ops/KnowledgeBase').then(m => ({ default: m.KnowledgeBase })));
const MagicTeam = lazy(() => import('./magic-saas/pages/saas/admin/Team').then(m => ({ default: m.Team })));
const MagicAnnouncements = lazy(() => import('./magic-saas/pages/saas/admin/Announcements').then(m => ({ default: m.Announcements })));
const MagicPlatformReports = lazy(() => import('./magic-saas/pages/saas/admin/PlatformReports').then(m => ({ default: m.PlatformReports })));
const MagicAuditLog = lazy(() => import('./magic-saas/pages/saas/AuditLog').then(m => ({ default: m.AuditLog })));
const MagicPlatformSettings = lazy(() => import('./magic-saas/pages/saas/admin/PlatformSettings').then(m => ({ default: m.PlatformSettings })));

export function App() {
  const { resolvedTheme } = useTheme();
  const integrationMode = readIntegrationMode(import.meta.env.VITE_HISABIQ_INTEGRATION_MODE);
  return (
    <SaasProvider><HashRouter><SessionProvider mode={integrationMode}>
      <Toaster theme={resolvedTheme} position="bottom-right" toastOptions={{ style: { fontFamily: 'Geist' } }} />
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/design-system" element={<PageBoundary><BrandGuide /></PageBoundary>} />
        <Route path="/login" element={<PageBoundary><LoginPreviewPage view="password" /></PageBoundary>} />
        <Route path="/login/pin" element={<PageBoundary><LoginPreviewPage view="pin" /></PageBoundary>} />
        <Route path="/login/accounts" element={<PageBoundary><LoginPreviewPage view="accounts" /></PageBoundary>} />
        <Route path="/signup" element={<ConnectedWorkspaceGate><PageBoundary><SignupPreviewPage /></PageBoundary></ConnectedWorkspaceGate>} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/login/signup" element={<Navigate to="/signup" replace />} />
        <Route path="/recovery" element={<ConnectedWorkspaceGate><PageBoundary><RecoveryPreviewPage /></PageBoundary></ConnectedWorkspaceGate>} />
        <Route path="/forgot-password" element={<Navigate to="/recovery" replace />} />
        <Route path="/login/recovery" element={<Navigate to="/recovery" replace />} />
        <Route path="/saas" element={<ConnectedWorkspaceGate><MagicSaasEntry /></ConnectedWorkspaceGate>}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<MagicMyWork />} />
          <Route path="tenants" element={<MagicBusinesses />} />
          <Route path="tenants/:tenantId" element={<MagicTenantWorkspace />} />
          <Route path="subscriptions" element={<MagicSubscriptions />} />
          <Route path="invoices" element={<MagicInvoices />} />
          <Route path="payments" element={<MagicPayments />} />
          <Route path="refunds" element={<MagicRefunds />} />
          <Route path="plans" element={<MagicPackagesOffers view="plans" />} />
          <Route path="addons" element={<MagicPackagesOffers view="addons" />} />
          <Route path="offers" element={<MagicPackagesOffers view="offers" />} />
          <Route path="packages" element={<Navigate to="/saas/plans" replace />} />
          <Route path="tickets" element={<MagicTickets />} />
          <Route path="support" element={<MagicSupportAccessQueue />} />
          <Route path="services" element={<MagicServices />} />
          <Route path="sms" element={<MagicSmsAdmin />} />
          <Route path="data-requests" element={<MagicDataRequests />} />
          <Route path="knowledge" element={<MagicKnowledgeBase />} />
          <Route path="team" element={<MagicTeam />} />
          <Route path="announcements" element={<MagicAnnouncements />} />
          <Route path="reports" element={<MagicPlatformReports />} />
          <Route path="audit" element={<MagicAuditLog />} />
          <Route path="settings" element={<MagicPlatformSettings />} />
          <Route path="*" element={<Navigate to="/saas/home" replace />} />
        </Route>
        <Route path="/app" element={<ConnectedWorkspaceGate><AppShell /></ConnectedWorkspaceGate>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="subscription" element={<TenantSubscription />} /><Route path="support" element={<TenantSupport />} /><Route path="support/:id" element={<TenantSupport detail />} />
          <Route path="settings" element={<TenantSettingsPage />} />
          <Route path="settings/:section" element={<TenantSettingsPage />} />
          <Route path="settings/:section/:id" element={<TenantSettingsPage />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="search" element={<GlobalSearch />} />
          <Route path="pos" element={<Pos />} />
          <Route path="counter" element={<Finance counterOnly />} />
          <Route path="recycle-bin" element={<RecycleBin />} />
              <Route path="sales" element={<Sales />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="online-sales" element={<OnlineSales />} />
          <Route path="notifications" element={<ErpNotifications />} />
          <Route path="warranty" element={<Warranty />} />
          <Route path="reconciliation" element={<Reconciliation />} />
          <Route path="finance" element={<Finance />} />
          <Route path="daybook" element={<Daybook />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="audit-ledger" element={<AuditLedger />} />
          <Route path="products" element={<Products />} />
          <Route path="parties" element={<Parties />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors-v2" element={<VendorV2 />} />
          <Route path="purchases/new" element={<PurchaseEditor />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionProvider></HashRouter></SaasProvider>
  );
}

