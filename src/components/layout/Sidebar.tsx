import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  FilePenLine,
  Store,
  BellRing,
  ShieldCheck,
  Landmark,
  Banknote,
  Package,
  Users,
  ReceiptText,
  Wallet,
  PieChart,
  Palette,
  Settings,
  ChevronsUpDown,
  BookOpenCheck,
  ClipboardList
} from 'lucide-react';
import { useTenantSettings } from '../../settings/TenantSettingsProvider';
import { LogoLockup } from '../brand/Logo';

const nav = [
  { to: '/app/settings', label: 'Settings', bn: 'সেটিংস', icon: Settings },
  { to: '/app/subscription', label: 'My subscription', bn: 'সাবস্ক্রিপশন', icon: ReceiptText },
  { to: '/app/support', label: 'Support', bn: 'সহায়তা', icon: Users },
  { to: '/app/dashboard', label: 'Dashboard', bn: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { to: '/app/pos', label: 'POS / New Sale', bn: 'নতুন বিক্রি', icon: ShoppingCart, hint: 'F1' },
  { to: '/app/sales', label: 'Sales', bn: 'বিক্রয়', icon: FileText },
  { to: '/app/quotations', label: 'Quotations', bn: 'মূল্য প্রস্তাব', icon: FilePenLine },
  { to: '/app/online-sales', label: 'Online Sales', bn: 'অনলাইন বিক্রয়', icon: Store },
  { to: '/app/notifications', label: 'ERP Notifications', bn: 'এসএমএস ও নোটিফিকেশন', icon: BellRing },
  { to: '/app/warranty', label: 'Warranty', bn: 'ওয়ারেন্টি', icon: ShieldCheck },
  { to: '/app/products', label: 'Products', bn: 'পণ্য', icon: Package },
  { to: '/app/parties', label: 'Parties & Ledger', bn: 'পার্টি ও খাতা', icon: Users },
  { to: '/app/purchases', label: 'Purchases', bn: 'ক্রয়', icon: ReceiptText },
  { to: '/app/expenses', label: 'Expenses', bn: 'খরচ', icon: Wallet },
  { to: '/app/finance', label: 'Finance', bn: 'টাকা-পয়সা', icon: Banknote },
  { to: '/app/daybook', label: 'Daybook', bn: 'দৈনিক লেনদেন', icon: ClipboardList },
  { to: '/app/accounts', label: 'Accounts', bn: 'হিসাব', icon: ReceiptText },
  { to: '/app/audit-ledger', label: 'Audit Ledger', bn: 'হিসাব যাচাই', icon: BookOpenCheck },
  { to: '/app/reconciliation', label: 'Reconciliation', bn: 'হিসাব মিলানো', icon: Landmark },
  { to: '/app/reports', label: 'Reports', bn: 'রিপোর্ট', icon: PieChart }
];

export function Sidebar() {
  const { state, personal } = useTenantSettings();
  return (
    <aside data-print-hide className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center px-4">
        <Link to="/app/dashboard" aria-label="HisabIQ dashboard">
          <LogoLockup size={26} />
        </Link>
      </div>

      <button className="mx-3 mb-3 flex items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2 text-left shadow-card transition-colors hover:border-ink-200">
        <span className="flex size-7 items-center justify-center rounded-md bg-teal-50 text-xs font-semibold text-teal-700">
          NH
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">{state.sections.business.name}</span>
          <span className="block truncate text-[11px] text-ink-500">Main branch · Dhaka</span>
        </span>
        <ChevronsUpDown className="size-3.5 text-ink-400" aria-hidden="true" />
      </button>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3" aria-label="Main">
        <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-ink-400">Workspace</p>
        {nav.map(({ to, label, bn, icon: Icon, hint }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                isActive
                  ? 'bg-card font-medium text-ink shadow-card ring-1 ring-ink-100'
                  : 'text-ink-600 hover:bg-card/70 hover:text-ink'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon className={`size-4 ${isActive ? 'text-teal-600' : 'text-ink-400 group-hover:text-ink-600'}`} aria-hidden="true" />
                <span className="flex-1 leading-tight">
                  <span className="block">{personal.language === 'Bangla' ? bn : label}</span>
                  {personal.language !== 'English' && <span className="font-bn block text-[10.5px] font-normal text-ink-400">{personal.language === 'Bangla' ? label : bn}</span>}
                </span>
                {hint && <kbd className="rounded border border-border bg-card px-1 text-[10px] text-ink-400">{hint}</kbd>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-border p-3">
        <Link
          to="/design-system"
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-ink-600 hover:bg-card/70 hover:text-ink">
          <Palette className="size-4 text-ink-400" aria-hidden="true" />
          Brand guide
        </Link>

      </div>
    </aside>
  );
}

export const mobileNav = nav;

