import React, { useState } from 'react';
import { Eye, Pencil, Plus, Trash2, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select, Tabs } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { Badge, Card, Denied, PageTitle, th, td, thAction, tdAction } from '../../../components/saas/SaasBits';
import { RowActions } from '../../../components/saas/RowActions';
import { roleDefs } from '../../../data/saasSeeds';
import { effectiveAccess, roleLabel } from '../../../utils/saasAccess';
import { fmtDateTime, sid } from '../../../utils/saas';
import type { Assignment, StaffMember, StaffRole } from '../../../types/saas';

export function Team() {
  const saas = useSaas();
  const [tab, setTab] = useState('people');
  const [edit, setEdit] = useState<StaffMember | null>(null);
  if (!saas.can('team.view')) return <Denied what="team and roles" role={saas.staff.label} />;
  const canEdit = saas.canFor('team.edit', null);
  const name = (id: string) => saas.state.tenants.find((t) => t.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <PageTitle
        title="Team & roles"
        bn="টিম ও রোল"
        description="A person can hold several roles, each for all businesses or only assigned ones. Access is the combination."
        actions={canEdit && tab === 'people' && <Button kind="primary" onClick={() => setEdit({ id: sid('ST'), name: '', staffId: `HQ-${String(saas.state.staff.length + 1).padStart(3, '0')}`, email: '', phone: '', status: 'Active', assignments: [{ roleId: 'SUPPORT_ENGINEER', scope: 'ALL' }], lastActive: '' })}><Plus className="size-4" />Add staff</Button>}
      />
      <Card>
        <Tabs label="Team" value={tab} onChange={setTab} items={[{ id: 'people', label: 'People', count: saas.state.staff.length }, { id: 'roles', label: 'Roles', count: roleDefs.length }]} />
        {tab === 'people' ? (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Person</th><th className={th}>Roles & scope</th><th className={`${th} hidden lg:table-cell`}>Last active</th><th className={th}>Status</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {saas.state.staff.map((m) => (
                  <tr key={m.id} className="border-b border-ink-100 last:border-0">
                    <td className={td}><span className="font-medium">{m.name}</span><span className="block text-[11px] text-ink-500">{m.staffId} · {m.email}</span></td>
                    <td className={td}>
                      <ul className="space-y-0.5">
                        {m.assignments.map((a) => <li key={a.roleId} className="text-xs"><span className="font-medium text-ink">{roleDefs.find((r) => r.id === a.roleId)?.label}</span> <span className="text-ink-500">— {a.scope === 'ALL' ? 'all businesses' : a.scope.map(name).join(', ')}</span></li>)}
                      </ul>
                    </td>
                    <td className={`${td} hidden text-ink-500 lg:table-cell`}>{m.lastActive ? fmtDateTime(m.lastActive) : 'Never'}</td>
                    <td className={td}><Badge tone={m.status === 'Active' ? 'success' : 'neutral'} dot>{m.status}</Badge></td>
                    <td className={tdAction}>
                      <RowActions
                        label={`Actions for ${m.name}`}
                        items={[
                          { label: canEdit ? 'Edit roles & scope' : 'View access', icon: canEdit ? Pencil : Eye, onSelect: () => setEdit({ ...m, assignments: m.assignments.map((a) => ({ ...a })) }) },
                          { label: m.status === 'Active' ? 'Disable access' : 'Enable access', icon: m.status === 'Active' ? UserX : UserCheck, tone: m.status === 'Active' ? 'danger' : 'neutral', divider: true, hidden: !canEdit, onSelect: () => { const r = saas.setStaffStatus(m.id, m.status === 'Active' ? 'Disabled' : 'Active'); r.ok ? toast.success(r.message) : toast.error(r.message); } },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {roleDefs.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <p className="text-[13px] font-medium text-ink">{r.label} <span className="font-normal text-ink-500">· {saas.state.staff.filter((s) => s.assignments.some((a) => a.roleId === r.id)).length} people</span></p>
                <p className="text-xs text-ink-600">{r.summary}</p>
                <p className="mt-1 flex flex-wrap gap-1">{r.permissions.map((p) => <span key={p} className="rounded bg-ink-50 px-1.5 py-0.5 font-mono text-[10.5px] text-ink-600">{p}</span>)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {edit && <StaffDialog initial={edit} canEdit={canEdit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function StaffDialog({ initial, canEdit, onClose }: { initial: StaffMember; canEdit: boolean; onClose: () => void }) {
  const saas = useSaas();
  const [m, setM] = useState(initial);
  const [error, setError] = useState('');
  const tenants = saas.state.tenants;
  const setA = (i: number, a: Assignment) => setM({ ...m, assignments: m.assignments.map((x, j) => (j === i ? a : x)) });
  const unused = roleDefs.filter((r) => !m.assignments.some((a) => a.roleId === r.id));
  const access = effectiveAccess(m.assignments);

  return (
    <Modal
      title={initial.name || 'Add staff'}
      onClose={onClose}
      footer={canEdit ? <><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.saveStaff(m); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Save</Button></> : <Button onClick={onClose}>Close</Button>}
    >
      <div className="space-y-3 text-[13px]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name"><Input value={m.name} onChange={(name) => setM({ ...m, name })} disabled={!canEdit} /></Field>
          <Field label="Work email"><Input value={m.email} onChange={(email) => setM({ ...m, email })} placeholder="name@hisabiq.com" disabled={!canEdit} /></Field>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-700">Roles</p>
          {m.assignments.map((a, i) => (
            <div key={i} className="rounded-lg border border-ink-100 p-2">
              <div className="flex gap-2">
                <div className="flex-1"><Select value={a.roleId} onChange={(v) => setA(i, { ...a, roleId: v as StaffRole })} options={roleDefs.filter((r) => r.id === a.roleId || !m.assignments.some((x) => x.roleId === r.id)).map((r) => ({ value: r.id, label: r.label }))} disabled={!canEdit} /></div>
                <div className="w-[170px]"><Select value={a.scope === 'ALL' ? 'ALL' : 'SOME'} onChange={(v) => setA(i, { ...a, scope: v === 'ALL' ? 'ALL' : [] })} options={[{ value: 'ALL', label: 'All businesses' }, { value: 'SOME', label: 'Assigned only' }]} disabled={!canEdit} /></div>
                {canEdit && m.assignments.length > 1 && <Button kind="ghost" onClick={() => setM({ ...m, assignments: m.assignments.filter((_, j) => j !== i) })}><Trash2 className="size-4" /><span className="sr-only">Remove role</span></Button>}
              </div>
              {a.scope !== 'ALL' && (
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {tenants.map((t) => {
                    const on = (a.scope as string[]).includes(t.id);
                    return (
                      <label key={t.id} className="flex items-center gap-2 text-xs">
                        <input type="checkbox" checked={on} disabled={!canEdit} onChange={() => setA(i, { ...a, scope: on ? (a.scope as string[]).filter((x) => x !== t.id) : [...(a.scope as string[]), t.id] })} className="size-4 accent-teal-600" />
                        {t.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          {canEdit && unused.length > 0 && <Button kind="ghost" onClick={() => setM({ ...m, assignments: [...m.assignments, { roleId: unused[0].id, scope: 'ALL' }] })}><Plus className="size-4" />Add role</Button>}
        </div>
        <details className="rounded-lg border border-ink-100">
          <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-ink-700">Effective access · {roleLabel(m)} ({access.length} permissions)</summary>
          <ul className="max-h-[200px] divide-y divide-ink-100 overflow-y-auto text-xs">
            {access.map((r) => <li key={r.permission} className="flex justify-between gap-2 px-3 py-1"><span className="font-mono text-ink-700">{r.permission}</span><span className="text-right text-ink-500">{r.all ? 'All businesses' : `${r.tenants.length} businesses`} · {r.via.join(', ')}</span></li>)}
          </ul>
        </details>
        <p className="text-[11px] text-ink-500">Team, catalog, announcements, reports and platform settings only apply from all-business roles.</p>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
