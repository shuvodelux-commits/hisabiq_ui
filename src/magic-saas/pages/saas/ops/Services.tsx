import React, { useState } from 'react';
import { Tabs } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { useFirstLoad } from '../../../hooks/saas/useFirstLoad';
import { Badge, Card, Denied, EmptyRow, LoadingList, PageTitle, th, td } from '../../../components/saas/SaasBits';
import { ServiceDialog, serviceMeta } from '../../../components/saas/ops/ServiceDialog';
import { fmtDateTime } from '../../../utils/saas';
import { formatNumber } from '../../../utils/currency';
import type { ServiceState } from '../../../types/saas';

const groups: { id: string; label: string; states: ServiceState[] }[] = [
  { id: 'new', label: 'Needs quote', states: ['REQUESTED'] },
  { id: 'quoted', label: 'Waiting on owner', states: ['QUOTED'] },
  { id: 'schedule', label: 'To schedule', states: ['APPROVED'] },
  { id: 'active', label: 'Scheduled & in progress', states: ['SCHEDULED', 'IN_PROGRESS'] },
  { id: 'closed', label: 'Closed', states: ['COMPLETED', 'CANCELLED'] },
];

export function Services() {
  const saas = useSaas();
  const loading = useFirstLoad();
  const [tab, setTab] = useState('new');
  const [open, setOpen] = useState<string | null>(null);
  if (!saas.can('services.view')) return <Denied what="services" role={saas.staff.label} />;
  const all = saas.state.services.filter((s) => saas.inScope(s.tenantId));
  const g = groups.find((x) => x.id === tab)!;
  const rows = all.filter((s) => g.states.includes(s.state));
  return (
    <div className="space-y-4">
      <PageTitle title="Services" bn="সার্ভিস" description="Guided setup calls, data import and onboarding. Quote → owner accepts → schedule → complete." />
      <Card>
        <Tabs label="Service stages" value={tab} onChange={setTab} items={groups.map((x) => ({ id: x.id, label: x.label, count: all.filter((s) => x.states.includes(s.state)).length }))} />
        {loading ? <LoadingList /> : (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Service</th><th className={th}>Business</th><th className={`${th} text-right`}>Quote</th><th className={`${th} hidden md:table-cell`}>Coordinator</th><th className={`${th} hidden md:table-cell`}>When</th><th className={th}>Stage</th></tr></thead>
              <tbody>
                {rows.length === 0 ? <EmptyRow cols={6} text="Nothing at this stage." /> : rows.map((s) => (
                  <tr key={s.id} onClick={() => setOpen(s.id)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                    <td className={td}><button type="button" onClick={(e) => { e.stopPropagation(); setOpen(s.id); }} className="font-medium text-teal-700 hover:underline">{s.title}</button><span className="block text-[11px] text-ink-500">{s.id} · requested {fmtDateTime(s.requestedAt)}</span></td>
                    <td className={td}>{saas.state.tenants.find((t) => t.id === s.tenantId)?.name}</td>
                    <td className={`${td} text-right tabular-nums`}>{formatNumber(s.quoteBdt)}</td>
                    <td className={`${td} hidden md:table-cell`}>{s.assignee || '—'}</td>
                    <td className={`${td} hidden whitespace-nowrap text-ink-600 md:table-cell`}>{s.scheduledAt ? fmtDateTime(s.scheduledAt) : '—'}</td>
                    <td className={td}><Badge tone={serviceMeta[s.state].tone} dot>{serviceMeta[s.state].label}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {open && <ServiceDialog serviceId={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
