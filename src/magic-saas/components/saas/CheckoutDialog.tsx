import React, { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select } from '../../prototype/Ui';
import { useSaas } from '../../contexts/SaasContext';
import { featureCatalog } from '../../data/saasSeeds';
import { billingLabel, fmtDate, addDays, NOW, offerEligibility, quote } from '../../utils/saas';
import { taka } from '../../utils/currency';
import type { PackageKind, PaymentMethod } from '../../types/saas';

type Props = { tenantId: string; kind?: PackageKind; packageId?: string; onClose: () => void };

const kindLabel: Record<PackageKind, string> = { PLAN: 'Subscription', FEATURE: 'Feature unlock', SMS: 'SMS credits', SERVICE: 'Support service' };

/** One checkout for subscriptions, feature unlocks, SMS credits and services. */
export function CheckoutDialog({ tenantId, kind, packageId, onClose }: Props) {
  const saas = useSaas();
  const tenant = saas.state.tenants.find((t) => t.id === tenantId)!;
  const options = saas.state.packages.filter((p) => p.status === 'ACTIVE' && (!kind || p.kind === kind) && (p.visibility !== 'RESTRICTED' || p.restrictedTenantIds.includes(tenantId)) && p.priceBdt > 0);
  const [pkgId, setPkgId] = useState(packageId ?? options[0]?.id ?? '');
  const [code, setCode] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('bKash');
  const [error, setError] = useState('');
  const pkg = saas.state.packages.find((p) => p.id === pkgId);

  const autoOffer = useMemo(
    () => (pkg ? saas.state.offers.find((o) => o.code === null && offerEligibility(o, pkg, tenant, saas.state.orders).ok) ?? null : null),
    [pkg, saas.state.offers, saas.state.orders, tenant],
  );
  const codeOffer = code.trim() ? saas.state.offers.find((o) => o.code === code.trim().toUpperCase()) ?? null : null;
  const codeCheck = codeOffer && pkg ? offerEligibility(codeOffer, pkg, tenant, saas.state.orders) : null;
  const offer = code.trim() ? (codeCheck?.ok ? codeOffer : null) : autoOffer;
  const q = pkg ? quote(pkg, offer) : null;

  const submit = () => {
    if (!pkg) return;
    const r = saas.checkout({ tenantId, packageId: pkg.id, offerCode: code, autoOfferId: code.trim() ? null : autoOffer?.id ?? null, method, onBehalf: true });
    if (!r.ok) return setError(r.message);
    toast.success(r.message, { description: 'The business pays, then billing verifies the reference.' });
    onClose();
  };

  const retains =
    pkg?.kind === 'PLAN'
      ? 'After it ends: all records stay; the business returns to Free plus any other valid purchases.'
      : pkg?.kind === 'FEATURE'
        ? 'After it ends: past warranty claims stay readable; new claims stop.'
        : pkg?.kind === 'SMS'
          ? `Unused credits expire ${fmtDate(addDays(NOW, pkg.smsExpiryDays))}. Sent message history stays.`
          : 'One-time service. Delivered work stays with the business.';

  return (
    <Modal
      title={`Checkout · ${tenant.name}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button kind="primary" disabled={!pkg} onClick={submit}>
            Create payment order
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-[13px]">
        {options.length === 0 ? (
          <p className="text-ink-500">Nothing is available to buy right now.</p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={kind ? kindLabel[kind] : 'Item'}>
                <Select value={pkgId} onChange={setPkgId} options={options.map((p) => ({ value: p.id, label: `${p.name} · ${taka(p.priceBdt)} ${billingLabel(p)}` }))} />
              </Field>
              <Field label="Payment method">
                <Select value={method} onChange={(v) => setMethod(v as PaymentMethod)} options={['bKash', 'Nagad', 'Bank transfer']} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Coupon code (optional)">
                  <Input value={code} onChange={(v) => setCode(v.toUpperCase())} placeholder={autoOffer ? `${autoOffer.name} applies automatically` : 'e.g. PUJO20'} />
                </Field>
                {code.trim() && (
                  <p className={`mt-1 text-xs ${codeCheck?.ok ? 'text-success' : 'text-danger'}`}>{!codeOffer ? 'Code not recognised.' : codeCheck?.ok ? `${codeOffer.name} applied. Offers don’t combine.` : codeCheck?.reason}</p>
                )}
              </div>
            </div>

            {pkg && q && (
              <div className="rounded-lg border border-ink-100">
                <dl className="divide-y divide-ink-100">
                  <Row label={pkg.name} value={taka(q.list)} helper={billingLabel(pkg)} />
                  {q.discount > 0 && <Row label={`Discount · ${offer?.name}`} value={`− ${taka(q.discount)}`} tone="success" />}
                  <Row label="Charges" value={taka(q.charges)} helper="Manual transfer — no gateway fee" />
                  <Row label="Pay now" value={taka(q.total)} strong />
                </dl>
                <div className="space-y-1 border-t border-ink-100 bg-ink-50/60 px-3 py-2 text-xs text-ink-600">
                  <p>
                    <b className="font-medium text-ink">You get:</b> {pkg.kind === 'SMS' ? `${pkg.smsCredits.toLocaleString()} credits` : pkg.features.map((f) => featureCatalog.find((x) => x.key === f)?.label ?? f).join(', ') || pkg.description}
                    {q.bonusCredits > 0 && ` + ${q.bonusCredits} bonus SMS`}
                    {pkg.kind === 'PLAN' && pkg.smsCredits > 0 && ` + ${pkg.smsCredits} SMS ${pkg.smsGrant === 'EACH_PERIOD' ? 'each period' : 'once'}`}
                  </p>
                  <p>
                    <b className="font-medium text-ink">Duration:</b> {q.durationDays ? `${q.durationDays} days from activation` : 'One-time'}
                  </p>
                  {q.introNote && <p className="text-warning">{q.introNote}</p>}
                  {q.offerNote && <p>{q.offerNote}</p>}
                  <p>{retains}</p>
                </div>
              </div>
            )}
            <p className="flex items-start gap-1.5 text-xs text-ink-500">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-teal-600" aria-hidden="true" />
              Nothing activates until billing verifies the payment. A screenshot alone is not proof. This is HisabIQ billing — it never touches the business’s own sales or cash.
            </p>
            {error && <p role="alert" className="text-xs text-danger">{error}</p>}
          </>
        )}
      </div>
    </Modal>
  );
}

function Row({ label, value, helper, strong, tone }: { label: string; value: string; helper?: string; strong?: boolean; tone?: 'success' }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-3 py-2">
      <dt className={strong ? 'font-semibold text-ink' : 'text-ink-700'}>
        {label}
        {helper && <span className="ml-1.5 text-[11px] text-ink-500">{helper}</span>}
      </dt>
      <dd className={`tabular-nums ${strong ? 'text-[15px] font-semibold text-ink' : tone === 'success' ? 'text-success' : 'text-ink'}`}>{value}</dd>
    </div>
  );
}
