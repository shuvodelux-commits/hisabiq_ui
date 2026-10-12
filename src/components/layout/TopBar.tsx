import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Palette,
  Menu,
  X } from
'lucide-react';
import { ThemePicker } from './ThemePicker';
import { Button } from '../Button';
import { FloatingPanel } from './FloatingPanel';
import { Calculator } from './Calculator';
import { ErpNavMenu } from './ErpNavMenu';
import { LogoMark } from '../brand/Logo';
import { useTenantSettings } from '../../settings/TenantSettingsProvider';
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
  const { setOpen, sessionOpen, expectedCash } = useCashSession();
  const { state } = useTenantSettings();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [navOpen,setNavOpen] = useState(false);
  const navTrigger = useRef<HTMLButtonElement>(null);
  const navDialog = useRef<HTMLDivElement>(null);
  const closeMobileNav = () => {
    setNavOpen(false);
    navTrigger.current?.focus();
  };

  // A modal sidebar must lock background scrolling and keep keyboard focus inside it.
  useEffect(() => {
    if (!navOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileNav();
        return;
      }
      if (event.key !== 'Tab' || !navDialog.current) return;
      const controls = Array.from(navDialog.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )).filter(el => el.getClientRects().length > 0);
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !navDialog.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !navDialog.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [navOpen]);

  // Never leave the mobile modal open after navigation or expanding to desktop.
  useEffect(() => setNavOpen(false), [pathname]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = () => { if (media.matches) setNavOpen(false); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return (
    <>
    <header data-print-hide className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="flex min-h-14 flex-wrap items-center gap-2 px-3 py-2 sm:h-14 sm:flex-nowrap sm:gap-3 sm:px-4 sm:py-0 lg:px-6">
        <button ref={navTrigger} type="button" aria-label="Open ERP navigation" aria-expanded={navOpen}
          aria-controls="erp-mobile-drawer" onClick={()=>setNavOpen(true)}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500 lg:hidden">
          <Menu className="size-5"/>
        </button>
        <Link to="/app/dashboard" className="shrink-0 lg:hidden" aria-label="HisabIQ">
          <LogoMark size={28} />
        </Link>

        <div className="relative order-last w-full min-w-0 basis-full sm:order-none sm:max-w-md sm:basis-auto sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search products, parties, invoices…"
            aria-label="Global search"
            className="h-9 w-full min-w-0 rounded-lg border border-border bg-ink-50 pl-9 pr-3 text-sm text-ink placeholder:text-ink-400 focus:border-teal-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:pr-14" />
          
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-ink-200 bg-card px-1.5 text-[10px] text-ink-500 sm:block">
            Ctrl K
          </kbd>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <ThemePicker />
          {pathname !== '/app/pos' &&
          <Button size="sm" className="hidden md:inline-flex" onClick={() => navigate('/app/pos')}>
              <Plus className="size-4" /> New sale
            </Button>
          }

          {state.sections.money.cashSession && <button
            onClick={() => setOpen(true)}
            className="hidden h-8 items-center gap-2 rounded-lg border border-border px-2.5 text-[13px] text-ink-700 transition-colors hover:bg-ink-50 sm:flex">
            
            <span className={`size-2 rounded-full ${sessionOpen ? 'bg-success' : 'bg-ink-300'}`} aria-hidden="true" />
            <Wallet className="size-3.5 text-ink-400" aria-hidden="true" />
            {sessionOpen ?
            <>
                <span>Cash</span>
                <span className="font-medium tabular-nums text-ink">{taka(expectedCash)}</span>
              </> :

            <span>Open cash session</span>
            }
          </button>}

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
              <button key={label} onClick={() => { close(); navigate(label === 'Business settings' ? '/app/settings/business' : '/app/settings/personal'); }} className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-ink-700 hover:bg-ink-50">
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

    </header>
    {navOpen && createPortal(
      <div data-print-hide className="fixed inset-0 z-[80] lg:hidden" aria-label="Mobile navigation overlay">
        <button type="button" className="fixed inset-0 bg-inverse/50" aria-label="Close ERP navigation"
          onClick={closeMobileNav}/>
        <div ref={navDialog} id="erp-mobile-drawer" role="dialog" aria-modal="true" aria-label="ERP navigation"
          className="fixed inset-y-0 left-0 flex h-[100dvh] w-[min(87vw,320px)] max-w-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl"
          style={{backgroundColor:'var(--sidebar)'}}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
            <span className="text-sm font-semibold text-sidebar-foreground">HisabIQ · Modules</span>
            <button type="button" autoFocus aria-label="Close navigation" onClick={closeMobileNav}
              className="flex size-9 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
              <X className="size-5"/>
            </button>
          </div>
          <ErpNavMenu mode="mobile" onNavigate={()=>setNavOpen(false)}/>
          <Link to="/app/support" onClick={()=>setNavOpen(false)}
            className="border-t border-sidebar-border px-5 py-3 text-sm text-sidebar-foreground">Help & Support</Link>
        </div>
      </div>,
      document.body
    )}
    </>);

}
