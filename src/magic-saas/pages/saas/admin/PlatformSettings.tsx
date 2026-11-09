import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button, Field, Input, Select } from '../../../prototype/Ui';
import { Switch } from '../../../components/Switch';
import { useSaas } from '../../../contexts/SaasContext';
import { Denied, PageTitle } from '../../../components/saas/SaasBits';
import { SettingCard } from '../../../components/settings/SettingCard';
import type { PlatformSettings as Settings } from '../../../types/saas';

export function PlatformSettings() {
  const saas = useSaas();
  const [draft, setDraft] = useState<Settings>(saas.state.settings);
  const [error, setError] = useState('');
  useEffect(() => setDraft(saas.state.settings), [saas.state.settings]);
  if (!saas.can('settings.view')) return <Denied what="platform settings" role={saas.staff.label} />;
  const canEdit = saas.canFor('settings.edit', null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saas.state.settings);
  const setAcc = (id: string, patch: Partial<Settings['collectionAccounts'][number]>) => setDraft({ ...draft, collectionAccounts: draft.collectionAccounts.map((a) => (a.id === id ? { ...a, ...patch } : a)) });

  return (
    <div className="space-y-4">
      <PageTitle title="Platform settings" bn="প্ল্যাটফর্ম সেটিংস" description="Rules that apply to every business. Changes are audited." />
      <SettingCard title="Billing rules" titleBn="বিলিং নিয়ম">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Timezone"><Input value={draft.timezone} onChange={() => undefined} disabled /></Field>
          <Field label="Currency"><Input value={draft.currency} onChange={() => undefined} disabled /></Field>
          <Field label="Grace period (days)" hint="After a plan ends, before falling back to Free."><Input type="number" min={0} value={draft.graceDays} onChange={(v) => setDraft({ ...draft, graceDays: Number(v) })} disabled={!canEdit} /></Field>
        </div>
        <label className="flex items-start justify-between gap-4">
          <span><span className="block text-[13px] font-medium text-ink">Return credits for failed SMS</span><span className="text-xs text-ink-500">Reserved credits go back to the business when every retry fails.</span></span>
          <Switch checked={draft.releaseOnFailedSms} onCheckedChange={(v: boolean) => setDraft({ ...draft, releaseOnFailedSms: v })} disabled={!canEdit} aria-label="Return credits for failed SMS" />
        </label>
      </SettingCard>
      <SettingCard title="Collection accounts" titleBn="কালেকশন অ্যাকাউন্ট" description="Where owners send money. Shown on every invoice; statements are checked against these numbers.">
        <div className="space-y-2">
          {draft.collectionAccounts.map((a) => (
            <div key={a.id} className="grid items-end gap-2 sm:grid-cols-[120px_1fr_1fr_auto]">
              <Field label="Method"><Select value={a.method} onChange={() => undefined} options={[a.method]} disabled /></Field>
              <Field label="Label"><Input value={a.label} onChange={(label) => setAcc(a.id, { label })} disabled={!canEdit} /></Field>
              <Field label="Number"><Input value={a.number} onChange={(number) => setAcc(a.id, { number })} disabled={!canEdit} /></Field>
              <label className="flex h-10 items-center gap-2 text-xs"><Switch checked={a.active} onCheckedChange={(v: boolean) => setAcc(a.id, { active: v })} disabled={!canEdit} aria-label={`${a.label} active`} />Active</label>
            </div>
          ))}
        </div>
      </SettingCard>
      {canEdit && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {error ? <span role="alert" className="mr-auto text-xs text-danger">{error}</span> : dirty && <span className="mr-auto text-xs font-medium text-warning">Unsaved changes</span>}
          <Button disabled={!dirty} onClick={() => { setDraft(saas.state.settings); setError(''); }}>Discard</Button>
          <Button kind="primary" disabled={!dirty} onClick={() => { const r = saas.updatePlatformSettings(draft); if (!r.ok) return setError(r.message); toast.success(r.message); setError(''); }}>Save</Button>
          <Button kind="ghost" onClick={() => { const r = saas.reset(); r.ok ? toast.success(r.message) : toast.error(r.message); }}>Reset demo data</Button>
        </div>
      )}
      {!canEdit && <p className="text-xs text-ink-500">View only — only all-business Super Admins change platform settings.</p>}
    </div>
  );
}
