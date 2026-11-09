import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, ShieldCheck, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { RowActions } from '../../components/saas/RowActions';
import { Tabs } from '../../prototype/Ui';
import { useSaas } from '../../contexts/SaasContext';
import { useFirstLoad } from '../../hooks/saas/useFirstLoad';
import { Badge, Card, Denied, EmptyRow, LoadingList, PageTitle, SummaryStrip, th, td, thAction, tdAction } from '../../components/saas/SaasBits';
import { VerifyPaymentDialog } from '../../components/saas/billing/VerifyPaymentDialog';
import { paymentChecks } from '../../utils/saasBilling';
import { fmtDateTime } from '../../utils/saas';
import { formatNumber } from '../../utils/currency';

/** Verification queue: claim one, check it against the statement, then verify or reject. */
export function Payments() {
  const saas = useSaas();
  const loading = useFirstLoad();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'verify' | 'activate' | 'failed'>('verify');
  if (!saas.can('payments.view')) return <Denied what="payment verification" role={saas.staff.label} />;
  const { orders, statement, settings, tenants } = saas.state;
  const mine = orders.filter((o) => saas.inScope(o.tenantId));
  const lists = {
    verify: mine.filter((o) => o.state === 'VERIFICATION_PENDING'),
    activate: mine.filter((o) => o.state === 'ACTIVATION_PENDING'),
    failed: mine.filter((o) => o.state === 'FAILED'),
  };
  const rows = lists[tab].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const open = params.get('order');
  const unmatched = statement.filter((l) => !orders.some((o) => o.reference === l.trx));

  return (
    <div className="space-y-4">
      <PageTitle title="Payment verification" bn="পেমেন্ট যাচাই" description="Match each TRX ID to the HisabIQ collection statement. One person enters proof, a different person verifies." />
      <SummaryStrip
        items={[
          { label: 'To verify', value: lists.verify.length, tone: lists.verify.length ? 'warning' : undefined, helper: `৳${formatNumber(lists.verify.reduce((n, o) => n + o.total, 0))}` },
          { label: 'Claimed by you', value: lists.verify.filter((o) => o.claimedBy === saas.staff.name).length },
          { label: 'Paid, not activated', value: lists.activate.length, tone: lists.activate.length ? 'warning' : undefined },
          { label: 'Statement lines without invoice', value: unmatched.length, helper: 'Possible wrong reference' },
        ]}
      />
      <Card>
        <Tabs label="Verification queues" value={tab} onChange={(v) => setTab(v as typeof tab)} items={[{ id: 'verify', label: 'To verify', count: lists.verify.length }, { id: 'activate', label: 'To activate', count: lists.activate.length }, { id: 'failed', label: 'Rejected', count: lists.failed.length }]} />
        {loading ? <LoadingList /> : (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Invoice</th><th className={th}>Business</th><th className={`${th} hidden md:table-cell`}>Method · TRX</th><th className={`${th} text-right`}>Amount</th><th className={th}>Checks</th><th className={`${th} hidden lg:table-cell`}>Reviewer</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {rows.length === 0 ? <EmptyRow cols={7} text="Queue is clear." /> : rows.map((o) => {
                  const { checks } = paymentChecks(o, statement, orders, settings);
                  const err = checks.find((c) => c.level === 'error');
                  const warn = checks.find((c) => c.level === 'warning');
                  const canAct = saas.canFor('payments.verify', o.tenantId);
                  return (
                    <tr key={o.id} className="border-b border-ink-100 last:border-0">
                      <td className={td}><span className="font-medium">{o.id}</span><span className="block text-[11px] text-ink-500">{fmtDateTime(o.createdAt)}</span></td>
                      <td className={td}>{tenants.find((t) => t.id === o.tenantId)?.name}</td>
                      <td className={`${td} hidden md:table-cell`}>{o.method}<span className="block text-[11px] text-ink-500">{o.reference || '—'}</span></td>
                      <td className={`${td} text-right font-medium tabular-nums`}>{formatNumber(o.total)}</td>
                      <td className={td}>
                        {tab === 'failed' ? <span className="text-xs text-ink-600">{o.failureReason}</span> : tab === 'activate' ? <Badge tone="success">Verified by {o.verifiedBy}</Badge> : <Badge tone={err ? 'danger' : warn ? 'warning' : 'success'} dot>{err ? 'Problem' : warn ? 'Check' : 'Matches'}</Badge>}
                        {tab === 'verify' && (err || warn) && <span className="block max-w-[260px] truncate text-[11px] text-ink-500" title={(err ?? warn)!.text}>{(err ?? warn)!.text}</span>}
                      </td>
                      <td className={`${td} hidden text-xs text-ink-600 lg:table-cell`}>{o.claimedBy ?? '—'}</td>
                      <td className={tdAction}>
                        <RowActions label={`Actions for ${o.id}`} items={[
                          { label: o.claimedBy === saas.staff.name ? 'Continue review' : o.claimedBy ? 'View review' : 'Claim & review', icon: ShieldCheck, hidden: tab !== 'verify', onSelect: () => setParams({ order: o.id }) },
                          { label: 'Activate benefits', icon: Zap, hidden: tab !== 'activate' || !canAct, onSelect: () => { const r = saas.activate(o.id); r.ok ? toast.success(r.message) : toast.error(r.message); } },
                          { label: 'Open invoice', icon: Eye, onSelect: () => navigate(`/saas/invoices?order=${o.id}`) },
                        ]} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!saas.can('payments.verify') && <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">View only — your role ({saas.staff.label}) can’t verify or activate.</p>}
      </Card>
      {unmatched.length > 0 && (
        <Card>
          <h2 className="border-b border-ink-100 px-4 py-2.5 text-sm font-semibold">Statement lines with no invoice</h2>
          <ul className="divide-y divide-ink-100 text-[13px]">
            {unmatched.map((l) => <li key={l.id} className="flex flex-wrap justify-between gap-2 px-4 py-2"><span>{l.method} · TRX <b className="font-medium">{l.trx}</b> · from {l.sender}</span><span className="tabular-nums text-ink-600">৳{l.amount} · {fmtDateTime(l.at)}</span></li>)}
          </ul>
        </Card>
      )}
      {open && <VerifyPaymentDialog orderId={open} onClose={() => setParams({})} />}
    </div>
  );
}
