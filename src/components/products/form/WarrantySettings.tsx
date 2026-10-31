import { AppSelect } from '../../AppSelect';
import { Input } from '../../Input';
import { FormField } from '../fields/FormField';
import { useFormCopy } from '../../../hooks/useFormCopy';
import { warrantyTypeOptions, warrantyUnitOptions } from '../../../data/productFormOptions';
import type { WarrantyDurationUnit, WarrantyType } from '../../../types/erp';
import type { AddProductForm } from './useAddProductForm';

const selectSize = '[&>button]:h-[var(--ctl-h)] [&>button]:text-[length:var(--ctl-fs)]';

export function WarrantySettings({ form }: { form: AddProductForm }) {
  const { t } = useFormCopy();
  const { draft, set, errors } = form;

  if (!draft.warrantyEnabled) return <p className="text-[12px] text-ink-500">{t('Turn on Warranty to set its duration and provider.', 'সময়কাল ও ধরন ঠিক করতে ওয়ারেন্টি চালু করুন।')}</p>;

  return (
    <div className="max-w-[680px]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField id="pf-warrantyDuration" en="How long" bn="সময়কাল" error={errors.warrantyDuration}
                help={t('Warranty is separate from serial tracking. Claims are handled on the Warranty page.', 'ওয়ারেন্টি সিরিয়াল ট্র্যাকিং থেকে আলাদা। দাবি ওয়ারেন্টি পেজে দেখা হয়।')}>
                <div className="flex gap-2">
                  <Input
                    id="pf-warrantyDuration"
                    inputMode="numeric"
                    value={draft.warrantyDuration}
                    onChange={(event) => set('warrantyDuration', event.target.value.replace(/[^\d.]/g, ''))}
                    aria-invalid={errors.warrantyDuration ? true : undefined}
                    aria-describedby="pf-warrantyDuration-msg"
                    className={'w-24 text-right' + (errors.warrantyDuration ? ' !border-danger' : '')}
                  />
                  <AppSelect
                    label={t('Warranty duration unit', 'ওয়ারেন্টির সময়ের একক')}
                    value={draft.warrantyDurationUnit}
                    onChange={(next) => set('warrantyDurationUnit', next as WarrantyDurationUnit)}
                    options={warrantyUnitOptions.map((o) => ({ value: o.value, label: t(o.en, o.bn) }))}
                    className={'flex-1 ' + selectSize}
                  />
                </div>
              </FormField>
              <FormField id="pf-warrantyType" en="Who gives the warranty" bn="কে ওয়ারেন্টি দেবে">
                <AppSelect
                  id="pf-warrantyType"
                  label={t('Who gives the warranty', 'কে ওয়ারেন্টি দেবে')}
                  value={draft.warrantyType}
                  onChange={(next) => set('warrantyType', next as WarrantyType)}
                  options={warrantyTypeOptions.map((o) => ({ value: o.value, label: t(o.en, o.bn) }))}
                  className={selectSize}
                />
              </FormField>
              <FormField
                id="pf-warrantyTerms"
                en="Terms"
                bn="শর্তাবলি"
                className="sm:col-span-2"
                optional
                help={t('Printed on the invoice for this item.', 'এই পণ্যের বিলে ছাপা হবে।')}
              >
                <textarea
                  id="pf-warrantyTerms"
                  rows={3}
                  value={draft.warrantyTerms}
                  onChange={(event) => set('warrantyTerms', event.target.value)}
                  placeholder={t('What is covered, what is not, papers needed…', 'কী কভার হবে, কী হবে না, কী কাগজ লাগবে…')}
                  aria-describedby="pf-warrantyTerms-msg"
                  className="block w-full rounded-md border border-input bg-card px-3 py-2.5 text-ink placeholder:text-ink-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </FormField>
            </div>
    </div>
  );
}
