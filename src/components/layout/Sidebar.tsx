import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
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
  ChevronsUpDown
} from 'lucide-react';
import { LogoLockup } from '../brand/Logo';

const nav = [
  { to: '/app/dashboard', label: 'Dashboard', bn: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { to: '/app/pos', label: 'POS / New Sale', bn: 'নতুন বিক্রি', icon: ShoppingCart, hint: 'F1' },
  { to: '/app/sales', label: 'Sales', bn: 'বিক্রয়', icon: FileText },
  { to: '/app/warranty', label: 'Warranty', bn: 'ওয়ারেন্টি', icon: ShieldCheck },
  { to: '/app/products', label: 'Products', bn: 'পণ্য', icon: Package },
  { to: '/app/parties', label: 'Parties & Ledger', bn: 'পার্টি ও খাতা', icon: Users },
  { to: '/app/purchases', label: 'Purchases', bn: 'ক্রয়', icon: ReceiptText },
  { to: '/app/expenses', label: 'Expenses', bn: 'খরচ', icon: Wallet },
  { to: '/app/finance', label: 'Finance & Accounts', bn: 'হিসাব ও অ্যাকাউন্ট', icon: Banknote },
  { to: '/app/reconciliation', label: 'Reconciliation', bn: 'হিসাব মিলানো', icon: Landmark },
  { to: '/app/reports', label: 'Reports', bn: 'রিপোর্ট', icon: PieChart }
];

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col border-r border-ink-100 bg-sidebar lg:flex">
      <div className="flex h-14 items-center px-4">
        <Link to="/app/dashboard" aria-label="HisabIQ dashboard">
          <LogoLockup size={26} />
        </Link>
      </div>

      <button className="mx-3 mb-3 flex items-center gap-2.5 rounded-lg border border-ink-100 bg-white px-2.5 py-2 text-left shadow-card transition-colors hover:border-ink-200">
        <span className="flex size-7 items-center justify-center rounded-md bg-teal-50 text-xs font-semibold text-teal-700">
          NH
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">Nawabpur Hardware House</span>
          <span className="block truncate text-[11px] text-ink-500">Main branch · Dhaka</span>
        </span>
        <ChevronsUpDown className="size-3.5 text-ink-400" aria-hidden="true" />
      </button>

      <nav className="flex-1 space-y-0.5 px-3" aria-label="Main">
        <p className="px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-ink-400">Workspace</p>
        {nav.map(({ to, label, bn, icon: Icon, hint }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                isActive
                  ? 'bg-white font-medium text-ink shadow-card ring-1 ring-ink-100'
                  : 'text-ink-600 hover:bg-white/70 hover:text-ink'
              }`
            }>
            {({ isActive }) => (
              <>
                <Icon className={`size-4 ${isActive ? 'text-teal-600' : 'text-ink-400 group-hover:text-ink-600'}`} aria-hidden="true" />
                <span className="flex-1 leading-tight">
                  <span className="block">{label}</span>
                  <span className="font-bn block text-[10.5px] font-normal text-ink-400">{bn}</span>
                </span>
                {hint && <kbd className="rounded border border-ink-100 bg-white px-1 text-[10px] text-ink-400">{hint}</kbd>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-ink-100 p-3">
        <Link
          to="/design-system"
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-ink-600 hover:bg-white/70 hover:text-ink">
          <Palette className="size-4 text-ink-400" aria-hidden="true" />
          Brand guide
        </Link>
        <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-ink-600 hover:bg-white/70 hover:text-ink">
          <Settings className="size-4 text-ink-400" aria-hidden="true" />
          Settings
        </button>
      </div>
    </aside>
  );
}

export const mobileNav = nav;
