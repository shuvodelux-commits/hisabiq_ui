import type { SaasPermission, StaffMember, Assignment } from '../types/saas';
import { globalOnlyAreas, roleDefs } from '../data/saasSeeds';

const area = (p: string) => p.split('.')[0];

/** Granting an action implies its area's `.view`. */
function expand(perms: SaasPermission[]): Set<string> {
  const s = new Set<string>();
  for (const p of perms) {
    s.add(p);
    s.add(`${area(p)}.view`);
  }
  return s;
}

/**
 * tenantId: undefined = anywhere in the person's scope; null = platform-wide action; string = that business.
 * Areas in `globalOnlyAreas` only count from all-business assignments.
 */
export function hasPermission(staff: StaffMember | undefined, p: SaasPermission, tenantId?: string | null): boolean {
  if (!staff || staff.status !== 'Active') return false;
  return staff.assignments.some((a) => {
    const role = roleDefs.find((r) => r.id === a.roleId);
    if (!role || !expand(role.permissions).has(p)) return false;
    if (a.scope === 'ALL') return true;
    if (globalOnlyAreas.includes(area(p))) return false;
    if (tenantId === undefined) return true;
    if (tenantId === null) return false;
    return a.scope.includes(tenantId);
  });
}

export type EffectiveRow = { permission: string; all: boolean; tenants: string[]; via: string[] };

/** Combined access across all of a person's role assignments. */
export function effectiveAccess(assignments: Assignment[]): EffectiveRow[] {
  const map = new Map<string, { all: boolean; tenants: Set<string>; via: Set<string> }>();
  for (const a of assignments) {
    const role = roleDefs.find((r) => r.id === a.roleId);
    if (!role) continue;
    for (const p of expand(role.permissions)) {
      if (a.scope !== 'ALL' && globalOnlyAreas.includes(area(p))) continue;
      const e = map.get(p) ?? { all: false, tenants: new Set<string>(), via: new Set<string>() };
      if (a.scope === 'ALL') e.all = true;
      else a.scope.forEach((t) => e.tenants.add(t));
      e.via.add(role.label);
      map.set(p, e);
    }
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([permission, e]) => ({ permission, all: e.all, tenants: [...e.tenants], via: [...e.via] }));
}

export function roleLabel(staff: Pick<StaffMember, 'assignments'>): string {
  return staff.assignments.map((a) => roleDefs.find((r) => r.id === a.roleId)?.label ?? a.roleId).join(' + ') || 'No role';
}

export function isScoped(staff: StaffMember): boolean {
  return !staff.assignments.some((a) => a.scope === 'ALL');
}
