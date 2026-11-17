import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import { verifySimpleCreate, type ServerSimpleProductCreateInput } from './product-create.ts';
import { decodeProduct, type ServerProductEnvelope } from './products.ts';

/**
 * MOD-002 T01B/P4: version-locked legacy SIMPLE update transport only.
 *
 * The Nest endpoint uses a FULL SaveProductRequest + version, not a sparse
 * PATCH. Never use this adapter on an existing HisabIQ ProductDraft: it would
 * discard Bengali text, additional independent unit prices, product kinds,
 * serial/warranty modes, stock-opening intent or richer offers/gallery data.
 * That requires the separately approved advanced product contract.
 */
export type ServerSimpleProductUpdateInput = ServerSimpleProductCreateInput & {
  version: number;
};

const ulidPattern = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

function invalid(): never {
  throw new ApiError('protocol', 'Simple product update is invalid or requires the advanced product contract');
}

function validatedCommand(raw: unknown): ServerSimpleProductUpdateInput {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw) ||
      Object.keys(raw).length !== 25 ||
      !Object.prototype.hasOwnProperty.call(raw, 'version')) return invalid();

  const { version, ...body } = raw as Record<string, unknown>;
  if (typeof version !== 'number' || !Number.isSafeInteger(version) || version < 1) {
    return invalid();
  }
  // The existing create validator enforces the identical 24-field strict
  // legacy SaveProductRequest without stripping or replacing any field.
  verifySimpleCreate(body);
  return raw as unknown as ServerSimpleProductUpdateInput;
}

/**
 * Submit an explicitly assembled SIMPLE update after reading its version.
 *
 * A 409 is stale-version refusal; re-read and ask the editor to reconcile.
 * Lost response after PATCH is UNKNOWN, not safely replayable: never
 * automatically retry, invent a new version, claim a preview success or
 * overwrite a real multi-unit form. This adapter does not activate any UI.
 */
export async function updateSimpleProduct(
  accessToken: string,
  productId: string,
  input: ServerSimpleProductUpdateInput,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerProductEnvelope> {
  if (typeof productId !== 'string' || !ulidPattern.test(productId) ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();

  const complete = validatedCommand(input);
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'PATCH',
      path: ('/api/v1/products/' + productId) as Parameters<typeof requestJson>[0]['path'],
      accessToken,
      body: complete,
      signal: controller.signal,
    }, decodeProduct);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
