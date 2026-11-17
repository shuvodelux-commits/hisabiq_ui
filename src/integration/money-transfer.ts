import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import { counterTakaToMinor } from './counter-single-account.ts';
import type { ServerMoneyAccount } from './accounts.ts';

/**
 * MOD-006 T03: unmounted source-owned TRANSFER transport.
 * The existing Finance/Counter preview is intentionally unchanged. This
 * transport neither posts on page mount nor projects balances in React.
 * Original backend: CashMovementService.record (one atomic journal).
 */
export interface VerifiedMoneyTransferDraft {
  readonly kind: 'TRANSFER';
  readonly from: ServerMoneyAccount;
  readonly to: ServerMoneyAccount;
  /** Exact decimal taka text, not a floating-point balance projection. */
  readonly amount: string;
  /** Required source document date (YYYY-MM-DD). */
  readonly businessDate: string;
  readonly operationId: string;
  readonly reference?: string | null;
  readonly note?: string | null;
}

export interface PostedMoneyTransfer {
  readonly id: string;
  readonly number: string;
  readonly kind: 'TRANSFER';
  readonly fromAccountCode: string;
  readonly fromAccountName: string;
  readonly toAccountCode: string;
  readonly toAccountName: string;
  readonly amountMinor: number;
  readonly businessDate: string;
  readonly reference: string | null;
  readonly note: string | null;
  readonly createdAt: string;
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const RESPONSE_KEYS = [
  'id', 'number', 'kind', 'fromAccountCode', 'fromAccountName',
  'toAccountCode', 'toAccountName', 'amountMinor', 'businessDate',
  'reference', 'note', 'createdAt',
];

function invalid(message = 'Money transfer cannot be verified'): never {
  throw new ApiError('protocol', message);
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function isId(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
}
function name(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function optionalText(value: unknown, max: number): value is string | null | undefined {
  return value === undefined || value === null ||
    (typeof value === 'string' && value.trim().length <= max);
}
function verifiedAccount(account: ServerMoneyAccount): string {
  if (!isRecord(account) || !isId(account.id) || !name(account.name) ||
      account.status !== 'ACTIVE' ||
      (account.type !== 'CASH' && account.type !== 'BANK' && account.type !== 'MFS')) {
    return invalid('Select an active, verified CASH, BANK or MFS account');
  }
  return account.type === 'CASH' ? 'CASH:' + account.id : 'BANK:' + account.id;
}
function postedResponse(
  raw: unknown,
  draft: VerifiedMoneyTransferDraft,
  fromCode: string,
  toCode: string,
  amountMinor: number,
  reference: string | null,
  note: string | null,
): PostedMoneyTransfer {
  if (!isRecord(raw) || Object.keys(raw).length !== 1 ||
      !Object.prototype.hasOwnProperty.call(raw, 'data') ||
      !isRecord(raw.data)) return invalid();
  const data = raw.data;
  if (Object.keys(data).length !== RESPONSE_KEYS.length ||
      !RESPONSE_KEYS.every(key => Object.prototype.hasOwnProperty.call(data,key)) ||
      !isId(data.id) || !name(data.number) || data.kind !== 'TRANSFER' ||
      data.fromAccountCode !== fromCode || data.toAccountCode !== toCode ||
      !name(data.fromAccountName) || !name(data.toAccountName) ||
      data.amountMinor !== amountMinor || data.businessDate !== draft.businessDate ||
      data.reference !== reference || data.note !== note ||
      typeof data.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(data.createdAt))) return invalid();
  return data as unknown as PostedMoneyTransfer;
}

/**
 * A caller may only invoke this after authenticating its tenant/account context.
 * A lost response is NOT a failed transfer: retain the full draft and original
 * operationId, refetch source history, and only then decide on an explicit retry.
 * The server validates permission, session ON/OFF and closed counted history.
 */
export async function recordVerifiedMoneyTransfer(
  accessToken: string,
  draft: VerifiedMoneyTransferDraft,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<PostedMoneyTransfer> {
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken) ||
      !isRecord(draft) || draft.kind !== 'TRANSFER' ||
      !isId(draft.operationId) || !isDate(draft.businessDate) ||
      !optionalText(draft.reference,64) || !optionalText(draft.note,500) ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();

  const fromCode = verifiedAccount(draft.from);
  const toCode = verifiedAccount(draft.to);
  if (draft.from.id === draft.to.id || fromCode === toCode) {
    return invalid('Transfer requires different money accounts');
  }
  const amountMinor = counterTakaToMinor(draft.amount);
  const reference = draft.reference?.trim() || null;
  const note = draft.note?.trim() || null;
  const body = {
    kind: 'TRANSFER' as const,
    fromAccountCode: fromCode,
    toAccountCode: toCode,
    amountMinor,
    businessDate: draft.businessDate,
    reference,
    note,
    operationId: draft.operationId,
  };
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort',abort,{once:true});
  const timeout = globalThis.setTimeout(abort,timeoutMs);
  try {
    return await requestJson({
      method:'POST',
      path:'/api/v1/money/movements',
      accessToken,
      operationId: draft.operationId,
      body,
      signal:controller.signal,
    },raw => postedResponse(raw,draft,fromCode,toCode,amountMinor,reference,note));
  } finally {
    globalThis.clearTimeout(timeout);
    signal?.removeEventListener('abort',abort);
  }
}
