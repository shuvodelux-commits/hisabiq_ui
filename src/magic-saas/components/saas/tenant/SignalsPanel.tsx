import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../prototype/Ui';
import { useSaas, effectivePlan } from '../../../contexts/SaasContext';
import { SettingCard } from '../../settings/SettingCard';
import { Badge, MeterBar } from '../SaasBits';
import { MessageOwnerDialog } from '../MessageOwnerDialog';
import { businessHealth, healthTone, moduleAdoption, planFit, setupProgress } from '../../../utils/saasSignals';
import { setupSteps } from '../../../data/saasOpsSeeds';
import type { Tenant } from '../../../types/saas';

/** Health, setup, plan fit and module use — what the business actually does in the ERP. */
export function SignalsPanel({ tenant }: { tenant: Tenant }) {
  const saas = useSaas();
  const [message, setMessage] = useState<string | null>(null);
  const plan = effectivePlan(tenant);
  const open = saas.state.tickets.filter((t) => t.tenantId === tenant.id && t.status !== 'Resolved').length;
  const health = businessHealth(tenant, open);
  const setup = setupProgress(tenant);
  const fit = planFit(tenant, plan);
  const active = new Set(saas.featuresFor(tenant.id).filter((f) => f.status === 'Active').map((f) => f.feature));
  const modules = moduleAdoption(tenant, active);
  const canMessage = saas.canFor('subscriptions.edit', tenant.id) || saas.canFor('invoices.edit', tenant.id);

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <SettingCard title="Health" titleBn="অবস্থা" bodyClassName="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <Badge tone={healthTone[health.level]} dot>{health.level}</Badge>
          <span className="text-xs tabular-nums text-ink-500">Score {health.score}/100</span>
        </div>
        <ul className="space-y-1 text-[13px]">
          {health.signals.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${s.tone === 'danger' ? 'bg-danger' : s.tone === 'warning' ? 'bg-warning' : 'bg-success'}`} aria-hidden="true" />
              <span className="text-ink-700">{s.text}</span>
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-ink-500">From ERP activity: sales, cash sessions, reconciliation, stock and SMS.</p>
      </SettingCard>

      <SettingCard title={`Setup ${setup.pct}%`} titleBn="সেটআপ" bodyClassName="space-y-2 p-4">
        <ul className="grid gap-1 text-[13px]">
          {setupSteps.map((s) => (
            <li key={s.key} className="flex items-center gap-2">
              {tenant.erp.setup[s.key] ? <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="Done" /> : <Circle className="size-4 shrink-0 text-ink-300" aria-label="Not done" />}
              <span className={tenant.erp.setup[s.key] ? 'text-ink-500' : 'text-ink'}>{s.label}</span>
            </li>
          ))}
        </ul>
        {setup.stuck && (saas.canFor('services.edit', tenant.id) || saas.canFor('tickets.edit', tenant.id)) && (
          <Button onClick={() => { const r = saas.requestGuidedSetup(tenant.id); r.ok ? toast.success(r.message) : toast.error(r.message); }}>Offer guided setup ৳399</Button>
        )}
      </SettingCard>

      <SettingCard title="Plan fit" titleBn="প্ল্যান উপযোগিতা" bodyClassName="space-y-3 p-4">
        {fit.meters.map((m) => <MeterBar key={m.key} label={m.label} value={`${m.used.toLocaleString('en-IN')} / ${m.limit.toLocaleString('en-IN')}`} pct={m.pct} />)}
        {fit.suggestion ? (
          <div className="rounded-lg bg-info-bg px-3 py-2 text-xs text-info">
            Suggest {fit.suggestion.plan} (+৳{fit.suggestion.diff}/month) — {fit.suggestion.reason}.
            {canMessage && <div className="mt-1.5"><Button onClick={() => setMessage('TPL-UPGRADE')}>Send upgrade nudge</Button></div>}
          </div>
        ) : fit.atTop ? <p className="text-xs text-ink-500">On the top plan.</p> : <p className="text-xs text-ink-500">Comfortably within {plan} limits.</p>}
        {fit.smsLow && <p className="text-xs text-warning">SMS balance covers less than a week at the current rate.</p>}
      </SettingCard>

      <SettingCard title="Modules (30 days)" titleBn="মডিউল ব্যবহার" bodyClassName="">
        <ul className="divide-y divide-ink-100 text-[13px] lg:col-span-3">
          {modules.map((m) => (
            <li key={m.key} className="flex items-center justify-between gap-3 px-4 py-1.5">
              <span className="text-ink-700">{m.label}</span>
              <span className="flex items-center gap-2 text-xs tabular-nums text-ink-500">
                {m.allowed ? `${m.uses} uses` : m.locked ? `${m.locked} blocked tries` : ''}
                <Badge tone={m.status === 'Using' ? 'success' : m.status === 'Locked — tried' ? 'warning' : m.status === 'Paid, unused' ? 'info' : 'neutral'}>{m.status}</Badge>
              </span>
            </li>
          ))}
        </ul>
      </SettingCard>
      {message && <MessageOwnerDialog tenantId={tenant.id} templateId={message} onClose={() => setMessage(null)} />}
    </div>
  );
}
