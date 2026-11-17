import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Eye, Pencil, RotateCcw, XCircle } from 'lucide-react';
import { RowActions } from '../../components/saas/RowActions';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Tabs, Textarea } from '../../prototype/Ui';
import { Checkbox } from '../../components/Checkbox';
import { useSaas } from '../../contexts/SaasContext';
import { Badge, Denied, EmptyRow, PageTitle, SummaryStrip, td, th, thAction, tdAction } from '../../components/saas/SaasBits';
import { fmtDate, fmtDateTime, segmentInfo } from '../../utils/saas';
import type { MessageTemplate } from '../../types/saas';
import { formatNumber, taka } from '../../utils/currency';

export function SmsAdmin() {
  const saas = useSaas();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(params.get('tab') ?? 'messages');
  const [tariffEdit, setTariffEdit] = useState<{ id: string; cost: string; confirmed: boolean } | null>(null);
  const [reject, setReject] = useState<{ id: string; note: string } | null>(null);
  const [templateEdit, setTemplateEdit] = useState<MessageTemplate | null>(null);
  const [error, setError] = useState('');
  if (!saas.can('sms.view')) return <Denied what="SMS administration" role={saas.staff.label} />;
  const { packages, tariffs, providers, smsMoves, smsMessages, marginThreshold } = saas.state;
  const tenants = saas.state.tenants;
  const senders = saas.state.senders.filter((s) => saas.inScope(s.tenantId));
  const messages = smsMessages.filter((m) => saas.inScope(m.tenantId)).sort((a, b) => (a.status === 'Failed' ? -1 : 0) - (b.status === 'Failed' ? -1 : 0) || b.at.localeCompare(a.at));
  const failed = messages.filter((m) => m.status === 'Failed');
  const canConfig = saas.canFor('sms.configure', null);
  const canTemplates = saas.canFor('announcements.edit', null) || saas.canFor('sms.edit', null);
  const smsPkgs = packages.filter((p) => p.kind === 'SMS');
  const maxCost = Math.max(...tariffs.map((t) => t.costPerSegment));
  const allConfirmed = tariffs.every((t) => t.confirmed);
  const run = (r: { ok: boolean; message: string }, done?: () => void) => (r.ok ? (toast.success(r.message), done?.()) : setError(r.message));

  const sold = smsMoves.filter((m) => m.kind === 'PURCHASE' || m.kind === 'BONUS' || m.kind === 'GRANT').reduce((n, m) => n + m.credits, 0);
  const sentSeg = smsMoves.filter((m) => m.kind === 'SENT').reduce((n, m) => n - m.credits, 0);
  const reserved = tenants.reduce((n, t) => n + t.smsReserved, 0);
  const providerSeg = smsMessages.reduce((n, m) => n + m.segments, 0);

  return (
    <div className="space-y-4">
      <PageTitle title="SMS" bn="এসএমএস" description="Messages, sender names, provider health, tariffs and reconciliation. Provider credentials live on the server only." />
      <SummaryStrip
        items={[
          { label: 'Credits issued', value: formatNumber(sold), helper: 'Purchases, bonuses, plan grants' },
          { label: 'Segments charged', value: formatNumber(sentSeg) },
          { label: 'Reserved now', value: formatNumber(reserved), helper: 'Scheduled sends' },
          { label: 'Providers', value: `${providers.filter((p) => p.status === 'Healthy').length}/${providers.length} healthy`, tone: providers.some((p) => p.status !== 'Healthy') ? 'warning' : 'success' },
          { label: 'Sender names pending', value: senders.filter((s) => s.status === 'Pending').length, tone: senders.some((s) => s.status === 'Pending') ? 'warning' : undefined },
        ]}
      />
      <section className="rounded-xl border border-ink-100 bg-white shadow-card">
        <Tabs label="SMS administration" value={tab} onChange={(v) => { setTab(v); setError(''); setParams(v === 'messages' ? {} : { tab: v }, { replace: true }); }} items={[{ id: 'messages', label: 'Messages', count: failed.length || undefined }, { id: 'templates', label: 'Owner templates', count: saas.state.templates.length }, { id: 'packages', label: 'Packages & margin' }, { id: 'tariffs', label: 'Supplier tariffs', count: tariffs.length }, { id: 'senders', label: 'Sender names', count: senders.filter((s) => s.status === 'Pending').length || undefined }, { id: 'providers', label: 'Provider health' }, { id: 'recon', label: 'Reconciliation' }]} />
        {error && <p role="alert" className="mx-4 mt-3 rounded-lg bg-danger-bg px-3 py-2 text-xs text-danger">{error}</p>}

        {tab === 'messages' && (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Message</th><th className={`${th} hidden md:table-cell`}>Business</th><th className={`${th} hidden lg:table-cell`}>Provider</th><th className={`${th} text-right`}>Segments</th><th className={th}>Status</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {messages.length === 0 && <EmptyRow cols={6} text="No messages in your businesses." />}
                {messages.map((m) => (
                  <tr key={m.id} className="border-b border-ink-100 last:border-0">
                    <td className={td}><span className="block max-w-[340px] truncate font-bn" title={m.text}>{m.text}</span><span className="block text-[11px] text-ink-500">{m.to} · {fmtDateTime(m.at)}{m.retries ? ` · retried ${m.retries}×` : ''}</span></td>
                    <td className={`${td} hidden md:table-cell`}>{tenants.find((t) => t.id === m.tenantId)?.name}</td>
                    <td className={`${td} hidden text-ink-600 lg:table-cell`}>{m.provider}</td>
                    <td className={`${td} text-right tabular-nums`}>{m.segments}<span className="block text-[11px] text-ink-500">{m.encoding}</span></td>
                    <td className={td}><Badge tone={m.status === 'Delivered' ? 'success' : m.status === 'Failed' ? 'danger' : 'info'} dot>{m.status}</Badge></td>
                    <td className={tdAction}>
                      <RowActions label={`Actions for message to ${m.to}`} items={[
                        { label: 'Open business', icon: Eye, onSelect: () => navigate(`/saas/tenants/${m.tenantId}?tab=plan`) },
                        { label: 'Retry on healthiest provider', icon: RotateCcw, hidden: m.status !== 'Failed' || !saas.canFor('sms.edit', m.tenantId), onSelect: () => run(saas.retryMessage(m.id)) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'templates' && (
          <ul className="divide-y divide-ink-100">
            {saas.state.templates.map((t) => (
              <li key={t.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-[13px]">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{t.name} <span className="font-normal text-ink-500">· {t.purpose} · {t.channel}</span></p>
                  <p className="mt-0.5 font-bn text-ink-700">{t.text}</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">{segmentInfo(t.text).encoding === 'Unicode' ? 'Bangla (Unicode)' : 'English (GSM)'} · {segmentInfo(t.text).segments} segment(s) before filling in business details</p>
                </div>
                {canTemplates && <Button kind="ghost" onClick={() => setTemplateEdit({ ...t })}>Edit</Button>}
              </li>
            ))}
          </ul>
        )}

        {tab === 'packages' && (
          <>
            <div className="overflow-x-auto">
              <table data-erp-table className="w-full text-[13px]">
                <thead><tr className="border-b border-ink-100"><th className={th}>Package</th><th className={`${th} text-right`}>Price</th><th className={`${th} text-right`}>Credits</th><th className={`${th} text-right`}>Per credit</th><th className={`${th} text-right`}>Est. margin</th><th className={th}>Status</th></tr></thead>
                <tbody>
                  {smsPkgs.map((p) => {
                    const per = p.priceBdt / p.smsCredits;
                    const margin = Math.round(((per - maxCost) / per) * 100);
                    return (
                      <tr key={p.id} className="border-b border-ink-100 last:border-0">
                        <td className={td}><span className="font-medium">{p.name}</span><span className="block text-[11px] text-ink-500">Valid {p.smsExpiryDays} days</span></td>
                        <td className={`${td} text-right tabular-nums`}>{taka(p.priceBdt)}</td>
                        <td className={`${td} text-right tabular-nums`}>{formatNumber(p.smsCredits)}</td>
                        <td className={`${td} text-right tabular-nums`}>৳{per.toFixed(2)}</td>
                        <td className={`${td} text-right tabular-nums ${margin < marginThreshold ? 'text-danger' : 'text-ink'}`}>{margin}%{margin < marginThreshold && <span className="block text-[11px]">Below {marginThreshold}%</span>}</td>
                        <td className={td}><Badge tone={p.status === 'ACTIVE' ? 'success' : 'neutral'} dot>{p.status === 'ACTIVE' ? 'Active' : p.status.toLowerCase()}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">
              <span>Margin uses the highest tariff (৳{maxCost.toFixed(2)}/segment). {allConfirmed ? '' : 'Tariffs are not supplier-confirmed — treat as an estimate, not profit.'} Edit SMS packs in Catalog › Add-ons.</span>
              <span className="flex items-center gap-2">Warn below
                <input type="number" defaultValue={marginThreshold} disabled={!canConfig} aria-label="Margin warning threshold" onBlur={(e) => { const r = saas.setMargin(Number(e.target.value)); if (!r.ok) setError(r.message); }} className="ref-control h-9 w-16 rounded-md border border-input bg-card px-2 text-right text-[13px] disabled:bg-ink-50" />%
              </span>
            </div>
          </>
        )}

        {tab === 'tariffs' && (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Provider</th><th className={th}>Route</th><th className={`${th} text-right`}>Cost / segment</th><th className={th}>Source</th><th className={th}>Effective</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {tariffs.map((t) => (
                  <tr key={t.id} className="border-b border-ink-100 last:border-0">
                    <td className={td}>{providers.find((p) => p.id === t.providerId)?.name}</td>
                    <td className={td}>{t.route}</td>
                    <td className={`${td} text-right tabular-nums`}>৳{t.costPerSegment.toFixed(2)}</td>
                    <td className={td}><Badge tone={t.confirmed ? 'success' : 'warning'}>{t.confirmed ? 'Supplier-confirmed' : 'Sample — not confirmed'}</Badge></td>
                    <td className={`${td} text-ink-500`}>{fmtDate(t.effectiveFrom)}</td>
                    <td className={tdAction}>
                      <RowActions label={`Actions for ${t.route} tariff`} items={[{ label: 'Edit tariff', icon: Pencil, hidden: !canConfig, onSelect: () => setTariffEdit({ id: t.id, cost: String(t.costPerSegment), confirmed: t.confirmed }) }]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'senders' && (
          <div className="overflow-x-auto">
            <table data-erp-table className="w-full text-[13px]">
              <thead><tr className="border-b border-ink-100"><th className={th}>Sender name</th><th className={th}>Business</th><th className={th}>Submitted</th><th className={th}>Status</th><th className={thAction}>Action</th></tr></thead>
              <tbody>
                {senders.length === 0 && <EmptyRow cols={5} text="No sender name requests." />}
                {senders.map((s) => (
                  <tr key={s.id} className="border-b border-ink-100 last:border-0">
                    <td className={`${td} font-medium`}>{s.sender}</td>
                    <td className={td}>{tenants.find((t) => t.id === s.tenantId)?.name}<span className="block text-[11px] text-ink-500">{s.note}</span></td>
                    <td className={`${td} text-ink-500`}>{fmtDate(s.submittedAt)}</td>
                    <td className={td}><Badge tone={s.status === 'Approved' ? 'success' : s.status === 'Rejected' ? 'danger' : 'warning'} dot>{s.status}</Badge></td>
                    <td className={tdAction}>
                      <RowActions label={`Actions for sender ${s.sender}`} items={[
                        { label: 'Approve sender name', icon: CheckCircle2, hidden: s.status !== 'Pending' || !saas.canFor('sms.configure', s.tenantId), onSelect: () => run(saas.decideSender(s.id, true, 'Approved by provider')) },
                        { label: 'Reject…', icon: XCircle, tone: 'danger', divider: true, hidden: s.status !== 'Pending' || !saas.canFor('sms.configure', s.tenantId), onSelect: () => setReject({ id: s.id, note: '' }) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'providers' && (
          <ul className="divide-y divide-ink-100">
            {providers.map((p) => (
              <li key={p.id} className="grid gap-2 px-4 py-3 text-[13px] sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-6">
                <span><span className="font-medium">{p.name}</span><span className="block text-[11px] text-ink-500">{p.routes} · checked {fmtDateTime(p.lastCheck)}</span></span>
                <span className="tabular-nums"><span className="text-[11px] text-ink-500">Delivered </span>{p.deliveryRate}%</span>
                <span className="tabular-nums"><span className="text-[11px] text-ink-500">Latency </span>{p.latencySec}s</span>
                <Badge tone={p.status === 'Healthy' ? 'success' : p.status === 'Degraded' ? 'warning' : 'danger'} dot>{p.status}</Badge>
              </li>
            ))}
            <li className="px-4 py-2 text-[11px] text-ink-500">Health checks, failover and API keys run on the server. No credentials are stored in this app.</li>
          </ul>
        )}

        {tab === 'recon' && (
          <div className="space-y-2 p-4 text-[13px]">
            <dl className="divide-y divide-ink-100 rounded-lg border border-ink-100">
              {[
                ['Segments charged to businesses', formatNumber(sentSeg)],
                ['Segments in provider delivery reports (sample)', formatNumber(providerSeg)],
                ['Failed messages to refund', String(smsMessages.filter((m) => m.status === 'Failed').length)],
                ['Reserved, not yet sent', formatNumber(reserved)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 px-3 py-2"><dt className="text-ink-600">{k}</dt><dd className="font-medium tabular-nums">{v}</dd></div>
              ))}
            </dl>
            <p className="text-xs text-warning">Difference: {formatNumber(Math.abs(sentSeg - providerSeg))} segments. Sample data doesn’t include every provider report — real matching needs the provider statement import.</p>
          </div>
        )}
      </section>

      {tariffEdit && (
        <Modal title="Edit tariff" onClose={() => setTariffEdit(null)} footer={<><Button onClick={() => setTariffEdit(null)}>Cancel</Button><Button kind="primary" onClick={() => run(saas.setTariff(tariffEdit.id, Number(tariffEdit.cost), tariffEdit.confirmed), () => setTariffEdit(null))}>Save</Button></>}>
          <div className="space-y-3 text-[13px]">
            <Field label="Cost per segment (৳)"><Input type="number" step="0.01" value={tariffEdit.cost} onChange={(cost) => setTariffEdit({ ...tariffEdit, cost })} /></Field>
            <label className="flex items-start gap-3"><span className="flex h-5 items-center"><Checkbox checked={tariffEdit.confirmed} onCheckedChange={(v: boolean) => setTariffEdit({ ...tariffEdit, confirmed: v })} /></span><span>Confirmed in the supplier’s written rate card</span></label>
            {error && <p role="alert" className="text-xs text-danger">{error}</p>}
          </div>
        </Modal>
      )}
      {templateEdit && (
        <Modal title={`Edit template · ${templateEdit.name}`} onClose={() => setTemplateEdit(null)} footer={<><Button onClick={() => setTemplateEdit(null)}>Cancel</Button><Button kind="primary" onClick={() => run(saas.saveTemplate(templateEdit), () => setTemplateEdit(null))}>Save</Button></>}>
          <div className="space-y-3 text-[13px]">
            <Field label="Name"><Input value={templateEdit.name} onChange={(name) => setTemplateEdit({ ...templateEdit, name })} /></Field>
            <Field label="Message" hint="Placeholders: {business} {plan} {date} {used} {limit} {what} {suggested} {newLimit} {diff} {pct} {nextStep} {graceEnds}"><Textarea value={templateEdit.text} onChange={(text) => setTemplateEdit({ ...templateEdit, text })} /></Field>
            <p className="text-[11px] text-ink-500">{segmentInfo(templateEdit.text).chars} characters · {segmentInfo(templateEdit.text).segments} segment(s)</p>
            {error && <p role="alert" className="text-xs text-danger">{error}</p>}
          </div>
        </Modal>
      )}
      {reject && (
        <Modal title="Reject sender name" onClose={() => setReject(null)} footer={<><Button onClick={() => setReject(null)}>Cancel</Button><Button kind="danger" onClick={() => run(saas.decideSender(reject.id, false, reject.note), () => setReject(null))}>Reject</Button></>}>
          <Field label="Note the business will see"><Input value={reject.note} onChange={(note) => setReject({ ...reject, note })} /></Field>
        </Modal>
      )}
    </div>
  );
}
