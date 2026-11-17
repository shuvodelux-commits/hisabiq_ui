import type { PlanCode } from '../types/experience';
import type { Feature, InterfaceLevel, Offer, PaymentOrder, SaasPackage, Tenant } from '../types/saas';

/** Fixed prototype clock (Asia/Dhaka business date). */
export const NOW = '2026-10-25';
export const NOW_TIME = '2026-10-25T10:30:00+06:00';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function addDays(date: string, days: number): string {
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((new Date(`${to.slice(0, 10)}T00:00:00Z`).getTime() - new Date(`${from.slice(0, 10)}T00:00:00Z`).getTime()) / 86400000);
}

export function fmtDate(date: string | null | undefined): string {
  if (!date) return '—';
  const [y, m, d] = date.slice(0, 10).split('-');
  return `${d} ${months[Number(m) - 1]} ${y}`;
}

export function fmtDateTime(iso: string): string {
  const t = iso.length > 10 ? iso.slice(11, 16) : '';
  return t ? `${fmtDate(iso)}, ${t}` : fmtDate(iso);
}

export function expiryText(date: string | null): { text: string; tone: 'neutral' | 'warning' | 'danger' } {
  if (!date) return { text: 'No expiry', tone: 'neutral' };
  const left = daysBetween(NOW, date);
  if (left < 0) return { text: `Ended ${fmtDate(date)}`, tone: 'danger' };
  if (left <= 7) return { text: `${fmtDate(date)} · ${left === 0 ? 'today' : `${left}d left`}`, tone: 'warning' };
  return { text: fmtDate(date), tone: 'neutral' };
}

let seq = 0;
export const sid = (prefix: string) => `${prefix}-${Date.now().toString(36).slice(-4).toUpperCase()}${(seq++).toString(36).toUpperCase()}`;

/* ---------------- SMS segments ---------------- */
const gsm = /^[A-Za-z0-9 @£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/;

export function segmentInfo(text: string) {
  const encoding: 'GSM' | 'Unicode' = gsm.test(text) ? 'GSM' : 'Unicode';
  const chars = [...text].length;
  const single = encoding === 'GSM' ? 160 : 70;
  const multi = encoding === 'GSM' ? 153 : 67;
  const segments = chars === 0 ? 0 : chars <= single ? 1 : Math.ceil(chars / multi);
  const perSegment = segments > 1 ? multi : single;
  return { encoding, chars, segments, perSegment, remaining: segments === 0 ? single : segments * perSegment - chars };
}

/* ---------------- Interface level from features ---------------- */
export function levelFromFeatures(features: string[]): InterfaceLevel {
  if (features.includes('interface.details')) return 'PREMIUM';
  if (features.includes('interface.links')) return 'MEDIUM';
  return 'BASIC';
}

export const levelLabel: Record<InterfaceLevel, string> = { BASIC: 'Basic', MEDIUM: 'Medium', PREMIUM: 'Premium' };

export function periodDays(pkg: Pick<SaasPackage, 'billing' | 'passDays'>): number | null {
  if (pkg.billing === 'MONTHLY') return 30;
  if (pkg.billing === 'YEARLY') return 365;
  if (pkg.billing === 'PASS') return pkg.passDays;
  return null;
}

export function billingLabel(pkg: Pick<SaasPackage, 'billing' | 'passDays'>): string {
  if (pkg.billing === 'MONTHLY') return 'per month';
  if (pkg.billing === 'YEARLY') return 'per year';
  if (pkg.billing === 'PASS') return `${pkg.passDays}-day pass`;
  return 'one-time';
}

/* ---------------- Validation ---------------- */
export type Issue = { level: 'error' | 'warning'; text: string };

export function validatePackage(p: SaasPackage, catalog: Feature[]): Issue[] {
  const issues: Issue[] = [];
  const label = (k: string) => catalog.find((f) => f.key === k)?.label ?? k;
  if (!p.name.trim()) issues.push({ level: 'error', text: 'Give the package a name.' });
  if (!Number.isFinite(p.priceBdt) || p.priceBdt < 0) issues.push({ level: 'error', text: 'Price must be ৳0 or more.' });
  if (p.billing === 'PASS' && (!p.passDays || p.passDays < 1 || p.passDays > 365)) issues.push({ level: 'error', text: 'Pass length must be 1–365 days.' });
  if (p.kind === 'SMS' && p.smsCredits <= 0) issues.push({ level: 'error', text: 'An SMS package needs at least 1 credit.' });
  if (p.kind !== 'SMS' && p.kind !== 'SERVICE' && p.features.length === 0) issues.push({ level: 'error', text: 'Select at least one feature.' });
  for (const k of p.features) {
    const f = catalog.find((x) => x.key === k);
    if (!f) continue;
    for (const r of f.requires) if (!p.features.includes(r)) issues.push({ level: 'error', text: `${f.label} needs ${label(r)}.` });
    for (const c of f.conflicts) if (p.features.includes(c)) issues.push({ level: 'error', text: `${f.label} can’t be combined with ${label(c)}.` });
  }
  if (p.availableTo && p.availableTo < p.availableFrom) issues.push({ level: 'error', text: 'End date is before the start date.' });
  if (p.visibility === 'RESTRICTED' && p.restrictedTenantIds.length === 0) issues.push({ level: 'error', text: 'Choose at least one business for a restricted package.' });
  if (p.userLimit < 1) issues.push({ level: 'error', text: 'User limit must be at least 1.' });
  if (p.smsCredits > 0 && p.smsExpiryDays < 1) issues.push({ level: 'error', text: 'SMS credits need an expiry of at least 1 day.' });
  if (p.billing === 'ONE_TIME' && p.smsGrant === 'EACH_PERIOD' && p.smsCredits > 0) issues.push({ level: 'warning', text: 'One-time packages grant SMS once; “each period” will behave as once.' });
  return issues;
}

export function validateOffer(o: Offer): Issue[] {
  const issues: Issue[] = [];
  if (!o.name.trim()) issues.push({ level: 'error', text: 'Give the offer a name.' });
  if (o.packageIds.length === 0) issues.push({ level: 'error', text: 'Select at least one package.' });
  if (o.type === 'PERCENT' && (o.value <= 0 || o.value > 90)) issues.push({ level: 'error', text: 'Percentage must be 1–90%.' });
  if ((o.type === 'FIXED' || o.type === 'SETUP') && o.value <= 0) issues.push({ level: 'error', text: 'Enter a taka amount above 0.' });
  if (o.type === 'INTRO' && (o.value < 0 || o.introPeriods < 1)) issues.push({ level: 'error', text: 'Set an introductory price and at least 1 period.' });
  if (o.type === 'TRIAL' && (o.value < 1 || o.value > 30)) issues.push({ level: 'error', text: 'Trials run 1–30 days.' });
  if (o.type === 'BONUS_SMS' && o.value < 1) issues.push({ level: 'error', text: 'Bonus credits must be at least 1.' });
  if (o.endsAt < o.startsAt) issues.push({ level: 'error', text: 'End date is before the start date.' });
  if (o.code !== null && !/^[A-Z0-9]{4,16}$/.test(o.code)) issues.push({ level: 'error', text: 'Coupon codes are 4–16 capital letters or numbers.' });
  if (o.audience === 'SELECTED' && o.tenantIds.length === 0) issues.push({ level: 'error', text: 'Choose at least one business.' });
  if (o.perBusiness < 1) issues.push({ level: 'error', text: 'Per-business limit must be at least 1.' });
  if (o.stackable) issues.push({ level: 'warning', text: 'This offer can combine with other offers. Check the lowest possible price.' });
  return issues;
}

/* ---------------- Pricing ---------------- */
export type Quote = {
  list: number;
  discount: number;
  charges: number;
  total: number;
  bonusCredits: number;
  durationDays: number | null;
  introNote: string | null;
  offerNote: string | null;
};

export function quote(pkg: SaasPackage, offer: Offer | null): Quote {
  const list = pkg.priceBdt;
  let discount = 0;
  let bonusCredits = 0;
  let introNote: string | null = null;
  let offerNote: string | null = null;
  if (offer) {
    if (offer.type === 'PERCENT') discount = Math.round((list * offer.value) / 100);
    if (offer.type === 'FIXED') discount = Math.min(list, offer.value);
    if (offer.type === 'INTRO') {
      discount = Math.max(0, list - offer.value);
      introNote = `৳${offer.value} for the first ${offer.introPeriods} period${offer.introPeriods > 1 ? 's' : ''}, then ৳${list} ${billingLabel(pkg)}. Cancel any time before renewal.`;
    }
    if (offer.type === 'BONUS_SMS') bonusCredits = offer.value;
    if (offer.type === 'TRIAL') offerNote = `${offer.value}-day free trial first. No charge until you confirm payment.`;
    if (offer.type === 'SETUP') offerNote = `Setup service worth ৳${offer.value} included.`;
  }
  const charges = 0; // Manual bKash/Nagad/bank transfer: no gateway fee in this prototype.
  return { list, discount, charges, total: Math.max(0, list - discount + charges), bonusCredits, durationDays: periodDays(pkg), introNote, offerNote };
}

export function offerEligibility(offer: Offer, pkg: SaasPackage, tenant: Tenant, orders: PaymentOrder[]): { ok: boolean; reason?: string } {
  if (offer.status !== 'ACTIVE') return { ok: false, reason: offer.status === 'PAUSED' ? 'This offer is paused.' : 'This offer isn’t active.' };
  if (NOW < offer.startsAt || NOW > offer.endsAt) return { ok: false, reason: `Valid ${fmtDate(offer.startsAt)} – ${fmtDate(offer.endsAt)}.` };
  if (!offer.packageIds.includes(pkg.id)) return { ok: false, reason: `Not valid for ${pkg.name}.` };
  const paid = orders.filter((o) => o.tenantId === tenant.id && o.state === 'COMPLETED' && o.listPrice > 0).length;
  if (offer.audience === 'NEW' && paid > 0) return { ok: false, reason: 'Only for businesses that haven’t paid before.' };
  if (offer.audience === 'EXISTING' && paid === 0) return { ok: false, reason: 'Only for existing paying businesses.' };
  if (offer.audience === 'SELECTED' && !offer.tenantIds.includes(tenant.id)) return { ok: false, reason: 'Not available for this business.' };
  if (pkg.priceBdt < offer.minPurchase) return { ok: false, reason: `Minimum purchase ৳${offer.minPurchase}.` };
  const used = orders.filter((o) => o.offerId === offer.id && o.state !== 'FAILED' && o.state !== 'REFUNDED');
  if (offer.maxRedemptions !== null && used.length >= offer.maxRedemptions) return { ok: false, reason: 'Redemption limit reached.' };
  if (used.filter((o) => o.tenantId === tenant.id).length >= offer.perBusiness) return { ok: false, reason: 'Already used by this business.' };
  return { ok: true };
}

export function planRank(code: PlanCode): number {
  return ['FREE', 'COUNTER', 'PRO', 'PLUS'].indexOf(code);
}
