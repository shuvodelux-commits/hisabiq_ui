import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Ban, Download, Eye, Plus, ShieldCheck } from 'lucide-react';
import { RowActions } from '../../../components/saas/RowActions';
import { toast } from 'sonner';
import { Button, Field, Modal, Select, Tabs, Textarea, downloadCsv } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { useFirstLoad } from '../../../hooks/saas/useFirstLoad';
import { Badge, Card, Denied, EmptyRow, LoadingList, PageTitle, SearchBox, SummaryStrip, th, td, thAction, tdAction } from '../../../components/saas/SaasBits';
import { OrderDetailDialog } from '../../../components/saas/OrderDetailDialog';
import { CheckoutDialog } from '../../../components/saas/CheckoutDialog';
import { balanceDue, dueDate, invoiceKind, invoiceStatus, invoiceTone, type InvoiceStatus } from '../../../utils/saasBilling';
import { fmtDate } from '../../../utils/saas';
import { formatNumber } from '../../../utils/currency';

const views: ('All' | InvoiceStatus)[] = ['All', 'Issued', 'Proof submitted', 'Part paid', 'Overdue', 'Paid', 'Refunded', 'Voided'];

export function Invoices() {
  const saas = useSaas();
  const loading = useFirstLoad();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [view, setView] = useState<(typeof views)[number]>('All');
  const [kind, setKind] = useState('All types');
  const [q, setQ] = useState('');
  const [pick, setPick] = useState(false);
  const [checkoutFor, setCheckoutFor] = useState<string | null>(null);
  const [voiding, setVoiding] = useState<string | null>(null);
  const open = params.get('order');

  const all = saas.state.orders.filter((o) => saas.inScope(o.tenantId));
  const name = (id: string) => saas.state.tenants.find((t) => t.id === id)?.name ?? id;
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all
      .filter((o) => view === 'All' || invoiceStatus(o) === view)
      .filter((o) => kind === 'All types' || invoiceKind(o) === kind)
      .filter((o) => !s || `${o.id} ${o.reference} ${name(o.tenantId)}`.toLowerCase().includes(s))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, view, kind, q]);

  if (!saas.can('invoices.view')) return <Denied what="invoices" role={saas.staff.label} />;
  const sum = (st: InvoiceStatus[]) => all.filter((o) => st.includes(invoiceStatus(o))).reduce((n, o) => n + balanceDue(o), 0);
  const canCreate = saas.can('invoices.edit');

  return (
    <div className="space-y-4">
      <PageTitle
        title="Invoices"
        bn="ইনভয়েস"
        description="What HisabIQ has billed businesses. Benefits switch on only after full payment is verified."
        actions={
          <>
            <Button onClick={() => downloadCsv('hisabiq-invoices.csv', [['Invoice', 'Business', 'Type', 'For', 'Total', 'Paid', 'Balance', 'Status', 'Issued', 'Due'], ...rows.map((o) => [o.id, name(o.tenantId), invoiceKind(o), o.terms.name, o.total, o.paidAmount ?? 0, balanceDue(o), invoiceStatus(o), o.createdAt.slice(0, 10), dueDate(o)])])}><Download className="size-4" />CSV</Button>
            {canCreate && <Button kind="primary" onClick={() => setPick(true)}><Plus className="size-4" />New invoice</Button>}
          </>
        }
      />
      <SummaryStrip
        items={[
          { label: 'Outstanding', value: `৳${formatNumber(sum(['Issued', 'Part paid', 'Overdue', 'Proof submitted']))}` },
          { label: 'Overdue', value: `৳${formatNumber(sum(['Overdue']))}`, tone: sum(['Overdue']) ? 'danger' : undefined, helper: `${all.filter((o) => invoiceStatus(o) === 'Overdue').length} invoices` },
          { label: 'Waiting verification', value: all.filter((o) => invoiceStatus(o) === 'Proof submitted').length, tone: 'warning' },
          { label: 'Collected', value: `৳${formatNumber(all.filter((o) => invoiceStatus(o) === 'Paid').reduce((n, o) => n + o.total, 0))}`, tone: 'success' },
        ]}
      />
      <Card>
        <Tabs label="Invoice status" value={view} onChange={(v) => setView(v as typeof view)} items={views.map((v) => ({ id: v, label: v, count: v === 'All' ? all.length : all.filter((o) => invoiceStatus(o) === v).length }))} />
        <div className="flex flex-wrap gap-2 border-b border-ink-100 p-3">
          <SearchBox value={q} onChange={setQ} placeholder="Search invoice, TRX ID or business" />
          <div className="w-[170px]"><Select value={kind} onChange={setKind} options={['All types', 'Subscription', 'SMS', 'Service', 'Other · add-on']} /></div>
        </div>
        {loading ? <LoadingList /> : (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Invoice</th><th className={th}>Business</th><th className={`${th} hidden md:table-cell`}>Type</th><th className={`${th} text-right`}>Total</th><th className={`${th} hidden text-right lg:table-cell`}>Balance</th><th className={`${th} hidden md:table-cell`}>Due</th><th className={th}>Status</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {rows.length === 0 ? <EmptyRow cols={8} text="No invoices match." /> : rows.map((o) => {
                  const st = invoiceStatus(o);
                  return (
                    <tr key={o.id} className="border-b border-ink-100 last:border-0">
                      <td className={td}><button type="button" onClick={() => setParams({ order: o.id })} className="font-medium text-teal-700 hover:underline">{o.id}</button><span className="block text-[11px] text-ink-500">{o.terms.benefit}</span></td>
                      <td className={td}>{name(o.tenantId)}</td>
                      <td className={`${td} hidden text-ink-600 md:table-cell`}>{invoiceKind(o)}</td>
                      <td className={`${td} text-right font-medium tabular-nums`}>{formatNumber(o.total)}</td>
                      <td className={`${td} hidden text-right tabular-nums lg:table-cell`}>{balanceDue(o) ? formatNumber(balanceDue(o)) : '—'}</td>
                      <td className={`${td} hidden whitespace-nowrap text-ink-600 md:table-cell`}>{fmtDate(dueDate(o))}</td>
                      <td className={td}><Badge tone={invoiceTone[st]} dot>{st}</Badge></td>
                      <td className={tdAction}>
                        <RowActions
                          label={`Actions for ${o.id}`}
                          items={[
                            { label: 'View invoice', icon: Eye, onSelect: () => setParams({ order: o.id }) },
                            { label: 'Verify payment', icon: ShieldCheck, hidden: st !== 'Proof submitted' || !saas.canFor('payments.verify', o.tenantId), onSelect: () => navigate(`/saas/payments?order=${o.id}`) },
                            { label: 'Void invoice', icon: Ban, tone: 'danger', divider: true, hidden: !saas.canFor('invoices.edit', o.tenantId) || !['Issued', 'Overdue'].includes(st), onSelect: () => setVoiding(o.id) },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {open && <OrderDetailDialog orderId={open} onClose={() => setParams({})} />}
      {pick && <PickBusiness onClose={() => setPick(false)} onPick={(id) => { setPick(false); setCheckoutFor(id); }} />}
      {checkoutFor && <CheckoutDialog tenantId={checkoutFor} onClose={() => setCheckoutFor(null)} />}
      {voiding && <VoidDialog orderId={voiding} onClose={() => setVoiding(null)} />}
    </div>
  );
}

function PickBusiness({ onClose, onPick }: { onClose: () => void; onPick: (id: string) => void }) {
  const saas = useSaas();
  const list = saas.state.tenants.filter((t) => saas.canFor('invoices.edit', t.id) && t.account === 'Active');
  const [id, setId] = useState(list[0]?.id ?? '');
  return (
    <Modal title="New invoice" onClose={onClose} footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!id} onClick={() => onPick(id)}>Continue</Button></>}>
      {list.length ? <Field label="Business"><Select value={id} onChange={setId} options={list.map((t) => ({ value: t.id, label: `${t.name} · ${t.owner}` }))} /></Field> : <p className="text-[13px] text-ink-500">No active businesses you can bill.</p>}
    </Modal>
  );
}

function VoidDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const saas = useSaas();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  return (
    <Modal title={`Void ${orderId}`} onClose={onClose} footer={<><Button onClick={onClose}>Back</Button><Button kind="danger" onClick={() => { const r = saas.voidInvoice(orderId, reason); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Void invoice</Button></>}>
      <div className="space-y-2 text-[13px]">
        <p className="text-ink-600">The invoice stays in history as Voided. Use a refund instead if money was received.</p>
        <Field label="Reason"><Textarea value={reason} onChange={setReason} placeholder="e.g. Owner chose a different plan" /></Field>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
