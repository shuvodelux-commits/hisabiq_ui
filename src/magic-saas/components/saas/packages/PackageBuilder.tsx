import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Field, Input, Select, Textarea } from '../../../prototype/Ui';
import { Checkbox } from '../../Checkbox';
import { useSaas } from '../../../contexts/SaasContext';
import { featureCatalog, planFeatures } from '../../../data/saasSeeds';
import { addDays, billingLabel, fmtDate, levelFromFeatures, levelLabel, NOW, validatePackage } from '../../../utils/saas';
import { taka } from '../../../utils/currency';
import { Advanced, BuilderShell, IssueList, PublishDialog, ReviewBlock } from './BuilderBits';
import { Proposed } from '../SaasBits';
import type { InterfaceLevel, PackageKind, SaasPackage } from '../../../types/saas';
import type { PlanCode } from '../../../types/experience';

const levelFeatures: Record<InterfaceLevel, string[]> = { BASIC: [], MEDIUM: ['interface.links'], PREMIUM: ['interface.links', 'interface.details'] };

export function PackageBuilder({ initial, onClose }: { initial: SaasPackage; onClose: () => void }) {
  const saas = useSaas();
  const [p, setP] = useState<SaasPackage>(initial);
  const [step, setStep] = useState('details');
  const [publishing, setPublishing] = useState(false);
  const issues = useMemo(() => validatePackage(p, featureCatalog), [p]);
  const dirty = JSON.stringify(p) !== JSON.stringify(initial);
  const canEdit = saas.can('plans.edit');
  const set = <K extends keyof SaasPackage>(k: K, v: SaasPackage[K]) => setP((x) => ({ ...x, [k]: v }));
  const maxTariff = Math.max(...saas.state.tariffs.map((t) => t.costPerSegment));
  const confirmed = saas.state.tariffs.every((t) => t.confirmed);
  const live = saas.state.packages.find((x) => x.id === p.id.replace('~draft', '') && x.version > 0);
  const buyers = saas.state.orders.filter((o) => o.packageId === p.id.replace('~draft', '') && o.state === 'COMPLETED').length;

  const toggleFeature = (key: string, on: boolean) => {
    const f = new Set(p.features);
    if (on) {
      f.add(key);
      featureCatalog.find((x) => x.key === key)?.requires.forEach((r) => f.add(r));
    } else f.delete(key);
    setP((x) => ({ ...x, features: [...f], interfaceLevel: levelFromFeatures([...f]) }));
  };
  const setLevel = (lvl: InterfaceLevel) => {
    const f = p.features.filter((k) => !k.startsWith('interface.'));
    setP((x) => ({ ...x, interfaceLevel: lvl, features: [...f, ...levelFeatures[lvl]] }));
  };
  const startFrom = (id: string) => {
    const src = saas.state.packages.find((x) => x.id === id);
    if (!src) return;
    setP((x) => ({ ...src, id: x.id, name: x.name || `${src.name} (custom)`, status: 'DRAFT', version: 0, versions: [], visibility: 'INVITE', restrictedTenantIds: [] }));
  };

  // Estimated SMS cost share — tariffs are estimates unless confirmed.
  const smsCostPerPeriod = p.smsCredits * maxTariff;
  const smsShare = p.priceBdt > 0 ? Math.round((smsCostPerPeriod / p.priceBdt) * 100) : 0;
  const smsMargin = p.kind === 'SMS' && p.smsCredits > 0 ? Math.round(((p.priceBdt / p.smsCredits - maxTariff) / (p.priceBdt / p.smsCredits)) * 100) : null;
  const marginLow = smsMargin !== null ? smsMargin < saas.state.marginThreshold : p.priceBdt > 0 && 100 - smsShare < saas.state.marginThreshold;
  const reviewIssues = marginLow ? [...issues, { level: 'warning' as const, text: `Estimated SMS margin is below ${saas.state.marginThreshold}%${confirmed ? '' : ' (tariff not supplier-confirmed)'}.` }] : issues;

  const save = () => {
    const r = saas.savePackage(p);
    r.ok ? toast.success(r.message) : toast.error(r.message);
    if (r.ok) onClose();
  };

  const kindLabel: Record<PackageKind, string> = { PLAN: 'Subscription plan', FEATURE: 'Feature unlock', SMS: 'SMS credits', SERVICE: 'Support service' };

  return (
    <>
      <BuilderShell
        title={initial.version === 0 && initial.name === '' ? 'New package' : `Edit ${initial.name}`}
        subtitle={live ? `Live v${live.version}. Edits are a draft until published; ${buyers} existing purchase${buyers === 1 ? '' : 's'} keep their terms.` : 'Draft — customers see nothing until published.'}
        step={step}
        onStep={setStep}
        issues={reviewIssues.filter((i) => i.level === 'error')}
        canEdit={canEdit}
        canPublish={saas.can('plans.publish')}
        dirty={dirty}
        onCancel={onClose}
        onSave={save}
        onPublish={() => setPublishing(true)}
      >
        {step === 'details' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Package type"><Select value={p.kind} onChange={(v) => set('kind', v as PackageKind)} options={Object.entries(kindLabel).map(([value, label]) => ({ value, label }))} /></Field>
            <Field label="Start from"><Select value="" onChange={startFrom} options={[{ value: '', label: 'Keep current' }, ...saas.state.packages.filter((x) => x.version > 0).map((x) => ({ value: x.id, label: `${x.name} v${x.version}` }))]} /></Field>
            {p.kind === 'PLAN' && <Field label="Base plan"><Select value={p.basePlan ?? 'PRO'} onChange={(v) => setP((x) => ({ ...x, basePlan: v as PlanCode, features: [...new Set([...planFeatures[v as PlanCode], ...x.features.filter((f) => !Object.values(planFeatures).flat().includes(f))])], interfaceLevel: levelFromFeatures(planFeatures[v as PlanCode]) }))} options={['FREE', 'COUNTER', 'PRO', 'PLUS']} /></Field>}
            <Field label="Name"><Input value={p.name} onChange={(v) => set('name', v)} placeholder="e.g. Pharmacy Starter" /></Field>
            <Field label="Billing"><Select value={p.billing} onChange={(v) => set('billing', v as SaasPackage['billing'])} options={[{ value: 'MONTHLY', label: 'Recurring · monthly' }, { value: 'YEARLY', label: 'Recurring · yearly' }, { value: 'PASS', label: 'Fixed-duration pass' }, { value: 'ONE_TIME', label: 'One-time purchase' }]} /></Field>
            {p.billing === 'PASS' && <Field label="Pass length (days)"><Input type="number" min={1} value={p.passDays} onChange={(v) => set('passDays', Number(v))} /></Field>}
            <div className="sm:col-span-2 lg:col-span-3"><Field label="Description customers see"><Textarea value={p.description} onChange={(v) => set('description', v)} /></Field></div>
            <p className="text-[11px] text-ink-500 sm:col-span-2 lg:col-span-3">HisabIQ service packages only — not the merchant’s own product bundles.</p>
          </div>
        )}

        {step === 'benefits' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Price (৳)"><Input type="number" min={0} value={p.priceBdt} onChange={(v) => set('priceBdt', Number(v))} /></Field>
              <Field label="Interface level"><Select value={p.interfaceLevel} onChange={(v) => setLevel(v as InterfaceLevel)} options={[{ value: 'BASIC', label: 'Basic' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'PREMIUM', label: 'Premium' }]} /></Field>
              <Field label="User limit"><Input type="number" min={1} value={p.userLimit} onChange={(v) => set('userLimit', Number(v))} /></Field>
              <Field label="SMS credits"><Input type="number" min={0} value={p.smsCredits} onChange={(v) => set('smsCredits', Number(v))} /></Field>
            </div>
            {p.smsCredits > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="SMS granted"><Select value={p.smsGrant} onChange={(v) => set('smsGrant', v as SaasPackage['smsGrant'])} options={[{ value: 'ONCE', label: 'Once, at activation' }, { value: 'EACH_PERIOD', label: 'Each billing period' }]} /></Field>
                <Field label="Credits expire after (days)"><Input type="number" min={1} value={p.smsExpiryDays} onChange={(v) => set('smsExpiryDays', Number(v))} /></Field>
              </div>
            )}
            {p.kind !== 'SMS' && p.kind !== 'SERVICE' && (
              <div>
                <p className="mb-1 text-xs font-medium text-ink-500">Features <span className="font-bn text-[11px] font-normal text-ink-400">· সুবিধা</span></p>
                <ul className="grid gap-x-6 sm:grid-cols-2">
                  {featureCatalog.map((f) => {
                    const on = p.features.includes(f.key);
                    const conflict = f.conflicts.find((c) => p.features.includes(c));
                    const needs = f.requires.filter((r) => !p.features.includes(r));
                    return (
                      <li key={f.key} className="border-b border-ink-100 py-2">
                        <label className="flex cursor-pointer items-start gap-3">
                          <span className="flex h-5 items-center"><Checkbox checked={on} onCheckedChange={(v: boolean) => toggleFeature(f.key, v)} disabled={!canEdit} /></span>
                          <span className="min-w-0 text-[13px]">
                            <span className="text-ink">{f.label}</span> <span className="font-bn text-[11px] text-ink-400">{f.bn}</span>
                            {f.level && <span className="block text-[11px] text-ink-500">Sets {levelLabel[f.level]} interface</span>}
                            {conflict && on && <span className="block text-[11px] text-danger">Conflicts with {featureCatalog.find((x) => x.key === conflict)?.label}</span>}
                            {needs.length > 0 && on && <span className="block text-[11px] text-danger">Needs {needs.map((n) => featureCatalog.find((x) => x.key === n)?.label).join(', ')}</span>}
                            {!on && f.requires.length > 0 && <span className="block text-[11px] text-ink-500">Also adds {f.requires.map((n) => featureCatalog.find((x) => x.key === n)?.label).join(', ')}</span>}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <Advanced>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Storage (GB)"><Input type="number" min={0} step="0.5" value={p.storageGb} onChange={(v) => set('storageGb', Number(v))} /></Field>
                <Field label="Reports"><Select value={p.reports} onChange={(v) => set('reports', v as SaasPackage['reports'])} options={['Basic', 'Medium', 'Premium']} /></Field>
                <Field label="Support"><Select value={p.support} onChange={(v) => set('support', v as SaasPackage['support'])} options={['Standard', 'Priority']} /></Field>
              </div>
            </Advanced>
          </div>
        )}

        {step === 'eligibility' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Who can buy"><Select value={p.visibility} onChange={(v) => set('visibility', v as SaasPackage['visibility'])} options={[{ value: 'PUBLIC', label: 'Everyone (public)' }, { value: 'INVITE', label: 'Invitation link only' }, { value: 'RESTRICTED', label: 'Selected businesses' }]} /></Field>
              <Field label="Available from"><Input type="date" value={p.availableFrom} onChange={(v) => set('availableFrom', v)} /></Field>
              <Field label="Available until (optional)"><Input type="date" value={p.availableTo ?? ''} onChange={(v) => set('availableTo', v || null)} /></Field>
            </div>
            {p.visibility === 'RESTRICTED' && (
              <ul className="grid gap-x-6 rounded-lg border border-ink-100 px-3 sm:grid-cols-2">
                {saas.state.tenants.map((t) => (
                  <li key={t.id} className="border-b border-ink-100 py-2 last:border-0">
                    <label className="flex cursor-pointer items-center gap-3 text-[13px]">
                      <Checkbox checked={p.restrictedTenantIds.includes(t.id)} onCheckedChange={(v: boolean) => set('restrictedTenantIds', v ? [...p.restrictedTenantIds, t.id] : p.restrictedTenantIds.filter((x) => x !== t.id))} disabled={!canEdit} />
                      {t.name} <span className="text-[11px] text-ink-500">{t.id}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {p.visibility === 'INVITE' && <p className="text-xs text-ink-500">An invitation link is created after publishing. <Proposed /></p>}
          </div>
        )}

        {step === 'review' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <IssueList issues={reviewIssues} />
              <ReviewBlock title="What the customer sees">
                <p className="text-[15px] font-semibold">{p.name || 'Untitled'} <span className="text-[13px] font-normal text-ink-500">· {taka(p.priceBdt)} {billingLabel(p)}</span></p>
                <p className="mt-0.5 text-xs text-ink-600">{p.description}</p>
                <ul className="mt-2 space-y-0.5 text-xs text-ink-700">
                  {p.features.map((k) => <li key={k}>✓ {featureCatalog.find((f) => f.key === k)?.label}</li>)}
                  <li>✓ {levelLabel[p.interfaceLevel]} screens · {p.userLimit} user{p.userLimit > 1 ? 's' : ''} · {p.storageGb} GB · {p.support} support</li>
                  {p.smsCredits > 0 && <li>✓ {p.smsCredits.toLocaleString()} SMS {p.smsGrant === 'EACH_PERIOD' && p.billing !== 'ONE_TIME' ? 'each period' : 'once'}, valid {p.smsExpiryDays} days</li>}
                </ul>
                <p className="mt-2 text-xs text-ink-500">
                  <b className="font-medium text-ink">Pays:</b> {taka(p.priceBdt)} {billingLabel(p)}. <b className="font-medium text-ink">After it ends:</b> {p.kind === 'PLAN' ? 'all records stay; returns to Free plus other valid purchases.' : p.kind === 'SMS' ? `unused credits expire ${fmtDate(addDays(NOW, p.smsExpiryDays))}.` : 'past records stay readable.'}
                </p>
              </ReviewBlock>
            </div>
            <div className="space-y-3">
              {p.kind === 'PLAN' && (
                <ReviewBlock title="Compared with standard plans">
                  <table className="w-full text-[13px]">
                    <thead><tr className="text-left"><th className="pb-1 text-xs font-medium text-ink-500">Plan</th><th className="pb-1 text-right text-xs font-medium text-ink-500">Price</th><th className="pb-1 text-right text-xs font-medium text-ink-500">Users</th><th className="pb-1 text-right text-xs font-medium text-ink-500">Features</th></tr></thead>
                    <tbody>
                      {[...saas.state.packages.filter((x) => x.kind === 'PLAN' && x.billing === 'MONTHLY' && x.status === 'ACTIVE'), p].map((x) => (
                        <tr key={x.id + (x === p ? '-new' : '')} className={`border-t border-ink-100 ${x === p ? 'font-medium text-teal-800' : ''}`}>
                          <td className="py-1">{x === p ? `${p.name || 'This package'} (new)` : x.name}</td>
                          <td className="py-1 text-right tabular-nums">{taka(x.priceBdt)}</td>
                          <td className="py-1 text-right tabular-nums">{x.userLimit}</td>
                          <td className="py-1 text-right tabular-nums">{x.features.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ReviewBlock>
              )}
              <ReviewBlock title="Estimated financial impact">
                {smsMargin !== null ? (
                  <p>৳{(p.priceBdt / Math.max(1, p.smsCredits)).toFixed(2)} per credit vs ৳{maxTariff.toFixed(2)} highest tariff → <b className={smsMargin < saas.state.marginThreshold ? 'text-danger' : 'text-ink'}>{smsMargin}% estimated margin</b>.</p>
                ) : p.smsCredits > 0 && p.priceBdt > 0 ? (
                  <p>Included SMS may cost about ৳{smsCostPerPeriod.toFixed(0)} {p.smsGrant === 'EACH_PERIOD' ? 'per period' : 'once'} ({smsShare}% of price) if fully used.</p>
                ) : (
                  <p>No direct supplier cost recorded for this package.</p>
                )}
                <p className="mt-1 text-[11px] text-ink-500">{confirmed ? 'Based on supplier-confirmed tariffs.' : 'Tariffs are not supplier-confirmed — an estimate, not verified profit.'} Hosting and support costs aren’t included.</p>
              </ReviewBlock>
              {live && (
                <ReviewBlock title="Version history">
                  <ul className="space-y-1 text-xs">{live.versions.map((v) => <li key={v.version}><b className="font-medium">v{v.version}</b> · {fmtDate(v.at)} · {v.by} · {taka(v.priceBdt)} — {v.summary}</li>)}</ul>
                </ReviewBlock>
              )}
            </div>
          </div>
        )}
      </BuilderShell>

      {publishing && (
        <PublishDialog
          name={p.name}
          impact={[
            `New purchases from ${fmtDate(p.availableFrom > NOW ? p.availableFrom : NOW)} use v${(live?.version ?? 0) + 1}.`,
            live ? `${buyers} existing purchase${buyers === 1 ? '' : 's'} and pending payment orders keep v${live.version} terms exactly.` : 'No existing customers are affected.',
            live ? 'Existing subscribers keep their current price at renewal unless a separate, approved repricing is announced.' : 'Becomes visible according to “Who can buy”.',
          ]}
          onClose={() => setPublishing(false)}
          onConfirm={(summary) => {
            const inStore = saas.state.packages.some((x) => x.id === p.id);
            const saved = dirty || !inStore || p.status !== 'DRAFT' ? saas.savePackage(p) : { ok: true as const, message: '', id: p.id };
            if (!saved.ok) return toast.error(saved.message);
            const r = saas.publishPackage(saved.id ?? p.id, summary);
            r.ok ? toast.success(r.message) : toast.error(r.message);
            setPublishing(false);
            if (r.ok) onClose();
          }}
        />
      )}
    </>
  );
}
