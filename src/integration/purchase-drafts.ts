import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';

/**
 * MOD-008 DRAFT-P1 — non-posting, connected Purchase Draft transport.
 *
 * Server source: nestshererp@cc9be84a
 *   packages/core-contracts/src/purchase-drafts.ts
 *   apps/api/src/purchasing/purchase-drafts.controller.ts
 *
 * This is deliberately NOT wired to the preview editor or preview recovery
 * store. ConnectedWorkspaceGate blocks those fixture-backed business routes.
 * The caller owns its verified session/epoch, editor state, and successful-save
 * reconciliation; this module has no cache, background retry or session fallback.
 */
export interface PurchaseDraftPayload {
  label: string;
  supplierName: string | null;
  itemCount: number;
  grandTotalMinor: number; // integer poisha, never decimal taka
  /** Full JSON-safe editor state. No business effects until actual purchase POST. */
  cart: Record<string, unknown>;
}

export interface ServerPurchaseDraft extends PurchaseDraftPayload {
  id: string;
  businessDate: string;
  savedAt: string;
  createdAt: string;
  version: number;
  deletedAt: string | null;
  recoverableUntilEpochMs: number | null;
}

export interface UpdatePurchaseDraftPayload extends PurchaseDraftPayload {
  expectedVersion: number;
}

export interface DraftVersion {
  expectedVersion: number;
}

export interface PurchaseDraftEnvelope {
  data: ServerPurchaseDraft;
}

export interface PurchaseDraftListEnvelope {
  data: ServerPurchaseDraft[];
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const RECOVERY_MS = 30 * 86_400_000;
const PAYLOAD_KEYS = ['label','supplierName','itemCount','grandTotalMinor','cart'] as const;
const DRAFT_KEYS = [
  ...PAYLOAD_KEYS, 'id','businessDate','savedAt','createdAt',
  'version','deletedAt','recoverableUntilEpochMs',
] as const;
const MAX_CART_CHARS = 120_000;
const MAX_DEPTH = 40;
type Method = ApiRequest['method'];

function protocol(): never {
  throw new ApiError('protocol', 'Purchase draft request or response could not be verified');
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(value).length === expected.length &&
    expected.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function safeNonnegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function positiveVersion(value: unknown): value is number {
  return safeNonnegative(value) && value > 0;
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function date(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 &&
    day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}
function timestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value));
}

/**
 * Require every editor property to round-trip through JSON without loss.
 * JSON.stringify alone silently strips undefined, functions and Symbols.
 */
function serializableCart(input: unknown): input is Record<string, unknown> {
  if (!object(input)) return false;
  const visited = new Set<object>();
  let nodes = 0;
  function visit(value: unknown, depth: number): boolean {
    nodes += 1;
    if (nodes > 10_000 || depth > MAX_DEPTH) return false;
    if (value === null || typeof value === 'string' || typeof value === 'boolean') {
      return typeof value !== 'string' || !/^data:/i.test(value);
    }
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value !== 'object' || visited.has(value)) return false;
    if (Array.isArray(value)) {
      // A sparse array or named array property would lose information in JSON.
      if (Object.keys(value).length !== value.length) return false;
      visited.add(value);
      const ok = value.every((entry, i) => i in value && visit(entry, depth + 1));
      visited.delete(value);
      return ok;
    }
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return false;
    visited.add(value);
    const ok = Object.entries(value).every(([key, entry]) =>
      key !== '__proto__' && key !== 'prototype' && key !== 'constructor' &&
      visit(entry, depth + 1));
    visited.delete(value);
    return ok;
  }
  if (!visit(input, 0)) return false;
  try {
    return JSON.stringify(input).length <= MAX_CART_CHARS;
  } catch {
    return false;
  }
}

function payload(input: unknown, update: boolean): PurchaseDraftPayload | UpdatePurchaseDraftPayload {
  if (!object(input) || !keys(input, update ? [...PAYLOAD_KEYS, 'expectedVersion'] : PAYLOAD_KEYS) ||
    typeof input.label !== 'string' || input.label.trim().length === 0 ||
    input.label.trim().length > 80 || input.label !== input.label.trim() ||
    (input.supplierName !== null &&
      (typeof input.supplierName !== 'string' || input.supplierName.trim().length > 120 ||
      input.supplierName !== input.supplierName.trim())) ||
    !safeNonnegative(input.itemCount) || input.itemCount > 500 ||
    !safeNonnegative(input.grandTotalMinor) ||
    !serializableCart(input.cart) ||
    (update && !positiveVersion(input.expectedVersion))) return protocol();
  // Clone so an in-flight edit cannot mutate what the request sends.
  return JSON.parse(JSON.stringify(input)) as PurchaseDraftPayload | UpdatePurchaseDraftPayload;
}

function draft(value: unknown): value is ServerPurchaseDraft {
  if (!object(value) || !keys(value, DRAFT_KEYS) ||
    !validId(value.id) || !date(value.businessDate) ||
    !timestamp(value.savedAt) || !timestamp(value.createdAt) ||
    Date.parse(value.savedAt) < Date.parse(value.createdAt) ||
    !positiveVersion(value.version)) return false;

  const fields = Object.fromEntries(PAYLOAD_KEYS.map(key => [key, value[key]]));
  try { payload(fields, false); } catch { return false; }

  if (value.deletedAt === null) return value.recoverableUntilEpochMs === null;
  return timestamp(value.deletedAt) &&
    safeNonnegative(value.recoverableUntilEpochMs) &&
    value.recoverableUntilEpochMs === Date.parse(value.deletedAt) + RECOVERY_MS;
}

export function decodePurchaseDraft(raw: unknown): PurchaseDraftEnvelope {
  if (!object(raw) || !keys(raw, ['data']) || !draft(raw.data)) return protocol();
  return raw as unknown as PurchaseDraftEnvelope;
}
export function decodePurchaseDraftList(raw: unknown): PurchaseDraftListEnvelope {
  if (!object(raw) || !keys(raw, ['data']) || !Array.isArray(raw.data) ||
    raw.data.length > 100 || !raw.data.every(draft)) return protocol();
  return raw as unknown as PurchaseDraftListEnvelope;
}

function draftId(id: string): string {
  if (!validId(id)) return protocol();
  return id;
}
function versionRequest(input: DraftVersion): DraftVersion {
  if (!object(input) || !keys(input, ['expectedVersion']) ||
      !positiveVersion(input.expectedVersion)) return protocol();
  return { expectedVersion: input.expectedVersion };
}
function timeout(input: number): number {
  if (!Number.isSafeInteger(input) || input < 1 || input > 120_000) return protocol();
  return input;
}

/** Exactly one request. Network/timeout ambiguity must NOT cause an automatic retry. */
async function call<T>(
  method: Method,
  path: ApiRequest['path'],
  accessToken: string,
  decode: (raw: unknown) => T,
  body?: unknown,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<T> {
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken)) return protocol();
  timeout(timeoutMs);
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method, path, accessToken, ...(body === undefined ? {} : { body }),
      signal: controller.signal,
    }, decode);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}

const ROOT = '/api/v1/purchases/drafts';

export function readPurchaseDrafts(
  accessToken: string,
  state: 'active' | 'deleted' = 'active',
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<PurchaseDraftListEnvelope> {
  if (state !== 'active' && state !== 'deleted') return Promise.reject(
    new ApiError('protocol', 'Invalid purchase draft state'));
  const path = state === 'active' ? ROOT : ROOT + '?state=deleted';
  return call('GET', path as ApiRequest['path'], accessToken, decodePurchaseDraftList,
    undefined, signal, timeoutMs);
}

export function readPurchaseDraft(
  accessToken: string,
  id: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<PurchaseDraftEnvelope> {
  return call('GET', (ROOT + '/' + draftId(id)) as ApiRequest['path'],
    accessToken, decodePurchaseDraft, undefined, signal, timeoutMs);
}

/** A failed POST is ambiguous: do not blindly retry or create a replacement. */
export function createPurchaseDraft(
  accessToken: string,
  input: PurchaseDraftPayload,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<PurchaseDraftEnvelope> {
  return call('POST', ROOT, accessToken, decodePurchaseDraft,
    payload(input, false), signal, timeoutMs);
}

export function updatePurchaseDraft(
  accessToken: string,
  id: string,
  input: UpdatePurchaseDraftPayload,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<PurchaseDraftEnvelope> {
  return call('PUT', (ROOT + '/' + draftId(id)) as ApiRequest['path'],
    accessToken, decodePurchaseDraft, payload(input, true), signal, timeoutMs);
}

export function recyclePurchaseDraft(
  accessToken: string,
  id: string,
  version: DraftVersion,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<PurchaseDraftEnvelope> {
  return call('DELETE', (ROOT + '/' + draftId(id)) as ApiRequest['path'],
    accessToken, decodePurchaseDraft, versionRequest(version), signal, timeoutMs);
}

export function restorePurchaseDraft(
  accessToken: string,
  id: string,
  version: DraftVersion,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<PurchaseDraftEnvelope> {
  return call('POST', (ROOT + '/' + draftId(id) + '/restore') as ApiRequest['path'],
    accessToken, decodePurchaseDraft, versionRequest(version), signal, timeoutMs);
}
