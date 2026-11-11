# MOD-011 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/components/vendor/VendorClearDuePanel.tsx

| Source line | Existing declaration / binding |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L25) | `export function VendorClearDuePanel({source,onClose,hideClose=false}:Props){` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L26) | `const [splits,setSplits]=useState<Split[]>([{id:'s1',accountId:accounts[0]?.id??'',amount:''}]);` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L28) | `const [returnQty,setReturnQty]=useState('');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L29) | `const [reason,setReason]=useState('');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L30) | `const [error,setError]=useState('');` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L44) | `const save=(event:React.FormEvent)=>{` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L64) | `return <form onSubmit={save} aria-label="Clear Vendor due" className={hideClose?` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L69) | `</div>{!hideClose&&<Button size="sm" variant="outline" type="button" onClick={onClose}>Close</Button>}</div>` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L80) | `<Button type="button" size="sm" variant="ghost" onClick={()=>setSplits(rows=>[...rows,{id:'s'+(++nextId.current),accountId:accounts[0]?.id??'',amount:''}])}><Plus className="size-3"/> Account</Button></div>` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L84) | `onChange={value=>setSplits(rows=>rows.map(s=>s.id===row.id?{...s,accountId:value}:s))}/></div>` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L86) | `value={row.amount} placeholder="৳0" onChange={e=>setSplits(rows=>rows.map(s=>s.id===row.id?{...s,amount:e.target.value}:s))}/>` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L88) | `aria-label={'Remove payment account '+(i+1)} onClick={()=>setSplits(rows=>rows.filter(s=>s.id!==row.id))}><Trash2 className="size-3"/></Button>}` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L97) | `onChange={e=>setReturnQty(e.target.value)} placeholder="0"/>` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L99) | `onClick={()=>setReturnQty(String(maxReturn))}>` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L108) | `<Input className="mt-1" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Why was this due cleared?"/></label>` |
## src/components/vendor/VendorDirectory.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDirectory.tsx#L23) | `export function VendorDirectory({rows,shown,selectedId,query,onQuery,filter,onFilter,onSelect,picker=false}:Props){` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDirectory.tsx#L38) | `<Input aria-label="Search Vendors" value={query} onChange={e=>onQuery(e.target.value)}` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDirectory.tsx#L39) | `onKeyDown={event=>{if(event.key==='Enter'&&shown.length){event.preventDefault();onSelect(shown[0].p.id);}` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDirectory.tsx#L42) | `{query&&<button type="button" aria-label="Clear Vendor search" title="Clear search" onClick={()=>onQuery('')}` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDirectory.tsx#L49) | `onClick={()=>onFilter(item.id)}` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDirectory.tsx#L65) | `<button type="button" role="option" aria-selected={active} onClick={()=>onSelect(p.id)}` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDirectory.tsx#L86) | `onClick={()=>{onQuery('');onFilter('all');}}>Clear filters · সব দেখুন</button>}` |
## src/components/vendor/VendorDiscardDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDiscardDialog.tsx#L6) | `export function VendorDiscardDialog({open,onCancel,onDiscard}:{` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDiscardDialog.tsx#L10) | `return <Dialog open={open} onOpenChange={value=>{if(!value)onCancel();}}>` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDiscardDialog.tsx#L17) | `<Button type="button" variant="outline" onClick={onCancel}>{text('Keep editing','সম্পাদনা চালিয়ে যান')}</Button>` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDiscardDialog.tsx#L18) | `<Button type="button" onClick={onDiscard} className="bg-danger text-white hover:opacity-90">{text('Discard changes','পরিবর্তন বাদ দিন')}</Button>` |
## src/components/vendor/VendorGoodsEditor.tsx

| Source line | Existing declaration / binding |
|---|---|
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L21) | `export function VendorGoodsEditor({partyId,mode,onSaved,onCancel,onDirtyChange}:Props){` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L22) | `const [catalog,setCatalog]=useState(()=>availableProducts().filter(p=>p.kind!=='Service'));` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L23) | `const [rows,setRows]=useState<Line[]>([]);` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L24) | `const [date,setDate]=useState(businessToday());` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L25) | `const [memo,setMemo]=useState('');` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L26) | `const [error,setError]=useState('');` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L27) | `const [addingProduct,setAddingProduct]=useState(false);` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L28) | `const [counter,setCounter]=useState(0);` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L49) | `const submit=(event:React.FormEvent)=>{` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L77) | `return <form aria-label={mode==='given'?'Give products editor':'Take products editor'} onSubmit={submit}` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L82) | `<Button type="button" size="sm" variant="outline" onClick={cancel}>Cancel</Button>` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L86) | `<Input className="mt-1" aria-label="Vendor memo reference" value={memo} onChange={e=>{setMemo(e.target.value);dirty();}} placeholder="Auto if empty"/>` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L89) | `<AppDatePicker label="Vendor memo date" value={date} onChange={v=>{setDate(v);dirty();}}/>` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L94) | `<ProductCombobox mode="purchase" products={catalog} ref={searchRef} onSelect={add}` |
| [107](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L107) | `onClick={()=>{setRows(items=>items.filter(x=>x.key!==line.key));dirty();}}><Trash2 className="size-4"/></Button>` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L120) | `<AppSelect label={'Price unit for '+p.name} value={line.unit} onChange={unit=>change(line.key,{unit,smallQty:'',price:''})}` |
| [124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L124) | `placeholder={mode==='taken'?'Price not set':'৳'} onChange={e=>change(line.key,{price:e.target.value.replace(/[^\d.]/g,'')})}/></label>` |
| [139](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L139) | `<AddProductDialog open={addingProduct} onOpenChange={setAddingProduct}` |
| [140](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L140) | `existingSerials={[]} onSave={(p,opening)=>{createPreviewProduct(p,opening);setCatalog(items=>[...items,p]);add(p);setAddingProduct(false);}}/>` |
## src/components/vendor/VendorMemoPickerDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorMemoPickerDialog.tsx#L29) | `export function VendorMemoPickerDialog({open,title,memos,selectedId,onSelect,onClose}:Props){` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorMemoPickerDialog.tsx#L30) | `const [query,setQuery]=useState('');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorMemoPickerDialog.tsx#L31) | `const [pendingOnly,setPendingOnly]=useState(false);` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorMemoPickerDialog.tsx#L35) | `return <Dialog open={open} onOpenChange={next=>{if(!next)onClose();}}>` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorMemoPickerDialog.tsx#L45) | `onChange={event=>setQuery(event.target.value)}` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorMemoPickerDialog.tsx#L46) | `onKeyDown={event=>{if(event.key==='Enter'&&shown.length){event.preventDefault();onSelect(shown[0].id);}}}` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorMemoPickerDialog.tsx#L50) | `<input type="checkbox" checked={pendingOnly} onChange={e=>setPendingOnly(e.target.checked)} className="accent-teal-600"/>` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorMemoPickerDialog.tsx#L55) | `onClick={()=>onSelect(m.id)}` |
## src/components/vendor/VendorPaymentsWorkspace.tsx

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorPaymentsWorkspace.tsx#L15) | `export function VendorPaymentsWorkspace({state,sources,sourceId}:Props){` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorPaymentsWorkspace.tsx#L16) | `const [memoPickerOpen,setMemoPickerOpen]=useState(false);` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorPaymentsWorkspace.tsx#L18) | `const [selectedId,setSelectedId]=useState<string / null>(sourceId??null);` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorPaymentsWorkspace.tsx#L36) | `<Button type="button" size="sm" variant="outline" onClick={()=>setMemoPickerOpen(true)}>` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorPaymentsWorkspace.tsx#L42) | `onSelect={id=>{setSelectedId(id);setMemoPickerOpen(false);}}/>` |
## src/components/vendor/VendorSourceWorkspace.tsx

| Source line | Existing declaration / binding |
|---|---|
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L32) | `function VendorPriceForm({source}: {source:VendorSource}){` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L35) | `const [unit,setUnit]=useState(product?.altUnit?.unit??product?.unit??'');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L36) | `const [price,setPrice]=useState('');` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L37) | `const [error,setError]=useState('');` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L40) | `const submit=(event:React.FormEvent)=>{` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L56) | `return <form aria-label="Set Vendor price" onSubmit={submit}` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L66) | `onChange={setUnit} options={[product?.unit??'',...(product?.altUnit?[product.altUnit.unit]:[])].filter(Boolean)}/>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L72) | `aria-label={'Agreed cost per '+unit} value={price} onChange={e=>setPrice(e.target.value)} placeholder="৳0.00"/>` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L83) | `export function VendorSourceWorkspace({mode,sources,snapshot,sourceId,onCorrect}:Props){` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L84) | `const [selectedId,setSelectedId]=useState<string / null>(sourceId);` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L85) | `const [memoPickerOpen,setMemoPickerOpen]=useState(false);` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L88) | `const [givenAction,setGivenAction]=useState<'receive-money' / 'receive-goods'>('receive-money');` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L121) | `<Button type="button" variant="outline" size="sm" onClick={()=>setMemoPickerOpen(true)}>` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L129) | `onSelect={memoId=>{` |
| [142](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L142) | `<div className="flex items-center gap-2"><Button type="button" variant="ghost" size="sm" onClick={()=>onCorrect(selected.id)}>Correct</Button><RowActionMenu label={'Actions for '+selected.reference}>{close=><SourceDeleteAction module="purchases" onReview={()=>{close();onCorrect(selected.id,'reverse');}}/>}</RowActionMenu></div>` |
| [146](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L146) | `onClick={()=>setSelectedId(s.id)}` |
| [170](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L170) | `onClick={()=>setGivenAction('receive-money')}>Receive Money · টাকা নিন</Button>` |
| [172](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L172) | `onClick={()=>setGivenAction('receive-goods')}>Receive Products · পণ্য ফেরত নিন</Button>` |
## src/components/vendor/VendorTabs.tsx

| Source line | Existing declaration / binding |
|---|---|
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L50) | `export function VendorTabs({party,snapshot,purchases,tab,onTabChange,sourceId,onDirtyChange,onEditVendor}:Props){` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L53) | `const [range,setRange]=useState<IsoRange>({from:'',to:''});` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L54) | `const [query,setQuery]=useState('');` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L55) | `const [side,setSide]=useState<VendorSide>('payable');` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L56) | `const [editingTaken,setEditingTaken]=useState(false);` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L57) | `const [hasUnsavedGoods,setHasUnsavedGoods]=useState(false);` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L58) | `const updateDirty=(value:boolean)=>{setHasUnsavedGoods(value);onDirtyChange(value);};` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L59) | `const [editingGiven,setEditingGiven]=useState(false);` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L60) | `const [purchaseOpened,setPurchaseOpened]=useState(tab==='purchases');` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L62) | `const [purchaseRevision,setPurchaseRevision]=useState(0);` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L64) | `const [statementOpen,setStatementOpen]=useState(false);` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L65) | `const [mobileMoreOpen,setMobileMoreOpen]=useState(false);` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L67) | `const [correctionMode,setCorrectionMode]=useState<'correct' / 'reverse'>('correct');` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L68) | `const [correctSource,setCorrectSource]=useState<string / null>(null);` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L69) | `const [correctEvent,setCorrectEvent]=useState<string / null>(null);` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L96) | `const savePurchase=(p:Purchase)=>{` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L153) | `variant={action.key==='taken'?'default':'outline'} title={action.hint} onClick={action.run}>` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L160) | `className="h-9 min-w-0 px-1.5 text-[11.5px]" title={action.hint} onClick={action.run}>` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L164) | `onClick={()=>setMobileMoreOpen(true)}><Ellipsis className="size-5"/> More</Button>` |
| [166](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L166) | `<Dialog open={mobileMoreOpen} onOpenChange={setMobileMoreOpen}>` |
| [173](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L173) | `title={action.hint} onClick={()=>{setMobileMoreOpen(false);action.run();}}>` |
| [187](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L187) | `<button type="button" onClick={()=>selectTab('purchases')}` |
| [200](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L200) | `onClick={()=>selectTab(key)} onKeyDown={e=>{` |
| [216](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L216) | `onChange={value=>setSide(value as VendorSide)}` |
| [218](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L218) | `<AppDateRangePicker value={range} onChange={setRange} label="Vendor ledger date range"/>` |
| [221](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L221) | `<Input className="w-full" value={query} onChange={e=>setQuery(e.target.value)}` |
| [229](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L229) | `<Button type="button" size="sm" variant="outline" className="h-9" onClick={()=>selectTab('taken',unpricedSource?.id)}>Set price · দাম ঠিক করুন</Button>` |
| [231](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L231) | `<button type="button" onClick={()=>selectTab('purchases')}` |
| [242](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L242) | `{ledgerRows.map(e=><button type="button" key={e.id} onClick={()=>review(e)}` |
| [269](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L269) | `<td className="p-2 text-right"><RowActionMenu label={'Actions for '+e.id}>{close=><><ActionMenuItem icon={Eye} onClick={()=>{close();review(e);}}>Review</ActionMenuItem><SourceDeleteAction module="purchases" kind="immutable" onReview={e.kind!=='reversal'?()=>{close();review(e);}:undefined}/></>}</RowActionMenu></td>` |
| [276](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L276) | `<Button type="button" size="sm" variant="outline" onClick={()=>selectTab('taken')}>Open Taken · নেওয়া পণ্য</Button>` |
| [294](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L294) | `<Button type="button" size="sm" variant="ghost" onClick={()=>{` |
## src/components/vendor/VendorV2Cart.tsx

| Source line | Existing declaration / binding |
|---|---|
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L34) | `export function VendorV2Cart({partyId,partyName,mode,onCancel,onSaved,onDirtyChange}:Props){` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L35) | `const [catalog,setCatalog]=useState(()=>availableProducts().filter(p=>p.active&&p.kind!=='Service'&&p.kind!=='Bundle'));` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L36) | `const [rows,setRows]=useState<ExchangeLine[]>([]);` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L37) | `const [date,setDate]=useState(businessToday());` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L38) | `const [reference,setReference]=useState('');` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L39) | `const [addingProduct,setAddingProduct]=useState(false);` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L40) | `const [error,setError]=useState('');` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L54) | `const submit=(event:React.FormEvent)=>{` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L81) | `return <form onSubmit={submit} aria-label={mode==='taken'?'Vendor V2 take goods cart':'Vendor V2 give goods cart'}` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L86) | `<Button type="button" variant="outline" size="sm" onClick={cancel}><ArrowLeft className="size-4"/> Back to Vendor</Button>` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L90) | `<Input value={reference} onChange={e=>{setReference(e.target.value);dirty();}} placeholder="Automatically generated" aria-label="Vendor memo reference"/></div>` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L92) | `<AppDatePicker label="Goods memo date" value={date} onChange={v=>{setDate(v);dirty();}}/></div>` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L98) | `<Button type="button" variant="outline" size="sm" onClick={()=>setAddingProduct(true)}><Plus className="size-4"/> New product</Button>` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L101) | `<ProductCombobox ref={searchRef} products={catalog} mode="purchase" onSelect={add} onCreate={()=>setAddingProduct(true)}` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L122) | `onChange={quantities=>change(r.id,{quantities})}` |
| [126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L126) | `onChange={priceUnit=>change(r.id,{priceUnit,price:convertVendorV2UnitPrice(r.price,` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L130) | `onChange={e=>change(r.id,{price:e.target.value.replace(/[^\d.]/g,'')})}/></td>` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L134) | `onClick={()=>{setRows(items=>items.filter(x=>x.id!==r.id));dirty();}}><Trash2 className="size-4"/></Button></td>` |
| [152](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L152) | `<AddProductDialog open={addingProduct} onOpenChange={setAddingProduct} existingSerials={[]}` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L153) | `onSave={(product,opening)=>{createPreviewProduct(product,opening);setCatalog(items=>[...items,product]);add(product);setAddingProduct(false);}}/>` |
## src/pages/VendorV2.tsx

| Source line | Existing declaration / binding |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L1) | `import {useMemo,useState,useSyncExternalStore} from 'react';` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L44) | `export function VendorV2(){` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L47) | `const partyState=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L48) | `const snapshot=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L51) | `const [search,setSearch]=useState('');` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L52) | `const [filter,setFilter]=useState<VendorDirectoryFilter>('all');` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L53) | `const [picker,setPicker]=useState(false);` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L54) | `const [editingParty,setEditingParty]=useState<Party / null / undefined>(undefined);` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L55) | `const [tab,setTab]=useState<WorkTab>('ledger');` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L56) | `const [editor,setEditor]=useState<Editor>(null);` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L57) | `const [dirty,setDirty]=useState(false);` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L58) | `const [more,setMore]=useState(false);` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L59) | `const [selectedSource,setSelectedSource]=useState<string / null>(null);` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L60) | `const [query,setQuery]=useState('');` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L61) | `const [dateFilter,setDateFilter]=useState<DateFilter>('all');` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L62) | `const [purchaseRevision,setPurchaseRevision]=useState(0);` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L110) | `const saveParty=(draft:PartyDraft,openings:Omit<PartyOpeningPayload,'partyId'>[])=>{` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L123) | `const created=next.parties.find(p=>!before.has(p.id));` |
| [141](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L141) | `<div className="space-y-2"><Button type="button" variant="outline" size="sm" onClick={()=>openEditor(null)}><ArrowLeft className="size-4"/> Vendor workspace</Button>` |
| [152](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L152) | `<Button type="button" variant="outline" size="sm" onClick={()=>navigate('/app/vendors'+(party?'?partyId='+encodeURIComponent(party.id):''))}>Vendor V1</Button>` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L153) | `<Button type="button" size="sm" onClick={()=>setEditingParty(null)}><Plus className="size-4"/> Add Vendor</Button>` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L160) | `<Button size="sm" variant="outline" aria-label="Vendor V1" onClick={()=>navigate('/app/vendors'+(party?'?partyId='+encodeURIComponent(party.id):''))}>V1</Button>` |
| [161](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L161) | `<Button size="sm" onClick={()=>setEditingParty(null)}><Plus className="size-4"/> Vendor</Button>` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L167) | `onQuery={setSearch} filter={filter} onFilter={setFilter} onSelect={selectParty}/>` |
| [171](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L171) | `<Button type="button" size="sm" variant="outline" className="w-full justify-between" onClick={()=>setPicker(true)}>` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L180) | `<Button size="sm" onClick={()=>openEditor('taken')}><Plus className="size-4"/> Take Goods</Button>` |
| [181](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L181) | `<Button variant="outline" size="sm" onClick={()=>openEditor('given')}><Plus className="size-4"/> Give Goods</Button>` |
| [183](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L183) | `<Button type="button" size="sm" variant="outline" onClick={()=>setMore(x=>!x)} aria-expanded={more}><Ellipsis className="size-4"/> More</Button>` |
| [185](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L185) | `<button type="button" className="block h-9 w-full rounded px-2 text-left text-xs hover:bg-ink-50" onClick={()=>openEditor('purchase')}>New Purchase</button>` |
| [186](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L186) | `<button type="button" className="block h-9 w-full rounded px-2 text-left text-xs hover:bg-ink-50" onClick={()=>{setMore(false);sell();}}>New Sale in POS</button>` |
| [187](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L187) | `<button type="button" className="block h-9 w-full rounded px-2 text-left text-xs hover:bg-ink-50" onClick={()=>{setEditingParty(party);setMore(false);}}>Edit Vendor</button>` |
| [188](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L188) | `<button type="button" className="block h-9 w-full rounded px-2 text-left text-xs hover:bg-ink-50" onClick={()=>navigate('/app/vendors?partyId='+encodeURIComponent(party.id))}>Open Vendor V1</button>` |
| [204](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L204) | `onClick={()=>changeTab(k)}>{k==='ledger'?'Ledger':k==='taken'?'Taken':'Given'}</button>)}` |
| [210](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L210) | `<Input aria-label="Search Vendor V2 activity" className="w-full shrink-0 basis-full sm:w-[175px] sm:basis-auto" placeholder="Search memo..." value={query} onChange={e=>setQuery(e.target.value)}/>` |
| [213](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L213) | `onClick={()=>setDateFilter(k)}>{k==='week'?'7 days':k==='today'?'Today':'All'}</Button>)}` |
| [229](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L229) | `onClick={()=>review(g.first,g.kind==='taken'?'taken':'given')}>{g.open?'Review / Settle':'View'}</Button>:` |
| [230](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L230) | `<Button type="button" size="sm" variant="outline" onClick={()=>navigate(g.kind==='purchase'?'/app/purchases':'/app/sales')}>View</Button>}` |
| [252](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L252) | `onClick={()=>review(g.first,g.kind==='taken'?'taken':'given')}>{g.open?'Review / Settle':'View'}</button>:` |
| [253](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L253) | `<Button size="sm" variant="outline" onClick={()=>navigate(g.kind==='purchase'?'/app/purchases':'/app/sales')}>View</Button>}` |
| [261](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L261) | `<Button type="button" variant="outline" size="sm" onClick={()=>setSelectedSource(null)}>Close</Button></div>` |
| [272](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L272) | `<Dialog open={picker} onOpenChange={setPicker}>` |
| [277](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L277) | `onQuery={setSearch} filter={filter} onFilter={setFilter} onSelect={selectParty}/>` |
| [278](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L278) | `<div className="p-3"><Button size="sm" variant="outline" onClick={()=>{setPicker(false);setEditingParty(null);}}><Plus className="size-4"/> Add Vendor</Button></div>` |
| [283](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L283) | `onClose={()=>setEditingParty(undefined)} onSave={saveParty}/>` |
## src/pages/Vendors.tsx

| Source line | Existing declaration / binding |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L1) | `import {useMemo,useState,useSyncExternalStore} from 'react';` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L21) | `export function Vendors(){` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L24) | `const partyState=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L25) | `const snapshot=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L32) | `const [query,setQuery]=useState('');` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L33) | `const [vendorPickerOpen,setVendorPickerOpen]=useState(false);` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L34) | `const [filter,setFilter]=useState<VendorDirectoryFilter>('all');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L36) | `const [dirty,setDirty]=useState(false);` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L37) | `const [editing,setEditing]=useState<Party / null / undefined>(undefined);` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L48) | `const saveVendor=(draft:PartyDraft,openings:Omit<PartyOpeningPayload,'partyId'>[])=>{` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L67) | `const updated=dispatchPartyPreview({type:'create-party',party:{` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L70) | `const created=updated.parties.find(p=>!old.has(p.id));` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L94) | `actions={<><Button type="button" size="sm" variant="outline" onClick={()=>navigate("/app/vendors-v2"+(party?"?partyId="+encodeURIComponent(party.id):""))}>Try Vendor V2</Button><Button type="button" size="sm" onClick={()=>setEditing(null)}><Plus className="size-4"/> Add Vendor</Button></>}/>` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L98) | `<div className="flex gap-2"><Button type="button" size="sm" variant="outline" onClick={()=>navigate("/app/vendors-v2"+(party?"?partyId="+encodeURIComponent(party.id):""))}>V2</Button><Button type="button" size="sm" variant="outline" onClick={()=>setEditing(null)}><Plus className="size-4"/> Add Vendor</Button></div>` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L101) | `onClick={()=>setVendorPickerOpen(true)}` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L108) | `<Dialog open={vendorPickerOpen} onOpenChange={setVendorPickerOpen}>` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L116) | `filter={filter} onFilter={setFilter} onSelect={selectVendor}/>` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L118) | `<Button type="button" size="sm" variant="outline" onClick={()=>{setVendorPickerOpen(false);setEditing(null);}}>` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L128) | `filter={filter} onFilter={setFilter} onSelect={selectVendor}/>` |
| [141](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L141) | `onClose={()=>setEditing(undefined)} onSave={saveVendor}/>` |
## src/vendor/vendorActivity.ts

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorActivity.ts#L14) | `export function ordinaryVendorPurchaseDuePaisa(purchases:readonly Purchase[],vendorPartyId:string):number{` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorActivity.ts#L36) | `export function projectVendorActivity(` |
## src/vendor/vendorCorrection.ts

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorCorrection.ts#L15) | `export function vendorCorrectionImpact(` |
## src/vendor/vendorLedger.ts

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorLedger.ts#L15) | `function validateRange(range:IsoRange,today:string){` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorLedger.ts#L21) | `export function projectVendorStatement(` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorLedger.ts#L52) | `export function serializeVendorStatementCsv(statement:VendorStatement,vendorName:string):string{` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorLedger.ts#L72) | `function sourceOutstandingFromSource(_statement:VendorStatement,s:VendorSource):number {` |
## src/vendor/vendorModel.ts

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L19) | `function validateVendorPaymentSplits(` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L56) | `function ensureVendor(state:VendorPreviewState,id:string):void {` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L61) | `function amountFor(quantity:number,unitCostBasePaisa:number):number {` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L68) | `function source(state:VendorPreviewState,vendorPartyId:string,kind:'sourcing' / 'issue',input:VendorSourceInput,allowUnpricedIssue=false):VendorSource {` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L82) | `function event(state:VendorPreviewState,s:VendorSource,operationId:string):VendorLedgerEvent {` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L99) | `function reverseVendorEvent(` |
| [174](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L174) | `export function applyVendorCommand(state:VendorPreviewState,cmd:VendorPreviewCommand):VendorPreviewState {` |
| [475](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L475) | `export function sourceOutstanding(state:VendorPreviewState,sourceId:string):VendorOutstanding {` |
| [494](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L494) | `export function vendorBalances(state:VendorPreviewState,vendorPartyId:string):VendorBalances {` |
## src/vendor/vendorPartyProjection.ts

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorPartyProjection.ts#L20) | `export function projectVendorPartyProfile(` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorPartyProjection.ts#L45) | `export function projectVendorPartyLedger(profile:VendorPartyProfile,side:VendorSide):LedgerStatement{` |
## src/vendor/vendorPreviewStore.ts

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorPreviewStore.ts#L11) | `function fresh():VendorPreviewState {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorPreviewStore.ts#L32) | `export function getVendorPreviewSnapshot():VendorPreviewState{return state;}` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorPreviewStore.ts#L33) | `export function subscribeVendorPreview(listener:()=>void):()=>void {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorPreviewStore.ts#L38) | `export function dispatchVendorPreview(command:VendorPreviewCommand):VendorPreviewState {` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorPreviewStore.ts#L48) | `export function resetVendorPreviewForTest():void {` |
## src/vendor/vendorRoute.ts

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorRoute.ts#L8) | `export function resolveVendorView(search:string,parties:readonly Party[]):{partyId:string / null;tab:VendorWorkTab}{` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorRoute.ts#L15) | `export function vendorWorkLink(partyId:string,tab?:VendorWorkTab,sourceId?:string):string{` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorRoute.ts#L21) | `export function filterVendors(parties:readonly Party[],text:string):Party[]{` |
## src/vendor/vendorSalePreview.ts

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorSalePreview.ts#L14) | `export function prepareVendorSalePreview(` |
## src/vendor/vendorStock.ts

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorStock.ts#L19) | `export function allocatePosStock(` |
## src/vendor/vendorV2Pricing.ts

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorV2Pricing.ts#L5) | `export function convertVendorV2UnitPrice(price:string,fromFactor:number,toFactor:number):string {` |
