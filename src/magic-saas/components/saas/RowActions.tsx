import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MoreHorizontal, BoxIcon } from "lucide-react";
export type RowAction = {
  label: string;
  onSelect: () => void;
  icon?: BoxIcon;
  tone?: 'neutral' | 'danger';
  disabled?: boolean;
  hint?: string;
  /** Draw a divider above this item (groups destructive actions last). */
  divider?: boolean;
  hidden?: boolean;
};
type Pos = {
  top: number;
  left: number;
  maxHeight: number;
  origin: string;
};
const WIDTH = 200;
const GAP = 8;
const PAD = 8;

/**
 * HisabIQ row action menu (Audit Ledger pattern): a 36px ghost "⋯" trigger that
 * opens a portalled, viewport-clamped action panel. Flips above when space is short.
 */
export function RowActions({
  label,
  items
}: {
  label: string;
  items: RowAction[];
}) {
  const visible = items.filter(i => !i.hidden);
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const place = useCallback(() => {
    const r = trigger.current?.getBoundingClientRect();
    if (!r) return;
    const est = Math.min(visible.length * 40 + 12, 360);
    const below = window.innerHeight - r.bottom - GAP - PAD;
    const above = r.top - GAP - PAD;
    const up = below < est && above > below;
    const left = Math.max(PAD, Math.min(r.right - WIDTH, window.innerWidth - WIDTH - PAD));
    setPos({
      top: up ? Math.max(PAD, r.top - GAP - Math.min(est, above)) : r.bottom + GAP,
      left,
      maxHeight: Math.max(120, up ? above : below),
      origin: `${up ? 'bottom' : 'top'} right`
    });
  }, [visible.length]);
  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);
  useEffect(() => {
    if (!open) return;
    const close = (focus: boolean) => {
      setOpen(false);
      if (focus) trigger.current?.focus();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !trigger.current?.contains(t)) close(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    };
    const onMove = () => place();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    requestAnimationFrame(() => panel.current?.querySelector<HTMLButtonElement>('[data-action-menu-item]:not(:disabled)')?.focus());
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, place]);
  if (!visible.length) return null;
  const onListKey = (e: React.KeyboardEvent) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const nodes = Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('[data-action-menu-item]:not(:disabled)') ?? []);
    const i = nodes.indexOf(document.activeElement as HTMLButtonElement);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? nodes.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : nodes.length - 1)) % nodes.length;
    nodes[next]?.focus();
  };
  return <>
      <button ref={trigger} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} title="Actions" onClick={() => setOpen(v => !v)} className={`inline-flex size-9 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${open ? 'bg-ink-50 text-ink' : ''}`}>
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </button>
      {typeof document !== 'undefined' && createPortal(<AnimatePresence>
          {open && pos && <motion.div ref={panel} role="menu" aria-label={label} initial={{
        opacity: 0,
        scale: 0.98
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.98
      }} transition={{
        duration: reduced ? 0 : 0.14,
        ease: 'easeOut'
      }} onKeyDown={onListKey} style={{
        top: pos.top,
        left: pos.left,
        width: WIDTH,
        maxHeight: pos.maxHeight,
        transformOrigin: pos.origin
      }} className="fixed z-[100] overflow-y-auto rounded-xl border border-border bg-card p-1 text-left shadow-pop">
              {visible.map(a => {
          const Icon = a.icon;
          const danger = a.tone === 'danger';
          return <React.Fragment key={a.label}>
                    {a.divider && <div role="separator" className="mx-2 my-1 border-t border-border" />}
                    <button type="button" role="menuitem" data-action-menu-item="" disabled={a.disabled} title={a.hint} onClick={() => {
              setOpen(false);
              a.onSelect();
            }} className={`flex min-h-10 w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40 ${danger ? 'text-danger hover:bg-danger-bg focus-visible:bg-danger-bg' : 'text-ink-700 hover:bg-ink-50 focus-visible:bg-ink-50'}`}>
                      {Icon && <Icon className={`size-4 shrink-0 ${danger ? 'text-danger' : 'text-ink-500'}`} aria-hidden="true" />}
                      <span className="min-w-0 flex-1 truncate">{a.label}</span>
                    </button>
                  </React.Fragment>;
        })}
            </motion.div>}
        </AnimatePresence>, document.body)}
    </>;
}