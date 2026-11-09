import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select, Textarea } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import type { Ticket } from '../../../types/saas';

/** Log a ticket for an owner who called or messaged on WhatsApp. */
export function NewTicketDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const saas = useSaas();
  const list = saas.state.tenants.filter((t) => saas.canFor('tickets.edit', t.id) && t.account !== 'Archived');
  const [f, setF] = useState({ tenantId: list[0]?.id ?? '', subject: '', priority: 'Normal' as Ticket['priority'], channel: 'Phone' as Ticket['channel'], text: '' });
  const [error, setError] = useState('');
  return (
    <Modal
      title="Log a ticket"
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!list.length} onClick={() => { const r = saas.createTicket(f); if (!r.ok) return setError(r.message); toast.success(r.message); onCreated(r.id!); }}>Log ticket</Button></>}
    >
      <div className="space-y-3 text-[13px]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Business"><Select value={f.tenantId} onChange={(tenantId) => setF({ ...f, tenantId })} options={list.map((t) => ({ value: t.id, label: `${t.name} · ${t.owner}` }))} /></Field>
          <Field label="Came in by"><Select value={f.channel} onChange={(v) => setF({ ...f, channel: v as Ticket['channel'] })} options={['Phone', 'WhatsApp', 'In-app']} /></Field>
          <Field label="Priority" hint="High = 1 hour SLA · Normal = 4 hours · Low = 1 day"><Select value={f.priority} onChange={(v) => setF({ ...f, priority: v as Ticket['priority'] })} options={['High', 'Normal', 'Low']} /></Field>
          <Field label="Subject"><Input value={f.subject} onChange={(subject) => setF({ ...f, subject })} placeholder="e.g. Can’t print 80 mm receipts" /></Field>
        </div>
        <Field label="What the owner said"><Textarea value={f.text} onChange={(text) => setF({ ...f, text })} /></Field>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
