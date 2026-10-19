import {NumericInput} from './NumericInput';
import { AppSelect } from './AppSelect';

type MoneyUnitInputProps = {
  label: string;
  value: string;
  onChange: (amount: string) => void;
  unit?: string;
  units?: string[];
  onUnitChange?: (unit: string) => void;
  disabled?: boolean;
  /** Keep the number fixed while still permitting unit selection. */
  readOnlyAmount?: boolean;
  /** Use the compact unit selector and numeric stepper in relationship rows. */
  compact?: boolean;
  placeholder?: string;
  prefix?: string | null;
};

/** A single connected control: amount, currency, and selected unit. */
export function MoneyUnitInput({
  label, value, onChange, unit, units = [], onUnitChange, disabled, readOnlyAmount = false, compact = false, placeholder = '0', prefix = '৳'
}: MoneyUnitInputProps) {
  return (
    <div data-numeric-joined data-field-shell="money-unit" className="flex h-9 min-w-0 overflow-hidden rounded-md border border-input bg-card shadow-xs focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
      {prefix && <span className="flex shrink-0 items-center pl-3 text-sm text-ink-400" aria-hidden="true">{prefix}</span>}
      <NumericInput
        aria-label={label}
        readOnly={readOnlyAmount}
        stepperCompact={compact && !readOnlyAmount}
        inputMode="decimal"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ''))}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent px-2 text-right text-sm text-ink outline-none disabled:opacity-50"
      />
      {onUnitChange && units.length > 0 && (
        <div className={(compact ? "w-[86px] sm:w-[100px]" : "w-[108px]") + " shrink-0 border-l border-border bg-ink-50/50"}>
          <AppSelect label={label + ' unit'} value={unit ?? ''} options={units} onChange={onUnitChange}
            disabled={disabled} compact className="h-full [&>button]:h-full [&>button]:rounded-none" />
        </div>
      )}
    </div>
  );
}

/** Stock quantity uses the same joined amount/unit shell as price, without the currency marker. */
export function QuantityUnitInput(props: Omit<MoneyUnitInputProps, 'prefix'>) {
  return <MoneyUnitInput {...props} prefix={null} />;
}
