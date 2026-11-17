# MOD-015 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/components/audit/AuditDetailsDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L17) | `function Detail({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L24) | `export function AuditDetailsDialog({` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L49) | `<Dialog open={!!source} onOpenChange={(open) => !open && onClose()}>` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L123) | `<Button variant="outline" onClick={() => {` |
| [127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L127) | `<Button variant="outline" onClick={() => onGoToSource(source)}><ExternalLink className="size-4" /> {text('Go to source','মূল লেনদেন খুলুন')}</Button>` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L128) | `{source.status === 'Posted' && availability.correct && <Button variant="outline" onClick={() => onEdit(source)}><Pencil className="size-4" /> {text('Correct','সংশোধন')}</Button>}` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L129) | `{source.status === 'Posted' && availability.delete && <Button variant="outline" onClick={() => onDelete(source)}><Trash2 className="size-4" /> {text('Delete','মুছুন')}</Button>}` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L130) | `<Button onClick={onClose}>{text('Close','বন্ধ করুন')}</Button>` |
## src/components/audit/AuditEditDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L19) | `export function AuditEditDialog({` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L31) | `const [review, setReview] = useState(false);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L32) | `const [date, setDate] = useState('');` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L33) | `const [reference, setReference] = useState('');` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L34) | `const [partyId, setPartyId] = useState('');` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L35) | `const [party, setParty] = useState('');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L36) | `const [amount, setAmount] = useState('');` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L37) | `const [description, setDescription] = useState('');` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L38) | `const [note, setNote] = useState('');` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L39) | `const [quantity, setQuantity] = useState('');` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L40) | `const [expenseAccountId, setExpenseAccountId] = useState('');` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L41) | `const [fromAccount, setFromAccount] = useState('');` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L42) | `const [toAccount, setToAccount] = useState('');` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L43) | `const [payments, setPayments] = useState<Array<{ account: string; amount: string }>>([]);` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L44) | `const [reason, setReason] = useState('');` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L113) | `const save = () => {` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L125) | `<Dialog open={!!source} onOpenChange={(open) => !open && onClose()}>` |
| [142](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L142) | `<Input className="mt-1.5" type="date" value={date} onChange={(event) => setDate(event.target.value)} />` |
| [152](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L152) | `<Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} />` |
| [159](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L159) | `<Input className="pl-7 text-right" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} />` |
| [171](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L171) | `onChange={(event) => {` |
| [182](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L182) | `<Input className="mt-1.5" value={party} onChange={(event) => setParty(event.target.value)} />` |
| [189](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L189) | `<Input className="mt-1.5 text-right" inputMode="decimal" value={quantity} onChange={(event) => setQuantity(event.target.value.replace(/[^\d.]/g, ''))} />` |
| [200](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L200) | `onChange={(event) => {` |
| [212](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L212) | `<FormSelect className="mt-1.5" value={fromAccount} onChange={(event) => setFromAccount(event.target.value)} options={moneyAccountNames} />` |
| [216](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L216) | `<FormSelect className="mt-1.5" value={toAccount} onChange={(event) => setToAccount(event.target.value)} options={moneyAccountNames} />` |
| [223](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L223) | `<Input className="mt-1.5" value={description} onChange={(event) => setDescription(event.target.value)} />` |
| [227](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L227) | `<Input className="mt-1.5" value={note} onChange={(event) => setNote(event.target.value)} placeholder={text("Optional audit note","মন্তব্য (ঐচ্ছিক)")} />` |
| [238](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L238) | `<Button variant="outline" size="sm" onClick={() => setPayments((current) => [...current, { account: moneyAccountNames[0] ?? '', amount: '' }])}><Plus className="size-3.5" /> {text('Add','যোগ করুন')}</Button>` |
| [247](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L247) | `onChange={(event) => setPayments((current) => current.map((item, i) => i === index ? { ...item, account: event.target.value } : item))}` |
| [255](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L255) | `onChange={(event) => setPayments((current) => current.map((item, i) => i === index ? { ...item, amount: event.target.value.replace(/[^\d.]/g, '') } : item))}` |
| [263](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L263) | `onClick={() => setPayments((current) => current.filter((_, i) => i !== index))}` |
| [279](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L279) | `<Input className="mt-1.5" value={reason} onChange={(event) => setReason(event.target.value)} placeholder={text("e.g. Wrong date and payment account entered","যেমন: ভুল তারিখ বা পেমেন্টের হিসাব লেখা হয়েছে")} />` |
| [291](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L291) | `<Button variant="outline" onClick={() => setReview(false)}>{text('Back','ফিরুন')}</Button>` |
| [292](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L292) | `<Button onClick={save}>{text('Save changes','সংশোধন সংরক্ষণ')}</Button>` |
| [296](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L296) | `<Button variant="outline" onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [297](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L297) | `<Button onClick={startReview}>{text('Review changes','সংশোধন যাচাই')}</Button>` |
## src/components/audit/AuditFilters.tsx

| Source line | Existing declaration / binding |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L25) | `export function AuditFilters({` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L39) | `const [showMore, setShowMore] = useState(false);` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L68) | `onClick={() => setShowMore((current) => !current)}` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L82) | `value={value.search} onChange={(event) => patch({ search: event.target.value })}` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L91) | `onChange={(range) => patch(range)} />` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L98) | `<AppSelect label={text('Party','পক্ষ')} className="min-w-0" value={value.party} onChange={(next) => patch({ party: next })} options={[{value:'All parties',label:text('All parties','সব পক্ষ')},...parties]} />` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L99) | `<AppSelect label={text('Account','হিসাব')} className="min-w-0" value={value.account} onChange={(next) => patch({ account: next })} options={[{value:'All accounts',label:text('All accounts','সব হিসাব')},...accounts]} />` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L100) | `<AppSelect label={text('Posted by','যিনি লিখেছেন')} className="min-w-0" value={value.postedBy} onChange={(next) => patch({ postedBy: next })} options={[{value:'All posters',label:text('All posters','সব ব্যবহারকারী')},...postedBy]} />` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L101) | `<AppSelect label={text('Changed by','যিনি বদলেছেন')} className="min-w-0" value={value.changedBy} onChange={(next) => patch({ changedBy: next })} options={[{value:'All changers',label:text('All changers','সব সংশোধনকারী')},...changedByOptions]} />` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L102) | `<AppSelect label={text('Changed','সংশোধিত')} className="min-w-0" value={value.changed} onChange={(next) => patch({ changed: next })} options={['Changed or not','Changed','Unchanged'].map(v=>({value:v,label:text(v,v==='Changed or not'?'সব লেনদেন':v==='Changed'?'বদলানো হয়েছে':'বদলানো হয়নি')}))} />` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L103) | `<AppSelect label={text('Source','লেনদেনের উৎস')} className="min-w-0" value={value.source} onChange={(next) => patch({ source: next })} options={[{value:'All sources',label:text('All sources','সব উৎস')},...sources.map(v=>({value:v,label:text(v,sourceBn[v]??v)}))]} />` |
| [105](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L105) | `<AppSelect label={text('Status','অবস্থা')} className="min-w-0 flex-1" value={value.status} onChange={(next) => patch({ status: next })} options={['All status','Posted','Deleted'].map(v=>({value:v,label:text(v,v==='All status'?'সব অবস্থা':v==='Posted'?'লেখা হয়েছে':'মুছে ফেলা')}))} />` |
| [106](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L106) | `<Button type="button" variant="outline" size="icon" onClick={resetFilters}` |
## src/components/audit/AuditTimeline.tsx

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditTimeline.tsx#L5) | `export function AuditTimeline({ events }: { events: readonly AuditEvent[] }) {` |
## src/components/audit/ImpactPreview.tsx

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/ImpactPreview.tsx#L5) | `export function ImpactPreview({ preview }: { preview: AuditImpact }) {` |
## src/components/daybook/DaybookActions.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookActions.tsx#L10) | `export function DaybookActions({` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookActions.tsx#L39) | `<ActionMenuTrigger label={label} expanded={open} onClick={toggle} className="border border-border bg-card lg:border-transparent" />` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookActions.tsx#L43) | `{canOpen && <ActionMenuItem icon={Eye} onClick={() => { close(); onOpen(transaction); }}>{text('Open','খুলুন')}</ActionMenuItem>}` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookActions.tsx#L44) | `{availability.edit && transaction.status !== 'Deleted' && <ActionMenuItem icon={Pencil} onClick={() => { close(); onEdit(transaction); }}>{text('Edit','সম্পাদনা')}</ActionMenuItem>}` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookActions.tsx#L45) | `{extra.includes('print') && <ActionMenuItem icon={Printer} onClick={() => { close(); onPrint(transaction); }}>{text('Print','প্রিন্ট')}</ActionMenuItem>}` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookActions.tsx#L46) | `{extra.includes('duplicate') && transaction.status !== 'Deleted' && <ActionMenuItem icon={Copy} onClick={() => { close(); onDuplicate(transaction); }}>{text('Duplicate','নকল তৈরি')}</ActionMenuItem>}` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookActions.tsx#L47) | `{extra.includes('go-source') && canOpen && <ActionMenuItem icon={ExternalLink} onClick={() => { close(); onGoToSource(transaction); }}>{text('Go to source','মূল লেনদেনে যান')}</ActionMenuItem>}` |
## src/components/daybook/DaybookFilters.tsx

| Source line | Existing declaration / binding |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L22) | `export function DaybookFilters({` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L33) | `const [mobileFiltersOpen,setMobileFiltersOpen]=useState(false);` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L53) | `onClick={() => setMobileFiltersOpen(open => !open)}` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L67) | `value={value.search} onChange={(event) => set('search', event.target.value)}` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L73) | `onChange={({ from, to }) => onChange({ ...value, from, to })} />` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L80) | `<AppSelect label={text('Transaction type','লেনদেনের ধরন')} className="min-w-0" value={value.type} onChange={(type) => set('type', type)} options={[{value:'All types',label:text('All types','সব ধরন')},...types.map(v=>({value:v,label:text(v,typeBn[v]??v)}))]} />` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L81) | `<AppSelect label={text('Account','হিসাব')} className="min-w-0" value={value.account} onChange={(account) => set('account', account)} options={[{value:'All accounts',label:text('All accounts','সব হিসাব')},...accounts]} />` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L82) | `<AppSelect label={text('Posted by','যিনি লিখেছেন')} className="min-w-0" value={value.user} onChange={(user) => set('user', user)} options={[{value:'All users',label:text('All users','সব ব্যবহারকারী')},...users]} />` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L84) | `<AppSelect label={text('Status','অবস্থা')} className="min-w-0 flex-1" value={value.status} onChange={(status) => set('status', status)} options={['All status', 'Posted', 'Draft', 'Deleted', 'Reversed'].map(v=>({value:v,label:text(v,v==='All status'?'সব অবস্থা':v==='Posted'?'লেখা হয়েছে':v==='Draft'?'খসড়া':v==='Deleted'?'মুছে ফেলা':'উল্টো হিসাব')}))} />` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L88) | `onClick={() => onChange({ search: '', ...datePreset('Today'), type: 'All types', account: 'All accounts', user: 'All users', status: 'All status' })}` |
## src/components/daybook/TransactionDetailsDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L11) | `function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L20) | `export function TransactionDetailsDialog({` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L41) | `<Dialog open={!!transaction} onOpenChange={(open) => !open && onClose()}>` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L89) | `{extras.includes('print') && <Button variant="outline" onClick={() => onPrint(transaction)}><Printer className="size-4" /> Print</Button>}` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L90) | `{extras.includes('duplicate') && transaction.status !== 'Deleted' && <Button variant="outline" onClick={() => onDuplicate(transaction)}><Copy className="size-4" /> Duplicate</Button>}` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L91) | `{availability.open && <Button variant="outline" onClick={() => onGoToSource(transaction)}><ExternalLink className="size-4" /> Go to source</Button>}` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L92) | `{availability.delete && transaction.status !== 'Deleted' && <Button variant="outline" onClick={() => onDelete(transaction)}>Review reversal</Button>}` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L93) | `{availability.edit && transaction.status !== 'Deleted' && <Button variant="outline" onClick={() => onEdit(transaction)}>Edit</Button>}` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L94) | `<Button onClick={onClose}>Close</Button>` |
## src/data/daybook.ts

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/daybook.ts#L14) | `export function toIsoDate(value: string) {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/daybook.ts#L20) | `function createdAt(date: string, time = '09:00:00') {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/daybook.ts#L24) | `function paymentAccounts(payments: Array<{ method: string; account?: string }>  /  undefined, fallback?: string) {` |
## src/pages/AuditLedger.tsx

| Source line | Existing declaration / binding |
|---|---|
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L31) | `function accountLabel(source: AuditSourceRecord) {` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L37) | `function sourceLabel(source: AuditSourceRecord) {` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L53) | `function sourceLabelBn(source: AuditSourceRecord) {` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L70) | `function sourceRoute(source: AuditSourceRecord) {` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L78) | `export function AuditLedger() {` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L84) | `const [state, setState] = useState(() => createAuditState(auditSourceRecords));` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L85) | `const [filters, setFilters] = useState<AuditFilterState>({` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L97) | `const [detailId, setDetailId] = useState<string  /  null>(null);` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L98) | `const [editId, setEditId] = useState<string  /  null>(null);` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L99) | `const [deleteId, setDeleteId] = useState<string  /  null>(null);` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L100) | `const [deleteReason, setDeleteReason] = useState('');` |
| [151](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L151) | `const deleteSource = deleteId ? state.sources.find((item) => item.id === deleteId) ?? null : null;` |
| [156](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L156) | `const deletedCount = state.sources.filter((item) => item.status === 'Deleted').length;` |
| [158](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L158) | `const deleteValidation = deleteSource ? validateDelete({` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L164) | `const deleteImpacts = deleteSource ? auditDeleteImpact(deleteSource) : [];` |
| [181](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L181) | `const confirmDelete = () => {` |
| [216](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L216) | `<button onClick={() => setEntryDateView('transaction')} className={ʼrounded-md px-2.5 py-1.5 text-xs font-medium ${entryDateView === 'transaction' ? 'bg-inverse text-white' : 'text-ink-500 hover:bg-ink-50'}ʼ}>{text('Transaction Date','লেনদেনের তারিখ')}</button>` |
| [217](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L217) | `<button onClick={() => setEntryDateView('created')} className={ʼrounded-md px-2.5 py-1.5 text-xs font-medium ${entryDateView === 'created' ? 'bg-inverse text-white' : 'text-ink-500 hover:bg-ink-50'}ʼ}>{text('Created Date','লেখার তারিখ')}</button>` |
| [219](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L219) | `<Button variant="outline" size="sm" onClick={exportAudit}><ArrowDownToLine className="size-4" /> {text('Export','ডাউনলোড')}</Button>` |
| [220](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L220) | `<Button variant="outline" size="sm" onClick={printAudit}><Printer className="size-4" /> {text('Print','প্রিন্ট')}</Button>` |
| [241](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L241) | `<AuditFilters value={filters} onChange={setFilters} records={state.sources} changedByOptions={changedByOptions} dateView={entryDateView} />` |
| [301](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L301) | `<Button type="button" variant="ghost" size="icon" onClick={toggle} className="size-9 text-ink-500 hover:bg-ink-50 hover:text-ink" aria-label={'Actions for ' + source.reference}>` |
| [307](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L307) | `{availability.view && <ActionMenuItem icon={Eye} onClick={() => { close(); setDetailId(source.id); }}>{text('Open','খুলুন')}</ActionMenuItem>}` |
| [308](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L308) | `{source.status === 'Posted' && availability.correct && <ActionMenuItem icon={Pencil} onClick={() => { close(); requestEdit(source); }}>{text('Correct','সংশোধন')}</ActionMenuItem>}` |
| [311](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L311) | `<ActionMenuItem icon={Trash2} tone="destructive" onClick={() => { close(); requestDelete(source); }}>{text('Delete','মুছুন')}</ActionMenuItem>` |
| [340](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L340) | `onDelete={requestDelete}` |
| [354](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L354) | `<Dialog open={!!deleteSource} onOpenChange={(open) => !open && setDeleteId(null)}>` |
| [387](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L387) | `<Input className="mt-1.5" value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} placeholder={text("e.g. Duplicate transaction","যেমন: একই লেনদেন দুইবার হয়েছে")} />` |
| [390](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L390) | `<Button variant="outline" onClick={() => setDeleteId(null)}>{text('Cancel','বাতিল')}</Button>` |
| [391](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L391) | `<Button disabled={!deleteSource  /  /  (deleteSource.source === 'sale' && (deleteSource.returnedQuantity ?? 0) > 0)} onClick={confirmDelete}>{text('Delete complete transaction','পুরো লেনদেন মুছুন')}</Button>` |
## src/pages/Daybook.tsx

| Source line | Existing declaration / binding |
|---|---|
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L26) | `function statusTone(status: UnifiedTransaction['status']) {` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L43) | `function filtersFromParams(params: URLSearchParams): DaybookFilterState {` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L55) | `function paramsFromFilters(current: URLSearchParams, filters: DaybookFilterState) {` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L77) | `export function Daybook() {` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L83) | `const [transactions] = useState<UnifiedTransaction[]>(daybookTransactions);` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L84) | `const [detail, setDetail] = useState<UnifiedTransaction  /  null>(null);` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L85) | `const [deleteTarget, setDeleteTarget] = useState<UnifiedTransaction  /  null>(null);` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L86) | `const [filters, setFilters] = useState<DaybookFilterState>(() => filtersFromParams(searchParams));` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L87) | `const updateFilters = (next: DaybookFilterState) => {` |
| [136](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L136) | `onChange={setEntryDateView}` |
| [142](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L142) | `<Button variant="outline" size="sm" onClick={exportDaybook}><ArrowDownToLine className="size-4" /> {text('Export','ডাউনলোড')}</Button>` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L143) | `<Button variant="outline" size="sm" onClick={() => print(filtered)}><Printer className="size-4" /> {text('Print','প্রিন্ট')}</Button>` |
| [176](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L176) | `<DaybookFilters value={filters} onChange={updateFilters} transactions={transactions} dateView={entryDateView} />` |
| [225](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L225) | `onDelete={setDeleteTarget}` |
| [255](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L255) | `onDelete={(item) => { setDetail(null); setDeleteTarget(item); }}` |
| [261](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L261) | `<Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>` |
| [272](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L272) | `<Button variant="outline" onClick={() => setDeleteTarget(null)}>{text('Cancel','বাতিল')}</Button>` |
