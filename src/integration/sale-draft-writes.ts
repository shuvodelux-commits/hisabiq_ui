import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';
import { decodeSaleDrafts } from './saleMapping.ts';
import type { ServerSaleDraft } from './saleMapping.ts';

/**
 * MOD-007 M7-03 — tenant-authenticated, non-posting Sales Draft write protocol.
 *
 * Never import a preview POS cart or synthesize a stock/payment/invoice effect.
 * The owning connected editor supplies its verified session, source snapshot
 * and stable create operation ID. This adapter sends exactly one HTTP request.
 *
 * Backend contract: nestshererp PR #221 @ 7aa04ede86bb9e4b223b4e84b24cf1c5de78295d
 * (durable keyed create); backend PR #162 (same-ID versioned detail/update).
 * No connected-mode route is activated by these functions.
 */
export interface SaleDraftPayload {
  label: string;
  customerName: string | null;
  itemCount: number;
  grandTotalMinor: number;
  cart: Record<string, unknown>;
}

export interface UpdateSaleDraftPayload extends SaleDraftPayload {
  expectedVersion: number;
}

export type SavedSaleDraftEnvelope = { data: ServerSaleDraft };

export interface ServerSaleDraftDetail extends ServerSaleDraft {
  version: number;
  updatedAt: string;
}
export type SaleDraftDetailEnvelope = { data: ServerSaleDraftDetail };

const ROOT = '/api/v1/sales/drafts' as const;
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const SOURCE_FIELDS = [
  'label', 'customerName', 'itemCount', 'grandTotalMinor', 'cart',
] as const;
const DETAIL_FIELDS = [
  'id', 'label', 'customerName', 'itemCount', 'grandTotalMinor',
  'businessDate', 'savedAt', 'cart', 'version', 'updatedAt',
] as const;
const MAX_CART_JSON_LENGTH = 120_000;
const MAX_CART_DEPTH = 40;
const MAX_CART_NODES = 20_000;

function protocol(): never {
  throw new ApiError('protocol', 'Sales Draft request or response could not be verified');
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null);
}
function exact(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length &&
    Object.getOwnPropertySymbols(value).length === 0 &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function nonnegativeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function version(value: unknown): value is number {
  return nonnegativeInt(value) && value > 0 && value <= 2_147_483_646;
}
function exactTimestamp(value: unknown): value is string {
  return typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

/**
 * Check the JSON tree without invoking a getter or silently dropping values.
 * JSON.stringify alone removes undefined/functions and replaces sparse array
 * slots, which could destroy an unfinished POS cart without warning.
 */
function cloneCart(value: unknown): Record<string, unknown> {
  if (!object(value)) return protocol();

  const seen = new WeakSet<object>();
  let nodes = 0;
  function walk(node: unknown, depth: number): boolean {
    nodes++;
    if (nodes > MAX_CART_NODES || depth > MAX_CART_DEPTH) return false;
    if (node === null || typeof node === 'boolean') return true;
    if (typeof node === 'string') return !/^data:/i.test(node);
    if (typeof node === 'number') return Number.isFinite(node);
    if (typeof node !== 'object' || seen.has(node)) return false;
    const proto = Object.getPrototypeOf(node);
    if (!Array.isArray(node) && proto !== Object.prototype && proto !== null) return false;
    if (Object.getOwnPropertySymbols(node).length !== 0) return false;
    seen.add(node);

    if (Array.isArray(node)) {
      // A hole, named property or accessor would not round-trip through JSON.
      if (Object.keys(node).length !== node.length) return false;
      for (let index = 0; index < node.length; index++) {
        const property = Object.getOwnPropertyDescriptor(node, String(index));
        if (!property || !('value' in property) || !walk(property.value, depth + 1)) {
          return false;
        }
      }
      return true;
    }

    for (const key of Object.keys(node)) {
      if (key === '__proto__' || key === 'prototype' || key === 'constructor') return false;
      const property = Object.getOwnPropertyDescriptor(node, key);
      if (!property || !('value' in property) || !walk(property.value, depth + 1)) {
        return false;
      }
    }
    return true;
  }
  if (!walk(value, 0)) return protocol();
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > MAX_CART_JSON_LENGTH) return protocol();
    return JSON.parse(serialized) as Record<string, unknown>;
  } catch {
    return protocol();
  }
}

export function normalizeSaleDraftPayload(input: unknown): SaleDraftPayload {
  if (!object(input) || !exact(input, SOURCE_FIELDS)) return protocol();
  const { label, customerName, itemCount, grandTotalMinor } = input;
  if (typeof label !== 'string' || !label.trim() || label.length > 80 ||
    label !== label.trim() ||
    (customerName !== null &&
      (typeof customerName !== 'string' || customerName.length > 120 ||
        customerName !== customerName.trim())) ||
    !nonnegativeInt(itemCount) || itemCount > 500 ||
    !nonnegativeInt(grandTotalMinor)) return protocol();

  return {
    label,
    customerName: customerName as string | null,
    itemCount,
    grandTotalMinor,
    cart: cloneCart(input.cart),
  };
}

function normalizeUpdate(input: unknown): UpdateSaleDraftPayload {
  if (!object(input) ||
    !exact(input, [...SOURCE_FIELDS, 'expectedVersion']) ||
    !version(input.expectedVersion)) return protocol();
  const fields = Object.fromEntries(SOURCE_FIELDS.map(key => [key, input[key]]));
  return { ...normalizeSaleDraftPayload(fields), expectedVersion: input.expectedVersion };
}

/** 201 POST has the original eight-key detail, no invented version. */
export function decodeSavedSaleDraft(raw: unknown): SavedSaleDraftEnvelope {
  if (!object(raw) || !exact(raw, ['data'])) return protocol();
  const result = decodeSaleDrafts({ data: [raw.data] });
  const draft = result.data[0];
  if (!draft) return protocol();
  return { data: draft };
}

/** GET /:id and PUT /:id are separate strict ten-key versioned details. */
export function decodeSaleDraftDetail(raw: unknown): SaleDraftDetailEnvelope {
  if (!object(raw) || !exact(raw, ['data']) ||
    !object(raw.data) || !exact(raw.data, DETAIL_FIELDS) ||
    !version(raw.data.version) || !exactTimestamp(raw.data.updatedAt)) return protocol();

  const eight = Object.fromEntries(DETAIL_FIELDS.slice(0, 8).map(key => [key, raw.data[key]]));
  const validated = decodeSaleDrafts({ data: [eight] }).data[0];
  if (!validated) return protocol();
  return { data: {
    ...validated,
    version: raw.data.version as number,
    updatedAt: raw.data.updatedAt as string,
  } };
}

function token(value: unknown): string {
  if (typeof value !== 'string' || !value || /\s/.test(value)) return protocol();
  return value;
}
function timeout(value: number): number {
  if (!Number.isSafeInteger(value) || value < 1 || value > 120_000) return protocol();
  return value;
}

/** One request, with caller-controlled cancellation and no retry or cache. */
async function call<T>(
  method: ApiRequest['method'],
  path: ApiRequest['path'],
  accessToken: string,
  decode: (raw: unknown) => T,
  options: { body?: unknown; operationId?: string; signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<T> {
  token(accessToken);
  const duration = timeout(options.timeoutMs ?? 12_000);
  if (options.signal?.aborted) {
    throw new ApiError('network', 'Network request failed');
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, duration);
  try {
    return await requestJson({
      method,
      path,
      accessToken,
      ...(options.body === undefined ? {} : { body: options.body }),
      ...(options.operationId === undefined ? {} : { operationId: options.operationId }),
      signal: controller.signal,
    }, decode);
  } finally {
    globalThis.clearTimeout(deadline);
    options.signal?.removeEventListener('abort', abort);
  }
}

/**
 * Keyed creation. The caller must reuse the SAME operationId + frozen request
 * after a lost response; never auto-retry or issue a new id inside this module.
 */
export async function saveSaleDraft(
  accessToken: string,
  input: SaleDraftPayload,
  operationId: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<SavedSaleDraftEnvelope> {
  if (!validId(operationId)) return protocol();
  const body = normalizeSaleDraftPayload(input);
  return call('POST', ROOT, accessToken, decodeSavedSaleDraft,
    { body, operationId, signal, timeoutMs });
}

export async function readSaleDraft(
  accessToken: string,
  id: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<SaleDraftDetailEnvelope> {
  if (!validId(id)) return protocol();
  return call('GET', (ROOT + '/' + id) as ApiRequest['path'], accessToken,
    raw => {
      const envelope = decodeSaleDraftDetail(raw);
      if (envelope.data.id !== id) return protocol();
      return envelope;
    }, { signal, timeoutMs });
}

export async function updateSaleDraft(
  accessToken: string,
  id: string,
  input: UpdateSaleDraftPayload,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<SaleDraftDetailEnvelope> {
  if (!validId(id)) return protocol();
  const body = normalizeUpdate(input);
  return call('PUT', (ROOT + '/' + id) as ApiRequest['path'], accessToken,
    raw => {
      const envelope = decodeSaleDraftDetail(raw);
      if (envelope.data.id !== id ||
        envelope.data.version !== body.expectedVersion + 1) return protocol();
      return envelope;
    }, { body, signal, timeoutMs });
}
