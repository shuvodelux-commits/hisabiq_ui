import { AppDatePicker } from '../../AppDateRangePicker';
import { Input } from '../../Input';
import { FormField } from '../fields/FormField';
import { SegmentedControl } from '../fields/SegmentedControl';
import { useFormCopy } from '../../../hooks/useFormCopy';
import { allocationOptions } from '../../../data/productFormOptions';
import type { StockAllocationMethod } from '../../../types/erp';
import { fmtQty } from '../../../utils/productDraft';
import type { AddProductForm } from './useAddProductForm';

const pickerSize = '[&>button]:h-[var(--ctl-h)] [&>button]:text-[length:var(--ctl-fs)]';

/** All expiry controls are revealed by the independent header switch, not a second switch. */
export function ExpirySettings({ form }: { form: AddProductForm }) {
  const { t } = useFormCopy();
  const { draft, set, errors, derived: x, isEdit } = form;
  const allocation = allocationOptions.find((o) => o.value === draft.allocationMethod) ?? allocationOptions[0];

  if (!draft.expiryEnabled) return (
    <p className="max-w-[680px] text-[12px] text-ink-500">
      {t('Turn on expiry tracking to set dates and stock order.', 'তারিখ ও স্টক বিক্রির ক্রম ঠিক করতে মেয়াদ ট্র্যাকিং চালু করুন।')}
    </p>
  );

  return (
    <div data-product-expiry-compact className="max-w-[680px] space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField id="pf-expiryRequired" labelAs="span" en="Expiry date" bn="মেয়াদ"
          help={t('Required: every new stock lot must have an expiry date. Optional: dates can be added when available.', 'আবশ্যক হলে নতুন স্টক লটে মেয়াদের তারিখ দিতে হবে। ঐচ্ছিক হলে থাকলে দিন।')}>
          <SegmentedControl<'optional' | 'required'>
            id="pf-expiryRequired"
            labelledBy="pf-expiryRequired-label"
            value={draft.expiryDateRequired ? 'required' : 'optional'}
            options={[
              { value: 'optional', label: t('Optional', 'ঐচ্ছিক') },
              { value: 'required', label: t('Required', 'আবশ্যক') }
            ]}
            onChange={(value) => set('expiryDateRequired', value === 'required')}
          />
        </FormField>
        <FormField id="pf-warningDays" en="Warn before" bn="আগে সতর্কতা"
          help={t('How many days before expiry to show a stock warning.', 'মেয়াদ শেষ হওয়ার কত দিন আগে সতর্ক করবে।')}>
          <div className="flex items-center gap-2">
            <Input id="pf-warningDays" inputMode="numeric" value={draft.expiryWarningDays}
              onChange={(event) => set('expiryWarningDays', event.target.value.replace(/[^\d]/g, ''))}
              aria-describedby="pf-warningDays-msg" className="w-24 text-right" />
            <span className="text-[length:var(--ctl-fs)] text-ink-600">{t('days', 'দিন')}</span>
          </div>
        </FormField>
      </div>

      <FormField id="pf-allocation" labelAs="span" en="Sell stock from" bn="কোন স্টক আগে"
        help={t(allocation.hintEn, allocation.hintBn)}>
        <div className="max-w-[440px]">
          <SegmentedControl<StockAllocationMethod>
            labelledBy="pf-allocation-label"
            value={draft.allocationMethod}
            options={allocationOptions.map((o) => ({ value: o.value, label: t(o.en, o.bn) }))}
            onChange={(next) => set('allocationMethod', next)}
          />
        </div>
      </FormField>
      {draft.allocationMethod === 'FEFO' && !draft.expiryDateRequired && (
        <p role="status" className="max-w-[540px] text-[12px] leading-snug text-ink-600">
          {t('For expiry-first selling, record dates for each lot when possible. Some lots may not have a date.',
            'মেয়াদ অনুযায়ী বিক্রির জন্য সম্ভব হলে প্রতি লটের তারিখ দিন। কিছু লটে তারিখ নাও থাকতে পারে।')}
        </p>
      )}

      {!isEdit && x.openingBase > 0 && (
        <div className="space-y-3 pt-1" data-product-expiry-opening>
          <p className="text-[length:var(--label-fs)] font-medium text-ink">
            {t(`Opening stock · ${fmtQty(x.openingBase)} ${draft.unit}`,
              `শুরুর স্টক · ${fmtQty(x.openingBase)} ${draft.unit}`)}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="pf-expiryDate" labelAs="span" en="Expiry date" bn="মেয়াদ শেষের তারিখ"
              required={draft.expiryDateRequired} error={errors.expiryDate}>
              <div id="pf-expiryDate">
                <AppDatePicker label={t('Expiry date', 'মেয়াদ শেষের তারিখ')}
                  value={draft.expiryDate} onChange={(next) => set('expiryDate', next)}
                  className={pickerSize + (errors.expiryDate ? ' [&>button]:!border-danger' : '')} />
              </div>
            </FormField>
            <FormField id="pf-batch" en="Batch no." bn="ব্যাচ নং" optional>
              <Input id="pf-batch" value={draft.batchNumber} onChange={(event) => set('batchNumber', event.target.value)}
                autoComplete="off" aria-describedby="pf-batch-msg"
                className="h-[var(--ctl-h)] text-[length:var(--ctl-fs)]" />
            </FormField>
            <FormField id="pf-mfg" labelAs="span" en="Manufacture date" bn="উৎপাদনের তারিখ" optional>
              <div id="pf-mfg">
                <AppDatePicker label={t('Manufacture date', 'উৎপাদনের তারিখ')}
                  value={draft.manufactureDate} onChange={(next) => set('manufactureDate', next)} className={pickerSize} />
              </div>
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
}
