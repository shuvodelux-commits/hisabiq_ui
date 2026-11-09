import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select, Textarea } from '../../prototype/Ui';
import { useSaas } from '../../contexts/SaasContext';
import { erpSettingChoices } from '../../data/saasOpsSeeds';
import type { Tenant } from '../../types/saas';

/** Owner-approved change, picked from the real ERP settings with their current values. */
export function RequestChangeDialog({ tenant, ticketId, onClose }: { tenant: Tenant; ticketId?: string; onClose: () => void }) {
  const saas = useSaas();
  const tickets = saas.state.tickets.filter((t) => t.tenantId === tenant.id && t.status !== 'Resolved');
  const [ticket, setTicket] = useState(ticketId ?? tickets[0]?.id ?? '');
  const [memberId, setMemberId] = useState('');
  const [setting, setSetting] = useState(erpSettingChoices[0].label);
  const choice = erpSettingChoices.find((c) => c.label === setting)!;
  const before = choice.current(tenant);
  const [after, setAfter] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const value = after || (choice.options.find((o) => o !== before) ?? '');

  return (
    <Modal
      title={`Request a setting change · ${tenant.name}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button kind="primary" disabled={!tickets.length} onClick={() => { const r = saas.requestAccess({ tenantId: tenant.id, ticketId: ticket, memberId: memberId || null, changes: [{ setting, before, after: value }], reason }); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Send to owner</Button>
        </>
      }
    >
      <div className="space-y-3 text-[13px]">
        {tickets.length === 0 ? <p className="text-ink-500">Open a ticket first — every change must be linked to one.</p> : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ticket"><Select value={ticket} onChange={setTicket} options={tickets.map((t) => ({ value: t.id, label: `${t.id} · ${t.subject}` }))} /></Field>
              <Field label="Applies to"><Select value={memberId} onChange={setMemberId} options={[{ value: '', label: 'Whole business' }, ...tenant.members.map((m) => ({ value: m.id, label: `${m.name} (${m.role}) only` }))]} /></Field>
              <Field label="ERP setting"><Select value={setting} onChange={(v) => { setSetting(v); setAfter(''); }} options={erpSettingChoices.map((c) => c.label)} /></Field>
              <Field label={`New value · now “${before}”`}>{choice.options.length ? <Select value={value} onChange={setAfter} options={choice.options} /> : <Input value={after} onChange={(v) => setAfter(v.toUpperCase())} placeholder="New value" />}</Field>
            </div>
            {choice.sensitive && (
              <p className="flex items-start gap-2 rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                Affects the books. A lock date stops edits to sales, purchases and payments before that date; cash-session rules change how the counter closes. Explain this to the owner.
              </p>
            )}
            <Field label="Reason the owner will see"><Textarea value={reason} onChange={setReason} placeholder="e.g. You asked for invoices to start with KT" /></Field>
            <p className="text-xs text-ink-500">The owner approves once in Settings › Support. Approval lasts 15 minutes and covers only this exact change.</p>
          </>
        )}
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
