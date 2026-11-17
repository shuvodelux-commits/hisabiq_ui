import React, { useState } from 'react';
import { CircleStop, Eye, Pause, Pencil, Play, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Tabs } from '../../prototype/Ui';
import { useSaas } from '../../contexts/SaasContext';
import { Badge, Denied, EmptyRow, PageTitle, promoMeta, td, tdAction, th, thAction } from '../../components/saas/SaasBits';
import { RowActions, type RowAction } from '../../components/saas/RowActions';
import { PackageBuilder } from '../../components/saas/packages/PackageBuilder';
import { OfferBuilder } from '../../components/saas/packages/OfferBuilder';
import { billingLabel, fmtDate, levelLabel, sid } from '../../utils/saas';
import { formatNumber, taka } from '../../utils/currency';
import type { Offer, PromoStatus, SaasPackage } from '../../types/saas';

const kindLabel = { PLAN: 'Plan', FEATURE: 'Feature', SMS: 'SMS', SERVICE: 'Service' };

const blankPackage = (): SaasPackage => ({
  id: sid('PKG'), kind: 'PLAN', name: '', description: '', basePlan: 'PRO', priceBdt: 0, billing: 'MONTHLY', passDays: 30, features: ['core.erp'], interfaceLevel: 'BASIC',
  userLimit: 3, storageGb: 2, reports: 'Basic', support: 'Standard', smsCredits: 0, smsGrant: 'ONCE', smsExpiryDays: 365, visibility: 'INVITE', restrictedTenantIds: [],
  availableFrom: '2026-10-25', availableTo: null, status: 'DRAFT', version: 0, versions: [], updatedBy: '', updatedAt: '',
});
const blankOffer = (): Offer => ({
  id: sid('OF'), name: '', type: 'PERCENT', value: 10, introPeriods: 1, packageIds: [], audience: 'ALL', tenantIds: [], code: null, startsAt: '2026-11-01', endsAt: '2026-11-30',
  maxRedemptions: null, perBusiness: 1, minPurchase: 0, stackable: false, status: 'DRAFT', version: 0, versions: [], updatedBy: '', updatedAt: '',
});

const copy = {
  plans: { title: 'Plans', bn: 'প্ল্যান', desc: 'Free, Counter, Pro and Plus. Published versions are locked; existing customers keep their terms.' },
  addons: { title: 'Add-ons & packages', bn: 'অ্যাড-অন', desc: 'Feature add-ons, SMS packs and paid services sold on top of a plan.' },
  offers: { title: 'Offers', bn: 'অফার', desc: 'Discounts, intro prices, trials and bonus SMS. Track what each offer actually earned.' },
};

export function PackagesOffers({ view = 'plans' }: { view?: 'plans' | 'addons' | 'offers' }) {
  const saas = useSaas();
  const [tab, setTab] = useState(view === 'offers' ? 'offers' : 'packages');
  const [pkg, setPkg] = useState<SaasPackage | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  React.useEffect(() => setTab(view === 'offers' ? 'offers' : 'packages'), [view]);
  if (!saas.can('plans.view')) return <Denied what="the catalog" role={saas.staff.label} />;
  const { offers, orders } = saas.state;
  const packages = saas.state.packages.filter((p) => (view === 'plans' ? p.kind === 'PLAN' : view === 'addons' ? p.kind !== 'PLAN' : true));
  const canPublish = saas.can('plans.publish');
  const run = (r: { ok: boolean; message: string }) => (r.ok ? toast.success(r.message) : toast.error(r.message));

  if (pkg) return <PackageBuilder initial={pkg} onClose={() => setPkg(null)} />;
  if (offer) return <OfferBuilder initial={offer} onClose={() => setOffer(null)} />;

  const statusActions = (status: PromoStatus, onSet: (s: PromoStatus) => void): RowAction[] => [
    { label: 'Pause', icon: Pause, hidden: !canPublish || status !== 'ACTIVE', onSelect: () => onSet('PAUSED') },
    { label: 'Resume', icon: Play, hidden: !canPublish || status !== 'PAUSED', onSelect: () => onSet('ACTIVE') },
    { label: 'End', icon: CircleStop, tone: 'danger', divider: true, hidden: !canPublish || !['ACTIVE', 'PAUSED', 'SCHEDULED'].includes(status), onSelect: () => onSet('ENDED') },
  ];

  const perf = offers.map((o) => {
    const os = orders.filter((x) => x.offerId === o.id);
    const done = os.filter((x) => x.state === 'COMPLETED');
    return {
      o,
      purchases: os.length,
      pending: os.filter((x) => ['PAYMENT_PENDING', 'VERIFICATION_PENDING', 'ACTIVATION_PENDING'].includes(x.state)).length,
      collected: done.reduce((n, x) => n + x.total, 0),
      discount: done.reduce((n, x) => n + x.discount, 0),
      credits: done.reduce((n, x) => n + x.bonusCredits, 0),
      refunds: os.filter((x) => x.state === 'REFUNDED' || x.state === 'REFUND_PENDING').reduce((n, x) => n + (x.refund?.amount ?? 0), 0),
      renewals: done.filter((x) => orders.some((y) => y.tenantId === x.tenantId && y.packageId === x.packageId && y.createdAt > x.createdAt && y.state === 'COMPLETED')).length,
    };
  });

  return (
    <div className="space-y-4">
      <PageTitle
        title={copy[view].title}
        bn={copy[view].bn}
        description={copy[view].desc}
        actions={saas.can('plans.edit') && (view === 'offers' ? (
          <Button kind="primary" onClick={() => setOffer(blankOffer())}><Plus className="size-4" />New offer</Button>
        ) : (
          <Button kind="primary" onClick={() => setPkg({ ...blankPackage(), kind: view === 'plans' ? 'PLAN' : 'FEATURE', basePlan: view === 'plans' ? 'PRO' : null })}><Plus className="size-4" />{view === 'plans' ? 'New plan version' : 'New add-on'}</Button>
        ))}
      />

      <section className="overflow-hidden rounded-xl border border-ink-100 bg-card shadow-card">
        <Tabs label="Catalog" value={tab} onChange={setTab} items={view === 'offers' ? [{ id: 'offers', label: 'Offers', count: offers.length }, { id: 'performance', label: 'Performance' }] : [{ id: 'packages', label: view === 'plans' ? 'Plans' : 'Add-ons', count: packages.length }]} />

        {tab === 'packages' && (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Package</th><th className={`${th} text-right`}>Price</th><th className={`${th} hidden md:table-cell`}>Includes</th><th className={`${th} hidden lg:table-cell`}>Who can buy</th><th className={`${th} hidden text-right lg:table-cell`}>Sold</th><th className={th}>Status</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {packages.length === 0 && <EmptyRow cols={7} text="No packages yet." />}
                {packages.map((p) => (
                  <tr key={p.id} className="border-b border-ink-100 last:border-0">
                    <td className={td}>
                      <button type="button" onClick={() => setPkg(p)} className="font-medium text-ink hover:text-teal-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">{p.name}</button>
                      <span className="block text-[11px] text-ink-500">{kindLabel[p.kind]} · {p.version ? `v${p.version}` : 'unpublished'}{p.id.endsWith('~draft') ? ' · draft of live package' : ''} · {p.updatedBy}</span>
                    </td>
                    <td className={`${td} whitespace-nowrap text-right tabular-nums`}>{taka(p.priceBdt)}<span className="block text-[11px] text-ink-500">{billingLabel(p)}</span></td>
                    <td className={`${td} hidden text-xs text-ink-600 md:table-cell`}>{p.kind === 'SMS' ? `${formatNumber(p.smsCredits)} credits · ${p.smsExpiryDays}d` : p.kind === 'SERVICE' ? p.description : `${levelLabel[p.interfaceLevel]} · ${p.features.length} features · ${p.userLimit} users${p.smsCredits ? ` · ${p.smsCredits} SMS` : ''}`}</td>
                    <td className={`${td} hidden text-xs text-ink-600 lg:table-cell`}>{p.visibility === 'PUBLIC' ? 'Everyone' : p.visibility === 'INVITE' ? 'Invitation' : `${p.restrictedTenantIds.length} businesses`}<span className="block text-[11px] text-ink-500">{fmtDate(p.availableFrom)}{p.availableTo ? ` – ${fmtDate(p.availableTo)}` : ''}</span></td>
                    <td className={`${td} hidden text-right tabular-nums lg:table-cell`}>{orders.filter((o) => o.packageId === p.id && o.state === 'COMPLETED').length}</td>
                    <td className={td}><Badge tone={promoMeta[p.status].tone} dot>{promoMeta[p.status].label}</Badge></td>
                    <td className={tdAction}>
                      <RowActions
                        label={`Actions for ${p.name}`}
                        items={[
                          { label: saas.can('plans.edit') ? 'Edit' : 'View details', icon: saas.can('plans.edit') ? Pencil : Eye, onSelect: () => setPkg(p) },
                          ...statusActions(p.status, (s) => run(saas.setPackageStatus(p.id, s))),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'offers' && (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Offer</th><th className={th}>Benefit</th><th className={`${th} hidden md:table-cell`}>Applies</th><th className={`${th} hidden lg:table-cell`}>Dates</th><th className={`${th} hidden text-right lg:table-cell`}>Used</th><th className={th}>Status</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {offers.length === 0 && <EmptyRow cols={7} text="No offers yet." />}
                {offers.map((o) => {
                  const used = orders.filter((x) => x.offerId === o.id && x.state !== 'FAILED').length;
                  return (
                    <tr key={o.id} className="border-b border-ink-100 last:border-0">
                      <td className={td}><button type="button" onClick={() => setOffer(o)} className="font-medium text-ink hover:text-teal-700 hover:underline">{o.name}</button><span className="block text-[11px] text-ink-500">{o.packageIds.map((id) => packages.find((p) => p.id === id)?.name).join(', ')}</span></td>
                      <td className={`${td} whitespace-nowrap`}>{o.type === 'PERCENT' ? `${o.value}% off` : o.type === 'FIXED' ? `৳${o.value} off` : o.type === 'INTRO' ? `৳${o.value} intro` : o.type === 'TRIAL' ? `${o.value}-day trial` : o.type === 'BONUS_SMS' ? `+${o.value} SMS` : `Setup ৳${o.value}`}</td>
                      <td className={`${td} hidden text-xs md:table-cell`}>{o.code ? <span className="font-medium">{o.code}</span> : 'Automatic'}<span className="block text-[11px] text-ink-500">{o.audience === 'ALL' ? 'All' : o.audience === 'NEW' ? 'New customers' : o.audience === 'EXISTING' ? 'Existing customers' : `${o.tenantIds.length} businesses`}{o.stackable ? ' · combinable' : ''}</span></td>
                      <td className={`${td} hidden whitespace-nowrap text-xs text-ink-600 lg:table-cell`}>{fmtDate(o.startsAt)} – {fmtDate(o.endsAt)}</td>
                      <td className={`${td} hidden text-right tabular-nums lg:table-cell`}>{used}{o.maxRedemptions ? ` / ${o.maxRedemptions}` : ''}</td>
                      <td className={td}><Badge tone={promoMeta[o.status].tone} dot>{promoMeta[o.status].label}</Badge></td>
                      <td className={tdAction}>
                        <RowActions
                          label={`Actions for ${o.name}`}
                          items={[
                            { label: saas.can('plans.edit') && o.status === 'DRAFT' ? 'Edit' : 'View details', icon: saas.can('plans.edit') && o.status === 'DRAFT' ? Pencil : Eye, onSelect: () => setOffer(o) },
                            ...statusActions(o.status, (s) => run(saas.setOfferStatus(o.id, s))),
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

        {tab === 'performance' && (
          <>
            <div className="overflow-x-auto">
              <table data-erp-table className="w-full text-[13px]">
                <thead><tr className="border-b border-ink-100"><th className={th}>Offer</th><th className={`${th} text-right`}>Orders</th><th className={`${th} text-right`}>Pending</th><th className={`${th} text-right`}>Verified collections</th><th className={`${th} hidden text-right md:table-cell`}>Discounts</th><th className={`${th} hidden text-right md:table-cell`}>Bonus SMS</th><th className={`${th} hidden text-right lg:table-cell`}>Refunds</th><th className={`${th} hidden text-right lg:table-cell`}>Renewed</th></tr></thead>
                <tbody>
                  {perf.map((r) => (
                    <tr key={r.o.id} className="border-b border-ink-100 last:border-0">
                      <td className={td}>{r.o.name}<span className="block text-[11px] text-ink-500">{promoMeta[r.o.status].label}</span></td>
                      <td className={`${td} text-right tabular-nums`}>{r.purchases}</td>
                      <td className={`${td} text-right tabular-nums text-warning`}>{r.pending || '—'}</td>
                      <td className={`${td} text-right font-medium tabular-nums text-success`}>{formatNumber(r.collected)}</td>
                      <td className={`${td} hidden text-right tabular-nums md:table-cell`}>{formatNumber(r.discount)}</td>
                      <td className={`${td} hidden text-right tabular-nums md:table-cell`}>{formatNumber(r.credits)}</td>
                      <td className={`${td} hidden text-right tabular-nums lg:table-cell`}>{formatNumber(r.refunds)}</td>
                      <td className={`${td} hidden text-right tabular-nums lg:table-cell`}>{r.renewals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">Collections count completed orders only. Pending payments are not sales. Amounts in ৳.</p>
          </>
        )}
      </section>
    </div>
  );
}
