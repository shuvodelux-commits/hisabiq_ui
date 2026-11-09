import type {
  AccessDecision,
  CapabilityDescriptor,
  ExperienceSnapshot,
  ExperienceTier,
  PlanCode,
  SettingScope,
  SettingValue,
  Viewport,
} from './experienceTypes';
import { CATALOG_VERSION, capabilityCatalog, moduleColumns } from './experienceCatalog';

const tierRank: Record<ExperienceTier, number> = { BASIC: 0, CONNECTED: 1, RICH: 2 };

/** Counter keeps its separately listed benefits; its interface level is Basic (planning default, owner confirmation pending). */
export const planTier = (plan: PlanCode): ExperienceTier => (plan === 'PRO' ? 'CONNECTED' : plan === 'PLUS' ? 'RICH' : 'BASIC');

export const tierLabel: Record<ExperienceTier, string> = { BASIC: 'Simple', CONNECTED: 'Connected', RICH: 'Connected + detailed' };

const closed = (reason: AccessDecision['reason']): AccessDecision => ({ available: false, enabled: false, reason, source: 'default' });

type ResolveInput = {
  planCode: PlanCode;
  permissions: string[];
  tenant: Record<string, SettingValue>;
  /** null when resolving the business-default scope */
  user: Record<string, SettingValue> | null;
  descriptors?: CapabilityDescriptor[];
};

/**
 * Resolution order (AND conditions, never overridable):
 * implemented → plan tier/grant → employee permission → dependencies → tenant default → user preference.
 */
export function resolveAll(input: ResolveInput) {
  const descriptors = input.descriptors ?? capabilityCatalog;
  const byKey = new Map(descriptors.map((d) => [d.key, d]));
  const tier = planTier(input.planCode);
  const memo = new Map<string, AccessDecision>();
  const values: Record<string, SettingValue> = {};

  const decide = (key: string, stack: Set<string>): AccessDecision => {
    const cached = memo.get(key);
    if (cached) return cached;
    const d = byKey.get(key);
    if (!d || !d.implemented || stack.has(key)) return closed('NOT_IMPLEMENTED');
    if (tierRank[tier] < tierRank[d.minimumTier]) return closed('PLAN_REQUIRED');
    if (d.sensitivePermission && !input.permissions.includes(d.sensitivePermission)) return closed('ROLE_DENIED');
    const userHas = !!input.user && Object.prototype.hasOwnProperty.call(input.user, key);
    const tenantHas = Object.prototype.hasOwnProperty.call(input.tenant, key);
    const value = userHas ? input.user![key] : tenantHas ? input.tenant[key] : d.defaultValue;
    const source: AccessDecision['source'] = userHas ? 'user' : tenantHas ? 'tenant' : 'default';
    values[key] = value;
    const next = new Set(stack).add(key);
    for (const parent of d.requires) {
      if (!decide(parent, next).enabled) {
        const off: AccessDecision = { available: true, enabled: false, reason: 'DEPENDENCY_OFF', source };
        memo.set(key, off);
        return off;
      }
    }
    const result: AccessDecision = { available: true, enabled: Boolean(value), reason: null, source };
    memo.set(key, result);
    return result;
  };

  const decisions: Record<string, AccessDecision> = {};
  for (const d of descriptors) {
    decisions[d.key] = decide(d.key, new Set());
    if (!(d.key in values)) values[d.key] = false;
  }
  return { decisions, values };
}

export function buildSnapshot(args: {
  tenantId: string;
  actorId: string;
  planCode: PlanCode;
  permissions: string[];
  revision: number;
  serverNow: string;
  scope: SettingScope;
  tenant: Record<string, SettingValue>;
  users: Record<string, Record<string, SettingValue>>;
}): ExperienceSnapshot {
  const user = args.scope.kind === 'user' ? args.users[args.scope.userId] ?? {} : null;
  const { decisions, values } = resolveAll({ planCode: args.planCode, permissions: args.permissions, tenant: args.tenant, user });
  return {
    tenantId: args.tenantId,
    actorId: args.actorId,
    planCode: args.planCode,
    revision: args.revision,
    serverNow: args.serverNow,
    catalogVersion: CATALOG_VERSION,
    contractVersion: 1,
    scope: args.scope,
    overrides: args.scope.kind === 'tenant' ? { ...args.tenant } : { ...(user ?? {}) },
    descriptors: capabilityCatalog,
    values,
    decisions,
  };
}

/** Unknown keys fail closed. */
export function accessFor(snapshot: ExperienceSnapshot, key: string): AccessDecision {
  return snapshot.decisions[key] ?? closed('NOT_IMPLEMENTED');
}

export function visibleColumns(snapshot: ExperienceSnapshot, module: string, viewport: Viewport): string[] {
  const spec = moduleColumns[module];
  if (!spec) return [];
  const optional = spec.optional
    .filter((o) => accessFor(snapshot, o.key).enabled)
    .filter((o) => viewport === 'desktop' || (viewport === 'tablet' && o.tablet))
    .map((o) => o.column);
  return [...spec.essential, ...optional];
}

export const descriptorFor = (key: string) => capabilityCatalog.find((d) => d.key === key);

export const scopeLabel = (scope: SettingScope, userName?: string) =>
  scope.kind === 'tenant' ? 'Business default (everyone)' : `${userName ?? 'One user'} only`;

export const sameScope = (a: SettingScope, b: SettingScope) =>
  a.kind === b.kind && (a.kind === 'tenant' || (b.kind === 'user' && a.userId === b.userId));

export const valueLabel = (v: SettingValue | null | undefined) => (v === null || v === undefined ? 'Inherited' : v === true ? 'On' : v === false ? 'Off' : String(v));
