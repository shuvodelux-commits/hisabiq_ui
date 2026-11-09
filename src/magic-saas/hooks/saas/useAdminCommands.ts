import type { Announcement, AnnouncementState, MessageTemplate, PlatformSettings, Result, StaffMember } from '../../types/saas';
import { NOW, NOW_TIME } from '../../utils/saas';
import type { SaasCore } from './useSaasCore';

/** SMS operations, announcements, team and platform settings. */
export function useAdminCommands(core: SaasCore) {
  const { ref, commit, run, event, staff } = core;

  /* ---------------- SMS ---------------- */
  const setTariff = (id: string, cost: number, confirmed: boolean): Result =>
    run({ perm: 'sms.configure', tenantId: null, what: 'change tariffs' }, () => {
      if (!(cost > 0) || cost > 5) return { ok: false, message: 'Enter a cost between ৳0.01 and ৳5 per segment.' };
      commit((s) => ({ ...s, tariffs: s.tariffs.map((t) => (t.id === id ? { ...t, costPerSegment: cost, confirmed, effectiveFrom: NOW } : t)), audit: [event(null, 'sms.tariff.updated', `${id}: ৳${cost}/segment${confirmed ? ' (supplier-confirmed)' : ' (estimate)'}`), ...s.audit] }));
      return { ok: true, message: 'Tariff updated for new margin checks.' };
    });

  const decideSender = (id: string, approve: boolean, note: string): Result => {
    const r = ref.current.senders.find((x) => x.id === id);
    if (!r || r.status !== 'Pending') return { ok: false, message: 'Not pending.' };
    return run({ perm: 'sms.configure', tenantId: r.tenantId, what: 'decide sender names' }, () => {
      if (!approve && !note.trim()) return { ok: false, message: 'Explain the rejection to the business.' };
      commit((s) => ({
        ...s,
        senders: s.senders.map((x) => (x.id === id ? { ...x, status: approve ? 'Approved' : 'Rejected', note: note.trim() || 'Approved' } : x)),
        tenants: approve ? s.tenants.map((t) => (t.id === r.tenantId ? { ...t, settings: { ...t.settings, smsSender: r.sender } } : t)) : s.tenants,
        audit: [event(r.tenantId, approve ? 'sms.sender.approved' : 'sms.sender.rejected', `${r.sender}${note ? ` — ${note}` : ''}`), ...s.audit],
      }));
      return { ok: true, message: approve ? `${r.sender} approved.` : 'Rejected. The business sees your note.' };
    });
  };

  const setMargin = (pct: number): Result =>
    run({ perm: 'sms.configure', tenantId: null, what: 'change the margin threshold' }, () => {
      if (!(pct >= 0 && pct <= 90)) return { ok: false, message: 'Use 0–90%.' };
      commit((s) => ({ ...s, marginThreshold: pct, audit: [event(null, 'pricing.margin.updated', `Margin warning at ${pct}%`), ...s.audit] }));
      return { ok: true, message: 'Saved.' };
    });

  /** Retries through the healthiest provider. Credits are only charged once. */
  const retryMessage = (id: string): Result => {
    const m = ref.current.smsMessages.find((x) => x.id === id);
    if (!m) return { ok: false, message: 'Message not found.' };
    return run({ perm: 'sms.edit', tenantId: m.tenantId, what: 'retry messages', once: `retry:${id}:${m.retries ?? 0}` }, () => {
      if (m.status !== 'Failed') return { ok: false, message: 'Only failed messages can be retried.' };
      if ((m.retries ?? 0) >= 3) return { ok: false, message: 'Retried 3 times. Release the credits instead.' };
      const best = [...ref.current.providers].sort((a, b) => b.deliveryRate - a.deliveryRate)[0];
      const ok = best.status !== 'Down';
      commit((s) => ({
        ...s,
        smsMessages: s.smsMessages.map((x) => (x.id === id ? { ...x, status: ok ? 'Delivered' : 'Failed', provider: best.name, retries: (x.retries ?? 0) + 1, at: NOW_TIME } : x)),
        audit: [event(m.tenantId, 'sms.retried', `${id} via ${best.name} — ${ok ? 'delivered' : 'failed again'}`), ...s.audit],
      }));
      return ok ? { ok: true, message: `Delivered via ${best.name}. No extra credits charged.` } : { ok: false, message: 'Failed again. Try later.' };
    });
  };

  const saveTemplate = (t: MessageTemplate): Result =>
    run({ perm: ['announcements.edit', 'sms.edit'], tenantId: null, what: 'edit message templates' }, () => {
      if (!t.name.trim() || !t.text.trim()) return { ok: false, message: 'Add a name and message.' };
      commit((s) => ({ ...s, templates: s.templates.some((x) => x.id === t.id) ? s.templates.map((x) => (x.id === t.id ? t : x)) : [...s.templates, t], audit: [event(null, 'template.saved', `${t.name} (${t.channel})`), ...s.audit] }));
      return { ok: true, message: 'Template saved.' };
    });

  /* ---------------- Announcements ---------------- */
  const reachOf = (a: Announcement) => ref.current.tenants.filter((t) => t.account === 'Active' && (a.tenantIds.length ? a.tenantIds.includes(t.id) : a.plans.includes(t.status === 'Expired' ? 'FREE' : t.planCode))).length;

  const saveAnnouncement = (a: Announcement): Result =>
    run({ perm: 'announcements.edit', tenantId: null, what: 'edit announcements' }, () => {
      if (!a.title.trim() || !a.body.trim()) return { ok: false, message: 'Add a title and message.' };
      if (!a.plans.length && !a.tenantIds.length) return { ok: false, message: 'Choose at least one plan or business.' };
      const next = { ...a, state: 'DRAFT' as const, createdBy: a.createdBy || staff.name };
      commit((s) => ({ ...s, announcements: s.announcements.some((x) => x.id === a.id) ? s.announcements.map((x) => (x.id === a.id ? next : x)) : [next, ...s.announcements], audit: [event(null, 'announcement.saved', a.title), ...s.audit] }));
      return { ok: true, message: `Draft saved. Will reach about ${reachOf(a)} businesses.` };
    });

  const setAnnouncementState = (id: string, next: AnnouncementState): Result =>
    run({ perm: 'announcements.edit', tenantId: null, what: 'schedule announcements' }, () => {
      const a = ref.current.announcements.find((x) => x.id === id);
      if (!a) return { ok: false, message: 'Not found.' };
      const allowed: Record<AnnouncementState, AnnouncementState[]> = { DRAFT: ['SCHEDULED', 'CANCELLED'], SCHEDULED: ['DELIVERED', 'CANCELLED', 'DRAFT'], DELIVERED: [], CANCELLED: [] };
      if (!allowed[a.state].includes(next)) return { ok: false, message: 'That step isn’t possible now.' };
      if (next === 'SCHEDULED' && a.scheduledAt < NOW_TIME) return { ok: false, message: 'Pick a send time in the future.' };
      commit((s) => ({ ...s, announcements: s.announcements.map((x) => (x.id === id ? { ...x, state: next, reach: next === 'DELIVERED' ? reachOf(x) : x.reach } : x)), audit: [event(null, `announcement.${next.toLowerCase()}`, a.title), ...s.audit] }));
      return { ok: true, message: next === 'DELIVERED' ? `Delivered to ${reachOf(a)} businesses (simulated).` : next === 'SCHEDULED' ? 'Scheduled.' : next === 'CANCELLED' ? 'Cancelled.' : 'Moved back to draft.' };
    });

  /* ---------------- Team ---------------- */
  const activeSupers = (list: StaffMember[]) => list.filter((m) => m.status === 'Active' && m.assignments.some((a) => a.roleId === 'SUPER_ADMIN' && a.scope === 'ALL')).length;

  const saveStaff = (m: StaffMember): Result =>
    run({ perm: 'team.edit', tenantId: null, what: 'manage staff' }, () => {
      const list = ref.current.staff;
      if (!m.name.trim()) return { ok: false, message: 'Enter a name.' };
      if (!/^[^@\s]+@hisabiq\.com$/.test(m.email.trim())) return { ok: false, message: 'Use a @hisabiq.com email address.' };
      if (list.some((x) => x.id !== m.id && x.email === m.email.trim())) return { ok: false, message: 'Someone already uses this email.' };
      if (!m.assignments.length) return { ok: false, message: 'Give at least one role.' };
      if (m.assignments.some((a) => a.scope !== 'ALL' && a.scope.length === 0)) return { ok: false, message: 'Pick businesses for each limited role, or choose all businesses.' };
      if (new Set(m.assignments.map((a) => a.roleId)).size !== m.assignments.length) return { ok: false, message: 'Each role can only be assigned once per person.' };
      const next = list.some((x) => x.id === m.id) ? list.map((x) => (x.id === m.id ? m : x)) : [...list, m];
      if (activeSupers(next) < 1) return { ok: false, message: 'Keep at least one active Super Admin with all businesses.' };
      commit((s) => ({ ...s, staff: next, audit: [event(null, 'team.staff.saved', `${m.name}: ${m.assignments.map((a) => `${a.roleId}${a.scope === 'ALL' ? '' : ` (${a.scope.length} businesses)`}`).join(', ')}`), ...s.audit] }));
      return { ok: true, message: `${m.name} saved. Access updates immediately.` };
    });

  const setStaffStatus = (id: string, status: StaffMember['status']): Result =>
    run({ perm: 'team.edit', tenantId: null, what: 'manage staff' }, () => {
      if (id === staff.id && status === 'Disabled') return { ok: false, message: 'You can’t disable yourself.' };
      const next = ref.current.staff.map((x) => (x.id === id ? { ...x, status } : x));
      if (activeSupers(next) < 1) return { ok: false, message: 'Keep at least one active Super Admin.' };
      const m = ref.current.staff.find((x) => x.id === id);
      commit((s) => ({ ...s, staff: next, audit: [event(null, 'team.staff.status', `${m?.name}: ${status}`), ...s.audit] }));
      return { ok: true, message: status === 'Disabled' ? 'Disabled. Sign-in blocked; history kept.' : 'Re-enabled.' };
    });

  /* ---------------- Platform settings ---------------- */
  const updatePlatformSettings = (patch: Partial<PlatformSettings>): Result =>
    run({ perm: 'settings.edit', tenantId: null, what: 'change platform settings' }, () => {
      const next = { ...ref.current.settings, ...patch };
      if (!(next.graceDays >= 0 && next.graceDays <= 30)) return { ok: false, message: 'Grace period must be 0–30 days.' };
      if (!next.collectionAccounts.some((a) => a.active)) return { ok: false, message: 'Keep at least one collection account active.' };
      if (next.collectionAccounts.some((a) => !a.number.trim())) return { ok: false, message: 'Every collection account needs a number.' };
      commit((s) => ({ ...s, settings: next, audit: [event(null, 'settings.updated', Object.keys(patch).join(', ')), ...s.audit] }));
      return { ok: true, message: 'Platform settings saved.' };
    });

  return { setTariff, decideSender, setMargin, retryMessage, saveTemplate, saveAnnouncement, setAnnouncementState, saveStaff, setStaffStatus, updatePlatformSettings };
}
