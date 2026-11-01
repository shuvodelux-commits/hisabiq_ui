import { useState } from 'react';
import { Input } from '../../Input';
import { FormField } from '../fields/FormField';
import { SearchSelect } from '../../SearchSelect';
import { SectionHeading } from '../fields/SectionHeading';
import { useFormCopy } from '../../../hooks/useFormCopy';
import type { AddProductForm } from './useAddProductForm';

const control = 'h-[var(--ctl-h)] text-[length:var(--ctl-fs)]';

export function ProductDetailsSection({ form }: { form: AddProductForm }) {
  const { t } = useFormCopy();
  const { draft, set, errors, isEdit } = form;
  const isStock = draft.kind === 'Stock';
  const [autoFocusName] = useState(
    () => !isEdit && typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );

  return (
      <section aria-labelledby="pf-details-heading" className="px-4 pb-2 pt-3 md:px-6 md:pb-2 md:pt-4">
        <SectionHeading
          id="pf-details-heading"
          en={isStock ? 'Product details' : 'Service details'}
          bn={isStock ? 'পণ্যের তথ্য' : 'সেবার তথ্য'}
        />
        <div className="pf-grid-2">
          <FormField id="pf-name" en="English name" bn="ইংরেজি নাম" required error={errors.name}>
            <Input
              id="pf-name"
              value={draft.name}
              onChange={(event) => set('name', event.target.value)}
              placeholder={isStock ? t('e.g. LED Bulb 12W', 'যেমন LED Bulb 12W') : t('e.g. Ceiling Fan Installation', 'যেমন Ceiling Fan Installation')}
              autoFocus={autoFocusName}
              autoComplete="off"
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby="pf-name-msg"
              className={control + (errors.name ? ' !border-danger' : '')}
            />
          </FormField>
          <FormField
            id="pf-nameBn"
            en="Bangla name"
            bn="বাংলা নাম"
            help={t('Shown on Bangla receipts and in search.', 'বাংলা রসিদ ও খোঁজে দেখাবে।')}
          >
            <Input
              id="pf-nameBn"
              lang="bn"
              value={draft.nameBn}
              onChange={(event) => set('nameBn', event.target.value)}
              placeholder={isStock ? 'যেমন এলইডি বাল্ব ১২ ওয়াট' : 'যেমন সিলিং ফ্যান লাগানো'}
              autoComplete="off"
              aria-describedby="pf-nameBn-msg"
              className={control + ' font-bn'}
            />
          </FormField>
        </div>

        <div className="pf-grid-3 mt-3">
          {isStock && (
            <FormField id="pf-brand" en="Brand" bn="ব্র্যান্ড">
              <SearchSelect
                id="pf-brand"
                noun={{ en: 'brand', bn: 'ব্র্যান্ড' }}
                labelledBy="pf-brand-label"
                value={draft.brand}
                options={form.brands.map((brand) => ({ value: brand, label: brand }))}
                onChange={(next) => set('brand', next)}
                onCreate={form.createBrand}
                onEdit={form.editBrand}
              />
            </FormField>
          )}
          <FormField id="pf-category" en="Category" bn="ক্যাটাগরি" required error={errors.category}>
            <SearchSelect
              id="pf-category"
              noun={{ en: 'category', bn: 'ক্যাটাগরি' }}
              labelledBy="pf-category-label"
              describedBy="pf-category-msg"
              invalid={Boolean(errors.category)}
              value={draft.category}
              options={form.categories.filter((c) => c !== 'All').map((c) => ({ value: c, label: c }))}
              onChange={(next) => set('category', next)}
              onCreate={form.createCategory}
              onEdit={form.editCategory}
            />
          </FormField>
          {isStock && (
            <FormField
              id="pf-unit"
              en="Unit"
              bn="একক"
              required
              error={errors.unit}
              hint={form.unitsLocked ? t('Unit setup is locked for products with stock or history.', 'স্টক বা লেনদেন আছে বলে একক বদলানো যাবে না।')  : draft.multiUnit ? t('Turn multiple units off before changing the smallest unit.', 'সবচেয়ে ছোট একক বদলাতে আগে একাধিক একক বন্ধ করুন।') : undefined}
              help={t('The smallest unit used to count stock, like Pcs or Kg.', 'স্টক গোনার সবচেয়ে ছোট একক, যেমন Pcs বা Kg।')}
            >
              <SearchSelect
                id="pf-unit"
                disabled={form.unitsLocked || draft.multiUnit}
                noun={{ en: 'unit', bn: 'একক' }}
                labelledBy="pf-unit-label"
                describedBy="pf-unit-msg"
                invalid={Boolean(errors.unit)}
                value={draft.unit}
                options={form.units.map((u) => ({ value: u.value ?? u.symbol, label: u.symbol, meta: u.name !== u.symbol ? u.name : undefined, nameBn: u.nameBn }))}
                onChange={form.changeUnit}
                onCreate={form.createUnit}
                onEdit={form.editUnit}
                withSymbol
              />
            </FormField>
          )}
        </div>
      </section>
  );
}
