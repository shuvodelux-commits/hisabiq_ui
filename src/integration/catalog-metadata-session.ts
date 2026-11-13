import { createCatalogMetadataV1, type CatalogMetadataV1CreateCommand } from './catalog-metadata-v1-create.ts';
import {
  patchCatalogMetadataV1,
  readCatalogMetadataV1,
  type CatalogMetadataV1Envelope,
  type CatalogMetadataV1PatchCommand,
} from './catalog-metadata-v1.ts';
import { ApiError } from './errors.ts';
import type { SessionSnapshot, SessionStore } from './session.ts';

/**
 * MOD-002 T02A/P5b — an unmounted, fail-closed bridge between the verified
 * connected SessionStore and the already-accepted metadata-v1 HTTP clients.
 *
 * This is NOT a production feature switch: a successful tenant-scoped GET
 * proves only that this API could be read for this session. A separate owner
 * rollout approval, schema 0055 migration verification, and React UX-parity
 * acceptance are mandatory before any Product Settings UI imports this file.
 *
 * No preview fallback, localStorage credentials, cross-tenant cache, automatic
 * write retry or speculative frontend IDs are permitted here.
 */

type SignedIn = Extract<SessionSnapshot, { status: 'authenticated' }>;
type SessionSource = Pick<SessionStore, 'getSnapshot' | 'subscribe'>;
type MasterKind = CatalogMetadataV1CreateCommand['kind'];

const VIEW = 'catalog.product.view';
const WRITE: Record<MasterKind, string> = {
  units: 'catalog.unit.manage',
  brands: 'catalog.brand.manage',
  categories: 'catalog.category.manage',
};

function unavailable(): ApiError {
  return new ApiError('protocol', 'An authenticated catalog session is required');
}
function changedSession(): ApiError {
  return new ApiError('protocol', 'The catalog session changed; re-read before any further changes');
}
function denied(): ApiError {
  return new ApiError('http', 'Current session lacks catalog access', {
    status: 403,
    code: 'PERMISSION_DENIED',
  });
}
function notReady(): ApiError {
  return new ApiError('protocol', 'Read the current tenant catalog before changing its metadata');
}
function identityMatches(now: SessionSnapshot, expected: SignedIn): boolean {
  return now.status === 'authenticated' &&
    now.tenantId === expected.tenantId &&
    now.userId === expected.userId &&
    now.epoch === expected.epoch &&
    now.accessToken === expected.accessToken;
}

export class CatalogMetadataSessionBridge {
  private confirmed: SignedIn | null = null;

  /**
   * Only the existing SessionStore is a credential source. Never pass arbitrary
   * caller-selected tenant IDs, access tokens, or preview identities to this
   * bridge. A structurally compatible store can be used in isolated tests.
   */
  private readonly session: SessionSource;

  constructor(session: SessionSource) {
    this.session = session;
  }

  private requireSession(): SignedIn {
    const snapshot = this.session.getSnapshot();
    if (snapshot.status !== 'authenticated') {
      this.confirmed = null;
      throw unavailable();
    }
    if (this.confirmed !== null && !identityMatches(snapshot, this.confirmed)) {
      this.confirmed = null;
    }
    return snapshot;
  }

  private requirePermission(snapshot: SignedIn, permission: string): void {
    if (!snapshot.permissions.includes(permission)) throw denied();
  }

  /**
   * A verified GET is a *per-session API availability preflight*, never a
   * deployment/migration approval. It does not mutate Product Settings state.
   */
  async read(signal?: AbortSignal): Promise<CatalogMetadataV1Envelope> {
    const snapshot = this.requireSession();
    this.requirePermission(snapshot, VIEW);
    this.confirmed = null;
    const result = await this.request(snapshot, (token, operationSignal) =>
      readCatalogMetadataV1(token, operationSignal), signal);
    this.confirmed = snapshot;
    return result;
  }

  /** True only after the same tenant, user, epoch and access token passed read(). */
  isReadReady(): boolean {
    const current = this.session.getSnapshot();
    return this.confirmed !== null && identityMatches(current, this.confirmed);
  }

  /** A single server-owned atomic POST, never legacy create followed by PATCH. */
  async create(
    command: CatalogMetadataV1CreateCommand,
    signal?: AbortSignal,
  ): Promise<CatalogMetadataV1Envelope> {
    const snapshot = this.requireSession();
    this.requirePermission(snapshot, VIEW);
    this.requirePermission(snapshot, WRITE[command.kind]);
    if (!this.isReadReady()) throw notReady();
    try {
      return await this.request(snapshot, (token, operationSignal) =>
        createCatalogMetadataV1(token, command, operationSignal), signal);
    } catch (error) {
      // A failed CREATE may have committed before the connection failed.
      // Never treat that as safely retryable; require a new GET/reconciliation.
      this.confirmed = null;
      throw error;
    }
  }

  /** Metadata PATCH is version checked by the existing client and the server. */
  async patch(
    command: CatalogMetadataV1PatchCommand,
    signal?: AbortSignal,
  ): Promise<CatalogMetadataV1Envelope> {
    const snapshot = this.requireSession();
    this.requirePermission(snapshot, VIEW);
    this.requirePermission(snapshot, WRITE[command.kind]);
    if (!this.isReadReady()) throw notReady();
    try {
      return await this.request(snapshot, (token, operationSignal) =>
        patchCatalogMetadataV1(token, command, operationSignal), signal);
    } catch (error) {
      this.confirmed = null;
      throw error;
    }
  }

  /**
   * Abort on any identity/credential transition and double-check AFTER await.
   * Browsers, test mocks or server proxies can complete a request even after
   * an abort; those stale results must never reach a later tenant's UI.
   */
  private async request(
    snapshot: SignedIn,
    execute: (accessToken: string, signal: AbortSignal) => Promise<CatalogMetadataV1Envelope>,
    externalSignal?: AbortSignal,
  ): Promise<CatalogMetadataV1Envelope> {
    const controller = new AbortController();
    const changed = () => {
      if (!identityMatches(this.session.getSnapshot(), snapshot)) controller.abort();
    };
    const aborted = () => controller.abort();
    const unsubscribe = this.session.subscribe(changed);
    if (externalSignal?.aborted) aborted();
    else externalSignal?.addEventListener('abort', aborted, { once: true });
    changed(); // Covers a transition between getSnapshot() and subscribe().
    try {
      const result = await execute(snapshot.accessToken, controller.signal);
      if (!identityMatches(this.session.getSnapshot(), snapshot)) throw changedSession();
      return result;
    } catch (error) {
      if (!identityMatches(this.session.getSnapshot(), snapshot)) throw changedSession();
      throw error;
    } finally {
      unsubscribe();
      externalSignal?.removeEventListener('abort', aborted);
      controller.abort();
    }
  }
}
