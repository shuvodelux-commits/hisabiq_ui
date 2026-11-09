import React from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useSaas } from '../../../contexts/SaasContext';
import { SettingCard } from '../../settings/SettingCard';
import { Badge, SummaryStrip, sourceMeta } from '../SaasBits';
import { daysBetween, fmtDateTime, NOW } from '../../../utils/saas';
import { SignalsPanel } from './SignalsPanel';
import type { Tenant } from '../../../types/saas';

type Props = { tenant: Tenant; onTab: (id: string) => void };

export function OverviewTab({ tenant, onTab }: Props) {
  const saas = useSaas();
  const features = saas.featuresFor(tenant.id);
  const active = features.filter((f) => f.status === 'Active');
  const orders = saas.state.orders.filter((o) => o.tenantId === tenant.id);
  const tickets = saas.state.tickets.filter((t) => t.tenantId === tenant.id && t.status !== 'Resolved');
  const access = saas.state.access.filter((a) => a.tenantId === tenant.id && (a.state === 'REQUESTED' || a.state === 'APPROVED'));
  const events = saas.state.audit.filter((e) => e.tenantId === tenant.id).slice(0, 6);
  const paid = orders.filter((o) => o.state === 'COMPLETED').reduce((n, o) => n + o.total, 0);
  const storagePct = Math.round((tenant.storageUsedMb / tenant.storageLimitMb) * 100);

  const attention: { text: string; tab: string; tone: 'danger' | 'warning' }[] = [];
  if (tenant.expiryNote) attention.push({ text: tenant.expiryNote, tab: 'plan', tone: 'danger' });
  if (tenant.status === 'Grace') attention.push({ text: `Grace period — plan ended ${tenant.expiresAt}. Renewal needed within 7 days.`, tab: 'plan', tone: 'warning' });
  if (tenant.expiresAt && tenant.status === 'Active' && daysBetween(NOW, tenant.expiresAt) <= 7) attention.push({ text: `Plan ends in ${daysBetween(NOW, tenant.expiresAt)} days.`, tab: 'plan', tone: 'warning' });
  for (const o of orders.filter((o) => o.state === 'VERIFICATION_PENDING' || o.state === 'ACTIVATION_PENDING')) attention.push({ text: `${o.id} ${o.terms.name} · ৳${o.total} — ${o.state === 'VERIFICATION_PENDING' ? 'verify payment' : 'paid, activate benefits'}`, tab: 'plan', tone: 'warning' });
  if (storagePct >= 90) attention.push({ text: `Storage ${storagePct}% used. Read-only for new attachments above the limit.`, tab: 'plan', tone: storagePct > 100 ? 'danger' : 'warning' });
  for (const a of access) attention.push({ text: `Support change ${a.id} ${a.state === 'REQUESTED' ? 'waiting for owner consent' : 'approved — apply before it expires'}`, tab: 'support', tone: 'warning' });
  for (const t of tickets.filter((t) => t.priority === 'High')) attention.push({ text: `${t.id}: ${t.subject}`, tab: 'support', tone: 'danger' });

  return (
    <div className="space-y-3">
      <SummaryStrip
        items={[
          { label: 'Active features', value: active.length, helper: `${active.filter((f) => f.source !== 'PLAN').length} beyond the plan` },
          { label: 'Storage', value: `${storagePct}%`, tone: storagePct >= 90 ? 'danger' : undefined, helper: `${(tenant.storageUsedMb / 1024).toFixed(1)} of ${(tenant.storageLimitMb / 1024).toFixed(1)} GB` },
          { label: 'Invoices this month', value: tenant.monthlyInvoices },
          { label: 'Paid to HisabIQ', value: `৳${paid.toLocaleString('en-IN')}`, helper: `${orders.filter((o) => o.state === 'COMPLETED').length} completed orders` },
          { label: 'Open tickets', value: tickets.length, tone: tickets.length ? 'warning' : undefined },
        ]}
      />

      <SignalsPanel tenant={tenant} />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <SettingCard title="Needs attention" titleBn="এখনই দেখুন" bodyClassName="">
          {attention.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-500">Nothing needs action for this business.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {attention.map((a, i) => (
                <li key={i}>
                  <button type="button" onClick={() => onTab(a.tab)} className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-[13px] hover:bg-ink-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
                    <AlertTriangle className={`mt-0.5 size-3.5 shrink-0 ${a.tone === 'danger' ? 'text-danger' : 'text-warning'}`} aria-hidden="true" />
                    <span className="flex-1 text-ink-700">{a.text}</span>
                    <ChevronRight className="mt-0.5 size-4 text-ink-300" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SettingCard>

        <SettingCard title="What this business has" titleBn="সুবিধা" bodyClassName="" actions={<button type="button" onClick={() => onTab('plan')} className="text-xs font-medium text-teal-700 hover:underline">Details</button>}>
          <ul className="divide-y divide-ink-100 text-[13px]">
            {(['PLAN', 'PURCHASE', 'TRIAL', 'GRANT'] as const).map((s) => {
              const list = active.filter((f) => f.source === s);
              if (!list.length) return null;
              return (
                <li key={s} className="flex items-start justify-between gap-3 px-4 py-2">
                  <Badge tone={sourceMeta[s].tone}>{sourceMeta[s].label}</Badge>
                  <span className="text-right text-xs text-ink-600">{list.length} feature{list.length > 1 ? 's' : ''}{list[0].expiresAt ? ` · until ${list[0].expiresAt}` : ''}</span>
                </li>
              );
            })}
            {active.length === 0 && <li className="px-4 py-4 text-center text-xs text-ink-500">No active features — account suspended.</li>}
          </ul>
        </SettingCard>
      </div>

      <SettingCard title="Recent activity" titleBn="সাম্প্রতিক" bodyClassName="" actions={<button type="button" onClick={() => onTab('history')} className="text-xs font-medium text-teal-700 hover:underline">Full history</button>}>
        <ul className="divide-y divide-ink-100 text-[13px]">
          {events.length === 0 && <li className="px-4 py-4 text-center text-xs text-ink-500">No recorded activity yet.</li>}
          {events.map((e) => (
            <li key={e.id} className="grid gap-x-3 px-4 py-2 sm:grid-cols-[140px_1fr]">
              <span className="text-[11px] text-ink-500">{fmtDateTime(e.at)}</span>
              <span className="min-w-0 text-ink-700">
                <span className="font-medium text-ink">{e.actor}</span> · {e.summary}
              </span>
            </li>
          ))}
        </ul>
      </SettingCard>
    </div>
  );
}
