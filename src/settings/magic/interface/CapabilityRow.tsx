import { useState } from 'react';
import { Check, Info, Loader2 } from 'lucide-react';
import { SettingsToggle } from '../SettingsToggle';

import type { CapabilityDescriptor } from './experienceTypes';

type CapabilityRowProps = {
  descriptor: CapabilityDescriptor;
  /** switch = immediate preview state; checkbox = staged business default awaiting review */
  mode: 'switch' | 'checkbox';
  checked: boolean;
  onChange: (v: boolean) => void;
  source: string;
  changed: boolean;
  blockedBy: CapabilityDescriptor | null;
  saving?: boolean;
  saved?: boolean;
};

export function CapabilityRow({ descriptor: d, mode, checked, onChange, source, changed, blockedBy, saving = false, saved = false }: CapabilityRowProps) {
  const [why, setWhy] = useState(false);
  const off = !!blockedBy;
  const value = checked && !off;

  const text = (
    <>
      <span className={`flex flex-wrap items-center gap-1.5 text-[13px] font-medium ${off ? 'text-ink-500' : 'text-ink'}`}>
        {d.label}
        {changed && <span className="rounded-md bg-warning-bg px-1.5 py-0.5 text-[11px] font-medium text-warning">Unsaved</span>}
      </span>
      <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
        {d.helper} <span className="font-bn text-[11px] text-ink-400">{d.labelBn}</span>
      </span>
    </>
  );

  return (
    <div className="py-3" data-capability={d.key}>
      <div className="flex items-start justify-between gap-4">
        <label htmlFor={`settings-capability-${d.key}`} className={`min-w-0 pt-1 ${off ? 'cursor-not-allowed' : 'cursor-pointer'}`}>{text}</label>
        <div className="flex shrink-0 items-center gap-2">
          {mode === 'switch' && saving ? (
            <span className="flex items-center gap-1 text-[11px] text-ink-500">
              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
              Saving…
            </span>
          ) : mode === 'switch' && saved ? (
            <span className="flex items-center gap-1 text-[11px] text-success">
              <Check className="size-3" aria-hidden="true" />
              Saved
            </span>
          ) : null}
          <SettingsToggle
            id={`settings-capability-${d.key}`}
            checked={value}
            onCheckedChange={onChange}
            disabled={off || saving}
            aria-label={d.label}
          />
        </div>
      </div>
      <div>
        {off && <p className="mt-1 text-[11px] text-warning">Turn on “{blockedBy!.label}” first.</p>}
        <button
          type="button"
          onClick={() => setWhy((w) => !w)}
          aria-expanded={why}
          className="mt-1 inline-flex items-center gap-1 rounded text-[11px] text-ink-500 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <Info className="size-3" aria-hidden="true" />
          Why is it {value ? 'on' : 'off'}?
        </button>
        {why && (
          <p className="mt-1 text-[11px] leading-relaxed text-ink-600">
            {off ? `It depends on “${blockedBy!.label}”. ` : ''}Comes from: <b className="font-medium text-ink">{source}</b>.
            {d.basicRoute && <> When off, use {d.basicRoute}.</>}
          </p>
        )}
      </div>
    </div>
  );
}
