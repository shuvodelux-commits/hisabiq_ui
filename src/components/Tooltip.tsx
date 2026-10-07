import React from 'react';
import { Info } from 'lucide-react';

export function Tooltip({
  content,
  label = 'More information'
}: {
  content: React.ReactNode;
  label?: string;
}) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="inline-flex size-4 items-center justify-center rounded text-helper outline-none hover:text-ink-500 focus-visible:ring-2 focus-visible:ring-teal-500/30">
        <Info className="size-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-[130] mt-1.5 hidden w-64 -translate-x-1/2 rounded-lg border border-border bg-inverse px-2.5 py-2 text-left text-[11px] font-normal leading-relaxed text-white shadow-pop group-hover:block group-focus-within:block">
        {content}
      </span>
    </span>
  );
}

