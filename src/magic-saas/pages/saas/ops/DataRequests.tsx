import { Link, useNavigate } from 'react-router-dom';
import { Archive, CheckCircle2, Eye, Play, UserCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { RowActions } from '../../../components/saas/RowActions';
import { useSaas } from '../../../contexts/SaasContext';
import { useFirstLoad } from '../../../hooks/saas/useFirstLoad';
import { Badge, Card, Denied, EmptyRow, LoadingList, PageTitle, th, td, thAction, tdAction } from '../../../components/saas/SaasBits';
import { fmtDate, fmtDateTime } from '../../../utils/saas';
import type { DataRequestState, Result } from '../../../types/saas';

const tone: Record<DataRequestState, 'warning' | 'info' | 'teal' | 'success' | 'ink'> = { REQUESTED: 'warning', CONSENTED: 'info', IN_PROGRESS: 'teal', COMPLETED: 'success', DECLINED: 'ink' };
const label: Record<DataRequestState, string> = { REQUESTED: 'Waiting for owner consent', CONSENTED: 'Owner consented', IN_PROGRESS: 'In progress', COMPLETED: 'Completed', DECLINED: 'Declined' };
const kindLabel = { EXPORT: 'Data export', RESTORE: 'Restore from recycle bin', CLOSURE: 'Account closure' };

export function DataRequests() {
  const saas = useSaas();
  const loading = useFirstLoad();
  const navigate = useNavigate();
  if (!saas.can('data.view')) return <Denied what="data requests" role={saas.staff.label} />;
  const rows = saas.state.dataRequests.filter((d) => saas.inScope(d.tenantId)).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  const run = (r: Result) => (r.ok ? toast.success(r.message) : toast.error(r.message));
  return (
    <div className="space-y-4">
      <PageTitle title="Data requests" bn="ডেটা অনুরোধ" description="Exports, restores and closures. Nothing starts without the owner’s consent; closed accounts are archived, not deleted." />
      <Card>
        {loading ? <LoadingList /> : (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Request</th><th className={th}>Business</th><th className={`${th} hidden md:table-cell`}>Due</th><th className={th}>Status</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {rows.length === 0 ? <EmptyRow cols={5} text="No data requests." /> : rows.map((d) => {
                  const can = saas.canFor('data.manage', d.tenantId);
                  return (
                    <tr key={d.id} className="border-b border-ink-100 last:border-0">
                      <td className={td}><span className="font-medium">{kindLabel[d.kind]}</span><span className="block text-[11px] text-ink-500">{d.id} · {d.detail} · {fmtDateTime(d.requestedAt)}</span></td>
                      <td className={td}><Link to={`/saas/tenants/${d.tenantId}`} className="hover:text-teal-700 hover:underline">{saas.state.tenants.find((t) => t.id === d.tenantId)?.name}</Link></td>
                      <td className={`${td} hidden whitespace-nowrap md:table-cell`}>{fmtDate(d.dueAt)}</td>
                      <td className={td}><Badge tone={tone[d.state]} dot>{label[d.state]}</Badge>{d.handledBy && <span className="block text-[11px] text-ink-500">{d.handledBy}</span>}</td>
                      <td className={tdAction}>
                        <RowActions label={`Actions for ${d.id}`} items={[
                          { label: 'Open business', icon: Eye, onSelect: () => navigate(`/saas/tenants/${d.tenantId}`) },
                          { label: 'Simulate owner consent', icon: UserCheck, hidden: d.state !== 'REQUESTED', onSelect: () => run(saas.advanceDataRequest(d.id, 'CONSENTED', true)) },
                          { label: 'Start work', icon: Play, hidden: !can || d.state !== 'CONSENTED', onSelect: () => run(saas.advanceDataRequest(d.id, 'IN_PROGRESS')) },
                          { label: d.kind === 'CLOSURE' ? 'Close & archive' : 'Mark complete', icon: d.kind === 'CLOSURE' ? Archive : CheckCircle2, tone: d.kind === 'CLOSURE' ? 'danger' : 'neutral', divider: d.kind === 'CLOSURE', hidden: !can || d.state !== 'IN_PROGRESS', onSelect: () => run(saas.advanceDataRequest(d.id, 'COMPLETED')) },
                          { label: 'Decline request', icon: XCircle, tone: 'danger', divider: true, hidden: !can || !(d.state === 'REQUESTED' || d.state === 'CONSENTED'), onSelect: () => run(saas.advanceDataRequest(d.id, 'DECLINED')) },
                        ]} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">“Simulate” is prototype-only — owners consent in their own Settings › Data.</p>
      </Card>
    </div>
  );
}
