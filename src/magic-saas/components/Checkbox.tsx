import { forwardRef, type InputHTMLAttributes } from 'react';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  onCheckedChange?: (checked: boolean) => void;
};

/** Native accessible checkbox compatibility for Magic Patterns' missing prototype re-export. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ checked, onCheckedChange, className = '', ...props }, ref) {
    return (
      <input
        {...props}
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}
        className={`size-4 shrink-0 cursor-pointer rounded border border-ink-300 accent-teal-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${className}`}
      />
    );
  }
);
