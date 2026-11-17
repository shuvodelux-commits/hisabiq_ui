import { useState } from 'react';
import { Ban, Gift, Timer } from 'lucide-react';
import { RowActions } from '../RowActions';
import { toast } from 'sonner';
import { Button, Field, Input, Modal } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { SettingCard } from '../../settings/SettingCard';
import { Badge, entStatusTone, sourceMeta, td, th, thAction, tdAction } from '../SaasBits';
import { BillingLedger } from '../BillingLedger';
import { GrantDialog } from '../GrantDialog';
import { SmsCreditPanel } from '../SmsCreditPanel';
import { CheckoutDialog } from '../CheckoutDialog';
import { featureCatalog } from '../../../data/saasSeeds';
import { expiryText } from '../../../utils/saas';
import type { EntitlementSource, Tenant } from '../../../types/saas';

export function PlanUsageTab({ tenant, onCheckout }: { tenant: Tenant; onCheckout: () => void }) {
  const saas = useSaas();
  const [source, setSource] = useState<'ALL' | EntitlementSource>('ALL');
  const [grant, setGrant] = useState<null | 'TRIAL' | 'GRANT'>(null);
  const [revoke, setRevoke] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [smsCheckout, setSmsCheckout] = useState(false);
  const rows = saas.featuresFor(tenant.id).filter((f) => source === 'ALL' || f.source === source);
  const memberName = (id?: string) => tenant.members.find((m) => m.id === id)?.name;
  const ents = saas.state.entitlements;
  const activeUsers = tenant.members.filter((m) => m.status === 'Active').length;
  const storagePct = Math.min(100, Math.round((tenant.storageUsedMb / tenant.storageLimitMb) * 100));

  return (
    <div className="space-y-3">
      {tenant.expiryNote && (
        <div role="status" className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-[13px] text-danger">
          <p className="font-medium">What changed when the plan ended</p>
          <p className="mt-0.5 text-xs">{tenant.expiryNote}</p>
          <Button kind="primary" className="mt-2" onClick={onCheckout}>Renew plan</Button>
        </div>
      )}

      <SettingCard
        title="Features & entitlements"
        titleBn="সুবিধা ও উৎস"
        description="Where each feature comes from, who it applies to and when it ends."
        bodyClassName=""
        actions={
          <div className="flex flex-wrap gap-2">
            <Button disabled={!saas.canFor('grants.trial', tenant.id)} title={saas.canFor('grants.trial', tenant.id) ? undefined : 'Needs trial permission for this business'} onClick={() => setGrant('TRIAL')}><Timer className="size-4" />Trial</Button>
            <Button disabled={!saas.canFor('grants.issue', tenant.id)} title={saas.canFor('grants.issue', tenant.id) ? undefined : 'Only Super Admins issue complimentary grants'} onClick={() => setGrant('GRANT')}><Gift className="size-4" />Grant</Button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-1 border-b border-ink-100 px-3" role="tablist" aria-label="Filter by source">
          {(['ALL', 'PLAN', 'PURCHASE', 'TRIAL', 'GRANT'] as const).map((s) => (
            <button key={s} role="tab" aria-selected={source === s} onClick={() => setSource(s)} type="button" className={`-mb-px flex h-11 items-center border-b-2 px-2.5 text-[13px] font-medium transition-colors focus-visible:rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500/30 ${source === s ? 'border-teal-600 text-ink' : 'border-transparent text-ink-500 hover:text-ink'}`}>
              {s === 'ALL' ? 'All' : sourceMeta[s].label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table data-erp-table className="w-full text-[13px]">
            <thead><tr className="border-b border-ink-100"><th className={th}>Feature</th><th className={th}>Source</th><th className={`${th} hidden md:table-cell`}>Scope</th><th className={th}>Status</th><th className={th}>Ends</th><th className={`${th} hidden lg:table-cell`}>Reference</th><th className={thAction}>Action</th></tr></thead>
            <tbody>
              {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-xs text-ink-500">Nothing from this source.</td></tr>}
              {rows.map((f, i) => {
                const exp = expiryText(f.expiresAt);
                const e = f.id ? ents.find((x) => x.id === f.id) : null;
                return (
                  <tr key={`${f.feature}-${f.source}-${i}`} className="border-b border-ink-100 last:border-0">
                    <td className={td}>{featureCatalog.find((x) => x.key === f.feature)?.label ?? f.feature}{f.note && <span className="block text-[11px] text-ink-500">{f.note}</span>}</td>
                    <td className={td}><Badge tone={sourceMeta[f.source].tone}>{sourceMeta[f.source].label}</Badge></td>
                    <td className={`${td} hidden text-ink-600 md:table-cell`}>{f.scope === 'Member' ? memberName(e?.memberId) ?? 'One member' : 'Business'}</td>
                    <td className={td}><Badge tone={entStatusTone[f.status]} dot>{f.status}</Badge></td>
                    <td className={`${td} whitespace-nowrap ${f.status === 'Active' && exp.tone === 'warning' ? 'text-warning' : 'text-ink-600'}`}>{exp.text}</td>
                    <td className={`${td} hidden text-ink-500 lg:table-cell`}>{f.ref}</td>
                    <td className={tdAction}>
                      <RowActions label={`Actions for ${f.feature}`} items={[{ label: 'Revoke access…', icon: Ban, tone: 'danger', hidden: !(e && f.status === 'Active' && (e.source === 'TRIAL' || e.source === 'GRANT') && saas.canFor(e.source === 'TRIAL' ? 'grants.trial' : 'grants.issue', tenant.id)), onSelect: () => { if (!e) return; setRevoke(e.id); setReason(''); setError(''); } }]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">Customers see Basic, Medium or Premium screens by plan. Members still need the right role — entitlements never bypass permissions.</p>
      </SettingCard>

      <div className="grid gap-3 lg:grid-cols-2">
        <SettingCard title="Usage" titleBn="ব্যবহার" bodyClassName="p-4 space-y-3">
          <Meter label="Users" value={`${activeUsers} of ${tenant.userLimit}`} pct={(activeUsers / tenant.userLimit) * 100} />
          <Meter label="Storage" value={`${(tenant.storageUsedMb / 1024).toFixed(1)} of ${(tenant.storageLimitMb / 1024).toFixed(1)} GB`} pct={storagePct} />
          <Meter label="Invoices this month" value={String(tenant.monthlyInvoices)} pct={0} hideBar />
          <p className="text-[11px] text-ink-500">Over a limit, history stays readable; only new users or uploads pause.</p>
        </SettingCard>
        <SmsCreditPanel tenant={tenant} onBuy={() => setSmsCheckout(true)} />
      </div>

      <SettingCard title="Billing history" titleBn="বিলের ইতিহাস" description="HisabIQ subscription payments only — separate from the business’s own sales and cash." bodyClassName="">
        <BillingLedger orders={saas.state.orders.filter((o) => o.tenantId === tenant.id)} />
      </SettingCard>

      {grant && <GrantDialog tenantId={tenant.id} kind={grant} onClose={() => setGrant(null)} />}
      {smsCheckout && <CheckoutDialog tenantId={tenant.id} kind="SMS" onClose={() => setSmsCheckout(false)} />}
      {revoke && (
        <Modal
          title="Revoke entitlement?"
          onClose={() => setRevoke(null)}
          footer={<><Button onClick={() => setRevoke(null)}>Cancel</Button><Button kind="danger" onClick={() => { const r = saas.revokeEntitlement(revoke, reason); if (!r.ok) return setError(r.message); toast.success(r.message); setRevoke(null); }}>Revoke</Button></>}
        >
          <div className="space-y-2 text-[13px]">
            <p className="text-ink-700">The feature stops immediately. Records created with it stay.</p>
            <Field label="Reason"><Input value={reason} onChange={setReason} /></Field>
            {error && <p role="alert" className="text-xs text-danger">{error}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Meter({ label, value, pct, hideBar }: { label: string; value: string; pct: number; hideBar?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-[13px]"><span className="text-ink-600">{label}</span><span className="font-medium tabular-nums">{value}</span></div>
      {!hideBar && (
        <div className="mt-1 h-1.5 rounded-full bg-ink-50" role="meter" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-danger' : pct >= 75 ? 'bg-warning' : 'bg-teal-600'}`} style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      )}
    </div>
  );
}
