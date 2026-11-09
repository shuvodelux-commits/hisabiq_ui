import { useMemo, useState } from 'react';
import { ArrowDownToLine, Printer } from 'lucide-react';
import { Select, downloadCsv, Button } from '../../prototype/Ui';
import { AppDateRangePicker } from '../../hisabiq-library/components/AppDateRangePicker';
import { useSaas } from '../../contexts/SaasContext';
import { Denied, EmptyRow, SearchBox, td, th } from './SaasBits';
import { fmtDateTime } from '../../utils/saas';
import type { AuditEvent } from '../../types/saas';

const groups: Record<string, string> = {
  payment: 'Billing', order: 'Billing', refund: 'Billing', invoice: 'Billing',
  entitlement: 'Plans', subscription: 'Plans',
  support: 'Support', diagnostics: 'Support', ticket: 'Support', service: 'Support', kb: 'Support', data: 'Support', owner: 'Support',
  tenant: 'Businesses', package: 'Catalog', offer: 'Catalog', pricing: 'Catalog',
  sms: 'SMS', template: 'SMS', announcement: 'Admin', team: 'Admin', settings: 'Admin',
};
const groupOf = (a: string) => groups[a.split('.')[0]] ?? 'Other';
const areas = ['All areas', 'Billing', 'Plans', 'Businesses', 'Support', 'Catalog', 'SMS', 'Admin'];

/** Read-only audit trail in the GitHub Audit Ledger layout. */
export function AuditTable({ events, showBusiness = false }: { events: AuditEvent[]; showBusiness?: boolean }) {
  const saas = useSaas();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('All areas');
  const [actor, setActor] = useState('Everyone');
  const [range, setRange] = useState({ from: '', to: '' });
  const actors = useMemo(() => ['Everyone', ...Array.from(new Set(events.map((e) => e.actor))).sort()], [events]);
  const rows = useMemo(
    () =>
      events.filter((e) => {
        const day = e.at.slice(0, 10);
        if (range.from && day < range.from) return false;
        if (range.to && day > range.to) return false;
        if (group !== 'All areas' && groupOf(e.action) !== group) return false;
        if (actor !== 'Everyone' && e.actor !== actor) return false;
        return !q || `${e.actor} ${e.summary} ${e.action} ${e.detail ?? ''}`.toLowerCase().includes(q.toLowerCase());
      }),
    [events, q, group, actor, range],
  );
  if (!saas.can('audit.view')) return <Denied what="the audit log" role={saas.staff.label} />;
  const filtered = q || group !== 'All areas' || actor !== 'Everyone' || range.from || range.to;
  const reset = () => { setQ(''); setGroup('All areas'); setActor('Everyone'); setRange({ from: '', to: '' }); };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Button onClick={() => downloadCsv('hisabiq-audit.csv', [['Time', 'Actor', 'Business', 'Action', 'Summary', 'Detail'], ...rows.map((e) => [e.at, e.actor, e.tenantId ?? 'Platform', e.action, e.summary, e.detail ?? ''])])}><ArrowDownToLine className="size-4" />Export</Button>
        <Button onClick={() => window.print()}><Printer className="size-4" />Print</Button>
      </div>
      <section className="overflow-hidden rounded-xl border border-ink-100 bg-card shadow-card">
        <div className="space-y-2 border-b border-ink-100 p-3 print:hidden">
          <SearchBox value={q} onChange={setQ} placeholder="Search who, what, invoice or TRX ID" />
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-[260px]"><AppDateRangePicker label="Event date" value={range} onChange={setRange} /></div>
            <div className="w-full sm:w-[170px]"><Select label="Filter by area" value={group} onChange={setGroup} options={areas} /></div>
            <div className="w-full sm:w-[190px]"><Select label="Filter by person" value={actor} onChange={setActor} options={actors} /></div>
            <Button kind="ghost" disabled={!filtered} onClick={reset} className="text-ink-500">Reset</Button>
          </div>
        </div>
        <p role="status" aria-live="polite" className="border-b border-ink-100 px-3 py-1.5 text-[11px] text-ink-500">Showing {rows.length} of {events.length} events</p>
        <div className="overflow-x-auto">
          <table data-erp-table className="w-full text-[13px]">
            <thead><tr className="border-b border-ink-100"><th className={th}>Time</th><th className={th}>Who</th>{showBusiness && <th className={`${th} hidden md:table-cell`}>Business</th>}<th className={th}>What happened</th><th className={`${th} hidden lg:table-cell`}>Area</th></tr></thead>
            <tbody>
              {rows.length === 0 && <EmptyRow cols={showBusiness ? 5 : 4} text={filtered ? 'No events match these filters.' : 'No events yet.'} />}
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-ink-100 last:border-0">
                  <td className={`${td} whitespace-nowrap font-medium text-ink`}>{fmtDateTime(e.at)}</td>
                  <td className={`${td} whitespace-nowrap`}>{e.actor}</td>
                  {showBusiness && <td className={`${td} hidden md:table-cell`}>{e.tenantId ? saas.state.tenants.find((t) => t.id === e.tenantId)?.name : <span className="text-ink-500">Platform</span>}</td>}
                  <td className={td}>{e.summary}{e.detail && <span className="block text-[11px] text-ink-500">{e.detail}</span>}<span className="block text-[10.5px] text-ink-400">{e.action}</span></td>
                  <td className={`${td} hidden text-ink-600 lg:table-cell`}>{groupOf(e.action)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">Append-only. Entries can’t be edited or deleted.</p>
      </section>
    </div>
  );
}
