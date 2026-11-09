import type { PlanCode } from '../types/experience';
import type { ErpModule, Tenant } from '../types/saas';
import { planOrder, planPrice, planProductLimit } from '../data/saasSeeds';
import { erpModules, setupSteps } from '../data/saasOpsSeeds';
import { NOW, daysBetween, fmtDate } from './saas';

export type Signal = { text: string; tone: 'danger' | 'warning' | 'success' };
export type HealthLevel = 'Healthy' | 'Watch' | 'At risk';
export type Health = { level: HealthLevel; score: number; signals: Signal[] };

export const healthTone: Record<HealthLevel, 'success' | 'warning' | 'danger'> = { Healthy: 'success', Watch: 'warning', 'At risk': 'danger' };

/** Plain-language business health built from ERP activity. */
export function businessHealth(t: Tenant, openTickets: number): Health {
  const e = t.erp;
  const signals: Signal[] = [];
  let score = 100;
  const hit = (n: number, s: Signal) => {
    score -= n;
    signals.push(s);
  };
  if (t.account === 'Provisioning') return { level: 'Watch', score: 70, signals: [{ text: 'New account — owner hasn’t finished signing in yet.', tone: 'warning' }] };
  if (t.account === 'Suspended') hit(10, { text: 'Account is suspended.', tone: 'danger' });
  if (!e.lastSaleAt) hit(15, { text: 'No sale recorded yet.', tone: 'warning' });
  else {
    const d = daysBetween(e.lastSaleAt, NOW);
    if (d >= 7) hit(40, { text: `No sale in ${d} days, usually ${e.avgDailySales}/day.`, tone: 'danger' });
    else if (d >= 5) hit(30, { text: `No sale in ${d} days, usually ${e.avgDailySales}/day.`, tone: 'danger' });
    else if (d >= 2) hit(12, { text: `Last sale ${d} days ago.`, tone: 'warning' });
  }
  if (e.salesLastWeek > 0 && e.salesThisWeek < e.salesLastWeek * 0.7) {
    const pct = Math.round((1 - e.salesThisWeek / e.salesLastWeek) * 100);
    hit(15, { text: `Invoices down ${pct}% vs last week (${e.salesThisWeek} vs ${e.salesLastWeek}).`, tone: 'warning' });
  }
  if (t.scheduledChange?.kind === 'CANCEL') hit(20, { text: `Owner scheduled cancellation on ${fmtDate(t.scheduledChange.at)}.`, tone: 'danger' });
  if (e.openCashSessions >= 2) hit(8, { text: `${e.openCashSessions} cash sessions left open.`, tone: 'warning' });
  if (e.unreconciledAccounts > 0) hit(Math.min(15, e.unreconciledAccounts * 5), { text: `${e.unreconciledAccounts} money account${e.unreconciledAccounts > 1 ? 's' : ''} not reconciled.`, tone: 'warning' });
  if (e.negativeStock > 5) hit(8, { text: `${e.negativeStock} products below zero stock.`, tone: 'warning' });
  if (e.failedSms30d >= 10) hit(6, { text: `${e.failedSms30d} SMS failed in 30 days.`, tone: 'warning' });
  if (openTickets >= 2) hit(6, { text: `${openTickets} open support tickets.`, tone: 'warning' });
  if (signals.length === 0) signals.push({ text: `Selling steadily — ${e.salesThisWeek} invoices this week.`, tone: 'success' });
  const s = Math.max(0, score);
  return { level: s >= 75 ? 'Healthy' : s >= 50 ? 'Watch' : 'At risk', score: s, signals };
}

export type Setup = { done: number; total: number; pct: number; next: string | null; stuck: boolean };

export function setupProgress(t: Tenant): Setup {
  const total = setupSteps.length;
  const done = setupSteps.filter((s) => t.erp.setup[s.key]).length;
  const pct = Math.round((done / total) * 100);
  const next = setupSteps.find((s) => !t.erp.setup[s.key])?.label ?? null;
  const stuck = pct < 70 && daysBetween(t.createdAt, NOW) >= 3 && t.account === 'Active';
  return { done, total, pct, next, stuck };
}

export type Meter = { key: 'products' | 'users' | 'sms'; label: string; used: number; limit: number; pct: number };
export type PlanFit = { meters: Meter[]; suggestion: { plan: PlanCode; diff: number; reason: string } | null; atTop: boolean; smsLow: boolean; flagged: boolean };

export function planFit(t: Tenant, plan: PlanCode): PlanFit {
  const users = t.members.filter((m) => m.status === 'Active').length;
  const smsUsed30 = Object.values(t.erp.smsByEvent).reduce((n, v) => n + (v ?? 0), 0);
  const meters: Meter[] = [
    { key: 'products', label: 'Products', used: t.erp.productCount, limit: planProductLimit[plan], pct: Math.round((t.erp.productCount / planProductLimit[plan]) * 100) },
    { key: 'users', label: 'Users', used: users, limit: t.userLimit, pct: Math.round((users / Math.max(1, t.userLimit)) * 100) },
  ];
  if (smsUsed30 > 0) meters.push({ key: 'sms', label: 'SMS used vs balance (30 days)', used: smsUsed30, limit: Math.max(smsUsed30, t.smsAvailable), pct: Math.round((smsUsed30 / Math.max(1, smsUsed30 + t.smsAvailable)) * 100) });
  const over = meters.filter((m) => m.key !== 'sms' && m.pct >= 80);
  const idx = planOrder.indexOf(plan);
  const atTop = idx === planOrder.length - 1;
  const next = atTop ? null : planOrder[idx + 1];
  const suggestion = over.length && next ? { plan: next, diff: planPrice[next] - planPrice[plan], reason: over.map((m) => `${m.label} ${m.pct}%`).join(' · ') } : null;
  const smsLow = smsUsed30 > 0 && t.smsAvailable < smsUsed30 * 0.2;
  return { meters, suggestion, atTop, smsLow, flagged: over.length > 0 || smsLow };
}

export type ModuleRow = { key: ErpModule; label: string; allowed: boolean; uses: number; locked: number; status: 'Using' | 'Paid, unused' | 'Not used' | 'Locked — tried' | 'Locked' };

export function moduleAdoption(t: Tenant, activeFeatures: Set<string>): ModuleRow[] {
  return erpModules.map((m) => {
    const allowed = m.feature === null || activeFeatures.has(m.feature) || (m.key === 'reports' && ['reports.medium', 'reports.premium', 'reports.plus'].some((f) => activeFeatures.has(f)));
    const u = t.erp.modules[m.key] ?? { uses30d: 0, locked: 0 };
    const status: ModuleRow['status'] = allowed ? (u.uses30d > 0 ? 'Using' : m.feature ? 'Paid, unused' : 'Not used') : u.locked > 0 ? 'Locked — tried' : 'Locked';
    return { key: m.key, label: m.label, allowed, uses: u.uses30d, locked: u.locked, status };
  });
}
