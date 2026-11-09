import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Textarea } from '../../prototype/Ui';
import { useSaas, type Result } from '../../contexts/SaasContext';
import { Badge, orderMeta } from './SaasBits';
import { fmtDateTime } from '../../utils/saas';
import { taka } from '../../utils/currency';
import type { OrderState } from '../../types/saas';

const flow: OrderState[] = ['PAYMENT_PENDING', 'VERIFICATION_PENDING', 'ACTIVATION_PENDING', 'COMPLETED'];

export function OrderDetailDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const saas = useSaas();
  const navigate = useNavigate();
  const o = saas.state.orders.find((x) => x.id === orderId);
  const [mode, setMode] = useState<null | 'reference' | 'reject' | 'refund'>(null);
  const [ref, setRef] = useState('');
  const [file, setFile] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  if (!o) return null;
  const t = saas.state.tenants.find((x) => x.id === o.tenantId);
  const offer = saas.state.offers.find((x) => x.id === o.offerId);
  const meta = orderMeta[o.state];
  const step = flow.indexOf(o.state);

  const run = (r: Result) => {
    if (!r.ok) return setError(r.message);
    toast.success(r.message);
    setMode(null);
    setError('');
  };

  return (
    <Modal title={`${o.id} · ${o.terms.name}`} onClose={onClose} footer={<Button onClick={onClose}>Close</Button>}>
      <div className="space-y-4 text-[13px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-ink-600">{t?.name} · {fmtDateTime(o.createdAt)} · by {o.createdBy}</p>
          <Badge tone={meta.tone} dot>{meta.label}</Badge>
        </div>

        <ol className="grid grid-cols-4 gap-1" aria-label="Order progress">
          {flow.map((s, i) => (
            <li key={s} className={`border-t-2 pt-1 text-[11px] ${o.state === 'FAILED' || o.state.startsWith('REFUND') ? 'border-ink-100 text-ink-400' : i <= step ? 'border-teal-600 text-ink' : 'border-ink-100 text-ink-400'}`}>
              {i < step && <Check className="mr-0.5 inline size-3 text-teal-600" />}
              {orderMeta[s].label}
            </li>
          ))}
        </ol>
        <p className="text-xs text-ink-500">{meta.help}{o.failureReason && <span className="text-danger"> {o.failureReason}</span>}</p>

        <dl className="divide-y divide-ink-100 rounded-lg border border-ink-100">
          {[
            ['Benefit (fixed at purchase)', `${o.terms.benefit}${o.bonusCredits ? ` + ${o.bonusCredits} bonus SMS` : ''}`],
            ['Package version', `v${o.packageVersion}`],
            ['List price', taka(o.listPrice)],
            ...(o.discount ? [[`Discount${offer ? ` · ${offer.name}` : ''}`, `− ${taka(o.discount)}`]] : []),
            ['Charges', taka(o.charges)],
            ['Total', taka(o.total)],
            ['Method · reference', `${o.method} · ${o.reference || 'not submitted'}`],
            ['Evidence', o.evidence ? `${o.evidence} (supporting only)` : '—'],
            ...(o.verifiedBy ? [['Verified by', o.verifiedBy]] : []),
            ...(o.activatedAt ? [['Activated', fmtDateTime(o.activatedAt)]] : []),
            ...(o.refund ? [['Refund', `${taka(o.refund.amount)} · ${o.refund.reason} · ${o.refund.by}`]] : []),
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 px-3 py-1.5">
              <dt className="text-ink-500">{k}</dt>
              <dd className="text-right tabular-nums text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        {mode === 'reference' && (
          <div className="space-y-2 rounded-lg bg-ink-50 p-3">
            <Field label="Transaction ID"><Input value={ref} onChange={(v) => setRef(v.toUpperCase())} placeholder="e.g. 9KX2M4QP7A" /></Field>
            <label className="block text-xs text-ink-600">
              Screenshot (optional)
              <input type="file" accept="image/*" className="mt-1 block text-xs" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />
            </label>
            <div className="flex justify-end gap-2"><Button onClick={() => setMode(null)}>Cancel</Button><Button kind="primary" onClick={() => run(saas.submitReference(o.id, ref, file))}>Submit for verification</Button></div>
          </div>
        )}
        {mode === 'reject' && (
          <div className="space-y-2 rounded-lg bg-ink-50 p-3">
            <Field label="Why couldn’t it be matched?"><Textarea value={reason} onChange={setReason} placeholder="e.g. Reference not in bKash statement for 25 Oct" /></Field>
            <div className="flex justify-end gap-2"><Button onClick={() => setMode(null)}>Cancel</Button><Button kind="danger" onClick={() => run(saas.rejectPayment(o.id, reason))}>Mark failed</Button></div>
          </div>
        )}
        {mode === 'refund' && (
          <div className="space-y-2 rounded-lg bg-ink-50 p-3">
            <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
              <Field label="Amount ৳"><Input type="number" value={amount} onChange={setAmount} /></Field>
              <Field label="Reason"><Input value={reason} onChange={setReason} placeholder="e.g. Paid twice" /></Field>
            </div>
            <p className="text-xs text-ink-500">Full refund removes purchased benefits and reverses unused credits. Past records stay.</p>
            <div className="flex justify-end gap-2"><Button onClick={() => setMode(null)}>Cancel</Button><Button kind="danger" onClick={() => run(saas.requestRefund(o.id, Number(amount), reason))}>Approve refund</Button></div>
          </div>
        )}
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}

        {!mode && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 pt-3">
            {(o.state === 'PAYMENT_PENDING' || o.state === 'FAILED') && <Button onClick={() => { setError(''); setMode('reference'); }}>Enter reference for owner</Button>}
            {o.state === 'VERIFICATION_PENDING' && (
              <>
                <Button kind="primary" disabled={!saas.can('payments.view')} onClick={() => { onClose(); navigate(`/saas/payments?order=${o.id}`); }}>Open in verification</Button>
              </>
            )}
            {o.state === 'ACTIVATION_PENDING' && <Button kind="primary" disabled={!saas.canFor('payments.verify', o.tenantId)} onClick={() => run(saas.activate(o.id))}>Activate benefits</Button>}
            {(o.state === 'COMPLETED' || o.state === 'ACTIVATION_PENDING') && o.total > 0 && <Button disabled={!saas.canFor('payments.refund', o.tenantId)} onClick={() => { setAmount(String(o.total)); setReason(''); setError(''); setMode('refund'); }}>Refund</Button>}
            {o.state === 'REFUND_PENDING' && <Button kind="primary" disabled={!saas.canFor('payments.refund', o.tenantId)} onClick={() => run(saas.completeRefund(o.id))}>Mark money returned</Button>}
            {!saas.canFor('payments.verify', o.tenantId) && (o.state === 'VERIFICATION_PENDING' || o.state === 'ACTIVATION_PENDING') && <p className="w-full text-right text-[11px] text-ink-500">Only payment verifiers for this business can verify or activate.</p>}
          </div>
        )}
        <p className="text-[11px] text-ink-500">Prototype: statement matching and money movement need the payment backend.</p>
      </div>
    </Modal>
  );
}
