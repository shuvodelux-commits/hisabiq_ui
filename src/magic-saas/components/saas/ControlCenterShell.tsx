import React, { Suspense } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { MOTION_EASE, MOTION_MS } from '../../hisabiq-library/motion/tokens';
import {
  ArrowLeft, BadgeCheck, BarChart3, BookOpen, Building2, DatabaseBackup, FileText, History, Inbox, KeyRound, Layers, LifeBuoy, Megaphone,
  MessageSquareText, PackagePlus, RefreshCw, Settings, Tag, Undo2, UsersRound, Wrench,
} from 'lucide-react';
import { LogoMark } from '../brand/Logo';
import { useSaas } from '../../contexts/SaasContext';
import { useWorkQueue } from '../../hooks/saas/useWorkQueue';
import { saasNav } from '../../data/saasNav';
import { GlobalSearch } from './GlobalSearch';
import { IdentityChip } from './IdentityChip';

const icons: Record<string, React.ElementType> = { Building2, RefreshCw, FileText, BadgeCheck, Undo2, Layers, PackagePlus, Tag, LifeBuoy, KeyRound, Wrench, MessageSquareText, DatabaseBackup, BookOpen, UsersRound, Megaphone, BarChart3, History, Settings };

const linkCls = (isActive: boolean) =>
  `relative flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 lg:w-full ${isActive ? 'font-medium text-ink' : 'text-ink-600 hover:bg-ink-50 hover:text-ink'}`;
const navEase = { duration: MOTION_MS.navActive / 1000, ease: MOTION_EASE };

/** Active nav pill + left rail glide between items (GitHub navActive 190ms). */
function ActivePill({ reduced }: { reduced: boolean }) {
  return (
    <motion.span aria-hidden="true" layoutId={reduced ? undefined : 'cc-nav-active'} transition={navEase} className="absolute inset-0 rounded-lg bg-teal-50">
      <span className="absolute inset-y-1.5 left-0 hidden w-[3px] rounded-full bg-teal-600 lg:block" />
    </motion.span>
  );
}

/** Animated count: pops briefly when a queue number changes. */
function Count({ value, className }: { value: number; className: string }) {
  return (
    <motion.span key={value} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 28 }} className={`relative ${className}`}>
      {value}
    </motion.span>
  );
}

/** Staff workspace shell — separate from the merchant ERP. */
export function ControlCenterShell() {
  const saas = useSaas();
  const location = useLocation();
  const reduced = useReducedMotion();
  const { state, canFor } = saas;
  const queue = useWorkQueue();
  const myQueue = queue.filter((w) => !w.owner || w.owner === saas.staff.name).length;
  const counts: Record<string, number> = {
    '/saas/payments': state.orders.filter((o) => o.state === 'VERIFICATION_PENDING' && canFor('payments.verify', o.tenantId)).length,
    '/saas/tickets': state.tickets.filter((t) => t.status === 'Open' && (!t.assignee || t.assignee === saas.staff.name) && canFor('tickets.edit', t.tenantId)).length,
    '/saas/support': state.access.filter((a) => a.state === 'APPROVED' && canFor('support.access', a.tenantId)).length,
    '/saas/services': state.services.filter((s) => s.state === 'REQUESTED' && canFor('services.edit', s.tenantId)).length,
    '/saas/sms': state.smsMessages.filter((m) => m.status === 'Failed').length + state.senders.filter((s) => s.status === 'Pending').length,
    '/saas/data-requests': state.dataRequests.filter((d) => ['REQUESTED', 'CONSENTED', 'IN_PROGRESS'].includes(d.state) && canFor('data.manage', d.tenantId)).length,
  };
  const groups = saasNav.map((g) => ({ ...g, items: g.items.filter((i) => saas.can(i.perm)) })).filter((g) => g.items.length);

  return (
    <div className="hisabiq-design-preview hisabiq-app min-h-screen w-full bg-background font-sans text-ink">
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-card">
        <div className="mx-auto flex h-14 max-w-[1480px] items-center gap-3 px-4">
          <Link to="/saas/home" className="flex min-w-0 shrink-0 items-center gap-2.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
            <LogoMark size={26} />
            <span className="hidden truncate text-sm font-semibold md:inline">Control Center <span className="ml-1 font-bn text-[11px] font-normal text-ink-400">কন্ট্রোল সেন্টার</span></span>
          </Link>
          <div className="flex flex-1 justify-center"><GlobalSearch /></div>
          <IdentityChip />
          <Link to="/app/dashboard" title="Back to the merchant ERP" className="ref-action hidden items-center gap-1.5 rounded-lg border border-ink-200 bg-card px-3 text-[13px] font-medium text-ink hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 sm:inline-flex">
            <ArrowLeft className="size-4" />ERP
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1480px] gap-4 px-4 py-4 lg:grid-cols-[216px_minmax(0,1fr)]">
        <nav aria-label="Control Center" className="flex gap-1 overflow-x-auto rounded-xl border border-ink-100 bg-card p-2 lg:sticky lg:top-[72px] lg:block lg:max-h-[calc(100vh-88px)] lg:self-start lg:overflow-y-auto">
          <LayoutGroup id="cc-nav">
          <NavLink to="/saas/home" className={({ isActive }) => linkCls(isActive)}>
            {({ isActive }) => (
              <>
                {isActive && <ActivePill reduced={!!reduced} />}
                <Inbox className={`relative size-4 shrink-0 ${isActive ? 'text-teal-700' : 'text-ink-400'}`} aria-hidden="true" />
                <span className="relative flex-1 whitespace-nowrap">My work <span className="hidden font-bn text-[10.5px] font-normal text-ink-400 lg:inline">আজকের কাজ</span></span>
                {myQueue > 0 && <Count value={myQueue} className="rounded bg-teal-600 px-1.5 text-[11px] font-medium text-white" />}
              </>
            )}
          </NavLink>
          {groups.map((g) => (
            <div key={g.label} className="flex shrink-0 gap-1 lg:mt-3 lg:block">
              <p className="hidden px-2.5 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-400 lg:block">{g.label} <span className="font-bn font-normal normal-case tracking-normal">· {g.bn}</span></p>
              {g.items.map((n) => {
                const Icon = icons[n.icon] ?? Building2;
                return (
                  <NavLink key={n.to} to={n.to} className={({ isActive }) => linkCls(isActive)}>
                    {({ isActive }) => (
                      <>
                        {isActive && <ActivePill reduced={!!reduced} />}
                        <Icon className={`relative size-4 shrink-0 ${isActive ? 'text-teal-700' : 'text-ink-400'}`} aria-hidden="true" />
                        <span className="relative flex-1 whitespace-nowrap">{n.label}</span>
                        {(counts[n.to] ?? 0) > 0 && <Count value={counts[n.to]} className="rounded bg-warning-bg px-1.5 text-[11px] font-medium text-warning" />}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
          <p className="hidden border-t border-ink-100 px-2.5 pt-2 text-[11px] leading-relaxed text-ink-500 lg:mt-3 lg:block">Prototype. Sample data in this browser only; resets on reload.</p>
          </LayoutGroup>
        </nav>
        <main className="min-w-0">
          {/* Page enter: 6px rise + fade (200ms). Keyed by section so in-page tab/query changes don't re-animate. */}
          <motion.div
            key={location.pathname.split('/').slice(0, 4).join('/')}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION_MS.tab / 1000, ease: MOTION_EASE }}
          >
            <Suspense fallback={<div role="status" aria-live="polite" className="rounded-lg border border-ink-100 bg-card px-4 py-6 text-sm text-ink-500">Loading workspace…</div>}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
