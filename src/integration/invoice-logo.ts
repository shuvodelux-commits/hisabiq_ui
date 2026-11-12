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
