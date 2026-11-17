import type { Article, DataRequestState, Result, ServiceOrder, ServiceState, SupportAccess, Ticket, TenantSettings } from '../../types/saas';
import { NOW_TIME, fmtDateTime, sid } from '../../utils/saas';
import type { SaasCore } from './useSaasCore';

const APPROVAL_UNTIL = '2026-10-25T10:45:00+06:00';

/** ERP settings that support access can actually write back in this prototype. */
function settingPatch(setting: string, after: string): Partial<TenantSettings> | null {
  if (setting === 'Invoices › Prefix') return { invoicePrefix: after };
  if (setting === 'Notifications › Due reminders') return { dueReminders: after === 'On' };
  if (setting === 'Products › Allow negative stock') return { allowNegativeStock: after === 'On' };
  if (setting === 'General › Language') return { language: after as TenantSettings['language'] };
  return null;
}

const serviceNext: Record<ServiceState, ServiceState[]> = {
  REQUESTED: ['QUOTED', 'CANCELLED'],
  QUOTED: ['APPROVED', 'CANCELLED'],
  APPROVED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function useSupportCommands(core: SaasCore) {
  const { ref, commit, run, event, tenantById, staff, canFor } = core;

  /* ---------------- Support access ---------------- */
  const requestAccess = (input: Omit<SupportAccess, 'id' | 'staffName' | 'staffId' | 'state' | 'requestedAt' | 'expiresAt'>): Result =>
    run({ perm: 'support.access', tenantId: input.tenantId, what: 'request support access' }, () => {
      if (!input.ticketId) return { ok: false, message: 'Link a ticket.' };
      if (!input.reason.trim()) return { ok: false, message: 'Explain why the change is needed.' };
      if (!input.changes.length || input.changes.some((c) => !c.after.trim() || c.before === c.after)) return { ok: false, message: 'Pick a new value that differs from the current one.' };
      const a: SupportAccess = { ...input, id: sid('SA'), staffName: staff.name, staffId: staff.staffId, state: 'REQUESTED', requestedAt: NOW_TIME, expiresAt: null };
      commit((s) => ({ ...s, access: [a, ...s.access], audit: [event(a.tenantId, 'support.access.requested', a.changes.map((c) => `${c.setting}: ${c.before} → ${c.after}`).join('; '), a.ticketId), ...s.audit] }));
      return { ok: true, message: 'Consent requested. The owner sees the exact change in Settings › Support.' };
    });

  /** Prototype stand-in for the owner's decision inside the merchant app. */
  const ownerDecision = (id: string, approve: boolean): Result => {
    const a = ref.current.access.find((x) => x.id === id);
    if (!a || a.state !== 'REQUESTED') return { ok: false, message: 'Request isn’t waiting for the owner.' };
    const owner = tenantById(a.tenantId)?.owner ?? 'Owner';
    commit((s) => ({
      ...s,
      access: s.access.map((x) => (x.id === id ? { ...x, state: approve ? 'APPROVED' : 'DECLINED', decidedBy: owner, expiresAt: approve ? APPROVAL_UNTIL : null } : x)),
      audit: [event(a.tenantId, approve ? 'support.access.approved' : 'support.access.declined', `${a.id} by owner`, undefined, `${owner} (owner)`), ...s.audit],
    }));
    return { ok: true, message: approve ? 'Owner approved once — valid 15 minutes.' : 'Owner declined. Nothing changes.' };
  };

  const applyAccess = (id: string): Result => {
    const a = ref.current.access.find((x) => x.id === id);
    if (!a) return { ok: false, message: 'Not found.' };
    return run({ perm: 'support.access', tenantId: a.tenantId, what: 'apply support changes', once: `access:${id}` }, () => {
      if (a.state === 'APPLIED') return { ok: false, message: 'Already applied. Approval is single-use.' };
      if (a.state !== 'APPROVED') return { ok: false, message: 'Owner approval is required first.' };
      if (a.expiresAt && a.expiresAt < NOW_TIME) {
        commit((s) => ({ ...s, access: s.access.map((x) => (x.id === id ? { ...x, state: 'EXPIRED' } : x)) }));
        return { ok: false, message: 'Approval expired. Send a new request.' };
      }
      const patch = a.changes.reduce<Partial<TenantSettings>>((p, c) => ({ ...p, ...(settingPatch(c.setting, c.after) ?? {}) }), {});
      commit((s) => ({
        ...s,
        access: s.access.map((x) => (x.id === id ? { ...x, state: 'APPLIED' } : x)),
        tenants: Object.keys(patch).length ? s.tenants.map((t) => (t.id === a.tenantId ? { ...t, settings: { ...t.settings, ...patch } } : t)) : s.tenants,
        audit: [event(a.tenantId, 'support.access.applied', a.changes.map((c) => `${c.setting}: ${c.before} → ${c.after}`).join('; '), a.ticketId), ...s.audit],
      }));
      return { ok: true, message: 'Change applied. The owner can undo it from Recent changes.' };
    });
  };

  const withdrawAccess = (id: string): Result => {
    const a = ref.current.access.find((x) => x.id === id);
    if (!a || (a.state !== 'REQUESTED' && a.state !== 'APPROVED')) return { ok: false, message: 'Nothing to withdraw.' };
    return run({ perm: 'support.access', tenantId: a.tenantId, what: 'withdraw support requests' }, () => {
      commit((s) => ({ ...s, access: s.access.map((x) => (x.id === id ? { ...x, state: 'REVOKED' } : x)), audit: [event(a.tenantId, 'support.access.withdrawn', a.id), ...s.audit] }));
      return { ok: true, message: 'Request withdrawn.' };
    });
  };

  const logDiagnosticsView = (tenantId: string) => {
    if (canFor('support.diagnostics', tenantId)) commit((s) => ({ ...s, audit: [event(tenantId, 'diagnostics.viewed', 'Opened restricted diagnostics'), ...s.audit] }));
  };

  /* ---------------- Tickets ---------------- */
  const ticketById = (id: string) => ref.current.tickets.find((x) => x.id === id);
  const patchTicket = (id: string, patch: Partial<Ticket>, summary: string, tenantId: string) =>
    commit((s) => ({ ...s, tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: NOW_TIME } : t)), audit: [event(tenantId, 'ticket.updated', `${id}: ${summary}`), ...s.audit] }));

  const assignTicket = (id: string, assignee: string): Result => {
    const t = ticketById(id);
    if (!t) return { ok: false, message: 'Ticket not found.' };
    return run({ perm: ['tickets.assign', 'tickets.edit'], tenantId: t.tenantId, what: 'assign tickets' }, () => {
      const self = assignee === staff.name;
      if (!self && !canFor('tickets.assign', t.tenantId)) return { ok: false, message: 'Only a Support Lead can assign tickets to someone else.' };
      if (self && t.assignee && t.assignee !== staff.name && !canFor('tickets.assign', t.tenantId)) return { ok: false, message: `${t.assignee} owns this ticket.` };
      patchTicket(id, { assignee }, assignee ? `assigned to ${assignee}` : 'unassigned', t.tenantId);
      return { ok: true, message: assignee ? `Assigned to ${self ? 'you' : assignee}.` : 'Unassigned.' };
    });
  };

  const replyTicket = (id: string, kind: 'public' | 'internal', text: string): Result => {
    const t = ticketById(id);
    if (!t) return { ok: false, message: 'Ticket not found.' };
    return run({ perm: 'tickets.edit', tenantId: t.tenantId, what: 'reply to tickets' }, () => {
      if (!text.trim()) return { ok: false, message: 'Write a message.' };
      if (t.status === 'Resolved') return { ok: false, message: 'Reopen the ticket first.' };
      const reply = { id: sid('R'), at: NOW_TIME, by: staff.name, kind, text: text.trim() };
      commit((s) => ({
        ...s,
        tickets: s.tickets.map((x) => (x.id === id ? { ...x, replies: [...x.replies, reply], status: kind === 'public' ? 'Waiting' : x.status, assignee: x.assignee || staff.name, updatedAt: NOW_TIME } : x)),
        audit: [event(t.tenantId, kind === 'public' ? 'ticket.replied' : 'ticket.note.added', `${id}: ${kind === 'public' ? 'reply sent to owner' : 'internal note'}`), ...s.audit],
      }));
      return { ok: true, message: kind === 'public' ? 'Reply sent. Ticket is waiting on the owner.' : 'Internal note saved. The owner can’t see it.' };
    });
  };

  const createTicket = (input: { tenantId: string; subject: string; priority: Ticket['priority']; channel: Ticket['channel']; text: string }): Result =>
    run({ perm: 'tickets.edit', tenantId: input.tenantId, what: 'log tickets' }, () => {
      if (!input.subject.trim() || !input.text.trim()) return { ok: false, message: 'Add a subject and what the owner said.' };
      const t = tenantById(input.tenantId);
      if (!t) return { ok: false, message: 'Business not found.' };
      const hours = input.priority === 'High' ? 1 : input.priority === 'Normal' ? 4 : 24;
      const due = new Date(new Date(NOW_TIME).getTime() + hours * 3600000 + 6 * 3600000).toISOString().slice(0, 19) + '+06:00';
      const ticket: Ticket = {
        id: sid('TCK'), tenantId: t.id, subject: input.subject.trim(), priority: input.priority, status: 'Open', assignee: staff.name, channel: input.channel,
        createdAt: NOW_TIME, updatedAt: NOW_TIME, slaDueAt: due,
        replies: [{ id: sid('R'), at: NOW_TIME, by: `${t.owner} (via ${staff.name})`, kind: 'owner', text: input.text.trim() }],
      };
      commit((s) => ({ ...s, tickets: [ticket, ...s.tickets], audit: [event(t.id, 'ticket.created', `${ticket.id}: ${ticket.subject} (${input.channel})`), ...s.audit] }));
      return { ok: true, message: `${ticket.id} logged and assigned to you.`, id: ticket.id };
    });

  const setTicketStatus = (id: string, status: Ticket['status']): Result => {
    const t = ticketById(id);
    if (!t) return { ok: false, message: 'Ticket not found.' };
    return run({ perm: 'tickets.edit', tenantId: t.tenantId, what: 'change ticket status' }, () => {
      if (t.status === status) return { ok: false, message: `Already ${status.toLowerCase()}.` };
      patchTicket(id, { status }, `${t.status} → ${status}`, t.tenantId);
      return { ok: true, message: status === 'Resolved' ? 'Resolved.' : `Marked ${status.toLowerCase()}.` };
    });
  };

  /* ---------------- Services ---------------- */
  const requestGuidedSetup = (tenantId: string): Result =>
    run({ perm: ['services.edit', 'tickets.edit'], tenantId, what: 'book guided setup' }, () => {
      if (ref.current.services.some((x) => x.tenantId === tenantId && x.packageId === 'PKG-SVC-CALL' && !['COMPLETED', 'CANCELLED'].includes(x.state))) return { ok: false, message: 'A guided setup is already open for this business.' };
      const t = tenantById(tenantId);
      const sv: ServiceOrder = { id: sid('SV'), tenantId, title: 'Guided setup call', packageId: 'PKG-SVC-CALL', quoteBdt: 399, state: 'REQUESTED', assignee: '', scheduledAt: null, requestedAt: NOW_TIME, notes: `Offered by ${staff.name} — setup is incomplete.` };
      commit((s) => ({ ...s, services: [sv, ...s.services], audit: [event(tenantId, 'service.requested', `Guided setup call ৳399 for ${t?.name}`), ...s.audit] }));
      return { ok: true, message: 'Guided setup requested. Service Coordinators will quote and schedule it.' };
    });

  const advanceService = (id: string, next: ServiceState, patch: Partial<Pick<ServiceOrder, 'quoteBdt' | 'scheduledAt' | 'assignee' | 'notes'>> = {}): Result => {
    const sv = ref.current.services.find((x) => x.id === id);
    if (!sv) return { ok: false, message: 'Service not found.' };
    return run({ perm: 'services.edit', tenantId: sv.tenantId, what: 'update services' }, () => {
      if (!serviceNext[sv.state].includes(next)) return { ok: false, message: `Can’t move from ${sv.state.toLowerCase().replace('_', ' ')} to ${next.toLowerCase().replace('_', ' ')}.` };
      if (next === 'QUOTED' && !((patch.quoteBdt ?? sv.quoteBdt) > 0)) return { ok: false, message: 'Enter a quote above ৳0.' };
      if (next === 'SCHEDULED' && !(patch.scheduledAt ?? sv.scheduledAt)) return { ok: false, message: 'Pick a date and time.' };
      const assignee = patch.assignee ?? (sv.assignee || staff.name);
      commit((s) => ({
        ...s,
        services: s.services.map((x) => (x.id === id ? { ...x, ...patch, assignee, state: next } : x)),
        audit: [event(sv.tenantId, 'service.updated', `${id} ${sv.title}: ${sv.state} → ${next}${next === 'SCHEDULED' ? ` · ${fmtDateTime(patch.scheduledAt ?? sv.scheduledAt ?? '')}` : ''}${next === 'QUOTED' ? ` · ৳${patch.quoteBdt ?? sv.quoteBdt}` : ''}`), ...s.audit],
      }));
      return { ok: true, message: next === 'QUOTED' ? 'Quote sent to the owner.' : next === 'APPROVED' ? 'Marked approved (owner accepted quote).' : `Service is now ${next.toLowerCase().replace('_', ' ')}.` };
    });
  };

  /* ---------------- Knowledge base ---------------- */
  const saveArticle = (a: Article): Result =>
    run({ perm: 'kb.edit', tenantId: null, what: 'edit the knowledge base' }, () => {
      if (!a.title.trim() || !a.body.trim()) return { ok: false, message: 'Add a title and article text.' };
      const next = { ...a, updatedAt: NOW_TIME.slice(0, 10), updatedBy: staff.name };
      commit((s) => ({ ...s, articles: s.articles.some((x) => x.id === a.id) ? s.articles.map((x) => (x.id === a.id ? next : x)) : [next, ...s.articles], audit: [event(null, 'kb.saved', `${a.title} (${a.status}, ${a.visibility})`), ...s.audit] }));
      return { ok: true, message: a.status === 'Published' ? 'Article published.' : 'Draft saved.' };
    });

  /* ---------------- Data requests ---------------- */
  const advanceDataRequest = (id: string, next: DataRequestState, ownerSim = false): Result => {
    const d = ref.current.dataRequests.find((x) => x.id === id);
    if (!d) return { ok: false, message: 'Request not found.' };
    const apply = (): Result => {
      const allowed: Record<DataRequestState, DataRequestState[]> = { REQUESTED: ['CONSENTED', 'DECLINED'], CONSENTED: ['IN_PROGRESS', 'DECLINED'], IN_PROGRESS: ['COMPLETED'], COMPLETED: [], DECLINED: [] };
      if (!allowed[d.state].includes(next)) return { ok: false, message: d.state === 'REQUESTED' && next === 'IN_PROGRESS' ? 'Wait for the owner’s consent first.' : 'That step isn’t possible now.' };
      commit((s) => ({
        ...s,
        dataRequests: s.dataRequests.map((x) => (x.id === id ? { ...x, state: next, handledBy: ownerSim ? x.handledBy : staff.name } : x)),
        tenants: d.kind === 'CLOSURE' && next === 'COMPLETED' ? s.tenants.map((t) => (t.id === d.tenantId ? { ...t, account: 'Archived' } : t)) : s.tenants,
        audit: [event(d.tenantId, `data.${d.kind.toLowerCase()}.${next.toLowerCase()}`, `${id}: ${d.detail}`, undefined, ownerSim ? `${tenantById(d.tenantId)?.owner} (owner)` : staff.name), ...s.audit],
      }));
      return { ok: true, message: next === 'COMPLETED' ? (d.kind === 'EXPORT' ? 'Export ready. Download link sent to the owner.' : d.kind === 'RESTORE' ? 'Restored from the recycle bin.' : 'Account closed and archived. Deletion waits for the retention period.') : `Marked ${next.toLowerCase().replace('_', ' ')}.` };
    };
    if (ownerSim) return apply();
    return run({ perm: 'data.manage', tenantId: d.tenantId, what: 'handle data requests' }, apply);
  };

  return { requestAccess, ownerDecision, applyAccess, withdrawAccess, logDiagnosticsView, createTicket, assignTicket, replyTicket, setTicketStatus, requestGuidedSetup, advanceService, saveArticle, advanceDataRequest };
}
