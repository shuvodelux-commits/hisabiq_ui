import { MoneyUnitInput, QuantityUnitInput } from '../../MoneyUnitInput';
import { FormField } from '../fields/FormField';
import { SectionHeading } from '../fields/SectionHeading';
import { useFormCopy } from '../../../hooks/useFormCopy';
import { taka } from '../../../utils/currency';
import { fmtQty } from '../../../utils/productDraft';
import type { AddProductForm } from './useAddProductForm';

/** Readable echo for big amounts so ৳1,85,000 is never just "185000". */
const bigMoney = (amount: string, unit?: string) => {
  const value = parseFloat(amount);
  if (!(value >= 1000)) return null;
  return unit ? `${taka(value)} / ${unit}` : taka(value);
};

export function PriceStockSection({ form }: { form: AddProductForm }) {
  const { t } = useFormCopy();
  const { draft, set, errors, derived: x, isEdit, existing } = form;
  const isStock = draft.kind === 'Stock';
  const multi = x.units.length > 1;
  const choices = multi ? x.units : [];

  const sellEcho = [
    bigMoney(draft.sell, isStock ? x.sellUnit : undefined),
    multi && x.sellUnit !== draft.unit && x.sellBase > 0 ? `= ${taka(x.sellBase)} / ${draft.unit}` : null
  ].filter(Boolean).join('  ');
  const buyEcho = [
    bigMoney(draft.buy, isStock ? x.buyUnit : undefined),
    multi && x.buyUnit !== draft.unit && x.buyBase > 0 ? `= ${taka(x.buyBase)} / ${draft.unit}` : null
  ].filter(Boolean).join('  ');

  const qtyHint = (qty: string, unit: string) => {
    const value = parseFloat(qty);
    if (multi && unit !== draft.unit && value > 0) return `= ${fmtQty(value * x.factors[unit])} ${draft.unit}`;
    return undefined;
  };

  const perUnit = isStock ? ` / ${draft.unit}` : '';
  const stockNow = existing ? existing.stock : 0;

  return (
    <section aria-labelledby="pf-price-heading" className="px-4 pb-4 pt-3 md:px-6 md:pb-4 md:pt-4">
      <SectionHeading id="pf-price-heading" en="Price & stock" bn="দাম ও স্টক" />
        <div className="pf-pair-money">
          <FormField
            id="pf-buy"
            en={isStock ? 'Unit cost' : 'Service cost'}
            error={errors.buy}
            bn={isStock ? 'কেনা দাম' : 'সেবা খরচ'}
            optional
            help={isStock ? t('What you pay the supplier.', 'সরবরাহকারীকে যে দাম দেন।') : t('Your cost to provide it.', 'সেবা দিতে আপনার খরচ।')}
            hint={buyEcho || undefined}
          >
            <MoneyUnitInput searchableUnits
              id="pf-buy"
              invalid={Boolean(errors.buy)}
              label={isStock ? t('Unit cost', 'কেনা দাম') : t('Service cost', 'সেবা খরচ')}
              describedBy="pf-buy-msg"
              value={draft.buy}
              onChange={(value) => set('buy', value)}
              unit={x.buyUnit}
              units={choices}
              onUnitChange={multi ? (next) => form.changePriceUnit('buy', next) : undefined}
              staticUnit={isStock ? `/ ${x.buyUnit}` : undefined}
            />
          </FormField>
          <FormField
            id="pf-sell"
            en="Selling price"
            bn="বিক্রয় মূল্য"
            required
            error={errors.sell}
            help={t('Normal price. Offers are managed separately.', 'সাধারণ দাম। অফার আলাদাভাবে ঠিক হয়।')}
            hint={sellEcho || undefined}
          >
            <MoneyUnitInput searchableUnits
              id="pf-sell"
              label={t('Selling price', 'বিক্রয় মূল্য')}
              describedBy="pf-sell-msg"
              required
              invalid={Boolean(errors.sell)}
              value={draft.sell}
              onChange={(value) => set('sell', value)}
              unit={x.sellUnit}
              units={choices}
              onUnitChange={multi ? (next) => form.changePriceUnit('sell', next) : undefined}
              staticUnit={isStock ? `/ ${x.sellUnit}` : undefined}
            />
          </FormField>
        </div>
        {x.profit !== null && x.margin !== null && (
          <p className={'mt-2 text-[13px] font-medium ' + (x.profit < 0 ? 'text-danger' : 'text-ink-600')}>
            {x.profit < 0
              ? t(`Below cost: you lose ${taka(-x.profit)}${perUnit}.`, `কেনা দামের নিচে: ${taka(-x.profit)}${perUnit} লোকসান।`)
              : t(`Profit ${taka(x.profit)}${perUnit} · ${x.margin.toFixed(1)}% margin`, `লাভ ${taka(x.profit)}${perUnit} · ${x.margin.toFixed(1)}%`)}
          </p>
        )}
      {isStock && (
        <div className="mt-3">
          {isEdit && (
            <p className="mb-4 rounded-lg bg-ink-100 px-3 py-2.5 text-[14px] text-ink-700">
              {t('In stock now:', 'এখন স্টকে:')}{' '}
              <strong className="font-semibold text-ink">{fmtQty(stockNow)} {draft.unit}</strong>
              {x.viewUnit !== draft.unit && <span className="text-ink-500"> ({fmtQty(stockNow / x.factors[x.viewUnit])} {x.viewUnit})</span>}
              {'. '}
              {t('To change it, use Adjust stock.', 'বদলাতে Adjust stock ব্যবহার করুন।')}
            </p>
          )}
          <div className="pf-pair-qty">
            {!isEdit && (
              <FormField
                id="pf-opening"
                en="Opening stock"
                error={errors.opening}
                bn="শুরুর স্টক"
                optional
                help={t('How many you have right now.', 'এখন কতগুলো আছে।')}
                hint={qtyHint(draft.openingQty, x.openingUnit)}
              >
                <QuantityUnitInput searchableUnits
                  id="pf-opening"
                  invalid={Boolean(errors.opening)}
                  label={t('Opening stock', 'শুরুর স্টক')}
                  describedBy="pf-opening-msg"
                  value={draft.openingQty}
                  onChange={(value) => set('openingQty', value)}
                  unit={x.openingUnit}
                  units={choices}
                  onUnitChange={multi ? (next) => form.changeStockUnit('opening', next) : undefined}
                  staticUnit={x.openingUnit}
                />
              </FormField>
            )}
            <FormField
              id="pf-min"
              en="Minimum stock"
              error={errors.min}
              bn="সর্বনিম্ন স্টক"
              optional
              help={t('We warn you when stock falls to this.', 'স্টক এতে নামলে সতর্ক করবে।')}
              hint={qtyHint(draft.minQty, x.minUnit)}
            >
              <QuantityUnitInput searchableUnits
                id="pf-min"
                invalid={Boolean(errors.min)}
                label={t('Minimum stock', 'সর্বনিম্ন স্টক')}
                describedBy="pf-min-msg"
                value={draft.minQty}
                onChange={(value) => set('minQty', value)}
                unit={x.minUnit}
                units={choices}
                onUnitChange={multi ? (next) => form.changeStockUnit('min', next) : undefined}
                staticUnit={x.minUnit}
              />
            </FormField>
          </div>
        </div>
      )}
    </section>
  );
}
