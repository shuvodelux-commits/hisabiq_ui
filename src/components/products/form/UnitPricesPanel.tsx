import { MoneyUnitInput } from '../../MoneyUnitInput';
import { FormField } from '../fields/FormField';
import { Tooltip } from '../../Tooltip';
import { useFormCopy } from '../../../hooks/useFormCopy';
import { taka } from '../../../utils/currency';
import type { AddProductForm } from './useAddProductForm';

/** Custom prices are independent of the multiple-unit relationship editor. */
export function UnitPricesPanel({ form }: { form: AddProductForm }) {
  const { t } = useFormCopy();
  const { draft, set, errors, derived: x } = form;
  return (
    <div className="min-w-0">
              {draft.unitLevels.length > 0 && (
                <div className="relative">
                  <p className="pr-12 pb-2 text-[13px] font-medium text-ink">{t('Set unit prices', 'এককের দাম দিন')}</p>
                  <span className="absolute right-0 top-0">
                    <Tooltip interactive compact
                      label={t('Help for Custom unit prices', 'একক অনুযায়ী আলাদা দাম সম্পর্কে সাহায্য')}
                      content={t('Leave empty to convert the regular selling price. A custom price replaces the automatic price for that unit.', 'খালি রাখলে সাধারণ বিক্রয় মূল্য থেকে হিসাব হবে। আলাদা দাম দিলে সেটিই প্রযোজ্য হবে।')}
                    />
                  </span>
                  <div className="space-y-4 pt-2">
                    {[{ id: 'base', unit: draft.unit, price: draft.basePrice ?? '', purchasePrice: draft.basePurchasePrice ?? '' }, ...draft.unitLevels]
                      .filter((level) => x.factors[level.unit]).map((level) => {
                      const base = level.id === 'base';
                      const priceKey = base ? 'basePrice' : `levelPrice-${level.id}` as const;
                      const purchaseKey = base ? 'basePurchasePrice' : `levelPurchase-${level.id}` as const;
                      const autoSell = x.sellBase * x.factors[level.unit];
                      const autoBuy = x.buyBase * x.factors[level.unit];
                      return <div key={level.id} className="pf-pair-money">
                        <FormField id={`pf-${purchaseKey}`} en={`Unit cost per ${level.unit}`} bn={`প্রতি ${level.unit} কেনা দাম`} error={errors[purchaseKey]}
                          help={level.purchasePrice ? t(`Custom cost; automatic cost is ${taka(autoBuy)} / ${level.unit}`, `আলাদা কেনা দাম। স্বয়ংক্রিয় দাম ${taka(autoBuy)} / ${level.unit}`) : t(`Automatic: ${taka(autoBuy)} / ${level.unit}`, `স্বয়ংক্রিয়: ${taka(autoBuy)} / ${level.unit}`)}>
                          <MoneyUnitInput id={`pf-${purchaseKey}`} label={t(`Purchase price per ${level.unit}`, `প্রতি ${level.unit} কেনা দাম`)}
                            invalid={Boolean(errors[purchaseKey])} describedBy={`pf-${purchaseKey}-msg`} value={level.purchasePrice ?? ''}
                            onChange={(value) => base ? set('basePurchasePrice', value) : form.updateUnitLevel(level.id, 'purchasePrice', value)}
                            placeholder={autoBuy > 0 ? String(Number(autoBuy.toFixed(4))) : '0'} staticUnit={`/ ${level.unit}`} />
                        </FormField>
                        <FormField id={`pf-${priceKey}`} en={`Selling price per ${level.unit}`} bn={`প্রতি ${level.unit} বিক্রয় মূল্য`} error={errors[priceKey]}
                          help={level.price ? t(`Custom price; automatic price is ${taka(autoSell)} / ${level.unit}`, `আলাদা দাম। স্বয়ংক্রিয় দাম ${taka(autoSell)} / ${level.unit}`) : t(`Automatic: ${taka(autoSell)} / ${level.unit}`, `স্বয়ংক্রিয়: ${taka(autoSell)} / ${level.unit}`)}>
                          <MoneyUnitInput id={`pf-${priceKey}`} label={t(`Selling price per ${level.unit}`, `প্রতি ${level.unit} বিক্রয় মূল্য`)}
                            invalid={Boolean(errors[priceKey])} describedBy={`pf-${priceKey}-msg`} value={level.price}
                            onChange={(value) => base ? set('basePrice', value) : form.updateUnitLevel(level.id, 'price', value)}
                            placeholder={autoSell > 0 ? String(Number(autoSell.toFixed(4))) : '0'} staticUnit={`/ ${level.unit}`} />
                        </FormField>
                      </div>;
                    })}
                  </div>
                </div>
              )}
    </div>
  );
}
