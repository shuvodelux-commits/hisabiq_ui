import * as defaultApi from './auth.ts';
import type { LoginResponse, MyAccessResponse } from './auth.ts';
import { ApiError } from './errors.ts';

export const SESSION_STORAGE_KEY = 'hisabiq.live.session.v1';
export const SESSION_IDLE_MS = 30 * 60 * 1000;
const LOGOUT_TIMEOUT_MS = 5_000;
const sixDigitPin = /^[0-9]{6}$/;
const credentialPattern = /^[A-Za-z0-9._-]+$/;

export interface AuthApi {
  loginPassword(identifier: string, password: string, signal?: AbortSignal): Promise<LoginResponse>;
  loginPin(refreshToken: string, pin: string, signal?: AbortSignal): Promise<LoginResponse>;
  refreshSession(refreshToken: string, signal?: AbortSignal): Promise<LoginResponse>;
  logoutSession(refreshToken: string, signal?: AbortSignal): Promise<void>;
  readMyAccess(accessToken: string, signal?: AbortSignal): Promise<MyAccessResponse>;
}

export interface CredentialStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SessionClock {
  now(): number;
  setTimeout(callback: () => void, milliseconds: number): number;
  clearTimeout(handle: number): void;
}

export type SessionPersistence = 'tab' | 'memory';
type SessionIdentity = {
  tenantId: string;
  userId: string;
  timezone: string;
  username: string;
  displayName: string;
  roleName: string;
  businessName: string;
};
type AuthenticatedSession = SessionIdentity & {
  status: 'authenticated';
  epoch: number;
  accessToken: string;
  permissions: string[];
  features: string[];
  persistence: SessionPersistence;
};
// After a network failure during reload, identity has not been verified yet.
// A locked offline state is valid but must reveal no fabricated user or tenant.
type LockedSession = Partial<SessionIdentity> & {
  status: 'locked';
  epoch: number;
  reason: 'inactivity' | 'offline';
  persistence: SessionPersistence;
};
export type SessionSnapshot =
  | { status: 'preview'; epoch: number }
  | { status: 'signed-out'; epoch: number }
  | { status: 'authenticating'; epoch: number }
  | AuthenticatedSession
  | LockedSession;

export interface SessionStoreOptions {
  mode?: 'preview' | 'connected';
  api?: AuthApi;
  storage?: CredentialStorage | null;
  clock?: SessionClock;
  inactivityMs?: number;
}

const browserClock: SessionClock = {
  now: () => Date.now(),
  setTimeout: (callback, milliseconds) =>
    globalThis.setTimeout(callback, milliseconds) as unknown as number,
  clearTimeout: handle => globalThis.clearTimeout(handle),
};

function protocolError(): ApiError {
  return new ApiError('protocol', 'Session identity could not be verified');
}
function isCredential(value: unknown): value is string {
  return typeof value === 'string' && credentialPattern.test(value);
}
function parseStored(raw: string | null): string | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    const object = value as Record<string, unknown>;
    if (Object.keys(object).length !== 2 || object.schema !== 1 ||
        !isCredential(object.refreshToken)) return null;
    return object.refreshToken;
  } catch {
    return null;
  }
}
function identity(access: MyAccessResponse): SessionIdentity {
  const data = access.data;
  return {
    tenantId: data.tenantId,
    userId: data.user.id,
    timezone: data.timezone,
    username: data.user.username,
    displayName: data.user.displayName,
    roleName: data.user.roleName,
    businessName: data.businessName,
  };
}

export class SessionStore {
  private readonly mode: 'preview' | 'connected';
  private readonly api: AuthApi;
  private readonly storage: CredentialStorage | null;
  private readonly clock: SessionClock;
  private readonly inactivityMs: number;
  private snapshot: SessionSnapshot;
  private readonly observers = new Set<() => void>();
  private readonly controllers = new Set<AbortController>();
  private epoch = 0;
  private disposed = false;
  private refreshToken: string | null = null;
  private verified: SessionIdentity | null = null;
  private persistence: SessionPersistence = 'memory';
  private lastActivity = 0;
  private idleTimer: number | null = null;
  private flight: { epoch: number; promise: Promise<void> } | null = null;
  private restoring: Promise<void> | null = null;

  constructor(options: SessionStoreOptions = {}) {
    this.mode = options.mode ?? 'preview';
    this.api = options.api ?? defaultApi;
    this.clock = options.clock ?? browserClock;
    this.inactivityMs = options.inactivityMs ?? SESSION_IDLE_MS;
    this.storage = options.storage === undefined ? this.browserStorage() : options.storage;
    this.snapshot = this.mode === 'preview'
      ? { status: 'preview', epoch: 0 }
      : { status: 'signed-out', epoch: 0 };
    if (this.mode === 'connected') this.lastActivity = this.clock.now();
  }

  private browserStorage(): CredentialStorage | null {
    if (this.mode === 'preview') return null;
    try {
      return typeof window === 'undefined' ? null : window.sessionStorage;
    } catch {
      return null;
    }
  }

  getSnapshot = (): SessionSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.observers.add(listener);
    return () => { this.observers.delete(listener); };
  };

  private publish(snapshot: SessionSnapshot): void {
    this.snapshot = snapshot;
    for (const listener of this.observers) listener();
  }

  private assertConnected(): void {
    if (this.disposed || this.mode !== 'connected') {
      throw new ApiError('protocol', 'Connected session is not available');
    }
  }

  private clearIdle(): void {
    if (this.idleTimer !== null) {
      this.clock.clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private invalidatePending(): number {
    this.epoch += 1;
    for (const controller of this.controllers) controller.abort();
    this.controllers.clear();
    this.flight = null;
    this.restoring = null;
    this.clearIdle();
    return this.epoch;
  }

  private requestController(): AbortController {
    const controller = new AbortController();
    this.controllers.add(controller);
    return controller;
  }
  private releaseController(controller: AbortController): void {
    this.controllers.delete(controller);
  }
  private current(epoch: number): boolean {
    return !this.disposed && this.mode === 'connected' && epoch === this.epoch;
  }

  private forgetStored(): void {
    try { this.storage?.removeItem(SESSION_STORAGE_KEY); } catch { /* blocked storage */ }
  }

  private saveRefresh(value: string): SessionPersistence {
    try {
      if (this.storage === null) return 'memory';
      this.storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ schema: 1, refreshToken: value }));
      return 'tab';
    } catch {
      // Never keep an older tab token after an unsuccessful rotation.
      this.forgetStored();
      return 'memory';
    }
  }

  private clearIdentity(): void {
    this.refreshToken = null;
    this.verified = null;
    this.persistence = 'memory';
    this.forgetStored();
    this.clearIdle();
  }

  private signOut(epoch: number): void {
    if (!this.current(epoch)) return;
    this.clearIdentity();
    this.publish({ status: 'signed-out', epoch });
  }

  private scheduleIdle(): void {
    this.clearIdle();
    if (this.snapshot.status !== 'authenticated') return;
    const epoch = this.epoch;
    const elapsed = Math.max(0, this.clock.now() - this.lastActivity);
    this.idleTimer = this.clock.setTimeout(() => {
      if (!this.current(epoch) || this.snapshot.status !== 'authenticated') return;
      if (this.clock.now() - this.lastActivity >= this.inactivityMs) this.lock();
      else this.scheduleIdle();
    }, Math.max(0, this.inactivityMs - elapsed));
  }

  recordActivity(): void {
    if (this.snapshot.status !== 'authenticated') return;
    // Browser timers can be suspended or throttled in background tabs.
    // Never allow the first returning input to bypass an expired idle limit.
    const now = this.clock.now();
    if (now - this.lastActivity >= this.inactivityMs) {
      this.lock();
      return;
    }
    this.lastActivity = now;
    this.scheduleIdle();
  }

  private commit(auth: LoginResponse, access: MyAccessResponse, epoch: number): void {
    if (!this.current(epoch)) return;
    if (auth.data.user.id !== access.data.user.id) throw protocolError();
    if (!isCredential(auth.data.refreshToken) || !isCredential(auth.data.accessToken)) throw protocolError();
    const verified = identity(access);
    this.refreshToken = auth.data.refreshToken;
    this.verified = verified;
    this.persistence = this.saveRefresh(auth.data.refreshToken);
    this.lastActivity = this.clock.now();
    this.publish({
      ...verified,
      status: 'authenticated',
      epoch,
      accessToken: auth.data.accessToken,
      permissions: [...access.data.permissions],
      features: [...access.data.features],
      persistence: this.persistence,
    });
    this.scheduleIdle();
  }

  private revokeCandidate(value: string): void {
    const controller = new AbortController();
    const timeout = this.clock.setTimeout(() => controller.abort(), LOGOUT_TIMEOUT_MS);
    try {
      void this.api.logoutSession(value, controller.signal).catch(() => undefined)
        .finally(() => this.clock.clearTimeout(timeout));
    } catch {
      this.clock.clearTimeout(timeout);
    }
  }

  private async authenticate(
    action: (signal: AbortSignal) => Promise<LoginResponse>,
    retainPrivateRefresh: boolean,
  ): Promise<void> {
    this.assertConnected();
    const original = retainPrivateRefresh ? this.refreshToken : null;
    const verified = retainPrivateRefresh ? this.verified : null;
    const epoch = this.invalidatePending();
    if (!retainPrivateRefresh) this.clearIdentity();
    this.publish({ status: 'authenticating', epoch });
    const controller = this.requestController();
    let candidate: LoginResponse | null = null;
    try {
      candidate = await action(controller.signal);
      if (!this.current(epoch)) {
        this.revokeCandidate(candidate.data.refreshToken);
        return;
      }
      const access = await this.api.readMyAccess(candidate.data.accessToken, controller.signal);
      if (!this.current(epoch)) {
        this.revokeCandidate(candidate.data.refreshToken);
        return;
      }
      this.commit(candidate, access, epoch);
    } catch (error) {
      if (!this.current(epoch)) return;
      if (candidate) this.revokeCandidate(candidate.data.refreshToken);
      if (retainPrivateRefresh && original) {
        this.refreshToken = original;
        this.verified = verified;
        this.publish(verified
          ? { ...verified, status: 'locked', epoch, reason: 'offline', persistence: this.persistence }
          : { status: 'signed-out', epoch });
      } else {
        this.signOut(epoch);
      }
      throw error;
    } finally {
      this.releaseController(controller);
    }
  }

  loginWithPassword(identifier: string, password: string): Promise<void> {
    this.assertConnected();
    return this.authenticate(signal => this.api.loginPassword(identifier, password, signal), false);
  }

  loginWithPin(pin: string): Promise<void> {
    this.assertConnected();
    if (!this.refreshToken || !sixDigitPin.test(pin)) {
      return Promise.reject(new ApiError('protocol', 'This tab requires a six-digit PIN and an existing session'));
    }
    const refresh = this.refreshToken;
    return this.authenticate(signal => this.api.loginPin(refresh, pin, signal), true);
  }

  private async rotate(epoch: number, oldRefresh: string, controller: AbortController): Promise<void> {
    let next: LoginResponse | null = null;
    try {
      next = await this.api.refreshSession(oldRefresh, controller.signal);
      if (!this.current(epoch)) {
        this.revokeCandidate(next.data.refreshToken);
        return;
      }
      const access = await this.api.readMyAccess(next.data.accessToken, controller.signal);
      if (!this.current(epoch)) {
        this.revokeCandidate(next.data.refreshToken);
        return;
      }
      this.commit(next, access, epoch);
    } catch (error) {
      if (!this.current(epoch)) return;
      if (error instanceof ApiError && (
        error.kind === 'protocol' || (error.kind === 'http' && [401, 403, 404].includes(error.status ?? 0))
      )) {
        this.signOut(epoch);
      } else if (this.refreshToken) {
        // The server may already have rotated its token before /me went offline.
        // Keep the new opaque credential privately, never its unverified access.
        if (next && error instanceof ApiError && error.kind === 'network' &&
            isCredential(next.data.refreshToken)) {
          this.refreshToken = next.data.refreshToken;
          this.persistence = this.saveRefresh(next.data.refreshToken);
        }
        const verified = this.verified;
        this.clearIdle();
        this.publish(verified
          ? { ...verified, status: 'locked', epoch, reason: 'offline', persistence: this.persistence }
          : { status: 'locked', epoch, reason: 'offline', persistence: this.persistence });
      } else {
        this.signOut(epoch);
      }
      throw error;
    } finally {
      this.releaseController(controller);
    }
  }

  refresh(): Promise<void> {
    this.assertConnected();
    if (!this.refreshToken) return Promise.reject(new ApiError('protocol', 'No current tab credential'));
    if (this.flight?.epoch === this.epoch) return this.flight.promise;
    const epoch = this.epoch;
    const controller = this.requestController();
    const promise = this.rotate(epoch, this.refreshToken, controller);
    this.flight = { epoch, promise };
    // Clear the single-flight marker on both outcomes without creating unhandled rejections.
    void promise.then(
      () => { if (this.flight?.promise === promise) this.flight = null; },
      () => { if (this.flight?.promise === promise) this.flight = null; },
    );
    return promise;
  }

  restore(): Promise<void> {
    if (this.mode === 'preview' || this.disposed) return Promise.resolve();
    if (this.restoring) return this.restoring;
    if (this.refreshToken || this.snapshot.status === 'authenticated') return Promise.resolve();
    let raw: string | null = null;
    try { raw = this.storage?.getItem(SESSION_STORAGE_KEY) ?? null; } catch { return Promise.resolve(); }
    if (raw === null) return Promise.resolve();
    const saved = parseStored(raw);
    if (!saved) {
      this.forgetStored();
      return Promise.resolve();
    }
    const epoch = this.invalidatePending();
    this.refreshToken = saved;
    this.persistence = 'tab';
    this.publish({ status: 'authenticating', epoch });
    // Restore reports the resulting session state, not a rejected bootstrap promise:
    // a copied-tab/expired credential becomes signed-out and a network fault locked.
    const task = this.refresh().catch(() => undefined);
    this.restoring = task;
    void task.then(
      () => { if (this.restoring === task) this.restoring = null; },
      () => { if (this.restoring === task) this.restoring = null; },
    );
    return task;
  }

  lock(): void {
    if (this.snapshot.status !== 'authenticated') return;
    const epoch = this.invalidatePending();
    const verified = this.verified;
    if (verified) this.publish({
      ...verified, status: 'locked', epoch, reason: 'inactivity', persistence: this.persistence,
    });
    else this.signOut(epoch);
  }

  async logout(): Promise<void> {
    if (this.mode === 'preview' || this.disposed) return;
    const captured = this.refreshToken;
    const epoch = this.invalidatePending();
    this.clearIdentity();
    this.publish({ status: 'signed-out', epoch });
    if (!captured) return;
    const controller = new AbortController();
    let handle: number | null = null;
    const deadline = new Promise<void>(resolve => {
      handle = this.clock.setTimeout(() => { controller.abort(); resolve(); }, LOGOUT_TIMEOUT_MS);
    });
    try {
      await Promise.race([this.api.logoutSession(captured, controller.signal), deadline]);
    } catch {
      // Server logout is best-effort; the local session was revoked synchronously.
    } finally {
      controller.abort();
      if (handle !== null) this.clock.clearTimeout(handle);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    const epoch = this.invalidatePending();
    this.disposed = true;
    this.refreshToken = null;
    this.verified = null;
    this.publish({ status: 'signed-out', epoch });
    this.observers.clear();
    // Deliberately do not remove tab storage: reload restore owns its lifecycle.
  }
}
