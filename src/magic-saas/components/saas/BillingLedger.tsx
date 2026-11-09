import React, { useMemo, useState } from 'react';
import { Badge, EmptyRow, orderMeta, th, td } from './SaasBits';
import { Select } from '../../prototype/Ui';
import { OrderDetailDialog } from './OrderDetailDialog';
import { useSaas } from '../../contexts/SaasContext';
import { fmtDateTime } from '../../utils/saas';
import { formatNumber } from '../../utils/currency';
import type { OrderState, PaymentOrder } from '../../types/saas';

type Props = { orders: PaymentOrder[]; showBusiness?: boolean; stateFilter?: boolean; empty?: string };

/** Party Ledger-style billing history: compact toolbar, right-aligned amounts, row opens detail. */
export function BillingLedger({ orders, showBusiness = false, stateFilter = true, empty = 'No payment orders yet.' }: Props) {
  const saas = useSaas();
  const [open, setOpen] = useState<string | null>(null);
  const [state, setState] = useState<'ALL' | OrderState>('ALL');
  const rows = useMemo(() => orders.filter((o) => state === 'ALL' || o.state === state).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [orders, state]);
  const received = rows.filter((o) => o.state === 'COMPLETED' || o.state === 'ACTIVATION_PENDING').reduce((n, o) => n + o.total, 0);
  const refunded = rows.filter((o) => o.refund && o.state === 'REFUNDED').reduce((n, o) => n + (o.refund?.amount ?? 0), 0);
  const pending = rows.filter((o) => o.state === 'PAYMENT_PENDING' || o.state === 'VERIFICATION_PENDING').reduce((n, o) => n + o.total, 0);

  return (
    <div>
      {stateFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-4 py-2">
          <div className="w-[220px]">
            <Select value={state} onChange={(v) => setState(v as 'ALL' | OrderState)} options={[{ value: 'ALL', label: 'All states' }, ...Object.entries(orderMeta).map(([k, m]) => ({ value: k, label: m.label }))]} />
          </div>
          <p className="text-[11px] text-ink-500">
            Received <b className="font-medium tabular-nums text-success">৳{formatNumber(received)}</b> · Pending <b className="font-medium tabular-nums text-warning">৳{formatNumber(pending)}</b> · Refunded <b className="font-medium tabular-nums text-ink">৳{formatNumber(refunded)}</b>
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table data-erp-table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink-100">
              <th className={th}>Date</th>
              <th className={th}>Order</th>
              {showBusiness && <th className={th}>Business</th>}
              <th className={`${th} hidden md:table-cell`}>Method · ref</th>
              <th className={`${th} text-right`}>Amount</th>
              <th className={`${th} hidden text-right lg:table-cell`}>Discount</th>
              <th className={th}>State</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <EmptyRow cols={showBusiness ? 7 : 6} text={empty} />
            ) : (
              rows.map((o) => (
                <tr key={o.id} onClick={() => setOpen(o.id)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                  <td className={`${td} whitespace-nowrap text-ink-500`}>{fmtDateTime(o.createdAt)}</td>
                  <td className={td}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(o.id); }} className="font-medium text-teal-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">{o.id}</button>
                    <p className="text-[11px] text-ink-500">{o.terms.benefit}{o.bonusCredits ? ` + ${o.bonusCredits} bonus` : ''}</p>
                  </td>
                  {showBusiness && <td className={td}>{saas.state.tenants.find((t) => t.id === o.tenantId)?.name}</td>}
                  <td className={`${td} hidden text-ink-600 md:table-cell`}>{o.method}<span className="block text-[11px] text-ink-500">{o.reference || '—'}{o.evidence ? ' · screenshot' : ''}</span></td>
                  <td className={`${td} text-right font-medium tabular-nums`}>{formatNumber(o.total)}{o.refund && <span className="block text-[11px] font-normal text-danger">− {formatNumber(o.refund.amount)}</span>}</td>
                  <td className={`${td} hidden text-right tabular-nums text-ink-500 lg:table-cell`}>{o.discount ? formatNumber(o.discount) : '—'}</td>
                  <td className={td}><Badge tone={orderMeta[o.state].tone} dot>{orderMeta[o.state].label}</Badge></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {open && <OrderDetailDialog orderId={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
