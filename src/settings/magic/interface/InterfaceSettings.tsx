import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button, Modal } from '../invoice/Ui';
import { AppSelect } from '../../../components/AppSelect';
import { useInterfaceDraft } from './useInterfaceDraft';
import { capabilityCatalog, experienceModules, moduleColumns, planCatalog } from './experienceCatalog';
import { planTier, tierLabel, valueLabel } from './experienceResolver';
import { CapabilityRow } from './CapabilityRow';
import { ModuleSelector } from './ModuleSelector';
import { InterfacePreview } from './InterfacePreview';
import { SaveBar } from '../SaveBar';
import type { CapabilityDescriptor, CapabilityGroup } from './experienceTypes';

const groups: { id: CapabilityGroup; label: string; bn: string }[] = [
  { id: 'columns', label: 'Columns', bn: 'কলাম' },
  { id: 'details', label: 'Details', bn: 'বিস্তারিত' },
  { id: 'links', label: 'Links & actions', bn: 'লিংক ও কাজ' },
];

export function InterfaceSettings({ onDirtyChange, canBusiness }: { onDirtyChange?: (dirty: boolean) => void; canBusiness: boolean }) {
  const s = useInterfaceDraft(canBusiness);
  const { exp } = s;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const plan = planCatalog.find((p) => p.code === exp.planCode) ?? planCatalog[0];
  const mod = experienceModules.find((m) => m.id === s.moduleId) ?? experienceModules[0];
  const isTenant = s.scope.kind === 'tenant';
  const mode = isTenant ? 'checkbox' : 'switch';
  const counts = Object.fromEntries(
    experienceModules.map((m) => [m.id, capabilityCatalog.filter((d) => d.module === m.id && d.implemented && s.base.decisions[d.key]?.available).length]),
  );
  const common = s.rows.filter((r) => !r.advanced);
  const advanced = s.rows.filter((r) => r.advanced);
  const changedKeys = new Set(s.changes.map((c) => c.key));
  const essential = moduleColumns[s.moduleId]?.essential ?? [];
  const hasCatalog = capabilityCatalog.some((d) => d.module === s.moduleId && d.implemented);

  useEffect(() => {
    onDirtyChange?.(s.dirty);
  }, [s.dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  const renderRow = (d: CapabilityDescriptor) => (
    <CapabilityRow
      key={d.key}
      descriptor={d}
      mode={mode}
      checked={Boolean(s.valueOf(d.key))}
      onChange={(v) => (isTenant ? s.set(d.key, v) : s.applyNow(d.key, v))}
      source={s.sourceText(d.key)}
      changed={isTenant && changedKeys.has(d.key)}
      blockedBy={s.blockedBy(d)}
      saving={s.savingKey === d.key}
      saved={s.savedKey === d.key}
    />
  );

  return (
    <div className="min-w-0 space-y-3" data-settings-magic-interface>
      <section className="min-w-0 rounded-xl border border-ink-100 bg-white shadow-card" aria-labelledby="interface-title">
        <header className="space-y-3 border-b border-ink-100 px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 id="interface-title" className="text-sm font-semibold text-ink">
                Interface & workflows <span className="ml-1 font-bn text-[11px] font-normal text-ink-400">ইন্টারফেস ও কাজের ধারা</span>
              </h2>
              <p className="mt-0.5 text-xs text-ink-500">Your plan decides what is available. You decide what is shown.</p>
            </div>
            <Link
              to="/app/subscription"
              className="inline-flex items-center rounded-md bg-teal-50 px-2 py-1 text-[11px] font-medium text-teal-800 hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              Sample {plan.label} plan · {tierLabel[planTier(exp.planCode)]}
            </Link>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <ModuleSelector value={s.moduleId} counts={counts} onChange={(id) => s.requestSwitch({ kind: 'module', value: id })} />
            {s.canBusiness && (
              <div className="w-full sm:w-64">
                <label className="block text-[12px] font-medium text-ink-700">Apply to</label>
                  <AppSelect label="Apply to"
                    value={s.scope.kind}
                    onChange={(v) => s.requestSwitch({ kind: 'scope', value: v })}
                    options={[{ value: 'user', label: 'Only me (UI preview)' }, { value: 'tenant', label: 'Everyone (UI preview)' }]}
                  />
              </div>
            )}
          </div>
          <p role="note" className="text-[11px] text-ink-500" data-interface-preview-notice>Interface & workflow settings are a UI preview. No actual plan, permissions, preferences, or business defaults change.</p>
          {exp.persistenceWarning && <p className="rounded-lg bg-warning-bg px-3 py-2 text-xs text-warning">{exp.persistenceWarning}</p>}
          {s.notice && (
            <p role="alert" className={`rounded-lg px-3 py-2 text-xs ${s.notice.tone === 'danger' ? 'bg-danger-bg text-danger' : s.notice.tone === 'warning' ? 'bg-warning-bg text-warning' : 'bg-teal-50 text-teal-800'}`}>
              {s.notice.text}{' '}
              <button className="ml-1 font-medium underline" onClick={() => s.setNotice(null)}>Dismiss</button>
            </p>
          )}
        </header>

        <div className="px-4 pb-2 pt-1">
          {s.loading ? (
            <div className="space-y-4 py-3" aria-busy="true" aria-label="Loading settings">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-ink-100" />
                    <div className="h-2.5 w-2/3 animate-pulse rounded bg-ink-50" />
                  </div>
                  <div className="h-5 w-9 animate-pulse rounded-full bg-ink-100" />
                </div>
              ))}
            </div>
          ) : s.rows.length === 0 ? (
            <div className="space-y-1 py-4 text-[13px] text-ink-700">
              <p className="font-medium text-ink">
                {mod.label} uses its standard layout{hasCatalog ? ` on the ${plan.label} plan` : ''}.
              </p>
              {essential.length > 0 && <p className="text-xs text-ink-500">Always shown: {essential.join(', ')}.</p>}
              {s.hiddenByPlan
                .filter((d) => d.basicRoute)
                .map((d) => (
                  <p key={d.key} className="text-xs text-ink-500">
                    {d.label}: use {d.basicRoute}.
                  </p>
                ))}
              {!hasCatalog && <p className="text-xs text-ink-500">There are no optional controls for this module yet.</p>}
            </div>
          ) : (
            <>
              {groups.map((g) => {
                const list = common.filter((r) => r.group === g.id);
                if (!list.length) return null;
                return (
                  <div key={g.id} className="pt-3">
                    <h3 className="text-xs font-medium text-ink-500">
                      {g.label} <span className="font-bn text-[11px] text-ink-400">· {g.bn}</span>
                    </h3>
                    <div className="divide-y divide-ink-100">{list.map(renderRow)}</div>
                  </div>
                );
              })}
              {advanced.length > 0 && (
                <div className="mt-2 border-t border-ink-100">
                  <button
                    type="button"
                    aria-expanded={showAdvanced}
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="flex w-full items-center justify-between rounded py-3 text-left text-[13px] font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                  >
                    <span>
                      More options <span className="ml-1 text-[11px] font-normal text-ink-500">{advanced.length}</span>
                    </span>
                    <ChevronDown className={`size-4 text-ink-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {showAdvanced && <div className="divide-y divide-ink-100 border-t border-ink-100">{advanced.map(renderRow)}</div>}
                </div>
              )}
            </>
          )}

          {!s.loading && (s.hiddenByPlan.length > 0 || s.hiddenByRole.length > 0) && (
            <div className="space-y-1 border-t border-ink-100 py-3 text-xs text-ink-500">
              {s.hiddenByPlan.length > 0 && (
                <p>
                  {planTier(exp.planCode) === 'BASIC'
                    ? 'Pro adds record links and quick actions. Plus adds item, payment and value details.'
                    : `Plus adds ${s.hiddenByPlan.length} more for ${mod.label}: ${s.hiddenByPlan.map((d) => d.label.toLowerCase()).join(', ')}.`}{' '}
                  <Link to="/app/subscription" className="font-medium text-teal-700 hover:underline">Compare plans</Link>
                </p>
              )}
              {s.hiddenByRole.length > 0 && (
                <p>
                  {s.hiddenByRole.length} option{s.hiddenByRole.length > 1 ? 's are' : ' is'} hidden because your role can’t see cost or profit.
                </p>
              )}
            </div>
          )}

          {!s.loading && s.rows.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 py-3">
              <Button kind="ghost" onClick={() => setShowPreview((v) => !v)}>
                {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                {showPreview ? 'Hide preview' : 'Preview'}
              </Button>
              {!isTenant && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-ink-500">UI preview · nothing saved</span>
                  <Button kind="ghost" disabled={s.overrideCount === 0 || !!s.savingKey} onClick={s.resetMineNow}>
                    <RotateCcw className="size-4" />
                    Use business defaults
                  </Button>
                </div>
              )}
            </div>
          )}
          {showPreview && !s.loading && s.rows.length > 0 && (
            <div className="pb-3">
              <InterfacePreview snapshot={s.previewSnapshot} moduleId={s.moduleId} />
            </div>
          )}
        </div>
      </section>

      {isTenant && (
        <SaveBar
          dirty={s.dirty}
          saving={false}
          status="UI preview only · no business defaults have been changed."
          dirtyLabel={`${s.changes.length} unsaved preview change${s.changes.length > 1 ? 's' : ''} (not applied)`}
          onSave={s.save}
          onDiscard={s.discard}
          onRestore={s.resetModule}
          restoreLabel="Reset to HisabIQ defaults"
          restoreDisabled={s.overrideCount === 0 && !s.dirty}
          saveLabel="Review & save"
        />
      )}

      {s.pending && (
        <Modal
          title="Discard unsaved changes?"
          onClose={() => s.setPending(null)}
          footer={
            <>
              <Button onClick={() => s.setPending(null)}>Keep editing</Button>
              <Button kind="danger" onClick={s.confirmSwitch}>Discard</Button>
            </>
          }
        >
          <p className="text-[13px] text-ink-700">
            You have {s.changes.length} unsaved business default{s.changes.length > 1 ? 's' : ''} for {mod.label}.
          </p>
        </Modal>
      )}

      {s.review && (
        <Modal
          title="Review business defaults (UI preview)"
          onClose={() => s.setReview(false)}
          footer={
            <>
              <Button onClick={() => s.setReview(false)}>Keep editing</Button>
              <Button kind="primary" onClick={s.commit}>Continue preview (no save)</Button>
            </>
          }
        >
          <div className="space-y-3 text-[13px]">
            <p className="text-ink-700">Sample business defaults only. This preview does not modify settings for you or any staff.</p>
            <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">
              {s.changes.map((c) => {
                const d = capabilityCatalog.find((x) => x.key === c.key);
                const before = s.base.overrides[c.key] ?? null;
                const keep = s.usersWithOwnChoice(c.key);
                return (
                  <li key={c.key} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <span className="min-w-0">
                      <span className="font-medium text-ink">{d?.label}</span>
                      {keep > 0 && <span className="block text-[11px] text-ink-500">{keep} user{keep > 1 ? 's keep' : ' keeps'} their own choice</span>}
                    </span>
                    <span className="text-ink-600">
                      {valueLabel(before === null ? s.inherited(c.key) : before)} →{' '}
                      <b className="font-medium text-ink">{c.op === 'RESET' ? `${valueLabel(s.inherited(c.key))} (default)` : valueLabel(c.value)}</b>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Modal>
      )}
    </div>
  );
}
