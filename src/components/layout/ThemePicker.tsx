import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type Theme } from '../../contexts/ThemeContext';
import { FloatingPanel } from './FloatingPanel';

const options = [
  { value: 'light' as Theme, label: 'Light', Icon: Sun },
  { value: 'dark' as Theme, label: 'Dark', Icon: Moon },
  { value: 'system' as Theme, label: 'System', Icon: Monitor }
];

export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  const Icon = options.find(option => option.value === theme)!.Icon;
  return (
    <FloatingPanel label="Appearance" width={192} trigger={({ open, toggle }) => (
      <button type="button" onClick={toggle} aria-label={`Appearance: ${theme}`} aria-expanded={open}
        className="flex size-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 hover:text-ink">
        <Icon className="size-4" />
      </button>
    )}>
      {(close) => <fieldset className="p-2">
        <legend className="sr-only">Appearance</legend>
        <p className="px-2 pb-1 text-xs font-medium text-ink-500">Appearance</p>
        {options.map(({ value, label, Icon: OptionIcon }) => (
          <label key={value} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-[13px] text-ink hover:bg-ink-50">
            <OptionIcon className="size-4 text-ink-500" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            <input type="radio" name="appearance" aria-label={label} value={value} checked={theme === value} autoFocus={theme === value}
              onChange={() => { setTheme(value); close(); }} className="size-4 accent-primary" />
          </label>
        ))}
      </fieldset>}
    </FloatingPanel>
  );
}
