import { LayersIcon, LockKeyholeIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { QuantityUnitInput } from '../../MoneyUnitInput';
import { FormField } from '../fields/FormField';
import { SearchSelect } from '../../SearchSelect';
import { useFormCopy } from '../../../hooks/useFormCopy';
import type { AddProductForm } from './useAddProductForm';

/** Compact single-open unit editor. Header switch and safe disable dialog live in OtherOptionsPanel. */
export function AdvancedStockPanel({ form }: { form: AddProductForm }) {
  const { t } = useFormCopy();
  const { draft, set, errors, derived: x, unitsLocked } = form;
  const usedUnits = new Set([draft.unit, ...draft.unitLevels.map((level) => level.unit)].map((unit) => unit.toLowerCase()));

  return (
    <div className="w-full max-w-[680px] space-y-3" data-product-multi-unit-compact>
      {unitsLocked && (
        <p className="flex items-start gap-2 rounded-md bg-ink-100 px-3 py-2 text-[12px] text-ink-700">
          <LockKeyholeIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {t('Unit conversion is locked for this product. Prices and display unit remain editable.',
            'এই পণ্যের একক রূপান্তর পরিবর্তন করা যাবে না। দাম ও দেখানোর একক বদলাতে পারবেন।')}
        </p>
      )}
      {form.unitNotice && (
        <p role="status" className="rounded-md bg-info-bg px-3 py-2 text-[12px] text-info">
          {t(form.unitNotice.en, form.unitNotice.bn)}
        </p>
      )}
      {draft.multiUnit ? (
        <>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-600">
            <LayersIcon className="size-4 text-ink-500" aria-hidden="true" />
            <span>{t('Smallest unit', 'সবচেয়ে ছোট একক')}</span>
            <span className="rounded-md bg-ink-100 px-2 py-1 font-medium text-ink">{draft.unit}</span>
          </div>
              <div id="pf-unitChain" className="space-y-1" aria-label={t('Unit conversions', 'এককের রূপান্তর')}>
                {draft.unitLevels.map((level, index) => {
                  const smaller = index ? draft.unitLevels[index - 1].unit : draft.unit;
                  const unitKey = `levelUnit-${level.id}` as const;
                  const factorKey = `levelFactor-${level.id}` as const;
                  return (
                    <fieldset data-product-unit-relationship key={level.id} disabled={unitsLocked} className="min-w-0 py-1.5 disabled:opacity-75">
                      <legend className="sr-only">{t(`Conversion for ${level.unit || 'larger unit'}`, `${level.unit || 'বড় একক'}-এর রূপান্তর`)}</legend>
                      <div className="pf-unit-row" data-product-unit-equation>
                        <span className="pf-unit-one text-[14px] font-semibold text-ink" aria-hidden="true">1</span>
                        <FormField className="pf-unit-select" id={`pf-${unitKey}`} en="Larger unit" bn="বড় একক" error={errors[unitKey]}>
                          <SearchSelect id={`pf-${unitKey}`} noun={{ en: 'larger unit', bn: 'বড় একক' }} labelledBy={`pf-${unitKey}-label`}
                            describedBy={`pf-${unitKey}-msg`} invalid={Boolean(errors[unitKey])} disabled={unitsLocked}
                            value={level.unit} options={form.units.filter((unit) => (unit.value ?? unit.symbol) === level.unit || !usedUnits.has((unit.value ?? unit.symbol).toLowerCase()))
                              .map((unit) => ({ value: unit.value ?? unit.symbol, label: unit.symbol, meta: unit.name !== unit.symbol ? unit.name : undefined }))}
                            onChange={(value) => form.updateUnitLevel(level.id, 'unit', value)} onCreate={form.createUnit} withSymbol />
                        </FormField>
                        <span className="pf-unit-equals text-[17px] font-semibold text-ink-500" aria-hidden="true">=</span>
                        <FormField className="pf-unit-ratio" id={`pf-${factorKey}`} en="Quantity" bn="পরিমাণ" error={errors[factorKey]}>
                          <QuantityUnitInput id={`pf-${factorKey}`} label={t(`Number of ${smaller || 'smaller units'} in 1 ${level.unit || 'larger unit'}`, `১ ${level.unit || 'বড় একক'}-এ কত ${smaller || 'ছোট একক'}`)}
                            describedBy={`pf-${factorKey}-msg`} invalid={Boolean(errors[factorKey])} value={level.factor}
                            onChange={(value) => form.updateUnitLevel(level.id, 'factor', value)} staticUnit={smaller || '—'} disabled={unitsLocked} />
                        </FormField>
                        <button type="button" disabled={unitsLocked} onClick={() => form.removeUnitLevel(level.id)}
                          aria-label={t(`Remove ${level.unit || 'unit'} level`, `${level.unit || 'একক'} ধাপ মুছুন`)}
                          title={t('Remove this unit', 'এই একক মুছুন')} className="pf-unit-remove flex size-9 items-center justify-center rounded-md border border-border text-ink-500 transition-colors hover:border-danger/30 hover:bg-danger-bg hover:text-danger disabled:cursor-not-allowed">
                          <Trash2Icon className="size-[18px]" aria-hidden="true" />
                        </button>
                      </div>
                    </fieldset>
                  );
                })}
                {errors.unitChain && <p role="alert" className="text-[13px] text-danger">{t(errors.unitChain.en, errors.unitChain.bn)}</p>}
              </div>
              <button type="button" disabled={unitsLocked} onClick={form.addUnitLevel}
                className="mt-2 flex min-h-9 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-primary hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50">
                <PlusIcon className="size-4" aria-hidden="true" />{t('Add another unit', 'আরেকটি একক যোগ করুন')}
              </button>
              <FormField id="pf-view" en="Preferred stock unit" bn="স্টক দেখানোর একক" className="mt-3 max-w-[360px]"
                help={t('Used for stock display and the default unit in POS.', 'স্টক দেখাতে ও POS-এর ডিফল্ট একক।')}>
                <SearchSelect id="pf-view" noun={{ en: 'stock display unit', bn: 'স্টক দেখানোর একক' }} labelledBy="pf-view-label"
                  value={x.viewUnit} options={x.units.map((unit) => ({ value: unit, label: unit }))} onChange={(next) => set('stockViewUnit', next)} />
              </FormField>
        </>
      ) : (
        <p className="text-[12px] text-ink-500">
          {t('Turn on Multiple units to add Box, Carton or other units.',
             'Box, Carton বা অন্য একক যোগ করতে একাধিক একক চালু করুন।')}
        </p>
      )}
    </div>
  );
}
