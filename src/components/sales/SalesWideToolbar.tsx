import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '../Button';
import { useUiCopy } from '../../i18n/useUiCopy';

/** Tablet/desktop filters keep the page's existing controlled values and handlers. */
export function SalesWideToolbar({ search, filters, actions, activeCount, compactDaybook = false, className = 'border-b border-border p-3' }: {
  search: ReactNode; filters: ReactNode; actions?: ReactNode; activeCount: number;
  compactDaybook?: boolean; className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const { text } = useUiCopy();
  const reduceMotion = useReducedMotion();
  const label = text('Filters', 'ফিল্টার');
  const advancedLabel = text('Advanced filters', 'আরও ফিল্টার');

  return <div className={className}>
    <div className={compactDaybook ? 'mr-1 flex min-w-0 items-center gap-2 lg:mr-0' : 'flex min-w-0 items-center gap-2'}>
      {search}
      {compactDaybook && actions}
      <Button type="button" variant="outline" size={compactDaybook ? 'icon' : 'sm'}
        data-sales-filter-toggle="" aria-label={compactDaybook ? advancedLabel + (activeCount ? ' (' + activeCount + ')' : '') : label}
        title={compactDaybook ? advancedLabel : label}
        aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}
        className={compactDaybook
          ? 'relative size-9 shrink-0 rounded-md text-ink-500 lg:hidden'
          : 'shrink-0 gap-1 px-2'}>
        {compactDaybook ? <Filter className="size-4" aria-hidden="true" /> : <SlidersHorizontal className="size-4" aria-hidden="true" />}
        {!compactDaybook && activeCount > 0 && <span className="text-xs">{activeCount}<span className="sr-only"> {text('active filters', 'চালু ফিল্টার')}</span></span>}
        {compactDaybook && activeCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-teal-500" />}
      </Button>
      {!compactDaybook && actions}
    </div>
    {compactDaybook && <div className="mt-2 hidden flex-wrap items-center gap-2 border-t border-border pt-2 lg:flex">{filters}</div>}
    <AnimatePresence initial={false}>{expanded && <motion.div id={id}
      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.16 }} className={compactDaybook ? 'overflow-hidden lg:hidden' : 'overflow-hidden'}>
      <div className={compactDaybook
        ? 'mt-2 grid grid-cols-3 items-center gap-2 border-t border-border pt-2'
        : 'mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2'}>{filters}</div>
    </motion.div>}</AnimatePresence>
  </div>;
}
