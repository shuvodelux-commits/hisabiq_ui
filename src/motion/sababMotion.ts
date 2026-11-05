import type { Variants } from 'framer-motion';

export const sababEase = {
  out: [0.22, 1, 0.36, 1] as const,
  in: [0.4, 0, 1, 1] as const,
};
export const sababDuration = { fast: 0.12, base: 0.18, slow: 0.26 } as const;
export const sababModuleEntry = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: sababEase.out },
};
export const sababRevealVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  show: { opacity: 1, y: 0, transition: { duration: sababDuration.base, ease: sababEase.out } },
  exit: { opacity: 0, transition: { duration: sababDuration.fast } },
};
export const sababReducedRevealVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
  exit: { opacity: 1, y: 0, transition: { duration: 0 } },
};
