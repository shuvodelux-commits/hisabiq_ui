import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { ProductCombobox } from '../pos/ProductCombobox';
import { CompoundQuantityInput } from '../transactions/CompoundQuantityInput';
import type { BundleComponent, BundleDraft, Product } from '../../types/erp';
import { getBundleVersion } from '../../data/productImportPreviewStore';
import { makeBundleComponent, validateBundleDraft } from '../../bundles/bundleValidation';
import { useUiCopy } from '../../i18n/useUiCopy';
import { taka } from '../../utils/currency';

type Row = {
  productId: string;
  unit: string;
  qty: string;
  secondary: string;
};
export type BundleEditorProps = {
  initialProduct?: Product | null;
  catalog: readonly Product[];
  onSave: (draft: BundleDraft, expectedRevision: number | null) => void;
  onCancel: () => void;
};
/** A full-page catalog editor. No stock or financial posting occurs here. */
export function BundleEditor({
  initialProduct = null, catalog, onSave, onCancel
}: BundleEditorProps) {
  const {text} = useUiCopy();
  const [expectedRevision] = useState(() => initialProduct ? getBundleVersion(initialProduct.id)?.revision ?? null : null);
  const [productId] = useState(() => initialProduct?.id ?? 'bundle-' + Date.now() + '-' + Math.random().toString(36).slice(2,7));
  const [name,setName] = useState(initialProduct?.name ?? '');
  const [nameBn,setNameBn] = useState(initialProduct?.nameBn ?? '');
  const [sku,setSku] = useState(initialProduct?.sku ?? '');
  const [category,setCategory] = useState(initialProduct?.category ?? 'Hardware');
  const [price,setPrice] = useState(initialProduct ? String(initialProduct.sellPrice) : '');
  const [rows,setRows] = useState<Row[]>(() => {
    const old = initialProduct ? getBundleVersion(initialProduct.id) : undefined;
    return old?.components.map(comp => ({
      productId:comp.productId,unit:comp.selectedUnit,qty:comp.primaryQty,secondary:comp.secondaryQty
    })) ?? [];
  });
  const [error,setError] = useState('');
  const [searchKey,setSearchKey] = useState(0);
  const stockProducts=useMemo(() => catalog.filter(p=>p.active && (!p.kind || p.kind==='Stock')),[catalog]);
  const selectedIds=new Set(rows.map(r=>r.productId));
  const rowProduct=(row:Row) => catalog.find(p=>p.id===row.productId);
  const updateRow=(i:number,patch:Partial<Row>)=> {
    setRows(old=>old.map((r,index)=>index===i?{...r,...patch}:r));setError('');
  };
  const addProduct=(product:Product)=>{
    if(selectedIds.has(product.id)){setError(text('Product already included.','এই পণ্যটি আগেই আছে।'));return;}
    setRows(old=>[...old,{productId:product.id,unit:product.altUnit?.unit??product.unit,qty:'1',secondary:''}]);
    setSearchKey(n=>n+1);
    setError('');
  };
  const save=()=>{
    try{
      const parsedPrice=Number(price);
      if(!price.trim()||!Number.isFinite(parsedPrice)||parsedPrice<=0)throw new Error('Enter a valid package price.');
      const components:BundleComponent[]=rows.map((row,i)=>{
        const p=rowProduct(row);
        if(!p)throw new Error('One component no longer exists.');
        return makeBundleComponent(p,row.unit,row.qty,row.secondary,i);
      });
      const product:BundleDraft['product']={
        id:productId,kind:'Bundle',name:name.trim(),nameBn:nameBn.trim()||undefined,
        sku:sku.trim(),category:category.trim()||'Hardware',unit:'Set',
        stock:0,minStock:0,purchasePrice:0,sellPrice:parsedPrice,active:initialProduct?.active??true
      };
      const draft={product,components};
      const issues=validateBundleDraft(draft,catalog);
      if(issues.length)throw new Error(issues.join(' '));
      onSave(draft,expectedRevision);
    }catch(e){
      setError(e instanceof Error?e.message:'Package could not be saved.');
    }
  };
  const cancel=()=>{
    // The draft is intentionally local. Never discard an edited recipe silently.
    if((rows.length>0||name||price)&&!window.confirm(text('Discard unsaved package changes?','প্যাকেজের পরিবর্তনগুলো বাতিল করবেন?')))return;
    onCancel();
  };
  const estimate=rows.reduce((sum,row)=>{
    const p=rowProduct(row);
    if(!p)return sum;
    try{return sum+makeBundleComponent(p,row.unit,row.qty,row.secondary,0).baseQty*p.purchasePrice;}
    catch{return sum;}
  },0);
  return (
    <section data-testid="bundle-editor" className="mx-auto max-w-[1160px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <button type="button" className="mb-2 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink" onClick={cancel}>
            <ArrowLeft className="size-4"/>{text('Back to products','পণ্য তালিকায় ফিরুন')}
          </button>
          <h1 className="text-xl font-semibold text-ink">{initialProduct?text('Edit package','প্যাকেজ বদলান'):text('New package','নতুন প্যাকেজ')}</h1>
          <p className="mt-1 text-sm text-ink-500">{text('One selling price. Stock comes from included products.','একটি বিক্রির দাম। স্টক যাবে প্যাকেজের ভেতরের পণ্য থেকে।')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={cancel}>{text('Cancel','বাতিল')}</Button>
          <Button size="sm" onClick={save}>{text('Save package','প্যাকেজ সংরক্ষণ')}</Button>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm text-ink">
            <span>{text('Package name','প্যাকেজের নাম')}</span>
            <Input aria-label="Package name" value={name} onChange={e=>setName(e.target.value)} placeholder={text('e.g. Tubewell Set','যেমন টিউবওয়েল সেট')}/>
          </label>
          <label className="space-y-1.5 text-sm text-ink">
            <span>{text('Package SKU','প্যাকেজ কোড')}</span>
            <Input aria-label="Package SKU" value={sku} onChange={e=>setSku(e.target.value)} placeholder="PKG-001" />
          </label>
          <label className="space-y-1.5 text-sm text-ink">
            <span>{text('Bangla name (optional)','বাংলা নাম (ঐচ্ছিক)')}</span>
            <Input aria-label="Bangla name" value={nameBn} onChange={e=>setNameBn(e.target.value)}/>
          </label>
          <label className="space-y-1.5 text-sm text-ink">
            <span>{text('Category','ধরন')}</span>
            <Input aria-label="Package category" value={category} onChange={e=>setCategory(e.target.value)} />
          </label>
          <label className="space-y-1.5 text-sm text-ink">
            <span>{text('Price per Set','প্রতি সেটের দাম')}</span>
            <Input aria-label="Price per Set" inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00"/>
          </label>
          <div className="flex flex-col justify-center rounded-lg border border-border bg-ink-50/50 px-3 py-2 text-sm">
            <span className="text-ink-500">{text('Estimated component cost','পণ্যের আনুমানিক কেনা দাম')}</span>
            <strong className="text-ink">{taka(estimate)}</strong>
          </div>
        </div>
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-ink">{text('Included products','প্যাকেজের পণ্য')}</h2>
            <p className="text-xs text-ink-500">{text('Add at least two stock products.','অন্তত দুটি স্টক পণ্য যোগ করুন।')}</p>
          </div>
          <span className="text-xs text-ink-500">{rows.length} {text('products','পণ্য')}</span>
        </div>
        <div className="max-w-xl">
          <ProductCombobox key={searchKey} mode="purchase" ariaLabel="Find stock component"
            products={stockProducts.filter(p=>!selectedIds.has(p.id))} onSelect={addProduct} />
        </div>
        {rows.length===0 && <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-ink-500">
          {text('Search and add products to build this package.','পণ্য খুঁজে যোগ করে প্যাকেজ তৈরি করুন।')}
        </p>}
        <div className="space-y-2">
          {rows.map((row,index)=>{
            const p=rowProduct(row);
            if(!p)return <p className="text-danger" key={row.productId}>{text('Missing product','পণ্য পাওয়া যায়নি')}: {row.productId}</p>;
            return (
              <div data-testid="bundle-component-row" key={row.productId} className="grid min-w-0 gap-2 rounded-lg border border-border p-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(200px,280px)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-ink-500">{p.sku}</p>
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex gap-1">
                    {[p.altUnit?.unit,p.unit].filter((v,i,a):v is string=>Boolean(v)&&a.indexOf(v)===i).map(u=>
                      <button key={u} type="button" aria-pressed={row.unit===u} onClick={()=>updateRow(index,{unit:u,qty:'1',secondary:''})}
                        className={'rounded px-2 py-0.5 text-xs '+(row.unit===u?'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-100':'bg-ink-50 text-ink-500')}>
                        {u}
                      </button>
                    )}
                  </div>
                  <CompoundQuantityInput product={p} unit={row.unit} primary={row.qty} secondary={row.secondary}
                    primaryLabel={'Quantity for '+p.name} secondaryLabel={'Small quantity for '+p.name}
                    onPrimaryChange={qty=>updateRow(index,{qty})}
                    onSecondaryChange={secondary=>updateRow(index,{secondary})}/>
                </div>
                <Button variant="outline" size="sm" onClick={()=>{setRows(old=>old.filter((_,i)=>i!==index));setError('');}} aria-label={'Remove '+p.name}>
                  <Trash2 className="size-4"/><span className="sm:hidden">{text('Remove','বাদ দিন')}</span>
                </Button>
              </div>
            );
          })}
        </div>
        {error && <p role="alert" className="rounded-lg border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}
        <p className="text-xs text-ink-400">{text('Preview only — no inventory, payment or ledger is posted.','শুধু প্রিভিউ — স্টক, টাকা বা খাতায় কোনো লেনদেন জমা হয় না।')}</p>
        <div className="flex justify-end"><Button onClick={save}><Plus className="size-4"/>{text('Save package','প্যাকেজ সংরক্ষণ')}</Button></div>
      </div>
    </section>
  );
}
