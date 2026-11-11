# MOD-000 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/App.tsx

| Source line | Existing declaration / binding |
|---|---|
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L65) | `export function App() {` |
## src/components/layout/ActionMenu.tsx

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ActionMenu.tsx#L5) | `export function ActionMenuList({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {` |
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ActionMenu.tsx#L6) | `const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ActionMenu.tsx#L18) | `return <div {...props} role={props.role ?? 'group'} data-action-menu="" className={'p-1 ' + className} onKeyDown={onKeyDown}>{children}</div>;` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ActionMenu.tsx#L21) | `export function ActionMenuDivider() {` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ActionMenu.tsx#L31) | `export function ActionMenuItem({ icon: Icon, tone = 'neutral', className = '', children, ...props }: ActionMenuItemProps) {` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ActionMenu.tsx#L51) | `export function ActionMenuTrigger({ label, expanded, className = '', ...props }: ActionMenuTriggerProps) {` |
## src/components/layout/AnimatedAdvancedFilters.tsx

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AnimatedAdvancedFilters.tsx#L6) | `export function AnimatedAdvancedFilters({` |
## src/components/layout/AnimatedSegmentedSwitch.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AnimatedSegmentedSwitch.tsx#L10) | `export function AnimatedSegmentedSwitch<T extends string>({` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AnimatedSegmentedSwitch.tsx#L20) | `const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AnimatedSegmentedSwitch.tsx#L32) | `<div role="radiogroup" aria-label={label} onKeyDown={onKeyDown}` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AnimatedSegmentedSwitch.tsx#L40) | `onClick={() => onChange(option.value)}` |
## src/components/layout/AppShell.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AppShell.tsx#L18) | `function Workspace() {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AppShell.tsx#L38) | `<a href="#erp-main" onClick={event=>{event.preventDefault();document.getElementById('erp-main')?.focus();}} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:rounded-md focus:bg-card focus:p-3 focus:text-ink">{text('Skip to workspace','কাজের জায়গায় যান')}</a>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AppShell.tsx#L72) | `export function AppShell() {` |
## src/components/layout/Calculator.tsx

| Source line | Existing declaration / binding |
|---|---|
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L32) | `function loadLines(): string[] {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L38) | `export function Calculator() {` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L41) | `const [lines, setLines] = useState<string[]>(loadLines);` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L43) | `const [activeIndex, setActiveIndex] = useState(lines.length - 1);` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L117) | `const removeLine = (idx: number) => {` |
| [220](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L220) | `onKeyDown={onKeyboard}` |
| [231](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L231) | `<button type="button" onClick={copyTotal}` |
| [265](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L265) | `onChange={event => editLine(idx, event.target.value)}` |
| [278](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L278) | `onClick={() => removeLine(idx)}` |
| [291](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L291) | `onClick={() => replaceSelection('(')} aria-label={text('Open parenthesis', 'বাম বন্ধনী')}` |
| [295](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L295) | `onClick={() => replaceSelection(')')} aria-label={text('Close parenthesis', 'ডান বন্ধনী')}` |
| [306](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L306) | `onClick={() => press(key)}` |
## src/components/layout/CashSessionDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L1) | `import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L15) | `export function CashSessionDialog() {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L18) | `const [counts, setCounts] = useState<Record<number, string>>({});` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L19) | `const [countMode,setCountMode]=useState<'total' / 'notes'>('total');` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L20) | `const [total,setTotal]=useState('');` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L21) | `const [note, setNote] = useState('');` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L22) | `const [float, setFloat] = useState('');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L23) | `const [counterpart,setCounterpart]=useState('');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L24) | `const [failure,setFailure]=useState('');` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L25) | `const [reviewedRevision,setReviewedRevision]=useState(revision);` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L26) | `const [operationId,setOperationId]=useState(()=>crypto.randomUUID());` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L27) | `const {accounts}=useSyncExternalStore(subscribeFinancePreview,getFinancePreviewSnapshot);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L32) | `const submit=(action:()=>void)=>{try{action();setOpen(false);return true;}catch(error){setFailure(error instanceof Error?error.message:String(error));setReviewedRevision(revision);setOperationId(crypto.randomUUID());return false;}};` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L55) | `if(!canView)return <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{text('Cash session unavailable','ক্যাশ সেশন ব্যবহার করা যাবে না')}</DialogTitle><DialogDescription>{text('Enable cash sessions and request cash view permission.','ক্যাশ সেশন চালু করুন এবং দেখার অনুমতি নিন।')}</DialogDescription></DialogHeader><Button onClick={()=>setOpen(false)}>{text('Close','বন্ধ করুন')}</Button></DialogContent></Dialog>;` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L57) | `return <Dialog open={open} onOpenChange={setOpen}>` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L65) | `<Input aria-label={text('Opening cash','শুরুর টাকা')} autoFocus inputMode="decimal" value={float} onChange={e=>setFloat(e.target.value)} className="mt-1.5 text-right" aria-invalid={float!==''&&openingMinor===null} aria-describedby="cash-opening-help" />` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L71) | `<AppSelect label={difference>0?text('Where did this cash come from?','এই টাকা কোথা থেকে এসেছে?'):text('Where did this cash go?','এই টাকা কোথায় গেছে?')} value={counterpart} onChange={setCounterpart} placeholder={text('Choose source or destination','উৎস বা গন্তব্য বাছাই করুন')} options={choices.map(a=>({value:a.id,label:a.id==='OWNER_CURRENT_ACCOUNT'?(difference>0?text('Owner put in','মালিক দিয়েছেন'):text('Owner took out','মালিক নিয়েছেন')):(difference>0?text('From ','থেকে '):text('To ','প্রতি '))+a.name}))}/>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L72) | `<label className="block text-sm font-medium">{text('Note (optional)','মন্তব্য (ঐচ্ছিক)')}<Input className="mt-1.5" value={note} maxLength={500} onChange={e=>setNote(e.target.value)}/></label>` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L75) | `<DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>{text('Cancel','বাতিল')}</Button>` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L76) | `<Button disabled={!canStart /  / startBlocked /  / openingMinor===null /  / (difference!==0&&!counterpart)} onClick={()=>{if(submit(()=>startSession(float,counterpart,note,reviewedRevision,operationId)))toast.success(text('Cash session started in preview','নমুনায় ক্যাশ সেশন শুরু হয়েছে'));}}><Unlock className="size-4"/>{text('Start session','সেশন শুরু করুন')}</Button></DialogFooter>` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L81) | `<Dialog open={open} onOpenChange={setOpen}>` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L95) | `<Button variant={countMode==='total'?'default':'outline'} aria-pressed={countMode==='total'} onClick={()=>setCountMode('total')}>{text('Enter total','মোট টাকা লিখুন')}{showHelper && <span className="font-bn"> · মোট টাকা</span>}</Button>` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L96) | `<Button variant={countMode==='notes'?'default':'outline'} aria-pressed={countMode==='notes'} onClick={()=>setCountMode('notes')}>{text('Count notes','নোট গুনুন')}{showHelper && <span className="font-bn"> · নোট গুনুন</span>}</Button>` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L101) | `<Input aria-label={text("Cash counted","হাতে গোনা টাকা")} className="mt-2 h-9 text-right text-lg" inputMode="decimal" value={total} onChange={event=>setTotal(event.target.value)} placeholder="৳0.00"/>` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L114) | `onChange={(e) => setCounts({ ...counts, [d]: e.target.value.replace(/\D/g, '') })}` |
| [154](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L154) | `<Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1.5" placeholder={text("e.g. ৳50 given as change from personal cash","যেমন: নিজের টাকা থেকে ৳৫০ খুচরা দিয়েছি")} />` |
| [161](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L161) | `onClick={() => {` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L168) | `<Button disabled={!canClose /  / !hasCount /  / (diff!==0&&!note.trim())} onClick={close}>` |
## src/components/layout/ErpNavMenu.tsx

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ErpNavMenu.tsx#L19) | `export function ErpNavMenu({ mode, onNavigate, collapsed = false }: Props) {` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ErpNavMenu.tsx#L54) | `onClick={onNavigate}` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ErpNavMenu.tsx#L103) | `onClick={onNavigate}` |
## src/components/layout/FloatingPanel.tsx

| Source line | Existing declaration / binding |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/FloatingPanel.tsx#L27) | `export function FloatingPanel({ trigger, children, align = 'right', width = 320, label, className = 'inline-block', panelClassName = '' }: FloatingPanelProps) {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/FloatingPanel.tsx#L28) | `const [open, setOpen] = useState(false);` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/FloatingPanel.tsx#L31) | `const [position, setPosition] = useState<PanelPosition  /  null>(null);` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/FloatingPanel.tsx#L47) | `const updatePosition = useCallback(() => {` |
## src/components/layout/GlobalSearchBox.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L10) | `export function GlobalSearchBox(){` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L15) | `const [query,setQuery]=useState('');` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L16) | `const [open,setOpen]=useState(false);` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L17) | `const [active,setActive]=useState(0);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L21) | `const records=useMemo(()=>globalSearchRecords(state,actorId,personal.language),[state,actorId,personal.language]);` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L61) | `onChange={event=>{setQuery(event.target.value);setOpen(!!event.target.value.trim());setActive(0);}}` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L63) | `onKeyDown={event=>{` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L77) | `onMouseDown={event=>event.preventDefault()} onClick={clear}` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L90) | `onMouseEnter={()=>setActive(index)} onClick={()=>openResult(item)}` |
## src/components/layout/PageBoundary.tsx

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/PageBoundary.tsx#L19) | `<Button onClick={() => window.location.reload()}>Reload page</Button>` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/PageBoundary.tsx#L28) | `export function PageBoundary({ children }: { children: ReactNode }) {` |
## src/components/layout/RowActionMenu.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/RowActionMenu.tsx#L11) | `export function RowActionMenu({` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/RowActionMenu.tsx#L33) | `onClick={(event) => { event.stopPropagation(); toggle(); }}` |
## src/components/layout/SababTopNavStrip.tsx

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SababTopNavStrip.tsx#L15) | `export function SababTopNavStrip() {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SababTopNavStrip.tsx#L20) | `const [openId, setOpenId] = useState<string  /  null>(null);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SababTopNavStrip.tsx#L21) | `const [pos, setPos] = useState<{ top: number; left: number }  /  null>(null);` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SababTopNavStrip.tsx#L22) | `const [edges, setEdges] = useState({ left: false, right: false });` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SababTopNavStrip.tsx#L160) | `onClick={() => openId === item.id ? close() : show(item.id)}` |
| [178](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SababTopNavStrip.tsx#L178) | `<button type="button" onClick={() => nudge(-1)} aria-label="Scroll modules left" className={edgeButton + ' left-2'}>` |
| [186](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SababTopNavStrip.tsx#L186) | `<button type="button" onClick={() => nudge(1)} aria-label="Scroll modules right" className={edgeButton + ' right-2'}>` |
| [229](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SababTopNavStrip.tsx#L229) | `onClick={close}` |
## src/components/layout/Sidebar.tsx

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Sidebar.tsx#L15) | `function getInitialCollapsed() {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Sidebar.tsx#L20) | `export function Sidebar() {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Sidebar.tsx#L25) | `const [collapsed, setCollapsed] = useState(getInitialCollapsed);` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Sidebar.tsx#L36) | `const onKeyDown = (event: KeyboardEvent) => {` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Sidebar.tsx#L116) | `onClick={() => setCollapsed(value => !value)}` |
## src/components/layout/SidebarTrigger.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SidebarTrigger.tsx#L7) | `export function SidebarTrigger({` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SidebarTrigger.tsx#L24) | `onClick={onToggle}` |
## src/components/layout/ThemePicker.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ThemePicker.tsx#L13) | `export function ThemePicker({ language = 'English' }: { language?: UiLanguage } = {}) {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ThemePicker.tsx#L19) | `<button type="button" onClick={toggle} aria-label={ʼ${text("Appearance","চেহারা")}: ${text(theme, theme === "light" ? "হালকা" : theme === "dark" ? "গাঢ়" : "সিস্টেম")}ʼ} aria-expanded={open}` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ThemePicker.tsx#L32) | `onChange={() => { setTheme(value); close(); }} className="size-4 accent-primary" />` |
## src/components/layout/TopBar.tsx

| Source line | Existing declaration / binding |
|---|---|
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L49) | `export function TopBar() {` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L76) | `const [navOpen,setNavOpen] = useState(false);` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L89) | `const onKeyDown = (event: KeyboardEvent) => {` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L120) | `const onChange = () => { if (media.matches) setNavOpen(false); };` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L130) | `aria-controls="erp-mobile-drawer" onClick={()=>setNavOpen(true)}` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L143) | `<Button size="sm" className="inline-flex shrink-0 items-center gap-1.5" onClick={() => navigate('/app/pos')}` |
| [151](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L151) | `onClick={() => setOpen(true)}` |
| [174](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L174) | `onClick={toggle}` |
| [191](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L191) | `onClick={toggle}` |
| [205](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L205) | `<button onClick={close} className="text-xs font-medium text-teal-700 hover:underline">` |
| [231](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L231) | `onClick={toggle}` |
| [257](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L257) | `<button key={route + label} onClick={() => { close(); navigate(route); }} className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 py-1 text-ink-700 hover:bg-ink-50">` |
| [261](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L261) | `<Link to="/design-system" onClick={close} className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 py-1 text-ink-700 hover:bg-ink-50">` |
| [285](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L285) | `onClick={closeMobileNav} />` |
| [308](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L308) | `<Link to="/app/dashboard" onClick={() => setNavOpen(false)} aria-label="HisabIQ dashboard">` |
| [312](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L312) | `onClick={closeMobileNav}` |
| [318](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L318) | `<Link to="/app/support" onClick={() => setNavOpen(false)}` |
## src/contexts/CashSessionContext.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/CashSessionContext.tsx#L12) | `export function CashSessionProvider({children}:{children:ReactNode}){` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/CashSessionContext.tsx#L14) | `const [open,setOpen]=useState(false);` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/CashSessionContext.tsx#L18) | `const [,render]=useState(0);` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/CashSessionContext.tsx#L36) | `export function useCashSession(){const ctx=useContext(CashSessionContext);if(!ctx)throw new Error('useCashSession must be used inside CashSessionProvider');return ctx;}` |
## src/contexts/ThemeContext.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/ThemeContext.tsx#L8) | `export function ThemeProvider({ children }: { children: React.ReactNode }) {` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/ThemeContext.tsx#L9) | `const [theme, updateTheme] = useState<Theme>(() => {` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/ThemeContext.tsx#L10) | `try { const saved = localStorage.getItem(storageKey); return isTheme(saved) ? saved : 'system'; }` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/ThemeContext.tsx#L13) | `const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/ThemeContext.tsx#L18) | `const onChange = () => setSystemDark(media.matches);` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/ThemeContext.tsx#L42) | `export function useTheme() {` |
## src/contexts/UserPreferencesContext.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/UserPreferencesContext.tsx#L11) | `export function UserPreferencesProvider({ children }: { children: ReactNode }) {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/UserPreferencesContext.tsx#L28) | `export function useUserPreferences() {` |
## src/features/auth/AuthFlowPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L19) | `export function SignupPreviewPage() { return <AuthFlowPage mode="signup" />; }` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L20) | `export function RecoveryPreviewPage() { return <AuthFlowPage mode="recovery" />; }` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L23) | `function AuthFlowPage({ mode }: { mode: Mode }) {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L24) | `const [language, setLanguage] = useState<UiLanguage>(() => {` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L31) | `const [step, setStep] = useState(0);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L32) | `const [fields, setFields] = useState<Fields>(empty);` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L33) | `const [channel, setChannel] = useState<Channel>('gmail');` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L34) | `const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L35) | `const [visible, setVisible] = useState(false);` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L57) | `const submit = (event: FormEvent<HTMLFormElement>) => {` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L123) | `maxLength={key === 'code' ? 6 : undefined} onChange={change(key)}` |
| [131](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L131) | `<button type="button" className="auth-text-link auth-visibility" onClick={() => setVisible(current => !current)}` |
| [139](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L139) | `name="auth-preview-new-password" className="pl-9" value={fields.password} onChange={change('password')}` |
| [148](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L148) | `name="auth-preview-confirm-password" value={fields.confirm} onChange={change('confirm')}` |
| [156](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L156) | `: step < lastStep ? <button type="button" className="auth-flow-back" onClick={goBack}><ArrowLeft size={15} aria-hidden="true" />{t('Back', 'পেছনে')}</button>` |
| [170](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L170) | `</section> : <form className="auth-form auth-flow-form" noValidate onSubmit={submit}>` |
| [179](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L179) | `className="pl-9" placeholder="01XXXXXXXXX" value={fields.phone} onChange={change('phone')}` |
| [192](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L192) | `onChange={() => { setChannel('gmail'); setFields(current => ({ ...current, code: '' })); setErrors({}); }} />` |
| [198](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L198) | `onChange={() => { setChannel('sms'); setFields(current => ({ ...current, code: '' })); setErrors({}); }} />` |
## src/features/auth/AuthLayout.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthLayout.tsx#L11) | `export function AuthLayout({ language, onLanguageChange, children }: Props) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthLayout.tsx#L16) | `onChange={value => {` |
## src/features/auth/LoginPreviewPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L20) | `export function LoginPreviewPage({ view }: { view: View }) {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L27) | `function LoginPreviewScreen({ view, account }: { view: View; account: typeof sampleAccounts[number] }) {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L28) | `const [language, setLanguage] = useState<UiLanguage>(() => {` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L30) | `const saved = localStorage.getItem(languageKey);` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L35) | `const [phone, setPhone] = useState('');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L36) | `const [password, setPassword] = useState('');` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L37) | `const [pin, setPin] = useState('');` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L38) | `const [pinCursor, setPinCursor] = useState(0);` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L39) | `const [visible, setVisible] = useState(false);` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L40) | `const [errors, setErrors] = useState<{ phone?: string; password?: string; pin?: string }>({});` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L41) | `const [notice, setNotice] = useState(false);` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L42) | `const [info, setInfo] = useState<Info  /  null>(null);` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L55) | `const submit = (event: FormEvent) => {` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L99) | `</> : <form noValidate onSubmit={submit} className="auth-form">` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L112) | `onSelect={event => setPinCursor(Math.min(event.currentTarget.selectionStart ?? 0, 5))}` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L113) | `onChange={event => { setPin(digits(event.target.value).replace(/\D/g, '').slice(0, 6)); resetFeedback(); }} />` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L125) | `onChange={event => { setPhone(event.target.value); resetFeedback(); }} className="pl-9" />` |
| [136](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L136) | `onChange={event => { setPassword(event.target.value); resetFeedback(); }} className="pl-9 pr-12" />` |
| [139](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L139) | `aria-pressed={visible} onMouseDown={event => event.preventDefault()} onClick={() => setVisible(value => !value)}>` |
| [151](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L151) | `<Button type="button" variant="outline" className="auth-google w-full" onClick={() => openInfo('google')}>` |
| [158](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L158) | `<Dialog open={info !== null} onOpenChange={open => { if (!open) setInfo(null); }}>` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L164) | `<Button type="button" className="mt-4 w-full" onClick={() => setInfo(null)}>{text('Back to sign in', 'সাইন ইনে ফিরুন')}</Button>` |
