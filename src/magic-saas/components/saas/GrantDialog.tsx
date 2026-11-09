import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select, Textarea } from '../../prototype/Ui';
import { useSaas } from '../../contexts/SaasContext';
import { featureCatalog } from '../../data/saasSeeds';
import { addDays, fmtDate, NOW } from '../../utils/saas';

/** Trials and complimentary grants — separate, audited, never a payment. */
export function GrantDialog({ tenantId, kind, onClose }: { tenantId: string; kind: 'TRIAL' | 'GRANT'; onClose: () => void }) {
  const saas = useSaas();
  const tenant = saas.state.tenants.find((t) => t.id === tenantId)!;
  const active = new Set(saas.featuresFor(tenantId).filter((f) => f.status === 'Active').map((f) => f.feature));
  const options = featureCatalog.filter((f) => !active.has(f.key));
  const [feature, setFeature] = useState(options[0]?.key ?? '');
  const [days, setDays] = useState(kind === 'TRIAL' ? '14' : '30');
  const [memberId, setMemberId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const n = Number(days);

  const submit = () => {
    const r = saas.grant({ tenantId, feature, kind, days: n, reason, memberId: memberId || null });
    if (!r.ok) return setError(r.message);
    toast.success(r.message);
    onClose();
  };

  return (
    <Modal
      title={kind === 'TRIAL' ? `Start a trial · ${tenant.name}` : `Complimentary grant · ${tenant.name}`}
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!options.length} onClick={submit}>{kind === 'TRIAL' ? 'Start trial' : 'Issue grant'}</Button></>}
    >
      {options.length === 0 ? (
        <p className="text-[13px] text-ink-500">This business already has every feature.</p>
      ) : (
        <div className="space-y-3 text-[13px]">
          <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
            <Field label="Feature"><Select value={feature} onChange={setFeature} options={options.map((f) => ({ value: f.key, label: f.label }))} /></Field>
            <Field label="Days"><Input type="number" min={1} value={days} onChange={setDays} /></Field>
          </div>
          <Field label="Scope"><Select value={memberId} onChange={setMemberId} options={[{ value: '', label: 'Whole business' }, ...tenant.members.filter((m) => m.status === 'Active').map((m) => ({ value: m.id, label: `${m.name} only` }))]} /></Field>
          <Field label="Reason (saved in audit log)"><Textarea value={reason} onChange={setReason} placeholder={kind === 'TRIAL' ? 'e.g. Owner wants to try warranty before buying' : 'e.g. Compensation for 2-day SMS outage'} /></Field>
          <p className="text-xs text-ink-500">
            Ends {Number.isFinite(n) && n > 0 ? fmtDate(addDays(NOW, n)) : '—'}. {kind === 'TRIAL' ? 'One trial per feature per business.' : 'No payment order is created. Members still need the right role to see it.'}
          </p>
          {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
