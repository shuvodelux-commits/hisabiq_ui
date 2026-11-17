/**
 * MOD-001 T04-W/P3 — authenticated, tenant-isolated invoice logo mutations.
 * Backend source: invoice-logo POST/DELETE + saveInvoiceLogoRequestSchema.
 * This is ONLY the transport. File resize/crop/preview and binary read are
 * separate UI tasks; no preview/financial content is sourced here.
 */
import { requestJson } from './http.ts';
import { ApiError } from './errors.ts';
import {
  decodeInvoiceSettings,
  type ServerInvoiceSettingsEnvelope,
} from './invoice-settings.ts';

export type InvoiceLogoMime = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
const maximumBase64Length = 2 * 1024 * 1024;
const maximumDecodedBytes = 1_572_864;
const mimeTypes = new Set<InvoiceLogoMime>([
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
]);
const canonicalBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function invalid(): never {
  throw new ApiError('protocol', 'Invalid invoice logo input or response');
}
function validBearer(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !/\s/.test(value);
}
function signedImageMatches(mime: InvoiceLogoMime, bytes: string): boolean {
  const b = (index: number) => bytes.charCodeAt(index);
  if (mime === 'image/png') {
    return bytes.length >= 8 &&
      [137,80,78,71,13,10,26,10].every((v,i)=>b(i)===v);
  }
  if (mime === 'image/jpeg') {
    return bytes.length >= 3 && b(0)===255 && b(1)===216 && b(2)===255;
  }
  if (mime === 'image/gif') {
    return bytes.startsWith('GIF87a') || bytes.startsWith('GIF89a');
  }
  return bytes.length >= 12 &&
    bytes.slice(0,4)==='RIFF' && bytes.slice(8,12)==='WEBP';
}
function validLogoPayload(mime: unknown, dataBase64: unknown): mime is InvoiceLogoMime {
  if (!mimeTypes.has(mime as InvoiceLogoMime) ||
      typeof dataBase64 !== 'string' ||
      dataBase64.length < 16 ||
      dataBase64.length > maximumBase64Length ||
      dataBase64.length % 4 !== 0 ||
      !canonicalBase64.test(dataBase64)) return false;
  try {
    const bytes = atob(dataBase64);
    return bytes.length <= maximumDecodedBytes &&
      btoa(bytes) === dataBase64 &&
      signedImageMatches(mime as InvoiceLogoMime, bytes);
  } catch {
    return false;
  }
}
function validateControls(accessToken: unknown, timeoutMs: unknown, signal?: AbortSignal) {
  if (!validBearer(accessToken) ||
      typeof timeoutMs !== 'number' ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) invalid();
  if (signal?.aborted) throw new ApiError('network', 'Operation canceled');
}
function confirmLogoState(expected: boolean) {
  return (raw: unknown): ServerInvoiceSettingsEnvelope => {
    const decoded = decodeInvoiceSettings(raw);
    if (decoded.data.hasLogo !== expected) return invalid();
    return decoded;
  };
}
async function logoMutation(
  accessToken: string,
  method: 'POST' | 'DELETE',
  body: { mime: InvoiceLogoMime; dataBase64: string } | undefined,
  expectedLogo: boolean,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerInvoiceSettingsEnvelope> {
  validateControls(accessToken,timeoutMs,signal);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort',abort,{once:true});
  const deadline = globalThis.setTimeout(abort,timeoutMs);
  try {
    return await requestJson({
      method,
      path:'/api/v1/sales/invoice-logo',
      accessToken,
      ...(body === undefined ? {} : {body}),
      signal:controller.signal,
    },confirmLogoState(expectedLogo));
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort',abort);
  }
}

/**
 * Upload pre-resized image bytes; never send data URIs or an unchecked
 * browser File. No background retry after unknown POST outcome.
 */
export async function uploadServerInvoiceLogo(
  accessToken: string,
  mime: InvoiceLogoMime,
  dataBase64: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerInvoiceSettingsEnvelope> {
  if (!validLogoPayload(mime,dataBase64)) return invalid();
  return logoMutation(accessToken,'POST',{mime,dataBase64},true,signal,timeoutMs);
}

/** Remove only this tenant's stored invoice logo, under backend permission. */
export async function removeServerInvoiceLogo(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerInvoiceSettingsEnvelope> {
  return logoMutation(accessToken,'DELETE',undefined,false,signal,timeoutMs);
}


/** A private, read-only logo value. No object URL or tenant-wide browser cache. */
export interface ServerInvoiceLogo {
  readonly mime: InvoiceLogoMime;
  readonly bytes: Uint8Array;
}

/**
 * Read the NestSherERP raw binary logo under the caller's verified Bearer.
 * The source controller streams bytes rather than JSON. Never use requestJson
 * here, nor place a private /invoice-logo endpoint directly in an img src.
 */
export async function readServerInvoiceLogo(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerInvoiceLogo> {
  validateControls(accessToken, timeoutMs, signal);
  let url: URL;
  try {
    const origin = globalThis.window?.location.origin ?? globalThis.location?.origin;
    if (typeof origin !== 'string' || !origin) return invalid();
    const source = new URL(origin);
    if ((source.protocol !== 'https:' && source.protocol !== 'http:') ||
        source.origin !== origin || source.username || source.password ||
        source.pathname !== '/' || source.search || source.hash) return invalid();
    url = new URL('/api/v1/sales/invoice-logo', origin);
    if (url.origin !== origin || url.pathname !== '/api/v1/sales/invoice-logo') return invalid();
  } catch {
    return invalid();
  }

  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + accessToken,
          Accept: 'image/png, image/jpeg, image/webp, image/gif',
        },
        signal: controller.signal,
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
      });
    } catch {
      throw new ApiError('network', 'Invoice logo request failed');
    }
    if (!response.ok) {
      throw new ApiError('http', 'Invoice logo request failed (HTTP ' + response.status + ')', {
        status: response.status,
      });
    }
    if (response.status !== 200 || response.redirected) return invalid();

    const mime = response.headers.get('Content-Type');
    if (!mime || !mimeTypes.has(mime as InvoiceLogoMime)) return invalid();

    const length = response.headers.get('Content-Length');
    let declaredLength: number | null = null;
    if (length !== null) {
      // Reject invalid/zero/oversized declarations before allocating bytes.
      if (!/^[1-9][0-9]*$/.test(length)) return invalid();
      declaredLength = Number(length);
      if (!Number.isSafeInteger(declaredLength) || declaredLength > maximumDecodedBytes) return invalid();
    }
    if (!response.body) return invalid();

    const reader = response.body.getReader();
    const parts: Uint8Array[] = [];
    let count = 0;
    let exhausted = false;
    try {
      for (;;) {
        const piece = await reader.read();
        if (piece.done) {
          exhausted = true;
          break;
        }
        if (!(piece.value instanceof Uint8Array)) return invalid();
        count += piece.value.byteLength;
        if (count > maximumDecodedBytes) return invalid();
        // Copy chunks; underlying reader buffers may be reused by producers.
        parts.push(new Uint8Array(piece.value));
      }
    } catch (error: unknown) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('network', 'Invoice logo download interrupted');
    } finally {
      if (!exhausted) {
        try { await reader.cancel(); } catch { /* already aborted */ }
      }
      reader.releaseLock();
    }
    if (count === 0 || (declaredLength !== null && declaredLength !== count)) return invalid();
    const bytes = new Uint8Array(count);
    let cursor = 0;
    for (const part of parts) {
      bytes.set(part, cursor);
      cursor += part.byteLength;
    }
    // Signatures are source-supported MIME sanity checks, not full decoding.
    const prefix = String.fromCharCode(...bytes.subarray(0, 16));
    if (!signedImageMatches(mime as InvoiceLogoMime, prefix)) return invalid();
    return { mime: mime as InvoiceLogoMime, bytes };
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
