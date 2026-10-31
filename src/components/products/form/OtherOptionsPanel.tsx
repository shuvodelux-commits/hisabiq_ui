import { Input } from '../../Input';
import { PhotoUploader } from '../PhotoUploader';
import { Disclosure } from '../fields/Disclosure';
import { FormField } from '../fields/FormField';
import { useFormCopy } from '../../../hooks/useFormCopy';
import { ExpirySettings } from './ExpirySettings';
import { SerialSettings } from './SerialSettings';
import { WarrantySettings } from './WarrantySettings';
import type { AddProductForm } from './useAddProductForm';

export function OtherOptionsPanel({ form }: { form: AddProductForm }) {
  const { t } = useFormCopy();
  const { draft, set, errors } = form;
  const isStock = draft.kind === 'Stock';
  const errorCount = ['warrantyDuration', 'openingSerials', 'expiryDate'].filter((key) => errors[key as keyof typeof errors]).length;

  return (
    <Disclosure
      id="pf-other"
      en="Other options"
      bn="অন্যান্য অপশন"
      help={isStock ? t('Warranty, serial numbers, expiry, barcode and photos.', 'ওয়ারেন্টি, সিরিয়াল, মেয়াদ, বারকোড ও ছবি।') : t('Warranty, barcode and photos.', 'ওয়ারেন্টি, বারকোড ও ছবি।')}
      open={form.otherOpen}
      onToggle={() => form.setOtherOpen(!form.otherOpen)}
      errorCount={errorCount}
    >
      <div className="divide-y divide-border">
        <div className="pb-5"><WarrantySettings form={form} /></div>
        {isStock && <div className="py-5"><SerialSettings form={form} /></div>}
        {isStock && <div className="py-5"><ExpirySettings form={form} /></div>}
        <div className="py-5">
          <div className="max-w-[420px]">
            <FormField id="pf-barcode" en="Barcode / SKU" bn="বারকোড / SKU" optional help={t('Scan or type. Left empty, one is made for you.', 'স্ক্যান করুন বা লিখুন। খালি রাখলে নিজে তৈরি হবে।')}>
              <Input
                id="pf-barcode"
                value={draft.barcode}
                onChange={(event) => set('barcode', event.target.value)}
                autoComplete="off"
                spellCheck={false}
                aria-describedby="pf-barcode-msg"
                className="h-[var(--ctl-h)] text-[length:var(--ctl-fs)]"
              />
            </FormField>
          </div>
        </div>
        <div className="pt-5">
          <FormField id="pf-photos" labelAs="span" en="Photos" bn="ছবি" optional
            help={t('Up to 4 photos. The first photo shows in POS and lists.', 'সর্বোচ্চ ৪টি ছবি। প্রথম ছবি POS ও তালিকায় দেখাবে।')}>
            <PhotoUploader
              photos={draft.photos}
              onChange={(photos) => set('photos', photos)}
              label={t('Add photo', 'ছবি দিন')}

            />
          </FormField>
        </div>
      </div>
    </Disclosure>
  );
}
