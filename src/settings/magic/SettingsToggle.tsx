import { forwardRef, type InputHTMLAttributes } from 'react';

type SettingsToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * Settings-only compact On/Off control.
 * A native checkbox with switch semantics retains keyboard, focus, disabled,
 * and form behavior; the visible track follows HisabIQ's approved Option 1.
 * Controlled state is owned by each screen (including draft-only settings).
 */
export const SettingsToggle = forwardRef<HTMLInputElement, SettingsToggleProps>(
  function SettingsToggle({ checked, disabled, className = '', onChange, onCheckedChange, ...rest }, ref) {
    const enabled = Boolean(checked);
    return (
      <span
        data-settings-toggle=""
        data-slot="switch"
        data-state={enabled ? 'checked' : 'unchecked'}
        className={`relative inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-md
          focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-600
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none relative h-6 w-[42px] rounded-full transition-colors
            ${enabled ? 'bg-teal-600' : 'bg-ink-300 dark:bg-ink-400'}`}
        >
          <span
            className={`absolute left-[3px] top-[3px] size-[18px] rounded-full bg-white shadow-sm
              motion-safe:transition-transform motion-safe:duration-150
              ${enabled ? 'translate-x-[18px]' : 'translate-x-0'}`}
          />
        </span>
        <input
          {...rest}
          ref={ref}
          type="checkbox"
          role="switch"
          checked={enabled}
          disabled={disabled}
          className="absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={(event) => {
            onChange?.(event);
            onCheckedChange?.(event.target.checked);
          }}
        />
      </span>
    );
  },
);
