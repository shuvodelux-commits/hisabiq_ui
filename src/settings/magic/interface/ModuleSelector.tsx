import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { experienceModules } from './experienceCatalog';
import { Input } from '../../../components/Input';

type ModuleSelectorProps = {
  value: string;
  onChange: (id: string) => void;
  /** Number of controls the current plan/role makes available per module */
  counts: Record<string, number>;
};

/** One searchable module selector instead of a long row of module tabs (KISS §3). */
export function ModuleSelector({ value, onChange, counts }: ModuleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const list = experienceModules.filter((m) => `${m.label} ${m.labelBn}`.toLowerCase().includes(query.toLowerCase()));
  const current = experienceModules.find((m) => m.id === value) ?? experienceModules[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrap} className="relative w-full sm:w-72">
      <span className="mb-1 block text-[12px] font-medium text-ink-700">Module</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="ref-control flex w-full items-center justify-between gap-2 rounded-lg border border-ink-200 bg-card px-3 text-left text-[13px] text-ink"
      >
        <span className="truncate">
          {current.label} <span className="font-bn text-[11px] text-ink-400">{current.labelBn}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-ink-400" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-30 mt-1 rounded-lg border border-ink-100 bg-card p-1.5 shadow-pop">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(list.length - 1, a + 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(0, a - 1));
                } else if (e.key === 'Enter' && list[active]) {
                  e.preventDefault();
                  choose(list[active].id);
                } else if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="Search modules"
              aria-label="Search modules"
              className="ref-control w-full rounded-md border border-ink-100 bg-card pl-8 pr-2 text-[13px]"
            />
          </div>
          <ul role="listbox" aria-label="Modules" className="mt-1 max-h-64 overflow-y-auto">
            {list.map((m, i) => {
              const n = counts[m.id] ?? 0;
              return (
                <li key={m.id} role="option" aria-selected={m.id === value}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(m.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] ${i === active ? 'bg-ink-50' : ''}`}
                  >
                    <Check className={`size-3.5 shrink-0 ${m.id === value ? 'text-teal-600' : 'text-transparent'}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-ink">{m.label}</span>
                      <span className="font-bn block text-[11px] text-ink-400">{m.labelBn}</span>
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-500">{n ? `${n} option${n > 1 ? 's' : ''}` : 'Fixed layout'}</span>
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="px-2.5 py-3 text-[12px] text-ink-500">No module matches “{query}”.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
