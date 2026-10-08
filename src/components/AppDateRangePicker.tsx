import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  addDays, addMonths, businessToday, datePreset, formatDay, formatRange, isoDay, utcDate, type IsoRange
} from '../utils/dateRange';

type Props = {
  value: IsoRange;
  onChange: (next: IsoRange) => void;
  label?: string;
  className?: string;
  single?: boolean;
};
const empty: IsoRange = { from: '', to: '' };
const presets = ['Today', 'Yesterday', 'Last 7 days', 'This week', 'This month', 'Last month'];
const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
function monthLabel(first: string) {
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(utcDate(first));
}
function Month({
  first, selected, today, choose, focusDay
}: { first: string; selected: IsoRange; today: string; choose: (day: string) => void; focusDay: (day: string) => void }) {
  const month = utcDate(first);
  const year = month.getUTCFullYear(), m = month.getUTCMonth();
  const offset = (month.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, m + 1, 0)).getUTCDate();
  const cells = Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
    const day = index - offset + 1;
    return day > 0 && day <= days ? isoDay(year, m, day) : '';
  });
  return <div className="min-w-0 flex-1" aria-label={monthLabel(first)}>
    <p className="mb-2 text-center text-[13px] font-semibold text-ink">{monthLabel(first)}</p>
    <div role="grid" aria-label={'Choose dates in ' + monthLabel(first)} className="grid grid-cols-7 gap-0.5 text-center">
      {weekdays.map((day) => <span key={day} className="py-1 text-[11px] font-medium text-ink-400">{day}</span>)}
      {cells.map((day, index) => {
        if (!day) return <span key={'blank-' + index} aria-hidden="true" />;
        const start = selected.from === day, end = selected.to === day;
        const between = Boolean(selected.from && selected.to && day > selected.from && day < selected.to);
        return <button type="button" key={day} role="gridcell"
          aria-label={formatDay(day)} aria-selected={start || end || between} aria-current={day === today ? 'date' : undefined}
          data-calendar-date={day}
          onClick={() => choose(day)}
          onKeyDown={(event) => {
            const movement: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
            if (!(event.key in movement)) return;
            event.preventDefault();
            focusDay(addDays(day, movement[event.key]));
          }}
          className={'h-8 rounded-md text-[12px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 ' +
            (start || end ? 'bg-teal-600 font-semibold text-white' : between ? 'bg-teal-50 text-teal-700'
              : 'text-ink hover:bg-ink-50') +
            (day === today && !start && !end ? ' ring-1 ring-teal-500' : '')}
        >{Number(day.slice(-2))}</button>;
      })}
    </div>
  </div>;
}

/** Compact, themed shadcn-style calendar/popover. Only Apply commits a draft range. */
export function AppDateRangePicker({ value, onChange, label = 'Date range', className = '', single = false }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<IsoRange>(value);
  const [first, setFirst] = useState(isoDay(utcDate(value.from || businessToday()).getUTCFullYear(), utcDate(value.from || businessToday()).getUTCMonth(), 1));
  const [position, setPosition] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const anchor = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, '');
  const today = businessToday();

  const close = () => { setOpen(false); anchor.current?.focus(); };
  const show = () => {
    const date = utcDate(value.from || today);
    setDraft(value);
    setFirst(isoDay(date.getUTCFullYear(), date.getUTCMonth(), 1));
    setOpen(true);
  };
  const choose = (day: string) => setDraft((current) => {
    if (single) return { from: day, to: day };
    if (!current.from || current.to) return { from: day, to: '' };
    return day < current.from ? { from: day, to: current.from } : { from: current.from, to: day };
  });
  const commit = (next: IsoRange) => { onChange(next); close(); };
  const focusDay = (day: string) => {
    if (day.slice(0, 7) !== first.slice(0, 7) && day.slice(0, 7) !== addMonths(first, 1).slice(0, 7)) {
      setFirst(isoDay(utcDate(day).getUTCFullYear(), utcDate(day).getUTCMonth(), 1));
      requestAnimationFrame(() => popup.current?.querySelector<HTMLButtonElement>(`[data-calendar-date="${day}"]`)?.focus());
    } else popup.current?.querySelector<HTMLButtonElement>(`[data-calendar-date="${day}"]`)?.focus();
  };
  useLayoutEffect(() => {
    if (!open) { setPosition(null); return; }
    const place = () => {
      const rect = anchor.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(single ? 350 : 655, window.innerWidth - 16);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      const below = window.innerHeight - rect.bottom - 8, above = rect.top - 8;
      const height = Math.min(480, Math.max(below, above));
      const top = below < 340 && above > below ? Math.max(8, rect.top - height - 4) : rect.bottom + 4;
      setPosition({ left, top, width, maxHeight: Math.min(height, window.innerHeight - 16) });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [open, single]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!anchor.current?.contains(event.target as Node) && !popup.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); close(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  return <div className={'min-w-0 ' + className}>
    <button ref={anchor} type="button" aria-label={label} aria-haspopup="dialog" aria-expanded={open}
      aria-controls={open ? id : undefined} onClick={() => open ? close() : show()}
      className="flex h-9 w-full min-w-0 items-center gap-2 rounded-md border border-input bg-card px-3 text-left text-[12px] text-ink shadow-xs outline-none hover:bg-ink-50/40 focus-visible:ring-2 focus-visible:ring-teal-500/20">
      <CalendarDays className="size-4 shrink-0 text-teal-600" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{single ? (value.from ? formatDay(value.from) : 'Select date') : formatRange(value)}</span>
    </button>
    {open && typeof document !== 'undefined' && createPortal(
      <div ref={popup} id={id} role="dialog" aria-label={label + ' calendar'}
        className="fixed z-[155] overflow-y-auto rounded-xl border border-border bg-popover p-3 text-ink shadow-xl scrollbar-thin"
        style={{ top: position?.top ?? 0, left: position?.left ?? 0, width: position?.width ?? 350,
          maxHeight: position?.maxHeight ?? 480, visibility: position ? 'visible' : 'hidden' }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold">{single ? 'Select date' : 'Select date range'}</span>
          <div className="flex gap-1">
            <button type="button" aria-label="Previous month" onClick={() => setFirst(addMonths(first, -1))}
              className="rounded-md p-1.5 text-ink-500 hover:bg-ink-50"><ChevronLeft className="size-4" /></button>
            <button type="button" aria-label="Next month" onClick={() => setFirst(addMonths(first, 1))}
              className="rounded-md p-1.5 text-ink-500 hover:bg-ink-50"><ChevronRight className="size-4" /></button>
          </div>
        </div>
        <div className="flex gap-3">
          <Month first={first} selected={draft} choose={choose} today={today} focusDay={focusDay} />
          {!single && <div className="hidden flex-1 sm:block">
            <Month first={addMonths(first, 1)} selected={draft} choose={choose} today={today} focusDay={focusDay} />
          </div>}
        </div>
        {!single && <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
          {presets.map((preset) => <button key={preset} type="button" onClick={() => {
            const range = datePreset(preset, today);
            setDraft(range);
            const date = utcDate(range.from);
            setFirst(isoDay(date.getUTCFullYear(), date.getUTCMonth(), 1));
          }} className="rounded-md border border-border bg-card px-2 py-1.5 text-[11px] text-ink-600 hover:bg-teal-50 hover:text-teal-700">{preset}</button>)}
        </div>}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <button type="button" onClick={() => commit(empty)}
            className="inline-flex items-center gap-1 text-[12px] text-ink-500 hover:text-ink"><X className="size-3" /> Clear</button>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-ink-50">Cancel</button>
            <button type="button" onClick={() => commit(draft)} disabled={!draft.from || !draft.to}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40">Apply</button>
          </div>
        </div>
      </div>, document.body)}
  </div>;
}

export function AppDatePicker({ value, onChange, label = 'Date', className = '' }: {
  value: string; onChange: (date: string) => void; label?: string; className?: string;
}) {
  return <AppDateRangePicker single label={label} className={className}
    value={{ from: value, to: value }} onChange={(range) => onChange(range.from)} />;
}
