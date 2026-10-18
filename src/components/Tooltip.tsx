import React, {useId} from 'react';
import { Info } from 'lucide-react';

export function Tooltip({
  content,
  label = 'More information',
  align = 'center',
  triggerClassName = ''
}: {
  content: React.ReactNode;
  label?: string;
  align?: 'start' | 'center' | 'end';
  triggerClassName?: string;
}) {
  const contentId = useId();
  const alignClass = align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2';
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={contentId}
        className={`inline-flex size-4 items-center justify-center rounded text-helper outline-none hover:text-ink-500 focus-visible:ring-2 focus-visible:ring-teal-500/30 ${triggerClassName}`}>
        <Info className="size-3.5" />
      </button>
      <span
        id={contentId}
        role="tooltip"
        className={`pointer-events-none absolute top-full z-[130] mt-1.5 hidden w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-inverse px-2.5 py-2 text-left text-[11px] font-normal leading-relaxed text-white shadow-pop group-hover:block group-focus-within:block ${alignClass}`}>
        {content}
      </span>
    </span>
  );
}
