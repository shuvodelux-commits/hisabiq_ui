import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { businessTypes } from '../../../data/saasOpsSeeds';
import type { BusinessType } from '../../../types/saas';

export function CreateBusinessDialog({ onClose }: { onClose: () => void }) {
  const saas = useSaas();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', owner: '', phone: '', district: '', businessType: 'Grocery' as BusinessType });
  const [error, setError] = useState('');
  const type = businessTypes.find((b) => b.type === f.businessType);
  return (
    <Modal
      title="Add a business"
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.createTenant(f); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); if (r.id) navigate(`/saas/tenants/${r.id}`); }}>Create & send invite</Button></>}
    >
      <div className="space-y-3 text-[13px]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Business name"><Input value={f.name} onChange={(name) => setF({ ...f, name })} placeholder="e.g. Fresh Mart Mirpur" /></Field>
          <Field label="Business type"><Select value={f.businessType} onChange={(v) => setF({ ...f, businessType: v as BusinessType })} options={businessTypes.map((b) => b.type)} /></Field>
          <Field label="Owner name"><Input value={f.owner} onChange={(owner) => setF({ ...f, owner })} /></Field>
          <Field label="Owner mobile"><Input value={f.phone} onChange={(phone) => setF({ ...f, phone })} placeholder="01711-234567" /></Field>
          <Field label="District"><Input value={f.district} onChange={(district) => setF({ ...f, district })} placeholder="Dhaka" /></Field>
        </div>
        {type && <p className="rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">Recommended for {type.type}: {type.defaults}. Staff can propose these through Support access after the owner signs in.</p>}
        <p className="text-xs text-ink-500">Starts as Provisioning with a 14-day Pro trial. The owner gets an SMS invite and sets their own password.</p>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
