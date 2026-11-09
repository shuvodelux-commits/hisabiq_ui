import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, Modal, Select, Tabs, Textarea } from '../../prototype/Ui';
import { useSaas, effectivePlan } from '../../contexts/SaasContext';
import { Badge, Denied, accountTone, tenantTone } from '../../components/saas/SaasBits';
import { CheckoutDialog } from '../../components/saas/CheckoutDialog';
import { OverviewTab } from '../../components/saas/tenant/OverviewTab';
import { SettingsTab } from '../../components/saas/tenant/SettingsTab';
import { PlanUsageTab } from '../../components/saas/tenant/PlanUsageTab';
import { SupportTab } from '../../components/saas/tenant/SupportTab';
import { HistoryTab } from '../../components/saas/tenant/HistoryTab';
import { planCatalog } from '../../data/experienceCatalog';
import { expiryText, fmtDate } from '../../utils/saas';
import type { Tenant } from '../../types/saas';

const tabIds = ['overview', 'settings', 'plan', 'support', 'history'] as const;
type TabId = (typeof tabIds)[number];

export function TenantWorkspace() {
  const saas = useSaas();
  const { tenantId } = useParams();
  const [params, setParams] = useSearchParams();
  const tab: TabId = tabIds.includes(params.get('tab') as TabId) ? (params.get('tab') as TabId) : 'overview';
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const tenant = saas.state.tenants.find((t) => t.id === tenantId);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(t);
  }, [tenantId]);

  if (!saas.can('tenants.view')) return <Denied what="businesses" role={saas.staff.label} />;
  if (tenant && !saas.inScope(tenant.id)) return <Denied what={`${tenant.name} (not in your assigned businesses)`} role={saas.staff.label} />;
  if (loading)
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading business">
        <div className="h-24 animate-pulse rounded-xl bg-white" />
        <div className="h-64 animate-pulse rounded-xl bg-white" />
      </div>
    );
  if (!tenant)
    return (
      <div role="alert" className="rounded-xl border border-ink-100 bg-white p-6 text-center shadow-card">
        <p className="text-[13px] font-medium text-ink">Business {tenantId} not found</p>
        <Link to="/saas/tenants" className="mt-2 inline-block text-xs font-medium text-teal-700 hover:underline">Back to businesses</Link>
      </div>
    );

  const plan = planCatalog.find((p) => p.code === effectivePlan(tenant));
  const exp = expiryText(tenant.expiresAt);
  const counts = {
    support: saas.state.tickets.filter((t) => t.tenantId === tenant.id && t.status !== 'Resolved').length + saas.state.access.filter((a) => a.tenantId === tenant.id && (a.state === 'REQUESTED' || a.state === 'APPROVED')).length,
    plan: saas.state.orders.filter((o) => o.tenantId === tenant.id && ['PAYMENT_PENDING', 'VERIFICATION_PENDING', 'ACTIVATION_PENDING', 'REFUND_PENDING'].includes(o.state)).length,
  };
  const activeUsers = tenant.members.filter((m) => m.status === 'Active').length;

  return (
    <div className="space-y-3">
      <Link to="/saas/tenants" className="inline-flex items-center gap-1 rounded text-xs text-ink-500 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
        <ArrowLeft className="size-3.5" /> Businesses
      </Link>

      <section className="rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4">
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight text-ink">
              {tenant.name}
              <Badge tone={tenantTone[tenant.status]} dot>Plan {tenant.status.toLowerCase()}</Badge>
              {tenant.account !== 'Active' && <Badge tone={accountTone[tenant.account]}>Account {tenant.account.toLowerCase()}</Badge>}
            </h1>
            <p className="mt-0.5 text-xs text-ink-500">
              {tenant.id} · {tenant.businessType} · {tenant.district} · Owner {tenant.owner} · {tenant.phone}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {saas.canFor('tenants.edit', tenant.id) && <Button onClick={() => setStatusDialog(true)}>Account status</Button>}
            <Button kind="primary" disabled={tenant.account !== 'Active'} title={tenant.account !== 'Active' ? 'Reactivate the account first' : undefined} onClick={() => setCheckout(true)}>
              <ShoppingCart className="size-4" />
              Checkout
            </Button>
          </div>
        </div>
        <dl className="mx-4 mt-3 grid grid-cols-2 gap-x-6 gap-y-1 border-t border-ink-100 pb-1 pt-2 text-[13px] sm:grid-cols-3 lg:grid-cols-6">
          <Fact label="Plan" value={`${plan?.label} · ${plan?.tierLabel}`} />
          <Fact label="Expires" value={exp.text} tone={exp.tone} />
          <Fact label="Users" value={`${activeUsers} of ${tenant.userLimit}`} />
          <Fact label="SMS credits" value={`${tenant.smsAvailable.toLocaleString()}${tenant.smsReserved ? ` · ${tenant.smsReserved} reserved` : ''}`} />
          <Fact label="Customer since" value={fmtDate(tenant.createdAt)} />
          <Fact label="Sender name" value={tenant.settings.smsSender || 'Not approved'} />
        </dl>
        <Tabs
          label="Business workspace"
          value={tab}
          onChange={(id) => setParams(id === 'overview' ? {} : { tab: id }, { replace: true })}
          items={[
            { id: 'overview', label: 'Overview' },
            { id: 'settings', label: 'Settings', count: tenant.members.length },
            { id: 'plan', label: 'Plan & Usage', count: counts.plan || undefined },
            { id: 'support', label: 'Support', count: counts.support || undefined },
            { id: 'history', label: 'History' },
          ]}
        />
      </section>

      {tab === 'overview' && <OverviewTab tenant={tenant} onTab={(id) => setParams({ tab: id }, { replace: true })} />}
      {tab === 'settings' && <SettingsTab tenant={tenant} />}
      {tab === 'plan' && <PlanUsageTab tenant={tenant} onCheckout={() => setCheckout(true)} />}
      {tab === 'support' && <SupportTab tenant={tenant} />}
      {tab === 'history' && <HistoryTab tenant={tenant} />}

      {checkout && <CheckoutDialog tenantId={tenant.id} onClose={() => setCheckout(false)} />}
      {statusDialog && <StatusDialog tenant={tenant} onClose={() => setStatusDialog(false)} />}
    </div>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: 'neutral' | 'warning' | 'danger' }) {
  return (
    <div className="min-w-0 py-1">
      <dt className="text-[11px] text-ink-500">{label}</dt>
      <dd title={value} className={`mt-0.5 truncate font-medium tabular-nums ${tone === 'danger' ? 'text-danger' : tone === 'warning' ? 'text-warning' : 'text-ink'}`}>{value}</dd>
    </div>
  );
}

function StatusDialog({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const saas = useSaas();
  const [action, setAction] = useState<'suspend' | 'reactivate' | 'archive'>(tenant.account === 'Active' ? 'suspend' : 'reactivate');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const canExpire = tenant.planCode !== 'FREE' && tenant.status !== 'Expired';
  return (
    <Modal
      title="Account status"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            kind={action === 'reactivate' ? 'primary' : 'danger'}
            onClick={() => {
              const r = saas.setAccount(tenant.id, action, reason);
              if (!r.ok) return setError(r.message);
              toast.success(r.message);
              onClose();
            }}
          >
            {action === 'suspend' ? 'Suspend' : action === 'archive' ? 'Archive' : 'Reactivate'}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-[13px]">
        <p className="text-ink-600">Account is <b className="font-medium text-ink">{tenant.account}</b>.</p>
        <Field label="Action">
          <Select
            value={action}
            onChange={(v) => { setAction(v as typeof action); setError(''); }}
            options={[
              ...(tenant.account !== 'Active' ? [{ value: 'reactivate', label: 'Reactivate' }] : []),
              ...(tenant.account === 'Active' || tenant.account === 'Provisioning' ? [{ value: 'suspend', label: 'Suspend — block sign-in and purchases' }] : []),
              ...(tenant.account !== 'Archived' ? [{ value: 'archive', label: 'Archive — closed business, books read-only' }] : []),
            ]}
          />
        </Field>
        <Field label="Reason (saved in audit log)"><Textarea value={reason} onChange={setReason} placeholder="e.g. Chargeback under review" /></Field>
        <p className="text-xs text-ink-500">Records are never deleted. Archive needs no unpaid invoices and no open tickets or services.</p>
        {tenant.invite === 'Pending' && <Button kind="ghost" onClick={() => { const r = saas.resendInvite(tenant.id); r.ok ? toast.success(r.message) : setError(r.message); }}>Resend owner invitation</Button>}
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
        {canExpire && (
          <div className="border-t border-ink-100 pt-3">
            <p className="text-xs text-ink-500">Prototype: see what the business keeps when its plan ends.</p>
            <Button
              kind="ghost"
              onClick={() => {
                const r = saas.simulateExpiry(tenant.id);
                r.ok ? toast.warning('Plan expired (simulated)', { description: r.message }) : toast.error(r.message);
                onClose();
              }}
            >
              Simulate plan expiry
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
