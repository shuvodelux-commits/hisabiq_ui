/** Magic Patterns TeamSettings source UI (artifact 238f01b4), adapted only for local preview data. */
import React, { useEffect, useState } from 'react';
import { Lock, Plus } from 'lucide-react';
import { AppSelect } from '../../components/AppSelect';
import { SettingCard } from '../ui';
import { Button, Modal } from './invoice/Ui';
import { useTenantSettings } from '../TenantSettingsProvider';

/** Phase 1 design data is local-only. Server-side authorization remains unchanged. */
type Staff = { id: string; name: string; role: string; active: boolean };
function Input({ value, onChange, placeholder = '' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder}
    className="ref-control block h-9 w-full rounded-md border border-input bg-card px-3 text-[13px] text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20" />;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block min-w-0 text-[12px] font-medium text-ink-700">{label}
    <span className="mt-1.5 block font-normal">{children}</span></label>;
}
function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return <AppSelect label="Role" value={value} options={options} onChange={onChange} className="w-full" />;
}
function Checkbox({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return <input type="checkbox" aria-label="Active" className="size-4 rounded border-input accent-teal-600"
    checked={checked} onChange={event => onCheckedChange(event.target.checked)} />;
}
function Tag({ children, color }: { children: React.ReactNode; color: 'success' | 'neutral' }) {
  return <span data-table-badge className={'inline-flex rounded-md px-2 py-1 text-[11px] font-medium ' +
    (color === 'success' ? 'bg-success-bg text-success' : 'bg-ink-50 text-ink-600')}>{children}</span>;
}
function localPreviewStaff(roles: { id: string; name: string }[], employees: { id: string; name: string; roleIds: string[]; active: boolean }[]): Staff[] {
  return employees.map(person => {
    const role = person.roleIds[0] || 'viewer';
    const display = role === 'owner' ? 'Owner' : role === 'manager' ? 'Manager' :
      role === 'cashier' ? 'Sales' : role === 'viewer' ? 'Viewer' :
      (roles.find(item => item.id === role)?.name ?? 'Viewer');
    return { id: person.id, name: person.name, role: display, active: person.active };
  });
}

const roles: { role: string; can: string }[] = [
  { role: 'Owner', can: 'Everything, including business settings, cost, profit and support approvals.' },
  { role: 'Manager', can: 'Sales, purchases, stock and reports. Sees cost and profit.' },
  { role: 'Sales', can: 'Sales, POS and customer payments. Cannot see cost or profit.' },
  { role: 'Viewer', can: 'Read-only access to lists and reports.' },
];

const th = 'h-9 px-4 text-left text-xs font-medium text-ink-500';

export function TeamSettings({ canEdit, onDirtyChange }: { canEdit: boolean; onDirtyChange: (dirty: boolean) => void }) {
  const { state, actorId } = useTenantSettings();
  const source = state.sections.team;
  const actor = source.employees.find(person => person.id === actorId);
  const actorRoleLabel = actor?.roleIds.map(id => source.roles.find(role => role.id === id)?.name ?? id).join(' · ') ?? 'Team member';
  const [staff, setStaff] = useState<Staff[]>(() => localPreviewStaff(source.roles, source.employees));
  const [initialStaff] = useState<Staff[]>(() => localPreviewStaff(source.roles, source.employees));
  const [feedback, setFeedback] = useState('');
  const dirty = JSON.stringify(staff) !== JSON.stringify(initialStaff);
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  const [editor, setEditor] = useState<Staff | null>(null);
  const [error, setError] = useState('');
  const isNew = editor ? !staff.some((s) => s.id === editor.id) : false;
  const owners = staff.filter((s) => s.role === 'Owner' && s.active).length;

  const save = () => {
    if (!editor) return;
    if (!editor.name.trim()) return setError('Enter a name.');
    if (staff.some((s) => s.id !== editor.id && s.name.trim().toLowerCase() === editor.name.trim().toLowerCase())) return setError('Someone with this name already exists.');
    const wasOwner = staff.find((s) => s.id === editor.id)?.role === 'Owner';
    if (wasOwner && (editor.role !== 'Owner' || !editor.active) && owners <= 1) return setError('Keep at least one active owner.');
    setStaff(current => isNew
      ? [...current, { ...editor, name: editor.name.trim() }]
      : current.map(person => person.id === editor.id ? { ...editor, name: editor.name.trim() } : person));
    setFeedback('UI preview only. No team member, role, login or invitation was changed in the business.');
    setEditor(null);
  };

  return (
    <div className="min-w-0 space-y-3" data-settings-magic-team>
      <SettingCard
        title="Users & roles"
        titleBn="ব্যবহারকারী ও ভূমিকা"
        description={`Signed in as ${actor?.name ?? 'HisabIQ user'} · ${actorRoleLabel}`}
        bodyClassName=""
        actions={
          canEdit ? (
            <Button
              kind="primary"
              onClick={() => {
                setError('');
                setEditor({ id: `preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: '', role: 'Sales', active: true });
              }}
            >
              <Plus className="size-4" />
              Add team member
            </Button>
          ) : undefined
        }
      >
        {!canEdit && (
          <p className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
            <Lock className="size-3.5" aria-hidden="true" />
            Only the owner can add or change team members.
          </p>
        )}
        <p className="mx-4 mt-3 text-[11px] text-ink-500">UI preview · changes here are not saved, and no invitation or account action will be sent.</p>
        {feedback && <p role="status" className="mx-4 mt-2 text-xs text-teal-700">{feedback}</p>}
        <div className="overflow-x-auto">
          <table data-erp-table data-settings-team-table className="w-full min-w-[520px] text-[13px]">
            <thead>
              <tr className="border-b border-ink-100">
                <th className={th}>Team member</th>
                <th className={th}>Role</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-ink">{s.name}</td>
                  <td className="px-4 py-2 text-ink-600">{s.role}</td>
                  <td className="px-4 py-2">
                    <Tag color={s.active ? 'success' : 'neutral'}>{s.active ? 'Active' : 'Disabled'}</Tag>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {canEdit && (
                      <Button
                        kind="ghost"
                        onClick={() => {
                          setError('');
                          setEditor({ ...s });
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-ink-100 px-4 py-3">
          <h3 className="text-xs font-medium text-ink-500">What each role can do</h3>
          <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-[13px] sm:grid-cols-2">
            {roles.map((r) => (
              <div key={r.role}>
                <dt className="font-medium text-ink">{r.role}</dt>
                <dd className="text-xs text-ink-500">{r.can}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-ink-500">UI preview only: role explanations illustrate the approved design. Actual permissions are enforced separately; nothing here changes access.</p>
        </div>
      </SettingCard>

      {editor && (
        <Modal
          title={isNew ? 'Add team member' : `Edit ${editor.name || 'team member'}`}
          onClose={() => setEditor(null)}
          footer={
            <>
              <Button onClick={() => setEditor(null)}>Cancel</Button>
              <Button kind="primary" onClick={save}>Save</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Name">
              <Input value={editor.name} onChange={(name) => setEditor({ ...editor, name })} placeholder="e.g. Sabbir Hossain" />
            </Field>
            <div>
              <Field label="Role">
                <Select value={editor.role} onChange={(role) => setEditor({ ...editor, role })} options={roles.map((r) => r.role)} />
              </Field>
              <p className="mt-1 text-xs text-ink-500">{roles.find((r) => r.role === editor.role)?.can}</p>
            </div>
            <label className="flex cursor-pointer items-start gap-3">
              <span className="flex h-5 items-center">
                <Checkbox checked={editor.active} onCheckedChange={(v: boolean) => setEditor({ ...editor, active: v })} />
              </span>
              <span>
                <span className="block text-[13px] font-medium text-ink">Active</span>
                <span className="block text-xs text-ink-500">Disabled members can’t sign in. Their records stay.</span>
              </span>
            </label>
            {error && <p role="alert" className="text-xs text-danger">{error}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
