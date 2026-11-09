import React, { useEffect, useState } from 'react';
import { Lock, Pencil, Plus } from 'lucide-react';
import { RowActions } from '../RowActions';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select } from '../../../prototype/Ui';
import { Switch } from '../../Switch';
import { useSaas } from '../../../contexts/SaasContext';
import { SettingCard } from '../../settings/SettingCard';
import { Badge, td, th, thAction, tdAction } from '../SaasBits';
import { fmtDateTime, sid } from '../../../utils/saas';
import type { Member, Tenant, TenantSettings } from '../../../types/saas';

export function SettingsTab({ tenant }: { tenant: Tenant }) {
  const saas = useSaas();
  const canEdit = saas.canFor('tenants.edit', tenant.id);
  const [draft, setDraft] = useState<TenantSettings>(tenant.settings);
  const [error, setError] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [memberError, setMemberError] = useState('');
  useEffect(() => setDraft(tenant.settings), [tenant.settings]);

  const dirty = (Object.keys(draft) as (keyof TenantSettings)[]).some((k) => draft[k] !== tenant.settings[k]);
  const set = <K extends keyof TenantSettings>(k: K, v: TenantSettings[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setError('');
  };
  const save = () => {
    if (!/^[A-Z0-9-]{2,12}$/.test(draft.invoicePrefix)) return setError('Invoice prefix: 2–12 capital letters, numbers or hyphens.');
    if (!(draft.lockMinutes >= 1 && draft.lockMinutes <= 180)) return setError('Screen lock: 1–180 minutes.');
    const r = saas.updateSettings(tenant.id, draft);
    r.ok ? toast.success(r.message, { description: 'Recorded in History.' }) : setError(r.message);
  };

  return (
    <div className="space-y-3">
      {!canEdit && (
        <p className="flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-xs text-ink-600">
          <Lock className="size-3.5" aria-hidden="true" /> View only. Your role ({saas.staff.label}) can’t change business settings.
        </p>
      )}
      <SettingCard title="Business settings" titleBn="ব্যবসার সেটিংস" description="Changes here are made by HisabIQ staff on the owner’s request and are audited. Use Support access when the owner must consent.">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Invoice prefix"><Input value={draft.invoicePrefix} onChange={(v) => set('invoicePrefix', v.toUpperCase())} disabled={!canEdit} /></Field>
          <Field label="Language"><Select value={draft.language} onChange={(v) => set('language', v as TenantSettings['language'])} options={['English + Bangla', 'English', 'Bangla']} disabled={!canEdit} /></Field>
          <Field label="Screen lock (minutes)"><Input type="number" min={1} value={draft.lockMinutes} onChange={(v) => set('lockMinutes', Number(v))} disabled={!canEdit} /></Field>
          <Field label="SMS sender name"><Input value={draft.smsSender || 'Not approved'} onChange={() => undefined} disabled /></Field>
        </div>
        <div className="divide-y divide-ink-100 rounded-lg border border-ink-100">
          <ToggleRow label="Allow selling below zero stock" helper="Stock can show negative until purchases are entered." checked={draft.allowNegativeStock} onChange={(v) => set('allowNegativeStock', v)} disabled={!canEdit} />
          <ToggleRow label="Automatic due reminders" helper="Uses SMS credits. Sent at 10:00 to customers with dues over 7 days." checked={draft.dueReminders} onChange={(v) => set('dueReminders', v)} disabled={!canEdit} />
        </div>
        <p className="text-[11px] text-ink-500">Sender names are approved in SMS › Sender names, not edited here.</p>
        {canEdit && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-100 pt-3">
            {error ? <span role="alert" className="mr-auto text-xs text-danger">{error}</span> : dirty && <span className="mr-auto text-xs font-medium text-warning">Unsaved changes</span>}
            <Button disabled={!dirty} onClick={() => { setDraft(tenant.settings); setError(''); }}>Discard</Button>
            <Button kind="primary" disabled={!dirty} onClick={save}>Save</Button>
          </div>
        )}
      </SettingCard>

      <SettingCard
        title="Members & roles"
        titleBn="সদস্য ও ভূমিকা"
        description={`${tenant.members.filter((m) => m.status === 'Active').length} of ${tenant.userLimit} active users allowed by the plan.`}
        bodyClassName=""
        actions={canEdit ? <Button onClick={() => { setMemberError(''); setMember({ id: sid('M'), name: '', role: 'Sales', phone: '', status: 'Active', lastSeen: '' }); }}><Plus className="size-4" />Add member</Button> : undefined}
      >
        <div className="overflow-x-auto">
          <table data-erp-table className="w-full text-[13px]">
            <thead><tr className="border-b border-ink-100"><th className={th}>Member</th><th className={th}>Role</th><th className={`${th} hidden sm:table-cell`}>Last seen</th><th className={th}>Status</th><th className={thAction}>Action</th></tr></thead>
            <tbody>
              {tenant.members.map((m) => (
                <tr key={m.id} className="border-b border-ink-100 last:border-0">
                  <td className={td}><span className="font-medium">{m.name}</span><span className="block text-[11px] text-ink-500">{m.phone}</span></td>
                  <td className={td}>{m.role}</td>
                  <td className={`${td} hidden text-ink-500 sm:table-cell`}>{m.lastSeen ? fmtDateTime(m.lastSeen) : 'Never'}</td>
                  <td className={td}><Badge tone={m.status === 'Active' ? 'success' : 'neutral'} dot>{m.status === 'Active' ? 'Active' : 'Paused'}</Badge></td>
                  <td className={tdAction}>
                    <RowActions label={`Actions for ${m.name}`} items={[{ label: 'Edit member', icon: Pencil, hidden: !canEdit, onSelect: () => { setMemberError(''); setMember({ ...m }); } }]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">Roles decide what each person sees. Package benefits never override a role — Sales staff still can’t see cost or profit.</p>
      </SettingCard>

      {member && (
        <Modal
          title={tenant.members.some((m) => m.id === member.id) ? `Edit ${member.name}` : 'Add member'}
          onClose={() => setMember(null)}
          footer={<><Button onClick={() => setMember(null)}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.saveMember(tenant.id, member); if (!r.ok) return setMemberError(r.message); toast.success(r.message); setMember(null); }}>Save</Button></>}
        >
          <div className="space-y-3 text-[13px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name"><Input value={member.name} onChange={(name) => setMember({ ...member, name })} /></Field>
              <Field label="Mobile"><Input value={member.phone} onChange={(phone) => setMember({ ...member, phone })} placeholder="01711-234567" /></Field>
              <Field label="Role"><Select value={member.role} onChange={(role) => setMember({ ...member, role: role as Member['role'] })} options={['Owner', 'Manager', 'Sales', 'Viewer']} /></Field>
              <Field label="Status"><Select value={member.status} onChange={(status) => setMember({ ...member, status: status as Member['status'] })} options={[{ value: 'Active', label: 'Active' }, { value: 'Disabled', label: 'Paused (can’t sign in)' }]} /></Field>
            </div>
            {memberError && <p role="alert" className="text-xs text-danger">{memberError}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}

function ToggleRow({ label, helper, checked, onChange, disabled }: { label: string; helper: string; checked: boolean; onChange: (v: boolean) => void; disabled: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-500">{helper}</p>
      </div>
      <div className="flex h-5 items-center">
        <Switch checked={checked} onCheckedChange={(v: boolean) => onChange(v)} disabled={disabled} aria-label={label} />
      </div>
    </div>
  );
}
