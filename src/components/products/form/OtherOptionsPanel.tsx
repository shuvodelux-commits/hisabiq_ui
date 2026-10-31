import type { ReactNode } from 'react';
import {
  BarcodeIcon, CalendarClockIcon, ImagesIcon, Layers3Icon,
  ScanLineIcon, ShieldCheckIcon, BadgeDollarSignIcon
} from 'lucide-react';
import { Input } from '../../Input';
import { PhotoUploader } from '../PhotoUploader';
import { Disclosure } from '../fields/Disclosure';
import { FormField } from '../fields/FormField';
import { useFormCopy } from '../../../hooks/useFormCopy';
import { AdvancedStockPanel } from './AdvancedStockPanel';
import { UnitPricesPanel } from './UnitPricesPanel';
import { ExpirySettings } from './ExpirySettings';
import { SerialSettings } from './SerialSettings';
import { WarrantySettings } from './WarrantySettings';
import type { AddProductForm, ProductSettingKey } from './useAddProductForm';

/** All feature configuration is directly accessible; no nested Advanced/Other disclosure. */
export function OtherOptionsPanel({ form }: { form: AddProductForm }) {
  const { t } = useFormCopy();
  const { draft, set, errors, derived: x, openSetting, setOpenSetting } = form;
  const isStock = draft.kind === 'Stock';
  const customPrices = Boolean(draft.basePrice?.trim() || draft.basePurchasePrice?.trim() ||
    draft.unitLevels.some((level) => level.price?.trim() || level.purchasePrice?.trim()));
  const priceError = form.errorList.filter((key) => form.fieldSetting(key) === 'prices').length;
  const unitCount = draft.multiUnit ? Math.max(1, x.units.length) : 0;
  const duration = draft.warrantyDuration && draft.warrantyDuration.trim()
    ? `${draft.warrantyDuration} ${t(draft.warrantyDurationUnit.toLowerCase(), draft.warrantyDurationUnit === 'Months' ? 'মাস' : draft.warrantyDurationUnit === 'Years' ? 'বছর' : 'দিন')}`
    : t('On', 'চালু');
  const sections = [
    ...(isStock ? [
      { id: 'units' as const, en: 'Multiple units', bn: 'একাধিক একক', icon: Layers3Icon,
        status: draft.multiUnit ? t(`${unitCount} units`, `${unitCount}টি একক`) : t('Off', 'বন্ধ') },
      ...(draft.multiUnit ? [{ id: 'prices' as const, en: 'Unit prices', bn: 'একক অনুযায়ী দাম', icon: BadgeDollarSignIcon,
        status: customPrices ? t('Custom', 'আলাদা') : t('Auto', 'স্বয়ংক্রিয়') }] : [])
    ] : []),
    { id: 'warranty' as const, en: 'Warranty', bn: 'ওয়ারেন্টি', icon: ShieldCheckIcon,
      status: draft.warrantyEnabled ? duration : t('Off', 'বন্ধ') },
    ...(isStock ? [
      { id: 'serial' as const, en: 'Serial numbers', bn: 'সিরিয়াল নম্বর', icon: ScanLineIcon,
        status: draft.serialTracking === 'Off' ? t('Off', 'বন্ধ') : t(draft.serialTracking, draft.serialTracking === 'Required' ? 'আবশ্যক' : 'ঐচ্ছিক') },
      { id: 'expiry' as const, en: 'Expiry & batch', bn: 'মেয়াদ ও ব্যাচ', icon: CalendarClockIcon,
        status: draft.expiryEnabled ? t('On', 'চালু') : t('Off', 'বন্ধ') }
    ] : []),
    { id: 'barcode' as const, en: 'Barcode / SKU', bn: 'বারকোড', icon: BarcodeIcon,
      status: draft.barcode.trim() ? t('Set', 'আছে') : t('Not set', 'দেওয়া নেই') },
    { id: 'photos' as const, en: 'Photos', bn: 'ছবি', icon: ImagesIcon,
      status: t(`${draft.photos.length} photos`, `${draft.photos.length}টি ছবি`) }
  ];

  const contents: Record<ProductSettingKey, ReactNode> = {
    units: <AdvancedStockPanel form={form} />,
    prices: <UnitPricesPanel form={form} />,
    warranty: <WarrantySettings form={form} />,
    serial: <SerialSettings form={form} />,
    expiry: <ExpirySettings form={form} />,
    barcode: (
      <div className="max-w-[420px]">
        <FormField id="pf-barcode" en="Barcode / SKU" bn="বারকোড / SKU" optional
          help={t('Scan or type. Left empty, one is made for you.', 'স্ক্যান করুন বা লিখুন। খালি রাখলে নিজে তৈরি হবে।')}>
          <Input id="pf-barcode" value={draft.barcode} onChange={(event) => set('barcode', event.target.value)}
            autoComplete="off" spellCheck={false} aria-describedby="pf-barcode-msg"
            className="h-[var(--ctl-h)] text-[length:var(--ctl-fs)]" />
        </FormField>
      </div>
    ),
    photos: (
      <FormField id="pf-photos" labelAs="span" en="Photos" bn="ছবি" optional
        help={t('Up to 4 photos. The first photo shows in POS and lists.', 'সর্বোচ্চ ৪টি ছবি। প্রথম ছবি POS ও তালিকায় দেখাবে।')}>
        <PhotoUploader photos={draft.photos} onChange={(photos) => set('photos', photos)} label={t('Add photo', 'ছবি দিন')} />
      </FormField>
    )
  };
  return (
    <section data-product-additional-settings className="mx-4 pt-3 pb-3 md:mx-6">
      <h2 className="mb-2 text-[14px] font-semibold text-ink">{t('Additional settings', 'অতিরিক্ত সেটিংস')}</h2>
      <div className="space-y-0.5">
        {sections.map((section) => (
          <Disclosure key={section.id} id={`pf-${section.id}`} icon={section.icon} en={section.en} bn={section.bn}
            status={section.status} open={openSetting === section.id}
            onToggle={() => setOpenSetting(openSetting === section.id ? null : section.id)}
            errorCount={section.id === 'prices' ? priceError
              : form.errorList.filter((key) => form.fieldSetting(key) === section.id).length}
          >
            {contents[section.id]}
          </Disclosure>
        ))}
      </div>
      {errors.unitChain && !draft.multiUnit && <p role="alert" className="text-danger text-[13px]">{t(errors.unitChain.en, errors.unitChain.bn)}</p>}
    </section>
  );
}
