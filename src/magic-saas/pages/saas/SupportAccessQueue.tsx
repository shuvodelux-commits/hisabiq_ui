import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Tabs } from '../../prototype/Ui';
import { useSaas } from '../../contexts/SaasContext';
import { AccessRequestCard } from '../../components/saas/AccessRequestCard';
import { Card, Denied, PageTitle, SummaryStrip } from '../../components/saas/SaasBits';
import type { AccessState } from '../../types/saas';

const openStates: AccessState[] = ['REQUESTED', 'APPROVED'];

export function SupportAccessQueue() {
  const saas = useSaas();
  const [tab, setTab] = useState<'approved' | 'waiting' | 'closed'>('approved');
  if (!saas.can('support.access')) return <Denied what="support access" role={saas.staff.label} />;
  const all = saas.state.access.filter((a) => saas.inScope(a.tenantId));
  const lists = {
    approved: all.filter((a) => a.state === 'APPROVED'),
    waiting: all.filter((a) => a.state === 'REQUESTED'),
    closed: all.filter((a) => !openStates.includes(a.state)),
  };
  const list = lists[tab];
  return (
    <div className="space-y-4">
      <PageTitle title="Support access" bn="সাপোর্ট অনুমতি" description="Owner-approved, single-use setting changes. Start a request from a ticket or a business’s Support tab." />
      <SummaryStrip
        items={[
          { label: 'Approved — apply now', value: lists.approved.length, tone: lists.approved.length ? 'warning' : undefined, helper: 'Approval lasts 15 minutes' },
          { label: 'Waiting for owner', value: lists.waiting.length },
          { label: 'Applied this week', value: all.filter((a) => a.state === 'APPLIED').length, tone: 'success' },
        ]}
      />
      <Card>
        <Tabs label="Access requests" value={tab} onChange={(v) => setTab(v as typeof tab)} items={[{ id: 'approved', label: 'Ready to apply', count: lists.approved.length }, { id: 'waiting', label: 'Waiting for owner', count: lists.waiting.length }, { id: 'closed', label: 'Closed', count: lists.closed.length }]} />
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <KeyRound className="size-6 text-ink-300" aria-hidden="true" />
            <p className="text-[13px] text-ink-500">{tab === 'approved' ? 'Nothing approved and waiting to be applied.' : tab === 'waiting' ? 'No requests waiting for owners.' : 'No closed requests.'}</p>
          </div>
        ) : list.map((a) => <AccessRequestCard key={a.id} a={a} showBusiness />)}
      </Card>
    </div>
  );
}
