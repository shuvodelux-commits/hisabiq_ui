import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { sababReducedRevealVariants, sababRevealVariants } from '../../motion/sababMotion';

export function AnimatedAdvancedFilters({
  id, open, children, className = '',
}: {
  id: string;
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  const desktop = useMediaQuery('(min-width: 1024px)');
  const reducedMotion = useReducedMotion();
  const visible = desktop || open;

  return (
    <div id={id} className="empty:hidden" data-animated-advanced-filters="">
      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            key="advanced-filters"
            data-sabab-motion="reveal"
            initial={desktop || reducedMotion ? false : 'hidden'}
            animate="show"
            exit="exit"
            variants={reducedMotion ? sababReducedRevealVariants : sababRevealVariants}
            className={className}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
