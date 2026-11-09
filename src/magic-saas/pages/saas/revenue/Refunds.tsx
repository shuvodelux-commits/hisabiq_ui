import React, { useState } from 'react';
import { Tabs } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { Card, Denied, PageTitle, SummaryStrip } from '../../../components/saas/SaasBits';
import { BillingLedger } from '../../../components/saas/BillingLedger';
import { formatNumber } from '../../../utils/currency';

export function Refunds() {
  const saas = useSaas();
  const [tab, setTab] = useState<'pending' | 'done' | 'eligible'>('pending');
  if (!saas.can('payments.view')) return <Denied what="refunds" role={saas.staff.label} />;
  const orders = saas.state.orders.filter((o) => saas.inScope(o.tenantId));
  const lists = {
    pending: orders.filter((o) => o.state === 'REFUND_PENDING'),
    done: orders.filter((o) => o.state === 'REFUNDED'),
    eligible: orders.filter((o) => o.state === 'COMPLETED' && o.total > 0),
  };
  return (
    <div className="space-y-4">
      <PageTitle title="Refunds & adjustments" bn="রিফান্ড" description="Approve a refund, send the money, then mark it returned. A full refund removes purchased benefits; records stay." />
      <SummaryStrip
        items={[
          { label: 'To send', value: lists.pending.length, tone: lists.pending.length ? 'warning' : undefined, helper: `৳${formatNumber(lists.pending.reduce((n, o) => n + (o.refund?.amount ?? 0), 0))}` },
          { label: 'Refunded', value: `৳${formatNumber(lists.done.reduce((n, o) => n + (o.refund?.amount ?? 0), 0))}`, helper: `${lists.done.length} invoices` },
        ]}
      />
      <Card>
        <Tabs label="Refund views" value={tab} onChange={(v) => setTab(v as typeof tab)} items={[{ id: 'pending', label: 'To send', count: lists.pending.length }, { id: 'done', label: 'Refunded', count: lists.done.length }, { id: 'eligible', label: 'Paid invoices', count: lists.eligible.length }]} />
        <BillingLedger orders={lists[tab]} showBusiness stateFilter={false} empty={tab === 'pending' ? 'No refunds waiting.' : 'Nothing here.'} />
        <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">Open an invoice to approve a refund or mark money returned.{!saas.can('payments.refund') && ' Your role can view only.'}</p>
      </Card>
    </div>
  );
}
