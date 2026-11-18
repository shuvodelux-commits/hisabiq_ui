import React, { Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { MOTION_EASE, MOTION_MS } from '../../hisabiq-library/motion/tokens';
import {
  ArrowLeft, BadgeCheck, BarChart3, BookOpen, Building2, ChevronLeft, ChevronRight,
  DatabaseBackup, FileText, History, Inbox, KeyRound, Layers, LifeBuoy, Megaphone,
  Menu, MessageSquareText, PackagePlus, PanelLeftClose, PanelLeftOpen, RefreshCw,
  Settings, Tag, Undo2, UsersRound, Wrench, X,
} from 'lucide-react';
import { LogoMark } from '../brand/Logo';
import { useSaas } from '../../contexts/SaasContext';
import { useWorkQueue } from '../../hooks/saas/useWorkQueue';
import { saasNav } from '../../data/saasNav';
import { lockBodyScroll } from '../../../utils/bodyScrollLock';
import { GlobalSearch } from './GlobalSearch';
import { IdentityChip } from './IdentityChip';

const icons: Record<string, React.ElementType> = {
  Building2, RefreshCw, FileText, BadgeCheck, Undo2, Layers, PackagePlus, Tag,
  LifeBuoy, KeyRound, Wrench, MessageSquareText, DatabaseBackup, BookOpen,
  UsersRound, Megaphone, BarChart3, History, Settings,
};

const COLLAPSED_KEY = 'hisabiq:saas-sidebar-collapsed';
const navEase = { duration: MOTION_MS.navActive / 1000, ease: MOTION_EASE };

function initialCollapsed() {
  try { return window.localStorage.getItem(COLLAPSED_KEY) === 'true'; }
  catch { return false; }
}

function Count({ value, className }: { value: number; className: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span key={value} initial={reduced ? false : { scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 28 }}
      className={'relative ' + className}>
      {value}
    </motion.span>
  );
}

type Group = (typeof saasNav)[number];

function NavigationTree({ groups, counts, myQueue, collapsed = false, onNavigate, title }: {
  groups: Group[];
  counts: Record<string, number>;
  myQueue: number;
  collapsed?: boolean;
  onNavigate?: () => void;
  title: string;
}) {
  const reduced = useReducedMotion();
  const base = 'group relative flex min-h-9 w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring';
  const visual = (active: boolean) => active
    ? 'font-medium text-sidebar-accent-foreground'
    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground';
  const indicator = (
    <motion.span aria-hidden="true" layoutId={reduced ? undefined : 'cc-nav-active'}
      initial={false} transition={reduced ? { duration: 0 } : navEase}
      className="pointer-events-none absolute inset-0 rounded-lg bg-sidebar-accent">
      <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-sidebar-primary" />
    </motion.span>
  );
  return (
    <LayoutGroup id={title}>
      <nav aria-label={title} className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-2.5 py-2 scrollbar-thin">
        <ul className="space-y-0.5">
          <li>
            <NavLink end to="/saas/home" onClick={onNavigate}
              aria-label={collapsed ? 'My work' : undefined} title={collapsed ? 'My work' : undefined}
              className={({ isActive }) => base + ' ' + (collapsed ? 'mx-auto size-10 justify-center px-0 ' : '') + visual(isActive)}>
              {({ isActive }) => <>
                {isActive && indicator}
                <Inbox aria-hidden="true" className={'relative size-[18px] shrink-0 ' + (isActive ? 'text-sidebar-primary' : 'text-ink-400')} />
                {!collapsed && <span className="relative min-w-0 flex-1 truncate">My work <span className="font-bn text-[10.5px] font-normal text-ink-400">আজকের কাজ</span></span>}
                {!collapsed && myQueue > 0 && <Count value={myQueue} className="rounded-md bg-teal-600 px-1.5 text-[11px] font-medium text-white" />}
              </>}
            </NavLink>
          </li>
        </ul>
        {groups.map(group => (
          <section key={group.label} aria-label={group.label}>
            {!collapsed && <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
              {group.label} <span className="font-bn font-normal normal-case tracking-normal">· {group.bn}</span>
            </p>}
            <ul className="space-y-0.5">
              {group.items.map(n => {
                const Icon = icons[n.icon] ?? Building2;
                const count = counts[n.to] ?? 0;
                return <li key={n.to}>
                  <NavLink to={n.to} onClick={onNavigate}
                    aria-label={collapsed ? n.label + (count ? ', ' + count + ' pending' : '') : undefined}
                    title={collapsed ? n.label : undefined}
                    className={({ isActive }) => base + ' ' + (collapsed ? 'mx-auto size-10 justify-center px-0 ' : '') + visual(isActive)}>
                    {({ isActive }) => <>
                      {isActive && indicator}
                      <Icon aria-hidden="true" className={'relative size-[18px] shrink-0 ' + (isActive ? 'text-sidebar-primary' : 'text-ink-400')} />
                      {!collapsed && <span className="relative min-w-0 flex-1 truncate">{n.label}</span>}
                      {!collapsed && count > 0 && <Count value={count} className="rounded-md bg-warning-bg px-1.5 text-[11px] font-medium text-warning" />}
                    </>}
                  </NavLink>
                </li>;
              })}
            </ul>
          </section>
        ))}
      </nav>
    </LayoutGroup>
  );
}

/** ERP-style horizontal module rail remains visible when the drawer is closed. */
function MobileModuleStrip({ groups, counts, myQueue }: {
  groups: Group[];
  counts: Record<string, number>;
  myQueue: number;
}) {
  const strip = useRef<HTMLElement>(null);
  const location = useLocation();
  const reduced = useReducedMotion();
  const [edges, setEdges] = useState({ left: false, right: false });
  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const measure = () => setEdges({
      left: el.scrollLeft > 2,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    el.addEventListener('scroll', measure, { passive: true });
    return () => { observer.disconnect(); el.removeEventListener('scroll', measure); };
  }, []);
  useEffect(() => {
    const active = strip.current?.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
  }, [location.pathname, reduced]);

  const nudge = (direction: number) => strip.current?.scrollBy({
    left: direction * Math.max(180, (strip.current?.clientWidth ?? 0) * 0.65),
    behavior: reduced ? 'instant' : 'smooth',
  });
  const entry = 'relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring';
  const activeCls = (active: boolean) => active
    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
    : 'text-ink-500 hover:bg-sidebar-accent hover:text-ink';
  const tabs = [{ to: '/saas/home', label: 'My work', icon: 'Inbox', count: myQueue }]
    .concat(groups.flatMap(g => g.items.map(i => ({
      to: i.to, label: i.label, icon: i.icon, count: counts[i.to] ?? 0,
    }))));
  return (
    <div className="relative border-t border-border bg-card lg:hidden">
      {edges.left && <button type="button" onClick={() => nudge(-1)} aria-label="Scroll Control Center modules left"
        className="absolute left-1 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-ink-600 shadow-sm focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>}
      {edges.right && <button type="button" onClick={() => nudge(1)} aria-label="Scroll Control Center modules right"
        className="absolute right-1 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-ink-600 shadow-sm focus-visible:ring-2 focus-visible:ring-ring">
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>}
      <nav ref={strip} aria-label="Control Center" data-saas-top-nav=""
        className="flex gap-1 overflow-x-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(tab => {
          const Icon = tab.icon === 'Inbox' ? Inbox : (icons[tab.icon] ?? Building2);
          return <NavLink key={tab.to} to={tab.to} className={({ isActive }) => entry + ' ' + activeCls(isActive)}>
            {({ isActive }) => <>
              <Icon aria-hidden="true" className={'size-4 shrink-0 ' + (isActive ? 'text-sidebar-primary' : 'text-ink-400')} />
              <span>{tab.label}</span>
              {tab.count > 0 && <span className="rounded-md bg-teal-50 px-1.5 text-[11px] text-teal-800">{tab.count}</span>}
            </>}
          </NavLink>;
        })}
      </nav>
    </div>
  );
}

/** Staff workspace, visually aligned with the ERP shell but isolated from tenant ERP state. */
export function ControlCenterShell() {
  const saas = useSaas();
  const location = useLocation();
  const reduced = useReducedMotion();
  const { state, canFor } = saas;
  const queue = useWorkQueue();
  const myQueue = queue.filter(w => !w.owner || w.owner === saas.staff.name).length;
  const counts: Record<string, number> = {
    '/saas/payments': state.orders.filter(o => o.state === 'VERIFICATION_PENDING' && canFor('payments.verify', o.tenantId)).length,
    '/saas/tickets': state.tickets.filter(t => t.status === 'Open' && (!t.assignee || t.assignee === saas.staff.name) && canFor('tickets.edit', t.tenantId)).length,
    '/saas/support': state.access.filter(a => a.state === 'APPROVED' && canFor('support.access', a.tenantId)).length,
    '/saas/services': state.services.filter(s => s.state === 'REQUESTED' && canFor('services.edit', s.tenantId)).length,
    '/saas/sms': state.smsMessages.filter(m => m.status === 'Failed').length + state.senders.filter(s => s.status === 'Pending').length,
    '/saas/data-requests': state.dataRequests.filter(d => ['REQUESTED', 'CONSENTED', 'IN_PROGRESS'].includes(d.state) && canFor('data.manage', d.tenantId)).length,
  };
  const groups = saasNav.map(g => ({ ...g, items: g.items.filter(i => saas.can(i.perm)) }))
    .filter(g => g.items.length);

  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTrigger = useRef<HTMLButtonElement>(null);
  const drawerPanel = useRef<HTMLDivElement>(null);

  const toggleCollapsed = () => setCollapsed(previous => !previous);
  const closeDrawer = (restoreFocus = true) => {
    setDrawerOpen(false);
    if (restoreFocus) drawerTrigger.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    try { window.localStorage.setItem(COLLAPSED_KEY, String(collapsed)); }
    catch { /* blocked storage must not break navigation */ }
  }, [collapsed]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => { if (media.matches) setDrawerOpen(false); };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!drawerOpen) return;
    const release = lockBodyScroll();
    drawerPanel.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
      } else if (event.key === 'Tab' && drawerPanel.current) {
        const elements = Array.from(drawerPanel.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
        )).filter(el => el.getClientRects().length > 0);
        if (!elements.length) return;
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && (document.activeElement === first || !drawerPanel.current.contains(document.activeElement))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !drawerPanel.current.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { release(); window.removeEventListener('keydown', onKey); };
  }, [drawerOpen]);

  return (
    <div className="hisabiq-design-preview hisabiq-app flex min-h-screen w-full bg-background font-sans text-ink">
      <motion.aside data-saas-sidebar="" initial={false} animate={{ width: collapsed ? 64 : 256 }}
        transition={reduced ? { duration: 0 } : { duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className="group/sidebar sticky top-0 z-20 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar lg:flex">
        <div className={'flex h-14 shrink-0 items-center ' + (collapsed ? 'justify-center px-1' : 'justify-between gap-2 px-3')}>
          <Link to="/saas/home" aria-label="Control Center home"
            className="flex min-w-0 items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-sidebar-ring">
            <LogoMark size={28} />
            {!collapsed && <span className="truncate text-[13px] font-semibold text-sidebar-foreground">Control Center</span>}
          </Link>
          {!collapsed && <button type="button" onClick={toggleCollapsed} aria-label="Collapse Control Center sidebar"
            title="Collapse sidebar (Ctrl+B)"
            className="grid size-9 shrink-0 place-items-center rounded-md text-ink-500 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
            <PanelLeftClose className="size-[18px]" aria-hidden="true" />
          </button>}
        </div>
        {collapsed && <button type="button" onClick={toggleCollapsed} aria-label="Expand Control Center sidebar"
          title="Expand sidebar (Ctrl+B)"
          className="mx-auto mb-2 grid size-9 shrink-0 place-items-center rounded-md text-ink-500 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <PanelLeftOpen className="size-[18px]" aria-hidden="true" />
        </button>}
        <NavigationTree groups={groups} counts={counts} myQueue={myQueue} collapsed={collapsed} title="Control Center" />
        <div className="shrink-0 border-t border-sidebar-border p-2.5">
          <Link to="/app/dashboard" aria-label={collapsed ? 'Back to ERP' : undefined}
            title={collapsed ? 'Back to ERP' : undefined}
            className={'flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring ' + (collapsed ? 'justify-center' : '')}>
            <ArrowLeft aria-hidden="true" className="size-[18px] shrink-0" />
            {!collapsed && <span>Back to ERP</span>}
          </Link>
          {!collapsed && <p className="mt-1 px-2.5 text-[11px] leading-snug text-ink-500">
            Prototype · sample data resets on reload
          </p>}
        </div>
      </motion.aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex min-h-14 items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:px-6">
            <button ref={drawerTrigger} type="button" aria-label="Open Control Center navigation"
              aria-controls="saas-mobile-drawer" aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="grid size-9 shrink-0 place-items-center rounded-md text-ink-600 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:hidden">
              <Menu aria-hidden="true" className="size-5" />
            </button>
            <Link to="/saas/home" aria-label="Control Center home"
              className="shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-sidebar-ring lg:hidden">
              <LogoMark size={28} />
            </Link>
            <span className="hidden shrink-0 text-[13px] font-semibold text-ink lg:inline">Control Center</span>
            <div className="flex min-w-0 flex-1 justify-center"><GlobalSearch /></div>
            <IdentityChip />
            <Link to="/app/dashboard" title="Back to the merchant ERP"
              className="ref-action hidden h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[13px] font-medium text-ink hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring sm:inline-flex lg:hidden">
              <ArrowLeft aria-hidden="true" className="size-4" />ERP
            </Link>
          </div>
          <MobileModuleStrip groups={groups} counts={counts} myQueue={myQueue} />
        </header>
        <main id="saas-main" tabIndex={-1} className="min-w-0 flex-1 px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          <motion.div key={location.pathname.split('/').slice(0, 4).join('/')}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: MOTION_MS.tab / 1000, ease: MOTION_EASE }}>
            <Suspense fallback={<div role="status" aria-live="polite"
              className="rounded-md border border-border bg-card px-4 py-6 text-sm text-ink-500">
              Loading workspace…
            </div>}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>

      {createPortal(<AnimatePresence>
        {drawerOpen && <motion.div key="saas-nav-overlay"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.22 }}
          className="fixed inset-0 z-[100] bg-ink/50 lg:hidden"
          onMouseDown={event => { if (event.target === event.currentTarget) closeDrawer(); }}>
          <motion.div ref={drawerPanel} role="dialog" aria-modal="true" aria-label="Control Center navigation"
            id="saas-mobile-drawer" initial={reduced ? false : { x: -320 }}
            animate={{ x: 0 }} exit={{ x: -320 }}
            transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 40, mass: 0.9 }}
            className="flex h-full w-[min(320px,calc(100vw-40px))] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar shadow-pop">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-3">
              <Link to="/saas/home" onClick={() => closeDrawer(false)} className="flex items-center gap-2 text-[13px] font-semibold text-sidebar-foreground">
                <LogoMark size={28} /> Control Center
              </Link>
              <button type="button" onClick={() => closeDrawer()} aria-label="Close Control Center navigation"
                className="grid size-9 place-items-center rounded-md text-ink-600 hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <NavigationTree groups={groups} counts={counts} myQueue={myQueue}
              title="Control Center drawer" onNavigate={() => closeDrawer(false)} />
            <Link to="/app/dashboard" onClick={() => closeDrawer(false)}
              className="flex min-h-12 items-center gap-2 border-t border-sidebar-border px-5 text-[13px] text-sidebar-foreground hover:bg-sidebar-accent">
              <ArrowLeft aria-hidden="true" className="size-4" /> Back to ERP
            </Link>
          </motion.div>
        </motion.div>}
      </AnimatePresence>, document.body)}
    </div>
  );
}
