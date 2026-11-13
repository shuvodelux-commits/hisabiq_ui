import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Eye, Lock } from 'lucide-react';
import { SettingsToggle } from './SettingsToggle';
import { AppSelect } from '../../components/AppSelect';
import { Input, SettingCard, SettingsField } from '../ui';
import { SaveBar } from './SaveBar';
import { Button, Modal } from './invoice/Ui';
import { sourceSettingsFields, type SettingField } from './sourceFields';
import {useTenantSettings} from '../TenantSettingsProvider';
import {canManage} from '../model';
import {useUiCopy} from '../../i18n/useUiCopy';
import { useMagicSettingsState } from './settingsBridge';
import { useSession } from '../../integration/SessionProvider.tsx';
import { updateBusinessProfile } from '../../integration/settings-team.ts';
import { ApiError } from '../../integration/errors.ts';
import { saveCashEnabled } from '../../services/cashSessionApi.ts';
import type { SettingsSection } from './settingsSections';

type Value = string | number | boolean;
type Draft = Record<string, Value>;

// Same plain-language accounting warnings as the pinned Magic Patterns source.
// They describe the effects of a hypothetical save; Phase 1 never applies them.
const riskyPreviewChanges: Record<string, (draft: Draft) => string> = {
  lockDate: draft => draft.lockDate
    ? `Nobody — including you — will be able to edit sales, purchases or payments dated on or before ${draft.lockDate}.`
    : 'Old entries will be editable again.',
  invoicePrefix: draft => `Old invoices keep their numbers. New invoices will start at ${draft.invoicePrefix}-000001.`,
  costMethod: () => 'Stock you already have keeps its cost. Only new purchases use the new method, so profit reports may shift slightly.',
};
type Props = {
  section: SettingsSection;
  canEdit: boolean;
  onDirtyChange: (dirty: boolean) => void;
  footer?: ReactNode;
  renderPreview?: (draft: Draft) => ReactNode;
};

/**
 * Source-faithful Magic Patterns GeneralSettingsSection presentation.
 *
 * Preview fields retain their UI-local drafts. MOD-001 T01-W/P1 enables only
 * the verified business-name PATCH with the unchanged server timezone.
 * Retains every source field and interactive control, including those that do
 * not have an equivalent in the old HisabIQ settings schema.
 */
export function GeneralSettingsSection({
  section, canEdit, onDirtyChange, footer, renderPreview,
}: Props) {
  const bridge = useMagicSettingsState();
  const {state:tenant,currentAuthority,save}=useTenantSettings();
  const {text}=useUiCopy();
  const {mode, snapshot}=useSession();
  const [cashFeedback,setCashFeedback]=useState('');
  const [cashSaving, setCashSaving] = useState(false);
  const [cashNeedsReview, setCashNeedsReview] = useState(false);
  const cashPendingWrite = useRef<AbortController | null>(null);
  const all = sourceSettingsFields[section.id] ?? [];
  const [advanced, setAdvanced] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => initialDraft(all, bridge.state.settings));
  const [baseline] = useState<Draft>(() => initialDraft(all, bridge.state.settings));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');

  const [reviewWarnings, setReviewWarnings] = useState<string[] | null>(null);
  const [liveNameDraft, setLiveNameDraft] = useState<{
    identity: string; original: string; value: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const pendingWrite = useRef<AbortController | null>(null);
  const identity = mode === 'connected' && snapshot.status === 'authenticated'
    ? `${snapshot.tenantId}:${snapshot.userId}:${snapshot.epoch}:${snapshot.accessToken}`
    : `${mode}:${snapshot.status}:${snapshot.epoch}`;
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const verified = bridge.server.status === 'ready' ? bridge.server.data : null;
  const serverCashValue = verified?.values.cash_session_enabled;
  const cashValueKnown = serverCashValue === 'on' || serverCashValue === 'off';
  const canWriteCash = bridge.connected && section.id === 'finance' && snapshot.status === 'authenticated' &&
    cashValueKnown && snapshot.permissions.includes('settings.setting.view') &&
    snapshot.permissions.includes('settings.module.toggle');
  const canWriteBusiness = bridge.connected && section.id === 'business' && verified !== null &&
    snapshot.status === 'authenticated' &&
    snapshot.permissions.includes('settings.setting.view') &&
    snapshot.permissions.includes('settings.setting.edit');
  // Never let a draft from a previous tenant, user, or token epoch appear as
  // this session's data. Do not initialize from the browser demo store.
  const liveName = verified === null ? '' :
    liveNameDraft?.identity === identity && liveNameDraft.original === verified.businessName
      ? liveNameDraft.value : verified.businessName;
  const liveDirty = canWriteBusiness && verified !== null &&
    liveName !== verified.businessName;
  const readOnlyDraft: Draft = Object.fromEntries(all.map(f => [
    f.key,
    f.key === 'businessName' ? liveName : f.kind === 'checkbox' ? false : '',
  ]));
  const shown = bridge.connected ? readOnlyDraft : draft;
  const fields = all.filter(f => advanced || !f.advanced);
  const hiddenCount = all.length - fields.length;
  const changed = bridge.connected ? [] : all.filter(f => draft[f.key] !== baseline[f.key]);
  const dirty = bridge.connected ? liveDirty : changed.length > 0;

  useEffect(() => {
    // The previous identity's in-flight write is no longer authorized.
    setSaving(false);
    setCashSaving(false);
    setCashNeedsReview(false);
    setCashFeedback('');
    setFeedback('');
    setErrors({});
    return () => {
      pendingWrite.current?.abort();
      cashPendingWrite.current?.abort();
    };
  }, [identity]);

  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);


  const set = (key: string, value: Value) => {
    setReviewWarnings(null);
    if (bridge.connected) {
      if (!canWriteBusiness || key !== 'businessName' || verified === null || saving) return;
      setLiveNameDraft({ identity, original: verified.businessName, value: String(value) });
    } else {
      setDraft(prev => ({ ...prev, [key]: value }));
    }
    setFeedback('');
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const restoreDefaults = () => {
    setReviewWarnings(null);
    if (bridge.connected) {
      setLiveNameDraft(null);
      setErrors({});
      setFeedback('Verified server value restored. No settings were changed.');
      return;
    }
    setDraft(initialDraft(all, {}));
    setErrors({});
    setFeedback('Source defaults loaded into this preview. They have not changed business settings.');
  };
  const discard = () => {
    setReviewWarnings(null);
    if (bridge.connected) {
      setLiveNameDraft(null);
      setErrors({});
      setFeedback('Unsaved change discarded; server settings were not changed.');
      return;
    }
    setDraft({ ...baseline });
    setErrors({});
    setFeedback('Preview changes discarded; business settings were never changed.');
  };

  const saveBusiness = async () => {
    if (!canWriteBusiness || verified === null || snapshot.status !== 'authenticated' ||
        !liveDirty || saving || cashSaving || cashPendingWrite.current !== null ||
        pendingWrite.current !== null) return;
    const name = liveName.trim();
    if (name.length < 2 || name.length > 120) {
      setErrors({ businessName: 'Enter a business name between 2 and 120 characters.' });
      return;
    }
    const controller = new AbortController();
    pendingWrite.current = controller;
    const requestIdentity = identity;
    const token = snapshot.accessToken;
    setSaving(true);
    setFeedback('');
    setErrors({});
    try {
      // One PATCH only. Never retry unknown outcomes or invent a revision/CAS.
      const response = await updateBusinessProfile(token, verified, name, controller.signal);
      if (controller.signal.aborted || identityRef.current !== requestIdentity) return;
      if (!bridge.server.acceptWrite(response.data)) return;
      setLiveNameDraft(null);
      setFeedback('Business name saved and verified by the server. · ব্যবসার নাম সার্ভারে সংরক্ষিত হয়েছে।');
    } catch (error: unknown) {
      if (controller.signal.aborted || identityRef.current !== requestIdentity) return;
      const denied = error instanceof ApiError && (error.status === 401 || error.status === 403);
      setFeedback(denied
        ? 'Permission denied or session expired. Your unsaved business name is retained. · অনুমতি নেই; খসড়া রাখা হয়েছে।'
        : 'Save not confirmed. Keep this draft and verify the server value before retrying. · সংরক্ষণ নিশ্চিত নয়; যাচাই করে আবার চেষ্টা করুন।');
    } finally {
      if (pendingWrite.current === controller) pendingWrite.current = null;
      if (identityRef.current === requestIdentity) setSaving(false);
    }
  };

  /** One server-authoritative cash setting write. Never simulate success in preview. */
  const saveCash = async (enabled: boolean) => {
    if (!canWriteCash || verified === null || snapshot.status !== 'authenticated' ||
        !cashValueKnown || cashSaving || cashNeedsReview ||
        cashPendingWrite.current !== null || pendingWrite.current !== null || saving ||
        (serverCashValue === 'on') === enabled) return;
    const controller = new AbortController();
    cashPendingWrite.current = controller;
    const requestIdentity = identity;
    const token = snapshot.accessToken;
    setCashSaving(true);
    setCashFeedback('');
    try {
      // No automatic retry: settings POST has no durable idempotency operation ID.
      const confirmed = await saveCashEnabled(token, enabled, controller.signal);
      if (controller.signal.aborted || identityRef.current !== requestIdentity) return;
      if (confirmed.values.cash_session_enabled !== (enabled ? 'on' : 'off')) {
        setCashNeedsReview(true);
        setCashFeedback(text(
          'Save not confirmed. Reload verified settings before changing cash sessions again.',
          'সংরক্ষণ নিশ্চিত নয়। আবার পরিবর্তনের আগে সার্ভারের সেটিংস নতুন করে দেখুন।',
        ));
        return;
      }
      // The response is values-only; preserve verified profile and catalogue.
      if (!bridge.server.acceptWrite({
        ...verified, values: {...verified.values, ...confirmed.values},
      })) return;
      setCashFeedback(text(
        'Cash session setting confirmed by the server.',
        'ক্যাশ সেশন সেটিং সার্ভার থেকে নিশ্চিত হয়েছে।',
      ));
    } catch (error: unknown) {
      if (controller.signal.aborted || identityRef.current !== requestIdentity) return;
      const denied = error instanceof ApiError && error.kind === 'http' &&
        [401, 403].includes(error.status ?? 0);
      const refused = error instanceof ApiError && error.kind === 'http' &&
        [400, 409, 422].includes(error.status ?? 0);
      if (!denied && !refused) setCashNeedsReview(true);
      setCashFeedback(denied ? text(
        'Permission denied or session expired; the verified setting was not changed here.',
        'অনুমতি নেই অথবা সেশন শেষ। এখানে যাচাইকৃত সেটিং পরিবর্তন হয়নি।',
      ) : refused ? text(
        enabled
          ? 'Server refused to turn cash sessions ON. Your previous setting is retained.'
          : 'Server refused to turn cash sessions OFF. Close or reconcile the open cash day first.',
        enabled
          ? 'সার্ভার ক্যাশ সেশন চালুর অনুরোধ প্রত্যাখ্যান করেছে। আগের সেটিং রয়ে গেছে।'
          : 'সার্ভার ক্যাশ সেশন বন্ধ করতে দেয়নি। আগে চালু ক্যাশ দিনটি মেলান।',
      ) : text(
        'Save not confirmed. Reload verified settings before changing cash sessions again.',
        'সংরক্ষণ নিশ্চিত নয়। আবার পরিবর্তনের আগে সার্ভারের সেটিংস নতুন করে দেখুন।',
      ));
    } finally {
      if (cashPendingWrite.current === controller) cashPendingWrite.current = null;
      if (identityRef.current === requestIdentity) setCashSaving(false);
    }
  };

  const reviewSave = () => {
    if (bridge.connected) {
      void saveBusiness();
      return;
    }
    const next: Record<string, string> = {};
    for (const f of all) {
      const v = draft[f.key];
      if (f.kind === 'number' && (!Number.isFinite(Number(v)) ||
        (f.min !== undefined && Number(v) < f.min) ||
        (f.max !== undefined && Number(v) > f.max))) {
        next[f.key] = `Enter a number from ${f.min ?? 0} to ${f.max ?? 'the allowed maximum'}.`;
      }
      if (f.key === 'businessName' && !String(v).trim()) next[f.key] = 'Enter the business name.';
      if (f.key === 'phone' && !/^01[3-9]\d{8}$/.test(String(v).replace(/[\s-]/g, '')))
        next[f.key] = 'Enter an 11-digit Bangladeshi mobile number.';
      if (f.key === 'invoicePrefix' && !/^[A-Z0-9-]{2,12}$/.test(String(v)))
        next[f.key] = 'Use 2–12 capital letters, numbers or hyphens.';
      if (f.key === 'lockDate' && v && !/^\d{4}-\d{2}-\d{2}$/.test(String(v)))
        next[f.key] = 'Write the date as YYYY-MM-DD, e.g. 2026-10-31.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    const warnings = changed
      .map(f => riskyPreviewChanges[f.key]?.(draft))
      .filter((warning): warning is string => Boolean(warning));
    if (warnings.length > 0) {
      setFeedback('');
      setReviewWarnings(warnings);
      return;
    }
    // No fake "Saved" toast or browser-side fake persistence.
    setFeedback('UI preview only. Saving to the business will be connected after the full Magic UI is approved. No settings were saved.');
  };

  const helper = (field: SettingField, error?: string) => (
    <span className="mt-1 block text-xs leading-relaxed">
      {field.bn && <span className="font-bn text-[11px] text-ink-400">{field.bn} · </span>}
      <span className={error ? 'text-danger' : 'text-ink-500'} role={error ? 'alert' : undefined}>
        {error || field.helper}
      </span>
      {!bridge.connected && field.seenIn && draft[field.key] !== baseline[field.key] && (
        <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-teal-700">
          <Eye className="size-3" aria-hidden="true" />
          Where you'll see this: {field.seenIn} (after reconnection)
        </span>
      )}
    </span>
  );

  const renderField = (field: SettingField) => {
    const id = `magic-setting-${section.id}-${field.key}`;
    const error = errors[field.key];
    const disabled = bridge.connected
      ? !(canWriteBusiness && field.key === 'businessName') || saving
      : !canEdit;

    if (section.id === 'finance' && field.key === 'cashSession') return (
      <div key={field.key} className="flex min-w-0 items-start justify-between gap-3 sm:col-span-2">
        <div className="min-w-0">
          <label htmlFor={id} className="text-[13px] font-medium text-ink">
            {text('Count the cash drawer at open and close','খোলা ও বন্ধের সময় ড্রয়ারের ক্যাশ গুনুন')}
          </label>
          <p className="mt-1 text-xs text-ink-500">
            {bridge.connected
              ? !cashValueKnown
                ? text('Verified server setting is unavailable. This switch is disabled until the value can be read.',
                    'সার্ভারের যাচাইকৃত সেটিং পাওয়া যায়নি। মান জানা না পর্যন্ত সুইচ বন্ধ থাকবে।')
                : cashNeedsReview
                  ? text('Save status is uncertain. Reload verified settings before another change.',
                      'সংরক্ষণের অবস্থা নিশ্চিত নয়। আবার পরিবর্তনের আগে সার্ভারের সেটিংস দেখুন।')
                  : text('Verified business setting. A change applies only after server confirmation.',
                      'সার্ভারের যাচাইকৃত সেটিং। সার্ভার নিশ্চিত করলেই পরিবর্তন কার্যকর হবে।')
              : text('Live browser setting for this business. Controls Start, count and history; no backend posting.',
                  'এই ব্যবসার ব্রাউজার সেটিং। শুরু, গণনা ও ইতিহাস নিয়ন্ত্রণ করে; সার্ভারে লেনদেন হয় না।')}
          </p>
          {cashSaving && <p role="status" className="mt-1 text-xs text-ink-500">
            {text('Confirming with the server…', 'সার্ভার থেকে নিশ্চিত করা হচ্ছে…')}
          </p>}
          {cashFeedback && <p role="status" aria-live="polite" className="mt-1 text-xs text-ink-500">
            {cashFeedback}
          </p>}
        </div>
        <SettingsToggle
          id={id}
          aria-label={text('Enable cash sessions','ক্যাশ সেশন চালু করুন')}
          checked={bridge.connected ? serverCashValue === 'on' : tenant.sections.money.cashSession}
          disabled={bridge.connected
            ? !canWriteCash || cashSaving || cashNeedsReview || saving ||
              cashPendingWrite.current !== null || pendingWrite.current !== null
            : !canEdit}
          onCheckedChange={value => {
            if (bridge.connected) { void saveCash(value); return; }
            const current=currentAuthority();
            if(!canManage(current.state,current.actorId,'money')){
              setCashFeedback(text('Permission denied.','অনুমতি নেই.'));
              return;
            }
            const result=save('money',{...current.state.sections.money,cashSession:value},current.state.revision);
            setCashFeedback(result.ok
              ? text('Cash session setting saved in this browser.','ক্যাশ সেশন সেটিং এই ব্রাউজারে সংরক্ষিত।')
              : result.error??text('Could not save.','সংরক্ষণ হয়নি।'));
          }}
        />
      </div>
    );
    if (field.kind === 'checkbox') {
      return (
        <div key={field.key} className={`flex min-w-0 items-start justify-between gap-3 ${field.wide ? 'sm:col-span-2' : ''}`}>
          <div className="min-w-0 pt-1">
            <label htmlFor={id} className={`block text-[13px] font-medium text-ink ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              {field.label}
              {field.advanced && <span className="ml-1.5 rounded bg-ink-50 px-1 py-0.5 text-[10px] font-normal text-ink-500">Advanced</span>}
            </label>
            {helper(field, error)}
          </div>
          <SettingsToggle
            id={id}
            checked={Boolean(shown[field.key])}
            onCheckedChange={value => set(field.key, value)}
            disabled={disabled}
            aria-label={field.label}
          />
        </div>
      );
    }
    return (
      <div key={field.key} className={field.wide ? 'sm:col-span-2' : ''}>
        <SettingsField label={field.label} bn={field.bn ?? field.label} language="English">
          {(generatedId, descriptionId) => field.kind === 'select' ? (
            <AppSelect id={generatedId} describedBy={descriptionId} label={field.label}
              value={String(shown[field.key] ?? '')}
              onChange={v => set(field.key, v)} options={field.options ?? []} disabled={disabled} />
          ) : field.kind === 'textarea' ? (
            <textarea id={generatedId} aria-label={field.label} aria-describedby={descriptionId}
              rows={3} className="block w-full rounded-md border border-input bg-card px-3 py-2 text-[13px] text-ink disabled:opacity-70"
              value={String(shown[field.key] ?? '')} onChange={e => set(field.key, e.target.value)}
              disabled={disabled} />
          ) : (
            <Input id={generatedId} aria-label={field.label} aria-describedby={descriptionId}
              type={field.kind === 'number' ? 'number' : 'text'}
              min={field.min} max={field.max}
              value={String(shown[field.key] ?? '')}
              onChange={e => set(field.key,
                field.kind === 'number' ? (e.target.value === '' ? NaN : Number(e.target.value)) :
                field.key === 'invoicePrefix' ? e.target.value.toUpperCase() : e.target.value)}
              disabled={disabled} />
          )}
        </SettingsField>
        {helper(field, error)}
      </div>
    );
  };
  const hasAdvanced = all.some(f => f.advanced);

  return (
    <div className="min-w-0 space-y-3" data-settings-magic-general={section.id}>
      {bridge.connected && <p role="status" aria-live="polite" className="rounded-md border border-ink-100 bg-ink-50 px-3 py-2 text-xs text-ink-600">
        {bridge.server.status === 'ready'
          ? `Verified live settings: ${bridge.server.data.businessName} · ${bridge.server.data.timezone}. ${canWriteBusiness ? 'Business name can be saved with your server permission.' : 'Business profile is read-only for this account.'} ${canWriteCash ? 'The cash-session switch uses verified server settings; other controls remain read-only.' : 'All other controls remain read-only.'} · ব্যবসার তথ্য সার্ভারে যাচাই হয়েছে; অন্য নিয়ন্ত্রণগুলো অপরিবর্তিত।`
          : bridge.server.status === 'loading' ? 'Loading verified business settings… · সার্ভার সেটিংস লোড হচ্ছে…'
          : bridge.server.status === 'denied' ? 'You do not have permission to view live settings. · সার্ভার সেটিংস দেখার অনুমতি নেই।'
          : bridge.server.status === 'locked' ? 'Session locked. Unlock before viewing settings. · সেটিংস দেখতে সেশন আনলক করুন।'
          : 'Live settings are unavailable. No preview business data is substituted. · লাইভ সেটিংস পাওয়া যায়নি; নমুনা ডেটা দেখানো হয়নি।'}
      </p>}
      <div className={renderPreview ? 'grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]' : ''}>
        <SettingCard
          title={section.label}
          titleBn={section.bn}
          description={section.desc}
          actions={hasAdvanced ? (
            <button
              type="button"
              data-settings-advanced-toggle
              aria-expanded={advanced}
              onClick={() => setAdvanced(value => !value)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-ink-600 hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              {advanced ? 'Hide advanced options' : 'Show advanced options'}
              <ChevronDown className={`size-3.5 transition-transform ${advanced ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          ) : undefined}
        >
          {!(bridge.connected ? (canWriteBusiness || canWriteCash) : canEdit) && (
            <p className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
              <Lock className="size-3.5 shrink-0" aria-hidden="true" />
              Only an authorized business user can change these.
            </p>
          )}
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">{fields.map(renderField)}</div>
          {hiddenCount > 0 && (
            <button type="button" onClick={() => setAdvanced(true)}
              className="text-xs font-medium text-teal-700 hover:underline">
              {hiddenCount} more option{hiddenCount === 1 ? '' : 's'} in Advanced
            </button>
          )}
          {footer}
        </SettingCard>
        {renderPreview && <aside className="min-w-0 xl:sticky xl:top-20 xl:self-start">{renderPreview(shown)}</aside>}
      </div>

      <SaveBar
        dirty={dirty} saving={saving}
        error={bridge.connected
          ? (errors.businessName ? 'Fix the business-name validation error before saving.' : undefined)
          : (Object.keys(errors).length ? `Fix ${Object.keys(errors).length} field(s) before previewing.` : undefined)}
        status={bridge.connected
          ? feedback || (canWriteBusiness
            ? 'Verified server settings loaded. Only the business name is editable.'
            : 'Live settings are read-only or unavailable; no browser preview is a server save.')
          : feedback || 'UI preview · business settings are not changed.'}
        dirtyLabel={bridge.connected
          ? feedback || 'Business name changed but not saved to the server.'
          : feedback || `${changed.length} unsaved UI preview change(s) · not applied to business`}
        onSave={reviewSave} onDiscard={discard} onRestore={restoreDefaults}
        restoreLabel={bridge.connected ? 'Restore server value' : 'Restore defaults'}
        saveLabel="Save"
        readOnly={bridge.connected ? !canWriteBusiness : !canEdit}
      />
      {reviewWarnings && (
        <Modal
          title="Before you save"
          onClose={() => setReviewWarnings(null)}
          footer={
            <>
              <Button onClick={() => setReviewWarnings(null)}>Go back</Button>
              <Button kind="primary" onClick={() => {
                setReviewWarnings(null);
                setFeedback('Preview confirmed. No business settings, historical records or stock costs were saved or changed.');
              }}>Continue preview (no save)</Button>
            </>
          }
        >
          <div className="space-y-3 text-[13px]">
            <p role="note" className="rounded-lg bg-teal-50 px-3 py-2 text-teal-800">
              UI preview only. These are the original warnings for what saving would do. This confirmation will not apply any changes.
            </p>
            <ul data-settings-risk-warnings className="list-disc space-y-2 pl-5 text-ink-700">
              {reviewWarnings.map(warning => <li key={warning}>{warning}</li>)}
            </ul>
          </div>
        </Modal>
      )}
    </div>
  );
}

function initialDraft(fields: SettingField[], bridge: Record<string, unknown>): Draft {
  const defaults: Record<string, Value> = {
    businessName: 'Nawabpur Hardware House',
    phone: '01711-234567',
    address: 'Nawabpur Road, Dhaka',
    currency: 'BDT',
    invoicePrefix: 'INV',
    language: 'English + Bangla',
    dateFormat: 'DD/MM/YYYY',
    lockMinutes: 30,
    trustedDays: 90,
    alertTime: '09:00',
    smsSender: 'HisabIQ',
    dueLabel: 'Baki',
    receivedLabel: 'Joma',
    advanceLabel: 'Advance',
  };
  return Object.fromEntries(fields.map(f => {
    const live = bridge[f.key];
    const fallback = defaults[f.key] ??
      (f.kind === 'checkbox' ? false : f.kind === 'number' ? (f.min ?? 0) :
        f.kind === 'select' ? (f.options?.[0] ?? '') : '');
    const value = typeof live === 'string' || typeof live === 'number' || typeof live === 'boolean'
      ? live : fallback;
    // Select options must stay within the original Magic source list.
    return [f.key, f.options?.length && !f.options.includes(String(value)) ? f.options[0] : value];
  }));
}
