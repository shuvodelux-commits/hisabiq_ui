import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { capabilityCatalog, experienceModules } from './experienceCatalog';
import { buildSnapshot, resolveAll } from './experienceResolver';
import type {
  CapabilityDescriptor, ExperienceSnapshot, SettingChange, SettingScope, SettingValue,
} from './experienceTypes';

/**
 * Phase 1 replacement for the Magic prototype's useInterfaceDraft.
 * All values and entitlements here are sample UI state, never account or
 * business authority.  No localStorage, tenant mutation or backend calls.
 */
export function useInterfaceDraft(canBusiness: boolean) {
  const [params, setParams] = useSearchParams();
  const validModules = experienceModules.map(x => x.id as string);
  const initial = params.get('module');
  const [moduleId, setModuleId] = useState(initial && validModules.includes(initial) ? initial : 'sales');
  const [scopeKind, setScopeKind] = useState<'user' | 'tenant'>('user');
  const [draft, setDraft] = useState<Record<string, SettingValue | null>>({});
  const [pending, setPending] = useState<{ kind: 'module' | 'scope'; value: string } | null>(null);
  const [review, setReview] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'info' | 'warning' | 'danger'; text: string } | null>(null);
  const previewPermissions = useMemo(() => ['view.cost', 'view.profit'], []);
  const scope: SettingScope = scopeKind === 'tenant' && canBusiness ?
    { kind: 'tenant' } : { kind: 'user', userId: 'ui-preview' };
  // Plus is a SAMPLE to show all source controls, not a claim about this account's paid plan.
  const exp = {
    planCode: 'PLUS' as const,
    actor: { permissions: previewPermissions },
    persistenceWarning: null as string | null,
  };
  const base = useMemo(() => buildSnapshot({
    tenantId: 'ui-preview-only', actorId: 'ui-preview', planCode: 'PLUS',
    permissions: previewPermissions, revision: 1, serverNow: '2026-11-08T00:00:00+06:00',
    scope, tenant: {}, users: {},
  }), [previewPermissions, scope.kind]);
  const rows = capabilityCatalog.filter(d =>
    d.module === moduleId && d.implemented && base.decisions[d.key]?.available);
  const hiddenByPlan = capabilityCatalog.filter(d => d.module === moduleId && d.implemented &&
    base.decisions[d.key]?.reason === 'PLAN_REQUIRED');
  const hiddenByRole = capabilityCatalog.filter(d => d.module === moduleId && d.implemented &&
    base.decisions[d.key]?.reason === 'ROLE_DENIED');
  const hasOwn = (key: string) => Object.prototype.hasOwnProperty.call(draft, key);
  const inherited = (key: string): SettingValue =>
    capabilityCatalog.find(d => d.key === key)?.defaultValue ?? false;
  const valueOf = (key: string): SettingValue =>
    hasOwn(key) ? (draft[key] === null ? inherited(key) : draft[key] as SettingValue) : base.values[key];
  const blockedBy = (d: CapabilityDescriptor) => {
    const parentKey = d.requires.find(key => !valueOf(key));
    return parentKey ? capabilityCatalog.find(x => x.key === parentKey) ?? null : null;
  };
  const sourceText = (key: string) => hasOwn(key) ? 'Unsaved UI preview' : 'Sample HisabIQ default';
  const set = (key: string, value: SettingValue) => {
    setDraft(old => {
      const next = {...old};
      if (inherited(key) === value) delete next[key];
      else next[key] = value;
      return next;
    });
    setNotice(null);
  };
  const changes: SettingChange[] = Object.entries(draft).map(([key, value]) =>
    value === null ? { op: 'RESET' as const, key, scope } :
    { op: 'SET' as const, key, scope, value });
  const dirty = changes.length > 0;
  const discard = () => { setDraft({}); setNotice(null); setReview(false); };
  const resetModule = () => {
    const keys = new Set(rows.map(r => r.key));
    setDraft(old => Object.fromEntries(Object.entries(old).filter(([key]) => !keys.has(key))));
    setNotice({ tone: 'info', text: 'Source defaults restored in the preview only. No settings were changed.' });
  };
  const applyNow = (key: string, value: SettingValue) => {
    set(key, value);
    setNotice({ tone: 'info', text: 'UI preview only. Personal preferences will be connected in Phase 2. Nothing was saved.' });
  };
  const resetMineNow = () => {
    discard();
    setNotice({ tone: 'info', text: 'UI preview reset to source defaults. No business settings were changed.' });
  };
  const applySwitch = (next: { kind: 'module' | 'scope'; value: string }) => {
    if (next.kind === 'module') {
      if (!validModules.includes(next.value)) return;
      setModuleId(next.value);
      setParams(old => { const p = new URLSearchParams(old); p.set('module', next.value); return p; }, { replace: true });
    } else if (next.value === 'user' || (canBusiness && next.value === 'tenant')) {
      setScopeKind(next.value);
    }
  };
  const requestSwitch = (next: { kind: 'module' | 'scope'; value: string }) => {
    if (dirty) setPending(next);
    else applySwitch(next);
  };
  const confirmSwitch = () => {
    if (!pending) return;
    const target = pending;
    discard();
    applySwitch(target);
    setPending(null);
  };
  const previewSnapshot: ExperienceSnapshot = useMemo(() => {
    const overrides: Record<string, SettingValue> = {};
    for (const [key, value] of Object.entries(draft)) if (value !== null) overrides[key] = value;
    const resolved = resolveAll({
      planCode: 'PLUS', permissions: previewPermissions,
      tenant: scope.kind === 'tenant' ? overrides : {},
      user: scope.kind === 'user' ? overrides : null,
    });
    return { ...base, values: resolved.values, decisions: resolved.decisions };
  }, [draft, base, previewPermissions, scope.kind]);
  const save = () => { if (dirty) setReview(true); };
  const commit = () => {
    setReview(false);
    setNotice({
      tone: 'warning',
      text: 'UI preview only. These changes were NOT saved for anyone; real settings reconnection is in Phase 2.',
    });
  };
  const overrideCount = rows.filter(r => hasOwn(r.key)).length;
  return {
    exp, canBusiness, moduleId, scope, base, rows, hiddenByPlan, hiddenByRole,
    loading: false, notice, setNotice, dirty, changes, overrideCount,
    valueOf, hasOverride: hasOwn, sourceText, blockedBy, inherited,
    set, resetModule, discard, save, commit, review, setReview,
    pending, setPending, requestSwitch, confirmSwitch, previewSnapshot,
    usersWithOwnChoice: (_key: string) => 0, savingKey: null as string | null,
    savedKey: null as string | null, applyNow, resetMineNow,
  };
}
export type InterfaceDraft = ReturnType<typeof useInterfaceDraft>;
