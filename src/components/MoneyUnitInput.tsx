import React from 'react';
import { ChevronDown } from 'lucide-react';

type MoneyUnitInputProps = {
  label: string;
  value: string;
  onChange: (amount: string) => void;
  unit?: string;
  units?: string[];
  onUnitChange?: (unit: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

/** A single connected control: amount, currency, and selected unit. */
export function MoneyUnitInput({
  label, value, onChange, unit, units = [], onUnitChange, disabled, placeholder = '0'
}: MoneyUnitInputProps) {
  return (
    <div className="flex h-9 min-w-0 overflow-hidden rounded-md border border-input bg-card shadow-xs focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
      <span className="flex shrink-0 items-center pl-3 text-sm text-ink-400" aria-hidden="true">৳</span>
      <input
        aria-label={label}
        inputMode="decimal"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ''))}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent px-2 text-right text-sm text-ink outline-none disabled:opacity-50"
      />
      {unit && onUnitChange && units.length > 0 && (
        <div className="relative w-[108px] shrink-0 border-l border-border bg-ink-50/50 focus-within:bg-card">
          <select
            aria-label={label + ' unit'}
            disabled={disabled}
            value={unit}
            onChange={(event) => onUnitChange(event.target.value)}
            className="h-full w-full appearance-none bg-transparent pl-2.5 pr-7 text-[13px] text-ink outline-none disabled:opacity-50"
          >
            {units.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
