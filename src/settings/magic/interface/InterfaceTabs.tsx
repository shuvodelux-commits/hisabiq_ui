import type { KeyboardEvent } from 'react';
import { motion, LayoutGroup, useReducedMotion } from 'framer-motion';

/** Source Magic's Party Ledger-style underline tabs, scoped to this UI preview. */
export function Tabs({ items, value, onChange, label = 'Section tabs' }: {
  items: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const key = event.key;
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    const i = key === 'Home' ? 0 : key === 'End' ? items.length - 1 :
      key === 'ArrowRight' ? (index + 1) % items.length : (index + items.length - 1) % items.length;
    onChange(items[i].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[i]?.focus();
  };
  return (
    <LayoutGroup>
      <div role="tablist" aria-label={label} data-hisabiq-ledger-tabs=""
        className="flex gap-1 overflow-x-auto border-b border-ink-100 px-3 scrollbar-thin">
        {items.map((t, index) => {
          const active = value === t.id;
          return (
            <button key={t.id} type="button" role="tab" aria-selected={active}
              tabIndex={active ? 0 : -1} onClick={() => onChange(t.id)}
              onKeyDown={event => onKey(event, index)}
              className={'relative flex h-11 shrink-0 items-center gap-1.5 px-2.5 text-[13px] font-medium transition-colors duration-150 focus-visible:rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500/30 ' +
                (active ? 'text-ink' : 'text-ink-500 hover:text-ink')}>
              {t.label}
              {t.count !== undefined && <span className="rounded-md bg-ink-50 px-1.5 text-[11px]">{t.count}</span>}
              {active && <motion.span layoutId="interface-preview-underline" aria-hidden="true"
                transition={{duration: reduced ? 0 : 0.2, ease: [0.16, 1, 0.3, 1]}}
                className="absolute inset-x-0 bottom-0 h-0.5 bg-teal-600" />}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
