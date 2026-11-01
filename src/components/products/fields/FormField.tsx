import type { ReactNode } from 'react';
import { useFormCopy } from '../../../hooks/useFormCopy';
import type { Copy } from '../../../types/productForm';
import { FieldMessage } from './FieldMessage';
import { LabelText } from './LabelText';
import { Tooltip } from '../../Tooltip';

type FormFieldProps = {
  id: string;
  en: string;
  bn: string;
  required?: boolean;
  optional?: boolean;
  help?: ReactNode;
  hint?: ReactNode;
  error?: Copy;
  /** Use "span" when the control is a group (radio, date button) that names itself. */
  labelAs?: 'label' | 'span';
  className?: string;
  children: ReactNode;
};

export function FormField({ id, en, bn, required, optional, help, hint, error, labelAs = 'label', className = '', children }: FormFieldProps) {
  const { t } = useFormCopy();
  const labelClass = 'flex min-w-0 flex-wrap items-baseline text-[length:var(--label-fs)] font-medium leading-tight text-ink';
  const content = (
    <>
      <LabelText en={en} bn={bn} />
      {required && (
        <>
          <span className="ml-1 text-danger" aria-hidden="true">*</span>
          <span className="sr-only">({t('required', 'আবশ্যক')})</span>
        </>
      )}
      {optional && !required && (
        <span className="ml-1.5 inline-flex rounded bg-ink-50 px-1.5 py-px text-[11px] font-normal leading-4 text-ink-500">
          {t('optional', 'ঐচ্ছিক')}
        </span>
      )}
    </>
  );
  return (
    <div className={'min-w-0 ' + className}>
      <div className="mb-1.5 flex min-h-6 items-center gap-2">
        {labelAs === 'label'
          ? <label id={`${id}-label`} htmlFor={id} className={labelClass}>{content}</label>
          : <span id={`${id}-label`} className={labelClass}>{content}</span>}
        {help && <Tooltip content={help} label={t(`Help for ${en}`, `${bn} সম্পর্কে সাহায্য`)} interactive compact />}
      </div>
      {children}
      <FieldMessage id={`${id}-msg`} error={error} hint={hint} />
    </div>
  );
}
