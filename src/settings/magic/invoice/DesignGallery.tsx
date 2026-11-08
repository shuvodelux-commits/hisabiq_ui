import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { invoiceDesigns, type InvoiceDesignId } from './invoiceDesigns';
import type { InvoiceDesignSettings } from './invoiceState';
import { InvoiceDocument } from './InvoiceDocument';

type Props = { value: InvoiceDesignSettings; premium: boolean; disabled?: boolean; onPick: (id: InvoiceDesignId) => void };

const SCALE = 0.27;

/** Thumbnail gallery drawn from the same sample sale. Premium designs show a lock below the Plus plan. */
export function DesignGallery({ value, premium, disabled, onPick }: Props) {
  const reduced = useReducedMotion();
  return (
    <div role="radiogroup" aria-label="Invoice design" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {invoiceDesigns.map((d, i) => {
        const active = value.design === d.id;
        const locked = d.premium && !premium;
        return (
          <motion.button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onPick(d.id)}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: reduced ? 0 : i * 0.03 }}
            whileHover={reduced || disabled ? undefined : { y: -2 }}
            className={`relative overflow-hidden rounded-xl border bg-white text-left transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 disabled:cursor-not-allowed ${
              active ? 'border-teal-600 ring-2 ring-teal-500/20' : 'border-ink-100 hover:border-ink-200 hover:shadow-card'
            }`}
          >
            <div className="relative h-[150px] overflow-hidden border-b border-ink-100 bg-ink-50/60">
              <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 shadow-card" style={{ width: 595 * SCALE, height: 842 * SCALE, overflow: 'hidden' }}>
                <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left', width: 595 }}>
                  <InvoiceDocument design={d.id} paper="a4" lang={value.lang} accent={value.accent} content={value.content} />
                </div>
              </div>
              {locked && (
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-inverse px-1.5 py-0.5 text-[10.5px] font-medium text-white">
                  <Lock className="size-3" aria-hidden="true" /> Premium
                </span>
              )}
              {active && (
                <span className="absolute left-2 top-2 flex size-5 items-center justify-center rounded-full bg-teal-600 text-white">
                  <Check className="size-3" aria-hidden="true" />
                </span>
              )}
            </div>
            <div className="px-3 py-2">
              <p className="text-[13px] font-medium text-ink">
                {d.name} <span className="font-bn text-[11px] font-normal text-ink-400">{d.bn}</span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-500">{d.description}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
