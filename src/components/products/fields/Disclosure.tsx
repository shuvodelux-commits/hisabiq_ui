import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDownIcon, type LucideIcon } from 'lucide-react';
import { useFormCopy } from '../../../hooks/useFormCopy';
import { Tooltip } from '../../Tooltip';

/** Single unbordered row in the Add Product settings list. */
type DisclosureProps = {
  id: string;
  en: string;
  bn: string;
  icon?: LucideIcon;
  summary?: ReactNode;
  help?: ReactNode;
  status?: ReactNode;
  open: boolean;
  onToggle: () => void;
  errorCount?: number;
  children: ReactNode;
};

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

export function Disclosure({ id, en, bn, icon: Icon, summary, help, status, open, onToggle, errorCount = 0, children }: DisclosureProps) {
  const { t, isBangla } = useFormCopy();
  const reduce = useReducedMotion();
  return (
    <section data-product-settings-row={id} aria-labelledby={`${id}-button`} className="min-w-0">
      <h3 className="m-0">
        <button
          id={`${id}-button`}
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="group flex min-h-[52px] w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors duration-150 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {Icon && <Icon className="size-[18px] shrink-0 text-ink-500" strokeWidth={1.8} aria-hidden="true" />}
          <span className="min-w-0 flex-1">
            <span className={`block text-[13px] font-medium leading-[19px] text-ink ${isBangla ? 'font-bn' : ''}`}>{t(en, bn)}</span>
            {!isBangla && <span className="block font-bn text-[11px] leading-4 text-ink-500">{bn}</span>}
            {summary && <span className="mt-1 block text-[12px] font-normal text-ink-500">{summary}</span>}
          </span>
          {errorCount > 0 && (
            <span className="shrink-0 text-[11px] font-semibold text-danger">{t(`${errorCount} to fix`, `${errorCount}টি ঠিক করুন`)}</span>
          )}
          {status && <span data-product-option-status className="max-w-28 shrink-0 truncate text-right text-[11px] font-normal text-ink-500">{status}</span>}
          <ChevronDownIcon className={`size-4 shrink-0 text-ink-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      {help && <div className="px-2"><Tooltip interactive compact content={help} label={t(`Help for ${en}`, `${bn} সম্পর্কে সাহায্য`)} /></div>}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={`${id}-panel`} role="region" aria-labelledby={`${id}-button`}
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: EASE }} className="overflow-hidden"
          >
            <div className="min-w-0 px-2 pb-3 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
