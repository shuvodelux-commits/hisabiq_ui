import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import { decodeProduct, type ServerProductEnvelope } from './products.ts';

/**
 * MOD-002 T01B/P5: strictly one legacy product thumbnail, never a gallery.
 *
 * Nest's existing POST/DELETE /api/v1/products/:id/image only reads/writes
 * a single compressed thumbnail. The current HisabIQ ProductDraft includes
 * richer photos and media state. Do not map photos[] to this transport, change
 * any preview store, or attach these functions to React without a separately
 * approved complete metadata/media contract.
 */
export interface ServerSimpleProductThumbnailInput {
  mime: 'image/png' | 'image/jpeg' | 'image/webp';
  dataBase64: string;
}

const ulidPattern = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const base64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const allowedMime = new Set(['image/png', 'image/jpeg', 'image/webp']);

function invalid(): never {
  throw new ApiError('protocol', 'Product thumbnail request or response is invalid');
}
function record(raw: unknown): raw is Record<string, unknown> {
  return raw !== null && typeof raw === 'object' && !Array.isArray(raw);
}
function validatedImage(raw: unknown): ServerSimpleProductThumbnailInput {
  if (!record(raw) || Object.keys(raw).length !== 2 ||
      !Object.prototype.hasOwnProperty.call(raw, 'mime') ||
      !Object.prototype.hasOwnProperty.call(raw, 'dataBase64') ||
      typeof raw.mime !== 'string' || !allowedMime.has(raw.mime) ||
      typeof raw.dataBase64 !== 'string' ||
      raw.dataBase64.length < 16 || raw.dataBase64.length > 192 * 1024 ||
      !base64Pattern.test(raw.dataBase64)) return invalid();

  // Verify canonical base64 and the advertised file signature before writing.
  // This is a request-shape guard, NOT a substitute for server-side content
  // validation, antivirus/media processing, or tenant permission enforcement.
  let bytes: string;
  try {
    bytes = atob(raw.dataBase64);
    if (btoa(bytes) !== raw.dataBase64) return invalid();
  } catch {
    return invalid();
  }
  const byte = (i: number) => bytes.charCodeAt(i);
  const png = bytes.length >= 16 &&
    byte(0) === 137 && bytes.slice(1, 4) === 'PNG' &&
    byte(4) === 13 && byte(5) === 10 && byte(6) === 26 && byte(7) === 10 &&
    bytes.slice(12, 16) === 'IHDR';
  const jpeg = bytes.length >= 4 &&
    byte(0) === 255 && byte(1) === 216 && byte(2) === 255;
  const webp = bytes.length >= 12 &&
    bytes.slice(0, 4) === 'RIFF' && bytes.slice(8, 12) === 'WEBP';
  if (!((raw.mime === 'image/png' && png) ||
        (raw.mime === 'image/jpeg' && jpeg) ||
        (raw.mime === 'image/webp' && webp))) return invalid();
  return raw as unknown as ServerSimpleProductThumbnailInput;
}

async function thumbnailAction(
  method: 'POST' | 'DELETE',
  accessToken: string,
  productId: string,
  body?: ServerSimpleProductThumbnailInput,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerProductEnvelope> {
  if (typeof productId !== 'string' || !ulidPattern.test(productId) ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();

  // Do not ever automatically replay either write; a lost response may mean
  // the server committed. The owner must re-read the product to reconcile.
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    const envelope = await requestJson({
      method,
      path: ('/api/v1/products/' + productId + '/image') as Parameters<typeof requestJson>[0]['path'],
      accessToken,
      ...(body === undefined ? {} : { body }),
      signal: controller.signal,
    }, decodeProduct);
    // requestJson permits 204 in general, but these two Nest endpoints promise
    // {data:ProductResponse}; 204 cannot certify the requested image operation.
    if (!envelope || envelope.data.id !== productId ||
        (method === 'POST' && !envelope.data.hasImage) ||
        (method === 'DELETE' && envelope.data.hasImage)) return invalid();
    return envelope;
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}

/** Upload/replace one already-prepared legacy compressed thumbnail. */
export async function saveSimpleProductThumbnail(
  accessToken: string,
  productId: string,
  input: ServerSimpleProductThumbnailInput,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerProductEnvelope> {
  const complete = validatedImage(input);
  return thumbnailAction('POST', accessToken, productId, complete, signal, timeoutMs);
}

/** Remove only the legacy thumbnail; this never deletes the Product. */
export async function removeSimpleProductThumbnail(
  accessToken: string,
  productId: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerProductEnvelope> {
  return thumbnailAction('DELETE', accessToken, productId, undefined, signal, timeoutMs);
}
