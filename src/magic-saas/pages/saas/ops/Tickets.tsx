import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { NewTicketDialog } from '../../../components/saas/ops/NewTicketDialog';
import { toast } from 'sonner';
import { Button, Select, Tabs } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { useFirstLoad } from '../../../hooks/saas/useFirstLoad';
import { Badge, Card, Denied, LoadingList, PageTitle, SearchBox } from '../../../components/saas/SaasBits';
import { TicketThread } from '../../../components/saas/ops/TicketThread';
import { RequestChangeDialog } from '../../../components/saas/RequestChangeDialog';
import { hasPermission } from '../../../utils/saasAccess';
import { NOW_TIME, fmtDateTime } from '../../../utils/saas';
import type { Result, Ticket } from '../../../types/saas';

type View = 'unassigned' | 'mine' | 'open' | 'waiting' | 'resolved';

export function Tickets() {
  const saas = useSaas();
  const loading = useFirstLoad();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<View>('open');
  const [q, setQ] = useState('');
  const [change, setChange] = useState(false);
  const [creating, setCreating] = useState(false);
  const me = saas.staff.name;
  const all = saas.state.tickets.filter((t) => saas.inScope(t.tenantId));
  const tests: Record<View, (t: Ticket) => boolean> = {
    unassigned: (t) => t.status !== 'Resolved' && !t.assignee,
    mine: (t) => t.status !== 'Resolved' && t.assignee === me,
    open: (t) => t.status === 'Open',
    waiting: (t) => t.status === 'Waiting',
    resolved: (t) => t.status === 'Resolved',
  };
  const name = (id: string) => saas.state.tenants.find((t) => t.id === id)?.name ?? id;
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter(tests[view]).filter((t) => !s || `${t.id} ${t.subject} ${name(t.tenantId)}`.toLowerCase().includes(s)).sort((a, b) => a.slaDueAt.localeCompare(b.slaDueAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, view, q]);
  const selected = all.find((t) => t.id === params.get('ticket')) ?? rows[0];

  if (!saas.can('tickets.view')) return <Denied what="support tickets" role={saas.staff.label} />;
  const run = (r: Result) => (r.ok ? toast.success(r.message) : toast.error(r.message));
  const agents = selected ? saas.state.staff.filter((s) => s.status === 'Active' && hasPermission(s, 'tickets.edit', selected.tenantId)).map((s) => s.name) : [];
  const tenant = selected ? saas.state.tenants.find((t) => t.id === selected.tenantId) : undefined;

  return (
    <div className="space-y-4">
      <PageTitle
        title="Support tickets"
        bn="সাপোর্ট টিকিট"
        description="Owner questions from in-app, phone and WhatsApp. Sorted by SLA — soonest first."
        actions={saas.can('tickets.edit') && <Button kind="primary" onClick={() => setCreating(true)}><Plus className="size-4" />Log ticket</Button>}
      />
      <Card>
        <Tabs label="Ticket views" value={view} onChange={(v) => setView(v as View)} items={(Object.keys(tests) as View[]).map((id) => ({ id, label: { unassigned: 'Unassigned', mine: 'Mine', open: 'Open', waiting: 'Waiting on owner', resolved: 'Resolved' }[id], count: all.filter(tests[id]).length }))} />
        <div className="border-b border-ink-100 p-3"><SearchBox value={q} onChange={setQ} placeholder="Search ticket, subject or business" /></div>
        {loading ? <LoadingList /> : (
          <div className="grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
            <ul className="max-h-[640px] divide-y divide-ink-100 overflow-y-auto border-b border-ink-100 lg:border-b-0 lg:border-r" aria-label="Tickets">
              {rows.length === 0 && <li className="px-4 py-10 text-center text-[13px] text-ink-500">No tickets in this view.</li>}
              {rows.map((t) => {
                const late = t.status !== 'Resolved' && t.slaDueAt < NOW_TIME;
                return (
                  <li key={t.id}>
                    <button type="button" onClick={() => setParams({ ticket: t.id })} aria-current={selected?.id === t.id} className={`w-full px-4 py-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${selected?.id === t.id ? 'bg-teal-50' : 'hover:bg-ink-50/60'}`}>
                      <p className="flex items-center gap-1.5 text-[11px] text-ink-500">{t.id} · {t.channel}{t.priority === 'High' && <Badge tone="danger">High</Badge>}{late && <Badge tone="danger">SLA missed</Badge>}</p>
                      <p className="truncate text-[13px] font-medium text-ink">{t.subject}</p>
                      <p className="truncate text-[11px] text-ink-500">{name(t.tenantId)} · {t.assignee || 'Unassigned'} · due {fmtDateTime(t.slaDueAt)}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
            {selected ? (
              <div className="min-w-0 space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-ink">{selected.subject}</h2>
                    <p className="text-xs text-ink-500"><Link to={`/saas/tenants/${selected.tenantId}?tab=support`} className="text-teal-700 hover:underline">{tenant?.name}</Link> · {tenant?.owner} · {tenant?.phone} · {tenant?.planCode}</p>
                  </div>
                  <Badge tone={selected.status === 'Resolved' ? 'success' : selected.status === 'Waiting' ? 'info' : 'warning'} dot>{selected.status}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {saas.canFor('tickets.assign', selected.tenantId) ? (
                    <div className="w-[200px]"><Select value={selected.assignee} onChange={(v) => run(saas.assignTicket(selected.id, v))} options={[{ value: '', label: 'Unassigned' }, ...agents.map((a) => ({ value: a, label: a }))]} /></div>
                  ) : saas.canFor('tickets.edit', selected.tenantId) && selected.assignee !== me && !selected.assignee ? (
                    <Button onClick={() => run(saas.assignTicket(selected.id, me))}>Assign to me</Button>
                  ) : null}
                  {saas.canFor('tickets.edit', selected.tenantId) && (selected.status === 'Resolved' ? <Button onClick={() => run(saas.setTicketStatus(selected.id, 'Open'))}>Reopen</Button> : <Button onClick={() => run(saas.setTicketStatus(selected.id, 'Resolved'))}>Resolve</Button>)}
                  {saas.canFor('support.access', selected.tenantId) && selected.status !== 'Resolved' && <Button onClick={() => setChange(true)}>Request setting change</Button>}
                </div>
                <TicketThread ticket={selected} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-[13px] text-ink-500"><MessageSquare className="size-6 text-ink-300" aria-hidden="true" />Pick a ticket to read the conversation.</div>
            )}
          </div>
        )}
      </Card>
      {creating && <NewTicketDialog onClose={() => setCreating(false)} onCreated={(id) => { setCreating(false); setView('mine'); setParams({ ticket: id }); }} />}
      {change && selected && tenant && <RequestChangeDialog tenant={tenant} ticketId={selected.id} onClose={() => setChange(false)} />}
    </div>
  );
}
