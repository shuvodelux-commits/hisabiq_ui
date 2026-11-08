/** Pinned Magic Patterns SessionsPage source UI, locally simulated for Phase 1. */
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Ban, LogOut, Monitor, Search, ShieldAlert, Smartphone, Tablet, UserCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../../components/Input';
import { Button, Modal, Segmented } from '../invoice/Ui';
import { Select, Tag } from './SessionsUi';
import { RowActions } from './RowActions';
import { SettingCard } from '../../ui';
import { StatTile } from './StatTile';
import { PinConfirmDialog } from './PinConfirmDialog';
import { ago, dhakaTime, useSessionsPreview } from './sessionPreview';
import { PREVIEW_NOW } from './sessionPreview';
import type { LoginSession, SessionFlag } from './sessionPreview';

function previewToast(message: string, options?: { action?: { label: string; onClick: () => void } }) {
  toast.success(message, { description: 'UI preview only. No real session, login, account or role was changed.', action: options?.action });
}

const flagText: Record<SessionFlag, string> = { new: 'New device', 'unusual-hour': 'Unusual hour', 'different-city': 'Different city' };
const kindIcon = { desktop: Monitor, phone: Smartphone, tablet: Tablet };
const isOnline = (s: LoginSession) => new Date(PREVIEW_NOW).getTime() - new Date(s.lastActive).getTime() < 30 * 60000;

/** Owner tool: every signed-in device, with sign-out, pause access and plain-language flags. */
export function SessionsPage({ canManage }: { canManage: boolean }) {
  const sec = useSessionsPreview();
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [confirm, setConfirm] = useState<LoginSession | null>(null);
  const [personAction, setPersonAction] = useState<{ personId: string; pause: boolean } | null>(null);
  const [allOut, setAllOut] = useState(false);
  const [idle, setIdle] = useState('30');
  const [pinNew, setPinNew] = useState(true);

  const name = (id: string) => sec.person(id)?.name ?? 'Unknown';

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sec.sessions
      .filter((s) => (filter === 'online' ? isOnline(s) : filter === 'new' ? s.flags.includes('new') : filter === 'unusual' ? s.flags.some((f) => f !== 'new') : true))
      .filter((s) => !q || `${sec.person(s.personId)?.name} ${s.device} ${s.browser} ${s.city}`.toLowerCase().includes(q))
      .sort((a, b) => (a.current ? -1 : b.current ? 1 : b.lastActive.localeCompare(a.lastActive)));
  }, [sec, filter, query]);

  const stats = {
    online: sec.sessions.filter(isOnline).length,
    total: sec.sessions.length,
    fresh: sec.sessions.filter((s) => s.flags.includes('new')).length,
    unusual: sec.sessions.filter((s) => s.flags.some((f) => f !== 'new')).length,
  };

  const doSignOut = (s: LoginSession) => {
    const removed = sec.signOut(s.id);
    setConfirm(null);
    if (removed) previewToast(`${name(s.personId)} signed out of ${s.device}`, { action: { label: 'Undo', onClick: () => sec.restoreSession(removed) } });
  };

  if (!canManage) {
    return (
      <SettingCard title="Logged-in devices" titleBn="লগইন করা ডিভাইস">
        <p className="text-[13px] text-ink-600">Only the owner, or someone the owner allows to “Manage devices”, can see other people’s devices. Your own devices are under Account & security.</p>
      </SettingCard>
    );
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden" data-settings-magic-sessions>
      <p role="note" className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800">UI preview · Sample sign-in records from 3 November 2026. These are not live sessions. All actions are local demonstrations and reset on reload.</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Online now" value={stats.online} tone="success" hint="Active in the last 30 min" />
        <StatTile label="Signed-in devices" value={stats.total} />
        <StatTile label="New devices" value={stats.fresh} tone={stats.fresh ? 'warning' : 'neutral'} hint="First sign-in this week" />
        <StatTile label="Unusual sign-ins" value={stats.unusual} tone={stats.unusual ? 'danger' : 'neutral'} hint="Odd hour or another city" />
      </div>

      <section className="min-w-0 max-w-full overflow-hidden rounded-xl border border-ink-100 bg-card shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
          <div className="relative min-w-0 w-full flex-1 sm:min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} clearable placeholder="Search person, device or city" aria-label="Search devices" className="ref-control h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-[13px] text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20" />
          </div>
          <div className="min-w-0 max-w-full overflow-x-auto"><Segmented label="Filter devices" value={filter} onChange={setFilter} options={[{ id: 'all', label: 'All' }, { id: 'online', label: 'Online now' }, { id: 'new', label: 'New' }, { id: 'unusual', label: 'Unusual' }]} /></div>
          <Button kind="danger" disabled={stats.total <= 1} onClick={() => setAllOut(true)}><LogOut className="size-4" />Sign out everyone except me</Button>
        </div>
        <p className="px-4 pt-3 text-xs text-ink-500">Showing {rows.length} of {sec.sessions.length} devices</p>
        <div className="max-w-full overflow-x-auto" style={{ contain: 'layout paint' }}>
          <table data-settings-sessions-table className="w-full min-w-[760px] text-[13px]">
            <thead>
              <tr className="text-left text-xs text-ink-500">
                <th className="px-4 py-2 font-medium">Person</th>
                <th className="px-4 py-2 font-medium">Device</th>
                <th className="px-4 py-2 font-medium">Where</th>
                <th className="px-4 py-2 font-medium">Signed in</th>
                <th className="px-4 py-2 font-medium">Last active</th>
                <th className="sticky right-0 bg-card px-2 py-2 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {rows.map((s) => {
                  const Icon = kindIcon[s.kind];
                  const risky = s.flags.some((f) => f !== 'new');
                  const who = sec.person(s.personId);
                  return (
                    <motion.tr
                      key={s.id}
                      layout={!reduced}
                      initial={reduced ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduced ? undefined : { opacity: 0, x: 12 }}
                      transition={{ duration: 0.18 }}
                      className={`border-t border-ink-100 ${risky ? 'bg-danger-bg/40' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{who?.name}</p>
                        <p className="text-xs text-ink-500">
                          {who?.role}
                          {s.current && <span className="ml-1 font-medium text-teal-700">· This device</span>}
                          {who?.paused && <span className="ml-1 text-danger">· Paused</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-ink">{s.device}</p>
                            <p className="text-xs text-ink-500">{s.browser}{s.trusted ? ' · Trusted' : ''}</p>
                          </div>
                        </div>
                        {s.flags.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{s.flags.map((f) => <Tag key={f} color={f === 'new' ? 'warning' : 'danger'}>{flagText[f]}</Tag>)}</div>}
                      </td>
                      <td className="px-4 py-3 text-ink-700">{s.city}</td>
                      <td className="px-4 py-3 text-ink-700">{dhakaTime(s.signedInAt)}</td>
                      <td className="px-4 py-3">{isOnline(s) ? <span className="inline-flex items-center gap-1.5 text-success"><span className="size-1.5 rounded-full bg-success" />{ago(s.lastActive)}</span> : <span className="text-ink-600">{ago(s.lastActive)}</span>}</td>
                      <td className="sticky right-0 bg-card/95 px-2 py-2 text-right">
                        <RowActions
                          label={`Actions for ${s.device}`}
                          items={[
                            { label: 'Sign out this device', icon: LogOut, onSelect: () => setConfirm(s), disabled: s.current, hint: s.current ? 'You are using this device' : undefined },
                            { label: 'Sign out all their devices', icon: Users, onSelect: () => setPersonAction({ personId: s.personId, pause: false }), hidden: s.personId === 'ST-01' },
                            {
                              label: who?.paused ? 'Allow back in' : 'Pause access',
                              icon: who?.paused ? UserCheck : Ban,
                              tone: who?.paused ? 'neutral' : 'danger',
                              divider: true,
                              hidden: s.personId === 'ST-01',
                              onSelect: () => {
                                if (who?.paused) {
                                  sec.setPaused(s.personId, false);
                                  previewToast(`${who.name} can sign in again`);
                                } else setPersonAction({ personId: s.personId, pause: true });
                              },
                            },
                          ]}
                        />
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-4 py-10 text-center text-[13px] text-ink-500">No devices match this filter.</p>}
        </div>
      </section>

      <SettingCard title="Sign-in safety" titleBn="লগইন নিরাপত্তা" description="Applies to every staff device.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="block text-[12px] font-medium text-ink-700">
            Sign out automatically when idle for
            <span className="mt-1.5 block font-normal">
              <Select label="Idle sign-out" value={idle} onChange={(v) => { setIdle(v); previewToast('Idle sign-out updated'); }} options={[{ value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' }, { value: '60', label: '1 hour' }, { value: '480', label: '8 hours' }]} />
            </span>
            <span className="ref-helper mt-1 block font-normal">Staff sign in again with their PIN. Unsaved sales stay as drafts.</span>
          </div>
          <label className="flex items-start gap-2.5 pt-5 text-[13px] text-ink-700">
            <input type="checkbox" className="mt-0.5 size-4 accent-teal-600" checked={pinNew} onChange={(e) => { setPinNew(e.target.checked); previewToast('Saved'); }} />
            <span>Ask for the owner’s PIN when someone signs in on a new device<span className="ref-helper block">Stops a staff password from working on an unknown phone.</span></span>
          </label>
        </div>
      </SettingCard>

      {confirm && (
        <Modal title="Sign out this device?" onClose={() => setConfirm(null)} footer={<><Button onClick={() => setConfirm(null)}>Cancel</Button><Button kind="danger" onClick={() => doSignOut(confirm)}><LogOut className="size-4" />Sign out</Button></>}>
          <p className="text-[13px] text-ink-700">{name(confirm.personId)} will be signed out of <b>{confirm.device}</b>. Any sale they haven’t saved is kept as a draft. They can sign in again unless you pause their access.</p>
          {confirm.flags.some((f) => f !== 'new') && <p className="mt-3 flex items-start gap-2 rounded-lg bg-danger-bg p-3 text-xs text-danger"><ShieldAlert className="size-4 shrink-0" />This sign-in looks unusual. Consider pausing their access and changing their password.</p>}
        </Modal>
      )}
      {personAction && (
        <Modal
          title={personAction.pause ? `Pause ${name(personAction.personId)}?` : `Sign out ${name(personAction.personId)} everywhere?`}
          onClose={() => setPersonAction(null)}
          footer={
            <>
              <Button onClick={() => setPersonAction(null)}>Cancel</Button>
              <Button kind="danger" onClick={() => { const n = sec.signOutPerson(personAction.personId, personAction.pause); previewToast(`${n} device${n === 1 ? '' : 's'} signed out${personAction.pause ? ' · access paused' : ''}`); setPersonAction(null); }}>
                {personAction.pause ? 'Pause access' : 'Sign out all'}
              </Button>
            </>
          }
        >
          <p className="text-[13px] text-ink-700">{personAction.pause ? 'They’ll be signed out of every device and can’t sign in until you allow them back from this page.' : 'They’ll be signed out of every device and can sign in again with their password.'}</p>
        </Modal>
      )}
      {allOut && (
        <PinConfirmDialog
          title="Sign out everyone except you?"
          message={`${stats.total - 1} devices will be signed out right away. Use this if a phone is lost or a staff member has left.`}
          confirmLabel="Sign out everyone"
          danger
          onClose={() => setAllOut(false)}
          onConfirm={() => { const n = sec.signOutAllExceptMe(); setAllOut(false); previewToast(`${n} devices signed out`); }}
        />
      )}
    </div>
  );
}
