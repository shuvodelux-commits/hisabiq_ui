import { useMemo } from 'react';
import { useSaas, effectivePlan } from '../../contexts/SaasContext';
import { NOW, NOW_TIME, addDays, daysBetween, fmtDate } from '../../utils/saas';
import { invoiceStatus, paymentChecks } from '../../utils/saasBilling';
import { businessHealth, planFit, setupProgress } from '../../utils/saasSignals';

export type WorkKind =
  | 'verify' | 'activate' | 'overdue' | 'refund' | 'renewal' | 'grace' | 'trial' | 'cancel' | 'planfit'
  | 'access' | 'ticket-new' | 'ticket-mine' | 'service' | 'sms-failed' | 'provider' | 'sender' | 'setup' | 'data' | 'health';

export type WorkItem = {
  id: string;
  kind: WorkKind;
  area: 'Revenue' | 'Customers' | 'Operations';
  tone: 'danger' | 'warning' | 'info';
  title: string;
  detail: string;
  tenantId: string | null;
  owner: string;
  action: string;
  ref: string;
  sort: string;
};

/** Role-aware queue: only items the signed-in person may act on, in their tenant scope. */
export function useWorkQueue(): WorkItem[] {
  const saas = useSaas();
  const { state, canFor, staff } = saas;
  return useMemo(() => {
    const items: WorkItem[] = [];
    const name = (id: string) => state.tenants.find((t) => t.id === id)?.name ?? id;
    const soon = addDays(NOW, 7);

    for (const o of state.orders) {
      if (o.state === 'VERIFICATION_PENDING' && canFor('payments.verify', o.tenantId)) {
        const { checks } = paymentChecks(o, state.statement, state.orders, state.settings);
        const err = checks.find((c) => c.level === 'error');
        const warn = checks.find((c) => c.level === 'warning');
        const mine = o.claimedBy === staff.name;
        items.push({ id: `v-${o.id}`, kind: 'verify', area: 'Revenue', tone: err ? 'danger' : warn ? 'warning' : 'info', title: `${o.method} ৳${o.total} · ${name(o.tenantId)}`, detail: `${o.id} · TRX ${o.reference} · ${err?.text ?? warn?.text ?? 'Statement matches'}`, tenantId: o.tenantId, owner: o.claimedBy ?? '', action: mine ? 'Continue review' : o.claimedBy ? `View (${o.claimedBy.split(' ')[0]})` : 'Claim & verify', ref: o.id, sort: `1${o.createdAt}` });
      }
      if (o.state === 'ACTIVATION_PENDING' && canFor('payments.verify', o.tenantId))
        items.push({ id: `a-${o.id}`, kind: 'activate', area: 'Revenue', tone: 'warning', title: `Paid, not activated · ${name(o.tenantId)}`, detail: `${o.id} · ${o.terms.benefit}`, tenantId: o.tenantId, owner: '', action: 'Activate', ref: o.id, sort: `1${o.createdAt}` });
      if (o.state === 'REFUND_PENDING' && canFor('payments.refund', o.tenantId))
        items.push({ id: `r-${o.id}`, kind: 'refund', area: 'Revenue', tone: 'warning', title: `Refund ৳${o.refund?.amount} to send · ${name(o.tenantId)}`, detail: `${o.id} · ${o.refund?.reason}`, tenantId: o.tenantId, owner: '', action: 'Mark money returned', ref: o.id, sort: `2${o.createdAt}` });
      if (invoiceStatus(o) === 'Overdue' && canFor('invoices.edit', o.tenantId))
        items.push({ id: `o-${o.id}`, kind: 'overdue', area: 'Revenue', tone: 'danger', title: `Overdue invoice ৳${o.total} · ${name(o.tenantId)}`, detail: `${o.id} · ${o.terms.name} · issued ${fmtDate(o.createdAt)}`, tenantId: o.tenantId, owner: '', action: 'Send reminder', ref: 'TPL-RENEW', sort: `2${o.createdAt}` });
    }

    for (const t of state.tenants) {
      if (t.account === 'Archived') continue;
      const plan = effectivePlan(t);
      const unpaid = state.orders.some((o) => o.tenantId === t.id && o.kind === 'SUBSCRIPTION' && ['PAYMENT_PENDING', 'VERIFICATION_PENDING', 'ACTIVATION_PENDING'].includes(o.state));
      if (t.status === 'Grace' && canFor('subscriptions.edit', t.id))
        items.push({ id: `g-${t.id}`, kind: 'grace', area: 'Customers', tone: 'danger', title: `Grace ends ${fmtDate(addDays(t.expiresAt ?? NOW, state.settings.graceDays))} · ${t.name}`, detail: `${t.planCode} ended ${fmtDate(t.expiresAt)}. ${t.reminders.length} reminder${t.reminders.length === 1 ? '' : 's'} sent.`, tenantId: t.id, owner: '', action: 'Send reminder', ref: 'TPL-GRACE', sort: `1${t.expiresAt}` });
      if (t.status === 'Trial' && t.expiresAt && t.expiresAt <= soon && canFor('subscriptions.edit', t.id))
        items.push({ id: `t-${t.id}`, kind: 'trial', area: 'Customers', tone: 'warning', title: `Trial ends ${fmtDate(t.expiresAt)} · ${t.name}`, detail: `${plan} trial · setup ${setupProgress(t).pct}%`, tenantId: t.id, owner: '', action: 'Send reminder', ref: 'TPL-RENEW', sort: `2${t.expiresAt}` });
      if (t.status === 'Active' && t.planCode !== 'FREE' && t.expiresAt && daysBetween(NOW, t.expiresAt) <= 5 && !unpaid && !t.scheduledChange && canFor('invoices.edit', t.id))
        items.push({ id: `n-${t.id}`, kind: 'renewal', area: 'Revenue', tone: 'info', title: `Renews ${fmtDate(t.expiresAt)} · ${t.name}`, detail: `${t.planCode} · no renewal invoice yet`, tenantId: t.id, owner: '', action: 'Create renewal invoice', ref: t.id, sort: `3${t.expiresAt}` });
      if (t.scheduledChange?.kind === 'CANCEL' && canFor('subscriptions.edit', t.id))
        items.push({ id: `c-${t.id}`, kind: 'cancel', area: 'Customers', tone: 'danger', title: `Cancelling ${fmtDate(t.scheduledChange.at)} · ${t.name}`, detail: `Scheduled by ${t.scheduledChange.by}. Talk to the owner before it ends.`, tenantId: t.id, owner: '', action: 'Send message', ref: 'TPL-RENEW', sort: `2${t.scheduledChange.at}` });
      const fit = planFit(t, plan);
      const nudged = state.nudges.some((n) => n.tenantId === t.id && n.templateId === 'TPL-UPGRADE' && daysBetween(n.at, NOW) < 7);
      if (fit.suggestion && !nudged && t.scheduledChange?.planCode !== fit.suggestion.plan && (canFor('invoices.edit', t.id) || canFor('subscriptions.edit', t.id)))
        items.push({ id: `p-${t.id}`, kind: 'planfit', area: 'Revenue', tone: 'info', title: `Near ${plan} limit · ${t.name}`, detail: `${fit.suggestion.reason} → suggest ${fit.suggestion.plan} (+৳${fit.suggestion.diff}/mo)`, tenantId: t.id, owner: '', action: 'Send upgrade nudge', ref: 'TPL-UPGRADE', sort: `4${t.id}` });
      const setup = setupProgress(t);
      const openSetup = state.services.some((s) => s.tenantId === t.id && s.packageId === 'PKG-SVC-CALL' && !['COMPLETED', 'CANCELLED'].includes(s.state));
      if (setup.stuck && !openSetup && (canFor('services.edit', t.id) || canFor('tickets.edit', t.id)))
        items.push({ id: `s-${t.id}`, kind: 'setup', area: 'Customers', tone: 'warning', title: `Stuck in setup (${setup.pct}%) · ${t.name}`, detail: `Next step: ${setup.next}`, tenantId: t.id, owner: '', action: 'Offer guided setup ৳399', ref: t.id, sort: `3${t.createdAt}` });
      const openTickets = state.tickets.filter((x) => x.tenantId === t.id && x.status !== 'Resolved').length;
      const h = businessHealth(t, openTickets);
      if (h.level === 'At risk' && (canFor('tickets.assign', t.id) || canFor('subscriptions.edit', t.id)))
        items.push({ id: `h-${t.id}`, kind: 'health', area: 'Customers', tone: 'danger', title: `At risk · ${t.name}`, detail: h.signals.filter((s) => s.tone !== 'success').map((s) => s.text).slice(0, 2).join(' '), tenantId: t.id, owner: '', action: 'Open business', ref: t.id, sort: `3${t.id}` });
    }

    for (const a of state.access)
      if (a.state === 'APPROVED' && canFor('support.access', a.tenantId)) {
        const left = a.expiresAt ? Math.max(0, Math.round((new Date(a.expiresAt).getTime() - new Date(NOW_TIME).getTime()) / 60000)) : 0;
        items.push({ id: `x-${a.id}`, kind: 'access', area: 'Operations', tone: 'warning', title: `Owner approved · ${name(a.tenantId)} · ${left} min left`, detail: a.changes.map((c) => `${c.setting}: ${c.before} → ${c.after}`).join('; '), tenantId: a.tenantId, owner: a.staffName, action: 'Apply change', ref: a.id, sort: `0${a.expiresAt}` });
      }

    for (const t of state.tickets) {
      if (t.status === 'Resolved' || !canFor('tickets.edit', t.tenantId)) continue;
      const breaching = t.slaDueAt <= addMinutes(NOW_TIME, 60);
      if (!t.assignee) items.push({ id: `k-${t.id}`, kind: 'ticket-new', area: 'Operations', tone: breaching ? 'danger' : 'warning', title: `${breaching ? 'SLA soon · ' : 'Unassigned · '}${t.subject}`, detail: `${t.id} · ${name(t.tenantId)} · ${t.priority} · via ${t.channel}`, tenantId: t.tenantId, owner: '', action: 'Assign to me', ref: t.id, sort: `1${t.slaDueAt}` });
      else if (t.status === 'Open') items.push({ id: `k-${t.id}`, kind: 'ticket-mine', area: 'Operations', tone: breaching ? 'danger' : 'info', title: `${breaching ? 'SLA soon · ' : ''}${t.subject}`, detail: `${t.id} · ${name(t.tenantId)} · ${t.priority} · ${t.assignee}`, tenantId: t.tenantId, owner: t.assignee, action: 'Reply', ref: t.id, sort: `1${t.slaDueAt}` });
    }

    for (const s of state.services)
      if ((s.state === 'REQUESTED' || s.state === 'APPROVED') && canFor('services.edit', s.tenantId))
        items.push({ id: `sv-${s.id}`, kind: 'service', area: 'Operations', tone: s.state === 'REQUESTED' ? 'warning' : 'info', title: `${s.title} · ${name(s.tenantId)}`, detail: `${s.id} · ${s.notes}`, tenantId: s.tenantId, owner: s.assignee, action: s.state === 'REQUESTED' ? 'Send quote' : 'Schedule', ref: s.id, sort: `2${s.requestedAt}` });

    for (const m of state.smsMessages)
      if (m.status === 'Failed' && canFor('sms.edit', m.tenantId))
        items.push({ id: `m-${m.id}`, kind: 'sms-failed', area: 'Operations', tone: 'warning', title: `SMS failed · ${name(m.tenantId)}`, detail: `${m.to} · ${m.provider} · ${m.text.slice(0, 48)}…`, tenantId: m.tenantId, owner: '', action: 'Retry', ref: m.id, sort: `2${m.at}` });
    for (const p of state.providers)
      if (p.status !== 'Healthy' && canFor('sms.edit'))
        items.push({ id: `pr-${p.id}`, kind: 'provider', area: 'Operations', tone: p.status === 'Down' ? 'danger' : 'warning', title: `${p.name} ${p.status.toLowerCase()}`, detail: `${p.deliveryRate}% delivered · ${p.latencySec}s latency`, tenantId: null, owner: '', action: 'Review SMS', ref: p.id, sort: `1${p.id}` });
    for (const r of state.senders)
      if (r.status === 'Pending' && canFor('sms.configure', r.tenantId))
        items.push({ id: `sn-${r.id}`, kind: 'sender', area: 'Operations', tone: 'info', title: `Sender name “${r.sender}” · ${name(r.tenantId)}`, detail: r.note, tenantId: r.tenantId, owner: '', action: 'Approve', ref: r.id, sort: `3${r.submittedAt}` });

    for (const d of state.dataRequests)
      if (['REQUESTED', 'CONSENTED', 'IN_PROGRESS'].includes(d.state) && canFor('data.manage', d.tenantId))
        items.push({ id: `d-${d.id}`, kind: 'data', area: 'Operations', tone: d.kind === 'CLOSURE' ? 'danger' : 'info', title: `${d.kind === 'EXPORT' ? 'Data export' : d.kind === 'RESTORE' ? 'Restore from recycle bin' : 'Account closure'} · ${name(d.tenantId)}`, detail: `Due ${fmtDate(d.dueAt)} · ${d.detail}`, tenantId: d.tenantId, owner: d.handledBy ?? '', action: d.state === 'REQUESTED' ? 'Simulate owner consent' : d.state === 'CONSENTED' ? 'Start' : 'Complete', ref: d.id, sort: `2${d.dueAt}` });

    return items.sort((a, b) => a.sort.localeCompare(b.sort));
  }, [state, canFor, staff.name]);
}

function addMinutes(iso: string, mins: number): string {
  const d = new Date(new Date(iso).getTime() + mins * 60000);
  const local = new Date(d.getTime() + 6 * 3600000).toISOString().slice(0, 19);
  return `${local}+06:00`;
}
