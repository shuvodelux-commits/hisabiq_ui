import type { Offer, PromoStatus, Result, SaasPackage } from '../../types/saas';
import { NOW, fmtDate } from '../../utils/saas';
import type { SaasCore } from './useSaasCore';

/** Plans, add-ons, services and offers. Published versions are locked; edits create drafts. */
export function useCatalogCommands(core: SaasCore) {
  const { ref, commit, run, event, staff } = core;

  const savePackage = (p: SaasPackage): Result =>
    run({ perm: 'plans.edit', tenantId: null, what: 'edit the catalog' }, () => {
      const exists = ref.current.packages.some((x) => x.id === p.id);
      const live = exists && p.version > 0 && (p.status === 'ACTIVE' || p.status === 'SCHEDULED');
      const draft: SaasPackage = { ...p, id: live ? `${p.id}~draft` : p.id, status: 'DRAFT', updatedBy: staff.name, updatedAt: NOW };
      commit((s) => ({
        ...s,
        packages: s.packages.some((x) => x.id === draft.id) ? s.packages.map((x) => (x.id === draft.id ? draft : x)) : [draft, ...s.packages],
        audit: [event(null, 'package.draft.saved', `${draft.name} · ৳${draft.priceBdt} ${draft.billing.toLowerCase()}`), ...s.audit],
      }));
      return { ok: true, message: 'Draft saved. Customers see nothing until it’s published.', id: draft.id };
    });

  const publishPackage = (id: string, summary: string): Result =>
    run({ perm: 'plans.publish', tenantId: null, what: 'publish catalog changes' }, () => {
      const s = ref.current;
      const d = s.packages.find((x) => x.id === id);
      if (!d) return { ok: false, message: 'Not found.' };
      const targetId = id.replace('~draft', '');
      const live = s.packages.find((x) => x.id === targetId && x.id !== id);
      const version = (live?.version ?? d.version) + 1;
      const status: PromoStatus = d.availableFrom > NOW ? 'SCHEDULED' : 'ACTIVE';
      const published: SaasPackage = { ...d, id: targetId, status, version, versions: [...(live?.versions ?? d.versions), { version, at: NOW, by: staff.name, priceBdt: d.priceBdt, summary }], updatedBy: staff.name, updatedAt: NOW };
      commit((x) => ({ ...x, packages: [published, ...x.packages.filter((p) => p.id !== id && p.id !== targetId)], audit: [event(null, 'package.published', `${published.name} v${version} · ৳${published.priceBdt}`, summary), ...x.audit] }));
      return { ok: true, message: `${published.name} v${version} ${status === 'SCHEDULED' ? `scheduled for ${fmtDate(published.availableFrom)}` : 'is live'}. Existing purchases keep their terms.` };
    });

  const setPackageStatus = (id: string, status: PromoStatus): Result =>
    run({ perm: 'plans.publish', tenantId: null, what: 'change catalog status' }, () => {
      const p = ref.current.packages.find((x) => x.id === id);
      if (!p) return { ok: false, message: 'Not found.' };
      if (p.kind === 'PLAN' && p.basePlan === 'FREE' && status !== 'ACTIVE') return { ok: false, message: 'Free must stay available — expired businesses fall back to it.' };
      commit((s) => ({ ...s, packages: s.packages.map((x) => (x.id === id ? { ...x, status } : x)), audit: [event(null, 'package.status', `${p.name}: ${p.status} → ${status}`), ...s.audit] }));
      return { ok: true, message: status === 'PAUSED' ? 'Paused. No new purchases; existing customers keep what they bought.' : status === 'ENDED' ? `${p.name} retired. Existing customers keep their terms.` : `${p.name} is now ${status.toLowerCase()}.` };
    });

  const saveOffer = (o: Offer): Result =>
    run({ perm: 'plans.edit', tenantId: null, what: 'edit offers' }, () => {
      if (o.code && ref.current.offers.some((x) => x.code === o.code && x.id !== o.id && x.status !== 'ENDED')) return { ok: false, message: `Code ${o.code} is already used by another offer.` };
      const next: Offer = { ...o, status: 'DRAFT', updatedBy: staff.name, updatedAt: NOW };
      commit((s) => ({ ...s, offers: s.offers.some((x) => x.id === o.id) ? s.offers.map((x) => (x.id === o.id ? next : x)) : [next, ...s.offers], audit: [event(null, 'offer.draft.saved', o.name), ...s.audit] }));
      return { ok: true, message: 'Offer saved as draft.', id: o.id };
    });

  const publishOffer = (id: string): Result =>
    run({ perm: 'plans.publish', tenantId: null, what: 'publish offers' }, () => {
      const o = ref.current.offers.find((x) => x.id === id);
      if (!o) return { ok: false, message: 'Not found.' };
      const status: PromoStatus = o.startsAt > NOW ? 'SCHEDULED' : o.endsAt < NOW ? 'ENDED' : 'ACTIVE';
      const version = o.version + 1;
      commit((s) => ({
        ...s,
        offers: s.offers.map((x) => (x.id === id ? { ...x, status, version, versions: [...x.versions, { version, at: NOW, by: staff.name, priceBdt: 0, summary: 'Published' }] } : x)),
        audit: [event(null, 'offer.published', `${o.name} v${version} (${status.toLowerCase()})`), ...s.audit],
      }));
      return { ok: true, message: status === 'SCHEDULED' ? `Scheduled from ${fmtDate(o.startsAt)}.` : 'Offer is live.' };
    });

  const setOfferStatus = (id: string, status: PromoStatus): Result =>
    run({ perm: 'plans.publish', tenantId: null, what: 'change offer status' }, () => {
      const o = ref.current.offers.find((x) => x.id === id);
      if (!o) return { ok: false, message: 'Not found.' };
      commit((s) => ({ ...s, offers: s.offers.map((x) => (x.id === id ? { ...x, status } : x)), audit: [event(null, 'offer.status', `${o.name}: ${o.status} → ${status}`), ...s.audit] }));
      return { ok: true, message: status === 'PAUSED' ? 'Paused. New redemptions stop; benefits already bought stay.' : `Offer is now ${status.toLowerCase()}.` };
    });

  return { savePackage, publishPackage, setPackageStatus, saveOffer, publishOffer, setOfferStatus };
}
