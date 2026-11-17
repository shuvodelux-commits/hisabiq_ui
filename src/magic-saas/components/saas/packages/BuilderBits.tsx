import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button, Field, Input, Modal, Tabs } from '../../../prototype/Ui';
import type { Issue } from '../../../utils/saas';

export const steps = [
  { id: 'details', label: '1. Details' },
  { id: 'benefits', label: '2. Benefits & Price' },
  { id: 'eligibility', label: '3. Eligibility & Dates' },
  { id: 'review', label: '4. Review' },
];

type ShellProps = {
  title: string;
  subtitle: string;
  step: string;
  onStep: (id: string) => void;
  issues: Issue[];
  canEdit: boolean;
  canPublish: boolean;
  dirty: boolean;
  onCancel: () => void;
  onSave: () => void;
  onPublish: () => void;
  children: React.ReactNode;
};

/** Shared 4-step builder frame: underline step tabs, sticky footer with Save draft / Publish. */
export function BuilderShell({ title, subtitle, step, onStep, issues, canEdit, canPublish, dirty, onCancel, onSave, onPublish, children }: ShellProps) {
  const errors = issues.filter((i) => i.level === 'error').length;
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <section className="rounded-xl border border-ink-100 bg-white shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-2 px-4 pt-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          <p className="text-xs text-ink-500">{subtitle}</p>
        </div>
        {!canEdit && <span className="rounded bg-ink-50 px-2 py-1 text-[11px] text-ink-600">View only</span>}
      </header>
      <Tabs label="Builder steps" value={step} onChange={onStep} items={steps.map((s) => ({ ...s, count: s.id === 'review' && errors ? errors : undefined }))} />
      <fieldset disabled={!canEdit} className="min-w-0 space-y-4 p-4">
        {children}
      </fieldset>
      <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t border-ink-100 bg-white px-4 py-3">
        <span className={`text-xs ${errors ? 'text-danger' : dirty ? 'font-medium text-warning' : 'text-ink-500'}`}>{errors ? `${errors} issue${errors > 1 ? 's' : ''} to fix before publishing` : dirty ? 'Unsaved changes' : 'No changes'}</span>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onCancel}>{dirty ? 'Discard' : 'Close'}</Button>
          {idx > 0 && <Button kind="ghost" onClick={() => onStep(steps[idx - 1].id)}>Back</Button>}
          {idx < steps.length - 1 ? (
            <Button kind="primary" onClick={() => onStep(steps[idx + 1].id)}>Next</Button>
          ) : (
            <>
              {canEdit && <Button onClick={onSave} disabled={!dirty}>Save draft</Button>}
              <Button kind="primary" disabled={!canPublish || errors > 0} title={!canPublish ? 'Only staff with publish permission can publish' : undefined} onClick={onPublish}>Review & publish</Button>
            </>
          )}
        </div>
      </footer>
    </section>
  );
}

export function IssueList({ issues }: { issues: Issue[] }) {
  if (!issues.length)
    return (
      <p className="flex items-center gap-1.5 rounded-lg bg-success-bg px-3 py-2 text-xs text-success">
        <CheckCircle2 className="size-3.5" /> All checks passed.
      </p>
    );
  return (
    <ul className="space-y-1">
      {issues.map((i) => (
        <li key={i.text} className={`flex items-start gap-1.5 rounded-lg px-3 py-1.5 text-xs ${i.level === 'error' ? 'bg-danger-bg text-danger' : 'bg-warning-bg text-warning'}`}>
          {i.level === 'error' ? <AlertCircle className="mt-0.5 size-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />}
          {i.text}
        </li>
      ))}
    </ul>
  );
}

export function Advanced({ children, label = 'Advanced' }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-ink-100">
      <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-3 py-2 text-[13px] font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
        {label}
        <ChevronDown className={`size-4 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="space-y-4 border-t border-ink-100 p-3">{children}</div>}
    </div>
  );
}

export function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-100">
      <p className="border-b border-ink-100 px-3 py-2 text-xs font-medium text-ink-500">{title}</p>
      <div className="p-3 text-[13px]">{children}</div>
    </div>
  );
}

export function PublishDialog({ name, impact, onClose, onConfirm }: { name: string; impact: string[]; onClose: () => void; onConfirm: (summary: string) => void }) {
  const [summary, setSummary] = useState('');
  return (
    <Modal
      title={`Publish ${name}?`}
      onClose={onClose}
      footer={<><Button onClick={onClose}>Keep editing</Button><Button kind="primary" disabled={!summary.trim()} onClick={() => onConfirm(summary.trim())}>Publish</Button></>}
    >
      <div className="space-y-3 text-[13px]">
        <ul className="list-disc space-y-1 pl-5 text-ink-700">{impact.map((i) => <li key={i}>{i}</li>)}</ul>
        <Field label="What changed (saved with the version)"><Input value={summary} onChange={setSummary} placeholder="e.g. Added 100 SMS each month" /></Field>
      </div>
    </Modal>
  );
}
