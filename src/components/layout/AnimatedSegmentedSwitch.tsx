import { useId, type KeyboardEvent, type ReactNode } from 'react';
import { LayoutGroup, MotionConfig, motion } from 'framer-motion';

type Choice<T extends string> = { value: T; label: ReactNode };

/**
 * Sabab SIS spring-gliding segmented thumb, adapted to HisabIQ dark
 * active-ink styling and its 36px shared control sizing.
 */
export function AnimatedSegmentedSwitch<T extends string>({
  options, value, onChange, label, className = ''
}: {
  options: Choice<T>[];
  value: T;
  onChange: (next: T) => void;
  label: string;
  className?: string;
}) {
  const id = useId();
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const index = options.findIndex(option => option.value === value);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    onChange(options[next].value);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };
  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={id}>
        <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown}
          data-sabab-segmented=""
          className={'inline-flex h-9 shrink-0 items-center gap-0.5 rounded-md border border-border bg-card p-[3px] ' + className}>
          {options.map(option => {
            const selected = value === option.value;
            return (
              <button type="button" key={option.value} role="radio"
                aria-checked={selected} tabIndex={selected ? 0 : -1}
                onClick={() => onChange(option.value)}
                className={'relative inline-flex h-full items-center justify-center whitespace-nowrap rounded-[5px] px-2.5 text-xs font-medium leading-none ' +
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ' +
                  (selected ? 'text-white' : 'text-ink-500 hover:text-ink')}>
                {selected && <motion.span
                  layoutId="sabab-segmented-thumb"
                  data-sabab-segmented-thumb=""
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[5px] bg-inverse"
                  transition={{type:'spring',stiffness:520,damping:38,mass:0.7}}
                />}
                <span className="relative z-[1]">{option.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
