import React, { useState } from 'react';
import { AppSelect } from './AppSelect';

type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: string[];
};

/**
 * Legacy form-select adapter, now rendered through the shared theme-aware menu.
 * Preserve the existing select's value/onChange contract across ERP modules.
 */
export function FormSelect({
  options,
  className = '',
  value,
  defaultValue,
  onChange,
  disabled,
  name,
  title,
  id,
  ...other
}: FormSelectProps) {
  const [local, setLocal] = useState<string>(() => String(defaultValue ?? options[0] ?? ''));
  const selected = value === undefined ? local : String(value);
  const label = String(other['aria-label'] ?? title ?? name ?? options[0] ?? 'Select option');
  const update = (next: string) => {
    if (value === undefined) setLocal(next);
    // Existing callers only read event.target.value. The form-select adapter
    // preserves that API; other controls should use AppSelect directly.
    onChange?.({ target: { value: next, name }, currentTarget: { value: next, name } } as React.ChangeEvent<HTMLSelectElement>);
  };
  return (
    <>
      <AppSelect label={label} value={selected} options={options} onChange={update}
        className={className.replaceAll('[&>select]', '[&>button]')} disabled={disabled} />
      {name && <input type="hidden" name={name} value={selected} />}
    </>
  );
}
