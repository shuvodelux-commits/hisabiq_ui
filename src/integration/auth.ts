import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

export interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; username: string };
  };
}

export interface MyAccessResponse {
  data: {
    tenantId: string;
    timezone: string;
    user: { id: string; username: string; displayName: string; roleName: string };
    businessName: string;
    permissions: string[];
    features: string[];
  };
}

const ulidPattern = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonblank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function ulid(value: unknown): value is string {
  return typeof value === 'string' && ulidPattern.test(value);
}

function invalidResponse(): never {
  throw new ApiError('protocol', 'Invalid API response');
}

function decodeLogin(raw: unknown): LoginResponse {
  if (!record(raw) || !record(raw.data)) return invalidResponse();
  const data = raw.data;
  if (!nonblank(data.accessToken) || !nonblank(data.refreshToken) || !record(data.user) ||
      !ulid(data.user.id) || !nonblank(data.user.username)) return invalidResponse();
  return raw as unknown as LoginResponse;
}

function validTimezone(value: unknown): value is string {
  if (!nonblank(value)) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function stringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(nonblank);
}

function decodeMyAccess(raw: unknown): MyAccessResponse {
  if (!record(raw) || !record(raw.data)) return invalidResponse();
  const data = raw.data;
  if (!ulid(data.tenantId) || !validTimezone(data.timezone) || !record(data.user) ||
      !ulid(data.user.id) || !nonblank(data.user.username) || !nonblank(data.user.displayName) ||
      !nonblank(data.user.roleName) || !nonblank(data.businessName) ||
      !stringList(data.permissions) || !stringList(data.features)) return invalidResponse();
  return raw as unknown as MyAccessResponse;
}

export function loginPassword(identifier: string, password: string, signal?: AbortSignal): Promise<LoginResponse> {
  return requestJson({ method: 'POST', path: '/api/v1/auth/login', body: { identifier, password }, signal }, decodeLogin);
}

export function loginPin(refreshToken: string, pin: string, signal?: AbortSignal): Promise<LoginResponse> {
  return requestJson({ method: 'POST', path: '/api/v1/auth/login/pin', body: { refreshToken, pin }, signal }, decodeLogin);
}

export function refreshSession(refreshToken: string, signal?: AbortSignal): Promise<LoginResponse> {
  return requestJson({ method: 'POST', path: '/api/v1/auth/refresh', body: { refreshToken }, signal }, decodeLogin);
}

export function logoutSession(refreshToken: string, signal?: AbortSignal): Promise<void> {
  return requestJson({ method: 'POST', path: '/api/v1/auth/logout', body: { refreshToken }, signal }, () => invalidResponse());
}

export function readMyAccess(accessToken: string, signal?: AbortSignal): Promise<MyAccessResponse> {
  return requestJson({ method: 'GET', path: '/api/v1/me', accessToken, signal }, decodeMyAccess);
}
