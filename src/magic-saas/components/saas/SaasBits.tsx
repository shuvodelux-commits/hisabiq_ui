import React from 'react';
import { Lock, Search, X } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { MOTION_EASE } from '../../hisabiq-library/motion/tokens';
import { StatusBadge, type StatusTone } from '../StatusBadge';
import { Input } from '../../../components/Input';
import type { AccessState, EntitlementSource, EntitlementStatus, OrderState, PromoStatus, TenantStatus } from '../../types/saas';

export const tenantTone: Record<TenantStatus, StatusTone> = { Active: 'success', Trial: 'info', Grace: 'warning', Expired: 'danger', Suspended: 'ink' };

export const orderMeta: Record<OrderState, { label: string; tone: StatusTone; help: string }> = {
  PAYMENT_PENDING: { label: 'Payment pending', tone: 'neutral', help: 'Waiting for the business to pay and send the reference.' },
  VERIFICATION_PENDING: { label: 'Verification pending', tone: 'warning', help: 'Reference received. Billing must match it to the statement.' },
  ACTIVATION_PENDING: { label: 'Paid · activation pending', tone: 'info', help: 'Money received. Benefits not applied yet.' },
  COMPLETED: { label: 'Completed', tone: 'success', help: 'Paid and benefits applied once.' },
  FAILED: { label: 'Failed', tone: 'danger', help: 'Could not be matched. The business can resubmit.' },
  REFUND_PENDING: { label: 'Refund pending', tone: 'warning', help: 'Refund approved, money not yet returned.' },
  REFUNDED: { label: 'Refunded', tone: 'ink', help: 'Money returned. Purchased benefits removed.' },
  VOIDED: { label: 'Voided', tone: 'ink', help: 'Cancelled before payment. Kept in history.' },
};

export const accountTone: Record<'Provisioning' | 'Active' | 'Suspended' | 'Archived', StatusTone> = { Provisioning: 'info', Active: 'success', Suspended: 'danger', Archived: 'ink' };

/** Page heading used across the Control Center. */
export function PageTitle({ title, bn, description, actions }: { title: string; bn: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-baseline gap-x-2 text-xl font-semibold tracking-tight text-ink">
          {title} <span className="font-bn text-sm font-normal text-ink-500">{bn}</span>
        </h1>
        <p className="mt-0.5 max-w-3xl text-[13px] text-ink-500">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function MeterBar({ label, value, pct, helper }: { label: string; value: string; pct: number; helper?: string }) {
  const reduced = useReducedMotion();
  return (
    <div>
      <div className="flex justify-between gap-2 text-[13px]"><span className="text-ink-600">{label}</span><span className="font-medium tabular-nums">{value}</span></div>
      <div className="mt-1 h-1.5 rounded-full bg-ink-50" role="meter" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          initial={reduced ? false : { width: 0 }}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: 0.5, ease: MOTION_EASE }}
          className={`h-1.5 rounded-full transition-colors ${pct >= 90 ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-teal-600'}`}
        />
      </div>
      {helper && <p className="mt-0.5 text-[11px] text-ink-500">{helper}</p>}
    </div>
  );
}

/** Toolbar search input used by Control Center lists. */
export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative min-w-[200px] flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
      <Input
        clearable={false}
        type="search"
        data-hisabiq-input=""
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="ref-control block h-9 w-full rounded-md border border-input bg-card pl-9 pr-9 text-[13px] text-ink shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" aria-label={`Clear ${placeholder}`} title="Clear" onClick={() => onChange('')} className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink">
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function LoadingList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="h-9 animate-pulse rounded-lg bg-ink-50" />)}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 overflow-hidden rounded-xl border border-ink-100 bg-card shadow-card ${className}`}>{children}</section>;
}

export const sourceMeta: Record<EntitlementSource, { label: string; tone: StatusTone }> = {
  PLAN: { label: 'Plan benefit', tone: 'teal' },
  PURCHASE: { label: 'Purchased', tone: 'success' },
  TRIAL: { label: 'Trial', tone: 'info' },
  GRANT: { label: 'Complimentary', tone: 'warning' },
};

export const entStatusTone: Record<EntitlementStatus, StatusTone> = { Active: 'success', Scheduled: 'info', Expired: 'neutral', Revoked: 'danger' };

export const promoMeta: Record<PromoStatus, { label: string; tone: StatusTone }> = {
  DRAFT: { label: 'Draft', tone: 'neutral' },
  SCHEDULED: { label: 'Scheduled', tone: 'info' },
  ACTIVE: { label: 'Active', tone: 'success' },
  PAUSED: { label: 'Paused', tone: 'warning' },
  ENDED: { label: 'Ended', tone: 'ink' },
};

export const accessMeta: Record<AccessState, { label: string; tone: StatusTone }> = {
  REQUESTED: { label: 'Waiting for owner', tone: 'warning' },
  APPROVED: { label: 'Approved once', tone: 'info' },
  DECLINED: { label: 'Declined', tone: 'danger' },
  EXPIRED: { label: 'Expired', tone: 'neutral' },
  REVOKED: { label: 'Withdrawn', tone: 'neutral' },
  APPLIED: { label: 'Applied', tone: 'success' },
};

export function Badge({ tone, children, dot }: { tone: StatusTone; children: React.ReactNode; dot?: boolean }) {
  return (
    <StatusBadge tone={tone} dot={dot} className="whitespace-nowrap">
      {children}
    </StatusBadge>
  );
}

/** Compact label/value strip — replaces oversized single-number cards. */
export function SummaryStrip({ items }: { items: { label: string; value: React.ReactNode; helper?: React.ReactNode; tone?: 'danger' | 'warning' | 'success' }[] }) {
  const reduced = useReducedMotion();
  return (
    <dl className={`grid grid-cols-2 gap-3 ${items.length >= 4 ? 'lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
      {items.map((i, idx) => (
        <motion.div
          key={i.label}
          initial={reduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: idx * 0.04, ease: MOTION_EASE }}
          className="min-w-0 rounded-xl border border-ink-100 bg-card px-3 py-2.5 shadow-card"
        >
          <dt className="truncate text-[12px] text-ink-500">{i.label}</dt>
          <dd className={`mt-0.5 truncate text-lg font-semibold tabular-nums ${i.tone === 'danger' ? 'text-danger' : i.tone === 'warning' ? 'text-warning' : i.tone === 'success' ? 'text-success' : 'text-ink'}`}>{i.value}</dd>
          {i.helper && <dd className="truncate text-[11px] text-ink-500">{i.helper}</dd>}
        </motion.div>
      ))}
    </dl>
  );
}

export function Denied({ what, role }: { what: string; role: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-ink-100 bg-card p-4 shadow-card">
      <Lock className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" />
      <div>
        <p className="text-[13px] font-medium text-ink">You don’t have access to {what}</p>
        <p className="mt-0.5 text-xs text-ink-500">Your role ({role}) doesn’t include this permission. Ask a super admin if you need it.</p>
      </div>
    </div>
  );
}

/** Party Ledger table heading cell. */
export const th = 'h-10 whitespace-nowrap bg-ink-50 px-3 text-left align-middle text-xs font-medium text-ink-500 first:pl-4 last:pr-4';
export const td = 'px-3 py-2.5 align-middle first:pl-4 last:pr-4';
/** Sticky right "Action" column (Audit Ledger): always reachable while the table scrolls sideways. */
export const thAction = 'sticky right-0 z-10 h-10 w-14 whitespace-nowrap border-l border-ink-100 bg-ink-50 pr-2 pl-2 text-right align-middle text-xs font-medium text-ink-500';
export const tdAction = 'sticky right-0 z-10 w-14 border-l border-ink-100 bg-card py-1.5 pl-2 pr-2 text-right align-middle';

export function EmptyRow({ cols, text }: { cols: number; text: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-[13px] text-ink-500">
        {text}
      </td>
    </tr>
  );
}

export function Feedback({ result, onClose }: { result: { ok: boolean; message: string } | null; onClose: () => void }) {
  if (!result) return null;
  return (
    <p role={result.ok ? 'status' : 'alert'} className={`flex items-start justify-between gap-3 rounded-lg px-3 py-2 text-xs ${result.ok ? 'bg-teal-50 text-teal-800' : 'bg-danger-bg text-danger'}`}>
      <span>{result.message}</span>
      <button type="button" onClick={onClose} className="shrink-0 font-medium underline">
        Dismiss
      </button>
    </p>
  );
}

export function Proposed() {
  return <span className="rounded bg-info-bg px-1.5 py-0.5 text-[11px] font-medium text-info">Proposed extension · needs owner approval</span>;
}
