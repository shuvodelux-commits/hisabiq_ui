# MOD-002 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/components/products/AddProductDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/AddProductDialog.tsx#L25) | `export function AddProductDialog(props: Props) {` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/AddProductDialog.tsx#L29) | `function ProductEditor({ onOpenChange, onSave, initialProduct, existingSerials = [], presentation = 'context' }: Props) {` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/AddProductDialog.tsx#L98) | `return <Dialog open onOpenChange={(open) => { if (!open) form.requestExit(); }}>` |
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
## src/components/products/PhotoUploader.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/PhotoUploader.tsx#L14) | `export function PhotoUploader({ photos, onChange, max = 4, label = 'Add photo', hint, compact = false, square = false }: PhotoUploaderProps) {` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/PhotoUploader.tsx#L37) | `onClick={() => onChange(photos.filter((p) => p !== src))}` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/PhotoUploader.tsx#L50) | `onClick={() => inputRef.current?.click()}` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/PhotoUploader.tsx#L64) | `<input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />` |
## src/components/products/ProductInventoryDialogs.tsx

| Source line | Existing declaration / binding |
|---|---|
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L52) | `function priceForOfferUnit(product: Product, unit: string) {` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L59) | `function offerEffectiveInUnit(product: Product, offer: ProductOffer) {` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L66) | `export function ProductDetailsDialog({` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L89) | `const [tab, setTab] = useState<DetailsTab>('overview');` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L121) | `<Dialog open={open} onOpenChange={onOpenChange}>` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L143) | `onClick={() => setTab(id)}` |
| [230](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L230) | `<Button size="sm" onClick={() => onAdjust(product)}>{pl("Adjust stock")}</Button>` |
| [231](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L231) | `<Button size="sm" variant="outline" onClick={() => onAddLot(product)}><Plus className="size-4" /> {pl("Add stock lot")}</Button>` |
| [243](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L243) | `<Button size="sm" variant="outline" onClick={() => onAddLot(product)}><Plus className="size-3.5" /> {pl("Add lot")}</Button>` |
| [273](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L273) | `<Button size="sm" variant="outline" onClick={() => onManageOffers(product)}><Tag className="size-3.5" /> {pl("Manage offers")}</Button>` |
| [288](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L288) | `{!productOffers.length && <div className="px-3 py-8 text-center"><p className="text-sm text-ink-500">{pl("No offers for this product.")}</p><Button size="sm" variant="outline" className="mt-2" onClick={() => onManageOffers(product)}>{pl("Create offer")}</Button></div>}` |
| [331](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L331) | `<Button variant="outline" onClick={() => onOpenChange(false)}>{pl("Close")}</Button>` |
| [338](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L338) | `export function StockAdjustmentDialog({` |
| [351](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L351) | `const [mode, setMode] = useState<StockAdjustmentMode>('Add stock');` |
| [352](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L352) | `const [quantity, setQuantity] = useState('');` |
| [353](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L353) | `const [unit, setUnit] = useState('');` |
| [354](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L354) | `const [reason, setReason] = useState('Count correction');` |
| [355](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L355) | `const [note, setNote] = useState('');` |
| [356](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L356) | `const [error, setError] = useState('');` |
| [379](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L379) | `const save = () => {` |
| [393](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L393) | `<Dialog open={open} onOpenChange={onOpenChange}>` |
| [401](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L401) | `{(['Add stock', 'Remove stock', 'Set exact stock'] as StockAdjustmentMode[]).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setError(''); }} className={ʼrounded-md px-2 py-2 text-xs font-medium ${mode === item ? 'bg-card text-ink shadow-card' : 'text-ink-500 hover:text-ink'}ʼ}>{pl(item)}</button>)}` |
| [406](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L406) | `<Input min={mode==='Set exact stock'?Number.MIN_SAFE_INTEGER:0} value={quantity} onChange={(e) => { const cleaned = mode === 'Set exact stock' ? e.target.value.replace(/[^\d.-]/g, '') : e.target.value.replace(/[^\d.]/g, ''); setQuantity(cleaned); setError(''); }} inputMode="decimal" placeholder="0" className="text-right" autoFocus />` |
| [407](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L407) | `<FormSelect value={selectedUnit} onChange={(e) => setUnit(e.target.value)} options={units} className="w-32 shrink-0" />` |
| [410](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L410) | `<div><label className="mb-1.5 block text-[13px] font-medium text-ink">{pl("Reason")}</label><FormSelect value={reason} onChange={(e) => setReason(e.target.value)} options={productInventoryOptions(language,['Count correction', 'Damage / loss', 'Found stock', 'Personal use', 'Data correction', 'Other'])} /></div>` |
| [411](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L411) | `<div><label className="mb-1.5 block text-[13px] font-medium text-ink">{pl("Note")} <span className="text-xs font-normal text-ink-400">{pl("optional")}</span></label><Input value={note} onChange={(e) => setNote(e.target.value)} /></div>` |
| [415](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L415) | `<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>{pl("Cancel")}</Button><Button onClick={save}>{pl("Save adjustment")}</Button></DialogFooter>` |
| [421](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L421) | `export function StockLotDialog({` |
| [438](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L438) | `const [quantity, setQuantity] = useState('');` |
| [439](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L439) | `const [unit, setUnit] = useState('');` |
| [440](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L440) | `const [unitCost, setUnitCost] = useState('');` |
| [441](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L441) | `const [reference, setReference] = useState('');` |
| [442](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L442) | `const [batch, setBatch] = useState('');` |
| [443](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L443) | `const [manufactureDate, setManufactureDate] = useState('');` |
| [444](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L444) | `const [expiryDate, setExpiryDate] = useState('');` |
| [445](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L445) | `const [serialText, setSerialText] = useState('');` |
| [446](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L446) | `const [error, setError] = useState('');` |
| [470](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L470) | `const save = () => {` |
| [497](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L497) | `<Dialog open={open} onOpenChange={onOpenChange}>` |
| [502](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L502) | `<label className="text-[13px] font-medium text-ink">{pl('Quantity')} {showHelper&&<span className="font-bn text-[11px] text-ink-400">· পরিমাণ</span>}<div className="mt-1.5 flex gap-2"><Input value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" className="text-right" /><FormSelect value={selectedUnit} onChange={(e) => setUnit(e.target.value)} options={units} className="w-28 shrink-0" /></div></label>` |
| [503](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L503) | `<label className="text-[13px] font-medium text-ink">{pl('Unit cost')} {showHelper&&<span className="font-bn text-[11px] text-ink-400">· ক্রয় মূল্য</span>}<Input inputMode="decimal" className="mt-1.5 text-right" value={unitCost} onChange={(e) => setUnitCost(e.target.value.replace(/[^\d.]/g, ''))} /></label>` |
| [504](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L504) | `<label className="text-[13px] font-medium text-ink">{pl('Purchase ref.')} {showHelper&&<span className="font-bn text-[11px] text-ink-400">· রেফারেন্স</span>}<Input className="mt-1.5" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="PUR-1049" /></label>` |
| [505](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L505) | `{product.expiry?.enabled && <label className="text-[13px] font-medium text-ink">{pl('Batch number')} {showHelper&&<span className="font-bn text-[11px] text-ink-400">· ব্যাচ</span>}<Input className="mt-1.5" value={batch} onChange={(e) => setBatch(e.target.value)} /></label>}` |
| [506](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L506) | `{product.expiry?.enabled && <label className="text-[13px] font-medium text-ink">{pl('Manufacture date')} {showHelper&&<span className="font-bn text-[11px] text-ink-400">· উৎপাদন</span>}<Input className="mt-1.5" type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} /></label>}` |
| [507](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L507) | `{product.expiry?.enabled && <label className="text-[13px] font-medium text-ink">{pl('Expiry date')} {showHelper&&<span className="font-bn text-[11px] text-ink-400">· মেয়াদ</span>}<Input className="mt-1.5" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></label>}` |
| [513](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L513) | `<textarea value={serialText} onChange={(e) => setSerialText(e.target.value)} className="mt-2 min-h-28 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" placeholder={"SN-001\nSN-002"} />` |
| [521](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L521) | `<DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>{pl("Cancel")}</Button><Button onClick={save}>{pl("Add lot")}</Button></DialogFooter>` |
| [527](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L527) | `export function ManageOffersDialog({` |
| [542](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L542) | `const [drafts, setDrafts] = useState<ProductOffer[]>([]);` |
| [543](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L543) | `const [editing, setEditing] = useState<ProductOffer  /  null>(null);` |
| [544](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L544) | `const [error, setError] = useState('');` |
| [572](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L572) | `const saveDraft = () => {` |
| [590](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L590) | `<Dialog open={open} onOpenChange={onOpenChange}>` |
| [597](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L597) | `return <button key={offer.id} type="button" onClick={() => { setEditing(offer); setError(''); }} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left hover:bg-ink-50">` |
| [606](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L606) | `<label className="text-[13px] font-medium text-ink">{pl("Discount type")}<FormSelect className="mt-1.5" value={editing.discountType} onChange={(e) => setEditing({ ...editing, discountType: e.target.value as OfferDiscountType })} options={productInventoryOptions(language,['Percentage', 'Fixed'])} /></label>` |
| [607](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L607) | `<label className="text-[13px] font-medium text-ink">{pl("Discount value")}<div className="mt-1.5 flex gap-2"><Input value={String(editing.value)} onChange={(e) => setEditing({ ...editing, value: parseFloat(e.target.value.replace(/[^\d.]/g, ''))  /  /  0 })} inputMode="decimal" className="text-right" />{editing.discountType === 'Fixed' && <FormSelect value={editing.priceUnit} onChange={(e) => setEditing({ ...editing, priceUnit: e.target.value })} options={priceUnits} className="w-28 shrink-0" />}</div>{editing.discountType === 'Fixed' && <p className="mt-1 text-[11px] text-ink-400">{pl("Fixed discount is per")} {editing.priceUnit}.</p>}</label>` |
| [608](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L608) | `<label className="text-[13px] font-medium text-ink">{pl("Start date & time")}<Input className="mt-1.5" type="datetime-local" value={editing.startAt} onChange={(e) => setEditing({ ...editing, startAt: e.target.value })} /></label>` |
| [609](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L609) | `<label className="text-[13px] font-medium text-ink">{pl("End date & time")}<Input className="mt-1.5" type="datetime-local" value={editing.endAt} onChange={(e) => setEditing({ ...editing, endAt: e.target.value })} /></label>` |
| [614](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L614) | `<div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(null)}>{pl("Cancel")}</Button><Button size="sm" onClick={saveDraft}>{pl("Save offer")}</Button></div>` |
| [619](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L619) | `<Button variant="outline" onClick={startNew}><Plus className="size-4" /> {pl("New offer")}</Button>` |
| [620](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L620) | `<Button onClick={persist}>{pl("Done")}</Button>` |
## src/components/products/ProductInventoryViews.tsx

| Source line | Existing declaration / binding |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L17) | `function productById(products: Product[], id: string) {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L21) | `function ProductFilterSelect({` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L32) | `return <AppSelect label={pl('Filter inventory by product')} value={value} onChange={onChange}` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L38) | `export function StockLotsView({` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L85) | `<ProductFilterSelect products={products} value={productFilter} onChange={onProductFilter} />` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L88) | `<Button variant="outline" size="sm" onClick={() => onProductFilter('')}>{pl('Clear product')}</Button>` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L91) | `<Button size="sm" onClick={() => onAdjust(productById(products, productFilter)!)}>` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L168) | `export function StockHistoryView({` |
| [197](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L197) | `<ProductFilterSelect products={products} value={productFilter} onChange={onProductFilter} />` |
| [199](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L199) | `{productFilter && <Button variant="outline" size="sm" onClick={() => onProductFilter('')}>{pl('Clear')}</Button>}` |
## src/components/products/ProductSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L66) | `function SettingActions({` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L85) | `onClick={toggle}` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L94) | `<ActionMenuItem icon={Pencil} onClick={() => { close(); onEdit(); }}>{pl('Edit')}</ActionMenuItem>` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L96) | `<ActionMenuItem icon={Power} tone={active ? 'destructive' : 'neutral'} onClick={() => { close(); onToggle(); }}>` |
| [106](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L106) | `export function ProductSettings() {` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L111) | `const [tab, setTab] = useState<SettingsTab>(() => ['categories','units','brands'].includes(searchParams.get('tab')  /  /  '') ? searchParams.get('tab') as SettingsTab : 'categories');` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L112) | `const [categories, setCategories] = useState<NamedSetting[]>(() => [` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L118) | `const [units, setUnits] = useState<UnitSetting[]>(() => [` |
| [124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L124) | `const [brands, setBrands] = useState<NamedSetting[]>(() => [` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L130) | `const [editing,setEditing]=useState<{kind:ProductSettingKind;item:NamedSetting} / null>(null);` |
| [131](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L131) | `const [editName,setEditName]=useState(''),[editBn,setEditBn]=useState(''),[editSymbol,setEditSymbol]=useState(''),[editError,setEditError]=useState('');` |
| [136](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L136) | `const saveEdit=(event:React.FormEvent)=>{` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L143) | `const saved=getEditedProductSetting(editing.kind,editing.item.name);` |
| [151](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L151) | `const [newName, setNewName] = useState('');` |
| [152](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L152) | `const [newBn, setNewBn] = useState('');` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L153) | `const [newSymbol, setNewSymbol] = useState('');` |
| [154](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L154) | `const [unitError, setUnitError] = useState('');` |
| [223](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L223) | `onClick={() => { setTab(id); clearNew(); }}` |
| [234](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L234) | `<Input className="mt-1" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={pl(tab === 'units' ? 'e.g. Meter' : 'Enter name')} />` |
| [238](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L238) | `<Input className="font-bn mt-1" lang="bn" aria-label={pl('Bangla name')} value={newBn} onChange={(event) => setNewBn(event.target.value)} placeholder="যেমন পিস" />` |
| [248](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L248) | `onChange={(event) => {setNewSymbol(event.target.value);setUnitError('');}} placeholder="pcs / Gg" />` |
| [251](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L251) | `<Button size="sm" onClick={addNamed} disabled={!newName.trim()}>` |
| [359](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L359) | `<Dialog open={Boolean(editing)} onOpenChange={open=>{if(!open)setEditing(null);}}>` |
| [361](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L361) | `<form onSubmit={saveEdit} className="space-y-4">` |
| [368](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L368) | `<Input autoFocus required className="mt-1.5" value={editName} onChange={event=>{setEditName(event.target.value);setEditError('');}} />` |
| [372](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L372) | `<Input className="font-bn mt-1.5" lang="bn" aria-label={pl('Bangla name')} value={editBn} onChange={event=>{setEditBn(event.target.value);setEditError('');}} />` |
| [379](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L379) | `<Input id="edit-unit-symbol" required className="mt-1.5" value={editSymbol} onChange={event=>{setEditSymbol(event.target.value);setEditError('');}} />` |
| [383](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L383) | `<Button type="button" variant="outline" onClick={()=>setEditing(null)}>{pl('Cancel')}</Button>` |
## src/components/products/fields/Disclosure.tsx

| Source line | Existing declaration / binding |
|---|---|
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/Disclosure.tsx#L26) | `export function Disclosure({ id, en, bn, icon: Icon, summary, help, status, action, open, onToggle, errorCount = 0, children }: DisclosureProps) {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/Disclosure.tsx#L38) | `onClick={onToggle}` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/Disclosure.tsx#L57) | `aria-expanded={open} aria-controls={ʼ${id}-panelʼ} onClick={onToggle}` |
## src/components/products/fields/FieldMessage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/FieldMessage.tsx#L7) | `export function FieldMessage({ id, error, hint }: { id: string; error?: Copy; hint?: ReactNode }) {` |
## src/components/products/fields/FormField.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/FormField.tsx#L23) | `export function FormField({ id, en, bn, required, optional, help, hint, error, labelAs = 'label', className = '', children }: FormFieldProps) {` |
## src/components/products/fields/KindToggle.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/KindToggle.tsx#L7) | `export function KindToggle({ value, onChange, locked, compact = false }: { value: ProductKind; onChange: (kind: ProductKind) => void; locked: boolean; compact?: boolean }) {` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/KindToggle.tsx#L14) | `onChange={onChange}` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/KindToggle.tsx#L29) | `onChange={onChange}` |
## src/components/products/fields/LabelText.tsx

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/LabelText.tsx#L4) | `export function LabelText({ en, bn }: { en: string; bn: string }) {` |
## src/components/products/fields/SectionHeading.tsx

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/SectionHeading.tsx#L4) | `export function SectionHeading({ id, en, bn, aside }: { id: string; en: string; bn: string; aside?: ReactNode }) {` |
## src/components/products/fields/SegmentedControl.tsx

| Source line | Existing declaration / binding |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/SegmentedControl.tsx#L22) | `export function SegmentedControl<T extends string>({` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/SegmentedControl.tsx#L51) | `}} type="button" role="radio" aria-checked={selected} tabIndex={index === selectedIndex ? 0 : -1} disabled={disabled} onClick={() => onChange(option.value)} onKeyDown={event => move(event, index)} className={'relative flex min-w-0 items-center justify-center gap-2 rounded-md px-2 font-medium transition-colors duration-150 ease-out disabled:cursor-not-allowed ' + (size === 'lg' ? 'min-h-[52px] py-1.5 ' : 'min-h-[calc(var(--ctl-h)_-_8px)] ') + (selected ? 'text-ink ' : 'text-ink-600 hover:text-ink ') + (disabled && !selected ? 'opacity-50' : '')}>` |
## src/components/products/fields/ToggleRow.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/ToggleRow.tsx#L18) | `export function ToggleRow({ id, en, bn, hint, help, checked, onChange }: ToggleRowProps) {` |
## src/components/products/form/ActionBar.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ActionBar.tsx#L8) | `export function ActionBar({ isEdit, errorCount, onCancel }: ActionBarProps) {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ActionBar.tsx#L27) | `<Button type="button" variant="outline" onClick={onCancel} className="h-9 whitespace-nowrap px-4 text-[14px] md:h-[var(--ctl-h)] md:px-5 md:text-sm">` |
## src/components/products/form/AddProductForm.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AddProductForm.tsx#L10) | `export function AddProductForm({ form }: { form: AddProductFormState }) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AddProductForm.tsx#L16) | `onSubmit={(event) => { event.preventDefault(); form.save(); }}` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AddProductForm.tsx#L23) | `<KindToggle value={form.draft.kind} onChange={form.changeKind} locked={form.isEdit} compact />` |
## src/components/products/form/AdvancedStockPanel.tsx

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AdvancedStockPanel.tsx#L9) | `export function AdvancedStockPanel({ form }: { form: AddProductForm }) {` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AdvancedStockPanel.tsx#L50) | `onChange={(value) => form.updateUnitLevel(level.id, 'unit', value)} onCreate={form.createUnit} withSymbol />` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AdvancedStockPanel.tsx#L56) | `onChange={(value) => form.updateUnitLevel(level.id, 'factor', value)} staticUnit={smaller  /  /  '—'} disabled={unitsLocked} />` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AdvancedStockPanel.tsx#L58) | `<button type="button" disabled={unitsLocked} onClick={() => form.removeUnitLevel(level.id)}` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AdvancedStockPanel.tsx#L69) | `<button type="button" disabled={unitsLocked} onClick={form.addUnitLevel}` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AdvancedStockPanel.tsx#L76) | `value={x.viewUnit} options={x.units.map((unit) => ({ value: unit, label: unit }))} onChange={(next) => set('stockViewUnit', next)} />` |
## src/components/products/form/DiscardDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/DiscardDialog.tsx#L7) | `export function DiscardDialog({ open, onKeep, onDiscard }: DiscardDialogProps) {` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/DiscardDialog.tsx#L10) | `<Dialog open={open} onOpenChange={(next) => { if (!next) onKeep(); }}>` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/DiscardDialog.tsx#L17) | `<Button variant="outline" autoFocus data-autofocus onClick={onKeep} className="h-9">{t('Keep editing', 'সম্পাদনা চালিয়ে যান')}</Button>` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/DiscardDialog.tsx#L18) | `<Button variant="destructive" onClick={onDiscard} className="h-9">{t('Discard', 'বাদ দিন')}</Button>` |
## src/components/products/form/ErrorSummary.tsx

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ErrorSummary.tsx#L6) | `export function ErrorSummary({ form }: { form: AddProductForm }) {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ErrorSummary.tsx#L24) | `onClick={() => form.revealError(key)}` |
## src/components/products/form/ExpirySettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ExpirySettings.tsx#L14) | `export function ExpirySettings({ form }: { form: AddProductForm }) {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ExpirySettings.tsx#L38) | `onChange={(value) => set('expiryDateRequired', value === 'required')}` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ExpirySettings.tsx#L45) | `onChange={(event) => set('expiryWarningDays', event.target.value.replace(/[^\d]/g, ''))}` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ExpirySettings.tsx#L59) | `onChange={(next) => set('allocationMethod', next)}` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ExpirySettings.tsx#L81) | `value={draft.expiryDate} onChange={(next) => set('expiryDate', next)}` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ExpirySettings.tsx#L86) | `<Input id="pf-batch" value={draft.batchNumber} onChange={(event) => set('batchNumber', event.target.value)}` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ExpirySettings.tsx#L93) | `value={draft.manufactureDate} onChange={(next) => set('manufactureDate', next)} className={pickerSize} />` |
## src/components/products/form/OtherOptionsPanel.tsx

| Source line | Existing declaration / binding |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L22) | `export function OtherOptionsPanel({ form }: { form: AddProductForm }) {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L26) | `const [confirmExpiryOff, setConfirmExpiryOff] = useState(false);` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L27) | `const [confirmSingle, setConfirmSingle] = useState(false);` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L83) | `<Input id="pf-barcode" value={draft.barcode} onChange={(event) => set('barcode', event.target.value)}` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L92) | `<PhotoUploader photos={draft.photos} onChange={(photos) => set('photos', photos)} label={t('Add photo', 'ছবি দিন')} />` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L123) | `<Dialog open={confirmSingle} onOpenChange={setConfirmSingle}>` |
| [133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L133) | `<Button type="button" variant="outline" onClick={() => setConfirmSingle(false)}>{t('Keep multiple units', 'একাধিক একক রাখুন')}</Button>` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L134) | `<Button type="button" onClick={() => {` |
| [142](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L142) | `<Dialog open={confirmExpiryOff} onOpenChange={setConfirmExpiryOff}>` |
| [152](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L152) | `<Button type="button" variant="outline" onClick={() => setConfirmExpiryOff(false)}>{t('Keep on', 'চালু রাখুন')}</Button>` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L153) | `<Button type="button" onClick={() => { set('expiryEnabled', false); setConfirmExpiryOff(false); if (openSetting === 'expiry') setOpenSetting(null); }}>` |
## src/components/products/form/PriceStockSection.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/PriceStockSection.tsx#L18) | `export function PriceStockSection({ form }: { form: AddProductForm }) {` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/PriceStockSection.tsx#L68) | `onChange={(value) => set('buy', value)}` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/PriceStockSection.tsx#L91) | `onChange={(value) => set('sell', value)}` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/PriceStockSection.tsx#L110) | `onChange={(checked) => set('useDefaultPriceForAllLots', checked)}` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/PriceStockSection.tsx#L147) | `onChange={(value) => set('openingQty', value)}` |
| [169](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/PriceStockSection.tsx#L169) | `onChange={(value) => set('minQty', value)}` |
## src/components/products/form/ProductDetailsSection.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ProductDetailsSection.tsx#L11) | `export function ProductDetailsSection({ form }: { form: AddProductForm }) {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ProductDetailsSection.tsx#L15) | `const [autoFocusName] = useState(` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ProductDetailsSection.tsx#L31) | `onChange={(event) => set('name', event.target.value)}` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ProductDetailsSection.tsx#L51) | `onChange={(event) => set('nameBn', event.target.value)}` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ProductDetailsSection.tsx#L69) | `onChange={(next) => set('brand', next)}` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ProductDetailsSection.tsx#L84) | `onChange={(next) => set('category', next)}` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ProductDetailsSection.tsx#L108) | `onChange={form.changeUnit}` |
## src/components/products/form/SerialSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/SerialSettings.tsx#L13) | `export function SerialSettings({ form }: { form: AddProductForm }) {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/SerialSettings.tsx#L27) | `<Button id="pf-openingSerials" variant="outline" onClick={() => set('serialTracking', 'Off')} className="mt-3">{t('Turn serials off', 'সিরিয়াল বন্ধ করুন')}</Button>` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/SerialSettings.tsx#L48) | `onChange={(next) => set('serialTracking', next)}` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/SerialSettings.tsx#L66) | `onChange={(event) => set('openingSerialText', event.target.value)}` |
## src/components/products/form/UnitPricesPanel.tsx

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/UnitPricesPanel.tsx#L9) | `export function UnitPricesPanel({ form }: { form: AddProductForm }) {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/UnitPricesPanel.tsx#L36) | `onChange={(value) => base ? set('basePurchasePrice', value) : form.updateUnitLevel(level.id, 'purchasePrice', value)}` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/UnitPricesPanel.tsx#L43) | `onChange={(value) => base ? set('basePrice', value) : form.updateUnitLevel(level.id, 'price', value)}` |
## src/components/products/form/WarrantySettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/WarrantySettings.tsx#L11) | `export function WarrantySettings({ form }: { form: AddProductForm }) {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/WarrantySettings.tsx#L27) | `onChange={(event) => set('warrantyDuration', event.target.value.replace(/[^\d.]/g, ''))}` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/WarrantySettings.tsx#L35) | `onChange={(next) => set('warrantyDurationUnit', next as WarrantyDurationUnit)}` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/WarrantySettings.tsx#L46) | `onChange={(next) => set('warrantyType', next as WarrantyType)}` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/WarrantySettings.tsx#L63) | `onChange={(event) => set('warrantyTerms', event.target.value)}` |
## src/components/products/form/useAddProductForm.ts

| Source line | Existing declaration / binding |
|---|---|
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L37) | `export function useAddProductForm({ initialDraft, isEdit, existing, existingSerials, onExit, onSave }: Options) {` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L40) | `const [unitNotice, setUnitNotice] = useState<Copy  /  null>(null);` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L41) | `const [draft, setDraft] = useState(initialDraft);` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L42) | `const [baseline] = useState(() => JSON.stringify(initialDraft));` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L43) | `const [submitted, setSubmitted] = useState(false);` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L45) | `const [openSetting, setOpenSetting] = useState<ProductSettingKey  /  null>(null);` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L46) | `const [categories, setCategories] = useState(availableProductCategories);` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L47) | `const [brands, setBrands] = useState(availableProductBrands);` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L48) | `const [units, setUnits] = useState(availableProductUnits);` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L49) | `const [saveError, setSaveError] = useState<string  /  null>(null);` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L50) | `const [discardOpen, setDiscardOpen] = useState(false);` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L122) | `const updateUnitLevel = (id: string, key: 'unit'  /  'factor'  /  'price'  /  'purchasePrice', value: string) => {` |
| [141](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L141) | `const removeUnitLevel = (id: string) => {` |
| [163](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L163) | `const createCategory = (name: string) => {` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L168) | `const createBrand = (name: string) => {` |
| [173](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L173) | `const createUnit = (name: string, symbol: string) => {` |
| [209](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L209) | `const save = () => {` |
| [224](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L224) | `const confirmDiscard = () => {` |
## src/data/productUnits.ts

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productUnits.ts#L14) | `export function matchesUnit(option: ProductUnitOption, unit: string): boolean {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productUnits.ts#L19) | `export function unitSymbol(unit: string): string {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productUnits.ts#L23) | `export function validUnitSymbol(symbol: string): boolean {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productUnits.ts#L28) | `export function unitBanglaName(unit: string): string  /  undefined {` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productUnits.ts#L33) | `export function snapshotUnitBanglaNames(units: readonly string[]): Record<string, string> {` |
## src/pages/Products.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L8) | `import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L76) | `function ProductColumnPicker({` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L94) | `onClick={toggle}` |
| [106](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L106) | `onKeyDown={(event) => {` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L122) | `onClick={() => onToggle(column.id)}` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L134) | `function ProductActions({` |
| [171](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L171) | `onClick={toggle}` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L180) | `<ActionMenuItem icon={Eye} onClick={() => { close(); onView(); }}>{pl('View details')}</ActionMenuItem>` |
| [181](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L181) | `<ActionMenuItem icon={Pencil} onClick={() => { close(); onEdit(); }}>{pl('Edit product')}</ActionMenuItem>` |
| [183](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L183) | `{product.kind !== 'Service' && product.kind !== 'Bundle' && <ActionMenuItem icon={SlidersHorizontal} onClick={() => { close(); onAdjust(); }}>{pl('Adjust stock')}</ActionMenuItem>}` |
| [184](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L184) | `{product.kind !== 'Service' && product.kind !== 'Bundle' && <ActionMenuItem icon={PackagePlus} onClick={() => { close(); onAddLot(); }}>{pl('Add stock lot')}</ActionMenuItem>}` |
| [185](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L185) | `<ActionMenuItem icon={Tags} onClick={() => { close(); onOffers(); }}>{pl('Manage offers')}</ActionMenuItem>` |
| [186](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L186) | `{product.kind !== 'Service' && product.kind !== 'Bundle' && <ActionMenuItem icon={Boxes} onClick={() => { close(); onLots(); }}>{pl('Stock lots & serials')}</ActionMenuItem>}` |
| [187](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L187) | `<ActionMenuItem icon={History} onClick={() => { close(); onHistory(); }}>{pl('Product history')}</ActionMenuItem>` |
| [188](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L188) | `<ActionMenuItem icon={Copy} onClick={() => {` |
| [192](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L192) | `<ActionMenuItem icon={Files} onClick={() => { close(); onDuplicate(); }}>{pl('Duplicate')}</ActionMenuItem>` |
| [194](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L194) | `<ActionMenuItem icon={Power} tone={product.active ? 'destructive' : 'neutral'} onClick={() => { close(); onToggle(); }}>` |
| [199](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L199) | `<ActionMenuItem icon={Trash2} tone="destructive" disabled={!!recoveryRestriction(productDeleteReason(product.id),text)} onClick={() => { close(); onDelete(); }}>{pl('Delete')}</ActionMenuItem>` |
| [210](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L210) | `export function Products() {` |
| [217](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L217) | `const [view,setView]=useState<ProductView>(readView);` |
| [223](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L223) | `const [list, setList] = useState<Product[]>(availableProducts);` |
| [225](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L225) | `const [query, setQuery] = useState(routeQuery);` |
| [227](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L227) | `const [category, setCategory] = useState('All');` |
| [228](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L228) | `const [stockFilter, setStockFilter] = useState<StockFilter>('all');` |
| [229](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L229) | `const [dialogOpen, setDialogOpen] = useState(false);` |
| [230](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L230) | `const [importOpen, setImportOpen] = useState(false);` |
| [231](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L231) | `const [editingProduct, setEditingProduct] = useState<Product  /  null>(null);` |
| [232](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L232) | `const [creatingBundle,setCreatingBundle] = useState(false);` |
| [233](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L233) | `const [bundleEditorProduct,setBundleEditorProduct] = useState<Product / null>(null);` |
| [234](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L234) | `const [deleteBundleTarget,setDeleteBundleTarget] = useState<Product / null>(null);` |
| [235](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L235) | `const previewSnapshot=useSyncExternalStore(subscribeProductImportPreview,getProductImportPreviewSnapshot);` |
| [237](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L237) | `const [detailsProduct, setDetailsProduct] = useState<Product  /  null>(null);` |
| [238](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L238) | `const [adjustProduct, setAdjustProduct] = useState<Product  /  null>(null);` |
| [239](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L239) | `const [lotProduct, setLotProduct] = useState<Product  /  null>(null);` |
| [240](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L240) | `const [offerProduct, setOfferProduct] = useState<Product  /  null>(null);` |
| [241](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L241) | `const [lots, setLots] = useState<StockLot[]>(availableStockLots);` |
| [242](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L242) | `const [movements, setMovements] = useState<StockMovement[]>(availableStockMovements);` |
| [243](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L243) | `const [offers, setOffers] = useState<ProductOffer[]>(seedOffers);` |
| [244](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L244) | `const [inventoryProductFilter, setInventoryProductFilter] = useState('');` |
| [327](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L327) | `const saveProductOffers = (product: Product, nextProductOffers: ProductOffer[]) => {` |
| [361](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L361) | `onSave={(draft,revision,originalRecipe)=>{` |
| [371](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L371) | `onOpenChange={(open) => {` |
| [377](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L377) | `onSave={(product, opening?: ProductOpeningMeta) => {` |
| [442](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L442) | `<Button variant="outline" size="sm" onClick={() => downloadReport('hisabiq-products.csv',['Name','Bangla name','SKU','Category','Brand','Base unit','Stock (base unit)','Minimum stock (base unit)','Purchase price (base unit)','Selling price (base unit)','Active'],filtered.map(p => [p.name,p.nameBn ?? '',p.sku,p.category,p.brand ?? '',p.unit,p.stock,p.minStock,p.purchasePrice,p.sellPrice,p.active ? 'Yes' : 'No']))}>` |
| [445](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L445) | `<Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>` |
| [448](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L448) | `<Button variant="outline" size="sm" onClick={()=>{setBundleEditorProduct(null);setCreatingBundle(true);}}>` |
| [451](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L451) | `<Button size="sm" onClick={() => { setEditingProduct(null); setDialogOpen(true); }}>` |
| [470](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L470) | `onKeyDown={(event) => {` |
| [480](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L480) | `onClick={() => chooseView(id)}` |
| [505](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L505) | `onChange={(e) => setQuery(e.target.value)}` |
| [519](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L519) | `onClick={() => setCategory(c)}` |
| [545](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L545) | `onKeyDown={(event) => {` |
| [556](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L556) | `onClick={() => setStockFilter(id)}` |
| [673](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L673) | `onDelete={()=>recoveryDelete.request({kind:'product',id:p.id,label:p.name,revision:JSON.stringify({id:p.id,product:getProductImportPreviewSnapshot().products.find(item=>item.id===p.id),versions:getProductImportPreviewSnapshot().bundleVersions.filter(v=>v.bundleProductId===p.id)}),onDeleted:()=>setList(availableProducts())})}` |
| [690](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L690) | `onClick={() => {` |
| [766](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L766) | `<Dialog open={Boolean(deleteBundleTarget)} onOpenChange={open=>{if(!open)setDeleteBundleTarget(null);}}>` |
| [775](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L775) | `<Button variant="outline" onClick={()=>setDeleteBundleTarget(null)}>{pl('Cancel')}</Button>` |
| [776](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L776) | `<Button onClick={()=>{` |
| [796](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L796) | `onOpenChange={(open) => { if (!open) setDetailsProduct(null); }}` |
| [805](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L805) | `onOpenChange={(open) => { if (!open) setAdjustProduct(null); }}` |
| [806](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L806) | `onSave={(result) => {` |
| [816](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L816) | `onOpenChange={(open) => { if (!open) setLotProduct(null); }}` |
| [817](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L817) | `onSave={(lot) => { if (lotProduct) addLot(lotProduct, lot); }}` |
| [824](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L824) | `onOpenChange={(open) => { if (!open) setOfferProduct(null); }}` |
