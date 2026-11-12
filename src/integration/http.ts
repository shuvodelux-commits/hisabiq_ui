import { ApiError } from './errors.ts';

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: `/api/v1/${string}`;
  body?: unknown;
  accessToken?: string;
  operationId?: string;
  signal?: AbortSignal;
}

const methods = new Set<ApiRequest['method']>(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
function invalidControls(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) return true;
  }
  return false;
}
const operationIdPattern = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

function protocolError(): ApiError {
  return new ApiError('protocol', 'Invalid API response or request');
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requestUrl(path: string): URL {
  if (typeof path !== 'string' || !path.startsWith('/api/v1/') || path.length <= '/api/v1/'.length ||
      path.includes('#') || path.includes('\\') || invalidControls(path)) throw protocolError();

  // Inspect the supplied pathname before URL normalizes literal or encoded dot segments.
  const suppliedPathname = path.split('?', 1)[0];
  try {
    for (const segment of suppliedPathname.split('/')) {
      const decoded = decodeURIComponent(segment);
      // A second decoding pass by a proxy must not turn a segment into a separator.
      if (decoded === '.' || decoded === '..' || /[\\/%]/.test(decoded) || invalidControls(decoded)) {
        throw protocolError();
      }
    }
  } catch {
    throw protocolError();
  }

  let url: URL;
  try {
    const origin = globalThis.window?.location.origin ?? globalThis.location?.origin;
    if (!origin) throw protocolError();
    url = new URL(path, origin);
    if (url.origin !== origin || !url.pathname.startsWith('/api/v1/') ||
        url.pathname.length <= '/api/v1/'.length || url.username || url.password) throw protocolError();
  } catch {
    throw protocolError();
  }
  return url;
}

function safeHttpError(status: number): ApiError {
  return new ApiError('http', `API request failed (HTTP ${status})`, { status });
}

function parseHttpError(raw: unknown, status: number): ApiError {
  if (!record(raw) || !record(raw.error)) return safeHttpError(status);
  const { code, message, details, traceId } = raw.error;
  if (typeof code !== 'string' || !code.trim() || typeof message !== 'string' || !message.trim() ||
      !record(details) || typeof traceId !== 'string' || !traceId.trim() ||
      Object.values(details).some(value => typeof value !== 'string')) return safeHttpError(status);
  return new ApiError('http', message, {
    status,
    code,
    details: details as Record<string, string>,
    traceId,
  });
}

export async function requestJson<T>(input: ApiRequest, decode: (raw: unknown) => T): Promise<T> {
  const url = requestUrl(input.path);
  if (!methods.has(input.method) || !record(input) || 'headers' in input) throw protocolError();
  if (input.accessToken !== undefined &&
      (typeof input.accessToken !== 'string' || !input.accessToken || /\s/.test(input.accessToken))) throw protocolError();
  if (input.operationId !== undefined &&
      (typeof input.operationId !== 'string' || !operationIdPattern.test(input.operationId))) throw protocolError();
  if (input.method === 'GET' && input.body !== undefined) throw protocolError();

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  if (input.accessToken !== undefined) headers.set('Authorization', `Bearer ${input.accessToken}`);
  if (input.operationId !== undefined) headers.set('Idempotency-Key', input.operationId);
  let body: string | undefined;
  if (input.body !== undefined) {
    try {
      body = JSON.stringify(input.body);
    } catch {
      throw protocolError();
    }
    if (body === undefined) throw protocolError();
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: input.method,
      headers,
      body,
      signal: input.signal,
      redirect: 'error',
      credentials: 'omit',
    });
  } catch {
    throw new ApiError('network', 'Network request failed');
  }

  if (response.status === 204 && response.ok) return undefined as T;
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = /^application\/(?:[\w.-]+\+)?json(?:\s*;|\s*$)/i.test(contentType);
  if (!isJson) {
    if (!response.ok) throw safeHttpError(response.status);
    throw protocolError();
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    if (!response.ok) throw safeHttpError(response.status);
    throw protocolError();
  }
  if (!response.ok) throw parseHttpError(raw, response.status);
  try {
    return decode(raw);
  } catch {
    throw protocolError();
  }
}
