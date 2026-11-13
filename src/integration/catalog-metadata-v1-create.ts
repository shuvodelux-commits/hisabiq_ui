import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import {
  decodeCatalogMetadataV1,
  type CatalogMetadataV1Envelope,
} from './catalog-metadata-v1.ts';

/**
 * MOD-002 T02A/P5a: opt-in one-request bilingual master CREATE transport.
 *
 * The existing Products and ProductSettings screens remain preview-only.
 * Do not mount this client until the backend P4b CREATE API is accepted,
 * migration 0055 has an approved rollout, and the connected-session/tenant
 * capability gate and UI parity are separately verified.
 *
 * One POST inserts English name, nullable Bengali metadata and unit symbol
 * together in the server's Class M transaction; never emulate with legacy
 * create followed by PATCH. A network error is ambiguous: DO NOT retry
 * automatically or claim the master was not created.
 */
export type CatalogMetadataV1CreateCommand =
  | {
      kind: 'units';
      name: string;
      nameBn?: string | null;
      symbol?: string | null;
    }
  | {
      kind: 'brands';
      name: string;
      nameBn?: string | null;
    }
  | {
      kind: 'categories';
      name: string;
      nameBn?: string | null;
      parentId: string | null;
    };

type CreateKind = CatalogMetadataV1CreateCommand['kind'];

const realUlid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

function invalid(): never {
  throw new ApiError('protocol', 'Catalog metadata create request could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function has(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}
function validKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every(key => keys.includes(key));
}
function normalizeEnglish(value: unknown): string {
  if (typeof value !== 'string') return invalid();
  // The accepted backend catalogNameSchema first trims, then requires
  // 1-120 JavaScript string characters (Zod's .min/.max semantics).
  const trimmed = value.trim();
  if (trimmed.length < 1 || trimmed.length > 120) return invalid();
  return trimmed;
}
function normalizeBangla(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') return invalid();
  const normalized = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  const length = Array.from(normalized).length;
  if (length < 1 || length > 120) return invalid();
  return normalized;
}
function normalizeSymbol(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') return invalid();
  const normalized = value.normalize('NFC').trim();
  const length = Array.from(normalized).length;
  if (length < 1 || length > 4 || /\s/u.test(normalized)) return invalid();
  return normalized;
}

export function validateCatalogMetadataV1Create(input: unknown): {
  kind: CreateKind;
  body: Record<string, string | null>;
} {
  if (!record(input) ||
      (input.kind !== 'units' && input.kind !== 'brands' && input.kind !== 'categories')) {
    return invalid();
  }
  const kind = input.kind;
  const keys = kind === 'units'
    ? ['kind', 'name', 'nameBn', 'symbol']
    : kind === 'categories'
      ? ['kind', 'name', 'nameBn', 'parentId']
      : ['kind', 'name', 'nameBn'];
  if (!validKeys(input, keys)) return invalid();

  const body: Record<string, string | null> = { name: normalizeEnglish(input.name) };
  if (has(input, 'nameBn')) body.nameBn = normalizeBangla(input.nameBn);
  if (kind === 'units' && has(input, 'symbol')) body.symbol = normalizeSymbol(input.symbol);
  if (kind === 'categories') {
    if (!has(input, 'parentId') ||
        (input.parentId !== null && (
          typeof input.parentId !== 'string' || !realUlid.test(input.parentId)
        ))) return invalid();
    body.parentId = input.parentId as string | null;
  }
  return { kind, body };
}

/**
 * Explicit opt-in, authenticated and non-retrying. In an ambiguous failure,
 * the caller must re-read the versioned catalog by stable ID before trying
 * again, never automatically send the same CREATE request a second time.
 */
export async function createCatalogMetadataV1(
  accessToken: string,
  command: CatalogMetadataV1CreateCommand,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<CatalogMetadataV1Envelope> {
  const { kind, body } = validateCatalogMetadataV1Create(command);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();

  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson(
      {
        method: 'POST',
        path: `/api/v1/catalog/metadata-v1/${kind}`,
        accessToken,
        body,
        signal: controller.signal,
      },
      decodeCatalogMetadataV1,
    );
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
