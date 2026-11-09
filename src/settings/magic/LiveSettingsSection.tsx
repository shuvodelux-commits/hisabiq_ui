import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Lock } from 'lucide-react';
import { AppSelect } from '../../components/AppSelect';
import { canManage, defaults, type SettingsSections } from '../model';
import { settingsFields, sectionNames, type SettingField } from '../fields';
import { useTenantSettings } from '../TenantSettingsProvider';
import { Button, Input, SettingCard, SettingsDialog } from '../ui';
import { SettingsToggle } from './SettingsToggle';
import { SaveBar } from './SaveBar';

export type LiveSection = 'sales' | 'products' | 'purchases' | 'money' | 'notifications' | 'invoices';
type Draft = Record<string, unknown>;

/** HisabIQ's existing tenant preference controls, in the current Magic-style cards.
 * The provider owns permission checks, revision conflicts and persistence.
 * Prototype-only Magic flags are never passed off as working business settings.
 */
export function LiveSettingsSection({
  section, onDirtyChange,
}: {
  section: LiveSection;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { state, actorId, save, personal } = useTenantSettings();
  const canEdit = canManage(state, actorId, section);
  const fields = settingsFields[section] ?? [];
  const [draft, setDraft] = useState<Draft>(() => structuredClone(state.sections[section]) as unknown as Draft);
  const [baseline, setBaseline] = useState(() => JSON.stringify(state.sections[section]));
  const [revision, setRevision] = useState(state.revision);
  const [advanced, setAdvanced] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const dirty = JSON.stringify(draft) !== baseline;
  const info = sectionNames[section];

  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  useEffect(() => {
    if (dirty) return; // Never clobber unsaved edits from another tab.
    const latest = structuredClone(state.sections[section]) as unknown as Draft;
    setDraft(latest);
    setBaseline(JSON.stringify(latest));
    setRevision(state.revision);
  }, [state.revision, state.sections, section, dirty]);

  const set = (key: string, value: unknown) => {
    setDraft(previous => {
      // Invoice prefix is stored both as a convenience field and in the
      // actual document-numbering rules. Never split those values.
      if (section === 'invoices' && key === 'prefix') {
        const numbering = previous.numbering as SettingsSections['invoices']['numbering'];
        return { ...previous, prefix: value, numbering: {
          ...numbering, sale: { ...numbering.sale, prefix: String(value) },
        } };
      }
      return { ...previous, [key]: value };
    });
    setError('');
    setNotice('');
  };
  const discard = () => {
    const latest = structuredClone(state.sections[section]) as unknown as Draft;
    setDraft(latest);
    setBaseline(JSON.stringify(latest));
    setRevision(state.revision);
    setConfirm(false);
    setError('');
    setNotice('Latest saved business preferences loaded.');
  };
  const restore = () => {
    // This page exposes only a subset of invoice/business data. Resetting it
    // must never wipe hidden invoice designs, numbering or ledger profiles.
    const original = defaults(state.tenantId).sections[section] as unknown as Draft;
    setDraft(previous => ({ ...previous,
      ...Object.fromEntries(fields.map(field => [field.key, structuredClone(original[field.key])])),
      ...(section === 'invoices' ? { numbering: {
        ...(previous.numbering as SettingsSections['invoices']['numbering']),
        sale: { ...(previous.numbering as SettingsSections['invoices']['numbering']).sale,
          prefix: String(original.prefix) },
      } } : {}),
    }));
    setError('');
    setNotice('Defaults for visible settings loaded into the draft. Save to apply.');
  };
  const persist = () => {
    setConfirm(false);
    setError('');
    for (const field of fields) {
      const value = draft[field.key];
      if (field.kind === 'number' &&
        (typeof value !== 'number' || !Number.isFinite(value) ||
          (field.min !== undefined && value < field.min) ||
          (field.max !== undefined && value > field.max))) {
        setError('Enter a valid value for ' + field.label + '.');
        return;
      }
    }
    const result = save(section, draft as unknown as SettingsSections[LiveSection], revision);
    if (!result.ok) {
      setError(result.error ?? 'Could not save business settings.');
      return;
    }
    setRevision(result.revision ?? state.revision + 1);
    setBaseline(JSON.stringify(draft));
    setNotice(result.persisted === false
      ? 'Applied in memory only; export a settings backup before leaving.'
      : 'Saved for this business on this device. Server sync is not connected.');
  };
  const saveDraft = () => {
    if (!dirty || !canEdit) return;
    const prior = JSON.parse(baseline) as Draft;
    const risky = ['rounding', 'lockDate', 'costAllocation', 'approval', 'prefix'];
    if (risky.some(key => JSON.stringify(prior[key]) !== JSON.stringify(draft[key]))) {
      setConfirm(true);
      return;
    }
    persist();
  };
  const renderField = (field: SettingField) => {
    const value = draft[field.key];
    const id = 'live-setting-' + section + '-' + field.key;
    const helpId = id + '-help';
    const label = personal.language === 'Bangla' ? field.bn : field.label;
    const helper = <p id={helpId} className="mt-1 text-[11px] leading-relaxed text-ink-500">
      <span lang="bn" className="font-bn">{personal.language === 'Bangla' ? field.label : field.bn}</span>
      {' · '}{field.hint}
    </p>;
    if (field.kind === 'switch') return <div key={field.key} data-settings-live-field={field.key}
      className="flex min-w-0 items-center justify-between gap-3 py-1">
      <div className="min-w-0">
        <label htmlFor={id} className="text-[13px] font-medium text-ink">{label}</label>
        {helper}
      </div>
      <SettingsToggle id={id} aria-label={field.label} aria-describedby={helpId}
        checked={Boolean(value)} disabled={!canEdit}
        onCheckedChange={next => set(field.key, next)} />
    </div>;
    return <div key={field.key} data-settings-live-field={field.key}
      className={'min-w-0 ' + (field.kind === 'textarea' ? 'sm:col-span-2' : '')}>
      <label htmlFor={id} className="block text-[13px] font-medium text-ink">{label}</label>
      <div className="mt-1.5">
        {field.kind === 'select' ? <AppSelect id={id} describedBy={helpId} label={field.label}
          value={String(value ?? '')} options={field.options ?? []} disabled={!canEdit}
          onChange={next => set(field.key, next)} /> :
          field.kind === 'textarea' ? <textarea id={id} rows={3} aria-describedby={helpId}
            value={String(value ?? '')} disabled={!canEdit}
            onChange={event => set(field.key, event.target.value)}
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-[13px] text-ink disabled:opacity-60" /> :
          <Input id={id} type={field.kind} aria-describedby={helpId} disabled={!canEdit}
            min={field.min} max={field.max}
            value={typeof value === 'number' && !Number.isFinite(value) ? '' : String(value ?? '')}
            onChange={event => set(field.key, field.kind === 'number'
              ? (event.target.value === '' ? NaN : Number(event.target.value)) : event.target.value)} />}
      </div>
      {helper}
    </div>;
  };

  const common = fields.filter(field => !field.advanced);
  const extra = fields.filter(field => field.advanced);
  const sales = draft as { customerPhone?: boolean; guardian?: boolean; address?: boolean };

  return <div data-settings-live-section={section} className="min-w-0 space-y-3">
    <SettingCard title={info.label} titleBn={info.bn} description={info.description}
      actions={extra.length ? <button type="button" aria-expanded={advanced}
        onClick={() => setAdvanced(value => !value)}
        className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
        {advanced ? 'Hide advanced options' : 'Show advanced options'}
        <ChevronDown className={'size-4 transition-transform ' + (advanced ? 'rotate-180' : '')} aria-hidden="true" />
      </button> : undefined}>
      {!canEdit && <p className="flex items-center gap-2 text-xs text-ink-500"><Lock className="size-4" />Only authorized staff can edit.</p>}
      <div className="grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2">{common.map(renderField)}</div>
      {advanced && <div data-settings-live-advanced className="space-y-3 border-t border-border pt-4">
        <p className="text-xs font-semibold text-ink-600">Advanced preferences <span lang="bn" className="font-bn font-normal">বিশেষ সেটিংস</span></p>
        <div className="grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2">{extra.map(renderField)}</div>
      </div>}
      {!advanced && extra.length > 0 && <button type="button"
        onClick={() => setAdvanced(true)} className="text-xs font-medium text-teal-700 hover:underline">
        {extra.length} more options in Advanced</button>}
      {section === 'sales' && <div data-settings-live-sales-preview className="space-y-2 border-t border-border pt-3">
        <p className="text-xs font-medium text-ink-700">POS checkout fields</p>
        <div className="flex flex-wrap gap-1.5 text-xs text-ink-600">
          {['Name', ...(sales.customerPhone ? ['Phone'] : []),
            ...(sales.guardian ? ['Guardian'] : []),
            ...(sales.address ? ['Address'] : [])].map(item =>
              <span key={item} className="rounded-md border border-border px-2 py-1">{item}</span>)}
        </div>
        <p className="text-[11px] text-ink-500">Hiding an optional field does not erase entered data. Existing credit-sale identification checks remain in force.</p>
      </div>}
      {section === 'products' && <div className="flex flex-wrap gap-3 border-t border-border pt-3 text-xs font-medium text-teal-700">
        <Link to="/app/products?view=settings&tab=units">Manage units</Link>
        <Link to="/app/products?view=settings&tab=categories">Categories</Link>
        <Link to="/app/products?view=settings&tab=brands">Brands</Link>
      </div>}
      {section === 'money' && <Link to="/app/accounts"
        className="block border-t border-border pt-3 text-xs font-medium text-teal-700">Open accounts management</Link>}
      {section === 'notifications' && <p className="border-t border-border pt-3 text-[11px] text-ink-500">
        Preferences are saved locally. Sending SMS still requires a provider and credits.</p>}
      {section === 'sales' && <p className="text-[11px] text-ink-500">
        Auto-print and global negative stock are not connected. POS stock shortages remain explicit per sale.</p>}
      <p className="text-[11px] text-ink-500">
        These controls use HisabIQ's existing business settings. Some policy fields still need backend enforcement; this screen does not grant employee permissions.
      </p>
    </SettingCard>
    <SaveBar dirty={dirty} saving={false} readOnly={!canEdit}
      error={error || undefined} status={notice || 'Business settings · saved locally'}
      dirtyLabel="Unsaved business setting changes" onSave={saveDraft}
      onDiscard={discard} onRestore={restore} saveLabel="Save changes" />
    <SettingsDialog title="Review business setting changes"
      description="Rounding, posting locks and approval policies can affect future records. Existing records will not be rewritten."
      open={confirm} onClose={() => setConfirm(false)}>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => setConfirm(false)}>Review again</Button>
        <Button onClick={persist}>Confirm save</Button>
      </div>
    </SettingsDialog>
  </div>;
}
