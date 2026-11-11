# MOD-004 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/components/parties/LedgerImpactAmount.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerImpactAmount.tsx#L23) | `export function LedgerImpactAmount({` |
## src/components/parties/LedgerTable.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTable.tsx#L23) | `export function LedgerTable({statement,visibleRows,actionsForRow,onAction,onOpenAttachment}:Props){` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTable.tsx#L42) | `onClick={event => {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTable.tsx#L46) | `onKeyDown={event => {` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTable.tsx#L60) | `onClick={()=>onOpenAttachment(row)}/></span>}` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTable.tsx#L76) | `label={text('Open attachment','সংযুক্ত ফাইল খুলুন')} onClick={()=>onOpenAttachment(row)}/>}</div>` |
## src/components/parties/LedgerTableResponsive.tsx

| Source line | Existing declaration / binding |
|---|---|
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTableResponsive.tsx#L31) | `function LedgerTypeIcon({ row }: { row: PartyLedgerRow }) {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTableResponsive.tsx#L38) | `export function LedgerTableResponsive({ statement, visibleRows, actionsForRow, onAction, onOpenAttachment }: Props) {` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTableResponsive.tsx#L75) | `onClick={() => onAction('view',row)}` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTableResponsive.tsx#L87) | `onClick={() => onOpenAttachment(row)} />}` |
| [115](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTableResponsive.tsx#L115) | `onClick={() => onAction('view',row)}` |
| [141](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTableResponsive.tsx#L141) | `onClick={() => onOpenAttachment(row)} />}` |
## src/components/parties/PartyActionSheet.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyActionSheet.tsx#L13) | `export function PartyActionSheet({` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyActionSheet.tsx#L76) | `transition={{ duration: reduce ? 0 : 0.2 }} onClick={onClose} />` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyActionSheet.tsx#L95) | `<button type="button" aria-label={text('Close', 'বন্ধ করুন')} onClick={onClose} data-sheet-first` |
## src/components/parties/PartyAttachmentQuickPreview.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyAttachmentQuickPreview.tsx#L13) | `function safeUrl(url: string  /  undefined): string  /  undefined {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyAttachmentQuickPreview.tsx#L24) | `export function PartyAttachmentQuickPreview({` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyAttachmentQuickPreview.tsx#L35) | `return <Dialog open={Boolean(attachment)} onOpenChange={open=>{if(!open)onClose();}}>` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyAttachmentQuickPreview.tsx#L57) | `<Button variant="outline" onClick={onClose}>{text('Close','বন্ধ করুন')}</Button>` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyAttachmentQuickPreview.tsx#L58) | `{uri && <Button onClick={()=>window.open(uri,'_blank','noopener,noreferrer')}>` |
## src/components/parties/PartyBalanceCard.tsx

| Source line | Existing declaration / binding |
|---|---|
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyBalanceCard.tsx#L45) | `export function partyBalanceCopy(relationship: PartyRole, amount: number): Copy {` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyBalanceCard.tsx#L56) | `export function PartyBalanceCard({` |
## src/components/parties/PartyClosingBalance.tsx

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyClosingBalance.tsx#L9) | `export function closingBalanceMeaning(relationship: PartyRole, balance: number): ClosingBalanceMeaning {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyClosingBalance.tsx#L16) | `export function PartyClosingBalance({` |
## src/components/parties/PartyCreditRefundDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L22) | `export function PartyCreditRefundDialog({open,party,relationship,sources,onClose,onSubmit}:Props){` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L24) | `const [date,setDate]=useState(businessToday());` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L25) | `const [value,setValue]=useState('');` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L26) | `const [reason,setReason]=useState('');` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L27) | `const [splits,setSplits]=useState<FinancePaymentDraft[]>([{id:'refund-1',method:'Cash',accountId:'acc-cash',amount:''}]);` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L28) | `const [review,setReview]=useState(false);` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L41) | `const submit=()=>{` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L57) | `return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L75) | `<AppDatePicker label={text("Refund date","ফেরতের তারিখ")} value={date} onChange={v=>{setDate(v);setReview(false);}}/>` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L79) | `<Input {...inputErrorProps('amount')} aria-label={text("Credit refund amount","ফেরতের টাকা")} inputMode="decimal" value={value} onChange={e=>{` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L83) | `<Button size="sm" variant="outline" onClick={()=>{const a=String(available);setValue(a);` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L89) | `<Input {...inputErrorProps('reason')} aria-label={text("Credit refund reason","ফেরতের কারণ")} value={reason} onChange={e=>{setReason(e.target.value);setReview(false);}}` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L93) | `'aria-label':text(ʼPayment source ${index+1} amountʼ,ʼটাকার মাধ্যম ${index+1}-এর পরিমাণʼ)+' · '+financeLabel(language,row.method)})} accounts={financeAccounts} rows={splits} onChange={v=>{setSplits(v);setReview(false);}} totalAmount={amount}/>` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L102) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L103) | `<Button disabled={!review&&available<=0} onClick={submit}>` |
## src/components/parties/PartyDetail.tsx

| Source line | Existing declaration / binding |
|---|---|
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L78) | `export function PartyDetail({` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L88) | `const [tab, setTab] = useState<Tab>('ledger');` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L89) | `const [vendorSide,setVendorSide]=useState<VendorSide>('payable');` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L90) | `const [note, setNote] = useState('');` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L91) | `const [editingNote, setEditingNote] = useState<LedgerEntry  /  null>(null);` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L92) | `const [editText, setEditText] = useState('');` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L93) | `const [deleteNote, setDeleteNote] = useState<LedgerEntry  /  null>(null);` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L94) | `const [attachment, setAttachment] = useState<LedgerEntry  /  null>(null);` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L95) | `const [viewedRow,setViewedRow] = useState<PartyLedgerRow / null>(null);` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L96) | `const [paymentOpen,setPaymentOpen] = useState(false);` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L97) | `const [vendorSettlementMode,setVendorSettlementMode]=useState<VendorQuickSettlementMode / null>(null);` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L98) | `const [refundOpen,setRefundOpen] = useState(false);` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L99) | `const [financeOpen,setFinanceOpen]=useState(false);` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L100) | `const [financeStartType,setFinanceStartType]=useState<FinanceTransactionType / undefined>();` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L101) | `const [openingOpen,setOpeningOpen]=useState(false);` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L103) | `const [editorRow,setEditorRow]=useState<PartyLedgerRow / null>(null);` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L104) | `const [editorMode,setEditorMode]=useState<'edit' / 'reverse'>('edit');` |
| [166](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L166) | `<div className="min-w-32"><FormSelect title={text("Relationship","সম্পর্কের ধরন")} value={relationship} options={party.roles} onChange={event=>onRoleChange(event.target.value as PartyRole)}/></div>` |
| [192](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L192) | `<Button size="sm" onClick={()=>setVendorSettlementMode('pay')}><Banknote className="size-4"/>{text('Pay Vendor','ভেন্ডরকে টাকা দিন')}</Button>` |
| [193](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L193) | `<Button size="sm" variant="outline" onClick={()=>setVendorSettlementMode('receive-money')}><HandCoins className="size-4"/>{text('Receive Money','টাকা নিন')}</Button>` |
| [194](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L194) | `<Button size="sm" variant="outline" onClick={()=>onOpenVendorWork?.('taken')}>{text('Open Vendor Work','ভেন্ডরের কাজ খুলুন')}</Button>` |
| [195](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L195) | `<Button size="sm" variant="ghost" onClick={()=>setTab('notes')}><StickyNote className="size-4"/> {text('Add note','নোট যোগ করুন')}</Button>` |
| [197](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L197) | `trigger={({toggle,open})=><Button size="sm" variant="outline" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>` |
| [201](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L201) | `<ActionMenuItem role="menuitem" icon={Pencil} onClick={()=>{close();onEditParty();}}>` |
| [205](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L205) | `<ActionMenuItem role="menuitem" icon={BookOpen} onClick={()=>{close();onOpenVendorWork?.('ledger');}}>` |
| [208](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L208) | `<ActionMenuDivider/><ActionMenuItem icon={Trash2} tone="destructive" disabled={!!recoveryRestriction(partyDeleteReason(party.id),text)} onClick={()=>{close();recoveryDelete.request({kind:'party',id:party.id,label:party.name,revision:JSON.stringify(party)});}}>{text('Delete party','পার্টি মুছুন')}</ActionMenuItem>{recoveryRestriction(partyDeleteReason(party.id),text)&&<p className="px-3 py-2 text-xs text-helper">{recoveryRestriction(partyDeleteReason(party.id),text)}</p>}</ActionMenuList>}` |
| [214](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L214) | `onClick={()=>setPaymentOpen(true)}>` |
| [221](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L221) | `onClick={()=>setRefundOpen(true)}>` |
| [225](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L225) | `<Button size="sm" variant="outline" disabled={party.status==='Inactive'} onClick={onNewInvoice}>` |
| [230](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L230) | `onClick={()=>openRoleFinance(action.financeType)}>` |
| [233](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L233) | `<Button size="sm" variant="ghost" onClick={() => setTab('notes')}>` |
| [237](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L237) | `trigger={({toggle,open})=><Button size="sm" variant="outline" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>` |
| [241](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L241) | `<ActionMenuItem role="menuitem" icon={Pencil} onClick={()=>{close();onEditParty();}}>` |
| [245](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L245) | `<ActionMenuItem role="menuitem" icon={BookOpen} onClick={()=>{close();setOpeningOpen(true);}}>` |
| [251](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L251) | `<ActionMenuDivider/><ActionMenuItem icon={Trash2} tone="destructive" disabled={!!recoveryRestriction(partyDeleteReason(party.id),text)} onClick={()=>{close();recoveryDelete.request({kind:'party',id:party.id,label:party.name,revision:JSON.stringify(party)});}}>{text('Delete party','পার্টি মুছুন')}</ActionMenuItem>{recoveryRestriction(partyDeleteReason(party.id),text)&&<p className="px-3 py-2 text-xs text-helper">{recoveryRestriction(partyDeleteReason(party.id),text)}</p>}</ActionMenuList>}` |
| [263](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L263) | `onClick={() => setTab(t.id)}` |
| [290](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L290) | `onClick={()=>{setVendorSide('payable');onPage(1);}}>{text('Taken · You owe','নিয়েছেন · দেনা')}</Button>` |
| [292](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L292) | `onClick={()=>{setVendorSide('receivable');onPage(1);}}>{text('Given · Vendor owes','দিয়েছেন · পাওনা')}</Button>` |
| [303](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L303) | `<Button size="sm" variant="outline" disabled={page<=1} onClick={()=>onPage(page-1)}>{text('Previous','আগের')}</Button>` |
| [304](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L304) | `<Button size="sm" variant="outline" disabled={page>=shownPages} onClick={()=>onPage(page+1)}>{text('Next','পরের')}</Button>` |
| [318](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L318) | `<Button size="sm" variant="ghost" onClick={()=>onOpenVendorWork?.(` |
| [347](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L347) | `<button key={e.id} onClick={() => setAttachment(e)} className="overflow-hidden rounded-lg border border-border text-left hover:border-teal-300">` |
| [371](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L371) | `onSubmit={(e) => {` |
| [379](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L379) | `<Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={text("Write a note… e.g. Promised payment on Sunday","নোট লিখুন… যেমন রবিবার টাকা দেবেন")} aria-label={text("New note","নতুন নোট")} />` |
| [390](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L390) | `<Button type="button" size="icon" variant="ghost" aria-label={ʼ${text('Edit note','নোট বদলান')} ${n.description}ʼ} className="shrink-0 text-ink-500 hover:bg-ink-100" onClick={()=>{setEditingNote(n);setEditText(n.description);}}><Pencil className="size-4"/></Button>` |
| [391](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L391) | `<Button type="button" size="icon" variant="ghost" aria-label={ʼ${text('Delete note','নোট মুছুন')} ${n.description}ʼ} className="shrink-0 text-danger hover:bg-danger-bg" onClick={()=>setDeleteNote(n)}><Trash2 className="size-4"/></Button>` |
| [405](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L405) | `party={party} relationship={relationship} existing={existingOpening} onSubmit={onSetOpening}/>` |
| [413](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L413) | `onClose={()=>setPaymentOpen(false)} onSubmit={onRecordPayment}/>` |
| [415](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L415) | `onClose={()=>setRefundOpen(false)} onSubmit={onRefundCredit}/>` |
| [419](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L419) | `onClose={()=>setFinanceOpen(false)} onSubmit={onRecordFinance}/>}` |
| [427](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L427) | `<Dialog open={!!editingNote} onOpenChange={(open)=>!open&&setEditingNote(null)}>` |
| [430](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L430) | `<Input aria-label={text("Edit note","নোট বদলান")} value={editText} onChange={event=>setEditText(event.target.value)}/>` |
| [431](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L431) | `<div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setEditingNote(null)} >{text('Cancel','বাতিল')}</Button><Button onClick={()=>{if(editingNote&&editText.trim()){onEditNote(editingNote.id,editText.trim());setEditingNote(null);toast.success(text('Note updated','নোট বদলানো হয়েছে'));}}} >{text('Save note','নোট রাখুন')}</Button></div>` |
| [434](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L434) | `<Dialog open={!!deleteNote} onOpenChange={(open)=>!open&&setDeleteNote(null)}>` |
| [437](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L437) | `<div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleteNote(null)} >{text('Keep note','নোট রাখুন')}</Button><Button onClick={()=>{if(deleteNote){onDeleteNote(deleteNote.id);setDeleteNote(null);toast.success(text('Note deleted','নোট মুছে গেছে'));}}} >{text('Confirm delete','নিশ্চিত মুছুন')}</Button></div>` |
## src/components/parties/PartyDetailAdaptive.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailAdaptive.tsx#L14) | `export function PartyDetailAdaptive(props: Props) {` |
## src/components/parties/PartyDetailResponsive.tsx

| Source line | Existing declaration / binding |
|---|---|
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L82) | `export function PartyDetailResponsive({` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L92) | `const [tab, setTab] = useState<Tab>('ledger');` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L94) | `const [mobileActionsOpen,setMobileActionsOpen] = useState(false);` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L102) | `const [vendorSide,setVendorSide]=useState<VendorSide>('payable');` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L103) | `const [note, setNote] = useState('');` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L104) | `const [editingNote, setEditingNote] = useState<LedgerEntry  /  null>(null);` |
| [105](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L105) | `const [editText, setEditText] = useState('');` |
| [106](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L106) | `const [deleteNote, setDeleteNote] = useState<LedgerEntry  /  null>(null);` |
| [107](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L107) | `const [attachment, setAttachment] = useState<LedgerEntry  /  null>(null);` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L108) | `const [viewedRow,setViewedRow] = useState<PartyLedgerRow / null>(null);` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L109) | `const [paymentOpen,setPaymentOpen] = useState(false);` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L110) | `const [vendorSettlementMode,setVendorSettlementMode]=useState<VendorQuickSettlementMode / null>(null);` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L111) | `const [refundOpen,setRefundOpen] = useState(false);` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L112) | `const [financeOpen,setFinanceOpen]=useState(false);` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L113) | `const [financeStartType,setFinanceStartType]=useState<FinanceTransactionType / undefined>();` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L114) | `const [openingOpen,setOpeningOpen]=useState(false);` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L116) | `const [editorRow,setEditorRow]=useState<PartyLedgerRow / null>(null);` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L117) | `const [editorMode,setEditorMode]=useState<'edit' / 'reverse'>('edit');` |
| [226](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L226) | `onClick={() => {close();item.run();}}>{item.label}</ActionMenuItem>;` |
| [229](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L229) | `onClick={() => { close(); item.run(); }}` |
| [267](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L267) | `<FormSelect title={text('Relationship', 'সম্পর্কের ধরন')} value={relationship} options={party.roles} onChange={event=>onRoleChange(event.target.value as PartyRole)} />` |
| [306](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L306) | `<Button size="sm" variant="outline" className={ʼh-9 ${party.phone ? '' : 'col-span-2'}ʼ} onClick={onChangeParty}>` |
| [316](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L316) | `onClick={() => setVendorSettlementMode('pay')}>` |
| [321](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L321) | `onClick={() => setPaymentOpen(true)}>` |
| [327](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L327) | `onClick={()=>openRoleFinance(action.financeType)}>` |
| [331](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L331) | `onClick={() => setOpeningOpen(true)}>` |
| [335](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L335) | `onClick={()=>setVendorSettlementMode('receive-money')}>` |
| [340](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L340) | `disabled={party.status==='Inactive'} onClick={onNewInvoice}>` |
| [345](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L345) | `onClick={()=>openRoleFinance(action.financeType)}>` |
| [351](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L351) | `aria-expanded={mobileActionsOpen} onClick={() => setMobileActionsOpen(true)}>` |
| [358](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L358) | `<Button size="sm" onClick={() => setVendorSettlementMode('pay')}><Banknote className="size-4"/>{text('Pay Vendor', 'ভেন্ডরকে টাকা দিন')}</Button>` |
| [359](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L359) | `<Button size="sm" variant="outline" onClick={() => setVendorSettlementMode('receive-money')}><HandCoins className="size-4"/>{text('Receive Money', 'টাকা নিন')}</Button>` |
| [361](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L361) | `<Button size="sm" onClick={() => setPaymentOpen(true)}>` |
| [365](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L365) | `{relationship==='Customer' && <Button size="sm" variant="outline" onClick={onNewInvoice} disabled={party.status==='Inactive'}>` |
| [370](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L370) | `variant={i===0?'default':'outline'} onClick={()=>openRoleFinance(action.financeType)}>` |
| [373](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L373) | `</> : <Button size="sm" onClick={()=>setOpeningOpen(true)}><BookOpen className="size-4"/>` |
| [380](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L380) | `onClick={() => setRefundOpen(true)}>` |
| [383](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L383) | `<Button size="sm" variant="outline" onClick={() => setTab('notes')}>` |
| [387](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L387) | `trigger={({toggle,open}) => <Button size="sm" variant="outline" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>` |
| [412](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L412) | `onClick={() => setTab(t.id)}` |
| [439](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L439) | `onClick={()=>{setVendorSide('payable');onPage(1);}}>{text('Taken · You owe','নিয়েছেন · দেনা')}</Button>` |
| [441](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L441) | `onClick={()=>{setVendorSide('receivable');onPage(1);}}>{text('Given · Vendor owes','দিয়েছেন · পাওনা')}</Button>` |
| [455](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L455) | `options={['5','10','25','50','100']} onChange={value=>onPageSize(Number(value))}/>` |
| [459](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L459) | `<Button size="sm" variant="outline" className="min-h-9" disabled={page<=1} onClick={()=>onPage(page-1)}>` |
| [463](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L463) | `<Button size="sm" variant="outline" className="min-h-9" disabled={page>=shownPages} onClick={()=>onPage(page+1)}>` |
| [479](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L479) | `<Button size="sm" variant="ghost" onClick={()=>onOpenVendorWork?.(` |
| [508](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L508) | `<button key={e.id} onClick={() => setAttachment(e)} className="overflow-hidden rounded-lg border border-border text-left hover:border-teal-300">` |
| [532](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L532) | `onSubmit={(e) => {` |
| [540](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L540) | `<Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={text("Write a note… e.g. Promised payment on Sunday","নোট লিখুন… যেমন রবিবার টাকা দেবেন")} aria-label={text("New note","নতুন নোট")} />` |
| [551](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L551) | `<Button type="button" size="icon" variant="ghost" aria-label={ʼ${text('Edit note','নোট বদলান')} ${n.description}ʼ} className="shrink-0 text-ink-500 hover:bg-ink-100" onClick={()=>{setEditingNote(n);setEditText(n.description);}}><Pencil className="size-4"/></Button>` |
| [552](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L552) | `<Button type="button" size="icon" variant="ghost" aria-label={ʼ${text('Delete note','নোট মুছুন')} ${n.description}ʼ} className="shrink-0 text-danger hover:bg-danger-bg" onClick={()=>setDeleteNote(n)}><Trash2 className="size-4"/></Button>` |
| [566](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L566) | `party={party} relationship={relationship} existing={existingOpening} onSubmit={onSetOpening}/>` |
| [574](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L574) | `onClose={()=>setPaymentOpen(false)} onSubmit={onRecordPayment}/>` |
| [576](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L576) | `onClose={()=>setRefundOpen(false)} onSubmit={onRefundCredit}/>` |
| [580](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L580) | `onClose={()=>setFinanceOpen(false)} onSubmit={onRecordFinance}/>}` |
| [588](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L588) | `<Dialog open={!!editingNote} onOpenChange={(open)=>!open&&setEditingNote(null)}>` |
| [591](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L591) | `<Input aria-label={text("Edit note","নোট বদলান")} value={editText} onChange={event=>setEditText(event.target.value)}/>` |
| [592](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L592) | `<div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setEditingNote(null)} >{text('Cancel','বাতিল')}</Button><Button onClick={()=>{if(editingNote&&editText.trim()){onEditNote(editingNote.id,editText.trim());setEditingNote(null);toast.success(text('Note updated','নোট বদলানো হয়েছে'));}}} >{text('Save note','নোট রাখুন')}</Button></div>` |
| [595](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L595) | `<Dialog open={!!deleteNote} onOpenChange={(open)=>!open&&setDeleteNote(null)}>` |
| [598](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L598) | `<div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleteNote(null)} >{text('Keep note','নোট রাখুন')}</Button><Button onClick={()=>{if(deleteNote){onDeleteNote(deleteNote.id);setDeleteNote(null);toast.success(text('Note deleted','নোট মুছে গেছে'));}}} >{text('Confirm delete','নিশ্চিত মুছুন')}</Button></div>` |
## src/components/parties/PartyDirectory.tsx

| Source line | Existing declaration / binding |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectory.tsx#L22) | `export function PartyDirectory({ parties, selectedId, onSelect, role, onRole, query, onQuery }: PartyDirectoryProps) {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectory.tsx#L32) | `onKeyDown={onSearchKeyDown}` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectory.tsx#L33) | `onChange={(e) => onQuery(e.target.value)}` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectory.tsx#L45) | `onClick={() => onRole(r)}` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectory.tsx#L61) | `<ul ref={listRef} onKeyDown={onListKeyDown} data-party-directory-list className="max-h-[calc(100vh-290px)] min-h-[320px] flex-1 overflow-auto scrollbar-thin" role="listbox" aria-label={text('Parties','পার্টি তালিকা')}>` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectory.tsx#L68) | `onClick={() => onSelect(p.id)}` |
## src/components/parties/PartyDirectoryResponsive.tsx

| Source line | Existing declaration / binding |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectoryResponsive.tsx#L24) | `export function PartyDirectoryResponsive({ parties, selectedId, onSelect, role, onRole, query, onQuery, picker=false }: PartyDirectoryProps) {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectoryResponsive.tsx#L38) | `onKeyDown={onSearchKeyDown}` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectoryResponsive.tsx#L39) | `onChange={(e) => onQuery(e.target.value)}` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectoryResponsive.tsx#L51) | `onClick={() => onRole(r)}` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectoryResponsive.tsx#L67) | `<ul ref={listRef} onKeyDown={onListKeyDown} data-party-directory-list className={ʼ${picker ? 'min-h-0 max-h-[min(52dvh,480px)]' : 'max-h-[calc(100vh-290px)] min-h-[320px]'} flex-1 overflow-auto scrollbar-thinʼ} role="listbox" aria-label={text('Parties','পার্টি তালিকা')}>` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectoryResponsive.tsx#L74) | `onClick={() => onSelect(p.id)}` |
## src/components/parties/PartyEditorDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L33) | `export function PartyEditorDialog({open,party,existingOpenings=[],onClose,onSave,defaultRole='Customer',initialName=''}:Props) {` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L37) | `const [draft,setDraft]=useState<PartyDraft>(()=>fresh(party,initialName,defaultRole));` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L38) | `const [error,setError]=useState('');` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L39) | `const [openings,setOpenings]=useState<Partial<Record<PartyRole,OpeningDraft>>>({});` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L52) | `const update=(patch:Partial<PartyDraft>)=>setDraft(current=>({...current,...patch}));` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L58) | `const submit=(event:React.FormEvent)=>{` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L78) | `return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L84) | `<form onSubmit={submit} className="space-y-4" aria-label={text("Party profile form","পার্টির তথ্য ফরম")}>` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L87) | `<Input aria-label={text('Party name','পার্টির নাম')} value={draft.name} required onChange={event=>update({name:event.target.value})}/>` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L90) | `<Input aria-label={text('Bangla name','বাংলা নাম')} value={draft.nameBn??''} onChange={event=>update({nameBn:event.target.value})}/>` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L93) | `<Input aria-label={text('Phone','ফোন')} type="tel" value={draft.phone} onChange={event=>update({phone:event.target.value})}/>` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L96) | `<Input aria-label={text('Area','এলাকা')} value={draft.area} onChange={event=>update({area:event.target.value})}/>` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L103) | `<input type="checkbox" checked={draft.roles.includes(role)} onChange={event=>toggleRole(role,event.target.checked)} className="size-4 accent-teal-600"/>` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L117) | `value={opening(role).amount} onChange={e=>changeOpening(role,{amount:e.target.value})}/>` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L121) | `onChange={v=>changeOpening(role,{side:v as 'debit' / 'credit'})}` |
| [126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L126) | `onChange={v=>changeOpening(role,{date:v})}/>` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L134) | `<Button type="button" variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
## src/components/parties/PartyExcelImportDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyExcelImportDialog.tsx#L15) | `export function PartyExcelImportDialog({open,selectedRole,onClose,onLegacyImport}:{` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyExcelImportDialog.tsx#L19) | `const [target,setTarget]=useState<PartyImportTarget / ''>('');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyExcelImportDialog.tsx#L31) | `if(!target)return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyExcelImportDialog.tsx#L38) | `<AppSelect label={text('Relationship to import','কোন সম্পর্কের তথ্য আনবেন')} value={target} onChange={value=>setTarget(value as PartyImportTarget)}` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyExcelImportDialog.tsx#L46) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyExcelImportDialog.tsx#L47) | `<Button variant="outline" onClick={onLegacyImport}>{text('Legacy multi-role CSV','আগের ধরনের CSV')}</Button>` |
## src/components/parties/PartyFinanceDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L29) | `export function PartyFinanceDialog({open,party,relationship,initialType,onClose,onSubmit}:Props){` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L31) | `const [type,setType]=useState<FinanceTransactionType>(available[relationship][0]);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L32) | `const [date,setDate]=useState(businessToday());` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L33) | `const [amount,setAmount]=useState('');` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L34) | `const [splits,setSplits]=useState<FinancePaymentDraft[]>(initial);` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L35) | `const [reference,setReference]=useState('');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L36) | `const [note,setNote]=useState('');` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L37) | `const [review,setReview]=useState(false);` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L50) | `const submit=()=>{` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L68) | `return <Dialog open={open} onOpenChange={next=>!next&&onClose()}>` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L82) | `<AppSelect label={text("Finance transaction type","টাকার লেনদেনের ধরন")} value={type} onChange={changeType}` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L86) | `<AppDatePicker label={text("Finance transaction date","লেনদেনের তারিখ")} value={date} onChange={value=>{setDate(value);setReview(false);}}/>` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L90) | `onChange={event=>{const value=event.target.value;setAmount(value);setReview(false);` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L94) | `<Input aria-label={text("Finance reference","রেফারেন্স")} value={reference} onChange={e=>{setReference(e.target.value);setReview(false);}}/>` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L101) | `onChange={rows=>{setSplits(rows);setReview(false);}} totalAmount={Number(amount) /  / 0}/>}` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L103) | `<Input aria-label={text("Finance note","লেনদেনের মন্তব্য")} value={note} onChange={e=>{setNote(e.target.value);setReview(false);}}/>` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L113) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L114) | `<Button onClick={submit}>{review?<><Check className="size-4"/> {text('Confirm finance transaction','লেনদেন নিশ্চিত করুন')}</>:` |
## src/components/parties/PartyImportDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyImportDialog.tsx#L10) | `export function PartyImportDialog({open,onClose,onImport}:Props){` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyImportDialog.tsx#L12) | `const [result,setResult]=useState<PartyCsvResult / null>(null);` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyImportDialog.tsx#L13) | `const [error,setError]=useState('');` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyImportDialog.tsx#L14) | `const [filename,setFilename]=useState('');` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyImportDialog.tsx#L26) | `return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyImportDialog.tsx#L34) | `<input type="file" accept=".csv,text/csv" aria-label={text('Select CSV file','CSV ফাইল বাছুন')} onChange={event=>void pick(event.target.files?.[0])}` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyImportDialog.tsx#L54) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyImportDialog.tsx#L55) | `<Button disabled={!result?.valid.length} onClick={importRows}>{text('Import','যোগ করুন')} {result?.valid.length??0} {text('parties','পার্টি')}</Button>` |
## src/components/parties/PartyLedgerIndicators.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerIndicators.tsx#L23) | `export function PartyLedgerSourceBadge({ source, label }: { source: PartyLedgerSource; label: string }) {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerIndicators.tsx#L32) | `export function PartyLedgerAttachment({` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerIndicators.tsx#L41) | `title={attachment.name} onClick={onClick}` |
## src/components/parties/PartyLedgerRowActions.tsx

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerRowActions.tsx#L16) | `export function PartyLedgerRowActions({row,actions,onAction}:Props){` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerRowActions.tsx#L25) | `expanded={open} onClick={toggle} />}` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerRowActions.tsx#L35) | `onClick={()=>{close();onAction(action,row);}}>` |
## src/components/parties/PartyLedgerToolbar.tsx

| Source line | Existing declaration / binding |
|---|---|
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbar.tsx#L26) | `export function PartyLedgerToolbar({range,onRange,kind,onKind,query,onQuery,pageSize,onPageSize,onStatement,onReset}:Props){` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbar.tsx#L34) | `<Input aria-label={text("Search ledger transactions","খাতার লেনদেন খুঁজুন")} value={query} onChange={event=>onQuery(event.target.value)}` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbar.tsx#L37) | `<AppDateRangePicker label={text("Party ledger date range","পক্ষের খাতার তারিখ")} value={range} onChange={onRange}/>` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbar.tsx#L39) | `<AppSelect label={text("Transaction type","লেনদেনের ধরন")} value={kind} onChange={onKind}` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbar.tsx#L42) | `aria-label={text('Clear filters','ফিল্টার মুছুন')} title={text('Clear filters','ফিল্টার মুছুন')} onClick={onReset}>` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbar.tsx#L47) | `onChange={value=>onPageSize(Number(value))}/>` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbar.tsx#L48) | `<Button size="sm" variant="outline" onClick={onStatement}><Printer className="size-4"/> {text('Print statement','হিসাব প্রিন্ট')}</Button>` |
## src/components/parties/PartyLedgerToolbarResponsive.tsx

| Source line | Existing declaration / binding |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L27) | `export function PartyLedgerToolbarResponsive({range,onRange,kind,onKind,query,onQuery,pageSize,onPageSize,onStatement,onReset}:Props){` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L29) | `const [filtersOpen,setFiltersOpen]=useState(false);` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L40) | `onClick={()=>setFiltersOpen(open=>!open)}` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L52) | `onChange={event=>onQuery(event.target.value)}` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L56) | `<AppDateRangePicker label={text('Party ledger date range','পক্ষের খাতার তারিখ')} value={range} onChange={onRange}` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L64) | `value={kind} onChange={onKind}` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L66) | `<Button type="button" size="icon" variant="outline" data-ledger-filter-action="" onClick={onReset}` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L74) | `onChange={value=>onPageSize(Number(value))}/>` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L75) | `<Button type="button" size="sm" variant="outline" data-ledger-filter-action="" onClick={onStatement}` |
## src/components/parties/PartyOpeningDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L34) | `export function PartyOpeningDialog({open,party,relationship,existing,onClose,onSubmit}:Props){` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L37) | `const [amount,setAmount]=useState('');` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L38) | `const [side,setSide]=useState<'debit' / 'credit'>(defaultOpeningSide(relationship));` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L39) | `const [date,setDate]=useState(businessToday());` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L40) | `const [note,setNote]=useState('');` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L50) | `const submit=(e:React.FormEvent)=>{` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L58) | `return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L64) | `<form onSubmit={submit} className="min-w-0 space-y-4" aria-label={text("Opening balance form","শুরুর জেরের ফরম")}>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L72) | `<input type="radio" name="party-opening-side" checked={side===value} onChange={()=>setSide(value)} className="size-4 accent-teal-600"/>` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L79) | `onChange={e=>setAmount(e.target.value)} autoFocus/>` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L82) | `<AppDatePicker label={text('Opening balance date','শুরুর জেরের তারিখ')} value={date} onChange={setDate}/>` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L86) | `<Input aria-label={text('Opening balance note','শুরুর জেরের নোট')} value={note} maxLength={400} placeholder={text("As per old account book","আগের খাতা অনুযায়ী")} onChange={e=>setNote(e.target.value)}/>` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L92) | `<div className="flex flex-wrap justify-end gap-2 [&>button]:max-w-full [&>button]:whitespace-normal"><Button type="button" variant="outline" onClick={onClose} >{text('Cancel','বাতিল')}</Button>` |
## src/components/parties/PartyPaymentDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L24) | `export function PartyPaymentDialog({open,party,relationship,sources,onClose,onSubmit}:Props) {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L26) | `const [date,setDate]=useState(businessToday());` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L27) | `const [amount,setAmount]=useState('');` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L28) | `const [discount,setDiscount]=useState('');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L29) | `const [reason,setReason]=useState('');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L30) | `const [invoiceId,setInvoiceId]=useState('');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L31) | `const [splits,setSplits]=useState<FinancePaymentDraft[]>(initial);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L32) | `const [review,setReview]=useState(false);` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L48) | `const submit=()=>{` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L66) | `return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L79) | `<AppDatePicker label={text("Payment date","পেমেন্টের তারিখ")} value={date} onChange={value=>{setDate(value);setReview(false);}}/>` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L82) | `<div className="flex gap-1"><Input {...inputErrorProps('amount')} aria-label={text("Payment amount","পেমেন্টের টাকা")} inputMode="decimal" value={amount} onChange={event=>{` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L86) | `<Button size="sm" variant="outline" onClick={()=>{const n=String(Math.max(0,due-rebate));setAmount(n);if(splits.length===1)setSplits(previous=>previous.map(item=>({...item,amount:n})));setReview(false);}}>{text('Full','পুরো বাকি')}</Button>` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L90) | `<Input {...inputErrorProps('discount')} aria-label={text("Payment discount","পেমেন্টে ছাড়")} value={discount} inputMode="decimal" onChange={event=>{setDiscount(event.target.value);setReview(false);}} placeholder="0"/>` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L93) | `<AppSelect label={text("Invoice selection","বিল বাছুন")} value={invoiceId} options={invoiceOptions} onChange={value=>{setInvoiceId(value);setReview(false);}}/>` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L97) | `<Input {...inputErrorProps('reason')} aria-label={text("Payment reason","পেমেন্টের কারণ")} value={reason} onChange={event=>{setReason(event.target.value);setReview(false);}} placeholder={text("Required when discount is applied","ছাড় দিলে কারণ আবশ্যক")}/>` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L100) | `'aria-label':text(ʼPayment source ${index+1} amountʼ,ʼটাকার মাধ্যম ${index+1}-এর পরিমাণʼ)+' · '+financeLabel(language,row.method)})} accounts={financeAccounts} rows={splits} onChange={value=>{setSplits(value);setReview(false);}} totalAmount={net}/>` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L111) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L112) | `<Button aria-label={review?text('Confirm '+action.toLowerCase(),relationship==='Customer'?'ক্রেতার টাকা নেওয়া নিশ্চিত করুন':'সরবরাহকারীকে টাকা দেওয়া নিশ্চিত করুন'):undefined} onClick={submit}>{review?<><Check className="size-4"/> {text('Confirm '+action.toLowerCase(),relationship==='Customer'?'ক্রেতার টাকা নেওয়া নিশ্চিত করুন':'টাকা দেওয়া নিশ্চিত করুন')}</>:<><HandCoins className="size-4"/> {text('Review payment','পেমেন্ট যাচাই করুন')}</>}</Button>` |
## src/components/parties/PartySourceQuickPreview.tsx

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartySourceQuickPreview.tsx#L20) | `export function PartySourceQuickPreview({ row, source, onClose, onOpenSource }: Props) {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartySourceQuickPreview.tsx#L38) | `return <Dialog open={Boolean(row)} onOpenChange={open=>{if(!open)onClose();}}>` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartySourceQuickPreview.tsx#L102) | `<Button variant="outline" onClick={onClose}>{text('Close','বন্ধ করুন')}</Button>` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartySourceQuickPreview.tsx#L103) | `{verifiedLink && onOpenSource && <Button onClick={openFull}><FileText className="size-4"/>` |
## src/components/parties/PartyStatementDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyStatementDialog.tsx#L19) | `export function PartyStatementDialog({open,onClose,party,statement}:Props){` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyStatementDialog.tsx#L37) | `return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>` |
| [107](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyStatementDialog.tsx#L107) | `<Button variant="outline" onClick={onClose}>{text('Close','বন্ধ করুন')}</Button>` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyStatementDialog.tsx#L108) | `<Button variant="outline" onClick={download}><Download className="size-4"/> {text('Export CSV','CSV ডাউনলোড')}</Button>` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyStatementDialog.tsx#L109) | `<Button onClick={()=>window.print()}><Printer className="size-4"/> {text('Print','প্রিন্ট')}</Button>` |
## src/components/parties/PartyTransactionDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L26) | `export function PartyTransactionDialog({row,source,mode,onClose,onEdit,onReverse}:Props){` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L28) | `const [date,setDate]=useState('');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L29) | `const [amount,setAmount]=useState('');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L30) | `const [discount,setDiscount]=useState('');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L31) | `const [reason,setReason]=useState('');` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L32) | `const [splits,setSplits]=useState<FinancePaymentDraft[]>([]);` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L33) | `const [review,setReview]=useState(false);` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L69) | `return <Dialog open={!!row} onOpenChange={open=>!open&&onClose()}>` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L85) | `onChange={value=>{setDate(value);setReview(false);}}/>` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L89) | `onChange={e=>{setAmount(e.target.value);if(splits.length===1)` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L94) | `onChange={e=>{setDiscount(e.target.value);setReview(false);}}/>` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L99) | `onChange={value=>{setSplits(value);setReview(false);}}/>` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L103) | `onChange={e=>{setReason(e.target.value);setReview(false);}}/>` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L113) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L114) | `<Button onClick={changed}>{review` |
## src/components/parties/RoleBadge.tsx

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/RoleBadge.tsx#L16) | `export function RoleBadge({ role }: {role: PartyRole;}) {` |
## src/components/parties/VendorActionDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L30) | `export function VendorActionDialog({source,mode='details',onClose,inline=false}:Props){` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L32) | `const [price,setPrice]=useState('');` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L33) | `const [qty,setQty]=useState('');` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L34) | `const [splits,setSplits]=useState<SplitDraft[]>([{id:'primary',accountId:defaultAccount,amount:''}]);` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L35) | `const [error,setError]=useState('');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L36) | `const [date,setDate]=useState(businessToday());` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L37) | `const [note,setNote]=useState('');` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L52) | `const submit=()=>{` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L112) | `inputMode="decimal" onChange={e=>setPrice(e.target.value)}/>` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L119) | `onClick={()=>setSplits([{id:'primary',accountId:splits[0]?.accountId??defaultAccount,amount:String(duePaisa/100)}])}>` |
| [127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L127) | `onChange={accountId=>setSplits(prev=>prev.map(row=>row.id===split.id?{...row,accountId}:row))}/>` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L130) | `onChange={e=>setSplits(prev=>prev.map(row=>row.id===split.id?{...row,amount:e.target.value}:row))}/>` |
| [132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L132) | `onClick={()=>setSplits(prev=>prev.filter(row=>row.id!==split.id))}><Trash2 className="size-4"/></Button>:` |
| [135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L135) | `<Button type="button" size="sm" variant="outline" onClick={()=>setSplits(prev=>[` |
| [142](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L142) | `<AppDatePicker label="Vendor settlement date" value={date} onChange={setDate}/>` |
| [146](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L146) | `<Input aria-label="Vendor settlement note" value={note} onChange={e=>setNote(e.target.value)}` |
| [159](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L159) | `<Input aria-label="Return matching quantity" value={qty} inputMode="decimal" onChange={e=>setQty(e.target.value)}/>` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L167) | `{!inline&&<Button size="sm" variant="outline" onClick={onClose}>Close</Button>}` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L168) | `{!isReadOnly&&<Button size="sm" onClick={submit}>` |
| [176](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L176) | `<Dialog open={!!source} onOpenChange={v=>!v&&onClose()}>` |
## src/components/parties/VendorCorrectionDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L35) | `export function VendorCorrectionDialog({` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L40) | `const [mode,setMode]=useState<Mode>('correct');` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L41) | `const [reason,setReason]=useState('');` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L42) | `const [productId,setProductId]=useState('');` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L43) | `const [quantity,setQuantity]=useState('');` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L44) | `const [cost,setCost]=useState('');` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L45) | `const [error,setError]=useState('');` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L80) | `const submit=()=>{` |
| [107](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L107) | `return <Dialog open={show} onOpenChange={v=>!v&&onClose()}>` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L119) | `{selected&&activeSource&&<Button type="button" size="sm" variant="ghost" onClick={onBackToSource}>` |
| [152](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L152) | `<Button type="button" size="sm" variant="outline" onClick={()=>onReviewEvent(e)}>Review reversal</Button>` |
| [158](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L158) | `onClick={()=>setMode('correct')}>Correct source</Button>` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L160) | `onClick={()=>setMode('reverse')}>Reverse source</Button>` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L167) | `onChange={setProductId} disabled={Boolean(activeSource.sourceInvoiceId)}/>` |
| [174](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L174) | `value={quantity} onChange={e=>setQuantity(e.target.value)}/>` |
| [178](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L178) | `value={cost} onChange={e=>setCost(e.target.value)}/>` |
| [183](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L183) | `<Input className="mt-1" aria-label="Vendor correction reason" value={reason} onChange={e=>setReason(e.target.value)}` |
| [188](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L188) | `<Button type="button" size="sm" variant="outline" onClick={onClose}>Close</Button>` |
| [189](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L189) | `{!blocked&&show&&<Button type="button" size="sm" onClick={submit} disabled={Boolean(dateError)}>` |
## src/components/parties/VendorQuickSettlementDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorQuickSettlementDialog.tsx#L1) | `import {useState,useSyncExternalStore} from 'react';` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorQuickSettlementDialog.tsx#L26) | `export function VendorQuickSettlementDialog({open,partyId,partyName,mode,onClose}:Props){` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorQuickSettlementDialog.tsx#L28) | `const state=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorQuickSettlementDialog.tsx#L29) | `const [selectedId,setSelectedId]=useState('');` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorQuickSettlementDialog.tsx#L44) | `return <Dialog open={open} onOpenChange={next=>{if(!next)onClose();}}>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorQuickSettlementDialog.tsx#L72) | `onChange={setSelectedId}/>` |
## src/components/parties/VendorStatementDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorStatementDialog.tsx#L12) | `export function VendorStatementDialog({open,onClose,party,state,range}:Props){` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorStatementDialog.tsx#L14) | `const [side,setSide]=useState<VendorSide>('payable');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorStatementDialog.tsx#L23) | `return <Dialog open={open} onOpenChange={next=>!next&&onClose()}>` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorStatementDialog.tsx#L33) | `role="tab" aria-selected={side===value} onClick={()=>setSide(value)}>` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorStatementDialog.tsx#L73) | `<Button size="sm" variant="outline" onClick={onClose}>{text("Close","বন্ধ করুন")}</Button>` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorStatementDialog.tsx#L74) | `<Button size="sm" variant="outline" onClick={download}><Download className="size-4"/> {text("Export CSV","CSV নামান")}</Button>` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorStatementDialog.tsx#L75) | `<Button size="sm" onClick={()=>window.print()}><Printer className="size-4"/> {text("Print","প্রিন্ট করুন")}</Button>` |
## src/components/parties/partyRoleActions.ts

| Source line | Existing declaration / binding |
|---|---|
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/partyRoleActions.ts#L33) | `export function partyFinanceActions(role: PartyRole): readonly [FinanceActionSpec, FinanceActionSpec]  /  null {` |
## src/components/parties/usePartyContentTabs.ts

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/usePartyContentTabs.ts#L4) | `export function usePartyContentTabs<T extends string>(selected: T, onSelect: (tab: T) => void, tabs: readonly {id: T}[]) {` |
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/usePartyContentTabs.ts#L8) | `const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: T) => {` |
## src/components/parties/usePartyDialogError.ts

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/usePartyDialogError.ts#L4) | `export function usePartyDialogError(){` |
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/usePartyDialogError.ts#L7) | `const [failure,setFailure]=useState<{message:string;field?:string}>({message:''});` |
## src/components/parties/usePartyDirectoryKeyboard.ts

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/usePartyDirectoryKeyboard.ts#L4) | `export function usePartyDirectoryKeyboard(parties: readonly { id: string }[], selectedId: string) {` |
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/usePartyDirectoryKeyboard.ts#L6) | `const [focusedId, setFocusedId] = useState(selectedId);` |
## src/data/partyFixtureAdapter.ts

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyFixtureAdapter.ts#L11) | `export function normalizePartyFixture(parties: Party[], legacy: LedgerEntry[]): PartyPreviewState {` |
## src/data/partyPreviewStore.ts

| Source line | Existing declaration / binding |
|---|---|
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L38) | `export function getPartyPreviewSnapshot():PartyPreviewState { return state; }` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L39) | `export function subscribePartyPreview(listener:()=>void):()=>void {` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L43) | `export function resetPartyPreviewForTest():void { counter=0; importedSessions.clear(); state=fresh(); listeners.forEach(listener=>listener()); }` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L51) | `export function quickAddPartyPreview(draft:PartyDraft, openings:Omit<PartyOpeningPayload,'partyId'>[] = []) {` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L70) | `function checkedText(value:string,field:string):string {` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L75) | `function addParty(input:PartyDraft, existing:Party[]):Party {` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L95) | `export function commitPartyImportBatch(plan:PartyImportPlan):ImportResult {` |
| [192](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L192) | `export function dispatchPartyPreview(command:PartyPreviewCommand,accounts:readonly FinanceAccount[]=seedFinanceAccounts):PartyPreviewState {` |
| [420](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L420) | `export function removePartyForRecovery(id:string){state={...state,revision:state.revision+1,parties:state.parties.filter(p=>p.id!==id)};listeners.forEach(f=>f());}` |
| [421](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L421) | `export function restorePartyForRecovery(party:Party){if(state.parties.some(p=>p.id===party.id /  / party.phone&&p.phone.replace(/\D/g,'')===party.phone.replace(/\D/g,'')))throw Error('Party identity or phone already exists.');state={...state,revision:state.revision+1,parties:[party,...state.parties]};listeners.forEach(f=>f());}` |
| [422](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L422) | `export function removeNoteForRecovery(id:string){state={...state,revision:state.revision+1,sources:state.sources.filter(s=>s.id!==id)};listeners.forEach(f=>f());}` |
| [423](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L423) | `export function restoreNoteForRecovery(note:PartySourceRecord){if(!state.parties.some(p=>p.id===note.partyId))throw Error('The original party is unavailable.');if(state.sources.some(s=>s.id===note.id))throw Error('Note identity already exists.');state={...state,revision:state.revision+1,sources:[...state.sources,note]};listeners.forEach(f=>f());}` |
## src/pages/Parties.tsx

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L5) | `import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L47) | `export function Parties() {` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L55) | `const restored=returnState?.hisabiqSource==='party-pos-return'?returnState.partyWorkspace:undefined;` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L56) | `const [range,setRange]=useState<IsoRange>(restored?.range??{from:'',to:''});` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L57) | `const [kind,setKind]=useState(restored?.kind??'All types');` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L58) | `const [ledgerQuery,setLedgerQuery]=useState(restored?.ledgerQuery??'');` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L59) | `const [page,setPage]=useState(restored?.page??1);` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L60) | `const [pageSize,setPageSize]=useState(restored?.pageSize??25);` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L61) | `const [statementOpen,setStatementOpen]=useState(false);` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L62) | `const [role,setRole]=useState<PartyRole / 'All'>(restored?.role??'All');` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L69) | `const [query,setQuery]=useState(restored?.query??'');` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L70) | `const [chooserOpen,setChooserOpen]=useState(false);` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L88) | `const [editing,setEditing]=useState<Party / null / undefined>(undefined);` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L89) | `const [importOpen,setImportOpen]=useState(false);` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L90) | `const [legacyImportOpen,setLegacyImportOpen]=useState(false);` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L91) | `const state=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L92) | `const vendorState=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);` |
| [145](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L145) | `const handleLedgerAction=(action:PartyAction,row:PartyLedgerRow)=>{` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L180) | `const saveParty=(draft:PartyDraft,openings:Omit<PartyOpeningPayload,'partyId'>[])=>{` |
| [185](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L185) | `const created=next.parties.find(p=>!previous.has(p.id));` |
| [209](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L209) | `<Button variant="outline" size="sm" className="shrink-0 whitespace-nowrap !bg-white text-ink transition-colors hover:border-teal-300 dark:!bg-card" onClick={()=>setImportOpen(true)}` |
| [215](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L215) | `<Button size="sm" className="shrink-0 whitespace-nowrap" onClick={()=>setEditing(null)}>` |
| [218](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L218) | `{party&&<Button variant="outline" size="sm" className="shrink-0 whitespace-nowrap !bg-white text-ink transition-colors hover:border-teal-300 dark:!bg-card" onClick={requestChangeParty}>` |
| [224](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L224) | `<Button size="sm" variant="outline" onClick={()=>setImportOpen(true)}><Upload className="size-4" />{uiText('Import Excel / CSV','এক্সেল / CSV থেকে আনুন')}</Button>` |
| [225](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L225) | `<Button size="sm" onClick={()=>setEditing(null)}><Plus className="size-4" />{uiText('Add party','নতুন পার্টি যোগ করুন')}</Button>` |
| [228](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L228) | `<div className="hidden min-w-0 lg:block"><PartyDirectory parties={filtered} selectedId={party?.id??''} onSelect={selectParty}` |
| [278](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L278) | `<Button size="sm" variant="outline" className="h-9 whitespace-nowrap" onClick={()=>{setChooserOpen(false);setImportOpen(true);}}>` |
| [281](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L281) | `<Button size="sm" className="h-9" onClick={()=>{setChooserOpen(false);setEditing(null);}}>` |
| [285](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L285) | `<PartyDirectoryResponsive picker parties={filtered} selectedId={party?.id??''} onSelect={chooseParty}` |
| [290](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L290) | `onClose={()=>setEditing(undefined)} onSave={saveParty}/>` |
