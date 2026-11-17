# MOD-018 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/components/pos/InstallmentAdjustmentDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L27) | `export function InstallmentAdjustmentDialog({open,mode,agreement,receipts,events,onClose,onRecorded}:Props){` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L29) | `const [lineKey,setLineKey]=useState('');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L30) | `const [quantity,setQuantity]=useState('');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L31) | `const [amount,setAmount]=useState('');` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L32) | `const [reason,setReason]=useState('');` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L33) | `const [review,setReview]=useState(false);` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L34) | `const [error,setError]=useState('');` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L64) | `const save=()=>{` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L86) | `return <Dialog open={open} onOpenChange={next=>!next&&onClose()}>` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L104) | `<AppSelect label={text('Return line','ফেরতের পণ্য')} value={lineKey} onChange={v=>{setLineKey(v);change();}}` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L109) | `inputMode="decimal" value={quantity} onChange={e=>{setQuantity(e.target.value);change();}}` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L117) | `value={amount} onChange={e=>{setAmount(e.target.value);change();}}` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L123) | `onChange={e=>{setReason(e.target.value);change();}}/>` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L143) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L144) | `<Button disabled={!canReview} onClick={save}>` |
## src/components/pos/InstallmentAgreementPreview.tsx

| Source line | Existing declaration / binding |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAgreementPreview.tsx#L17) | `export function InstallmentAgreementPreview({agreement,receipts=[],events=[],onReceive,onReschedule,onReturn,onSettle,onReverseReceipt}:{` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAgreementPreview.tsx#L82) | `<Button size="sm" variant="outline" onClick={()=>onReverseReceipt(receipt.id)}>` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAgreementPreview.tsx#L110) | `<Button size="sm" onClick={onReceive} className="flex-1">` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAgreementPreview.tsx#L114) | `<Button size="sm" variant="outline" onClick={onReschedule} className="flex-1">` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAgreementPreview.tsx#L117) | `{onReturn&&<Button size="sm" variant="outline" onClick={onReturn} disabled={!eligibility.eligible}` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAgreementPreview.tsx#L122) | `<Button size="sm" variant="outline" onClick={onSettle} className="flex-1">` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAgreementPreview.tsx#L125) | `<Button size="sm" variant="outline" onClick={printPreview} className="flex-1">` |
## src/components/pos/InstallmentBreakdownDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L29) | `export function InstallmentBreakdownDialog({open,onClose,rows,onApply,requiredRemainingPaisa}:Props){` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L31) | `const [draft,setDraft]=useState<InstallmentScheduleRow[]>([]);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L32) | `const [amountTexts,setAmountTexts]=useState<Record<string,string>>({});` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L33) | `const [message,setMessage]=useState('');` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L48) | `const update=(id:string,patch:Partial<InstallmentScheduleRow>)=>` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L87) | `const remove=(id:string)=>{` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L91) | `const save=()=>{if(!canSave)return;onApply(draft.map(row=>({...row})));onClose();};` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L92) | `return <Dialog open={open} onOpenChange={isOpen=>{if(!isOpen)onClose();}}>` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L102) | `<Button size="sm" variant="outline" onClick={equally}><Scale className="size-3.5"/>{text('Equal amounts','সমান ভাগ')}</Button>` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L103) | `<Button size="sm" variant="outline" onClick={rebalance}>{text('Rebalance','বাকি মেলান')}</Button>` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L104) | `<Button size="sm" variant="outline" onClick={reset}><RotateCcw className="size-3.5"/>{text('Reset','রিসেট')}</Button>` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L120) | `onChange={range=>update(row.id,{dueDate:range.from,editedDate:true})}/>` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L125) | `onChange={event=>editAmount(row.id,event.target.value)}` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L129) | `<button type="button" disabled={draft.length<=1} onClick={()=>remove(row.id)}` |
| [136](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L136) | `<button type="button" onClick={add} className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-border text-xs font-medium text-teal-700 hover:bg-teal-50">` |
| [150](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L150) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [151](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L151) | `<Button disabled={!canSave} onClick={save}>{text('Apply breakdown','কিস্তি সংরক্ষণ')}</Button>` |
## src/components/pos/InstallmentCustomerQuickAddDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L11) | `export function InstallmentCustomerQuickAddDialog({open,onClose,onSaved,initialName='',initialPhone='',initialAddress=''}:{` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L16) | `const [name,setName]=useState(initialName);` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L17) | `const [phone,setPhone]=useState(initialPhone);` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L18) | `const [area,setArea]=useState(initialAddress);` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L19) | `const [error,setError]=useState('');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L24) | `const submit=(event:FormEvent)=>{` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L39) | `return <Dialog open={open} onOpenChange={value=>{if(!value)onClose();}}>` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L46) | `<form onSubmit={submit} className="space-y-3">` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L50) | `onChange={event=>setName(event.target.value)} autoFocus required className="h-9"/>` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L55) | `value={phone} onChange={event=>setPhone(event.target.value)} required className="h-9"/>` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L60) | `onChange={event=>setArea(event.target.value)} className="h-9"/>` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L64) | `<Button type="button" variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
## src/components/pos/InstallmentReceiptReversalDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L15) | `export function InstallmentReceiptReversalDialog({open,agreement,receipt,receipts,events,onClose,onRecorded}:{` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L21) | `const [reason,setReason]=useState('');` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L22) | `const [review,setReview]=useState(false);` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L23) | `const [error,setError]=useState('');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L29) | `const confirm=()=>{` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L36) | `const saved=recordInstallmentReceiptReversalPreview({` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L47) | `return <Dialog open={open} onOpenChange={next=>!next&&onClose()}>` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L62) | `onChange={e=>{setReason(e.target.value);setReview(false);setError('');}} className="h-9"/>` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L70) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L71) | `<Button disabled={reason.trim().length<3} onClick={confirm}>` |
## src/components/pos/InstallmentReceivePaymentDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L26) | `export function InstallmentReceivePaymentDialog({open,agreement,receipts,events=[],onClose,onRecorded}:Props){` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L28) | `const [date,setDate]=useState(businessToday());` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L29) | `const [amount,setAmount]=useState('');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L30) | `const [splits,setSplits]=useState<FinancePaymentDraft[]>(initial);` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L31) | `const [manual,setManual]=useState(false);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L32) | `const [allocations,setAllocations]=useState<Record<string,string>>({});` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L33) | `const [review,setReview]=useState(false);` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L34) | `const [error,setError]=useState('');` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L35) | `const submitting=useRef(false);` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L73) | `const confirm=()=>{` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L80) | `const saved=recordInstallmentReceiptPreview({` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L90) | `const updateAmount=(value:string)=>{` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L94) | `return <Dialog open={open} onOpenChange={next=>!next&&onClose()}>` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L118) | `value={date} onChange={value=>{setDate(value);setReview(false);setError('');}}/>` |
| [124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L124) | `value={amount} onChange={event=>updateAmount(event.target.value)} placeholder="0.00" className="min-w-0 flex-1 text-right"/>` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L125) | `<Button size="sm" variant="outline" onClick={()=>updateAmount(String(summary.totalOutstandingPaisa/100))}>` |
| [132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L132) | `onChange={value=>{setSplits(value);setReview(false);setError('');}} totalAmount={parsed/100}/>` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L147) | `onChange={event=>{setAllocations(previous=>({...previous,[row.id]:event.target.value}));setReview(false);setError('');}}/>` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L164) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [165](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L165) | `<Button disabled={submitting.current /  / summary.totalOutstandingPaisa===0} onClick={confirm}>` |
## src/components/pos/InstallmentRescheduleDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L33) | `export function InstallmentRescheduleDialog({open,agreement,receipts,events,onClose,onRecorded}:Props){` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L35) | `const [rows,setRows]=useState<InstallmentScheduleRow[]>([]);` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L36) | `const [amounts,setAmounts]=useState<Record<string,string>>({});` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L37) | `const [reason,setReason]=useState('');` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L38) | `const [message,setMessage]=useState('');` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L39) | `const [review,setReview]=useState(false);` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L59) | `const save=()=>{` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L63) | `const saved=recordScheduleRevisionPreview({` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L71) | `return <Dialog open={open} onOpenChange={next=>!next&&onClose()}>` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L93) | `onChange={value=>edit(row.id,{dueDate:value.from,editedDate:true})}/></TableCell>` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L96) | `className="h-9 w-full text-right" onChange={e=>onAmount(row.id,e.target.value)}/></TableCell>` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L109) | `onChange={e=>{setReason(e.target.value);setReview(false);}} className="h-9"/>` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L118) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L119) | `<Button disabled={!valid} onClick={save}>{review?text('Save schedule preview','প্রিভিউ সংরক্ষণ'):text('Review schedule','হিসাব যাচাই')}</Button>` |
## src/components/pos/InstallmentTermsPanel.tsx

| Source line | Existing declaration / binding |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L24) | `export function InstallmentTermsPanel({terms,invoiceTotalPaisa,paidPaisa}:{` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L28) | `const [adjustMode,setAdjustMode]=useState<'amount' / 'percent'>('amount');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L29) | `const [adjustValue,setAdjustValue]=useState('');` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L45) | `value={Number.isFinite(terms.count)?terms.count:''} onChange={event=>terms.onCountChange(Number(event.target.value))}` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L52) | `onChange={range=>terms.onFirstDueDateChange(range.from)}/>` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L64) | `<Button size="sm" variant="outline" onClick={terms.onEditSchedule}>` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L74) | `value={adjustMode} onChange={event=>setAdjustMode(event.target.value as 'amount' / 'percent')}` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L77) | `value={adjustValue} onChange={event=>setAdjustValue(event.target.value)}` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L81) | `onClick={()=>{if(terms.onPriceAdjustment?.(adjustMode,adjustValue))setAdjustValue('');}}>` |
## src/data/installmentPreviewStore.ts

| Source line | Existing declaration / binding |
|---|---|
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts#L35) | `export function recordInstallmentPreview(input:InstallmentPreviewInput):PreviewInstallmentAgreement {` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts#L78) | `export function listInstallmentPreviews():PreviewInstallmentAgreement[]{return structuredClone(records);}` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts#L79) | `export function getInstallmentPreview(id:string):PreviewInstallmentAgreement / undefined{` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts#L89) | `export function recordInstallmentReceiptPreview(input:InstallmentReceiptPreviewInput):InstallmentPaymentPreviewEvent{` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts#L110) | `export function listInstallmentReceipts(agreementId:string):InstallmentPaymentPreviewEvent[]{` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts#L113) | `export function resetInstallmentPreviewsForTest():void{` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts#L119) | `export function listInstallmentLifecycleEvents(agreementId:string):InstallmentLifecycleEvent[]{` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts#L122) | `export function appendInstallmentLifecycleEvent(event:InstallmentLifecycleEvent):InstallmentLifecycleEvent{` |
## src/installments/adjustments.ts

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/adjustments.ts#L23) | `function businessDate(date:string):string{` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/adjustments.ts#L39) | `function prepared(input:{agreementId:string;actorId:string;reason:string;operationId:string;` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/adjustments.ts#L53) | `export function previewInstallmentReturn(input:InstallmentReturnInput):InstallmentReturnCheck{` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/adjustments.ts#L81) | `export function recordInstallmentReturnPreview(input:InstallmentReturnInput):ReturnAdjustmentPreview{` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/adjustments.ts#L100) | `export function recordInstallmentSettlementPreview(input:InstallmentSettlementInput):AgreementReductionPreview{` |
## src/installments/collections.ts

| Source line | Existing declaration / binding |
|---|---|
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/collections.ts#L37) | `function remainingRows(agreement:PreviewInstallmentAgreement,receipts:readonly InstallmentPaymentPreviewEvent[],asOf?:string){` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/collections.ts#L65) | `export function projectInstallmentBalance(` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/collections.ts#L84) | `export function allocateOldestInstallments(` |
## src/installments/historicalLines.ts

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/historicalLines.ts#L20) | `function deepFreeze<T>(value:T):T{` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/historicalLines.ts#L28) | `export function createHistoricalInstallmentLines(` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/historicalLines.ts#L72) | `export function returnEligibility(agreement:PreviewInstallmentAgreement):{eligible:boolean;reason:string}{` |
## src/installments/lifecycle.ts

| Source line | Existing declaration / binding |
|---|---|
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/lifecycle.ts#L39) | `function checkAudit(e:InstallmentLifecycleEvent,agreementId:string,seen:Set<string>,revision:number){` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/lifecycle.ts#L50) | `function applyRevision(rows:WorkRow[],event:ScheduleRevisionPreview):WorkRow[]{` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/lifecycle.ts#L81) | `export function projectInstallmentLifecycle(` |
| [177](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/lifecycle.ts#L177) | `export function allocateOldestLifecycleInstallments(` |
## src/installments/pricing.ts

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L5) | `function validPaisa(amount:number, field='Price'):number {` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L10) | `function parseCurrency(value:string, signed=false):bigint {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L21) | `function safeNumber(value:bigint, field:string):number {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L28) | `export function takaInputToPaisa(value:string):number {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L32) | `export function getInstallmentStartPrice(regularPaisa:number, matchingPresetPaisa?:number):number {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L38) | `function signedPercentBasisPoints(value:string):bigint {` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L48) | `function roundRatio(numerator:bigint, denominator:bigint):bigint {` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L56) | `export function negotiateInstallmentTotal(basePaisa:number, edit:InstallmentPriceEdit):number {` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L67) | `export function allocateNegotiatedInvoiceLines(lines:readonly PricedLine[],targetPaisa:number):PricedLine[] {` |
## src/installments/printLifecycle.ts

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/printLifecycle.ts#L13) | `export function renderInstallmentLifecyclePrint(` |
## src/installments/reversals.ts

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/reversals.ts#L15) | `export function recordInstallmentReceiptReversalPreview(input:ReceiptReversalInput):ReceiptReversalPreview{` |
## src/installments/revisions.ts

| Source line | Existing declaration / binding |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/revisions.ts#L24) | `export function previewScheduleRevision(input:ScheduleRevisionInput):ScheduleRevisionPreview{` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/revisions.ts#L67) | `export function recordScheduleRevisionPreview(input:ScheduleRevisionInput):ScheduleRevisionPreview{` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/revisions.ts#L77) | `export function listInstallmentRevisions(agreementId:string):ScheduleRevisionPreview[]{` |
## src/installments/schedule.ts

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L5) | `function paisa(value:number,name:string):number {` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L9) | `function dateParts(date:string):{year:number;month:number;day:number}{` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L17) | `function iso(year:number,month:number,day:number):string {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L20) | `function addMonthAnchor(first:{year:number;month:number;day:number},monthOffset:number):string {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L26) | `function addWeeks(first:{year:number;month:number;day:number},weeks:number):string {` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L29) | `function allocateEqual(amount:number,count:number):number[]{` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L38) | `export function generateInstallmentSchedule(input:ScheduleInput):InstallmentScheduleRow[]{` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L54) | `export function validateScheduleRows(rows:readonly InstallmentScheduleRow[]):string[]{` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L72) | `export function scheduleDifferencePaisa(rows:readonly InstallmentScheduleRow[], requiredRemainingPaisa:number):number {` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L79) | `export function rebalanceUneditedInstallments(rows:readonly InstallmentScheduleRow[],requiredRemainingPaisa:number):InstallmentScheduleRow[]{` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L92) | `const updated=rows.map(row=>row.editedAmount?{...row}:{...row,amountPaisa:newAmounts[i++]});` |
## src/installments/validateCollection.ts

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/validateCollection.ts#L13) | `export function validateInstallmentCollection(` |
## src/installments/validateDraft.ts

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/validateDraft.ts#L13) | `export function validateInstallmentDraft(input:InstallmentDraftReview):string[]{` |
