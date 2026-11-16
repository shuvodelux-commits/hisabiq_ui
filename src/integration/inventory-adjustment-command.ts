import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-003 #618: UNMOUNTED, strict signed stock-adjustment transport only.
 *
 * The owning caller must keep one operation ID and the identical reviewed
 * payload through an unknown POST outcome. This does not mutate Products,
 * preview lots, stock balances or accounting projections and does not enable
 * "Set exact stock": that requires the distinct atomic stock-count contract.
 */
export type InventoryAdjustmentReason = 'DAMAGE' | 'RECOUNT' | 'THEFT_LOSS' | 'OTHER';

export interface InventoryAdjustmentCommand {
  productId: string;
  /** Signed integer quantity, base unit x 1,000. No client floating-point rounding. */
  qtyDelta: number;
  reason: InventoryAdjustmentReason;
  note: string | null;
  businessDate?: string;
}

export interface InventoryAdjustmentRecord {
  id: string;
  number: string;
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;
  qtyDelta: number;
  direction: 'IN' | 'OUT';
  qty: number;
  reason: InventoryAdjustmentReason;
  note: string | null;
  businessDate: string;
  qtyOnHandAfter: number;
  /** Optional server-authorized source cost; absence is not the same as zero. */
  valueMinor?: number;
}

export interface InventoryAdjustmentResponse {
  data: InventoryAdjustmentRecord;
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const reasons: ReadonlySet<string> = new Set(['DAMAGE', 'RECOUNT', 'THEFT_LOSS', 'OTHER']);
const commandKeys: ReadonlySet<string> = new Set(['productId', 'qtyDelta', 'reason', 'note', 'businessDate']);
const recordKeys: ReadonlySet<string> = new Set([
  'id', 'number', 'productId', 'productName', 'locationId', 'locationName',
  'qtyDelta', 'direction', 'qty', 'reason', 'note', 'businessDate', 'qtyOnHandAfter',
  'valueMinor',
]);

function invalid(): never {
  throw new ApiError('protocol', 'Unsupported or invalid inventory adjustment contract');
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function hasExactKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>,
  required: readonly string[]): boolean {
  return required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
    Object.keys(value).every(key => allowed.has(key));
}
function isUlid(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}
function isReason(value: unknown): value is InventoryAdjustmentReason {
  return typeof value === 'string' && reasons.has(value);
}
function isDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;
}

/** Do not silently drop batch, lot, serial, exact-count, pricing or other UI fields. */
export function validateInventoryAdjustmentCommand(raw: unknown): InventoryAdjustmentCommand {
  if (!isObject(raw) || !hasExactKeys(raw, commandKeys,
    ['productId', 'qtyDelta', 'reason', 'note'])) return invalid();
  if (!isUlid(raw.productId) || !isInteger(raw.qtyDelta) || raw.qtyDelta === 0 ||
    !isReason(raw.reason) || !(raw.note === null ||
    (typeof raw.note === 'string' && raw.note.length <= 500))) return invalid();
  if (Object.prototype.hasOwnProperty.call(raw, 'businessDate') && !isDate(raw.businessDate)) return invalid();

  const command: InventoryAdjustmentCommand = {
    productId: raw.productId, qtyDelta: raw.qtyDelta, reason: raw.reason,
    note: raw.note,
  };
  if (Object.prototype.hasOwnProperty.call(raw, 'businessDate')) command.businessDate = raw.businessDate as string;
  return Object.freeze(command);
}

/**
 * Parse only exact Nest StockAdjustmentResponse fields. A missing cost key
 * stays missing, while an authorized cost of 0 remains exactly 0.
 * Validate the returned source against the exact command we posted.
 */
export function decodeInventoryAdjustmentResponse(raw: unknown,
  command: InventoryAdjustmentCommand): InventoryAdjustmentResponse {
  if (!isObject(raw) || !hasExactKeys(raw, new Set(['data']), ['data']) ||
    !isObject(raw.data)) return invalid();
  const data = raw.data;
  if (!hasExactKeys(data, recordKeys, [
    'id', 'number', 'productId', 'productName', 'locationId', 'locationName',
    'qtyDelta', 'direction', 'qty', 'reason', 'note', 'businessDate', 'qtyOnHandAfter',
  ])) return invalid();
  if (!isUlid(data.id) || !isUlid(data.productId) || !isUlid(data.locationId) ||
    typeof data.number !== 'string' || typeof data.productName !== 'string' ||
    typeof data.locationName !== 'string' ||
    !isInteger(data.qtyDelta) || data.qtyDelta === 0 ||
    !isInteger(data.qty) || data.qty !== Math.abs(data.qtyDelta) ||
    !isInteger(data.qtyOnHandAfter) || !isReason(data.reason) ||
    !(data.note === null || typeof data.note === 'string') ||
    !isDate(data.businessDate)) return invalid();
  if (Object.prototype.hasOwnProperty.call(data, 'valueMinor') && !isInteger(data.valueMinor)) return invalid();
  if (data.direction !== (data.qtyDelta > 0 ? 'IN' : 'OUT') ||
    data.productId !== command.productId || data.qtyDelta !== command.qtyDelta ||
    data.reason !== command.reason ||
    (command.businessDate !== undefined && data.businessDate !== command.businessDate)) {
    return invalid();
  }
  const record: InventoryAdjustmentRecord = {
    id: data.id, number: data.number as string,
    productId: data.productId, productName: data.productName as string,
    locationId: data.locationId, locationName: data.locationName as string,
    qtyDelta: data.qtyDelta, direction: data.direction as 'IN' | 'OUT',
    qty: data.qty, reason: data.reason, note: data.note as string | null,
    businessDate: data.businessDate, qtyOnHandAfter: data.qtyOnHandAfter,
  };
  if (Object.prototype.hasOwnProperty.call(data, 'valueMinor')) record.valueMinor = data.valueMinor as number;
  return { data: record };
}

/**
 * No automatic retry. On abort/timeout/network uncertainty the caller retains
 * this exact reviewed intent + operationId and may explicitly retry unchanged.
 */
export async function submitInventoryAdjustment(
  accessToken: string, operationId: string, rawCommand: unknown,
  signal?: AbortSignal, timeoutMs = 15_000,
): Promise<InventoryAdjustmentResponse> {
  const command = validateInventoryAdjustmentCommand(rawCommand);
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken) ||
    !isUlid(operationId) || !Number.isSafeInteger(timeoutMs) ||
    timeoutMs < 1 || timeoutMs > 120_000 ||
    (signal !== undefined && !(signal instanceof AbortSignal))) return invalid();
  if (signal?.aborted) throw new ApiError('network', 'Inventory adjustment request cancelled');

  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  const deadline = setTimeout(abort, timeoutMs);
  try {
    if (controller.signal.aborted) {
      throw new ApiError('network', 'Inventory adjustment request cancelled');
    }
    const result = await requestJson({
      method: 'POST', path: '/api/v1/inventory/adjustments',
      accessToken, operationId, body: command, signal: controller.signal,
    }, raw => decodeInventoryAdjustmentResponse(raw, command));
    if (controller.signal.aborted) {
      throw new ApiError('network', 'Inventory adjustment request cancelled');
    }
    if (result === undefined) return invalid();
    return result;
  } finally {
    clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
