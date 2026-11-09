import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Eye, FileText, MessageSquare, Timer, Undo2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { RowActions } from '../../../components/saas/RowActions';
import { Button, Field, Modal, Select, Tabs, Textarea } from '../../../prototype/Ui';
import { useSaas, effectivePlan } from '../../../contexts/SaasContext';
import { useFirstLoad } from '../../../hooks/saas/useFirstLoad';
import { Badge, Card, Denied, EmptyRow, LoadingList, PageTitle, SearchBox, SummaryStrip, tenantTone, th, td, thAction, tdAction } from '../../../components/saas/SaasBits';
import { MessageOwnerDialog } from '../../../components/saas/MessageOwnerDialog';
import { NOW, addDays, daysBetween, expiryText, fmtDate } from '../../../utils/saas';
import { planOrder, planPrice } from '../../../data/saasSeeds';
import type { PlanCode } from '../../../types/experience';
import type { Result, Tenant } from '../../../types/saas';

type View = 'all' | 'renewing' | 'trial' | 'grace' | 'expired' | 'scheduled';
type Action = { kind: 'extend' | 'change' | 'cancel'; tenant: Tenant } | { kind: 'message'; tenant: Tenant; tpl: string } | null;

export function Subscriptions() {
  const saas = useSaas();
  const loading = useFirstLoad();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('all');
  const [q, setQ] = useState('');
  const [action, setAction] = useState<Action>(null);
  const soon = addDays(NOW, 7);
  const tenants = saas.state.tenants.filter((t) => saas.inScope(t.id) && t.account !== 'Archived');

  const tests: Record<View, (t: Tenant) => boolean> = {
    all: () => true,
    renewing: (t) => t.status === 'Active' && !!t.expiresAt && t.expiresAt <= soon && t.planCode !== 'FREE',
    trial: (t) => t.status === 'Trial',
    grace: (t) => t.status === 'Grace',
    expired: (t) => t.status === 'Expired',
    scheduled: (t) => !!t.scheduledChange,
  };
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tenants.filter(tests[view]).filter((t) => !s || `${t.name} ${t.owner} ${t.phone}`.toLowerCase().includes(s)).sort((a, b) => (a.expiresAt ?? '9999').localeCompare(b.expiresAt ?? '9999'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenants, view, q]);

  if (!saas.can('subscriptions.view')) return <Denied what="subscriptions" role={saas.staff.label} />;
  const mrr = tenants.filter((t) => t.status === 'Active' || t.status === 'Grace').reduce((n, t) => n + planPrice[t.planCode], 0);
  const run = (r: Result) => (r.ok ? toast.success(r.message) : toast.error(r.message));

  return (
    <div className="space-y-4">
      <PageTitle title="Subscriptions" bn="সাবস্ক্রিপশন" description="Plans, renewals, trials and grace periods. Changes take effect at renewal unless stated." />
      <SummaryStrip
        items={[
          { label: 'Monthly recurring', value: `৳${mrr.toLocaleString('en-IN')}`, helper: 'Active + grace, list price' },
          { label: 'Renewing in 7 days', value: tenants.filter(tests.renewing).length },
          { label: 'Trials', value: tenants.filter(tests.trial).length, helper: `${tenants.filter((t) => t.status === 'Trial' && t.expiresAt && t.expiresAt <= soon).length} end this week` },
          { label: 'In grace', value: tenants.filter(tests.grace).length, tone: tenants.some(tests.grace) ? 'danger' : undefined },
          { label: 'Cancelling', value: tenants.filter((t) => t.scheduledChange?.kind === 'CANCEL').length, tone: 'warning' },
        ]}
      />
      <Card>
        <Tabs label="Subscription views" value={view} onChange={(v) => setView(v as View)} items={(Object.keys(tests) as View[]).map((id) => ({ id, label: { all: 'All', renewing: 'Renewing soon', trial: 'Trials', grace: 'Grace', expired: 'Expired', scheduled: 'Scheduled changes' }[id], count: tenants.filter(tests[id]).length }))} />
        <div className="border-b border-ink-100 p-3"><SearchBox value={q} onChange={setQ} placeholder="Search business, owner or phone" /></div>
        {loading ? <LoadingList /> : (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Business</th><th className={th}>Plan</th><th className={th}>Ends</th><th className={`${th} hidden lg:table-cell`}>Scheduled</th><th className={`${th} hidden md:table-cell`}>Last reminder</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {rows.length === 0 ? <EmptyRow cols={6} text="No subscriptions in this view." /> : rows.map((t) => {
                  const exp = expiryText(t.expiresAt);
                  const canEdit = saas.canFor('subscriptions.edit', t.id);
                  return (
                    <tr key={t.id} className="border-b border-ink-100 last:border-0">
                      <td className={td}><Link to={`/saas/tenants/${t.id}?tab=plan`} className="font-medium text-ink hover:text-teal-700 hover:underline">{t.name}</Link><span className="block text-[11px] text-ink-500">{t.owner} · {t.phone}</span></td>
                      <td className={td}><span className="mr-1.5 font-medium">{effectivePlan(t)}</span><Badge tone={tenantTone[t.status]} dot>{t.status}</Badge></td>
                      <td className={`${td} whitespace-nowrap ${exp.tone === 'danger' ? 'text-danger' : exp.tone === 'warning' ? 'text-warning' : 'text-ink-600'}`}>{exp.text}{t.status === 'Grace' && <span className="block text-[11px]">Grace ends {fmtDate(addDays(t.expiresAt ?? NOW, saas.state.settings.graceDays))}</span>}</td>
                      <td className={`${td} hidden text-xs lg:table-cell`}>{t.scheduledChange ? <>{t.scheduledChange.kind === 'CANCEL' ? <span className="text-danger">Cancels</span> : `→ ${t.scheduledChange.planCode}`} on {fmtDate(t.scheduledChange.at)}<span className="block text-[11px] text-ink-500">by {t.scheduledChange.by}</span></> : '—'}</td>
                      <td className={`${td} hidden text-xs text-ink-500 md:table-cell`}>{t.reminders[0] ? `${t.reminders[0].template} · ${daysBetween(t.reminders[0].at.slice(0, 10), NOW)}d ago` : 'None'}</td>
                      <td className={tdAction}>
                        <RowActions
                          label={`Actions for ${t.name}`}
                          items={[
                            { label: 'Open business', icon: Eye, onSelect: () => navigate(`/saas/tenants/${t.id}?tab=plan`) },
                            { label: 'Message owner', icon: MessageSquare, hidden: !canEdit, onSelect: () => setAction({ kind: 'message', tenant: t, tpl: t.status === 'Grace' ? 'TPL-GRACE' : 'TPL-RENEW' }) },
                            { label: 'Extend trial', icon: Timer, hidden: !canEdit || t.status !== 'Trial', onSelect: () => setAction({ kind: 'extend', tenant: t }) },
                            { label: 'Change plan', icon: ArrowLeftRight, hidden: !canEdit || !t.expiresAt || t.planCode === 'FREE' || !!t.scheduledChange, onSelect: () => setAction({ kind: 'change', tenant: t }) },
                            { label: 'Create renewal invoice', icon: FileText, hidden: !saas.canFor('invoices.edit', t.id) || t.planCode === 'FREE' || !['Active', 'Grace', 'Trial'].includes(t.status), onSelect: () => run(saas.createRenewalInvoice(t.id)) },
                            { label: 'Undo scheduled change', icon: Undo2, hidden: !canEdit || !t.scheduledChange, onSelect: () => run(saas.undoScheduled(t.id)) },
                            { label: 'Cancel at renewal', icon: XCircle, tone: 'danger', divider: true, hidden: !canEdit || !t.expiresAt || t.planCode === 'FREE' || !!t.scheduledChange, onSelect: () => setAction({ kind: 'cancel', tenant: t }) },
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
      {action?.kind === 'message' && <MessageOwnerDialog tenantId={action.tenant.id} templateId={action.tpl} onClose={() => setAction(null)} />}
      {action && action.kind !== 'message' && <ChangeDialog kind={action.kind} tenant={action.tenant} onClose={() => setAction(null)} />}
    </div>
  );
}

function ChangeDialog({ kind, tenant, onClose }: { kind: 'extend' | 'change' | 'cancel'; tenant: Tenant; onClose: () => void }) {
  const saas = useSaas();
  const others = planOrder.filter((p) => p !== 'FREE' && p !== tenant.planCode);
  const [plan, setPlan] = useState<PlanCode>(others[0]);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const go = () => {
    const r = kind === 'extend' ? saas.extendTrial(tenant.id, reason) : kind === 'change' ? saas.scheduleChange(tenant.id, 'PLAN', plan) : saas.scheduleChange(tenant.id, 'CANCEL');
    if (!r.ok) return setError(r.message);
    toast.success(r.message);
    onClose();
  };
  return (
    <Modal title={`${kind === 'extend' ? 'Extend trial' : kind === 'change' ? 'Change plan at renewal' : 'Cancel at renewal'} · ${tenant.name}`} onClose={onClose} footer={<><Button onClick={onClose}>Back</Button><Button kind={kind === 'cancel' ? 'danger' : 'primary'} onClick={go}>Confirm</Button></>}>
      <div className="space-y-3 text-[13px]">
        {kind === 'extend' && (
          <>
            <p className="text-ink-600">Adds 7 days to the trial ending {fmtDate(tenant.expiresAt)}. Allowed once every 90 days.</p>
            <Field label="Reason"><Textarea value={reason} onChange={setReason} placeholder="e.g. Owner still importing opening stock" /></Field>
          </>
        )}
        {kind === 'change' && (
          <>
            <Field label="New plan"><Select value={plan} onChange={(v) => setPlan(v as PlanCode)} options={others.map((p) => ({ value: p, label: `${p} · ৳${planPrice[p]}/month` }))} /></Field>
            <p className="text-xs text-ink-500">Stays on {tenant.planCode} until {fmtDate(tenant.expiresAt)}. The renewal invoice uses the new plan. {planOrder.indexOf(plan) < planOrder.indexOf(tenant.planCode) ? 'Downgrades keep all records; anything over the new limits becomes read-only.' : ''}</p>
          </>
        )}
        {kind === 'cancel' && <p className="text-ink-600">Nothing changes until {fmtDate(tenant.expiresAt)}. Then the business moves to Free and keeps all records.</p>}
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
