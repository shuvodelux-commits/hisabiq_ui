import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ServerMoneyAccount } from './accounts.ts';

/**
 * MOD-006 T02: source-specific Counter settlement transport, deliberately UNMOUNTED.
 * The React Counter/Finance preview, connected route gate and balance model are
 * unchanged. No fallback, no optimistic balance, and no automatic POST retry.
 *
 * Nest source: ReceiveCustomerPaymentService / PaySupplierService.
 * Each is a single-account, source-owned journal transaction. Never simulate
 * split tender by sending multiple separate settlements.
 */
export type CounterTenderMethod = 'Cash' | 'Bank' | 'Mobile Banking';
export type CounterSettlementKind = 'CUSTOMER_RECEIPT' | 'SUPPLIER_PAYMENT';

export interface CounterSingleTender {
  readonly method: CounterTenderMethod;
  readonly account: ServerMoneyAccount;
  /** Exact decimal taka text from the reviewed UI field, never a float. */
  readonly amount: string;
}

export interface CounterSingleSettlementDraft {
  readonly kind: CounterSettlementKind;
  /** Verified Nest trading Party ID, never a local preview Party ID. */
  readonly partyId: string;
  readonly sources: readonly CounterSingleTender[];
  /** Generated once by the caller and retained across lost-response retry. */
  readonly operationId: string;
  readonly businessDate?: string;
  readonly note?: string | null;
  /** Unsupported until a source-owned invoice-allocation contract is accepted. */
  readonly invoiceId?: string | null;
  /** Unsupported until settlement discount source/allocation is accepted. */
  readonly discount?: string;
  readonly discountReason?: string;
}

export interface SettlementAllocation {
  readonly sourceId: string;
  readonly sourceNumber: string;
  readonly amountMinor: number;
}

export interface CounterCustomerReceipt {
  readonly id: string;
  readonly number: string;
  readonly customerPartyId: string;
  readonly customerName: string;
  readonly accountCode: string;
  readonly accountName: string;
  readonly amountMinor: number;
  readonly settledMinor: number;
  readonly advanceMinor: number;
  readonly businessDate: string;
  readonly note: string | null;
  readonly allocations: readonly SettlementAllocation[];
  readonly status: 'POSTED' | 'VOIDED';
  readonly entryMode: string;
  readonly voidReason: string | null;
  readonly version: number;
}

export interface CounterSupplierPayment {
  readonly id: string;
  readonly number: string;
  readonly supplierPartyId: string;
  readonly supplierName: string;
  readonly accountCode: string;
  readonly accountName: string;
  readonly amountMinor: number;
  readonly businessDate: string;
  readonly note: string | null;
  readonly allocations: readonly SettlementAllocation[];
  readonly outstandingAfterMinor: number;
  readonly createdAt: string;
  readonly status: 'POSTED' | 'VOIDED';
  readonly entryMode: string;
  readonly voidReason: string | null;
  readonly version: number;
}

export type CounterSettlementResult =
  | { readonly kind: 'CUSTOMER_RECEIPT'; readonly data: CounterCustomerReceipt }
  | { readonly kind: 'SUPPLIER_PAYMENT'; readonly data: CounterSupplierPayment };

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const MONEY = /^\d+(?:\.\d{1,2})?$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function invalid(message = 'Counter payment is not supported or could not be verified'): never {
  throw new ApiError('protocol', message);
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function id(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function minor(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function positive(value: unknown): value is number {
  return minor(value) && value > 0;
}
function date(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function nullableText(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

/** Convert exact taka text to integer poisha without multiplying floats. */
export function counterTakaToMinor(value: string): number {
  if (typeof value !== 'string' || value.length > 19 || !MONEY.test(value)) return invalid();
  const [taka, poisha = ''] = value.split('.');
  const total = BigInt(taka!) * 100n + BigInt(poisha.padEnd(2, '0') || '0');
  if (total <= 0n || total > BigInt(Number.MAX_SAFE_INTEGER)) return invalid();
  return Number(total);
}

function accountCode(source: CounterSingleTender): string {
  if (!record(source) || !record(source.account) ||
      !id(source.account.id) || source.account.status !== 'ACTIVE' ||
      (source.account.type !== 'CASH' && source.account.type !== 'BANK' &&
       source.account.type !== 'MFS')) return invalid('Choose a verified active money account');
  if (source.method === 'Cash' && source.account.type === 'CASH')
    return 'CASH:' + source.account.id;
  if ((source.method === 'Bank' && source.account.type === 'BANK') ||
      (source.method === 'Mobile Banking' && source.account.type === 'MFS'))
    return 'BANK:' + source.account.id; // Nest MFS uses BANK journal codes.
  return invalid('Payment method does not match its active account');
}
function allocations(value: unknown, kind: CounterSettlementKind): value is Record<string, unknown>[] {
  if (!Array.isArray(value)) return false;
  const idKey = kind === 'CUSTOMER_RECEIPT' ? 'saleId' : 'purchaseId';
  const numberKey = kind === 'CUSTOMER_RECEIPT' ? 'saleNumber' : 'purchaseNumber';
  return value.every(item => record(item) &&
    exact(item, [idKey, numberKey, 'amountMinor']) &&
    id(item[idKey]) && typeof item[numberKey] === 'string' &&
    positive(item.amountMinor));
}
function response(raw: unknown, kind: CounterSettlementKind, partyId: string,
                  code: string, amount: number, businessDate?: string):
  CounterCustomerReceipt | CounterSupplierPayment {
  if (!record(raw) || !exact(raw, ['data']) || !record(raw.data)) return invalid();
  const data = raw.data;
  const common = ['id','number','accountCode','accountName','amountMinor','businessDate',
    'note','allocations','status','entryMode','voidReason','version'] as const;
  const expected = kind === 'CUSTOMER_RECEIPT'
    ? [...common,'customerPartyId','customerName','settledMinor','advanceMinor']
    : [...common,'supplierPartyId','supplierName','outstandingAfterMinor','createdAt'];
  const partyKey = kind === 'CUSTOMER_RECEIPT' ? 'customerPartyId' : 'supplierPartyId';
  const nameKey = kind === 'CUSTOMER_RECEIPT' ? 'customerName' : 'supplierName';
  if (!exact(data, expected) || !id(data.id) ||
      typeof data.number !== 'string' || !data.number ||
      data[partyKey] !== partyId || typeof data[nameKey] !== 'string' ||
      data.accountCode !== code || typeof data.accountName !== 'string' ||
      data.amountMinor !== amount || !date(data.businessDate) ||
      (businessDate !== undefined && data.businessDate !== businessDate) ||
      !nullableText(data.note) || !allocations(data.allocations,kind) ||
      data.status !== 'POSTED' || typeof data.entryMode !== 'string' ||
      !nullableText(data.voidReason) || !positive(data.version)) return invalid();
  if (kind === 'CUSTOMER_RECEIPT') {
    if (!minor(data.settledMinor) || !minor(data.advanceMinor) ||
        data.settledMinor + data.advanceMinor !== amount ||
        data.allocations.reduce((total, row) =>
          total + Number(row.amountMinor), 0) !== data.settledMinor) return invalid();
  } else if (!minor(data.outstandingAfterMinor) || typeof data.createdAt !== 'string')
    return invalid();
  return data as unknown as CounterCustomerReceipt | CounterSupplierPayment;
}

/**
 * No UI activation: calling this from preview would be a bug. The caller must
 * own the verified connected auth context and retain the exact draft/key on
 * any network/abort/5xx/unknown-commit error, then reconcile before retry.
 */
export async function recordSingleAccountCounterSettlement(
  accessToken: string,
  draft: CounterSingleSettlementDraft,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<CounterSettlementResult> {
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken) ||
      !record(draft) || !id(draft.partyId) || !id(draft.operationId) ||
      (draft.kind !== 'CUSTOMER_RECEIPT' && draft.kind !== 'SUPPLIER_PAYMENT') ||
      !Array.isArray(draft.sources) || draft.sources.length !== 1 ||
      (draft.invoiceId !== undefined && draft.invoiceId !== null) ||
      (draft.discount !== undefined && draft.discount !== '' &&
       !/^0+(?:\.0{1,2})?$/.test(draft.discount)) ||
      (draft.discountReason !== undefined && draft.discountReason.trim() !== '') ||
      (draft.businessDate !== undefined && !date(draft.businessDate)) ||
      (draft.note !== undefined && draft.note !== null && typeof draft.note !== 'string') ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const source = draft.sources[0]!;
  const code = accountCode(source);
  const amountMinor = counterTakaToMinor(source.amount);
  const note = draft.note?.trim() || null;
  const maxNote = draft.kind === 'CUSTOMER_RECEIPT' ? 300 : 500;
  if (note !== null && note.length > maxNote) return invalid();
  const isCustomer = draft.kind === 'CUSTOMER_RECEIPT';
  const body = isCustomer
    ? { customerPartyId: draft.partyId, accountCode: code,
        amountMinor, saleIds: [] as string[], note,
        ...(draft.businessDate === undefined ? {} : { businessDate: draft.businessDate }) }
    : { supplierPartyId: draft.partyId, amountMinor, accountCode: code,
        purchaseId: null, note,
        ...(draft.businessDate === undefined ? {} : { businessDate: draft.businessDate }) };
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const timeout = globalThis.setTimeout(abort, timeoutMs);
  try {
    const data = await requestJson({
      method: 'POST',
      path: isCustomer ? '/api/v1/customer-payments' : '/api/v1/suppliers/payments',
      body,
      accessToken,
      operationId: draft.operationId,
      signal: controller.signal,
    }, raw => response(raw,draft.kind,draft.partyId,code,amountMinor,draft.businessDate));
    return isCustomer
      ? { kind: 'CUSTOMER_RECEIPT', data: data as CounterCustomerReceipt }
      : { kind: 'SUPPLIER_PAYMENT', data: data as CounterSupplierPayment };
  } finally {
    globalThis.clearTimeout(timeout);
    signal?.removeEventListener('abort',abort);
  }
}
