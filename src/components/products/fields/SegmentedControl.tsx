import { useId, useRef, KeyboardEvent } from "react";
import { LayoutGroup, MotionConfig, motion } from 'framer-motion';
import type { LucideIcon } from "lucide-react";
export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  sub?: string;
  icon?: LucideIcon;
};
type Props<T extends string> = {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  labelledBy?: string;
  ariaLabel?: string;
  disabled?: boolean;
  size?: 'md' | 'lg';
  id?: string;
};

/** Radio group styled as a segmented control. Arrow keys move and select, like native radios. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  labelledBy,
  ariaLabel,
  disabled = false,
  size = 'md',
  id
}: Props<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const motionId = useId();
  const move = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step || disabled) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  return <MotionConfig reducedMotion="user"><LayoutGroup id={motionId}><div id={id} role="radiogroup" aria-labelledby={labelledBy} aria-label={ariaLabel} aria-disabled={disabled || undefined} className="grid gap-1 rounded-lg bg-ink-100 p-1" style={{
    gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`
  }}>
      {options.map((option, index) => {
      const selected = option.value === value;
      const Icon = option.icon;
      return <button key={option.value} ref={node => {
        refs.current[index] = node;
      }} type="button" role="radio" aria-checked={selected} tabIndex={index === selectedIndex ? 0 : -1} disabled={disabled} onClick={() => onChange(option.value)} onKeyDown={event => move(event, index)} className={'relative flex min-w-0 items-center justify-center gap-2 rounded-md px-2 font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed ' + (size === 'lg' ? 'min-h-[52px] py-1.5 ' : 'min-h-[calc(var(--ctl-h)_-_8px)] ') + (selected ? 'text-ink ' : 'text-ink-600 hover:text-ink ') + (disabled && !selected ? 'opacity-50' : '')}>
            {selected && <motion.span
              layoutId="sabab-product-segment-thumb"
              data-sabab-segmented-thumb=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-md bg-card shadow-card ring-1 ring-border"
              transition={{ type:'spring', stiffness:520, damping:38, mass:0.7 }}
            />}
            {Icon && <Icon className={'relative z-[1] size-[18px] shrink-0 ' + (selected ? 'text-primary' : 'text-ink-500')} aria-hidden="true" />}
            <span className="relative z-[1] min-w-0 text-left leading-tight">
              <span className="block truncate text-[length:var(--ctl-fs)]">{option.label}</span>
              {option.sub && <span className="block truncate text-[12px] font-normal text-ink-500">{option.sub}</span>}
            </span>
          </button>;
    })}
    </div></LayoutGroup></MotionConfig>;
}