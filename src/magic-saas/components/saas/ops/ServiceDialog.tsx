import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { Badge } from '../SaasBits';
import { hasPermission } from '../../../utils/saasAccess';
import { fmtDateTime } from '../../../utils/saas';
import { taka } from '../../../utils/currency';
import type { Result, ServiceState } from '../../../types/saas';

export const serviceMeta: Record<ServiceState, { label: string; tone: 'neutral' | 'info' | 'warning' | 'success' | 'teal' | 'ink' }> = {
  REQUESTED: { label: 'Requested', tone: 'warning' },
  QUOTED: { label: 'Quoted', tone: 'info' },
  APPROVED: { label: 'Approved', tone: 'teal' },
  SCHEDULED: { label: 'Scheduled', tone: 'info' },
  IN_PROGRESS: { label: 'In progress', tone: 'warning' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'ink' },
};

export const serviceFlow: ServiceState[] = ['REQUESTED', 'QUOTED', 'APPROVED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'];

export function ServiceDialog({ serviceId, onClose }: { serviceId: string; onClose: () => void }) {
  const saas = useSaas();
  const sv = saas.state.services.find((x) => x.id === serviceId);
  const [quote, setQuote] = useState(String(sv?.quoteBdt ?? 0));
  const [when, setWhen] = useState(sv?.scheduledAt?.slice(0, 16) ?? '2026-10-27T11:00');
  const coordinators = saas.state.staff.filter((s) => hasPermission(s, 'services.edit', sv?.tenantId));
  const [assignee, setAssignee] = useState(sv?.assignee || (coordinators.some((c) => c.name === saas.staff.name) ? saas.staff.name : coordinators[0]?.name ?? ''));
  const [error, setError] = useState('');
  if (!sv) return null;
  const t = saas.state.tenants.find((x) => x.id === sv.tenantId);
  const canEdit = saas.canFor('services.edit', sv.tenantId);
  const step = serviceFlow.indexOf(sv.state);
  const run = (r: Result) => {
    if (!r.ok) return setError(r.message);
    toast.success(r.message);
    onClose();
  };

  const primary: { label: string; go: () => void } | null =
    sv.state === 'REQUESTED' ? { label: 'Send quote', go: () => run(saas.advanceService(sv.id, 'QUOTED', { quoteBdt: Number(quote), assignee })) }
      : sv.state === 'QUOTED' ? { label: 'Owner accepted (simulate)', go: () => run(saas.advanceService(sv.id, 'APPROVED')) }
      : sv.state === 'APPROVED' ? { label: 'Schedule', go: () => run(saas.advanceService(sv.id, 'SCHEDULED', { scheduledAt: `${when}:00+06:00`, assignee })) }
      : sv.state === 'SCHEDULED' ? { label: 'Start', go: () => run(saas.advanceService(sv.id, 'IN_PROGRESS')) }
      : sv.state === 'IN_PROGRESS' ? { label: 'Mark completed', go: () => run(saas.advanceService(sv.id, 'COMPLETED')) }
      : null;

  return (
    <Modal
      title={`${sv.title} · ${sv.id}`}
      onClose={onClose}
      footer={
        <>
          {canEdit && !['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(sv.state) && <Button kind="ghost" onClick={() => run(saas.advanceService(sv.id, 'CANCELLED'))}>Cancel service</Button>}
          <Button onClick={onClose}>Close</Button>
          {canEdit && primary && <Button kind="primary" onClick={primary.go}>{primary.label}</Button>}
        </>
      }
    >
      <div className="space-y-3 text-[13px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-ink-600">{t?.name} · {t?.owner} · {t?.phone}</p>
          <Badge tone={serviceMeta[sv.state].tone} dot>{serviceMeta[sv.state].label}</Badge>
        </div>
        {sv.state !== 'CANCELLED' && (
          <ol className="grid grid-cols-6 gap-1" aria-label="Service progress">
            {serviceFlow.map((s, i) => <li key={s} className={`border-t-2 pt-1 text-[10.5px] ${i <= step ? 'border-teal-600 text-ink' : 'border-ink-100 text-ink-400'}`}>{serviceMeta[s].label}</li>)}
          </ol>
        )}
        <p className="rounded-lg bg-ink-50 px-3 py-2 text-ink-700">{sv.notes}</p>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div><dt className="text-ink-500">Quote</dt><dd className="font-medium tabular-nums">{taka(sv.quoteBdt)}</dd></div>
          <div><dt className="text-ink-500">Requested</dt><dd>{fmtDateTime(sv.requestedAt)}</dd></div>
          <div><dt className="text-ink-500">Assignee</dt><dd>{sv.assignee || 'Unassigned'}</dd></div>
          <div><dt className="text-ink-500">Scheduled</dt><dd>{sv.scheduledAt ? fmtDateTime(sv.scheduledAt) : '—'}</dd></div>
        </dl>
        {canEdit && sv.state === 'REQUESTED' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Quote (৳)" hint="Catalog: ৳399 call · ৳999 import · from ৳1,999 onboarding"><Input type="number" min={0} value={quote} onChange={setQuote} /></Field>
            <Field label="Coordinator"><Select value={assignee} onChange={setAssignee} options={coordinators.map((c) => c.name)} /></Field>
          </div>
        )}
        {canEdit && sv.state === 'APPROVED' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date & time (Dhaka)"><Input type="datetime-local" value={when} onChange={setWhen} /></Field>
            <Field label="Coordinator"><Select value={assignee} onChange={setAssignee} options={coordinators.map((c) => c.name)} /></Field>
          </div>
        )}
        {!canEdit && <p className="text-xs text-ink-500">View only — your role can’t update services.</p>}
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
