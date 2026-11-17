# MOD-003 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

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
## src/data/productImportPreviewStore.ts

| Source line | Existing declaration / binding |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L24) | `export function subscribeProductImportPreview(listener:()=>void):()=>void {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L27) | `function publish(next:ProductImportPreviewSnapshot):void {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L32) | `export function commitProductImportPreview(plan:ProductImportPlan):ImportResult {` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L114) | `export function getBundleVersion(bundleProductId:string,revision?:number):BundleVersion / undefined {` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L119) | `export function registerPostedBundleSalePreview(invoice:{` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L147) | `export function canDeleteBundlePreview(bundleProductId:string):boolean {` |
| [151](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L151) | `export function deleteBundlePreview(bundleProductId:string):void {` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L164) | `export function upsertBundlePreview(` |
| [217](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L217) | `export function upsertProductPreview(product:Product,lot?:StockLot,movement?:StockMovement):void {` |
| [229](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L229) | `export function updateProductInventoryPreview(product:Product,lots:readonly StockLot[],movements:readonly StockMovement[]):void {` |
| [239](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L239) | `export function renameProductClassificationPreview(field:'category' / 'brand',previous:string,next:string):void {` |
| [245](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L245) | `export function removeProductForRecovery(id:string){publish({...snapshot,revision:snapshot.revision+1,products:snapshot.products.filter(p=>p.id!==id),bundleVersions:snapshot.bundleVersions.filter(v=>v.bundleProductId!==id)});}` |
| [246](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L246) | `export function restoreProductForRecovery(payload:{product:Product;versions:readonly BundleVersion[]}){` |
## src/data/productInventory.ts

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productInventory.ts#L4) | `function splitStock(stock: number): [number, number] {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productInventory.ts#L11) | `function lotExtras(productId: string, source: 'Opening'  /  'Purchase'): Partial<StockLot> {` |
## src/import/columnMapping.ts

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/columnMapping.ts#L5) | `export function suggestColumnMapping(target:ImportTarget,headers:readonly string[]):{mapping:ColumnMapping;ambiguities:string[]}{` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/columnMapping.ts#L24) | `export function mapImportRows(table:ImportTable,mapping:ColumnMapping):StagedImportRow[]{` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/columnMapping.ts#L43) | `export function validateMappedRow(row:StagedImportRow,target:ImportTarget):StagedImportRow{` |
## src/import/fieldSchemas.ts

| Source line | Existing declaration / binding |
|---|---|
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/fieldSchemas.ts#L47) | `export function fieldsFor(target:ImportTarget):readonly ImportFieldSchema[]{return target==='product'?product:party;}` |
## src/import/fileReader.ts

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/fileReader.ts#L10) | `function notEmpty(row:ImportCell[]):boolean {return row.some(value=>value!==null&&String(value).trim()!=='');}` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/fileReader.ts#L11) | `function toCell(cell:unknown):ImportCell {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/fileReader.ts#L18) | `export function parseImportCsv(input:string,fileName:string):ImportTable {` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/fileReader.ts#L51) | `export async function parseImportFile(file:File):Promise<ImportTable[]>{` |
## src/import/importTemplates.ts

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/importTemplates.ts#L20) | `function csvSafe(value:unknown):string{` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/importTemplates.ts#L26) | `function linesToCsv(rows:readonly (readonly unknown[])[]):string{` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/importTemplates.ts#L29) | `export function makeTemplateCsv(target:ImportTarget):string{` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/importTemplates.ts#L33) | `export async function makeTemplateXlsx(target:ImportTarget):Promise<Blob>{` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/importTemplates.ts#L43) | `export function makeImportErrorCsv(rows:readonly StagedImportRow[]):string{` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/importTemplates.ts#L54) | `export function downloadImportBlob(blob:Blob,fileName:string):void{` |
## src/import/partyImport.ts

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/partyImport.ts#L18) | `function parsedDate(raw:unknown):string{` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/partyImport.ts#L25) | `export function resolvePartyImportDecisions(` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/partyImport.ts#L73) | `export function planPartyImport(` |
## src/import/productImport.ts

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/productImport.ts#L16) | `function numberFrom(row:StagedImportRow,field:string,required=false):number {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/productImport.ts#L24) | `function dateFrom(row:StagedImportRow,field:string,today:string):string / undefined{` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/productImport.ts#L32) | `function selectedUnit(row:StagedImportRow,field:string,base:string,large?:string):string {` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/productImport.ts#L37) | `function baseQty(row:StagedImportRow,field:string,unitField:string,base:string,large:string / undefined,factor:number):number{` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/productImport.ts#L42) | `function basePrice(row:StagedImportRow,field:string,unitField:string,base:string,large:string / undefined,factor:number,required=false):number {` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/productImport.ts#L47) | `export function resolveProductDecisions(rows:readonly StagedImportRow[],existing:readonly Product[]):StagedImportRow[]{` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/productImport.ts#L66) | `export function planProductImport(` |
## src/import/safeXlsx.ts

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/safeXlsx.ts#L9) | `function fail(message:string):never { throw new Error('Unsafe XLSX workbook: '+message); }` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/safeXlsx.ts#L12) | `export function validateXlsxSafety(bytes:Uint8Array):void {` |
