import { toast } from 'sonner';
import { Button } from '../../prototype/Ui';
import { useSaas } from '../../contexts/SaasContext';
import { Badge, accessMeta } from './SaasBits';
import { fmtDateTime } from '../../utils/saas';
import type { SupportAccess } from '../../types/saas';

/** Scoped, consented support change: target, ticket, exact before/after, consent and expiry. */
export function AccessRequestCard({ a, showBusiness }: { a: SupportAccess; showBusiness?: boolean }) {
  const saas = useSaas();
  const tenant = saas.state.tenants.find((t) => t.id === a.tenantId);
  const member = tenant?.members.find((m) => m.id === a.memberId);
  const meta = accessMeta[a.state];
  const run = (r: { ok: boolean; message: string }) => (r.ok ? toast.success(r.message) : toast.error(r.message));

  return (
    <article className="border-b border-ink-100 px-4 py-3 last:border-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 text-[13px]">
          <p className="font-medium text-ink">
            {a.id} · {a.ticketId}
            {showBusiness && <span className="font-normal text-ink-500"> · {tenant?.name}</span>}
          </p>
          <p className="text-[11px] text-ink-500">
            {a.staffName} ({a.staffId}) · requested {fmtDateTime(a.requestedAt)} · applies to {member ? `${member.name} only` : 'whole business'}
          </p>
        </div>
        <Badge tone={meta.tone} dot>{meta.label}</Badge>
      </div>
      <table data-erp-table className="mt-2 w-full max-w-xl text-[13px]">
        <thead>
          <tr className="text-left"><th className="py-1 pr-3 text-xs font-medium text-ink-500">Setting</th><th className="py-1 pr-3 text-xs font-medium text-ink-500">Before</th><th className="py-1 text-xs font-medium text-ink-500">After</th></tr>
        </thead>
        <tbody>
          {a.changes.map((c) => (
            <tr key={c.setting} className="border-t border-ink-100"><td className="py-1 pr-3">{c.setting}</td><td className="py-1 pr-3 text-ink-500">{c.before}</td><td className="py-1 font-medium">{c.after}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-ink-600">{a.reason}</p>
      <p className="mt-1 text-[11px] text-ink-500">
        {a.state === 'APPROVED' && a.expiresAt && `Approved by ${a.decidedBy}. Single use — expires ${fmtDateTime(a.expiresAt)}.`}
        {a.state === 'EXPIRED' && 'Approval window ended without applying. Send a new request if still needed.'}
        {a.state === 'DECLINED' && `Declined by ${a.decidedBy}. Nothing changed.`}
        {a.state === 'APPLIED' && `Applied with ${a.decidedBy}’s consent. The owner can undo it.`}
        {a.state === 'REQUESTED' && 'The owner sees this exact change in Settings › Support and approves once.'}
      </p>
      {(a.state === 'REQUESTED' || a.state === 'APPROVED') && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {a.state === 'REQUESTED' && (
            <>
              <Button kind="ghost" onClick={() => run(saas.ownerDecision(a.id, true))}>Simulate owner approves</Button>
              <Button kind="ghost" onClick={() => run(saas.ownerDecision(a.id, false))}>Simulate owner declines</Button>
            </>
          )}
          {a.state === 'APPROVED' && <Button kind="primary" disabled={!saas.canFor('support.access', a.tenantId)} onClick={() => run(saas.applyAccess(a.id))}>Apply change</Button>}
          {saas.canFor('support.access', a.tenantId) && <Button onClick={() => run(saas.withdrawAccess(a.id))}>Withdraw</Button>}
          <span className="text-[11px] text-ink-500">“Simulate” buttons are prototype-only — owners decide in their own app.</span>
        </div>
      )}
    </article>
  );
}
