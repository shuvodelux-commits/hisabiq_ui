import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ImageIcon, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Textarea } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { Badge, orderMeta } from '../SaasBits';
import { paymentChecks } from '../../../utils/saasBilling';
import { fmtDateTime } from '../../../utils/saas';
import { taka } from '../../../utils/currency';
import type { Result } from '../../../types/saas';

/** Evidence beside the invoice. Claim → check → verify, reject or ask for more. */
export function VerifyPaymentDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const saas = useSaas();
  const o = saas.state.orders.find((x) => x.id === orderId);
  const [mode, setMode] = useState<null | 'reject' | 'info'>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const { checks, line } = o ? paymentChecks(o, saas.state.statement, saas.state.orders, saas.state.settings) : { checks: [], line: null };
  const balance = o ? o.total - (o.paidAmount ?? 0) : 0;
  const [amount, setAmount] = useState(String(line ? Math.min(line.amount, balance) : balance));
  if (!o) return null;
  const t = saas.state.tenants.find((x) => x.id === o.tenantId);
  const canVerify = saas.canFor('payments.verify', o.tenantId);
  const mine = o.claimedBy === saas.staff.name;
  const ownSubmission = o.createdBy.startsWith(saas.staff.name);
  const hardStop = checks.some((c) => c.level === 'error');
  const pending = o.state === 'VERIFICATION_PENDING';

  const run = (r: Result, close = false) => {
    if (!r.ok) return setError(r.message);
    toast.success(r.message);
    setError('');
    setMode(null);
    if (close) onClose();
  };

  return (
    <Modal
      title={`Verify payment · ${o.id}`}
      onClose={onClose}
      footer={
        !pending || !canVerify ? <Button onClick={onClose}>Close</Button> : !o.claimedBy ? (
          <><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => run(saas.claimPayment(o.id))}>Claim to review</Button></>
        ) : !mine ? (
          <Button onClick={onClose}>Close</Button>
        ) : mode ? (
          <><Button onClick={() => setMode(null)}>Back</Button><Button kind={mode === 'reject' ? 'danger' : 'primary'} onClick={() => run(saas.rejectPayment(o.id, reason, mode === 'info'), true)}>{mode === 'reject' ? 'Reject payment' : 'Send request to owner'}</Button></>
        ) : (
          <>
            <Button kind="ghost" onClick={() => run(saas.claimPayment(o.id, true), true)}>Release</Button>
            <Button onClick={() => { setReason(''); setMode('info'); }}>Request info</Button>
            <Button kind="danger" onClick={() => { setReason(hardStop ? checks.find((c) => c.level === 'error')!.text : ''); setMode('reject'); }}>Reject</Button>
            <Button kind="primary" disabled={hardStop || ownSubmission} title={ownSubmission ? 'Someone else must verify proof you entered' : hardStop ? 'Resolve the red checks first' : undefined} onClick={() => run(saas.verifyPayment(o.id, Number(amount)), true)}>Verify ৳{Number(amount) || 0}</Button>
          </>
        )
      }
    >
      <div className="space-y-3 text-[13px]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-ink-600">{t?.name} · {t?.owner} · {t?.phone}</p>
          <Badge tone={orderMeta[o.state].tone} dot>{orderMeta[o.state].label}</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-lg border border-ink-100 p-3" aria-label="Invoice">
            <h3 className="text-xs font-semibold text-ink-500">Invoice</h3>
            <dl className="mt-1 space-y-1">
              <Row k="For" v={o.terms.benefit} />
              <Row k="Total" v={taka(o.total)} />
              {(o.paidAmount ?? 0) > 0 && <Row k="Already paid" v={taka(o.paidAmount ?? 0)} />}
              <Row k="Balance due" v={taka(balance)} strong />
              <Row k="Issued" v={fmtDateTime(o.createdAt)} />
            </dl>
          </section>
          <section className="rounded-lg border border-ink-100 p-3" aria-label="Owner's proof">
            <h3 className="text-xs font-semibold text-ink-500">Proof from owner</h3>
            <dl className="mt-1 space-y-1">
              <Row k="Method" v={o.method} />
              <Row k="TRX ID" v={o.reference || '—'} strong />
              <Row k="Sent from" v={o.payer ?? 'Not given'} />
              <Row k="Entered by" v={o.createdBy} />
            </dl>
            <div className="mt-2 flex items-center gap-2 rounded-md bg-ink-50 px-2 py-2 text-[11px] text-ink-600">
              <ImageIcon className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
              {o.evidence ? `${o.evidence} — supporting only` : 'No screenshot'}
            </div>
          </section>
        </div>

        <section className="rounded-lg border border-ink-100 p-3" aria-label="Statement checks">
          <h3 className="text-xs font-semibold text-ink-500">Statement checks</h3>
          {line && <p className="mt-1 text-[11px] text-ink-500">{line.method} {line.account} · TRX {line.trx} · ৳{line.amount} from {line.sender} · {fmtDateTime(line.at)}</p>}
          <ul className="mt-2 space-y-1.5">
            {checks.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                {c.level === 'ok' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" /> : c.level === 'warning' ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />}
                <span className={c.level === 'error' ? 'text-danger' : 'text-ink-700'}>{c.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {o.infoRequest && <p className="rounded-lg bg-info-bg px-3 py-2 text-xs text-info">Asked owner: {o.infoRequest}</p>}
        {pending && o.claimedBy && !mine && <p className="rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">{o.claimedBy} is reviewing this. You can view it but not act.</p>}
        {pending && mine && ownSubmission && <p className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">You entered this proof, so a different person must verify it.</p>}
        {pending && mine && !mode && !hardStop && (
          <Field label="Amount received (৳)" hint="Less than the balance records a part payment — the benefit stays off until fully paid.">
            <Input type="number" min={0} value={amount} onChange={setAmount} />
          </Field>
        )}
        {mode && (
          <Field label={mode === 'reject' ? 'Reason the owner will see' : 'What should the owner send?'}>
            <Textarea value={reason} onChange={setReason} placeholder={mode === 'reject' ? 'e.g. TRX not found in our bKash statement for 25 Oct' : 'e.g. Please send the bKash SMS with the full TRX ID'} />
          </Field>
        )}
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-500">{k}</dt>
      <dd className={`text-right tabular-nums ${strong ? 'font-semibold text-ink' : 'text-ink-700'}`}>{v}</dd>
    </div>
  );
}
