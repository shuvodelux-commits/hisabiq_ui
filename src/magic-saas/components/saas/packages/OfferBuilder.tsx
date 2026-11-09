import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Field, Input, Select } from '../../../prototype/Ui';
import { Checkbox } from '../../Checkbox';
import { useSaas } from '../../../contexts/SaasContext';
import { billingLabel, fmtDate, quote, validateOffer } from '../../../utils/saas';
import { taka } from '../../../utils/currency';
import { Advanced, BuilderShell, IssueList, PublishDialog, ReviewBlock } from './BuilderBits';
import type { Offer, OfferType } from '../../../types/saas';

const typeMeta: Record<OfferType, { label: string; value: string }> = {
  PERCENT: { label: 'Percentage discount', value: 'Discount %' },
  FIXED: { label: 'Fixed ৳ discount', value: 'Discount ৳' },
  INTRO: { label: 'Introductory price', value: 'Intro price ৳' },
  TRIAL: { label: 'Feature trial', value: 'Trial days' },
  BONUS_SMS: { label: 'Bonus SMS credits', value: 'Bonus credits' },
  SETUP: { label: 'Free setup service', value: 'Service value ৳' },
};

export function OfferBuilder({ initial, onClose }: { initial: Offer; onClose: () => void }) {
  const saas = useSaas();
  const [o, setO] = useState<Offer>(initial);
  const [step, setStep] = useState('details');
  const [publishing, setPublishing] = useState(false);
  const [estimate, setEstimate] = useState('50');
  const issues = useMemo(() => validateOffer(o), [o]);
  const dirty = JSON.stringify(o) !== JSON.stringify(initial);
  const canEdit = saas.can('plans.edit');
  const set = <K extends keyof Offer>(k: K, v: Offer[K]) => setO((x) => ({ ...x, [k]: v }));
  const targets = saas.state.packages.filter((p) => p.version > 0 && (p.status === 'ACTIVE' || p.status === 'SCHEDULED'));
  const chosen = targets.filter((p) => o.packageIds.includes(p.id));
  const first = chosen[0];
  const q = first ? quote(first, o) : null;
  const n = Math.max(0, Math.floor(Number(estimate) || 0));
  const maxTariff = Math.max(...saas.state.tariffs.map((t) => t.costPerSegment));
  const extraIssues = [...issues];
  if (o.type === 'BONUS_SMS' && first && first.smsCredits > 0) {
    const per = first.priceBdt / (first.smsCredits + o.value);
    const m = Math.round(((per - maxTariff) / per) * 100);
    if (m < saas.state.marginThreshold) extraIssues.push({ level: 'warning', text: `With bonus credits the estimated SMS margin drops to ${m}% (threshold ${saas.state.marginThreshold}%).` });
  }
  if ((o.type === 'PERCENT' || o.type === 'FIXED' || o.type === 'INTRO') && q && q.total === 0) extraIssues.push({ level: 'warning', text: 'Final price is ৳0 — use a complimentary grant instead.' });

  const save = () => {
    const r = saas.saveOffer(o);
    r.ok ? toast.success(r.message) : toast.error(r.message);
    if (r.ok) onClose();
  };

  return (
    <>
      <BuilderShell
        title={initial.name ? `Edit ${initial.name}` : 'New offer'}
        subtitle="Offers never combine unless you allow it. Pausing stops new redemptions; benefits already bought stay."
        step={step}
        onStep={setStep}
        issues={extraIssues.filter((i) => i.level === 'error')}
        canEdit={canEdit}
        canPublish={saas.can('plans.publish')}
        dirty={dirty}
        onCancel={onClose}
        onSave={save}
        onPublish={() => setPublishing(true)}
      >
        {step === 'details' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Offer name"><Input value={o.name} onChange={(v) => set('name', v)} placeholder="e.g. Pohela Boishakh 15% off" /></Field>
            <Field label="Offer type"><Select value={o.type} onChange={(v) => set('type', v as OfferType)} options={Object.entries(typeMeta).map(([value, m]) => ({ value, label: m.label }))} /></Field>
            <Field label={typeMeta[o.type].value}><Input type="number" min={0} value={o.value} onChange={(v) => set('value', Number(v))} /></Field>
            {o.type === 'INTRO' && <Field label="Intro periods"><Input type="number" min={1} value={o.introPeriods} onChange={(v) => set('introPeriods', Number(v))} /></Field>}
            <Field label="How it applies"><Select value={o.code === null ? 'AUTO' : 'CODE'} onChange={(v) => set('code', v === 'AUTO' ? null : o.code ?? '')} options={[{ value: 'AUTO', label: 'Automatically at checkout' }, { value: 'CODE', label: 'With a coupon code' }]} /></Field>
            {o.code !== null && <Field label="Coupon code"><Input value={o.code} onChange={(v) => set('code', v.toUpperCase().replace(/\s/g, ''))} placeholder="BOISHAKH15" /></Field>}
          </div>
        )}

        {step === 'benefits' && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-ink-500">Applies to these packages</p>
            <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">
              {targets.map((p) => {
                const qq = quote(p, o);
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <label className="flex cursor-pointer items-center gap-3 text-[13px]">
                      <Checkbox checked={o.packageIds.includes(p.id)} onCheckedChange={(v: boolean) => set('packageIds', v ? [...o.packageIds, p.id] : o.packageIds.filter((x) => x !== p.id))} disabled={!canEdit} />
                      {p.name} <span className="text-[11px] text-ink-500">{taka(p.priceBdt)} {billingLabel(p)}</span>
                    </label>
                    {o.packageIds.includes(p.id) && <span className="text-xs tabular-nums text-ink-600">Pays <b className="font-medium text-ink">{taka(qq.total)}</b>{qq.bonusCredits ? ` + ${qq.bonusCredits} bonus SMS` : ''}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {step === 'eligibility' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Who is eligible"><Select value={o.audience} onChange={(v) => set('audience', v as Offer['audience'])} options={[{ value: 'ALL', label: 'All businesses' }, { value: 'NEW', label: 'New customers (never paid)' }, { value: 'EXISTING', label: 'Existing paying customers' }, { value: 'SELECTED', label: 'Selected businesses' }]} /></Field>
              <Field label="Starts"><Input type="date" value={o.startsAt} onChange={(v) => set('startsAt', v)} /></Field>
              <Field label="Ends"><Input type="date" value={o.endsAt} onChange={(v) => set('endsAt', v)} /></Field>
            </div>
            {o.audience === 'SELECTED' && (
              <ul className="grid gap-x-6 rounded-lg border border-ink-100 px-3 sm:grid-cols-2">
                {saas.state.tenants.map((t) => (
                  <li key={t.id} className="border-b border-ink-100 py-2 last:border-0">
                    <label className="flex cursor-pointer items-center gap-3 text-[13px]">
                      <Checkbox checked={o.tenantIds.includes(t.id)} onCheckedChange={(v: boolean) => set('tenantIds', v ? [...o.tenantIds, t.id] : o.tenantIds.filter((x) => x !== t.id))} disabled={!canEdit} />
                      {t.name}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <Advanced label="Limits & combining">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Total redemptions (blank = no limit)"><Input type="number" min={1} value={o.maxRedemptions ?? ''} onChange={(v) => set('maxRedemptions', v === '' ? null : Number(v))} /></Field>
                <Field label="Per business"><Input type="number" min={1} value={o.perBusiness} onChange={(v) => set('perBusiness', Number(v))} /></Field>
                <Field label="Minimum purchase ৳"><Input type="number" min={0} value={o.minPurchase} onChange={(v) => set('minPurchase', Number(v))} /></Field>
              </div>
              <label className="flex cursor-pointer items-start gap-3 text-[13px]">
                <span className="flex h-5 items-center"><Checkbox checked={o.stackable} onCheckedChange={(v: boolean) => set('stackable', v)} disabled={!canEdit} /></span>
                <span>Can combine with other offers<span className="block text-xs text-ink-500">Off by default. Checkout applies one offer at a time in this prototype.</span></span>
              </label>
            </Advanced>
          </div>
        )}

        {step === 'review' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <IssueList issues={extraIssues} />
              <ReviewBlock title="Customer-facing preview">
                {first && q ? (
                  <>
                    <p className="text-[15px] font-semibold">{o.name || 'Untitled offer'}</p>
                    <p className="text-xs text-ink-600">{first.name}: <span className="line-through">{taka(q.list)}</span> <b className="text-ink">{taka(q.total)}</b> {billingLabel(first)}{q.bonusCredits ? ` + ${q.bonusCredits} bonus SMS` : ''}</p>
                    {q.introNote && <p className="mt-1 text-xs text-warning">{q.introNote}</p>}
                    {q.offerNote && <p className="mt-1 text-xs text-ink-600">{q.offerNote}</p>}
                    <p className="mt-1 text-xs text-ink-500">Valid {fmtDate(o.startsAt)} – {fmtDate(o.endsAt)}{o.code ? ` with code ${o.code}` : ', applied automatically'}. {o.stackable ? 'Can combine with other offers.' : 'Can’t be combined with other offers.'}</p>
                  </>
                ) : <p className="text-xs text-ink-500">Choose a package to preview.</p>}
              </ReviewBlock>
            </div>
            <ReviewBlock title="Estimated impact">
              <label className="flex items-center gap-2 text-xs text-ink-600">If <input type="number" min={0} value={estimate} onChange={(e) => setEstimate(e.target.value)} aria-label="Estimated redemptions" className="ref-control w-20 rounded-lg border border-ink-200 px-2 text-right text-[13px]" /> businesses redeem:</label>
              {q && (
                <dl className="mt-2 divide-y divide-ink-100 text-[13px]">
                  <div className="flex justify-between py-1"><dt className="text-ink-600">Collections (first period)</dt><dd className="tabular-nums">{taka(q.total * n)}</dd></div>
                  <div className="flex justify-between py-1"><dt className="text-ink-600">Discount given</dt><dd className="tabular-nums">{taka(q.discount * n)}</dd></div>
                  {q.bonusCredits > 0 && <div className="flex justify-between py-1"><dt className="text-ink-600">Bonus SMS (est. cost)</dt><dd className="tabular-nums">{(q.bonusCredits * n).toLocaleString()} · ~৳{Math.round(q.bonusCredits * n * maxTariff).toLocaleString()}</dd></div>}
                  {o.type === 'SETUP' && <div className="flex justify-between py-1"><dt className="text-ink-600">Setup work given</dt><dd className="tabular-nums">{taka(o.value * n)}</dd></div>}
                </dl>
              )}
              <p className="mt-2 text-[11px] text-ink-500">A planning estimate only. Real performance counts verified payments, not orders.</p>
            </ReviewBlock>
          </div>
        )}
      </BuilderShell>

      {publishing && (
        <PublishDialog
          name={o.name}
          impact={[
            o.startsAt > '2026-10-25' ? `Scheduled — becomes active ${fmtDate(o.startsAt)}.` : 'Active immediately for eligible checkouts.',
            'Orders already created keep the price they were quoted.',
            'Pausing later stops new redemptions without removing anything bought.',
          ]}
          onClose={() => setPublishing(false)}
          onConfirm={() => {
            if (dirty || !saas.state.offers.some((x) => x.id === o.id)) {
              const s = saas.saveOffer(o);
              if (!s.ok) return toast.error(s.message);
            }
            const r = saas.publishOffer(o.id);
            r.ok ? toast.success(r.message) : toast.error(r.message);
            setPublishing(false);
            if (r.ok) onClose();
          }}
        />
      )}
    </>
  );
}
