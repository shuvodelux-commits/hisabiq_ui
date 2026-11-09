import { useEffect, useRef, useState } from 'react';
import type { AuditEvent, Result, SaasPermission, SaasState } from '../../types/saas';
import { createInitialState } from '../../utils/saasState';
import { hasPermission, roleLabel } from '../../utils/saasAccess';
import { NOW_TIME, sid } from '../../utils/saas';

type RunSpec = { perm: SaasPermission | SaasPermission[]; tenantId?: string | null; what: string; once?: string };

/** Shared store, identity and the single command handler every change goes through. */
export function useSaasCore(initialStaffId: string) {
  const [state, setState] = useState<SaasState>(createInitialState);
  const [staffId, setStaffId] = useState(initialStaffId);
  useEffect(() => setStaffId(initialStaffId), [initialStaffId]);
  const ref = useRef(state);
  ref.current = state;
  const processed = useRef(new Set<string>());

  const member = state.staff.find((s) => s.id === staffId) ?? state.staff[0];
  const staff = { ...member, label: roleLabel(member) };

  const commit = (fn: (s: SaasState) => SaasState) => {
    const next = fn(ref.current);
    ref.current = next;
    setState(next);
  };

  const can = (p: SaasPermission) => hasPermission(member, p);
  const canFor = (p: SaasPermission, tenantId?: string | null) => hasPermission(member, p, tenantId);
  const inScope = (tenantId: string) => hasPermission(member, 'tenants.view', tenantId);

  const event = (tenantId: string | null, action: string, summary: string, detail?: string, actor = staff.name): AuditEvent => ({ id: sid('AU'), at: NOW_TIME, actor, tenantId, action, summary, detail });

  const deny = (what: string, perms: SaasPermission[], tenantId?: string | null): Result => {
    const elsewhere = perms.some((p) => hasPermission(member, p));
    if (elsewhere && tenantId) return { ok: false, message: `This business isn’t in your assigned businesses, so you can’t ${what}.` };
    if (elsewhere && tenantId === null) return { ok: false, message: `You can ${what} only with an all-business role assignment.` };
    return { ok: false, message: `Your role (${staff.label}) can’t ${what}.` };
  };

  /** Checks permission + tenant scope, skips repeated commands, then runs the change. */
  const run = (spec: RunSpec, fn: () => Result): Result => {
    const perms = Array.isArray(spec.perm) ? spec.perm : [spec.perm];
    if (!perms.some((p) => hasPermission(member, p, spec.tenantId))) return deny(spec.what, perms, spec.tenantId);
    if (spec.once && processed.current.has(spec.once)) return { ok: false, message: 'Already done — this action only runs once.' };
    const r = fn();
    if (r.ok && spec.once) processed.current.add(spec.once);
    return r;
  };

  const tenantById = (id: string) => ref.current.tenants.find((t) => t.id === id);

  const reset = (): Result => {
    if (!hasPermission(member, 'settings.edit', null)) return deny('reset demo data', ['settings.edit'], null);
    processed.current.clear();
    commit(() => createInitialState());
    return { ok: true, message: 'Demo data reset.' };
  };

  return { state, staff, setStaffId, ref, commit, can, canFor, inScope, event, run, tenantById, reset };
}

export type SaasCore = ReturnType<typeof useSaasCore>;
