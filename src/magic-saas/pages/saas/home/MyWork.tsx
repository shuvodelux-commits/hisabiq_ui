import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Tabs } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { useWorkQueue, type WorkItem, type WorkKind } from '../../../hooks/saas/useWorkQueue';
import { useFirstLoad } from '../../../hooks/saas/useFirstLoad';
import { Card, LoadingList, PageTitle } from '../../../components/saas/SaasBits';
import { VerifyPaymentDialog } from '../../../components/saas/billing/VerifyPaymentDialog';
import { MessageOwnerDialog } from '../../../components/saas/MessageOwnerDialog';
import { ServiceDialog } from '../../../components/saas/ops/ServiceDialog';
import { TicketDialog } from '../../../components/saas/ops/TicketDialog';
import type { Result } from '../../../types/saas';

type Scope = 'mine' | 'team' | 'all';
type Dialog = { type: 'verify' | 'service' | 'ticket'; id: string } | { type: 'message'; tenantId: string; templateId: string } | null;

const tiles: { label: string; bn: string; kinds: WorkKind[] }[] = [
  { label: 'To verify', bn: 'যাচাই', kinds: ['verify', 'activate'] },
  { label: 'Overdue & renewals', bn: 'বকেয়া', kinds: ['overdue', 'renewal', 'refund'] },
  { label: 'Trials & grace', bn: 'ট্রায়াল', kinds: ['trial', 'grace', 'cancel'] },
  { label: 'Upgrade signals', bn: 'আপগ্রেড', kinds: ['planfit'] },
  { label: 'Tickets', bn: 'টিকিট', kinds: ['ticket-new', 'ticket-mine'] },
  { label: 'Approved changes', bn: 'অনুমোদিত', kinds: ['access'] },
  { label: 'Services', bn: 'সার্ভিস', kinds: ['service'] },
  { label: 'At risk & setup', bn: 'ঝুঁকি', kinds: ['health', 'setup'] },
  { label: 'SMS issues', bn: 'এসএমএস', kinds: ['sms-failed', 'provider', 'sender'] },
  { label: 'Data requests', bn: 'ডেটা', kinds: ['data'] },
];

export function MyWork() {
  const saas = useSaas();
  const navigate = useNavigate();
  const loading = useFirstLoad();
  const all = useWorkQueue();
  const [scope, setScope] = useState<Scope>('team');
  const [kinds, setKinds] = useState<WorkKind[] | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const me = saas.staff.name;

  const inScope = all.filter((w) => (scope === 'mine' ? w.owner === me : scope === 'team' ? !w.owner || w.owner === me : true));
  const list = kinds ? inScope.filter((w) => kinds.includes(w.kind)) : inScope;
  const shownTiles = tiles.map((t) => ({ ...t, count: inScope.filter((w) => t.kinds.includes(w.kind)).length })).filter((t) => all.some((w) => t.kinds.includes(w.kind)));
  const toast$ = (r: Result) => (r.ok ? toast.success(r.message) : toast.error(r.message));

  const act = (w: WorkItem) => {
    switch (w.kind) {
      case 'verify': return setDialog({ type: 'verify', id: w.ref });
      case 'activate': return toast$(saas.activate(w.ref));
      case 'refund': return toast$(saas.completeRefund(w.ref));
      case 'renewal': return toast$(saas.createRenewalInvoice(w.ref));
      case 'overdue': case 'grace': case 'trial': case 'cancel': case 'planfit': return setDialog({ type: 'message', tenantId: w.tenantId!, templateId: w.ref });
      case 'access': return toast$(saas.applyAccess(w.ref));
      case 'ticket-new': return toast$(saas.assignTicket(w.ref, me));
      case 'ticket-mine': return setDialog({ type: 'ticket', id: w.ref });
      case 'service': return setDialog({ type: 'service', id: w.ref });
      case 'sms-failed': return toast$(saas.retryMessage(w.ref));
      case 'sender': return toast$(saas.decideSender(w.ref, true, 'Approved by provider'));
      case 'setup': return toast$(saas.requestGuidedSetup(w.ref));
      case 'data': {
        const d = saas.state.dataRequests.find((x) => x.id === w.ref);
        if (!d) return;
        return toast$(saas.advanceDataRequest(d.id, d.state === 'REQUESTED' ? 'CONSENTED' : d.state === 'CONSENTED' ? 'IN_PROGRESS' : 'COMPLETED', d.state === 'REQUESTED'));
      }
      case 'provider': return navigate('/saas/sms?tab=providers');
      case 'health': return navigate(`/saas/tenants/${w.ref}`);
    }
  };

  return (
    <div className="space-y-4">
      <PageTitle title="My work" bn="আজকের কাজ" description={`${me} · ${saas.staff.label}. Everything waiting on you, from the areas your roles cover.`} />

      {shownTiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
          {shownTiles.slice(0, 5).map((t) => {
            const active = kinds !== null && kinds.join() === t.kinds.join();
            return (
              <button key={t.label} type="button" aria-pressed={active} onClick={() => setKinds(active ? null : t.kinds)} className={`rounded-xl border bg-card px-3 py-2.5 text-left shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${active ? 'border-teal-600' : 'border-ink-100 hover:border-ink-200'}`}>
                <span className="block text-[11px] text-ink-500">{t.label} <span className="font-bn">· {t.bn}</span></span>
                <span className={`mt-0.5 block text-lg font-semibold ${t.count ? 'text-ink' : 'text-ink-300'}`}>{t.count}</span>
              </button>
            );
          })}
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 pr-3">
          <Tabs label="Whose work" value={scope} onChange={(v) => setScope(v as Scope)} items={[{ id: 'mine', label: 'Mine', count: all.filter((w) => w.owner === me).length }, { id: 'team', label: 'My team', count: all.filter((w) => !w.owner || w.owner === me).length }, { id: 'all', label: 'All in scope', count: all.length }]} />
          {kinds && <Button kind="ghost" onClick={() => setKinds(null)}>Clear filter</Button>}
        </div>
        {loading ? <LoadingList /> : list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <CheckCircle2 className="size-8 text-teal-600" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">Nothing waiting for you.</p>
            <p className="text-xs text-ink-500">{scope === 'mine' ? 'Nothing is assigned to you. Try “My team”.' : kinds ? 'Nothing of this kind right now.' : 'New items appear here as payments, tickets and renewals come in.'}</p>
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {list.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-2.5 sm:flex-nowrap">
                <span className={`size-2 shrink-0 rounded-full ${w.tone === 'danger' ? 'bg-danger' : w.tone === 'warning' ? 'bg-warning' : 'bg-info'}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{w.title}</p>
                  <p className="truncate text-[11px] text-ink-500">
                    <span className="mr-1 rounded bg-ink-50 px-1 text-ink-600">{w.area}</span>
                    {w.detail}
                    {w.owner && w.owner !== me && <span> · {w.owner}</span>}
                  </p>
                </div>
                {w.tenantId && w.kind !== 'health' && <Link to={`/saas/tenants/${w.tenantId}`} className="hidden shrink-0 text-xs text-ink-500 hover:text-teal-700 hover:underline md:inline">Business</Link>}
                <Button kind={w.tone === 'danger' ? 'primary' : 'outline'} onClick={() => act(w)}>{w.action}</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {dialog?.type === 'verify' && <VerifyPaymentDialog orderId={dialog.id} onClose={() => setDialog(null)} />}
      {dialog?.type === 'service' && <ServiceDialog serviceId={dialog.id} onClose={() => setDialog(null)} />}
      {dialog?.type === 'ticket' && <TicketDialog ticketId={dialog.id} onClose={() => setDialog(null)} />}
      {dialog?.type === 'message' && <MessageOwnerDialog tenantId={dialog.tenantId} templateId={dialog.templateId} onClose={() => setDialog(null)} />}
    </div>
  );
}
