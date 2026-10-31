import { ActionBar } from './ActionBar';
import { OtherOptionsPanel } from './OtherOptionsPanel';
import { PriceStockSection } from './PriceStockSection';
import { ProductDetailsSection } from './ProductDetailsSection';
import { KindToggle } from '../fields/KindToggle';
import { useFormCopy } from '../../../hooks/useFormCopy';
import type { AddProductForm as AddProductFormState } from './useAddProductForm';

/** Approved compact Add Product layout; all existing domain controls and posting remain shared. */
export function AddProductForm({ form }: { form: AddProductFormState }) {
  const { t } = useFormCopy();
  return (
    <form
      noValidate
      aria-labelledby="pf-title"
      onSubmit={(event) => { event.preventDefault(); form.save(); }}
      className="pf-container overflow-visible border border-border bg-card md:rounded-xl md:shadow-card"
    >
      <div className="flex min-h-[48px] items-center justify-between gap-3 px-4 pt-2 md:px-6">
        <h1 id="pf-title" className="text-[16px] font-semibold leading-6 text-ink">
          {form.isEdit ? t('Edit product', 'পণ্য সম্পাদনা') : t('Add product', 'নতুন পণ্য')}
        </h1>
        <KindToggle value={form.draft.kind} onChange={form.changeKind} locked={form.isEdit} compact />
      </div>
      <ProductDetailsSection form={form} />
      <PriceStockSection form={form} />
      <OtherOptionsPanel form={form} />
      <ActionBar isEdit={form.isEdit} errorCount={form.errorList.length} onCancel={form.requestExit} />
    </form>
  );
}
