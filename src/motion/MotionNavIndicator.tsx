import { MOTION_MS, MOTION_EASE } from './tokens';
import { motion, useReducedMotion } from 'framer-motion';

/** Decorative, non-interactive shared-layout background behind the selected navigation row. */
export function MotionNavIndicator({ active, layoutId }: { active: boolean; layoutId: string }) {
  const reduceMotion = useReducedMotion();
  if (!active) return null;
  return <motion.span
    aria-hidden="true"
    data-motion-nav-indicator=""
    className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-sidebar-accent"
    layoutId={reduceMotion ? undefined : layoutId}
    initial={false}
    transition={reduceMotion ? { duration: 0 } : { duration: MOTION_MS.navActive / 1000, ease: MOTION_EASE }}
  />;
}
