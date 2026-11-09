import type { PlanCode } from '../../types/experience';
import type { Entitlement, Result, Tenant } from '../../types/saas';
import { featureCatalog, planFeatures, planUserLimit } from '../../data/saasSeeds';
import { NOW, NOW_TIME, addDays, daysBetween, fmtDate, sid } from '../../utils/saas';
import type { SaasCore } from './useSaasCore';

export type EffectiveFeature = { feature: string; source: Entitlement['source']; status: Entitlement['status']; expiresAt: string | null; ref: string; note: string; id: string | null; scope: Entitlement['scope'] };

/** Expired businesses fall back to Free; records are never removed. */
export function effectivePlan(t: { status: string; planCode: PlanCode }): PlanCode {
  return t.status === 'Expired' ? 'FREE' : t.planCode;
}

export function useTenantCommands(core: SaasCore) {
  const { ref, commit, run, event, tenantById, staff } = core;

  const featuresFor = (tenantId: string): EffectiveFeature[] => {
    const t = tenantById(tenantId);
    if (!t) return [];
    const plan = effectivePlan(t);
    const paused = t.account === 'Suspended';
    const rows: EffectiveFeature[] = planFeatures[plan].map((f) => ({
      feature: f,
      source: t.status === 'Trial' ? 'TRIAL' : 'PLAN',
      status: paused ? 'Revoked' : 'Active',
      expiresAt: plan === 'FREE' ? null : t.expiresAt,
      ref: t.status === 'Trial' ? `${plan} trial` : `${plan} plan`,
      note: paused ? 'Paused while suspended' : '',
      id: null,
      scope: 'Business',
    }));
    for (const e of ref.current.entitlements.filter((x) => x.tenantId === tenantId)) {
      const expired = e.status === 'Active' && e.expiresAt !== null && e.expiresAt < NOW;
      rows.push({ feature: e.feature, source: e.source, status: expired ? 'Expired' : e.status, expiresAt: e.expiresAt, ref: e.ref, note: e.note, id: e.id, scope: e.scope });
    }
    return rows;
  };

  const setAccount = (tenantId: string, action: 'suspend' | 'reactivate' | 'archive', reason: string): Result =>
    run({ perm: 'tenants.edit', tenantId, what: 'change account access' }, () => {
      const s = ref.current;
      const t = tenantById(tenantId);
      if (!t) return { ok: false, message: 'Business not found.' };
      if (!reason.trim()) return { ok: false, message: 'Enter a reason for the audit log.' };
      if (action === 'archive') {
        const unpaid = s.orders.filter((o) => o.tenantId === tenantId && ['PAYMENT_PENDING', 'VERIFICATION_PENDING', 'ACTIVATION_PENDING'].includes(o.state)).length;
        const open = s.tickets.filter((x) => x.tenantId === tenantId && x.status !== 'Resolved').length + s.services.filter((x) => x.tenantId === tenantId && !['COMPLETED', 'CANCELLED'].includes(x.state)).length;
        if (unpaid || open) return { ok: false, message: `Can’t archive yet: ${unpaid} unpaid invoice${unpaid === 1 ? '' : 's'}, ${open} open ticket or service item${open === 1 ? '' : 's'}.` };
      }
      if (action === 'reactivate' && t.account === 'Active') return { ok: false, message: 'Already active.' };
      const account = action === 'suspend' ? 'Suspended' : action === 'archive' ? 'Archived' : 'Active';
      commit((x) => ({ ...x, tenants: x.tenants.map((y) => (y.id === tenantId ? { ...y, account } : y)), audit: [event(tenantId, `tenant.${action}`, `Account ${t.account} → ${account}`, `Reason: ${reason.trim()}`), ...x.audit] }));
      return { ok: true, message: action === 'suspend' ? 'Suspended. Sign-in and purchases are blocked; records kept.' : action === 'archive' ? 'Archived. Books kept read-only.' : 'Reactivated.' };
    });

  const resendInvite = (tenantId: string): Result =>
    run({ perm: 'tenants.edit', tenantId, what: 'resend invitations' }, () => {
      const t = tenantById(tenantId);
      if (!t) return { ok: false, message: 'Business not found.' };
      commit((x) => ({ ...x, audit: [event(tenantId, 'tenant.invite.resent', `Invitation SMS sent again to ${t.phone}`), ...x.audit] }));
      return { ok: true, message: `Invitation sent again to ${t.owner} (${t.phone}).` };
    });

  const simulateExpiry = (tenantId: string): Result =>
    run({ perm: ['tenants.edit', 'subscriptions.edit'], tenantId, what: 'simulate plan expiry' }, () => {
      const t = tenantById(tenantId);
      if (!t || t.planCode === 'FREE' || t.status === 'Expired') return { ok: false, message: 'Nothing to expire.' };
      const kept = ref.current.entitlements.filter((e) => e.tenantId === tenantId && e.status === 'Active' && (!e.expiresAt || e.expiresAt >= NOW));
      const active = t.members.filter((m) => m.status === 'Active');
      const ownerId = active.find((m) => m.role === 'Owner')?.id;
      const paused = Math.max(0, active.length - planUserLimit.FREE);
      const note = `${t.planCode} ended ${fmtDate(NOW)}. All records kept. Now on Free${kept.length ? `; still active: ${kept.map((e) => featureCatalog.find((f) => f.key === e.feature)?.label ?? e.feature).join(', ')}` : ''}${paused ? `; ${paused} user${paused > 1 ? 's' : ''} paused` : ''}.`;
      commit((s) => ({
        ...s,
        tenants: s.tenants.map((x) => (x.id === tenantId ? { ...x, status: 'Expired', expiresAt: NOW, userLimit: planUserLimit.FREE, expiryNote: note, scheduledChange: null, members: x.members.map((m) => (m.status === 'Active' && m.id !== ownerId ? { ...m, status: 'Disabled' } : m)) } : x)),
        audit: [event(tenantId, 'subscription.expired', note, undefined, 'System'), ...s.audit],
      }));
      return { ok: true, message: note };
    });

  const grant = (input: { tenantId: string; feature: string; kind: 'TRIAL' | 'GRANT'; days: number; reason: string; memberId?: string | null }): Result =>
    run({ perm: input.kind === 'TRIAL' ? 'grants.trial' : 'grants.issue', tenantId: input.tenantId, what: input.kind === 'TRIAL' ? 'start trials' : 'issue complimentary grants' }, () => {
      if (!input.reason.trim()) return { ok: false, message: 'A reason is required for the audit log.' };
      if (input.days < 1 || input.days > (input.kind === 'TRIAL' ? 30 : 365)) return { ok: false, message: input.kind === 'TRIAL' ? 'Trials run 1–30 days.' : 'Grants run 1–365 days.' };
      if (featuresFor(input.tenantId).some((f) => f.feature === input.feature && f.status === 'Active')) return { ok: false, message: 'This business already has that feature active.' };
      const past = ref.current.entitlements.filter((e) => e.tenantId === input.tenantId && e.feature === input.feature && e.source === 'TRIAL');
      if (input.kind === 'TRIAL' && input.feature === 'reports.plus') {
        const recent = past.find((e) => daysBetween(e.startsAt, NOW) < 90);
        if (recent) return { ok: false, message: `Complimentary Reports Plus was given on ${fmtDate(recent.startsAt)}. Allowed once every 90 days.` };
      } else if (input.kind === 'TRIAL' && past.length) return { ok: false, message: 'A trial for this feature was already used.' };
      const e: Entitlement = {
        id: sid('E'), tenantId: input.tenantId, feature: input.feature, source: input.kind, scope: input.memberId ? 'Member' : 'Business', memberId: input.memberId ?? undefined,
        status: 'Active', startsAt: NOW, expiresAt: addDays(NOW, input.days), ref: sid(input.kind === 'TRIAL' ? 'TR' : 'GR'), note: input.reason.trim(), grantedBy: staff.name,
      };
      const label = featureCatalog.find((f) => f.key === input.feature)?.label ?? input.feature;
      commit((s) => ({ ...s, entitlements: [e, ...s.entitlements], audit: [event(input.tenantId, input.kind === 'TRIAL' ? 'entitlement.trial.granted' : 'entitlement.grant.issued', `${label} · ${input.days} days`, `Reason: ${input.reason}`), ...s.audit] }));
      return { ok: true, message: `${label} active until ${fmtDate(e.expiresAt)}.` };
    });

  const revokeEntitlement = (id: string, reason: string): Result => {
    const e = ref.current.entitlements.find((x) => x.id === id);
    if (!e) return { ok: false, message: 'Not found.' };
    return run({ perm: e.source === 'TRIAL' ? 'grants.trial' : 'grants.issue', tenantId: e.tenantId, what: 'revoke this entitlement' }, () => {
      if (e.source === 'PURCHASE') return { ok: false, message: 'Purchased features are removed through a refund, not revoked.' };
      if (!reason.trim()) return { ok: false, message: 'Enter a reason.' };
      commit((s) => ({ ...s, entitlements: s.entitlements.map((x) => (x.id === id ? { ...x, status: 'Revoked' } : x)), audit: [event(e.tenantId, 'entitlement.revoked', `${e.feature} (${e.ref})`, `Reason: ${reason}`), ...s.audit] }));
      return { ok: true, message: 'Revoked.' };
    });
  };

  /* ---------------- Subscriptions ---------------- */
  const extendTrial = (tenantId: string, reason: string): Result =>
    run({ perm: 'subscriptions.edit', tenantId, what: 'extend trials' }, () => {
      const t = tenantById(tenantId);
      if (!t || t.status !== 'Trial' || !t.expiresAt) return { ok: false, message: 'Only businesses on a trial can be extended.' };
      if (t.trialExtendedAt && daysBetween(t.trialExtendedAt, NOW) < 90) return { ok: false, message: `Trial was already extended on ${fmtDate(t.trialExtendedAt)}. Allowed once every 90 days.` };
      if (!reason.trim()) return { ok: false, message: 'Enter a reason.' };
      const until = addDays(t.expiresAt, 7);
      commit((s) => ({ ...s, tenants: s.tenants.map((x) => (x.id === tenantId ? { ...x, expiresAt: until, trialExtendedAt: NOW } : x)), audit: [event(tenantId, 'subscription.trial.extended', `Trial +7 days → ${fmtDate(until)}`, `Reason: ${reason}`), ...s.audit] }));
      return { ok: true, message: `Trial extended to ${fmtDate(until)}.` };
    });

  const scheduleChange = (tenantId: string, kind: 'PLAN' | 'CANCEL', planCode?: PlanCode): Result =>
    run({ perm: 'subscriptions.edit', tenantId, what: 'schedule subscription changes' }, () => {
      const t = tenantById(tenantId);
      if (!t || !t.expiresAt || t.planCode === 'FREE') return { ok: false, message: 'Only paid or trial plans renew.' };
      if (kind === 'PLAN' && (!planCode || planCode === t.planCode)) return { ok: false, message: 'Pick a different plan.' };
      commit((s) => ({
        ...s,
        tenants: s.tenants.map((x) => (x.id === tenantId ? { ...x, scheduledChange: { kind, planCode, at: t.expiresAt!, by: staff.name } } : x)),
        audit: [event(tenantId, kind === 'PLAN' ? 'subscription.change.scheduled' : 'subscription.cancel.scheduled', kind === 'PLAN' ? `${t.planCode} → ${planCode} at renewal ${fmtDate(t.expiresAt)}` : `Cancels at ${fmtDate(t.expiresAt)}; moves to Free, records kept`), ...s.audit],
      }));
      return { ok: true, message: kind === 'PLAN' ? `Changes to ${planCode} on ${fmtDate(t.expiresAt)}.` : `Cancels on ${fmtDate(t.expiresAt)}. Nothing changes until then.` };
    });

  const undoScheduled = (tenantId: string): Result =>
    run({ perm: 'subscriptions.edit', tenantId, what: 'undo scheduled changes' }, () => {
      const t = tenantById(tenantId);
      if (!t?.scheduledChange) return { ok: false, message: 'Nothing scheduled.' };
      commit((s) => ({ ...s, tenants: s.tenants.map((x) => (x.id === tenantId ? { ...x, scheduledChange: null } : x)), audit: [event(tenantId, 'subscription.schedule.undone', `Removed scheduled ${t.scheduledChange!.kind === 'PLAN' ? `change to ${t.scheduledChange!.planCode}` : 'cancellation'}`), ...s.audit] }));
      return { ok: true, message: 'Scheduled change removed.' };
    });

  const sendNudge = (tenantId: string, templateId: string): Result =>
    run({ perm: ['subscriptions.edit', 'invoices.edit', 'tickets.edit', 'services.edit'], tenantId, what: 'message business owners' }, () => {
      const t = tenantById(tenantId);
      const tpl = ref.current.templates.find((x) => x.id === templateId);
      if (!t || !tpl) return { ok: false, message: 'Choose a message.' };
      const sentToday = t.reminders.some((r) => r.template === tpl.name && r.at.slice(0, 10) === NOW);
      if (sentToday) return { ok: false, message: `“${tpl.name}” was already sent today.` };
      commit((s) => ({
        ...s,
        tenants: s.tenants.map((x) => (x.id === tenantId ? { ...x, reminders: [{ at: NOW_TIME, channel: tpl.channel, template: tpl.name, by: staff.name }, ...x.reminders] } : x)),
        nudges: [{ id: sid('NG'), tenantId, templateId, at: NOW_TIME, by: staff.name, outcome: 'Sent' }, ...s.nudges],
        audit: [event(tenantId, 'owner.message.sent', `${tpl.channel}: ${tpl.name}`), ...s.audit],
      }));
      return { ok: true, message: `${tpl.channel === 'SMS' ? 'SMS' : 'In-app message'} sent to ${t.owner}.` };
    });

  const createTenant = (input: { name: string; owner: string; phone: string; district: string; businessType: Tenant['businessType'] }): Result =>
    run({ perm: 'tenants.edit', tenantId: null, what: 'create businesses' }, () => {
      if (!input.name.trim() || !input.owner.trim()) return { ok: false, message: 'Enter the business and owner names.' };
      if (!/^01[3-9]\d{2}-?\d{6}$/.test(input.phone.trim())) return { ok: false, message: 'Enter an 11-digit mobile number, e.g. 01711-234567.' };
      if (ref.current.tenants.some((t) => t.phone.replace('-', '') === input.phone.trim().replace('-', ''))) return { ok: false, message: 'A business with this owner phone already exists.' };
      const id = `T-${1001 + ref.current.tenants.length}`;
      const steps = { profile: false, invoice: false, product: false, openingStock: false, firstSale: false, firstPurchase: false, cashSession: false, moneyAccounts: false, team: false };
      const t: Tenant = {
        id, name: input.name.trim(), owner: input.owner.trim(), phone: input.phone.trim(), email: '', district: input.district.trim() || 'Dhaka', businessType: input.businessType,
        planCode: 'PRO', status: 'Trial', account: 'Provisioning', invite: 'Pending', expiresAt: addDays(NOW, 14), createdAt: NOW, lastActive: NOW_TIME, userLimit: planUserLimit.PRO,
        smsAvailable: 0, smsReserved: 0, storageUsedMb: 0, storageLimitMb: 5120, monthlyInvoices: 0,
        settings: { invoicePrefix: 'INV', language: 'English + Bangla', lockMinutes: 30, smsSender: '', allowNegativeStock: false, dueReminders: true },
        members: [{ id: 'M-1', name: input.owner.trim(), role: 'Owner', phone: input.phone.trim(), status: 'Active', lastSeen: NOW_TIME }],
        erp: { productCount: 0, lastSaleAt: null, salesThisWeek: 0, salesLastWeek: 0, avgDailySales: 0, openCashSessions: 0, unreconciledAccounts: 0, negativeStock: 0, failedSms30d: 0, setup: steps, modules: {}, smsByEvent: {} },
        scheduledChange: null, reminders: [],
      };
      commit((s) => ({ ...s, tenants: [t, ...s.tenants], audit: [event(id, 'tenant.created', `${t.name} created · Pro trial 14 days · invite sent to ${t.phone}`), ...s.audit] }));
      return { ok: true, message: `${t.name} created. Invitation SMS sent to ${t.phone}.`, id };
    });

  const updateSettings = (tenantId: string, next: Tenant['settings']): Result =>
    run({ perm: 'tenants.edit', tenantId, what: 'change business settings' }, () => {
      const t = tenantById(tenantId);
      if (!t) return { ok: false, message: 'Business not found.' };
      if (!/^[A-Z0-9-]{1,6}$/.test(next.invoicePrefix)) return { ok: false, message: 'Invoice prefix: 1–6 letters or numbers.' };
      if (!(next.lockMinutes >= 1 && next.lockMinutes <= 240)) return { ok: false, message: 'Screen lock must be 1–240 minutes.' };
      const changed = (Object.keys(next) as (keyof Tenant['settings'])[]).filter((k) => next[k] !== t.settings[k]);
      if (!changed.length) return { ok: false, message: 'Nothing changed.' };
      commit((s) => ({ ...s, tenants: s.tenants.map((x) => (x.id === tenantId ? { ...x, settings: next } : x)), audit: [event(tenantId, 'tenant.settings.updated', changed.map((k) => `${k}: ${String(t.settings[k])} → ${String(next[k])}`).join('; ')), ...s.audit] }));
      return { ok: true, message: 'Settings saved.' };
    });

  const saveMember = (tenantId: string, m: Tenant['members'][number]): Result =>
    run({ perm: 'tenants.edit', tenantId, what: 'manage business members' }, () => {
      const t = tenantById(tenantId);
      if (!t) return { ok: false, message: 'Business not found.' };
      if (!m.name.trim()) return { ok: false, message: 'Enter a name.' };
      if (!/^01[3-9]\d{2}-?\d{6}$/.test(m.phone.trim())) return { ok: false, message: 'Enter an 11-digit mobile number.' };
      const exists = t.members.some((x) => x.id === m.id);
      const next = exists ? t.members.map((x) => (x.id === m.id ? m : x)) : [...t.members, m];
      if (next.filter((x) => x.status === 'Active').length > t.userLimit) return { ok: false, message: `The plan allows ${t.userLimit} active users. Pause someone or upgrade.` };
      if (!next.some((x) => x.role === 'Owner' && x.status === 'Active')) return { ok: false, message: 'Keep at least one active Owner.' };
      commit((s) => ({ ...s, tenants: s.tenants.map((x) => (x.id === tenantId ? { ...x, members: next } : x)), audit: [event(tenantId, exists ? 'tenant.member.updated' : 'tenant.member.added', `${m.name} · ${m.role} · ${m.status}`), ...s.audit] }));
      return { ok: true, message: exists ? 'Member updated.' : `${m.name} added. Invitation SMS sent.` };
    });

  return { createTenant, updateSettings, saveMember, featuresFor, setAccount, resendInvite, simulateExpiry, grant, revokeEntitlement, extendTrial, scheduleChange, undoScheduled, sendNudge };
}
