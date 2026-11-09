import { useState } from 'react';
import { CalendarClock, Eye, Pencil, Plus, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select, Textarea } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { Badge, Card, Denied, EmptyRow, PageTitle, th, td, thAction, tdAction } from '../../../components/saas/SaasBits';
import { RowActions } from '../../../components/saas/RowActions';
import { planOrder } from '../../../data/saasSeeds';
import { fmtDateTime, sid } from '../../../utils/saas';
import type { Announcement, AnnouncementState, Result } from '../../../types/saas';

const tone: Record<AnnouncementState, 'neutral' | 'info' | 'success' | 'ink'> = { DRAFT: 'neutral', SCHEDULED: 'info', DELIVERED: 'success', CANCELLED: 'ink' };

export function Announcements() {
  const saas = useSaas();
  const [edit, setEdit] = useState<Announcement | null>(null);
  if (!saas.can('announcements.view')) return <Denied what="announcements" role={saas.staff.label} />;
  const canEdit = saas.canFor('announcements.edit', null);
  const run = (r: Result) => (r.ok ? toast.success(r.message) : toast.error(r.message));
  return (
    <div className="space-y-4">
      <PageTitle
        title="Announcements"
        bn="ঘোষণা"
        description="In-app and SMS notices to businesses by plan. SMS uses HisabIQ’s own credits."
        actions={canEdit && <Button kind="primary" onClick={() => setEdit({ id: sid('AN'), title: '', body: '', channel: 'In-app', plans: ['FREE', 'COUNTER', 'PRO', 'PLUS'], tenantIds: [], state: 'DRAFT', scheduledAt: '2026-10-26T10:00:00+06:00', createdBy: '', reach: 0 })}><Plus className="size-4" />New announcement</Button>}
      />
      <Card>
        <div className="overflow-x-auto">
          <table data-erp-table className="w-full text-[13px]">
            <thead><tr className="border-b border-ink-100"><th className={th}>Announcement</th><th className={`${th} hidden md:table-cell`}>Audience</th><th className={th}>Send</th><th className={th}>Status</th><th className={thAction}>Action</th></tr></thead>
            <tbody>
              {saas.state.announcements.length === 0 ? <EmptyRow cols={5} text="No announcements yet." /> : saas.state.announcements.map((a) => (
                <tr key={a.id} className="border-b border-ink-100 last:border-0">
                  <td className={td}><button type="button" onClick={() => setEdit(a)} className="font-medium text-ink hover:text-teal-700 hover:underline">{a.title}</button><span className="block max-w-[360px] truncate text-[11px] text-ink-500">{a.channel} · {a.body}</span></td>
                  <td className={`${td} hidden text-xs md:table-cell`}>{a.tenantIds.length ? `${a.tenantIds.length} businesses` : a.plans.join(', ')}{a.reach > 0 && <span className="block text-[11px] text-ink-500">Reached {a.reach}</span>}</td>
                  <td className={`${td} whitespace-nowrap text-ink-600`}>{fmtDateTime(a.scheduledAt)}</td>
                  <td className={td}><Badge tone={tone[a.state]} dot>{a.state.charAt(0) + a.state.slice(1).toLowerCase()}</Badge></td>
                  <td className={tdAction}>
                    <RowActions
                      label={`Actions for ${a.title}`}
                      items={[
                        { label: canEdit && a.state === 'DRAFT' ? 'Edit' : 'View', icon: canEdit && a.state === 'DRAFT' ? Pencil : Eye, onSelect: () => setEdit(a) },
                        { label: 'Schedule', icon: CalendarClock, hidden: !canEdit || a.state !== 'DRAFT', onSelect: () => run(saas.setAnnouncementState(a.id, 'SCHEDULED')) },
                        { label: 'Send now', icon: Send, hidden: !canEdit || a.state !== 'SCHEDULED', onSelect: () => run(saas.setAnnouncementState(a.id, 'DELIVERED')) },
                        { label: 'Cancel announcement', icon: XCircle, tone: 'danger', divider: true, hidden: !canEdit || !(a.state === 'DRAFT' || a.state === 'SCHEDULED'), onSelect: () => run(saas.setAnnouncementState(a.id, 'CANCELLED')) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {edit && <AnnouncementDialog initial={edit} canEdit={canEdit && edit.state === 'DRAFT'} onClose={() => setEdit(null)} />}
    </div>
  );
}

function AnnouncementDialog({ initial, canEdit, onClose }: { initial: Announcement; canEdit: boolean; onClose: () => void }) {
  const saas = useSaas();
  const [a, setA] = useState(initial);
  const [error, setError] = useState('');
  const reach = saas.state.tenants.filter((t) => t.account === 'Active' && a.plans.includes(t.status === 'Expired' ? 'FREE' : t.planCode)).length;
  return (
    <Modal title={a.title || 'New announcement'} onClose={onClose} footer={canEdit ? <><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.saveAnnouncement(a); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Save draft</Button></> : <Button onClick={onClose}>Close</Button>}>
      <div className="space-y-3 text-[13px]">
        <Field label="Title"><Input value={a.title} onChange={(title) => setA({ ...a, title })} disabled={!canEdit} /></Field>
        <Field label="Message"><Textarea value={a.body} onChange={(body) => setA({ ...a, body })} disabled={!canEdit} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Channel"><Select value={a.channel} onChange={(v) => setA({ ...a, channel: v as Announcement['channel'] })} options={['In-app', 'SMS', 'In-app + SMS']} disabled={!canEdit} /></Field>
          <Field label="Send at (Dhaka)"><Input type="datetime-local" value={a.scheduledAt.slice(0, 16)} onChange={(v) => setA({ ...a, scheduledAt: `${v}:00+06:00` })} disabled={!canEdit} /></Field>
        </div>
        <fieldset>
          <legend className="text-xs font-medium text-ink-700">Plans</legend>
          <div className="mt-1 flex flex-wrap gap-3">
            {planOrder.map((p) => (
              <label key={p} className="flex items-center gap-1.5 text-xs">
                <input type="checkbox" className="size-4 accent-teal-600" disabled={!canEdit} checked={a.plans.includes(p)} onChange={() => setA({ ...a, plans: a.plans.includes(p) ? a.plans.filter((x) => x !== p) : [...a.plans, p] })} />{p}
              </label>
            ))}
          </div>
        </fieldset>
        <p className="text-xs text-ink-500">Reaches about {reach} active businesses.</p>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
