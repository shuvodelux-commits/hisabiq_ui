import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button, Field, Modal, Select } from '../../prototype/Ui';
import { useSaas, effectivePlan } from '../../contexts/SaasContext';
import { planFit, setupProgress } from '../../utils/saasSignals';
import { addDays, fmtDate, fmtDateTime, segmentInfo } from '../../utils/saas';
import { planProductLimit } from '../../data/saasSeeds';
import type { Tenant } from '../../types/saas';

/** Fills a template with this business's real numbers before sending. */
export function fillTemplate(text: string, t: Tenant, graceDays: number): string {
  const plan = effectivePlan(t);
  const fit = planFit(t, plan);
  const over = fit.meters.find((m) => m.key !== 'sms' && m.pct >= 80) ?? fit.meters[0];
  const setup = setupProgress(t);
  const next = fit.suggestion?.plan;
  const vars: Record<string, string> = {
    plan: t.planCode.charAt(0) + t.planCode.slice(1).toLowerCase(),
    date: fmtDate(t.expiresAt),
    business: t.name,
    days: String(Math.max(0, graceDays - Math.max(0, Math.round((Date.parse('2026-10-25') - Date.parse(t.expiresAt ?? '2026-10-25')) / 86400000)))),
    used: over.used.toLocaleString('en-IN'),
    limit: over.limit.toLocaleString('en-IN'),
    what: over.label.toLowerCase(),
    suggested: next ? next.charAt(0) + next.slice(1).toLowerCase() : 'A higher plan',
    newLimit: next ? `${planProductLimit[next].toLocaleString('en-IN')} products` : 'more room',
    diff: String(fit.suggestion?.diff ?? 0),
    pct: String(setup.pct),
    nextStep: setup.next ?? 'nothing — all done',
    graceEnds: fmtDate(addDays(t.expiresAt ?? '2026-10-25', graceDays)),
  };
  return text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export function MessageOwnerDialog({ tenantId, templateId, onClose }: { tenantId: string; templateId: string; onClose: () => void }) {
  const saas = useSaas();
  const t = saas.state.tenants.find((x) => x.id === tenantId);
  const [tpl, setTpl] = useState(templateId);
  const [error, setError] = useState('');
  if (!t) return null;
  const template = saas.state.templates.find((x) => x.id === tpl) ?? saas.state.templates[0];
  const text = fillTemplate(template.text, t, saas.state.settings.graceDays);
  const seg = segmentInfo(text);

  return (
    <Modal
      title={`Message ${t.owner}`}
      onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.sendNudge(t.id, template.id); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Send {template.channel === 'SMS' ? 'SMS' : 'in-app'}</Button></>}
    >
      <div className="space-y-3 text-[13px]">
        <p className="text-ink-600">{t.name} · {t.phone}</p>
        <Field label="Template"><Select value={tpl} onChange={setTpl} options={saas.state.templates.map((x) => ({ value: x.id, label: `${x.name} · ${x.channel}` }))} /></Field>
        <div className="rounded-lg border border-ink-100 bg-ink-50 p-3">
          <p className="whitespace-pre-wrap font-bn text-ink">{text}</p>
          {template.channel === 'SMS' && <p className="mt-2 text-[11px] text-ink-500">{seg.encoding === 'Unicode' ? 'Bangla (Unicode)' : 'English (GSM)'} · {seg.chars} characters · {seg.segments} segment{seg.segments === 1 ? '' : 's'} · from HisabIQ’s own credits, not the business’s</p>}
        </div>
        {t.reminders.length > 0 && (
          <div>
            <p className="text-xs font-medium text-ink-500">Already sent</p>
            <ul className="mt-1 space-y-0.5 text-xs text-ink-600">
              {t.reminders.slice(0, 3).map((r, i) => <li key={i}>{fmtDateTime(r.at)} · {r.channel} · {r.template} · {r.by}</li>)}
            </ul>
          </div>
        )}
        <p className="text-[11px] text-ink-500">Messages never change the plan. The owner decides.</p>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
