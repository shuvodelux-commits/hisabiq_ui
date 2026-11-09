import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download } from 'lucide-react';
import { Button, downloadCsv } from '../../../prototype/Ui';
import { useSaas, effectivePlan } from '../../../contexts/SaasContext';
import { Card, Denied, PageTitle, SummaryStrip, th, td } from '../../../components/saas/SaasBits';
import { planOrder, planPrice } from '../../../data/saasSeeds';
import { businessHealth } from '../../../utils/saasSignals';
import { invoiceStatus } from '../../../utils/saasBilling';
import { formatNumber } from '../../../utils/currency';

/** Platform numbers from verified money only. Pending payments are never counted as revenue. */
export function PlatformReports() {
  const saas = useSaas();
  if (!saas.can('reports.view')) return <Denied what="platform reports" role={saas.staff.label} />;
  const { tenants, orders, nudges, tickets } = saas.state;
  const paying = tenants.filter((t) => ['Active', 'Grace'].includes(t.status) && t.planCode !== 'FREE');
  const mrr = paying.reduce((n, t) => n + planPrice[t.planCode], 0);
  const collected = orders.filter((o) => invoiceStatus(o) === 'Paid').reduce((n, o) => n + o.total, 0);
  const refunded = orders.filter((o) => o.state === 'REFUNDED').reduce((n, o) => n + (o.refund?.amount ?? 0), 0);
  const byPlan = planOrder.map((p) => ({ plan: p, businesses: tenants.filter((t) => effectivePlan(t) === p && t.account !== 'Archived').length, mrr: tenants.filter((t) => t.planCode === p && ['Active', 'Grace'].includes(t.status)).length * planPrice[p] }));
  const health = (['Healthy', 'Watch', 'At risk'] as const).map((l) => ({ level: l, n: tenants.filter((t) => businessHealth(t, tickets.filter((x) => x.tenantId === t.id && x.status !== 'Resolved').length).level === l).length }));
  const byKind = (['SUBSCRIPTION', 'SMS', 'SERVICE', 'FEATURE'] as const).map((k) => ({ kind: k, total: orders.filter((o) => o.kind === k && invoiceStatus(o) === 'Paid').reduce((n, o) => n + o.total, 0) }));
  const trialConv = tenants.filter((t) => t.status === 'Trial').length;

  return (
    <div className="space-y-4">
      <PageTitle
        title="Reports"
        bn="রিপোর্ট"
        description="Verified collections only. Waiting payments and list prices are shown separately."
        actions={saas.can('reports.export') && <Button onClick={() => downloadCsv('hisabiq-platform.csv', [['Plan', 'Businesses', 'MRR'], ...byPlan.map((r) => [r.plan, r.businesses, r.mrr])])}><Download className="size-4" />CSV</Button>}
      />
      <SummaryStrip
        items={[
          { label: 'Monthly recurring (list)', value: `৳${formatNumber(mrr)}`, helper: `${paying.length} paying businesses` },
          { label: 'Collected (verified)', value: `৳${formatNumber(collected)}`, tone: 'success' },
          { label: 'Refunded', value: `৳${formatNumber(refunded)}` },
          { label: 'On trial', value: trialConv },
          { label: 'Owner nudges sent', value: nudges.length, helper: `${nudges.filter((n) => n.outcome !== 'Sent').length} led to upgrade/renewal` },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold">Businesses by plan</h2>
          <div className="mt-3 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPlan}>
                <CartesianGrid vertical={false} stroke="#EEF1F4" />
                <XAxis dataKey="plan" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip />
                <Bar dataKey="businesses" name="Businesses" fill="#0F766E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="border-b border-ink-100 px-4 py-2.5 text-sm font-semibold">Collections by type</h2>
          <table data-erp-table className="w-full text-[13px]">
            <thead><tr className="border-b border-ink-100"><th className={th}>Type</th><th className={`${th} text-right`}>Verified ৳</th></tr></thead>
            <tbody>{byKind.map((r) => <tr key={r.kind} className="border-b border-ink-100 last:border-0"><td className={td}>{r.kind.charAt(0) + r.kind.slice(1).toLowerCase()}</td><td className={`${td} text-right tabular-nums`}>{formatNumber(r.total)}</td></tr>)}</tbody>
          </table>
          <h2 className="border-y border-ink-100 px-4 py-2.5 text-sm font-semibold">Business health</h2>
          <ul className="divide-y divide-ink-100 text-[13px]">{health.map((h) => <li key={h.level} className="flex justify-between px-4 py-2"><span>{h.level}</span><span className="tabular-nums">{h.n}</span></li>)}</ul>
        </Card>
      </div>
    </div>
  );
}
