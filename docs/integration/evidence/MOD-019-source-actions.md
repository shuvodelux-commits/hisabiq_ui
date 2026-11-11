# MOD-019 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/bundles/bundleCart.ts

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleCart.ts#L18) | `export function expandCartStockDemand(` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleCart.ts#L81) | `export function projectCartShortages(` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleCart.ts#L98) | `export function allocateBundlePreview(` |
## src/bundles/bundleDocuments.ts

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleDocuments.ts#L5) | `export function createBundleSaleSnapshot(` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleDocuments.ts#L31) | `export function bundleContentsForReceipt(` |
## src/bundles/bundleFulfillment.ts

| Source line | Existing declaration / binding |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleFulfillment.ts#L22) | `export function planComponentFulfillment(` |
| [126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleFulfillment.ts#L126) | `export function maxAffordableBundleSets(` |
## src/bundles/bundleHandoff.ts

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleHandoff.ts#L18) | `export function captureBundleHandoff(product:Product):Pick<BundleHandoffLine,'bundleRevision' / 'bundleRecipeSignature'> {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleHandoff.ts#L24) | `export function inspectBundleHandoff(` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleHandoff.ts#L49) | `export function inspectBundleHandoffs(` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleHandoff.ts#L55) | `export function reviewBundleHandoffs<L extends BundleHandoffLine>(` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleHandoff.ts#L68) | `export function requireCurrentBundleHandoffs(` |
## src/bundles/bundlePricing.ts

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundlePricing.ts#L7) | `export function priceBundleComponents(` |
## src/bundles/bundleProjection.ts

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleProjection.ts#L9) | `export function getBundleProjection(` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleProjection.ts#L56) | `export function bundleInventoryValue(product:Product):number {` |
## src/bundles/bundleReturn.ts

| Source line | Existing declaration / binding |
|---|---|
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleReturn.ts#L43) | `export function planBundleReturn(req:BundleReturnRequest):BundleReturnPreview{` |
## src/bundles/bundleValidation.ts

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleValidation.ts#L8) | `function decimalToScaled(raw: string, field: string): bigint {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleValidation.ts#L19) | `function calculateQuantity(` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleValidation.ts#L47) | `export function makeBundleComponent(` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/bundleValidation.ts#L63) | `export function validateBundleDraft(draft: BundleDraft, catalog: readonly Product[]): string[] {` |
## src/bundles/usePreviewCatalog.ts

| Source line | Existing declaration / binding |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/usePreviewCatalog.ts#L1) | `import { useSyncExternalStore } from 'react';` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/usePreviewCatalog.ts#L9) | `export function usePreviewCatalog(): readonly Product[] {` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/bundles/usePreviewCatalog.ts#L10) | `const snapshot = useSyncExternalStore(` |
## src/components/products/BundleEditor.tsx

| Source line | Existing declaration / binding |
|---|---|
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L29) | `export function BundleEditor({initialProduct=null,catalog,onSave,onCancel}:BundleEditorProps){` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L31) | `const [expectedRecipe]=useState(()=>initialProduct?getBundleVersion(initialProduct.id):undefined);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L32) | `const [expectedRevision]=useState(()=>expectedRecipe?.revision??null);` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L33) | `const [productId]=useState(()=>initialProduct?.id??'bundle-'+Date.now()+'-'+Math.random().toString(36).slice(2,7));` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L34) | `const [name,setName]=useState(initialProduct?.name??'');` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L35) | `const [nameBn,setNameBn]=useState(initialProduct?.nameBn??'');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L36) | `const [sku,setSku]=useState(initialProduct?.sku??'');` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L37) | `const [category,setCategory]=useState(initialProduct?.category??'Hardware');` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L38) | `const [categories,setCategories]=useState(availableProductCategories);` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L39) | `const [price,setPrice]=useState(initialProduct?String(initialProduct.sellPrice):'');` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L40) | `const [rows,setRows]=useState<Row[]>(()=>expectedRecipe?.components.map(comp=>({` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L43) | `const [error,setError]=useState('');` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L44) | `const [revealed,setRevealed]=useState<string / null>(null);` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L45) | `const [lastAdded,setLastAdded]=useState<string / null>(null);` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L92) | `const save=()=>{` |
| [127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L127) | `<button type="button" onClick={cancel} className="mb-1 inline-flex items-center gap-1 text-xs text-ink-500 hover:text-ink">` |
| [133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L133) | `<div className="flex gap-2"><Button size="sm" variant="outline" onClick={cancel}>{text('Cancel','বাতিল')}</Button>` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L134) | `<Button size="sm" onClick={save}>{text('Save package','প্যাকেজ সংরক্ষণ')}</Button></div>` |
| [140](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L140) | `<Input aria-label="Package name" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Tubewell Set"/>` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L144) | `<Input aria-label="Package SKU" value={sku} onChange={e=>setSku(e.target.value)} placeholder="PKG-001"/>` |
| [148](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L148) | `<QuickAddSelect label="Category" value={category} options={categories.filter(c=>c!=='All')} onChange={setCategory}` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L153) | `<Input aria-label="Bangla name" value={nameBn} onChange={e=>setNameBn(e.target.value)}/>` |
| [158](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L158) | `onChange={e=>setPrice(e.target.value.replace(/[^\d.]/g,''))} placeholder="0.00"/>` |
| [161](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L161) | `<Button size="sm" variant="outline" onClick={()=>setPrice(String(Number(pricing.componentsRetailTotal.toFixed(2))))}` |
| [207](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L207) | `options={units} onChange={unit=>selectUnit(index,product,row,unit)}/>` |
| [211](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L211) | `onClick={()=>selectUnit(index,product,row,u)}` |
| [221](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L221) | `onClick={()=>setRevealed(v=>v===product.id?null:product.id)}` |
| [236](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L236) | `onClick={()=>{setRows(old=>old.filter((_,i)=>i!==index));setRevealed(null);setError('');}}` |
| [245](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L245) | `products={stockProducts.filter(p=>!selectedIds.has(p.id))} onSelect={addProduct}/>` |
| [272](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L272) | `<Button className="w-full" onClick={save}><Plus className="size-4"/>{text('Save package','প্যাকেজ সংরক্ষণ')}</Button>` |
