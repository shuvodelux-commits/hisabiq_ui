import { useState } from 'react';
import { ChevronDown, Lock, Plus } from 'lucide-react';
import { Button } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { SettingCard } from '../../settings/SettingCard';
import { AccessRequestCard } from '../AccessRequestCard';
import { RequestChangeDialog } from '../RequestChangeDialog';
import { TicketDialog } from '../ops/TicketDialog';
import { Badge, td, th } from '../SaasBits';
import { fmtDateTime } from '../../../utils/saas';
import type { Tenant } from '../../../types/saas';


const diagnostics = [
  { at: '2026-10-25T10:02:11+06:00', level: 'WARN', text: 'sms.dispatch retry 2/3 provider=Alpha SMS latency=31s' },
  { at: '2026-10-25T09:58:40+06:00', level: 'INFO', text: 'sync.offline batch=14 invoices conflicts=0' },
  { at: '2026-10-25T09:41:05+06:00', level: 'ERROR', text: 'print.receipt template=80mm font fallback (Hind Siliguri missing on device)' },
];

export function SupportTab({ tenant }: { tenant: Tenant }) {
  const saas = useSaas();
  const tickets = saas.state.tickets.filter((t) => t.tenantId === tenant.id);
  const access = saas.state.access.filter((a) => a.tenantId === tenant.id);
  const [dialog, setDialog] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [diagOpen, setDiagOpen] = useState(false);
  const canDiag = saas.canFor('support.diagnostics', tenant.id);
  const canAccess = saas.canFor('support.access', tenant.id);

  return (
    <div className="space-y-3">
      <SettingCard title="Tickets" titleBn="টিকিট" bodyClassName="">
        <div className="overflow-x-auto">
          <table data-erp-table className="w-full text-[13px]">
            <thead><tr className="border-b border-ink-100"><th className={th}>Ticket</th><th className={th}>Priority</th><th className={th}>Status</th><th className={`${th} hidden md:table-cell`}>Assignee</th><th className={`${th} hidden md:table-cell`}>Updated</th></tr></thead>
            <tbody>
              {tickets.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-xs text-ink-500">No tickets from this business.</td></tr>}
              {tickets.map((t) => (
                <tr key={t.id} onClick={() => setTicket(t.id)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                  <td className={td}><button type="button" onClick={(e) => { e.stopPropagation(); setTicket(t.id); }} className="font-medium text-teal-700 hover:underline">{t.id}</button><span className="block text-[11px] text-ink-500">{t.subject}</span></td>
                  <td className={td}><Badge tone={t.priority === 'High' ? 'danger' : t.priority === 'Normal' ? 'neutral' : 'neutral'}>{t.priority}</Badge></td>
                  <td className={td}><Badge tone={t.status === 'Resolved' ? 'success' : t.status === 'Waiting' ? 'warning' : 'info'} dot>{t.status}</Badge></td>
                  <td className={`${td} hidden md:table-cell`}>{t.assignee || 'Unassigned'}</td>
                  <td className={`${td} hidden text-ink-500 md:table-cell`}>{fmtDateTime(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingCard>

      <SettingCard
        title="Support access"
        titleBn="সাপোর্ট অনুমতি"
        description="Staff never sign in as the owner. Each change is requested, approved once by the owner, and expires."
        bodyClassName=""
        actions={<Button disabled={!canAccess || !tickets.some((t) => t.status !== 'Resolved')} title={!canAccess ? 'Needs support access for this business' : !tickets.some((t) => t.status !== 'Resolved') ? 'Link an open ticket first' : undefined} onClick={() => setDialog(true)}><Plus className="size-4" />Request change</Button>}
      >
        {access.length === 0 ? <p className="px-4 py-6 text-center text-xs text-ink-500">No support access requests.</p> : access.map((a) => <AccessRequestCard key={a.id} a={a} />)}
      </SettingCard>

      <section className="rounded-xl border border-ink-100 bg-white shadow-card">
        <button
          type="button"
          aria-expanded={diagOpen}
          onClick={() => {
            if (!diagOpen && canDiag) saas.logDiagnosticsView(tenant.id);
            setDiagOpen((v) => !v);
          }}
          className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink"><Lock className="size-3.5 text-ink-400" />Diagnostics</span>
            <span className="text-xs text-ink-500">Restricted technical logs. Opening is recorded in History. Never shown to the business.</span>
          </span>
          <ChevronDown className={`size-4 text-ink-400 transition-transform ${diagOpen ? 'rotate-180' : ''}`} />
        </button>
        {diagOpen && (
          <div className="border-t border-ink-100 px-4 py-3">
            {!canDiag ? (
              <p role="alert" className="text-xs text-ink-600">Your role ({saas.staff.label}) can’t view diagnostics.</p>
            ) : (
              <ul className="space-y-1 text-[12px]">
                {diagnostics.map((d) => (
                  <li key={d.at} className="grid grid-cols-[120px_52px_1fr] gap-2">
                    <span className="text-ink-500">{fmtDateTime(d.at)}</span>
                    <span className={d.level === 'ERROR' ? 'text-danger' : d.level === 'WARN' ? 'text-warning' : 'text-ink-500'}>{d.level}</span>
                    <span className="break-words text-ink-700">{d.text}</span>
                  </li>
                ))}
                <li className="pt-1 text-[11px] text-ink-500">Sample log lines. Production logs come from the server with customer data redacted.</li>
              </ul>
            )}
          </div>
        )}
      </section>

      {dialog && <RequestChangeDialog tenant={tenant} onClose={() => setDialog(false)} />}
      {ticket && <TicketDialog ticketId={ticket} onClose={() => setTicket(null)} />}
    </div>
  );
}

