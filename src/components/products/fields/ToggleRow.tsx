import type { ReactNode } from 'react';
import { Switch } from '../../Switch';
import { LabelText } from './LabelText';
import { Tooltip } from '../../Tooltip';
import { useFormCopy } from '../../../hooks/useFormCopy';

type ToggleRowProps = {
  id: string;
  en: string;
  bn: string;
  hint?: ReactNode;
  help?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** Switch with a tappable label: the whole title area toggles, not just the small switch. */
export function ToggleRow({ id, en, bn, hint, help, checked, onChange }: ToggleRowProps) {
  const { t } = useFormCopy();
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <label id={`${id}-label`} htmlFor={id} className="min-w-0 cursor-pointer text-[length:var(--label-fs)] font-medium leading-tight text-ink">
            <LabelText en={en} bn={bn} />
          </label>
          {help && <Tooltip interactive compact content={help} label={t(`Help for ${en}`, `${bn} সম্পর্কে সাহায্য`)} />}
        </div>
        {hint && <p id={`${id}-hint`} className="mt-1 text-[13px] leading-snug text-ink-500">{hint}</p>}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}
