import type { Entitlement, Offer, PaymentMethod, PaymentOrder, Result, SmsMove } from '../../types/saas';
import { planFeatures, planPrice, planUserLimit } from '../../data/saasSeeds';
import { NOW, NOW_TIME, addDays, offerEligibility, quote, sid } from '../../utils/saas';
import { paymentChecks } from '../../utils/saasBilling';
import type { SaasCore } from './useSaasCore';

export function useBillingCommands(core: SaasCore) {
  const { ref, commit, run, event, tenantById, staff } = core;
  const orderById = (id: string) => ref.current.orders.find((x) => x.id === id);
  const setOrder = (id: string, patch: Partial<PaymentOrder>, ev: ReturnType<typeof event>) =>
    commit((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)), audit: [ev, ...s.audit] }));

  const checkout = (input: { tenantId: string; packageId: string; offerCode: string; autoOfferId: string | null; method: PaymentMethod; onBehalf: boolean }): Result =>
    run({ perm: ['invoices.edit', 'subscriptions.edit', 'tenants.edit'], tenantId: input.tenantId, what: 'create invoices' }, () => {
      const s = ref.current;
      const t = tenantById(input.tenantId);
      const pkg = s.packages.find((p) => p.id === input.packageId);
      if (!t || !pkg) return { ok: false, message: 'Business or package not found.' };
      if (pkg.status !== 'ACTIVE') return { ok: false, message: `${pkg.name} isn’t available for purchase.` };
      if (pkg.visibility === 'RESTRICTED' && !pkg.restrictedTenantIds.includes(t.id)) return { ok: false, message: 'This package isn’t offered to this business.' };
      if (t.account !== 'Active') return { ok: false, message: `Account is ${t.account.toLowerCase()}. Reactivate it first.` };
      let offer: Offer | null = null;
      if (input.offerCode.trim()) {
        offer = s.offers.find((o) => o.code === input.offerCode.trim().toUpperCase()) ?? null;
        if (!offer) return { ok: false, message: 'Coupon code not recognised.' };
      } else if (input.autoOfferId) offer = s.offers.find((o) => o.id === input.autoOfferId) ?? null;
      if (offer) {
        const el = offerEligibility(offer, pkg, t, s.orders);
        if (!el.ok) return { ok: false, message: el.reason ?? 'Offer not valid.' };
      }
      const q = quote(pkg, offer);
      const order: PaymentOrder = {
        id: sid('PO'), tenantId: t.id, kind: pkg.kind === 'PLAN' ? 'SUBSCRIPTION' : pkg.kind, packageId: pkg.id, packageVersion: pkg.version,
        terms: { name: pkg.name, benefit: `${pkg.name}${q.durationDays ? ` · ${q.durationDays} days` : ' · one-time'}`, durationDays: q.durationDays, smsCredits: pkg.smsCredits, features: pkg.features, planCode: pkg.basePlan },
        offerId: offer?.id ?? null, offerCode: offer?.code ?? null, listPrice: q.list, discount: q.discount, charges: q.charges, total: q.total, bonusCredits: q.bonusCredits,
        method: input.method, reference: '', evidence: null, state: q.total === 0 ? 'ACTIVATION_PENDING' : 'PAYMENT_PENDING', createdAt: NOW_TIME, createdBy: input.onBehalf ? `${staff.name} for owner` : 'Business owner',
      };
      commit((x) => ({ ...x, orders: [order, ...x.orders], audit: [event(t.id, 'invoice.issued', `${order.id} · ${pkg.name} v${pkg.version} · ৳${order.total}${offer ? ` · offer ${offer.name}` : ''}`), ...x.audit] }));
      return { ok: true, message: q.total === 0 ? 'No payment needed. Ready to activate.' : `Invoice ${order.id} issued. Waiting for payment.`, id: order.id };
    });

  /** Renewal invoice at the price the business already pays (repricing needs separate approval). */
  const createRenewalInvoice = (tenantId: string): Result =>
    run({ perm: ['invoices.edit', 'subscriptions.edit'], tenantId, what: 'create renewal invoices' }, () => {
      const s = ref.current;
      const t = tenantById(tenantId);
      if (!t || t.planCode === 'FREE') return { ok: false, message: 'Free plans don’t renew.' };
      if (s.orders.some((o) => o.tenantId === tenantId && o.kind === 'SUBSCRIPTION' && ['PAYMENT_PENDING', 'VERIFICATION_PENDING'].includes(o.state))) return { ok: false, message: 'An unpaid subscription invoice already exists.' };
      const plan = t.scheduledChange?.kind === 'PLAN' && t.scheduledChange.planCode ? t.scheduledChange.planCode : t.planCode;
      const last = s.orders.find((o) => o.tenantId === tenantId && o.kind === 'SUBSCRIPTION' && o.state === 'COMPLETED' && o.terms.planCode === plan);
      const price = last?.listPrice ?? planPrice[plan];
      const pkg = s.packages.find((p) => p.basePlan === plan && p.kind === 'PLAN' && p.status === 'ACTIVE' && p.visibility === 'PUBLIC');
      const name = pkg?.name ?? plan;
      const order: PaymentOrder = {
        id: sid('PO'), tenantId, kind: 'SUBSCRIPTION', packageId: pkg?.id ?? `PKG-${plan}`, packageVersion: last?.packageVersion ?? pkg?.version ?? 1,
        terms: { name, benefit: `${name} plan · 30 days (renewal)`, durationDays: 30, smsCredits: pkg?.smsCredits ?? 0, features: planFeatures[plan], planCode: plan },
        offerId: null, offerCode: null, listPrice: price, discount: 0, charges: 0, total: price, bonusCredits: 0, method: 'bKash', reference: '', evidence: null, state: 'PAYMENT_PENDING', createdAt: NOW_TIME, createdBy: staff.name,
      };
      commit((x) => ({ ...x, orders: [order, ...x.orders], audit: [event(tenantId, 'invoice.renewal.issued', `${order.id} · ${name} renewal ৳${price}${last ? ' (kept price)' : ''}`), ...x.audit] }));
      return { ok: true, message: `Renewal invoice ${order.id} for ৳${price} issued.`, id: order.id };
    });

  const submitReference = (id: string, reference: string, evidence: string | null, payer?: string): Result => {
    const o = orderById(id);
    if (!o || !['PAYMENT_PENDING', 'FAILED'].includes(o.state)) return { ok: false, message: 'This invoice isn’t waiting for payment.' };
    return run({ perm: ['invoices.edit', 'payments.verify'], tenantId: o.tenantId, what: 'enter payment proof for owners' }, () => {
      const trx = reference.trim().toUpperCase();
      if (!/^[A-Z0-9-]{6,20}$/.test(trx)) return { ok: false, message: 'Enter the transaction ID (6–20 letters or numbers).' };
      setOrder(id, { reference: trx, evidence, payer: payer?.trim() || o.payer, state: 'VERIFICATION_PENDING', failureReason: undefined, claimedBy: undefined, createdBy: `${staff.name} for owner` }, event(o.tenantId, 'payment.submitted', `${id}: ${o.method} TRX ${trx}${evidence ? ' + screenshot' : ''}`, 'Not active until verified'));
      return { ok: true, message: 'Proof recorded. Someone else must verify it against the statement.' };
    });
  };

  const claimPayment = (id: string, release = false): Result => {
    const o = orderById(id);
    if (!o || o.state !== 'VERIFICATION_PENDING') return { ok: false, message: 'Not waiting for verification.' };
    return run({ perm: 'payments.verify', tenantId: o.tenantId, what: 'claim payments' }, () => {
      if (release) {
        if (o.claimedBy !== staff.name) return { ok: false, message: 'You haven’t claimed this.' };
        setOrder(id, { claimedBy: undefined }, event(o.tenantId, 'payment.released', `${id} released back to the queue`));
        return { ok: true, message: 'Released to the queue.' };
      }
      if (o.claimedBy && o.claimedBy !== staff.name) return { ok: false, message: `${o.claimedBy} is already reviewing this.` };
      if (o.claimedBy === staff.name) return { ok: true, message: 'You’re reviewing this.' };
      setOrder(id, { claimedBy: staff.name }, event(o.tenantId, 'payment.claimed', `${id} claimed for review`));
      return { ok: true, message: 'Claimed. Others won’t act on it while you review.' };
    });
  };

  const guardReview = (o: PaymentOrder): Result | null => {
    if (o.claimedBy !== staff.name) return { ok: false, message: o.claimedBy ? `${o.claimedBy} is reviewing this.` : 'Claim the payment before acting on it.' };
    if (o.createdBy.startsWith(staff.name)) return { ok: false, message: 'You entered this proof, so someone else must verify it.' };
    return null;
  };

  const verifyPayment = (id: string, amountReceived: number): Result => {
    const o = orderById(id);
    if (!o || o.state !== 'VERIFICATION_PENDING') return { ok: false, message: 'This invoice isn’t waiting for verification.' };
    return run({ perm: 'payments.verify', tenantId: o.tenantId, what: 'verify payments', once: `verify:${id}:${o.reference}` }, () => {
      const blocked = guardReview(o);
      if (blocked) return blocked;
      const s = ref.current;
      const { checks } = paymentChecks(o, s.statement, s.orders, s.settings);
      const hard = checks.find((c) => c.level === 'error');
      if (hard) return { ok: false, message: hard.text };
      if (!(amountReceived > 0)) return { ok: false, message: 'Enter the amount received.' };
      const paid = (o.paidAmount ?? 0) + amountReceived;
      if (paid < o.total) {
        setOrder(id, { state: 'PAYMENT_PENDING', paidAmount: paid, reference: '', claimedBy: undefined, verifiedBy: staff.name }, event(o.tenantId, 'payment.part.verified', `${id}: ৳${amountReceived} received, ৳${o.total - paid} still due`, 'Benefits not granted for a part payment'));
        return { ok: true, message: `Part payment recorded. ৳${o.total - paid} still due — benefits stay off.` };
      }
      setOrder(id, { state: 'ACTIVATION_PENDING', paidAmount: o.total, verifiedBy: staff.name, claimedBy: undefined }, event(o.tenantId, 'payment.verified', `${id} ৳${o.total} matched to ${o.method} ${o.reference}`));
      return { ok: true, message: 'Payment verified. Ready to activate.' };
    });
  };

  const rejectPayment = (id: string, reason: string, askInfo = false): Result => {
    const o = orderById(id);
    if (!o || o.state !== 'VERIFICATION_PENDING') return { ok: false, message: 'Not waiting for verification.' };
    return run({ perm: 'payments.verify', tenantId: o.tenantId, what: 'reject payments' }, () => {
      const blocked = guardReview(o);
      if (blocked) return blocked;
      if (!reason.trim()) return { ok: false, message: askInfo ? 'Write what the owner should send.' : 'Explain why it couldn’t be matched.' };
      if (askInfo) {
        setOrder(id, { infoRequest: reason.trim(), claimedBy: undefined }, event(o.tenantId, 'payment.info.requested', `${id}: ${reason.trim()}`));
        return { ok: true, message: 'Owner asked for more information. Stays in the queue.' };
      }
      setOrder(id, { state: 'FAILED', failureReason: reason.trim(), claimedBy: undefined }, event(o.tenantId, 'payment.rejected', `${id}: ${reason.trim()}`));
      return { ok: true, message: 'Rejected. The owner can send the correct transaction.' };
    });
  };

  /** Applies the invoice's snapshot terms exactly once. */
  const activate = (id: string): Result => {
    const o = orderById(id);
    if (!o) return { ok: false, message: 'Invoice not found.' };
    return run({ perm: 'payments.verify', tenantId: o.tenantId, what: 'activate benefits', once: `activate:${id}` }, () => {
      const s = ref.current;
      if (o.activatedAt) return { ok: false, message: 'Already activated — benefits are never applied twice.' };
      if (o.state !== 'ACTIVATION_PENDING') return { ok: false, message: 'Verify the payment before activating.' };
      const t = tenantById(o.tenantId)!;
      const pkg = s.packages.find((p) => p.id === o.packageId);
      let tenant = { ...t };
      const ents: Entitlement[] = [];
      const moves: SmsMove[] = [];
      let balance = t.smsAvailable;
      if (o.kind === 'SUBSCRIPTION' && o.terms.planCode) {
        const code = o.terms.planCode;
        const startFrom = t.planCode === code && t.expiresAt && t.expiresAt >= NOW && t.status !== 'Expired' ? t.expiresAt : NOW;
        tenant = { ...tenant, planCode: code, status: 'Active', expiresAt: o.terms.durationDays ? addDays(startFrom, o.terms.durationDays) : null, userLimit: pkg?.userLimit ?? planUserLimit[code], expiryNote: undefined, scheduledChange: t.scheduledChange?.kind === 'PLAN' && t.scheduledChange.planCode === code ? null : t.scheduledChange };
        for (const f of o.terms.features.filter((f) => !planFeatures[code].includes(f)))
          ents.push({ id: sid('E'), tenantId: t.id, feature: f, source: 'PURCHASE', scope: 'Business', status: 'Active', startsAt: NOW, expiresAt: tenant.expiresAt, ref: o.id, note: o.terms.name, grantedBy: 'Payment verified' });
      }
      if (o.kind === 'FEATURE')
        for (const f of o.terms.features)
          ents.push({ id: sid('E'), tenantId: t.id, feature: f, source: 'PURCHASE', scope: 'Business', status: 'Active', startsAt: NOW, expiresAt: o.terms.durationDays ? addDays(NOW, o.terms.durationDays) : null, ref: o.id, note: o.terms.name, grantedBy: 'Payment verified' });
      if (o.terms.smsCredits > 0) {
        balance += o.terms.smsCredits;
        moves.push({ id: sid('SM'), tenantId: t.id, at: NOW_TIME, kind: o.kind === 'SMS' ? 'PURCHASE' : 'GRANT', credits: o.terms.smsCredits, balance, ref: o.id, note: o.terms.name, expiresAt: addDays(NOW, pkg?.smsExpiryDays ?? 365) });
      }
      if (o.bonusCredits > 0) {
        balance += o.bonusCredits;
        moves.push({ id: sid('SM'), tenantId: t.id, at: NOW_TIME, kind: 'BONUS', credits: o.bonusCredits, balance, ref: o.id, note: 'Offer bonus', expiresAt: addDays(NOW, pkg?.smsExpiryDays ?? 365) });
      }
      tenant.smsAvailable = balance;
      const services = o.kind === 'SERVICE' && !s.services.some((x) => x.packageId === o.packageId && x.tenantId === t.id && x.state === 'APPROVED')
        ? [{ id: sid('SV'), tenantId: t.id, title: o.terms.name, packageId: o.packageId, quoteBdt: o.total, state: 'APPROVED' as const, assignee: '', scheduledAt: null, requestedAt: NOW_TIME, notes: `Paid via ${o.id}` }, ...s.services]
        : s.services;
      commit((x) => ({
        ...x,
        tenants: x.tenants.map((y) => (y.id === t.id ? tenant : y)),
        entitlements: [...ents, ...x.entitlements],
        smsMoves: [...moves, ...x.smsMoves],
        services,
        orders: x.orders.map((y) => (y.id === id ? { ...y, state: 'COMPLETED', activatedAt: NOW_TIME } : y)),
        audit: [event(t.id, 'invoice.fulfilled', `${id}: ${o.terms.benefit}${o.bonusCredits ? ` + ${o.bonusCredits} bonus SMS` : ''}`), ...x.audit],
      }));
      return { ok: true, message: `Activated: ${o.terms.benefit}.` };
    });
  };

  const voidInvoice = (id: string, reason: string): Result => {
    const o = orderById(id);
    if (!o) return { ok: false, message: 'Not found.' };
    return run({ perm: 'invoices.edit', tenantId: o.tenantId, what: 'void invoices' }, () => {
      if (!['PAYMENT_PENDING', 'FAILED'].includes(o.state) || (o.paidAmount ?? 0) > 0) return { ok: false, message: 'Only unpaid invoices can be voided. Use a refund for money received.' };
      if (!reason.trim()) return { ok: false, message: 'Enter a reason.' };
      setOrder(id, { state: 'VOIDED', voidReason: reason.trim() }, event(o.tenantId, 'invoice.voided', `${id} voided`, `Reason: ${reason.trim()}`));
      return { ok: true, message: 'Invoice voided. Kept in history.' };
    });
  };

  const requestRefund = (id: string, amount: number, reason: string): Result => {
    const o = orderById(id);
    if (!o) return { ok: false, message: 'Not found.' };
    return run({ perm: 'payments.refund', tenantId: o.tenantId, what: 'refund payments' }, () => {
      if (o.state !== 'COMPLETED' && o.state !== 'ACTIVATION_PENDING') return { ok: false, message: 'Only received payments can be refunded.' };
      if (!(amount > 0) || amount > o.total) return { ok: false, message: `Refund must be between ৳1 and ৳${o.total}.` };
      if (!reason.trim()) return { ok: false, message: 'Enter a refund reason.' };
      setOrder(id, { state: 'REFUND_PENDING', refund: { amount, reason: reason.trim(), by: staff.name, at: NOW_TIME } }, event(o.tenantId, 'refund.requested', `${id}: ৳${amount}`, `Reason: ${reason}`));
      return { ok: true, message: 'Refund approved. Send the money, then mark it returned.' };
    });
  };

  const completeRefund = (id: string): Result => {
    const o = orderById(id);
    if (!o) return { ok: false, message: 'Not found.' };
    return run({ perm: 'payments.refund', tenantId: o.tenantId, what: 'refund payments', once: `refund:${id}` }, () => {
      if (o.state !== 'REFUND_PENDING' || !o.refund) return { ok: false, message: 'No pending refund.' };
      const t = tenantById(o.tenantId)!;
      const full = o.refund.amount >= o.total;
      const reverse = full ? Math.min(t.smsAvailable, o.terms.smsCredits + o.bonusCredits) : 0;
      commit((x) => ({
        ...x,
        orders: x.orders.map((y) => (y.id === id ? { ...y, state: 'REFUNDED' } : y)),
        entitlements: full ? x.entitlements.map((e) => (e.ref === id ? { ...e, status: 'Revoked', note: `${e.note} · refunded` } : e)) : x.entitlements,
        tenants: reverse ? x.tenants.map((y) => (y.id === t.id ? { ...y, smsAvailable: y.smsAvailable - reverse } : y)) : x.tenants,
        smsMoves: reverse ? [{ id: sid('SM'), tenantId: t.id, at: NOW_TIME, kind: 'REFUND', credits: -reverse, balance: t.smsAvailable - reverse, ref: id, note: 'Unused credits reversed on refund' }, ...x.smsMoves] : x.smsMoves,
        audit: [event(t.id, 'refund.completed', `${id}: ৳${o.refund!.amount} returned${full ? '; purchased benefits removed' : '; benefits kept (partial refund)'}`), ...x.audit],
      }));
      return { ok: true, message: full ? 'Refunded. Purchased benefits removed; past records kept.' : 'Partial refund recorded. Benefits kept.' };
    });
  };

  return { checkout, createRenewalInvoice, submitReference, claimPayment, verifyPayment, rejectPayment, activate, voidInvoice, requestRefund, completeRefund };
}
