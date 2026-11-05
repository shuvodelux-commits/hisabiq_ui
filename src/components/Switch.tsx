import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: 'default' | 'sm';
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * Animated equivalent of HisabIQ's original accessible shared Switch.
 * The native input and onChange/onCheckedChange contracts are unchanged.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({
  className = '', size = 'default', checked, defaultChecked,
  onCheckedChange, onChange, disabled, ...inputProps
}, ref) {
  const [local, setLocal] = useState(Boolean(defaultChecked));
  const active = checked === undefined ? local : Boolean(checked);
  const reducedMotion = useReducedMotion();
  const compact = size === 'sm';
  return (
    <label
      data-slot="switch"
      data-size={size}
      data-checked={active ? '' : undefined}
      data-unchecked={!active ? '' : undefined}
      data-sabab-switch=""
      className={
        'peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent outline-none ' +
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 ' +
        'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ' +
        (compact ? 'h-[14px] w-[24px] ' : 'h-[18.4px] w-[32px] ') +
        (active ? 'bg-primary ' : 'bg-input dark:bg-input/80 ') + className
      }
    >
      <input
        {...inputProps}
        ref={ref}
        type="checkbox"
        checked={active}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          if (checked === undefined) setLocal(event.target.checked);
          onChange?.(event);
          onCheckedChange?.(event.target.checked);
        }}
      />
      <motion.span
        data-slot="switch-thumb"
        data-sabab-switch-thumb=""
        aria-hidden="true"
        className={'pointer-events-none block rounded-full bg-background ring-0 ' +
          (compact ? 'size-3' : 'size-4')}
        initial={false}
        animate={{ x: active ? (compact ? 10 : 14) : 0 }}
        transition={reducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 520, damping: 38, mass: 0.7 }}
      />
    </label>
  );
});
