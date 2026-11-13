import { ApiError } from './errors.ts';
import { parseScaledInput } from './decimal.ts';
import type {
  ConnectedPurchaseResumeReadOnly,
  PurchaseResumeReviewCode,
} from './purchase-editor-resume.ts';

/**
 * MOD-008 P4C — display-only view model of P4B's verified read-only snapshot.
 *
 * Prices/units below are HISTORICAL entered values. Do not recalculate them
 * using today's Nest product DTO, infer unsettled payment accounts, or use this
 * projection for editing, inventory posting or any financial journal.
 */
export interface PurchaseDraftReviewUnitValue {
  readonly unit: string;
  readonly value: string;
}
export interface PurchaseDraftReviewLine {
  readonly id: string;
  readonly productId: string;
  readonly historicalName: string;
  readonly baseUnit: string;
  readonly bigQty: string;
  readonly smallQty: string;
  readonly unitQuantities: readonly PurchaseDraftReviewUnitValue[];
  readonly purchasePrices: readonly PurchaseDraftReviewUnitValue[];
  readonly sellingPrices: readonly PurchaseDraftReviewUnitValue[];
  readonly cost: string;
  readonly costUnit: string;
  readonly lotSellPrice: string;
  readonly lotSellUnit: string;
  readonly serialText: string;
  readonly batchNumber: string;
  readonly manufactureDate: string;
  readonly expiryDate: string;
  readonly codes: readonly PurchaseResumeReviewCode[];
}
export interface PurchaseDraftReviewPayment {
  readonly id: string;
  readonly method: string;
  readonly account: string;
  readonly amount: string;
}
export interface PurchaseDraftReviewView {
  readonly id: string;
  readonly version: number;
  readonly referenceNo: string;
  readonly supplierName: string;
  readonly businessDate: string;
  readonly backdateReason: string;
  readonly notes: string;
  readonly discount: string;
  readonly discountMode: string;
  readonly totalMinor: number;
  readonly lines: readonly PurchaseDraftReviewLine[];
  readonly payments: readonly PurchaseDraftReviewPayment[];
  readonly paymentAccountsVerified: false;
  readonly canEdit: false;
  readonly canPost: false;
}
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

function invalid(): never {
  throw new ApiError('protocol', 'Purchase draft review cannot be safely displayed');
}
function priceEntries(input: Record<string, number> | undefined): readonly PurchaseDraftReviewUnitValue[] {
  return Object.entries(input ?? {}).map(([unit, price]) => {
    if (!unit.trim() || !Number.isFinite(price) || price < 0) return invalid();
    return { unit, value: String(price) };
  });
}
export function projectConnectedPurchaseDraftReview(
  verified: ConnectedPurchaseResumeReadOnly,
  expectedId: string,
  expectedVersion: number,
): PurchaseDraftReviewView {
  if (!verified || verified.canEdit !== false || verified.canPost !== false ||
      verified.paymentAccountsVerified !== false || verified.serverAdvancedUnitsVerified !== false ||
      !ULID.test(expectedId) || verified.draft?.id !== expectedId ||
      !Number.isSafeInteger(expectedVersion) || expectedVersion < 1 ||
      verified.draft.version !== expectedVersion || verified.draft.deletedAt !== null ||
      verified.sources?.identity !== verified.identity ||
      verified.draft.editor.tenantId !== verified.sources.sources.tenantId ||
      verified.draft.editor.photos.length !== 0 ||
      verified.draft.editor.lines.length !== verified.lineReviews.length) return invalid();
  let totalMinor: number;
  try {
    totalMinor = parseScaledInput(String(verified.draft.editor.total), 2);
    if (totalMinor < 0) return invalid();
  } catch { return invalid(); }

  const reviews = new Map(verified.lineReviews.map(line => [line.lineId, line]));
  if (reviews.size !== verified.lineReviews.length) return invalid();
  const lines = verified.draft.editor.lines.map(line => {
    const saved = line.product;
    const review = reviews.get(line.id);
    if (!review || review.productId !== saved.id || !verified.sources.sources.productIds.has(saved.id) ||
        !verified.sources.products.has(saved.id)) return invalid();
    return {
      id: line.id,
      productId: saved.id,
      historicalName: saved.name,
      baseUnit: saved.unit,
      bigQty: line.bigQty,
      smallQty: line.smallQty,
      unitQuantities: Object.entries(line.unitQuantities ?? {}).map(([unit, value]) => ({ unit, value })),
      purchasePrices: priceEntries(saved.unitPurchasePrices),
      sellingPrices: priceEntries(saved.unitSellPrices),
      cost: line.cost,
      costUnit: line.costUnit,
      lotSellPrice: line.lotSellPrice,
      lotSellUnit: line.lotSellUnit,
      serialText: line.serialText,
      batchNumber: line.batchNumber,
      manufactureDate: line.manufactureDate,
      expiryDate: line.expiryDate,
      codes: [...review.codes],
    };
  });
  const payments = verified.draft.editor.payments.map(payment => ({
    id: payment.id,
    method: payment.method,
    account: payment.account,
    amount: payment.amount,
  }));
  return {
    id: verified.draft.id,
    version: verified.draft.version,
    referenceNo: verified.draft.editor.referenceNo,
    supplierName: verified.draft.editor.supplierName,
    businessDate: verified.draft.editor.date,
    backdateReason: verified.draft.editor.backdateReason,
    notes: verified.draft.editor.notes,
    discount: verified.draft.editor.discount,
    discountMode: verified.draft.editor.discountMode,
    totalMinor, lines, payments,
    paymentAccountsVerified: false,
    canEdit: false, canPost: false,
  };
}
