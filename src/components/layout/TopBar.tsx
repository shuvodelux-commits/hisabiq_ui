import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calculator as CalculatorIcon,
  ChevronDown,
  LogOut,
  Plus,
  Search,
  Settings,
  User,
  Wallet,
  Languages,
  Palette } from
'lucide-react';
import { ThemePicker } from './ThemePicker';
import { Button } from '../Button';
import { FloatingPanel } from './FloatingPanel';
import { Calculator } from './Calculator';
import { mobileNav } from './Sidebar';
import { LogoMark } from '../brand/Logo';
import { useCashSession } from '../../contexts/CashSessionContext';
import { notifications } from '../../data/dashboard';
import { taka } from '../../utils/currency';

const toneDot = {
  warning: 'bg-warning',
  success: 'bg-success',
  danger: 'bg-danger',
  info: 'bg-info'
};

export function TopBar() {
  const { setOpen, sessionOpen } = useCashSession();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <header data-print-hide className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <Link to="/app/dashboard" className="lg:hidden" aria-label="HisabIQ">
          <LogoMark size={28} />
        </Link>

        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search products, parties, invoices…"
            aria-label="Global search"
            className="h-9 w-full rounded-lg border border-border bg-ink-50 pl-9 pr-14 text-sm text-ink placeholder:text-ink-400 focus:border-teal-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
          
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-ink-200 bg-card px-1.5 text-[10px] text-ink-500">
            Ctrl K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemePicker />
          {pathname !== '/app/pos' &&
          <Button size="sm" className="hidden md:inline-flex" onClick={() => navigate('/app/pos')}>
              <Plus className="size-4" /> New sale
            </Button>
          }

          <button
            onClick={() => setOpen(true)}
            className="hidden h-8 items-center gap-2 rounded-lg border border-border px-2.5 text-[13px] text-ink-700 transition-colors hover:bg-ink-50 sm:flex">
            
            <span className={`size-2 rounded-full ${sessionOpen ? 'bg-success' : 'bg-ink-300'}`} aria-hidden="true" />
            <Wallet className="size-3.5 text-ink-400" aria-hidden="true" />
            {sessionOpen ?
            <>
                <span>Cash</span>
                <span className="font-medium tabular-nums text-ink">{taka(48250)}</span>
              </> :

            <span>Open cash session</span>
            }
          </button>

          <FloatingPanel
            label="Calculator"
            width={272}
            trigger={({ open, toggle }) =>
            <button
              onClick={toggle}
              aria-label="Calculator"
              aria-expanded={open}
              className={`flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink ${open ? 'bg-ink-50 text-ink' : ''}`}>
              
                <CalculatorIcon className="size-4" />
              </button>
            }>
            
            {() => <Calculator />}
          </FloatingPanel>

          <FloatingPanel
            label="Notifications"
            width={340}
            trigger={({ open, toggle }) =>
            <button
              onClick={toggle}
              aria-label="Notifications, 3 unread"
              aria-expanded={open}
              className={`relative flex size-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink ${open ? 'bg-ink-50 text-ink' : ''}`}>
              
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-card" />
              </button>
            }>
            
            {(close) =>
            <div>
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <p className="text-sm font-semibold">Notifications</p>
                  <button onClick={close} className="text-xs font-medium text-teal-700 hover:underline">
                    Mark all read
                  </button>
                </div>
                <ul className="max-h-80 divide-y divide-border overflow-auto">
                  {notifications.map((n) =>
                <li key={n.id} className="flex gap-3 px-4 py-3 hover:bg-ink-50">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${toneDot[n.tone]}`} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-ink">{n.title}</p>
                        <p className="text-xs text-ink-500">{n.body}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-ink-400">{n.time}</span>
                    </li>
                )}
                </ul>
              </div>
            }
          </FloatingPanel>

          <FloatingPanel
            label="User menu"
            width={240}
            trigger={({ open, toggle }) =>
            <button
              onClick={toggle}
              aria-expanded={open}
              aria-label="User menu"
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 hover:bg-ink-50">
              
                <span className="flex size-7 items-center justify-center rounded-full bg-inverse text-[11px] font-semibold text-white">AR</span>
                <span className="hidden text-left leading-tight xl:block">
                  <span className="block text-[13px] font-medium text-ink">Anisur Rahman</span>
                  <span className="block text-[11px] text-ink-500">Owner</span>
                </span>
                <ChevronDown className="size-3.5 text-ink-400" aria-hidden="true" />
              </button>
            }>
            
            {(close) =>
            <div className="p-1.5 text-[13px]">
                <div className="px-2.5 py-2">
                  <p className="font-medium text-ink">Md. Anisur Rahman</p>
                  <p className="text-xs text-ink-500">anis@nawabpurhardware.com</p>
                </div>
                <div className="my-1 h-px bg-ink-100" />
                {[
              { icon: User, label: 'Profile' },
              { icon: Languages, label: 'ভাষা: English / বাংলা' },
              { icon: Settings, label: 'Business settings' }].
              map(({ icon: Icon, label }) =>
              <button key={label} onClick={close} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-ink-700 hover:bg-ink-50">
                    <Icon className="size-4 text-ink-400" /> <span className="font-bn">{label}</span>
                  </button>
              )}
                <Link to="/design-system" onClick={close} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-ink-700 hover:bg-ink-50">
                  <Palette className="size-4 text-ink-400" /> Brand guide
                </Link>
                <div className="my-1 h-px bg-ink-100" />
                <button onClick={close} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-danger hover:bg-danger-bg">
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            }
          </FloatingPanel>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-1.5 lg:hidden" aria-label="Sections">
        {mobileNav.map(({ to, label, icon: Icon }) =>
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
          `flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs ${isActive ? 'bg-teal-50 font-medium text-teal-700' : 'text-ink-600'}`
          }>
          
            <Icon className="size-3.5" /> {label}
          </NavLink>
        )}
      </nav>
    </header>);

}
