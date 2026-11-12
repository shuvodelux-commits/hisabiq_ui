/** Magic Patterns TeamSettings source UI (artifact 238f01b4), adapted only for local preview data. */
import React, { useEffect, useId, useRef, useState } from 'react';
import { Lock, Plus } from 'lucide-react';
import { AppSelect } from '../../components/AppSelect';
import { SettingCard } from '../ui';
import { Button, Modal } from './invoice/Ui';
import { useTenantSettings } from '../TenantSettingsProvider';
import { SettingsToggle } from './SettingsToggle';
import { useSession } from '../../integration/SessionProvider.tsx';
import {
  readTenantUsers, readTenantRoles, updateTenantUserDisplayName,
  type ServerUsersEnvelope, type ServerRolesEnvelope, type ServerUser,
} from '../../integration/settings-team.ts';
import { ApiError } from '../../integration/errors.ts';

/** Phase 1 design data is local-only. Server-side authorization remains unchanged. */
type Staff = { id: string; name: string; role: string; active: boolean };
function Input({ value, onChange, placeholder = '', inputRef, invalid, errorId, disabled }: { value: string; onChange: (value: string) => void; placeholder?: string; inputRef?: React.Ref<HTMLInputElement>; invalid?: boolean; errorId?: string; disabled?: boolean }) {
  return <input ref={inputRef} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-invalid={invalid || undefined} aria-describedby={errorId} aria-errormessage={invalid ? errorId : undefined} disabled={disabled}
    className="ref-control block h-9 w-full rounded-md border border-input bg-card px-3 text-[13px] text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20" />;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block min-w-0 text-[12px] font-medium text-ink-700">{label}
    <span className="mt-1.5 block font-normal">{children}</span></label>;
}
function Select({ value, onChange, options, describedBy }: { value: string; onChange: (value: string) => void; options: string[]; describedBy?: string }) {
  return <AppSelect label="Role" value={value} options={options} onChange={onChange} describedBy={describedBy} className="w-full" />;
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

type TeamReadState<T> = {
  status: 'waiting' | 'loading' | 'ready' | 'denied' | 'error' | 'locked';
  data: T | null;
};
type TeamReadRecord<T> = TeamReadState<T> & { key: string };
const emptyTeamRead = <T,>(status: TeamReadState<T>['status']): TeamReadState<T> =>
  ({ status, data: null });

/** Source-pinned T02-R: separate Nest permissions for users and role details.
 * A session epoch/tenant change synchronously invalidates old data, even
 * before effect cleanup. No local employees are used in connected mode. */
function useVerifiedTeamReads() {
  const { mode, snapshot } = useSession();
  const [userRecord, setUserRecord] = useState<TeamReadRecord<ServerUsersEnvelope['data']> | null>(null);
  const [roleRecord, setRoleRecord] = useState<TeamReadRecord<ServerRolesEnvelope['data']> | null>(null);
  const key = mode === 'connected' && snapshot.status === 'authenticated'
    ? `${snapshot.tenantId}:${snapshot.userId}:${snapshot.epoch}:${snapshot.accessToken}`
    : `${mode}:${snapshot.status}:${snapshot.epoch}`;
  const liveIdentity = useRef(key);
  liveIdentity.current = key;
  const canReadUsers = mode === 'connected' && snapshot.status === 'authenticated' &&
    snapshot.permissions.includes('user.account.view');
  const canReadRoles = mode === 'connected' && snapshot.status === 'authenticated' &&
    snapshot.permissions.includes('user.role.view');

  useEffect(() => {
    if (mode !== 'connected' || snapshot.status !== 'authenticated') return;
    const activeKey = key;
    const token = snapshot.accessToken;
    let active = true;
    const controllers: AbortController[] = [];
    const read = <T,>(
      authorized: boolean,
      setter: React.Dispatch<React.SetStateAction<TeamReadRecord<T> | null>>,
      request: (token: string, signal?: AbortSignal) => Promise<{ data: T }>,
    ) => {
      if (!authorized) return;
      const controller = new AbortController();
      controllers.push(controller);
      setter({ key: activeKey, status: 'loading', data: null });
      void request(token, controller.signal).then(response => {
        if (!active || liveIdentity.current !== activeKey || controller.signal.aborted) return;
        setter({ key: activeKey, status: 'ready', data: response.data });
      }).catch((error: unknown) => {
        if (!active || liveIdentity.current !== activeKey || controller.signal.aborted) return;
        const denied = error instanceof ApiError && (error.status === 401 || error.status === 403);
        setter({ key: activeKey, status: denied ? 'denied' : 'error', data: null });
      });
    };
    read(canReadUsers, setUserRecord, readTenantUsers);
    read(canReadRoles, setRoleRecord, readTenantRoles);
    return () => {
      active = false;
      for (const controller of controllers) controller.abort();
    };
  }, [mode, key, canReadUsers, canReadRoles]);

  const status = (allowed: boolean) => snapshot.status === 'locked'
    ? 'locked' as const : allowed ? 'loading' as const : 'denied' as const;
  const users: TeamReadState<ServerUsersEnvelope['data']> = mode !== 'connected'
    ? emptyTeamRead('waiting')
    : snapshot.status !== 'authenticated' ? emptyTeamRead(snapshot.status === 'locked' ? 'locked' : 'waiting')
    : !canReadUsers ? emptyTeamRead('denied')
    : userRecord?.key === key ? userRecord : emptyTeamRead(status(canReadUsers));
  const roleDetails: TeamReadState<ServerRolesEnvelope['data']> = mode !== 'connected'
    ? emptyTeamRead('waiting')
    : snapshot.status !== 'authenticated' ? emptyTeamRead(snapshot.status === 'locked' ? 'locked' : 'waiting')
    : !canReadRoles ? emptyTeamRead('denied')
    : roleRecord?.key === key ? roleRecord : emptyTeamRead(status(canReadRoles));
  // Only the currently authorized tenant+session may adopt an UPDATE result.
  // Never splice a server response into preview staff or another tenant's list.
  const acceptUserWrite = (updated: ServerUser, requestIdentity: string): boolean => {
    if (mode !== 'connected' || snapshot.status !== 'authenticated' ||
        !snapshot.permissions.includes('user.account.view') ||
        !snapshot.permissions.includes('user.account.edit') ||
        liveIdentity.current !== requestIdentity || key !== requestIdentity ||
        userRecord?.key !== key || userRecord.status !== 'ready' || !userRecord.data ||
        !userRecord.data.users.some(user => user.id === updated.id)) return false;
    setUserRecord({
      key, status: 'ready',
      data: {
        ...userRecord.data,
        users: userRecord.data.users.map(user => user.id === updated.id ? updated : user),
      },
    });
    return true;
  };
  return { connected: mode === 'connected', identity: key, snapshot, users, roleDetails, acceptUserWrite };
}

export function TeamSettings({ canEdit, onDirtyChange }: { canEdit: boolean; onDirtyChange: (dirty: boolean) => void }) {
  const { state, actorId } = useTenantSettings();
  const live = useVerifiedTeamReads();
  const source = state.sections.team;
  const actor = source.employees.find(person => person.id === actorId);
  const actorRoleLabel = actor?.roleIds.map(id => source.roles.find(role => role.id === id)?.name ?? id).join(' · ') ?? 'Team member';
  const [staff, setStaff] = useState<Staff[]>(() => localPreviewStaff(source.roles, source.employees));
  const [initialStaff] = useState<Staff[]>(() => localPreviewStaff(source.roles, source.employees));
  const [feedback, setFeedback] = useState('');
  const [liveFeedback, setLiveFeedback] = useState('');
  const [liveError, setLiveError] = useState('');
  const [liveSaving, setLiveSaving] = useState(false);
  const [liveEditor, setLiveEditor] = useState<{
    identity: string; user: ServerUser; name: string;
  } | null>(null);
  const activeLiveEditor = liveEditor?.identity === live.identity ? liveEditor : null;
  const pendingLive = useRef<AbortController | null>(null);
  const currentIdentity = useRef(live.identity);
  currentIdentity.current = live.identity;
  const canEditLive = live.connected && live.snapshot.status === 'authenticated' &&
    live.snapshot.permissions.includes('user.account.view') &&
    live.snapshot.permissions.includes('user.account.edit') &&
    live.users.status === 'ready';
  const dirty = live.connected
    ? Boolean(activeLiveEditor && activeLiveEditor.name !== activeLiveEditor.user.displayName)
    : JSON.stringify(staff) !== JSON.stringify(initialStaff);
  useEffect(() => {
    // Drop the old tenant's edit draft on identity change, not only its DOM.
    setLiveEditor(null);
    setLiveSaving(false);
    setLiveError('');
    setLiveFeedback('');
    return () => pendingLive.current?.abort();
  }, [live.identity]);
  useEffect(() => { onDirtyChange(dirty); }, [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  const [editor, setEditor] = useState<Staff | null>(null);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<'name' | 'role' | 'active' | null>(null);
  const errorId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const activeInputRef = useRef<HTMLInputElement>(null);
  const roleControlRef = useRef<HTMLDivElement>(null);
  const clearError = () => { setError(''); setErrorField(null); };
  const showError = (message: string, field: 'name' | 'role' | 'active') => {
    setError(message);
    setErrorField(field);
    if (field === 'name') nameInputRef.current?.focus();
    if (field === 'active') activeInputRef.current?.focus();
    if (field === 'role') roleControlRef.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus();
  };
  const isNew = editor ? !staff.some((s) => s.id === editor.id) : false;
  const owners = staff.filter((s) => s.role === 'Owner' && s.active).length;
  const visibleStaff: Staff[] = live.connected
    ? live.users.status === 'ready' && live.users.data !== null
      ? live.users.data.users.map(user => ({
          id: user.id, name: user.displayName, role: user.roleName, active: !user.disabled,
        })) : []
    : staff;
  const roleDescriptions = live.connected
    ? live.roleDetails.status === 'ready' && live.roleDetails.data !== null
      ? live.roleDetails.data.roles.map(role => ({
          role: role.name,
          can: role.permissions.map(code =>
            live.roleDetails.data?.catalogue.find(entry => entry.code === code)?.label || code
          ).join(' · ') || 'No permissions assigned',
        })) : []
    : roles;

  const saveLive = async () => {
    if (!canEditLive || live.snapshot.status !== 'authenticated' ||
        !activeLiveEditor || liveSaving || pendingLive.current ||
        live.users.status !== 'ready' || !live.users.data) return;
    const sourceUser = live.users.data.users.find(user => user.id === activeLiveEditor.user.id);
    if (!sourceUser || sourceUser.roleId !== activeLiveEditor.user.roleId ||
        sourceUser.displayName !== activeLiveEditor.user.displayName) {
      setLiveError('The account changed on the server. Reload before saving this name.');
      return;
    }
    const trimmed = activeLiveEditor.name.trim();
    if (!trimmed || trimmed.length > 120) {
      setLiveError('Enter a name between 1 and 120 characters.');
      return;
    }
    if (trimmed === sourceUser.displayName) {
      setLiveEditor(null);
      return;
    }
    const controller = new AbortController();
    pendingLive.current = controller;
    const requestIdentity = live.identity;
    const token = live.snapshot.accessToken;
    setLiveSaving(true);
    setLiveError('');
    setLiveFeedback('');
    try {
      const response = await updateTenantUserDisplayName(token, sourceUser, trimmed, controller.signal);
      if (controller.signal.aborted || currentIdentity.current !== requestIdentity) return;
      if (!live.acceptUserWrite(response.data, requestIdentity)) {
        setLiveError('Account changed. Reload and verify before trying again.');
        return;
      }
      setLiveEditor(null);
      setLiveFeedback('Verified team member name saved. · ব্যবহারকারীর নাম সার্ভারে সংরক্ষিত।');
    } catch (error: unknown) {
      if (controller.signal.aborted || currentIdentity.current !== requestIdentity) return;
      const denied = error instanceof ApiError && (error.status === 401 || error.status === 403);
      setLiveError(denied
        ? 'Permission denied or session expired. Your unsaved name is retained.'
        : 'Save not confirmed. Your name draft is retained; reload the server record before retrying.');
    } finally {
      if (pendingLive.current === controller) pendingLive.current = null;
      if (currentIdentity.current === requestIdentity) setLiveSaving(false);
    }
  };

  const save = () => {
    if (!editor) return;
    if (!editor.name.trim()) return showError('Enter a name.', 'name');
    if (staff.some((s) => s.id !== editor.id && s.name.trim().toLowerCase() === editor.name.trim().toLowerCase())) return showError('Someone with this name already exists.', 'name');
    const wasOwner = staff.find((s) => s.id === editor.id)?.role === 'Owner';
    if (wasOwner && (editor.role !== 'Owner' || !editor.active) && owners <= 1)
      return showError('Keep at least one active owner.', editor.role !== 'Owner' ? 'role' : 'active');
    setStaff(current => isNew
      ? [...current, { ...editor, name: editor.name.trim() }]
      : current.map(person => person.id === editor.id ? { ...editor, name: editor.name.trim() } : person));
    setFeedback('UI preview only. No team member, role, login or invitation was changed in the business.');
    setEditor(null);
  };

  return (
    <div className="min-w-0 max-w-full space-y-3 overflow-x-hidden" data-settings-magic-team>
      <SettingCard
        title="Users & roles"
        titleBn="ব্যবহারকারী ও ভূমিকা"
        description={live.connected
          ? (live.snapshot.status === 'authenticated'
            ? `Signed in as ${live.snapshot.displayName} · ${live.snapshot.roleName}`
            : 'Verified session required · যাচাইকৃত সেশন প্রয়োজন')
          : `Signed in as ${actor?.name ?? 'HisabIQ user'} · ${actorRoleLabel}`}
        bodyClassName=""
        actions={
          !live.connected && canEdit ? (
            <Button
              kind="primary"
              onClick={() => {
                clearError();
                setEditor({ id: `preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: '', role: 'Sales', active: true });
              }}
            >
              <Plus className="size-4" />
              Add team member
            </Button>
          ) : undefined
        }
      >
        {!live.connected && !canEdit && (
          <p className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
            <Lock className="size-3.5" aria-hidden="true" />
            Only the owner can add or change team members.
          </p>
        )}
        {live.connected ? (
          <p role="status" aria-live="polite" className="mx-4 mt-3 text-[11px] text-ink-500">
            {live.users.status === 'ready'
              ? canEditLive
                ? 'Verified team accounts. Existing names may be edited; roles, status and account creation remain disabled. · নাম পরিবর্তন করা যাবে; ভূমিকা ও স্ট্যাটাস অপরিবর্তিত।'
                : 'Verified team accounts loaded from your business. Viewing only; account changes are not enabled. · যাচাইকৃত ব্যবহারকারী, শুধু দেখার জন্য।'
              : live.users.status === 'loading' ? 'Loading team accounts… · ব্যবহারকারী লোড হচ্ছে…'
              : live.users.status === 'denied' ? 'You do not have permission to view team accounts. · ব্যবহারকারী দেখার অনুমতি নেই।'
              : live.users.status === 'locked' ? 'Unlock your session to view team accounts. · সেশন আনলক করুন।'
              : 'Live team accounts are unavailable. No sample staff shown. · সার্ভার তথ্য পাওয়া যায়নি; নমুনা কর্মী দেখানো হয়নি।'}
          </p>
        ) : (
          <p className="mx-4 mt-3 text-[11px] text-ink-500">UI preview · changes here are not saved, and no invitation or account action will be sent.</p>
        )}
        {(live.connected ? liveFeedback : feedback) && <p role="status" className="mx-4 mt-2 text-xs text-teal-700">{live.connected ? liveFeedback : feedback}</p>}
        <div className="min-w-0 max-w-full w-full overflow-x-auto" style={{ contain: 'layout paint' }}>
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
              {visibleStaff.map((s) => (
                <tr key={s.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-2 font-medium text-ink">{s.name}</td>
                  <td className="px-4 py-2 text-ink-600">{s.role}</td>
                  <td className="px-4 py-2">
                    <Tag color={s.active ? 'success' : 'neutral'}>{s.active ? 'Active' : 'Disabled'}</Tag>
                  </td>
                  <td className="px-4 py-2 text-right">
                    {(live.connected ? canEditLive : canEdit) && (
                      <Button
                        kind="ghost"
                        onClick={() => {
                          if (live.connected) {
                            if (!canEditLive || live.users.status !== 'ready' || !live.users.data) return;
                            const sourceUser = live.users.data.users.find(user => user.id === s.id);
                            if (!sourceUser) return;
                            setLiveError('');
                            setLiveFeedback('');
                            setLiveEditor({ identity: live.identity, user: sourceUser, name: sourceUser.displayName });
                          } else {
                            clearError();
                            setEditor({ ...s });
                          }
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
            {roleDescriptions.map((r) => (
              <div key={r.role}>
                <dt className="font-medium text-ink">{r.role}</dt>
                <dd className="text-xs text-ink-500">{r.can}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-ink-500">
            {live.connected
              ? live.roleDetails.status === 'ready'
                ? 'Live server role permissions shown; all account and role changes remain disabled. · সার্ভারের ভূমিকা ও অনুমতি দেখানো হয়েছে।'
                : 'Role permissions are unavailable or not authorized; no preview grants are displayed. · ভূমিকার অনুমতি পাওয়া যায়নি।'
              : 'UI preview only: role explanations illustrate the approved design. Actual permissions are enforced separately; nothing here changes access.'}
          </p>
        </div>
      </SettingCard>

      {live.connected && canEditLive && activeLiveEditor && (
        <Modal
          title={'Edit ' + activeLiveEditor.user.displayName}
          onClose={() => { if (!liveSaving) setLiveEditor(null); }}
          footer={
            <>
              <Button onClick={() => setLiveEditor(null)} disabled={liveSaving}>Cancel</Button>
              <Button kind="primary" onClick={() => { void saveLive(); }}
                disabled={liveSaving || activeLiveEditor.name === activeLiveEditor.user.displayName}>
                {liveSaving ? 'Saving…' : 'Save'}
              </Button>
            </>
          }
        >
          <div className="space-y-4" data-settings-connected-user-rename>
            <Field label="Name">
              <Input value={activeLiveEditor.name} disabled={liveSaving}
                onChange={name => { setLiveError(''); setLiveEditor({ ...activeLiveEditor, name }); }}
                invalid={Boolean(liveError)} errorId={liveError ? errorId : undefined}
                placeholder="Team member name" />
            </Field>
            <p className="text-xs text-ink-500">
              Role: {activeLiveEditor.user.roleName} · {activeLiveEditor.user.disabled ? 'Disabled' : 'Active'}.
              Role and account status cannot be changed here.
            </p>
            {liveError && <p id={errorId} role="alert" className="text-xs text-danger">{liveError}</p>}
          </div>
        </Modal>
      )}

      {!live.connected && editor && (
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
              <Input value={editor.name} onChange={(name) => { clearError(); setEditor({ ...editor, name }); }} inputRef={nameInputRef} invalid={Boolean(error) && errorField === 'name'} errorId={errorField === 'name' ? errorId : undefined} placeholder="e.g. Sabbir Hossain" />
            </Field>
            <div>
              <div ref={roleControlRef} className="min-w-0 text-[12px] font-medium text-ink-700">
                <span className="block">Role</span>
                <span className="mt-1.5 block font-normal"><Select value={editor.role} onChange={(role) => { clearError(); setEditor({ ...editor, role }); }} describedBy={errorField === 'role' ? errorId : undefined} options={roles.map((r) => r.role)} /></span>
              </div>
              <p className="mt-1 text-xs text-ink-500">{roles.find((r) => r.role === editor.role)?.can}</p>
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 pt-1">
                <label htmlFor="settings-team-member-active" className="block cursor-pointer text-[13px] font-medium text-ink">Active</label>
                <p className="text-xs text-ink-500">Disabled members can’t sign in. Their records stay.</p>
              </div>
              <SettingsToggle
                id="settings-team-member-active"
                ref={activeInputRef}
                aria-label="Active"
                aria-invalid={Boolean(error) && errorField === 'active' || undefined}
                aria-describedby={errorField === 'active' ? errorId : undefined}
                aria-errormessage={errorField === 'active' ? errorId : undefined}
                checked={editor.active}
                onCheckedChange={value => { clearError(); setEditor({ ...editor, active: value }); }}
              />
            </div>
            {error && <p id={errorId} role="alert" className="text-xs text-danger">{error}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
