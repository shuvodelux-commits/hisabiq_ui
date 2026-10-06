import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type FloatingPanelProps = {
  trigger: (state: {open: boolean;toggle: () => void;}) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
  width?: number;
  label: string;
};

export function FloatingPanel({ trigger, children, align = 'right', width = 320, label }: FloatingPanelProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      <AnimatePresence>
        {open &&
        <motion.div
          role="dialog"
          aria-label={label}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className={`absolute top-full z-50 mt-2 overflow-hidden rounded-xl border border-ink-100 bg-white shadow-pop ${
          align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}`
          }
          style={{ width }}>
          
            {children(() => setOpen(false))}
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}