# Shared, legacy and unassigned source-action census

These files are not omitted from discovery. Their active consumer/ownership needs resolution before affected tasks; no implicit write permission. Reports/analytics remain excluded, including their local widgets; shared primitives stay foundation-owned.

## src/components/AmountInWordsDisplay.tsx

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AmountInWordsDisplay.tsx#L9) | `export function AmountInWordsDisplay({` |
## src/components/AppDateRangePicker.tsx

| Line | Existing declaration / event |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L23) | `function Month({` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L49) | `onClick={() => choose(day)}` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L50) | `onKeyDown={(event) => {` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L69) | `export function AppDateRangePicker({ value, onChange, label = 'Date range', className = '', single = false }: Props) {` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L72) | `const [open, setOpen] = useState(false);` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L74) | `const [draft, setDraft] = useState<IsoRange>(value);` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L75) | `const [first, setFirst] = useState(isoDay(utcDate(value.from  /  /  businessToday()).getUTCFullYear(), utcDate(value.from  /  /  businessToday()).getUTCMonth(), 1));` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L76) | `const [position, setPosition] = useState<{ top: number; left: number; width: number; maxHeight: number }  /  null>(null);` |
| [137](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L137) | `aria-controls={open ? id : undefined} onClick={() => open ? close() : show()}` |
| [156](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L156) | `<button type="button" aria-label={t('Previous month','আগের মাস')} onClick={() => setFirst(addMonths(first, -1))}` |
| [158](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L158) | `<button type="button" aria-label={t('Next month','পরের মাস')} onClick={() => setFirst(addMonths(first, 1))}` |
| [169](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L169) | `{presets.map((preset) => <button key={preset} type="button" onClick={() => {` |
| [177](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L177) | `<button type="button" onClick={() => commit(empty)}` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L180) | `<button type="button" onClick={close} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-ink-50">{t('Cancel','বাতিল')}</button>` |
| [181](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L181) | `<button type="button" onClick={() => commit(draft)} disabled={!draft.from  /  /  !draft.to}` |
| [189](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L189) | `export function AppDatePicker({ value, onChange, label = 'Date', className = '' }: {` |
| [193](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppDateRangePicker.tsx#L193) | `value={{ from: value, to: value }} onChange={(range) => onChange(range.from)} />;` |
## src/components/AppMonthYearPicker.tsx

| Line | Existing declaration / event |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L23) | `export function AppMonthYearPicker({mode,value,maxDate,label,onChange,className=''}:Props){` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L27) | `const [open,setOpen]=useState(false);` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L29) | `const [visibleYear,setVisibleYear]=useState(initialYear);` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L30) | `const [position,setPosition]=useState<{top:number;left:number;width:number;maxHeight:number} / null>(null);` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L93) | `onClick={()=>open?close():show()}` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L111) | `onClick={previous} disabled={!canGoPrev} className="rounded-md p-1.5 text-ink-500 hover:bg-ink-50 disabled:opacity-40">` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L118) | `onClick={next} disabled={!canGoNext} className="rounded-md p-1.5 text-ink-500 hover:bg-ink-50 disabled:opacity-40">` |
| [137](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L137) | `onKeyDown={event=>moveFocus(event,index)}` |
| [138](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L138) | `onClick={()=>choose(optionValue)}` |
| [146](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppMonthYearPicker.tsx#L146) | `<button type="button" className="rounded-md border border-border px-3 py-1.5 text-xs text-ink hover:bg-ink-50" onClick={close}>{t('Close','বন্ধ করুন')}</button>` |
## src/components/AppSelect.tsx

| Line | Existing declaration / event |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppSelect.tsx#L27) | `export function AppSelect({` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppSelect.tsx#L30) | `const [open, setOpen] = useState(false);` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppSelect.tsx#L33) | `const [active, setActiveState] = useState(0);` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppSelect.tsx#L40) | `const [rect, setRect] = useState<{ left: number; top: number; width: number; maxHeight: number }  /  null>(null);` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppSelect.tsx#L123) | `onKeyDown={onKeyboard}` |
| [124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppSelect.tsx#L124) | `onClick={(event) => {` |
| [157](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/AppSelect.tsx#L157) | `onClick={() => choose(option)}` |
## src/components/Button.tsx

| Line | Existing declaration / event |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Button.tsx#L13) | `export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className = '', size, variant, ...props }, ref) {` |
## src/components/ColumnVisibilityEditor.tsx

| Line | Existing declaration / event |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/ColumnVisibilityEditor.tsx#L5) | `export function ColumnVisibilityEditor({ label, columns, value, required = [], onChange }: {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/ColumnVisibilityEditor.tsx#L16) | `onChange={(event) => onChange(event.target.checked ? [...value, column.id] : value.filter((item) => item !== column.id))}` |
## src/components/Dialog.tsx

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Dialog.tsx#L18) | `export function Dialog({open,defaultOpen=false,onOpenChange,children}:{open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void;children:ReactNode}){` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Dialog.tsx#L19) | `const [local,setLocal]=useState(defaultOpen);` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Dialog.tsx#L27) | `return <ModalContext.Provider value={{open:active,close:()=>change(false),id,opener:opener.current}}><DesignDialog open={active} onOpenChange={change}>{children}</DesignDialog></ModalContext.Provider>;` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Dialog.tsx#L30) | `export const DialogContent=forwardRef<HTMLDivElement,HTMLAttributes<HTMLDivElement>&{showCloseButton?:boolean;closeLabel?:string}>(function DialogContent({children,closeLabel,showCloseButton=true,...props},forwarded){` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Dialog.tsx#L98) | `tabIndex={-1}>{children}{closeLabel && showCloseButton && <Button type="button" variant="ghost" className="absolute right-2 top-2 size-9 p-0" aria-label={closeLabel} onClick={()=>modal?.close()}><X className="size-4" aria-hidden="true"/></Button>}</DesignContent>,document.body);` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Dialog.tsx#L100) | `export const DialogTitle=forwardRef<HTMLHeadingElement,HTMLAttributes<HTMLHeadingElement>>(function DialogTitle(props,ref){const modal=useContext(ModalContext);return <DesignTitle {...props} id={props.id??modal?.id+'-title'} ref={ref}/>;});` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Dialog.tsx#L101) | `export const DialogDescription=forwardRef<HTMLParagraphElement,HTMLAttributes<HTMLParagraphElement>>(function DialogDescription(props,ref){const modal=useContext(ModalContext);return <DesignDescription {...props} id={props.id??modal?.id+'-description'} ref={ref}/>;});` |
## src/components/FeedbackState.tsx

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/FeedbackState.tsx#L8) | `export function FeedbackState({ kind, title, description, action }: {` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/FeedbackState.tsx#L17) | `{action && kind !== 'loading' && <Button variant="outline" className="mt-4" onClick={action.onClick}>{action.label}</Button>}` |
## src/components/FormSelect.tsx

| Line | Existing declaration / event |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/FormSelect.tsx#L12) | `export function FormSelect({` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/FormSelect.tsx#L26) | `const [local, setLocal] = useState<string>(() => String(defaultValue ?? firstValue));` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/FormSelect.tsx#L31) | `const update = (next: string) => {` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/FormSelect.tsx#L39) | `<AppSelect label={label} value={selected} options={options} onChange={update}` |
## src/components/Input.tsx

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Input.tsx#L15) | `export const Input=forwardRef<HTMLInputElement,InputProps>(function Input({` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Input.tsx#L57) | `title="Clear" onMouseDown={event=>event.preventDefault()} onClick={clear}` |
## src/components/MoneyUnitInput.tsx

| Line | Existing declaration / event |
|---|---|
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/MoneyUnitInput.tsx#L30) | `export function MoneyUnitInput({` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/MoneyUnitInput.tsx#L48) | `onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ''))}` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/MoneyUnitInput.tsx#L55) | `value={unit ?? ''} options={units.map((value) => ({ value, label: unitSymbol(value) }))} onChange={onUnitChange} disabled={disabled} /> : (` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/MoneyUnitInput.tsx#L56) | `<AppSelect label={label + ' unit'} value={unit ?? ''} options={units.map(value=>({value,label:unitSymbol(value)}))} onChange={onUnitChange}` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/MoneyUnitInput.tsx#L67) | `export function QuantityUnitInput(props: Omit<MoneyUnitInputProps, 'prefix'>) {` |
## src/components/NumericInput.tsx

| Line | Existing declaration / event |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/NumericInput.tsx#L10) | `export const NumericInput=forwardRef<HTMLInputElement,NumericProps>(function NumericInput({className='',onKeyDown,disabled,readOnly,min=0,max,type='text',stepperInset=0,stepperCompact=false,style,...props},forwardedRef){` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/NumericInput.tsx#L14) | `const [inferredLabel,setInferredLabel]=useState('value');` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/NumericInput.tsx#L15) | `const [clearedZero,setClearedZero]=useState(false);` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/NumericInput.tsx#L16) | `const [showStepper,setShowStepper]=useState(false);` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/NumericInput.tsx#L52) | `onChange={event=>{setClearedZero(event.currentTarget.value==='');props.onChange?.(event);}}` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/NumericInput.tsx#L54) | `onKeyDown={event=>{onKeyDown?.(event);if(event.defaultPrevented /  / event.altKey /  / event.ctrlKey /  / event.metaKey /  / event.nativeEvent.isComposing /  / !editable)return;if(event.key==='ArrowUp' /  / event.key==='ArrowDown'){event.preventDefault();event.stopPropagation();step(event.key==='ArrowUp'?1:-1);}}}/>` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/NumericInput.tsx#L60) | `<button type="button" tabIndex={-1} aria-label={'Increase '+label} title="Increase by 1" onPointerDown={event=>{event.preventDefault();input.current?.focus();}} onClick={()=>step(1)} className="flex min-h-0 flex-1 items-center justify-center rounded-sm text-ink-500 hover:bg-ink-50 hover:text-ink"><ChevronUp className="size-3"/></button>` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/NumericInput.tsx#L61) | `<button type="button" tabIndex={-1} aria-label={'Decrease '+label} title="Decrease by 1" onPointerDown={event=>{event.preventDefault();input.current?.focus();}} onClick={()=>step(-1)} className="flex min-h-0 flex-1 items-center justify-center rounded-sm text-ink-500 hover:bg-ink-50 hover:text-ink"><ChevronDown className="size-3"/></button>` |
## src/components/PageHeader.tsx

| Line | Existing declaration / event |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/PageHeader.tsx#L19) | `export function PageHeader({ title, titleBn, description, descriptionContent, descriptionBn, actions, compact = false, showModuleSettings = true }: PageHeaderProps) {` |
## src/components/Panel.tsx

| Line | Existing declaration / event |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Panel.tsx#L12) | `export function Panel({ title, subtitle, actions, children, className = '', bodyClassName = 'p-4' }: PanelProps) {` |
## src/components/PartyAvatar.tsx

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/PartyAvatar.tsx#L9) | `export function PartyAvatar({ name, color = '#22364F', image, size = 32 }: PartyAvatarProps) {` |
## src/components/ProductThumb.tsx

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/ProductThumb.tsx#L8) | `export function ProductThumb({ src, size = 36 }: ProductThumbProps) {` |
## src/components/QuickAddDialog.tsx

| Line | Existing declaration / event |
|---|---|
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L26) | `export function QuickAddDialog({ noun, initialName, placeholder, nameLabel, withSymbol = false, showContact = false, existing, onClose, onCreate, onSelectExisting }: QuickAddDialogProps) {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L28) | `const [name, setName] = useState(initialName);` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L29) | `const [symbol, setSymbol] = useState('');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L30) | `const [phone, setPhone] = useState('');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L31) | `const [area, setArea] = useState('');` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L32) | `const [error, setError] = useState<string  /  null>(null);` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L33) | `const [match, setMatch] = useState<QuickAddOption  /  null>(null);` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L36) | `const submit = (event: FormEvent) => {` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L63) | `<Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L72) | `<form onSubmit={submit} noValidate className="product-form space-y-4">` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L83) | `onChange={(event) => { setName(event.target.value); setError(null); setMatch(null); }}` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L101) | `onChange={(event) => { setSymbol(event.target.value); setError(null); setMatch(null); }}` |
| [115](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L115) | `<Input id="qa-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01XXXXXXXXX" className={control} /></div>` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L117) | `<Input id="qa-area" value={area} onChange={(event) => setArea(event.target.value)} placeholder={t('Optional', 'ঐচ্ছিক')} className={control} /></div>` |
| [124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L124) | `<button type="button" onClick={() => onSelectExisting(match.value)} className="font-semibold text-primary underline underline-offset-2">` |
| [131](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddDialog.tsx#L131) | `<Button type="button" variant="outline" onClick={onClose} className="h-[var(--ctl-h)]">{t('Cancel', 'বাতিল')}</Button>` |
## src/components/QuickAddSelect.tsx

| Line | Existing declaration / event |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddSelect.tsx#L16) | `export function QuickAddSelect({ label, value, options, onChange, onCreate, showContact = false, showSymbol = false, placeholder }: Props) {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/QuickAddSelect.tsx#L19) | `options={options.map((option) => ({ value: option, label: option }))} onChange={onChange}` |
## src/components/SearchSelect.tsx

| Line | Existing declaration / event |
|---|---|
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L43) | `export function SearchSelect({` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L49) | `const [open, setOpen] = useState(false);` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L50) | `const [query, setQuery] = useState('');` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L51) | `const [active, setActive] = useState(0);` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L52) | `const [quickName, setQuickName] = useState<string  /  null>(null);` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L53) | `const [editing, setEditing] = useState<{ value: string; name: string; symbol: string; nameBn: string }  /  null>(null);` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L54) | `const [editError, setEditError] = useState<string  /  null>(null);` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L56) | `const [rect, setRect] = useState<PopoverRect  /  null>(null);` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L104) | `const saveEdit = () => {` |
| [241](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L241) | `onChange={(event) => { setQuery(event.target.value); setActive(0); }}` |
| [242](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L242) | `onKeyDown={onSearchKey}` |
| [272](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L272) | `onClick={(event) => event.stopPropagation()}` |
| [278](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L278) | `onChange={(event) => { setEditing({...editing, name: event.target.value}); setEditError(null); }}` |
| [279](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L279) | `onKeyDown={(event) => {` |
| [290](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L290) | `onChange={(event) => { setEditing({...editing, symbol: event.target.value}); setEditError(null); }}` |
| [291](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L291) | `onKeyDown={(event) => {` |
| [300](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L300) | `<button type="button" onClick={saveEdit}` |
| [305](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L305) | `<button type="button" onClick={cancelEdit}` |
| [314](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L314) | `onChange={event => { setEditing({...editing, nameBn: event.target.value}); setEditError(null); }}` |
| [315](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L315) | `onKeyDown={event => {` |
| [341](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L341) | `onKeyDown={(event) => {` |
| [349](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L349) | `onClick={() => choose(option.value)}` |
| [364](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L364) | `onClick={(event) => { event.preventDefault(); event.stopPropagation(); startEdit(option); }}` |
| [382](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L382) | `onClick={() => startQuickAdd(query.trim())}` |
| [404](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L404) | `onKeyDown={onSheetKey}` |
| [413](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L413) | `<button type="button" onClick={() => hide()} aria-label={t('Close', 'বন্ধ করুন')}` |
| [423](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L423) | `<button type="button" onClick={() => startQuickAdd(query.trim())}` |
| [469](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L469) | `onClick={() => (open ? hide() : show())}` |
| [470](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/SearchSelect.tsx#L470) | `onKeyDown={(event) => {` |
## src/components/StatusBadge.tsx

| Line | Existing declaration / event |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/StatusBadge.tsx#L23) | `export function StatusBadge({ tone = 'neutral', dot = false, children, className = '' }: StatusBadgeProps) {` |
## src/components/Switch.tsx

| Line | Existing declaration / event |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Switch.tsx#L13) | `export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Switch.tsx#L17) | `const [local, setLocal] = useState(Boolean(defaultChecked));` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Switch.tsx#L43) | `onChange={(event) => {` |
## src/components/Table.tsx

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Table.tsx#L18) | `export const Table = forwardRef<HTMLTableElement, TableProps>(function Table({ scrollRegionLabel, ...props }, forwardedRef) {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Table.tsx#L26) | `const updateScrollRegion = () => {` |
## src/components/Tooltip.tsx

| Line | Existing declaration / event |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Tooltip.tsx#L5) | `export function Tooltip({` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Tooltip.tsx#L25) | `const [open,setOpen]=useState(false);` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Tooltip.tsx#L26) | `const [position,setPosition]=useState<{top:number;left:number} / null>(null);` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/Tooltip.tsx#L56) | `onClick={show} onFocus={show} onBlur={scheduleClose}` |
## src/components/TransactionReviewDialog.tsx

| Line | Existing declaration / event |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/TransactionReviewDialog.tsx#L20) | `export function TransactionReviewDialog({open,onClose,onConfirm,title,amount,details,confirmLabel='Confirm transaction',note,amountLanguage,closeLabel}:{` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/TransactionReviewDialog.tsx#L27) | `return <Dialog open={open} onOpenChange={next=>{if(!next)onClose();}}>` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/TransactionReviewDialog.tsx#L45) | `<Button variant="outline" onClick={onClose}>{text('Edit details','সংশোধন করুন')}</Button>` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/TransactionReviewDialog.tsx#L46) | `<Button onClick={onConfirm}><CheckCircle2 className="size-4"/>{copy(confirmLabel)}</Button>` |
## src/components/WorkspaceLibrary.tsx

| Line | Existing declaration / event |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/WorkspaceLibrary.tsx#L5) | `export function WorkspaceLibrary({ title, search, onSearch, placeholder, searchLabel, children, footer }: {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/WorkspaceLibrary.tsx#L12) | `<Input type="search" aria-label={searchLabel} placeholder={placeholder} value={search} onChange={e => onSearch(e.target.value)} />` |
## src/components/WorkspaceToolbar.tsx

| Line | Existing declaration / event |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/WorkspaceToolbar.tsx#L4) | `export function WorkspaceToolbar({ search, children, details, variant = 'card' }: { search: ReactNode; children?: ReactNode; details?: ReactNode; variant?: 'card'  /  'plain' }) {` |
## src/components/accounts/BankEntryTab.tsx

| Line | Existing declaration / event |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L25) | `function emptyDraft(accountId = ''): BankEntryDraft {` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L48) | `export function BankEntryTab({ variant = 'accounts', initialAccountId }: { variant?: 'accounts'  /  'counter'; initialAccountId?: string } = {}) {` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L52) | `const [accounts, setAccounts] = useState<BankAccountOption[]>(demoAccounts);` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L53) | `const [connected, setConnected] = useState(false);` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L54) | `const [activeCashSession, setActiveCashSession] = useState(false);` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L55) | `const [loading, setLoading] = useState(true);` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L56) | `const [saving, setSaving] = useState(false);` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L57) | `const [loadError, setLoadError] = useState('');` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L58) | `const [formError, setFormError] = useState('');` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L59) | `const [draft, setDraft] = useState<BankEntryDraft>(() => emptyDraft(initialAccountId));` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L60) | `const [review, setReview] = useState(false);` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L61) | `const [ledger, setLedger] = useState<BankLedgerEntry[]>([]);` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L62) | `const [ledgerError, setLedgerError] = useState('');` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L64) | `const update = <K extends keyof BankEntryDraft>(key: K, value: BankEntryDraft[K]) => {` |
| [135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L135) | `const submitEntry = async () => {` |
| [171](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L171) | `<Button size="sm" variant="outline" disabled={loading  /  /  saving} onClick={() => { void loadBootstrap(); }}>` |
| [218](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L218) | `<Button variant="outline" size="sm" onClick={() => setReview(false)}>{text('Edit','সংশোধন')}</Button>` |
| [219](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L219) | `<Button size="sm" disabled={!connected  /  /  saving} onClick={() => { void submitEntry(); }}>` |
| [234](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L234) | `onChange={(event) => update('bankAccountId', event.target.value)} />` |
| [240](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L240) | `onChange={(event) => update('entryType', event.target.value as BankEntryType)} />` |
| [248](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L248) | `onChange={(event) => update('amount', event.target.value.replace(/[^\d.]/g, ''))} placeholder="0.00" />` |
| [254](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L254) | `onChange={(event) => update('date', event.target.value)} />` |
| [262](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L262) | `onChange={(event) => update('direction', event.target.value as 'credit'  /  'debit')} />` |
| [273](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L273) | `onChange={(event) => update('reference', event.target.value)} />` |
| [278](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L278) | `onChange={(event) => update('description', event.target.value)} />` |
| [284](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L284) | `onChange={(event) => update('notes', event.target.value)} />` |
| [290](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L290) | `onChange={(event) => update('backdatedReason', event.target.value)} />` |
| [302](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L302) | `<Button variant="outline" size="sm" onClick={() => navigate('/app/finance')}>` |
| [315](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L315) | `<Button variant="outline" size="sm" onClick={() => { setDraft(emptyDraft(draft.bankAccountId)); setFormError(''); }}>` |
| [319](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L319) | `<Button size="sm" disabled={saving  /  /  loading  /  /  !accounts.length  /  /  bouncedCheque} onClick={reviewEntry}>` |
| [347](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L347) | `<Button className="mt-4 w-full" disabled={loading  /  /  saving  /  /  amount <= 0  /  /  bouncedCheque  /  /  !accounts.length} onClick={reviewEntry}>` |
| [407](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L407) | `<Dialog open={inCounter && review} onOpenChange={(open) => { if (!open) setReview(false); }}>` |
| [428](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L428) | `<Button variant="outline" onClick={() => setReview(false)}>{text('Edit details','সংশোধন করুন')}</Button>` |
| [429](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/BankEntryTab.tsx#L429) | `<Button disabled={!connected  /  /  saving  /  /  bouncedCheque} onClick={() => { void submitEntry(); }}>` |
## src/components/accounts/ChartOfAccountsView.tsx

| Line | Existing declaration / event |
|---|---|
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L21) | `export function ChartOfAccountsView({` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L28) | `const [accounts, setAccounts] = useState<AccountingAccount[]>(accountingAccounts);` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L29) | `const [query, setQuery] = useState('');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L30) | `const [groupFilter, setGroupFilter] = useState('All groups');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L31) | `const [editing, setEditing] = useState<AccountingAccount  /  null>(null);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L32) | `const [dialogOpen, setDialogOpen] = useState(false);` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L34) | `const [code, setCode] = useState('');` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L35) | `const [name, setName] = useState('');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L36) | `const [helperBn, setHelperBn] = useState('');` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L37) | `const [group, setGroup] = useState<AccountingGroup>('Asset');` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L38) | `const [parent, setParent] = useState('');` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L69) | `const save = () => {` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L103) | `{onOpeningBalance && <Button variant="outline" size="sm" onClick={onOpeningBalance}>Opening balance</Button>}` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L104) | `<Button size="sm" onClick={openCreate}><Plus className="size-4" /> Add account</Button>` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L111) | `<Input className="pl-8" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search code, account or group" />` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L113) | `<FormSelect className="sm:w-44" value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} options={['All groups', ...groups]} />` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L143) | `trigger={({ toggle }) => <button onClick={toggle} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink" aria-label={'Actions for ' + account.name}><MoreHorizontal className="size-4" /></button>}>` |
| [145](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L145) | `<ActionMenuItem icon={Pencil} onClick={() => { close(); openEdit(account); }}>Edit</ActionMenuItem>` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L147) | `<ActionMenuItem icon={Power} onClick={() => { close(); toggleStatus(account); }}>{account.active ? 'Deactivate' : 'Activate'}</ActionMenuItem>` |
| [158](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L158) | `<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>` |
| [162](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L162) | `<label className="text-[13px] font-medium text-ink">Code<Input className="mt-1.5" value={code} onChange={(event) => setCode(event.target.value.replace(/[^\d]/g, ''))} /></label>` |
| [163](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L163) | `<label className="text-[13px] font-medium text-ink">Group<FormSelect className="mt-1.5" value={group} onChange={(event) => setGroup(event.target.value as AccountingGroup)} options={groups} /></label>` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L164) | `<label className="text-[13px] font-medium text-ink sm:col-span-2">Account name<Input className="mt-1.5" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Generator Repair Expense" /></label>` |
| [165](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L165) | `<label className="text-[13px] font-medium text-ink">Parent group<Input className="mt-1.5" value={parent} onChange={(event) => setParent(event.target.value)} placeholder={group} /></label>` |
| [166](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L166) | `<label className="text-[13px] font-medium text-ink">Bangla helper<Input className="mt-1.5 font-bn" value={helperBn} onChange={(event) => setHelperBn(event.target.value)} placeholder="সহজ বাংলা ব্যাখ্যা" /></label>` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/ChartOfAccountsView.tsx#L168) | `<DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save}>{editing ? 'Save changes' : 'Add account'}</Button></DialogFooter>` |
## src/components/accounts/LedgerView.tsx

| Line | Existing declaration / event |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L27) | `function downloadCsv(accountName: string, rows: Array<LedgerRow & { balance: number }>) {` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L40) | `export function LedgerView({` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L52) | `const [accountId, setAccountId] = useState('asset-cash');` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L55) | `const [from, setFrom] = useState('2026-09-01');` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L56) | `const [to, setTo] = useState('2026-10-31');` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L57) | `const [search, setSearch] = useState('');` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L58) | `const [selected, setSelected] = useState<(LedgerRow & { balance: number })  /  null>(null);` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L89) | `onChange={(name) => {` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L99) | `onChange={(range) => { setFrom(range.from); setTo(range.to); }}` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L108) | `onChange={(event) => setSearch(event.target.value)}` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L112) | `<Button variant="outline" size="sm" className="justify-self-start" onClick={() => { downloadCsv(account.name, rows); toast.success(text('Ledger exported','খাতার হিসাব ডাউনলোড হয়েছে')); }}>` |
| [115](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L115) | `<Button variant="outline" size="sm" className="justify-self-start" onClick={printLedger}>` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L144) | `<TableRow key={ʼ${row.postingId}-${row.reference}-${row.debit}-${row.credit}ʼ} className="cursor-pointer text-[13px]" onClick={() => setSelected(row)}>` |
| [157](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L157) | `<Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/LedgerView.tsx#L167) | `<RowActionMenu label={text('Ledger source actions','খাতার মূল লেনদেনের কাজ')}>{()=> <SourceDeleteAction kind="projection"/>}</RowActionMenu><DialogFooter><Button variant="outline" onClick={printLedger}><Printer className="size-4" /> {text('Print','প্রিন্ট')}</Button><Button onClick={() => setSelected(null)}>{text('Close','বন্ধ করুন')}</Button></DialogFooter>` |
## src/components/accounts/OpeningBalanceDialog.tsx

| Line | Existing declaration / event |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L17) | `export function OpeningBalanceDialog({` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L27) | `const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L28) | `const [amount, setAmount] = useState('');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L29) | `const [date, setDate] = useState('2026-10-01');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L30) | `const [note, setNote] = useState('');` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L33) | `const save = () => {` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L56) | `<Dialog open={open} onOpenChange={onOpenChange}>` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L73) | `onChange={(event) => {` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L85) | `<Input className="pl-7 text-right" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} placeholder="0" />` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L90) | `<Input className="mt-1.5" type="date" value={date} onChange={(event) => setDate(event.target.value)} />` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L94) | `<Input className="mt-1.5" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional setup note" />` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L99) | `<Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/OpeningBalanceDialog.tsx#L100) | `<Button onClick={save}>Post opening balance</Button>` |
## src/components/accounts/StatementsView.tsx

| Line | Existing declaration / event |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/StatementsView.tsx#L14) | `function accountNet(postings: Posting[], accountId: string, from: string, to: string) {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/StatementsView.tsx#L26) | `export function StatementsView({ postings }: { postings: Posting[] }) {` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/StatementsView.tsx#L29) | `const [range, setRange] = useState<IsoRange>({ from: '2026-09-01', to: '2026-10-31' });` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/StatementsView.tsx#L78) | `<button onClick={() => setPreset('month')} className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-ink-50">{text('This month','এই মাস')}</button>` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/StatementsView.tsx#L79) | `<button onClick={() => setPreset('quarter')} className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-ink-50">{text('Quarter','ত্রৈমাসিক')}</button>` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/StatementsView.tsx#L80) | `<button onClick={() => setPreset('year')} className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-ink-50">{text('Year','এই বছর')}</button>` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/StatementsView.tsx#L83) | `className="w-full sm:w-[286px]" value={range} onChange={setRange} />` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/StatementsView.tsx#L85) | `<Button variant="outline" size="sm" onClick={exportCsv}><ArrowDownToLine className="size-4" /> {text('Export','ডাউনলোড')}</Button>` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/StatementsView.tsx#L86) | `<Button variant="outline" size="sm" onClick={printStatements}><Printer className="size-4" /> {text('Print','প্রিন্ট')}</Button>` |
## src/components/accounts/TrialBalanceView.tsx

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/TrialBalanceView.tsx#L18) | `export function TrialBalanceView({ postings, terminologyMode }: { postings: Posting[]; terminologyMode: TerminologyMode }) {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/TrialBalanceView.tsx#L20) | `const [asOf, setAsOf] = useState('2026-10-31');` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/TrialBalanceView.tsx#L55) | `<label className="text-[11px] font-medium text-ink">{text('As of','যে তারিখ পর্যন্ত')} {showHelper&&<span className="font-bn font-normal text-ink-400">· এই তারিখ পর্যন্ত</span>}<Input className="mt-1 w-40" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} /></label>` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/TrialBalanceView.tsx#L56) | `<Button variant="outline" size="sm" onClick={exportCsv}><ArrowDownToLine className="size-4" /> {text('Export','ডাউনলোড')}</Button>` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/TrialBalanceView.tsx#L57) | `<Button variant="outline" size="sm" onClick={printTrial}><Printer className="size-4" /> {text('Print','প্রিন্ট')}</Button>` |
## src/components/accounts/VoucherActionDialog.tsx

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L15) | `function Detail({ label, children }: { label: string; children: React.ReactNode }) {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L19) | `export function VoucherActionDialog({` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L39) | `const [mode, setMode] = useState<'view'  /  'edit'  /  'delete'>('view');` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L40) | `const [date, setDate] = useState('');` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L41) | `const [reference, setReference] = useState('');` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L42) | `const [description, setDescription] = useState('');` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L43) | `const [amount, setAmount] = useState('');` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L44) | `const [reason, setReason] = useState('');` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L59) | `const deleted = source.recordStatus === 'Deleted';` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L61) | `const save = () => {` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L96) | `const confirmDelete = () => {` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L102) | `<Dialog open={!!source} onOpenChange={(open) => !open && onClose()}>` |
| [141](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L141) | `<label className="text-[13px] font-medium text-ink">Transaction Date<Input className="mt-1.5" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L143) | `<label className="text-[13px] font-medium text-ink">Reference<Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} /></label>` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L144) | `<label className="text-[13px] font-medium text-ink">Amount<div className="relative mt-1.5"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span><Input className="pl-7 text-right" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} /></div></label>` |
| [145](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L145) | `<label className="text-[13px] font-medium text-ink sm:col-span-2">Description<Input className="mt-1.5" value={description} onChange={(event) => setDescription(event.target.value)} /></label>` |
| [146](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L146) | `<label className="text-[13px] font-medium text-ink sm:col-span-2">Reason for correction <span className="font-bn text-[11px] font-normal text-ink-400">· আর্থিক পরিবর্তন হলে কারণ আবশ্যক</span><Input className="mt-1.5" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Wrong date / amount entered" /></label>` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L153) | `<label className="text-[13px] font-medium text-ink">Reason for delete <span className="font-bn text-[11px] font-normal text-ink-400">· কেন মুছছেন</span><Input className="mt-1.5" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Duplicate voucher" /></label>` |
| [159](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L159) | `<Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L160) | `{!deleted && manual && <Button variant="outline" onClick={() => onDuplicate(source)}><Copy className="size-4" /> Duplicate</Button>}` |
| [161](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L161) | `{!deleted && manual && <Button variant="outline" onClick={() => setMode('edit')}><Pencil className="size-4" /> Edit</Button>}` |
| [162](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L162) | `{!deleted && manual && <Button variant="outline" onClick={() => { setReason(''); setMode('delete'); }}><Trash2 className="size-4" /> Delete</Button>}` |
| [163](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L163) | `{!manual && <Button variant="outline" onClick={() => onGoToSource(source)}><ExternalLink className="size-4" /> Go to source</Button>}` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L164) | `<Button onClick={onClose}>Close</Button>` |
| [166](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L166) | `{mode === 'edit' && <><Button variant="outline" onClick={() => setMode('view')}>Cancel</Button><Button onClick={save}><Save className="size-4" /> Save correction</Button></>}` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherActionDialog.tsx#L167) | `{mode === 'delete' && <><Button variant="outline" onClick={() => setMode('view')}>Cancel</Button><Button onClick={confirmDelete}>Delete voucher</Button></>}` |
## src/components/accounts/VoucherDialog.tsx

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L15) | `export function VoucherDialog({` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L26) | `const [type, setType] = useState<VoucherType>('receipt');` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L27) | `const [date, setDate] = useState('2026-10-07');` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L28) | `const [moneyAccount, setMoneyAccount] = useState(moneyAccounts[0]?.name ?? '');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L29) | `const [otherAccount, setOtherAccount] = useState(nonMoneyAccounts[0]?.name ?? '');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L30) | `const [toMoneyAccount, setToMoneyAccount] = useState(moneyAccounts[1]?.name ?? moneyAccounts[0]?.name ?? '');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L31) | `const [amount, setAmount] = useState('');` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L32) | `const [reference, setReference] = useState('');` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L33) | `const [description, setDescription] = useState('');` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L34) | `const [paymentRows, setPaymentRows] = useState<Array<{ account: string; amount: string }>>([{ account: moneyAccounts[0]?.name ?? '', amount: '' }]);` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L55) | `const save = () => {` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L103) | `<Dialog open={open} onOpenChange={onOpenChange}>` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L112) | `<FormSelect className="mt-1.5" value={voucherLabels[type].label} onChange={(event) => {` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L119) | `<Input className="mt-1.5" type="date" value={date} onChange={(event) => setDate(event.target.value)} />` |
| [126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L126) | `<FormSelect className="mt-1.5" value={moneyAccount} onChange={(event) => setMoneyAccount(event.target.value)} options={moneyAccounts.map((account) => account.name)} />` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L130) | `<FormSelect className="mt-1.5" value={toMoneyAccount} onChange={(event) => setToMoneyAccount(event.target.value)} options={moneyAccounts.map((account) => account.name)} />` |
| [137](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L137) | `<FormSelect className="mt-1.5" value={moneyAccount} onChange={(event) => setMoneyAccount(event.target.value)} options={moneyAccounts.map((account) => account.name)} />` |
| [141](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L141) | `<FormSelect className="mt-1.5" value={otherAccount} onChange={(event) => setOtherAccount(event.target.value)} options={nonMoneyAccounts.map((account) => account.name)} />` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L147) | `<FormSelect className="mt-1.5" value={otherAccount} onChange={(event) => setOtherAccount(event.target.value)} options={nonMoneyAccounts.map((account) => account.name)} />` |
| [155](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L155) | `<Input className="pl-7 text-right" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} placeholder="0" />` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L160) | `<Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Optional" />` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L167) | `<Button variant="outline" size="sm" onClick={() => setPaymentRows((current) => [...current, { account: moneyAccounts[0]?.name ?? '', amount: '' }])}><Plus className="size-3.5" /> Add</Button>` |
| [172](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L172) | `<FormSelect value={row.account} onChange={(event) => setPaymentRows((current) => current.map((item, i) => i === index ? { ...item, account: event.target.value } : item))} options={moneyAccounts.map((account) => account.name)} />` |
| [173](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L173) | `<Input className="text-right" inputMode="decimal" value={row.amount} onChange={(event) => setPaymentRows((current) => current.map((item, i) => i === index ? { ...item, amount: event.target.value.replace(/[^\d.]/g, '') } : item))} placeholder={paymentRows.length === 1 ? amount  /  /  '0' : '0'} />` |
| [174](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L174) | `<button type="button" disabled={paymentRows.length === 1} onClick={() => setPaymentRows((current) => current.filter((_, i) => i !== index))} className="flex size-9 items-center justify-center rounded-md text-ink-400 hover:bg-danger/5 hover:text-danger disabled:opacity-30" aria-label="Remove payment source"><Trash2 className="size-3.5" /></button>` |
| [184](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L184) | `<Input className="mt-1.5" value={description} onChange={(event) => setDescription(event.target.value)} />` |
| [188](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L188) | `<Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>` |
| [189](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/accounts/VoucherDialog.tsx#L189) | `<Button onClick={save}>Post voucher</Button>` |
## src/components/brand/ApplicationsSection.tsx

| Line | Existing declaration / event |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ApplicationsSection.tsx#L16) | `function Frame({ title, note, children, className = '' }: {title: string;note: string;children: React.ReactNode;className?: string;}) {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ApplicationsSection.tsx#L28) | `export function ApplicationsSection() {` |
## src/components/brand/BrandHero.tsx

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/BrandHero.tsx#L15) | `export function BrandHero() {` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/BrandHero.tsx#L41) | `<Button size="lg" onClick={() => navigate('/app/dashboard')}>` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/BrandHero.tsx#L44) | `<Button size="lg" variant="outline" onClick={() => navigate('/app/pos')}>` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/BrandHero.tsx#L70) | `onClick={() => navigate(to)}` |
## src/components/brand/BrandNav.tsx

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/BrandNav.tsx#L9) | `export function BrandNav() {` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/BrandNav.tsx#L14) | `<button type="button" onClick={() => document.getElementById('component-library')?.scrollIntoView()} aria-label="HisabIQ design guide, top" className="flex items-center gap-3">` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/BrandNav.tsx#L20) | `<button type="button" key={s.id} onClick={() => document.getElementById(s.id)?.scrollIntoView({ block: 'start' })} className="whitespace-nowrap rounded-md px-2.5 py-1 text-[13px] text-ink-600 hover:bg-ink-50 hover:text-ink">` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/BrandNav.tsx#L26) | `<Button size="sm" onClick={() => navigate('/app/dashboard')}>` |
## src/components/brand/ColorSection.tsx

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ColorSection.tsx#L6) | `function copy(hex: string) {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ColorSection.tsx#L11) | `function Scale({ title, steps }: {title: string;steps: {step: string;hex: string;}[];}) {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ColorSection.tsx#L21) | `onClick={() => copy(s.hex)}` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ColorSection.tsx#L36) | `export function ColorSection() {` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ColorSection.tsx#L50) | `onClick={() => copy(c.hex)}` |
## src/components/brand/CompleteDesignGuide.tsx

| Line | Existing declaration / event |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L13) | `export function CompleteDesignGuide() {` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L14) | `const [query, setQuery] = useState('');` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L15) | `const [opened, setOpened] = useState<Set<string>>(() => new Set(['guide-01']));` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L16) | `const [feedback, setFeedback] = useState('');` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L45) | `<Button variant="outline" onClick={copy}><Copy className="size-4" aria-hidden="true" /> Copy complete guide</Button>` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L46) | `<Button onClick={download}><Download className="size-4" aria-hidden="true" /> Download guide</Button>` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L61) | `<Input id="guide-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try modal, Bangla, table, 36px…" className="pl-9" />` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L64) | `<Button variant="outline" onClick={() => setOpened(new Set(filtered.map((chapter) => chapter.id)))}>Expand all</Button>` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L65) | `<Button variant="outline" onClick={() => { setQuery(''); setOpened(new Set()); }}>Collapse all</Button>` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L70) | `{filtered.map((chapter) => <button key={chapter.id} type="button" onClick={() => show(chapter.id)} className="block w-full rounded-lg px-3 py-2 text-left text-xs leading-5 text-ink-600 hover:bg-accent hover:text-accent-foreground">{chapter.title}</button>)}` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/CompleteDesignGuide.tsx#L73) | `{!filtered.length && <div className="rounded-xl border border-border bg-card p-6"><p className="text-sm font-medium text-ink">No matching design rule</p><p className="mt-1 text-sm text-ink-500">Try another term or clear the search to view every chapter.</p><Button variant="outline" className="mt-3" onClick={() => setQuery('')}>Clear search</Button></div>}` |
## src/components/brand/DesignGuideExamples.tsx

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L18) | `function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L22) | `function Examples() {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L25) | `const [tab, setTab] = useState('fields');` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L26) | `const [note, setNote] = useState('');` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L27) | `const [search, setSearch] = useState('');` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L28) | `const [amount, setAmount] = useState('1250');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L29) | `const [method, setMethod] = useState('cash');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L30) | `const [party, setParty] = useState('rahman');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L31) | `const [options, setOptions] = useState([{ value: 'rahman', label: 'Rahman Hardware · রহমান হার্ডওয়্যার', meta: '01711-123456' }, { value: 'karim', label: 'Karim Store · করিম স্টোর', meta: '01811-234567' }]);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L32) | `const [dates, setDates] = useState({ from: '2026-10-01', to: '2026-10-26' });` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L33) | `const [enabled, setEnabled] = useState(true);` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L34) | `const [dialog, setDialog] = useState(false);` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L35) | `const [notice, setNotice] = useState('');` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L52) | `onClick={() => setTab(item.value)} onKeyDown={(event) => {` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L65) | `<Field id={id + '-note'} label={text('Note', 'নোট')}><Input id={id + '-note'} value={note} onChange={(event) => setNote(event.target.value)} placeholder={text('Write a short note', 'একটি ছোট নোট লিখুন')} /></Field>` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L66) | `<Field id={id + '-amount'} label={text('Amount · ৳', 'টাকার পরিমাণ · ৳')}><Input id={id + '-amount'} inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className="text-right" /></Field>` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L67) | `<Field id={id + '-method'} label={text('Payment method', 'পেমেন্ট মাধ্যম')}><AppSelect id={id + '-method'} label={text('Payment method', 'পেমেন্ট মাধ্যম')} value={method} onChange={setMethod} options={[{ value: 'cash', label: text('Cash', 'ক্যাশ') }, { value: 'bank', label: text('Bank', 'ব্যাংক') }, { value: 'mfs', label: text('MFS', 'মোবাইল ব্যাংকিং') }]} /></Field>` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L68) | `<Field id={id + '-party'} label={text('Customer', 'ক্রেতা')}><SearchSelect id={id + '-party'} ariaLabel={text('Sample customer', 'নমুনা ক্রেতা')} noun={{ en: 'customer', bn: 'ক্রেতা' }} value={party} options={options} onChange={setParty} onCreate={(name) => { const value = 'sample-' + options.length; setOptions((current) => [...current, { value, label: name, meta: 'Local guide sample' }]); return value; }} /></Field>` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L69) | `<div className="sm:col-span-2"><p className="mb-1.5 text-[13px] font-medium text-ink">{text('Date range', 'তারিখের সীমা')}</p><AppDateRangePicker label={text('Sample date range', 'নমুনা তারিখের সীমা')} value={dates} onChange={setDates} /></div>` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L78) | `{(['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const).map((variant) => <Button key={variant} variant={variant} onClick={() => { setNotice(''); setDialog(true); }}>{variant}</Button>)}` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L79) | `<Button variant="outline" size="icon" aria-label={text('Open sample preview', 'নমুনা দেখুন')} onClick={() => setDialog(true)}><Eye className="size-4" aria-hidden="true" /></Button>` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L83) | `<Button data-erp-workflow-action="complete" className="w-full text-[15px] font-semibold" onClick={() => setDialog(true)}><Plus className="size-4" aria-hidden="true" />{text('Preview checkout · 48px', 'চেকআউট নমুনা · ৪৮ পিক্সেল')}</Button>` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L92) | `<Panel title={text('Products table roles', 'পণ্যের টেবিলের মাপ')} subtitle="13px data · 12px heading · 11px helper/badge" actions={<div className="flex items-center gap-2"><Search className="size-4 text-ink-400" aria-hidden="true" /><Input type="search" aria-label={text('Search sample rows', 'নমুনা সারি খুঁজুন')} value={search} onChange={(event) => setSearch(event.target.value)} /></div>} bodyClassName="p-0">` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L100) | `<Dialog open={dialog} onOpenChange={setDialog}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{text('Review sample', 'নমুনা দেখুন')}</DialogTitle><DialogDescription>{text('This demonstrates the shared modal. No payment or stock is posted.', 'এটি শুধু ডায়ালগের নমুনা। কোনো টাকা বা স্টক জমা হয় না।')}</DialogDescription></DialogHeader>` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L102) | `<AppSelect label={text('Sample method inside dialog', 'ডায়ালগে নমুনা মাধ্যম')} value={method} onChange={setMethod} options={['cash', 'bank', 'mfs']} />` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L103) | `<DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>{text('Cancel', 'বাতিল')}</Button><Button onClick={() => { setDialog(false); setNotice(text('Sample preview closed. No transaction was recorded.', 'নমুনা বন্ধ হয়েছে। কোনো লেনদেন জমা হয়নি।')); }}>{text('Finish sample', 'নমুনা শেষ করুন')}</Button></DialogFooter>` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideExamples.tsx#L108) | `export function DesignGuideExamples() {` |
## src/components/brand/DesignGuideInventory.tsx

| Line | Existing declaration / event |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideInventory.tsx#L7) | `export function DesignGuideInventory() {` |
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideInventory.tsx#L8) | `const [query, setQuery] = useState('');` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/DesignGuideInventory.tsx#L18) | `<Input id="guide-inventory-search" type="search" className="mt-1.5" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try AppDatePicker, Payment, Paperclip or primary…" />` |
## src/components/brand/Logo.tsx

| Line | Existing declaration / event |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/Logo.tsx#L25) | `export function LogoMark({ size = 32, tone = 'color', className, title = 'HisabIQ' }: LogoMarkProps) {` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/Logo.tsx#L58) | `export function Wordmark({ size = 24, tone = 'color', bangla = false, className }: WordmarkProps) {` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/Logo.tsx#L97) | `export function LogoLockup({ size = 32, tone = 'color', bangla = false, className }: LockupProps) {` |
## src/components/brand/LogoSection.tsx

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/LogoSection.tsx#L18) | `export function LogoSection() {` |
## src/components/brand/PartyRoleSpecimen.tsx

| Line | Existing declaration / event |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L27) | `export function PartyRoleSpecimen() {` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L29) | `const [role, setRole] = useState<PartyRole>('Customer');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L30) | `const [credit, setCredit] = useState(false);` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L31) | `const [more, setMore] = useState(false);` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L34) | `const [opened, setOpened] = useState<{ label: string; source: string }  /  null>(null);` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L51) | `const actionButton = (action: Action, mobile = false) => <Button key={action.id} data-role-action={action.id} data-finance-type={action.financeType} variant={action.variant} disabled={action.disabled} title={action.reason} className={mobile ? 'w-full justify-start' : undefined} onClick={() => { previewFromSheet.current = more; setMore(false); show(action.label, action.source); }}>{action.Icon && <action.Icon className="size-4" aria-hidden="true" />}{action.label}</Button>;` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L53) | `<div className="flex flex-wrap items-center gap-3"><div className="min-w-48 flex-1"><AppSelect label={text('Preview party relationship', 'পক্ষের সম্পর্ক বাছুন')} value={role} onChange={(value) => setRole(value as PartyRole)} options={roles.map((value) => ({ value, label: partyRoleLabel(value, language) }))} /></div>` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L54) | `<label className="flex items-center gap-2 text-xs text-ink-600"><input type="checkbox" checked={credit} onChange={(event) => setCredit(event.target.checked)} className="size-4 accent-primary" />{text('Sample refundable credit', 'নমুনা ফেরতযোগ্য জমা')}</label></div>` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L66) | `<Button ref={moreTrigger} variant="outline" className={mobileSecondary ? undefined : 'col-span-2'} data-library-party-more aria-haspopup="dialog" aria-expanded={more} onClick={() => setMore(true)}><MoreHorizontal className="size-4" aria-hidden="true" />{text('More', 'আরও')}</Button>` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PartyRoleSpecimen.tsx#L71) | `<Dialog open={Boolean(opened)} onOpenChange={(value) => { if (!value) closePreview(); }}><DialogContent><DialogHeader><DialogTitle>{opened?.label}</DialogTitle><DialogDescription>{text('Component-library preview only. No transaction is recorded.', 'শুধু উপাদানের নমুনা। কোনো লেনদেন জমা হয় না।')}</DialogDescription></DialogHeader><p className="text-sm text-ink">{partyRoleLabel(role, language)} · {opened?.source}</p><Button variant="outline" onClick={closePreview}>{text('Close preview', 'নমুনা বন্ধ করুন')}</Button></DialogContent></Dialog>` |
## src/components/brand/PrimitivesSection.tsx

| Line | Existing declaration / event |
|---|---|
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PrimitivesSection.tsx#L42) | `function Block({ title, children, className = '' }: {title: string;children: React.ReactNode;className?: string;}) {` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/PrimitivesSection.tsx#L51) | `export function PrimitivesSection() {` |
## src/components/brand/ReceiptPreview.tsx

| Line | Existing declaration / event |
|---|---|
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReceiptPreview.tsx#L41) | `export function ReceiptPreview(p: ReceiptPreviewProps) {` |
## src/components/brand/ReportToolbarSpecimen.tsx

| Line | Existing declaration / event |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L24) | `export function ReportToolbarSpecimen() {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L26) | `const [filters, setFilters] = useState<ReportFilters>(initial);` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L27) | `const [visible, setVisible] = useState(columns.map((column) => column.id));` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L28) | `const [dialog, setDialog] = useState<'columns'  /  'views'  /  null>(null);` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L29) | `const [viewName, setViewName] = useState('');` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L30) | `const [views, setViews] = useState<{ name: string; filters: ReportFilters; columns: string[] }[]>([]);` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L31) | `const [detail, setDetail] = useState<string  /  null>(null);` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L37) | `<ReportToolbar definition={{ ...reportDefinition('sales-register'), dimensions: ['party', 'status'] }} filters={filters} options={options} onChange={setFilters} onColumns={() => setDialog('columns')} onSaved={() => setDialog('views')} asOf="2026-10-26" />` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L39) | `<TableBody>{rows.map((row) => <TableRow key={row.id}>{visible.includes('label') && <TableCell><button type="button" className="font-medium text-primary hover:underline" onClick={() => setDetail(row.id)}>{row.id}</button></TableCell>}{visible.includes('party') && <TableCell><button type="button" className="text-primary hover:underline" onClick={() => setDetail(row.party)}>{row.party}</button></TableCell>}{visible.includes('amount') && <TableCell className="text-right">{taka(row.amount)}</TableCell>}{visible.includes('status') && <TableCell><StatusBadge dot tone={row.status === 'Paid' ? 'success' : 'warning'}>{text(row.status, row.status === 'Paid' ? 'পরিশোধিত' : 'আংশিক')}</StatusBadge></TableCell>}</TableRow>)}{!rows.length && <TableRow><TableCell colSpan={visible.length} className="py-6 text-center">{text('No matching sample records. Clear filters or change the date range.', 'মিলে এমন নম` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L41) | `<Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) setDialog(null); }}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{dialog === 'columns' ? text('Visible columns', 'দেখানো কলাম') : text('Sample saved views', 'নমুনা সংরক্ষিত ভিউ')}</DialogTitle><DialogDescription>{text('Changes apply to this library example only.', 'পরিবর্তন শুধু এই নমুনায় প্রযোজ্য।')}</DialogDescription></DialogHeader>` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L42) | `{dialog === 'columns' ? <ColumnVisibilityEditor label={text('Sample report columns', 'নমুনা রিপোর্টের কলাম')} columns={columns.map((column) => ({ id: column.id, label: text(column.en, column.bn) }))} value={visible} required={['label']} onChange={setVisible} /> : <div className="space-y-3"><label className="block text-sm text-ink">{text('View name', 'ভিউয়ের নাম')}<Input className="mt-1.5" value={viewName} maxLength={80} onChange={(event) => setViewName(event.target.value)} /></label><Button disabled={!viewName.trim()} onClick={() => { setViews((current) => [...current, { name: viewName.trim(), filters: { ...filters }, columns: [...visible] }]); setViewName(''); }}>{text('Save sample view', 'নমুনা ভিউ সংরক্ষণ')}</Button>{views.map((view, index) => <div key={index} className="flex gap-2 rounded-lg border border-border p-2"><button type="button" className="min-w-0 flex-1 break-words text-l` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L43) | `<DialogFooter><Button variant="outline" onClick={() => setDialog(null)}>{text('Done', 'সম্পন্ন')}</Button></DialogFooter></DialogContent></Dialog>` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/ReportToolbarSpecimen.tsx#L44) | `<Dialog open={detail !== null} onOpenChange={(open) => { if (!open) setDetail(null); }}><DialogContent><DialogHeader><DialogTitle>{detail}</DialogTitle><DialogDescription>{text('Source-detail composition. Closing returns to the same filters and selected columns.', 'উৎসের বিস্তারিত দেখার নমুনা। বন্ধ করলে আগের ফিল্টার ও কলাম থাকবে।')}</DialogDescription></DialogHeader><p className="text-sm text-ink-600">{text('In a business screen this opens the source invoice, party, product, expense or purchase detail through the existing domain editor.', 'ব্যবসার পর্দায় একইভাবে আসল বিল, পক্ষ, পণ্য, খরচ বা কেনাকাটার বিস্তারিত খুলবে।')}</p><Button onClick={() => setDetail(null)}>{text('Back to sample report', 'নমুনা রিপোর্টে ফিরুন')}</Button></DialogContent></Dialog>` |
## src/components/brand/SectionHeader.tsx

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/SectionHeader.tsx#L9) | `export function SectionHeader({ index, title, bn, description }: SectionHeaderProps) {` |
## src/components/brand/TypographySection.tsx

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/TypographySection.tsx#L15) | `export function TypographySection() {` |
## src/components/brand/VisualComponentLibrary.tsx

| Line | Existing declaration / event |
|---|---|
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L40) | `function Field({ label, children, group = false }: { label: string; children: ReactNode; group?: boolean }) {` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L45) | `function ButtonStates() {` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L47) | `const [preview, setPreview] = useState('');` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L48) | `const [choice, setChoice] = useState('regular');` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L49) | `return <div className="space-y-4"><div className="flex flex-wrap gap-2">{(['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const).map((variant) => <Button key={variant} variant={variant} onClick={() => setPreview(variant)}>{variant}</Button>)}<Button variant="outline" size="icon" aria-label={text('Inspect button sample', 'বোতামের নমুনা দেখুন')} onClick={() => setPreview('icon')}><Eye className="size-4" aria-hidden="true" /></Button><Button disabled>{text('Disabled', 'বন্ধ')}</Button><Button disabled aria-busy="true"><LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />{text('Loading sample', 'নমুনা আসছে')}</Button></div><Button data-erp-workflow-action="complete" className="w-full text-[15px] font-semibold" onClick={() => setPreview('48px terminal transaction CTA')}><Plus className="size-4" aria-hidden="true" />{text('Checkou` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L52) | `function CardStates() {` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L57) | `function InputStates() {` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L59) | `const [search, setSearch] = useState('');` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L60) | `const [value, setValue] = useState('');` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L61) | `return <div className="grid gap-4 sm:grid-cols-2"><Field label={text('Search · focus to see the teal halo', 'খুঁজুন · চাপলে ফোকাস দেখাবে')}><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text('Search records, references, people…', 'রেকর্ড, নম্বর, নাম খুঁজুন…')} /></Field><Field label={text('Default editable field', 'সাধারণ ফিল্ড')}><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder={text('Type here', 'এখানে লিখুন')} /></Field><Field label={text('Invalid phone', 'ভুল মোবাইল নম্বর')}><Input type="tel" defaultValue="01711-48" aria-invalid="true" aria-describedby="library-phone-error" /><span id="library-phone-error" className="mt-1 block text-xs text-danger">{text('Enter an 11-digit mobile number.', '১১ সংখ্যার মোবাইল নম্বর দিন।')}</span></Field><Field label={text('Read-only reference', 'শুধু দেখার নম্বর'` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L64) | `function QuantityStates() {` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L66) | `const [amount, setAmount] = useState('1250');` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L67) | `const [unit, setUnit] = useState('Pcs');` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L68) | `const [large, setLarge] = useState('2');` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L69) | `const [small, setSmall] = useState('5');` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L70) | `const [chain, setChain] = useState<Record<string, string>>({ Carton: '1', Box: '2', Pcs: '3', Feet: '10' });` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L72) | `return <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Field label={text('Number with focus/keyboard/wheel stepper', 'সংখ্যা ও বাড়ানো-কমানো')}><NumericInput aria-label={text('Library quantity', 'নমুনা পরিমাণ')} value={large} onChange={(event) => setLarge(event.target.value)} /></Field><Field group label={text('Money + unit', 'টাকা ও একক')}><MoneyUnitInput label={text('Sample price', 'নমুনা দাম')} value={amount} onChange={setAmount} unit={unit} units={['Pcs', 'Box']} onUnitChange={setUnit} /></Field><Field group label={text('Quantity + unit', 'পরিমাণ ও একক')}><QuantityUnitInput label={text('Sample quantity', 'নমুনা পরিমাণ')} value={large} onChange={setLarge} unit={unit} units={['Pcs', 'Box']} onUnitChange={setUnit} /></Field><Field group label={text('Compound large + small units', 'বড় ও ছোট একক')}><CompoundQuantityInput product={product} unit={product.altUnit?.uni` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L75) | `function SelectStates() {` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L77) | `const [value, setValue] = useState('active');` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L78) | `const [entity, setEntity] = useState('hardware');` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L79) | `const [options, setOptions] = useState([{ value: 'hardware', label: 'Hardware · হার্ডওয়্যার' }, { value: 'electrical', label: 'Electrical · ইলেকট্রিক্যাল' }]);` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L80) | `return <div className="space-y-4"><div><p className="mb-1.5 text-[13px] font-medium text-ink">{text('Short fixed list', 'ছোট নির্দিষ্ট তালিকা')}</p><AppSelect label={text('Library status', 'নমুনার অবস্থা')} value={value} onChange={setValue} options={[{ value: 'active', label: text('Active', 'চালু') }, { value: 'inactive', label: text('Inactive', 'বন্ধ') }]} /></div><div><p className="mb-1.5 text-[13px] font-medium text-ink">{text('Search + inline Add new', 'খুঁজুন ও নতুন যোগ করুন')}</p><SearchSelect id="library-entity" noun={{ en: 'category', bn: 'ক্যাটাগরি' }} ariaLabel={text('Library category', 'নমুনা ক্যাটাগরি')} value={entity} options={options} onChange={setEntity} onCreate={(name) => { const id = 'sample-' + options.length; setOptions((current) => [...current, { value: id, label: name }]); return id; }} /></div><p className="text-xs leading-5 text-ink-500">{text('Try a missing name,` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L83) | `function DateStates() {` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L85) | `const [date, setDate] = useState('2026-10-26');` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L86) | `const [range, setRange] = useState({ from: '2026-09-27', to: '2026-10-26' });` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L87) | `return <div className="space-y-4"><div><p className="mb-1.5 text-[13px] font-medium text-ink">{text('Single date', 'একটি তারিখ')}</p><AppDatePicker value={date} onChange={setDate} label={text('Library single date', 'নমুনা এক তারিখ')} /></div><div><p className="mb-1.5 text-[13px] font-medium text-ink">{text('Two-month range with presets', 'দুই মাস ও তারিখের সীমা')}</p><AppDateRangePicker value={range} onChange={setRange} label={text('Library date range', 'নমুনা তারিখের সীমা')} /></div><p className="text-xs text-ink-500">{range.from} → {range.to}</p></div>;` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L90) | `function OverlayStates() {` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L92) | `const [dialog, setDialog] = useState('');` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L93) | `const [enabled, setEnabled] = useState(true);` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L94) | `return <div className="space-y-5"><div className="flex flex-wrap items-center gap-4"><span className="inline-flex items-center gap-1"><ReportLabel en="Status" bn="অবস্থা" /><ReportHelp guide="status" label={text('Status', 'অবস্থা')} /></span><span className="inline-flex items-center gap-1"><ReportLabel en="Comparison" bn="তুলনা" /><ReportHelp guide="compare" label={text('Period comparison', 'সময়ের তুলনা')} /></span></div><p className="text-xs leading-5 text-ink-500">{text('Focus, tap or hover the information icon. Bilingual mode shows English, a divider, then Bangla.', 'তথ্যের আইকনে চাপুন। দুই ভাষায় ইংরেজি, বিভাজক ও বাংলা দেখা যাবে।')}</p><div className="flex flex-wrap gap-2"><Button onClick={() => setDialog(text('Review sample', 'নমুনা দেখুন'))}><Eye className="size-4" aria-hidden="true" />{text('Open modal', 'ডায়ালগ খুলুন')}</Button><FloatingPanel label={text('Library More menu', 'ন` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L97) | `function FutureStates() {` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L99) | `const [kind, setKind] = useState<FeedbackKind>('no-results');` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L100) | `const [advanced, setAdvanced] = useState(false);` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L109) | `return <div className="space-y-4"><AppSelect label={text('Feedback state', 'অবস্থার নমুনা')} value={kind} onChange={(value) => setKind(value as FeedbackKind)} options={Object.entries(copy).map(([value, labels]) => ({ value, label: text(labels[0], labels[1]) }))} /><FeedbackState kind={kind} title={text(title, titleBn)} description={text(description, descriptionBn)} action={kind === 'error'  /  /  kind === 'no-results' ? { label: text(kind === 'error' ? 'Retry sample' : 'Clear sample filters', kind === 'error' ? 'আবার চেষ্টা করুন' : 'নমুনা ফিল্টার মুছুন'), onClick: () => setKind('empty') } : undefined} /><Disclosure id="library-advanced" en="Advanced options" bn="আরও সেটিংস" summary={text('Rare settings stay collapsed until needed.', 'কম ব্যবহারের সেটিংস দরকারে খুলুন।')} open={advanced} onToggle={() => setAdvanced((value) => !value)}><p className="p-4 text-sm text-ink-600">{text('Compose futu` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L112) | `function UploadStates() {` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L114) | `const [photos, setPhotos] = useState<string[]>([]);` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L117) | `return <div><PhotoUploader photos={photos} max={2} label={text('Add sample photo', 'নমুনা ছবি যোগ')} onChange={(next) => { photos.filter((url) => !next.includes(url)).forEach((url) => URL.revokeObjectURL(url)); setPhotos(next); }} hint={text('Local image preview only; no file is uploaded.', 'শুধু এই ব্রাউজারে ছবি দেখা যাবে। আপলোড হয় না।')} /><p className="mt-3 text-xs text-ink-500">{text('Current uploader has some legacy English thumbnail labels; this source gap remains visible for later localization.', 'ছবির ছোট কিছু লেখা এখনো ইংরেজি। পরের ভাষার আপডেটে ঠিক করতে হবে।')}</p></div>;` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L120) | `function FinancialSettingsSpecimen(){const [value,setValue]=useState(financialDefaults);const[tab,setTab]=useState('editor');return <div className="grid min-w-0 gap-4 lg:grid-cols-[215px_minmax(0,1fr)]"><SettingsTabs secondary id="library-settings-tabs" panelId="library-settings-panel" label="Settings navigation specimen" value={tab} onChange={setTab} items={[{id:'editor',label:'Names & Khata',bn:'হিসাবের নাম'},{id:'notes',label:'Navigation behavior',bn:'নেভিগেশনের নিয়ম'}]}/><div id="library-settings-panel" role="tabpanel" aria-labelledby={ʼlibrary-settings-tabs-${tab}ʼ} className="min-w-0">{tab==='editor'?<FinancialTerminologySettings value={value} onChange={setValue} disabled={false} language="English + Bangla"/>:<p className="text-sm text-helper">Party viewport bands: phone below 768px, tablet 768–1023px, desktop from 1024px. Sub-settings move to the left only on desktop. Use arrows ` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L122) | `function Library() {` |
| [124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L124) | `const [search, setSearch] = useState('');` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L125) | `const [category, setCategory] = useState('all');` |
| [131](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L131) | `<label className="mb-4 block text-[13px] font-medium text-ink">{text('Find a visual component', 'দেখে উপাদান খুঁজুন')}<span className="relative mt-1.5 block"><Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" /><Input type="search" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={text('Search calendar, role, tooltip, quantity, loading…', 'ক্যালেন্ডার, পক্ষ, সহায়তা, পরিমাণ খুঁজুন…')} /></span></label>` |
| [132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L132) | `<div className="mb-5 overflow-x-auto border-b border-border"><MotionTabList aria-label={text('Component families', 'উপাদানের ধরন')} className="flex min-w-max gap-3">{categories.map((item, index) => <button type="button" role="tab" key={item.id} id={'library-tab-' + item.id} aria-controls="library-specimens" aria-selected={category === item.id} tabIndex={category === item.id ? 0 : -1} onClick={() => setCategory(item.id)} onKeyDown={(event) => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? categories.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : categories.length - 1)) % categories.length; setCategory(categories[next].id); document.getElementById('library-tab-' + categories[next].id)?.focus(); }} className={'relative whitespace-nowrap px-2 py-3 text-[13px] font-me` |
| [141](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VisualComponentLibrary.tsx#L141) | `export function VisualComponentLibrary() {` |
## src/components/brand/VoiceSection.tsx

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VoiceSection.tsx#L6) | `function MisuseTile({ id }: {id: string;}) {` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/VoiceSection.tsx#L52) | `export function VoiceSection() {` |
## src/components/brand/printReceipt.tsx

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/printReceipt.tsx#L9) | `export function receiptPrintHtml(props: ReceiptPreviewProps, styles: Array<{css?: string;href?: string}> = [], baseUrl = ''): string {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/brand/printReceipt.tsx#L22) | `export function printReceipt(props: ReceiptPreviewProps, target?: Window): boolean {` |
## src/components/import/ImportFinishStep.tsx

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportFinishStep.tsx#L6) | `export function ImportFinishStep({result,rows,onAnother,onView}:{` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportFinishStep.tsx#L24) | `{rejectedRows.length>0&&<Button variant="outline" onClick={()=>` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportFinishStep.tsx#L27) | `<Button variant="outline" onClick={onAnother}>{text('Import another file','আরেকটি ফাইল আনুন')}</Button>` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportFinishStep.tsx#L28) | `<Button onClick={onView}>{text('View records','তালিকা দেখুন')}</Button>` |
## src/components/import/ImportMappingStep.tsx

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportMappingStep.tsx#L6) | `export function ImportMappingStep({target,table,mapping,onMapping}:{` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportMappingStep.tsx#L19) | `onChange={v=>onMapping({...mapping,[f.key]:v==='none'?null:Number(v)})}` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportMappingStep.tsx#L28) | `<AppSelect compact label={fieldLabel(f.label,f.labelBn??f.label)} value="none" onChange={v=>onMapping({...mapping,[f.key]:v==='none'?null:Number(v)})}` |
## src/components/import/ImportReviewStep.tsx

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L15) | `function partyOpeningPreview(row:StagedImportRow,target:'customer' / 'supplier',language:UiLanguage):string / null {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L24) | `function productConversion(row:StagedImportRow,language:UiLanguage):string / null {` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L41) | `export function ImportReviewStep({target,rows,onRowsChange}:{` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L45) | `const [query,setQuery]=useState('');` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L46) | `const [filter,setFilter]=useState<Filter>('all');` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L47) | `const [editing,setEditing]=useState<number / null>(null);` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L48) | `const [draft,setDraft]=useState<Record<string,string>>({});` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L60) | `const save=(row:StagedImportRow)=>{` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L80) | `<Button key={value} type="button" size="sm" variant={filter===value?'default':'outline'} onClick={()=>setFilter(value)}>` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L86) | `onChange={e=>setQuery(e.target.value)} className="pl-8"/>` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L114) | `onChange={event=>setDraft(prev=>({...prev,[key]:event.target.value}))}/>` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L118) | `<Button size="sm" type="button" variant="outline" onClick={()=>{setEditing(null);setDraft({});}}>{text('Cancel edit','সম্পাদনা বাতিল')}</Button>` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L119) | `<Button size="sm" type="button" onClick={()=>save(row)}>{text('Save row','সারি রাখুন')} {row.sourceRow}</Button>` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L128) | `onChange={value=>onRowsChange(rows.map(item=>item===row?{...item,decision:value as StagedImportRow['decision']}:item))}/>` |
| [136](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L136) | `onChange={value=>onRowsChange(rows.map(item=>item===row?{...item,decision:value as StagedImportRow['decision']}:item))}/>` |
| [137](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L137) | `</div>:<Button size="sm" type="button" variant="outline" onClick={()=>skip(row)}>` |
| [140](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportReviewStep.tsx#L140) | `<Button size="sm" type="button" variant="outline" onClick={()=>begin(row)}` |
## src/components/import/ImportUploadStep.tsx

| Line | Existing declaration / event |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportUploadStep.tsx#L11) | `export function ImportUploadStep({target,tables,selected,onRead,onSelect,onError}:{` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportUploadStep.tsx#L16) | `const [busy,setBusy]=useState(false);` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportUploadStep.tsx#L36) | `<Button size="sm" variant="outline" type="button" onClick={()=>void download('csv')}><Download className="size-3.5"/> {text('Download CSV template','CSV নমুনা নামান')}</Button>` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportUploadStep.tsx#L37) | `<Button size="sm" variant="outline" type="button" onClick={()=>void download('xlsx')}><Download className="size-3.5"/> {text('Download Excel template','Excel নমুনা নামান')}</Button>` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportUploadStep.tsx#L47) | `disabled={busy} onChange={e=>void onFile(e.currentTarget.files?.[0])}/>` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportUploadStep.tsx#L52) | `<AppSelect label={text('Excel worksheet','Excel-এর শিট')} value={selected?.sheet??''} onChange={onSelect}` |
## src/components/import/ImportWizard.tsx

| Line | Existing declaration / event |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L14) | `export function ImportWizard({target,open,onClose,onApply,prepareRows}:{` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L20) | `const [step,setStep]=useState<ImportStep>('upload');` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L21) | `const [tables,setTables]=useState<ImportTable[]>([]);` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L22) | `const [sheet,setSheet]=useState('');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L23) | `const [mapping,setMapping]=useState<ColumnMapping>({});` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L24) | `const [rows,setRows]=useState<StagedImportRow[]>([]);` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L25) | `const [result,setResult]=useState<ImportResult / null>(null);` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L26) | `const [error,setError]=useState('');` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L27) | `const [busy,setBusy]=useState(false);` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L67) | `return <Dialog open={open} onOpenChange={value=>{if(!value&&!busy)onClose();}}>` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L82) | `{step==='upload'&&<ImportUploadStep target={target} tables={tables} selected={current} onRead={read} onSelect={selectSheet} onError={setError}/>}` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L87) | `<Button type="button" variant="outline" disabled={busy} onClick={onClose}>{text('Cancel','বাতিল')}</Button>` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L89) | `{step!=='upload'&&<Button type="button" variant="outline" onClick={previous}>{text('Back','আগে')}</Button>}` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L90) | `{step==='upload'&&<Button type="button" disabled={!current?.headers.length} onClick={()=>void next()}>{text('Next: Map columns','পরের ধাপ: কলাম মেলান')}</Button>}` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L91) | `{step==='map'&&<Button type="button" onClick={()=>void next()}>{text('Next: Review','পরের ধাপ: যাচাই')}</Button>}` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/import/ImportWizard.tsx#L92) | `{step==='review'&&<Button type="button" disabled={!onApply /  / busy /  / !rows.some(row=>row.decision!=='skip'&&row.decision!=='reject') /  / rows.some(row=>row.decision!=='skip'&&row.issues.some(i=>i.severity==='error'))} onClick={()=>void next()}>` |
## src/components/online/FulfillmentDocumentPreview.tsx

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/online/FulfillmentDocumentPreview.tsx#L8) | `export function FulfillmentDocumentPreview({order,kind}:{order:OnlineOrder;kind:FulfillmentDocument}){` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/online/FulfillmentDocumentPreview.tsx#L63) | `export function printFulfillment(kind:FulfillmentDocument){` |
## src/components/recycle/RecoveryDetails.tsx

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecoveryDetails.tsx#L18) | `export function RecoveryDetails({record}:{record:RecoveryRecord}){` |
## src/components/recycle/RecoverySpecimen.tsx

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecoverySpecimen.tsx#L6) | `export function RecoverySpecimen(){const [store]=useState(()=>{const store=createRecoveryStore();const records=new Map([['sample-draft',{id:'sample-draft',name:'Library draft'}]]);store.register({kind:'sales-draft',module:'sales',tenantId:'library',get:id=>records.get(id),label:p=>p.name,revision:JSON.stringify,checkRestore:p=>{if(records.has(p.id))throw Error('The sample identity already exists.');},remove:id=>{records.delete(id);},restore:p=>{records.set(p.id,p);}});return store;});return <div className="space-y-3"><p className="text-xs text-helper">Isolated library sample. Delete, details, restore, filters and owner purge use the same recovery service as the app.</p><Button variant="outline" onClick={()=>{try{store.delete('sales-draft','sample-draft',context);}catch{/* The sample is already deleted; restore it to repeat. */}}}>Delete sample draft</Button><RecycleBinList store={store} ` |
## src/components/recycle/RecycleBinList.tsx

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L6) | `import {useId,useState,useSyncExternalStore} from 'react';` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L19) | `export function RecycleBinList({store=recoveryStore,context}:{store?:ReturnType<typeof createRecoveryStore>;context?:RecoveryContext}={}){` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L21) | `const actualContext=useRecoveryContext(),ctx=context??actualContext,{text}=useUiCopy();useSyncExternalStore(store.subscribe,store.snapshot);` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L22) | `const [query,setQuery]=useState(''),[module,setModule]=useState('all'),[status,setStatus]=useState('deleted'),[selected,setSelected]=useState<string[]>([]),[detail,setDetail]=useState<RecoveryRecord / null>(null),[purge,setPurge]=useState<RecoveryRecord / null>(null),[confirmation,setConfirmation]=useState(''),[outcomes,setOutcomes]=useState<Record<string,string>>({});` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L23) | `const [restoreResults,setRestoreResults]=useState<Array<{deletionId:string;label:string;error?:string}>>([]);` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L28) | `const restore=(ids:string[])=>{` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L43) | `{[["all",text('All modules','সব বিভাগ')],["sales",text('Sales','বিক্রয়')],["purchases",text('Purchases','ক্রয়')],["quotations",text('Quotations','মূল্য প্রস্তাব')],["online",text('Online','অনলাইন')],["products",text('Products','পণ্য')],["parties",text('Parties & Notes','পার্টি ও নোট')]].map(([id,label])=><Button key={id} id={ʼ${tabsId}-tab-${id}ʼ} aria-controls={ʼ${tabsId}-panelʼ} role="tab" aria-selected={module===id} tabIndex={module===id?0:-1} className="relative" variant="ghost" onClick={()=>change(()=>setModule(id))} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const parent=e.currentTarget.parentElement;if(!parent)return;const tabs=Array.from(parent.querySelectorAll<HTMLButtonElement>('[role=tab]'));const index=tabs.indexOf(e.currentTarget);tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+t` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L47) | `<div className="min-w-48 flex-1"><Input aria-label={text('Search deleted records','মুছে ফেলা তথ্য খুঁজুন')} placeholder={text('Search deleted records','মুছে ফেলা তথ্য খুঁজুন')} value={query} onChange={e=>change(()=>setQuery(e.target.value))}/></div>` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L49) | `<AppSelect label={text('Status','অবস্থা')} value={status} onChange={v=>change(()=>setStatus(v))} options={[['deleted',text('Deleted','মুছে ফেলা')],['restored',text('Restored','ফিরিয়ে আনা')],['expired',text('Expired','মেয়াদ শেষ')],['purged',text('Permanently deleted','স্থায়ীভাবে মুছে ফেলা')],['all',text('All statuses','সব অবস্থা')]].map(([value,label])=>({value,label}))}/>` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L50) | `<Button variant="outline" disabled={!selected.length} onClick={()=>restore(rows.filter(r=>selected.includes(r.deletionId)&&eligible(r)).map(r=>r.deletionId))}>{text('Restore selected','নির্বাচিত তথ্য ফেরান')} ({selected.length})</Button>` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L53) | `{rows.map(r=><TableRow key={r.deletionId}><TableCell><input type="checkbox" aria-label={ʼ${text('Select','নির্বাচন')} ${r.label}ʼ} checked={selected.includes(r.deletionId)} disabled={!eligible(r)} onChange={e=>setSelected(ids=>e.target.checked?[...ids,r.deletionId]:ids.filter(id=>id!==r.deletionId))}/></TableCell><TableCell>{r.label}<p data-table-helper>{recoveryKind(r.kind,text)} · {actorName(r.deletedBy)}</p></TableCell><TableCell>{recoveryDisplayDate(r.deletedAt)}<p data-table-helper>{recoveryDisplayDate(r.expiresAt)}</p></TableCell><TableCell>{r.state==='deleted'&&Date.now()>=Date.parse(r.expiresAt)?text('Expired','মেয়াদ শেষ'):r.state==='deleted'?text('Deleted','মুছে ফেলা'):r.state==='restored'?text('Restored','ফেরানো'):text('Purged','স্থায়ীভাবে মোছা')} {outcomes[r.deletionId]&&<p role="status" data-table-helper>{outcomes[r.deletionId]}</p>}</TableCell><TableCell><div className="fl` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L57) | `<Dialog open={!!detail} onOpenChange={v=>!v&&setDetail(null)}><DialogContent><DialogHeader><DialogTitle>{detail?.label}</DialogTitle><DialogDescription>{text('Recovery details · original source identity','উদ্ধারের বিবরণ · আগের পরিচয়')}</DialogDescription></DialogHeader>{detail&&<RecoveryDetails record={detail}/>}<DialogFooter><Button variant="outline" onClick={()=>setDetail(null)}>{text('Close','বন্ধ')}</Button></DialogFooter></DialogContent></Dialog>` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/recycle/RecycleBinList.tsx#L58) | `<Dialog open={!!purge} onOpenChange={v=>!v&&setPurge(null)}><DialogContent><DialogHeader><DialogTitle>{text('Delete permanently?','স্থায়ীভাবে মুছবেন?')}</DialogTitle><DialogDescription>{text('This preview payload cannot be restored. Type the displayed record name to confirm.','এই প্রিভিউ তথ্য আর ফেরানো যাবে না। নিশ্চিত করতে নিচের নাম লিখুন।')}</DialogDescription></DialogHeader><label className="text-sm">{purge?.label}<Input aria-label={text('Confirmation text','নিশ্চিতকরণের লেখা')} value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label>{purge&&outcomes[purge.deletionId]&&<p role="alert">{outcomes[purge.deletionId]}</p>}<DialogFooter><Button variant="outline" onClick={()=>setPurge(null)}>{text('Cancel','বাতিল')}</Button><Button variant="destructive" disabled={confirmation!==purge?.label} onClick={()=>{if(!purge)return;try{store.purge(purge.deletionId,ctx,confirmation` |
## src/components/reports/BusinessReview.tsx

| Line | Existing declaration / event |
|---|---|
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L48) | `export function BusinessReview({data}:{data:ReportData}){` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L50) | `const [mode,setMode]=useState<ReviewMode>('monthly');` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L51) | `const [month,setMonth]=useState(data.asOf.slice(0,7));` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L52) | `const [year,setYear]=useState(data.asOf.slice(0,4));` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L53) | `const [range,setRange]=useState({from:data.asOf.slice(0,7)+'-01',to:data.asOf});` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L54) | `const [active,setActive]=useState<Tab>('summary');` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L55) | `const [detail,setDetail]=useState<ReportRow / null>(null);` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L56) | `const [drafts,setDrafts]=useState<SessionDraft[]>([]);` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L80) | `{m.source.length>0&&<Button variant="ghost" size="sm" onClick={()=>show(key,m)}><SearchCheck className="size-3.5"/>{text('View evidence','মূল রেকর্ড')}</Button>}` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L100) | `const saveSession=()=>{` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L108) | `<AppSelect label={text('Audit period','অডিটের সময়কাল')} value={mode} onChange={v=>setMode(v as ReviewMode)}` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L113) | `<AppMonthYearPicker mode="month" value={month} maxDate={data.asOf} label={text('Choose month','মাস বাছুন')} onChange={setMonth} className="w-[170px]"/>` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L117) | `<AppMonthYearPicker mode="year" value={year} maxDate={data.asOf} label={text('Choose year','বছর বাছুন')} onChange={setYear} className="w-[135px]"/>` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L119) | `{mode==='custom'&&<AppDateRangePicker label={text('Date range','সময়কাল')} value={range} onChange={setRange}/>}` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L125) | `{tabs.map(t=><button type="button" role="tab" key={t.key} aria-selected={active===t.key} className={'relative h-9 shrink-0 whitespace-nowrap px-3 text-[13px] font-medium '+(active===t.key?'text-primary':'text-ink-500 hover:text-ink')} onClick={()=>setActive(t.key)}>` |
| [142](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L142) | `<Button variant="outline" size="sm" onClick={()=>setDetail({id:'review-priority-'+p.id,label:p.title,labelBn:p.titleBn,date:'',status:'Needs review',values:{},note:p.description,children:p.source})}>{text('Evidence','মূল তথ্য')}</Button>` |
| [155](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L155) | `<Button variant="outline" onClick={csv}><ArrowDownToLine className="size-4"/>{text('Export CSV','সিএসভি নামান')}</Button>` |
| [162](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L162) | `<button type="button" className="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-primary" onClick={()=>show(k,m.metrics[k],m.month)}>{display(m.metrics[k])}</button>:<span className="text-ink-500">{display(m.metrics[k])}</span>}</TableCell>)}` |
| [173](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L173) | `<div className="flex flex-wrap gap-2"><Button onClick={()=>printDraft()}><Printer className="size-4"/>{text('Print 5-page A4 audit report','৫ পাতার A4 অডিট রিপোর্ট প্রিন্ট')}</Button>` |
| [174](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L174) | `<Button variant="outline" onClick={()=>printDraft(true)}><FileText className="size-4"/>{text('Print monthly schedule','মাসভিত্তিক বিবরণ প্রিন্ট')}</Button>` |
| [175](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L175) | `<Button variant="outline" onClick={csv}><ArrowDownToLine className="size-4"/>{text('Download CSV','সিএসভি নামান')}</Button>` |
| [176](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/BusinessReview.tsx#L176) | `<Button variant="outline" onClick={saveSession}><Save className="size-4"/>{text('Keep draft this session','এই সেশনে খসড়া রাখুন')}</Button>` |
## src/components/reports/DaybookDialog.tsx

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/DaybookDialog.tsx#L8) | `export function DaybookDialog({ open, onOpenChange }: {open: boolean;onOpenChange: (o: boolean) => void;}) {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/DaybookDialog.tsx#L13) | `<Dialog open={open} onOpenChange={onOpenChange}>` |
## src/components/reports/ReportAnalysis.tsx

| Line | Existing declaration / event |
|---|---|
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportAnalysis.tsx#L47) | `export function ReportAnalysis(props: ReportAnalysisProps) {` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportAnalysis.tsx#L153) | `onClick={() =>` |
| [312](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportAnalysis.tsx#L312) | `<Button onClick={() => onScreen("buying")}>` |
| [316](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportAnalysis.tsx#L316) | `<Button variant="outline" onClick={() => onReport("stock-movements")}>` |
| [319](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportAnalysis.tsx#L319) | `<Button variant="outline" onClick={() => onReport("stock-ageing")}>` |
| [484](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportAnalysis.tsx#L484) | `onClick={() => onReport("product-profit")}` |
| [533](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportAnalysis.tsx#L533) | `onClick={(point) => point.row && onDetail(point.row)}` |
## src/components/reports/ReportDetails.tsx

| Line | Existing declaration / event |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportDetails.tsx#L17) | `export function ReportDetails({row,onClose,onPrint}:{row:ReportRow;onClose:()=>void;onPrint:(row:ReportRow)=>void}){` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportDetails.tsx#L18) | `const {text,language}=useUiCopy(),navigate=useNavigate(),[trail,setTrail]=useState([row]);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportDetails.tsx#L21) | `return <Dialog open onOpenChange={open=>!open&&onClose()}>` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportDetails.tsx#L24) | `{trail.length>1&&<Button variant="ghost" className="w-fit" onClick={()=>setTrail(v=>v.slice(0,-1))}><ArrowLeft className="size-4" aria-hidden="true"/>{text('Back to summary','সারাংশে ফিরুন')}</Button>}` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportDetails.tsx#L31) | `<TableBody>{current.children.map(child=><TableRow key={child.id}><TableCell className="px-3 py-2 whitespace-normal"><button type="button" className="whitespace-normal text-left text-sm font-medium leading-6 text-primary hover:underline" onClick={()=>setTrail(v=>[...v,child])}>{language==='Bangla'?(child.labelBn??child.label):child.label}</button></TableCell><TableCell className="px-3 py-2 text-sm text-ink-600">{formatReportCell(child,'date',language)}</TableCell><TableCell className="px-3 py-2 text-right text-sm font-medium">{formatReportCell(child,'amount',language)}</TableCell></TableRow>)}</TableBody>` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportDetails.tsx#L35) | `<Button variant="outline" onClick={()=>onPrint(current)}><Printer className="size-4" aria-hidden="true"/>{text('Print details','বিস্তারিত প্রিন্ট')}</Button>` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportDetails.tsx#L36) | `{current.route&&<Button variant="outline" onClick={()=>{const path=current.route;if(path){onClose();navigate(path);}}}><ExternalLink className="size-4" aria-hidden="true"/>{text('Open source module','মূল মডিউল খুলুন')}</Button>}` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportDetails.tsx#L37) | `<Button onClick={onClose}>{text('Close details','বিস্তারিত বন্ধ করুন')}</Button>` |
## src/components/reports/ReportEvidencePanel.tsx

| Line | Existing declaration / event |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportEvidencePanel.tsx#L17) | `export function ReportEvidencePanel({` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportEvidencePanel.tsx#L42) | `<Button variant="ghost" onClick={onOpen}>` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportEvidencePanel.tsx#L75) | `onClick={() => onDetail(row)}` |
## src/components/reports/ReportGuidance.tsx

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportGuidance.tsx#L6) | `export function ReportLabel({en,bn,className=''}:{en:string;bn:string;className?:string}){` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportGuidance.tsx#L10) | `export function ReportHelp({guide,label}:{guide:string;label?:string}){` |
## src/components/reports/ReportOverview.tsx

| Line | Existing declaration / event |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportOverview.tsx#L14) | `export function ReportOverview({data,filters,current,previous,onReport,onDetail}:{data:ReportData;filters:ReportFilters;current:ReportResult;previous:ReportResult / null;onReport:(key:ReportKey)=>void;onDetail:(r:ReportRow)=>void}){` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportOverview.tsx#L47) | `<button type="button" aria-label={text('Open '+card.en,card.bn+' দেখুন')} onClick={()=>onDetail({id:'summary-'+card.en,label:text(card.en,card.bn),date:data.asOf,status:'Demo data',values:{amount:card.value},note:text(card.note,card.noteBn),children:runReport(card.key,data,related).rows})} className="block h-auto min-h-0 w-full rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportOverview.tsx#L60) | `<ul className="divide-y divide-border">{alerts.map(a=><li key={a.key}><button type="button" className="flex h-auto min-h-0 w-full items-start gap-3 rounded-lg px-2.5 py-3 text-left hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={()=>onReport(a.key)}><span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-ink">{text(a.en,a.bn)}</span><span className="mt-0.5 block text-xs text-ink-500">{text(a.hint,a.hintBn)}</span></span><StatusBadge tone={a.count===0?'neutral':a.key==='expiry'?'danger':'warning'}>{formatNumber(a.count)}</StatusBadge></button></li>)}</ul>` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportOverview.tsx#L64) | `<Panel title={text('Leading products','বেশি বিক্রি হওয়া পণ্য')} actions={<Button variant="ghost" size="sm" onClick={()=>onReport('product-sales')}>{text('View report','রিপোর্ট দেখুন')}<ArrowRight className="size-3" aria-hidden="true"/></Button>} bodyClassName="px-4 py-1">` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportOverview.tsx#L65) | `{top.length?<ul className="divide-y divide-border">{top.map(r=><li key={r.id}><button type="button" className="flex h-auto min-h-0 w-full items-center justify-between gap-3 py-3 text-left hover:text-primary" onClick={()=>onDetail(r)}><span className="min-w-0 text-[13px] text-ink">{language==='Bangla'?(r.labelBn??r.label):r.label}</span><span className="whitespace-nowrap text-sm font-medium text-ink">{taka(Number(r.values.amount))}</span></button></li>)}</ul>:<p className="py-4 text-sm text-ink-500">{text('No product sales in this selection.','এই ফিল্টারে পণ্যের বিক্রয় নেই।')}</p>}` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportOverview.tsx#L67) | `<Panel title={text('Expense categories','খরচের খাত')} actions={<Button variant="ghost" size="sm" onClick={()=>onReport('expense-categories')}>{text('View report','রিপোর্ট দেখুন')}<ArrowRight className="size-3" aria-hidden="true"/></Button>} bodyClassName="px-4 py-1">` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportOverview.tsx#L68) | `{expenseRows.length?<ul aria-label={text('Expense categories','খরচের খাত')} className="divide-y divide-border">{expenseRows.map(r=><li key={r.id}><button type="button" className="flex h-auto min-h-0 w-full items-center justify-between gap-3 py-3 text-left hover:text-primary" onClick={()=>onDetail(r)}><span className="text-[13px] text-ink">{text(r.label,r.label==='Salary'?'বেতন':r.label==='Rent'?'ভাড়া':r.label==='Transport'?'পরিবহন':r.label==='Utilities'?'বিদ্যুৎ-পানি':r.label==='Maintenance'?'মেরামত':r.label==='Tea & Snacks'?'চা-নাস্তা':r.label)}</span><span className="text-sm font-medium text-ink">{taka(Number(r.values.amount))}</span></button></li>)}</ul>:<p className="py-4 text-sm text-ink-500">{text('No recorded expenses in this period.','এই সময়কালে লেখা খরচ নেই।')}</p>}` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportOverview.tsx#L72) | `<div className="flex flex-wrap gap-2">{(['cash-book','stock','payables','warranty'] as ReportKey[]).map(k=><Button key={k} variant="outline" onClick={()=>onReport(k)}>{text(reportDefinition(k).en,reportDefinition(k).bn)}<ArrowRight className="size-3" aria-hidden="true"/></Button>)}</div>` |
## src/components/reports/ReportResults.tsx

| Line | Existing declaration / event |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportResults.tsx#L16) | `export function formatReportCell(row:ReportRow,key:string,language:string):string{` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportResults.tsx#L29) | `export function ReportResults({definition,result,filters,onChange,visible,onDetail,page,setPage,pageSize,setPageSize}:{` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportResults.tsx#L42) | `<div className="inline-flex items-center gap-1"><button type="button" className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium leading-4 text-ink-600 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={()=>onChange({...filters,sort:k,direction:filters.sort===k&&filters.direction==='asc'?'desc':'asc'})}>` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportResults.tsx#L49) | `{k==='label'?<button type="button" onClick={()=>onDetail(row)} className="max-w-full whitespace-nowrap text-left font-medium leading-6 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{formatReportCell(row,k,language)}</button>:` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportResults.tsx#L62) | `<AppSelect label={text('Rows per page','প্রতি পাতায় রেকর্ড')} value={String(pageSize)} options={['10','25','50']} className="w-20" onChange={v=>{setPageSize(Number(v));setPage(1);}}/>` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportResults.tsx#L63) | `<Button variant="outline" size="icon" aria-label={text('Previous page','আগের পাতা')} disabled={current<=1} onClick={()=>setPage(current-1)}><ChevronLeft className="size-4"/></Button>` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportResults.tsx#L65) | `<Button variant="outline" size="icon" aria-label={text('Next page','পরের পাতা')} disabled={current>=pages} onClick={()=>setPage(current+1)}><ChevronRight className="size-4"/></Button>` |
## src/components/reports/ReportSalesTrend.tsx

| Line | Existing declaration / event |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportSalesTrend.tsx#L16) | `export function ReportSalesTrend({` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportSalesTrend.tsx#L70) | `onClick={() => onDetail(evidence)}` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportSalesTrend.tsx#L90) | `onClick={(state) => {` |
## src/components/reports/ReportToolbar.tsx

| Line | Existing declaration / event |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L17) | `export function ReportToolbar({definition,filters,options,onChange,onColumns,onSaved,asOf}:{` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L21) | `const {text,language}=useUiCopy(),id=useId();const [expanded,setExpanded]=useState(false);` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L27) | `return <WorkspaceToolbar search={<Input type="search" aria-label={text('Search report records','রিপোর্টের রেকর্ড খুঁজুন')} placeholder={text('Search records, references, people…','রেকর্ড, নম্বর, নাম খুঁজুন…')} value={filters.search} onChange={e=>onChange({...filters,search:e.target.value})}/>} details={<>` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L32) | `{f.key==='status' /  / f.key==='user'?<AppSelect label={text(f.en,f.bn)} value={filters[f.key]} options={[{value:'',label:text('All','সব')},...(options[f.key]??[]).map(o=>({...o,label:reportPhrase(o.label,language)}))]} onChange={v=>onChange({...filters,[f.key]:v})}/>:` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L33) | `<SearchSelect id={id+'-'+f.key} noun={{en:f.en,bn:f.bn}} ariaLabel={text(f.en,f.bn)} value={filters[f.key]} options={[{value:'',label:text('All','সব')},...(options[f.key]??[]).map(o=>({...o,label:reportPhrase(o.label,language)}))]} onChange={v=>onChange({...filters,[f.key]:v})}/>}` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L38) | `{selected.map(f=><Button key={f.key} variant="outline" size="sm" onClick={()=>onChange({...filters,[f.key]:''})} aria-label={text('Clear '+f.en,f.bn+' মুছুন')}>{text(f.en,f.bn)}: {reportPhrase(options[f.key]?.find(o=>o.value===filters[f.key])?.label??filters[f.key],language)}<X className="size-3" aria-hidden="true"/></Button>)}` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L39) | `{(selected.length>0 /  / filters.search)&&<Button variant="ghost" size="sm" onClick={()=>onChange({...filters,search:'',category:'',brand:'',product:'',party:'',user:'',account:'',status:''})}>{text('Clear filters','ফিল্টার মুছুন')}</Button>}` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L42) | `{!definition.snapshot&&<AppDateRangePicker label={text('Report date range','রিপোর্টের সময়কাল')} value={{from:validDay(filters.from)?filters.from:'',to:validDay(filters.to)?filters.to:''}} onChange={r=>onChange({...filters,...r})} className="max-w-full"/>}` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L43) | `{!definition.snapshot&&<div className="flex items-center"><AppSelect label={text('Compare','তুলনা')} value={filters.compare} className="w-40" options={[{value:'none',label:text('No comparison','তুলনা ছাড়া')},{value:'previous',label:text('Previous period','আগের সময়কাল')}]} onChange={v=>onChange({...filters,compare:v==='previous'?'previous':'none'})}/><ReportHelp guide="compare" label={text('Period comparison','সময়ের তুলনা')}/></div>}` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L44) | `<Button variant="outline" onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded} aria-controls={id}><SlidersHorizontal className="size-4" aria-hidden="true"/>{text('Filters','ফিল্টার')}{selected.length>0&&<span className="text-primary">({selected.length})</span>}</Button>` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L45) | `<Button variant="outline" onClick={onColumns}><Columns3 className="size-4" aria-hidden="true"/>{text('Columns','কলাম')}</Button>` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportToolbar.tsx#L46) | `<Button variant="outline" onClick={onSaved}><Bookmark className="size-4" aria-hidden="true"/>{text('Saved views','সংরক্ষিত ভিউ')}</Button>` |
## src/components/reports/ReportsNav.tsx

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportsNav.tsx#L8) | `export function ReportsNav({` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportsNav.tsx#L46) | `onClick={() => onChange(item.id)}` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/ReportsNav.tsx#L47) | `onKeyDown={(event) => {` |
## src/components/reports/SalesProfitExperiment.tsx

| Line | Existing declaration / event |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/SalesProfitExperiment.tsx#L25) | `export function SalesProfitExperiment({data,definition,result,filters,visible,options,onFilters,onSelectReport,onColumns,onSaved,onDetail,onOriginal,page,setPage,pageSize,setPageSize}:Props){` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/SalesProfitExperiment.tsx#L27) | `const [summaryOpen,setSummaryOpen]=useState(true),[groupingOpen,setGroupingOpen]=useState(false);` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/SalesProfitExperiment.tsx#L53) | `<Button variant="outline" size="sm" onClick={onOriginal}>{text('Original Sales & profit','মূল বিক্রি ও লাভ')}</Button>` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/SalesProfitExperiment.tsx#L58) | `options={salesExperimentReports.map(r=>({value:r.id,label:text(r.en,r.bn)}))} onChange={v=>onSelectReport(v as ReportKey)}/></div>` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/SalesProfitExperiment.tsx#L59) | `<Button variant="outline" onClick={()=>setSummaryOpen(v=>!v)} aria-expanded={summaryOpen} aria-controls="sales-experiment-visual">` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/SalesProfitExperiment.tsx#L64) | `<ReportToolbar definition={definition} filters={filters} options={options} onChange={onFilters}` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/SalesProfitExperiment.tsx#L69) | `{f.rows.length?<button type="button" onClick={()=>openFigure(f)} aria-label={text('Inspect '+f.en,f.bn+' দেখুন')}` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/SalesProfitExperiment.tsx#L77) | `<Button size="sm" variant="ghost" aria-expanded={groupingOpen} aria-controls="sales-experiment-original" onClick={()=>setGroupingOpen(v=>!v)}>` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/SalesProfitExperiment.tsx#L86) | `<ReportResults definition={definition} result={result} filters={filters} onChange={onFilters}` |
## src/components/reports/premium/AdvisorReport.tsx

| Line | Existing declaration / event |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L10) | `export function AdvisorReport({` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L23) | `const [all, setAll] = useState(false),` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L24) | `[reviewed, setReviewed] = useState<string[]>([]);` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L25) | `const [hidden, setHidden] = useState<string[]>(() => {` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L37) | `[warning, setWarning] = useState("");` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L38) | `const save = (next: string[]) => {` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L87) | `onClick={() => onReport("data-quality")}` |
| [156](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L156) | `onClick={() =>` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L167) | `onClick={() => {` |
| [188](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L188) | `onClick={() =>` |
| [212](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L212) | `onClick={() => setAll((v) => !v)}` |
| [221](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/AdvisorReport.tsx#L221) | `<Button variant="outline" onClick={() => save([])}>` |
## src/components/reports/premium/CashflowReport.tsx

| Line | Existing declaration / event |
|---|---|
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L45) | `export function CashflowReport({ data, filters, onDetail, scopeKey }: Props) {` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L47) | `const [input, setInput] = useState<CashScenarioInput>(() => {` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L49) | `const saved = JSON.parse(` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L64) | `const [saved, setSaved] = useState(false),` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L65) | `[warning, setWarning] = useState("");` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L66) | `const [forecast, setForecast] = useState(() => runCashScenario(input));` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L67) | `const [invalidField, setInvalidField] = useState<` |
| [159](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L159) | `onChange={(event) => {` |
| [195](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L195) | `onClick={() => {` |
| [220](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/reports/premium/CashflowReport.tsx#L220) | `onClick={() => {` |
## src/components/transactions/CompoundQuantityInput.tsx

| Line | Existing declaration / event |
|---|---|
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/CompoundQuantityInput.tsx#L28) | `export function CompoundQuantityInput({product,unit,primary,secondary='',onPrimaryChange,onSecondaryChange,` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/CompoundQuantityInput.tsx#L33) | `const [primaryText,setPrimaryText]=useState(String(primary));` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/CompoundQuantityInput.tsx#L34) | `const [secondaryText,setSecondaryText]=useState(String(secondary));` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/CompoundQuantityInput.tsx#L51) | `const updatePrimary=(value:string)=>{const clean=sanitize(value);setPrimaryText(clean);onPrimaryChange(clean);};` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/CompoundQuantityInput.tsx#L52) | `const updateSecondary=(value:string)=>{const clean=sanitize(value);setSecondaryText(clean);onSecondaryChange?.(clean);};` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/CompoundQuantityInput.tsx#L60) | `onChange={event=>updatePrimary(event.target.value)} onKeyDown={event=>onEnter(event,onPrimaryEnter??(()=>secondaryInput.current?.focus()))}` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/CompoundQuantityInput.tsx#L65) | `onChange={event=>updateSecondary(event.target.value)}` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/CompoundQuantityInput.tsx#L66) | `onBlur={onSecondaryBlur} onKeyDown={event=>onEnter(event,onSecondaryEnter)}` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/CompoundQuantityInput.tsx#L73) | `onChange={event=>updatePrimary(event.target.value)} onKeyDown={event=>onEnter(event,onPrimaryEnter)}` |
## src/components/transactions/MultiUnitQuantityInput.tsx

| Line | Existing declaration / event |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/MultiUnitQuantityInput.tsx#L10) | `export function MultiUnitQuantityInput({product,quantities,onChange,disabled=false,primaryRef,onLastEnter,unitOrder,label,invalid,readableValues=false}:{` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/MultiUnitQuantityInput.tsx#L36) | `onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing){` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/MultiUnitQuantityInput.tsx#L46) | `onChange={event=>{` |
## src/components/transactions/TransactionCartEditor.tsx

| Line | Existing declaration / event |
|---|---|
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/TransactionCartEditor.tsx#L33) | `export function TransactionCartEditor<L extends EditableTransactionLine>({mode,products,lines,onAdd,onUpdate,onRemove,onMove,onCreate,locked=false}:Props<L>){` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/TransactionCartEditor.tsx#L95) | `aria-checked={line.unit===unit} disabled={!canChange} onClick={()=>{` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/TransactionCartEditor.tsx#L110) | `disabled={!canChange} value={line.price} onChange={event=>onUpdate(line.id,{price:Number(event.target.value)} as Partial<L>)}` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/TransactionCartEditor.tsx#L111) | `onKeyDown={backToProduct} className={input+' pl-5'}/></div></div>` |
| [115](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/TransactionCartEditor.tsx#L115) | `<button type="button" aria-label={'Move row '+(i+1)+' up'} disabled={i===0} onClick={()=>onMove(line.id,-1)} className="rounded text-ink-500 hover:text-teal-700 disabled:opacity-30"><ArrowUp className="size-3.5"/></button>` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/TransactionCartEditor.tsx#L116) | `<button type="button" aria-label={'Move row '+(i+1)+' down'} disabled={i===lines.length-1} onClick={()=>onMove(line.id,1)} className="rounded text-ink-500 hover:text-teal-700 disabled:opacity-30"><ArrowDown className="size-3.5"/></button>` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/TransactionCartEditor.tsx#L118) | `{!locked&&<button type="button" aria-label={'Remove '+line.name} onClick={()=>onRemove(line.id)}` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/transactions/TransactionCartEditor.tsx#L125) | `<ProductCombobox ref={searchRef} mode={mode} products={products} onSelect={onAdd} onCreate={onCreate?()=>onCreate():undefined} ariaLabel={productLabel}/>` |
## src/data/erpDemoStore.ts

| Line | Existing declaration / event |
|---|---|
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L32) | `export function subscribePurchasesPreview(listener:()=>void) {purchaseListeners.add(listener);return ()=>{purchaseListeners.delete(listener);};}` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L33) | `function publishPurchases(){purchasesRevision++;for(const listener of purchaseListeners)listener();}` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L36) | `export function mutatePreviewPurchase(expected:Purchase, operation:{kind:'correction';next:Purchase;reason:string;date:string} / {kind:'payment';payments:PaymentSplit[];reason:string;date:string} / {kind:'return';lines:{index:number;quantity:number}[];settlement:'credit' / 'cash';payments:PaymentSplit[];reason:string;date:string}) {` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L85) | `export function createPreviewProductBrand(name: string) {` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L90) | `export function createPreviewProductUnit(name: string, symbol: string, nameBn = '') {` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L144) | `export function availableStockMovements():StockMovement[] {` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L167) | `export function createPreviewProductCategory(category: string) {` |
| [171](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L171) | `export function createPreviewProduct(product: Product, opening?: Pick<StockLot, 'serials'  /  'batchNumber'  /  'manufactureDate'  /  'expiryDate'>) {` |
| [187](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L187) | `export function createPreviewParty(party: Party) {` |
| [192](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L192) | `export function createPreviewExpenseCategory(category: string) {` |
| [198](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L198) | `export function setPreviewExpenseCategoryActive(name: string, active: boolean) {` |
| [202](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L202) | `export function renamePreviewExpenseCategory(previous: string, next: string) {` |
| [211](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L211) | `export function createPreviewPurchase(purchase: Purchase) {` |
| [216](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L216) | `export function editPreviewProductSetting(kind:ProductSettingKind,previous:string,draft:ProductSettingEdit):void {` |
| [226](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L226) | `const updated={...current,name:next.name,nameBn:next.nameBn,symbol,value:current.value??current.symbol,` |
| [248](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L248) | `export function renamePreviewProductCategory(previous: string, proposed: string): string {` |
| [255](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L255) | `export function renamePreviewProductBrand(previous: string, proposed: string): string {` |
| [261](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/erpDemoStore.ts#L261) | `export function renamePreviewProductUnit(previousKey: string, proposedName: string, proposedSymbol: string, nameBn?: string): string {` |
## src/deletion/SourceDeleteAction.tsx

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/deletion/SourceDeleteAction.tsx#L9) | `export function SourceDeleteAction({kind='posted',reason,reasonBn,onReview,module='money'}:{kind?:DeleteKind;reason?:string;reasonBn?:string;onReview?:()=>void;module?:SettingsPermission}){` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/deletion/SourceDeleteAction.tsx#L16) | `return <><ActionMenuDivider/><ActionMenuItem icon={Trash2} tone="destructive" disabled={!review} onClick={review} aria-describedby={!review?reasonId:undefined}>` |
## src/deletion/authority.ts

| Line | Existing declaration / event |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/deletion/authority.ts#L4) | `export function sourceDeleteAuthority(current:CurrentAuthority,module:SettingsPermission,sourceId:string,reason:string,sourceTenantId='t1'){` |
## src/deletion/errorCopy.ts

| Line | Existing declaration / event |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/deletion/errorCopy.ts#L27) | `export function sourceDeleteErrorCopy(error: unknown, text: (english: string, bangla: string) => string, fallback?: (message: string) => string): string {` |
## src/deletion/policy.ts

| Line | Existing declaration / event |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/deletion/policy.ts#L2) | `export function deleteEligibility(target:{kind:DeleteKind;used?:boolean;completeHistory?:boolean}):{allowed:boolean;reason?:string}{` |
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/deletion/policy.ts#L6) | `export function requireSourceDelete(target:{sourceId:string;safeCommand:boolean;linkedReturns?:number;permitted:boolean;actorId:string;reason:string}){` |
## src/documents/InvoiceDocument.tsx

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/InvoiceDocument.tsx#L8) | `export function InvoiceDocument(p: ReceiptPreviewProps) {` |
## src/documents/outputProfile.ts

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/outputProfile.ts#L9) | `export function outputProfileDefaults(` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/outputProfile.ts#L21) | `export function validateOutputProfile(value: unknown): boolean {` |
## src/documents/previewSettings.ts

| Line | Existing declaration / event |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/previewSettings.ts#L10) | `export function publishPreviewSettings(state: TenantSettings  /  undefined) {` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/previewSettings.ts#L14) | `export function readPreviewSettings(): TenantSettings  /  undefined {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/previewSettings.ts#L26) | `export function reconstructInvoiceCopy(` |
## src/documents/profile.ts

| Line | Existing declaration / event |
|---|---|
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/profile.ts#L40) | `export function invoiceDesignDefaults(): InvoiceDesign {` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/profile.ts#L71) | `export function validateInvoiceDesign(value: unknown): string  /  null {` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/profile.ts#L110) | `export function invoicePageCss(d: InvoiceDesign): string {` |
| [126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/profile.ts#L126) | `export function presentationRevision<T>(` |
## src/documents/reviseInvoice.ts

| Line | Existing declaration / event |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/documents/reviseInvoice.ts#L7) | `export function reviseInvoicePresentation(` |
## src/financial-display/model.ts

| Line | Existing declaration / event |
|---|---|
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/financial-display/model.ts#L62) | `export function financialDefaults(): FinancialDisplay {` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/financial-display/model.ts#L81) | `export function applyFinancialPreset(` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/financial-display/model.ts#L116) | `export function financialColumns(` |
| [124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/financial-display/model.ts#L124) | `export function financialLabel(` |
| [137](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/financial-display/model.ts#L137) | `export function validateFinancialDisplay(value: unknown): string  /  null {` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/financial-display/model.ts#L180) | `export function resolveFinancialText(` |
| [218](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/financial-display/model.ts#L218) | `export function financialPreview(context: FinancialContext) {` |
| [260](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/financial-display/model.ts#L260) | `export function accountFinancialContext(accountId: string): FinancialContext {` |
## src/financial-display/useFinancialDisplay.ts

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/financial-display/useFinancialDisplay.ts#L9) | `export function useFinancialDisplay(` |
## src/hooks/useActionBarDocking.ts

| Line | Existing declaration / event |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useActionBarDocking.ts#L4) | `export function useActionBarDocking() {` |
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useActionBarDocking.ts#L5) | `const [docked, setDocked] = useState(true);` |
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useActionBarDocking.ts#L7) | `const update = () => {` |
## src/hooks/useFormCopy.ts

| Line | Existing declaration / event |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useFormCopy.ts#L5) | `export function useFormCopy() {` |
## src/hooks/useMediaQuery.ts

| Line | Existing declaration / event |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useMediaQuery.ts#L3) | `export function useMediaQuery(query: string) {` |
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useMediaQuery.ts#L4) | `const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);` |
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useMediaQuery.ts#L7) | `const update = () => setMatches(media.matches);` |
## src/i18n/datePickerCopy.ts

| Line | Existing declaration / event |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/datePickerCopy.ts#L16) | `export function datePickerMonthLabel(language:UiLanguage,first:string):string {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/datePickerCopy.ts#L21) | `export function datePickerDayLabel(language:UiLanguage,iso:string):string {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/datePickerCopy.ts#L27) | `export function datePickerRangeLabel(language:UiLanguage,value:IsoRange):string {` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/datePickerCopy.ts#L34) | `export function datePickerWord(language:UiLanguage,en:string,bn:string):string {` |
## src/i18n/documentCopy.ts

| Line | Existing declaration / event |
|---|---|
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/documentCopy.ts#L89) | `export function documentLabel(language: UiLanguage, english: string): string {` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/documentCopy.ts#L92) | `export function printDocumentLanguage(language: UiLanguage): 'bn'  /  'en' {` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/documentCopy.ts#L95) | `export function documentMethod(language: UiLanguage, method: string): string {` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/documentCopy.ts#L99) | `export function documentHeading(language:UiLanguage,heading:string):string{` |
## src/i18n/financeCopy.ts

| Line | Existing declaration / event |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/financeCopy.ts#L25) | `export function financeLabel(language:UiLanguage, value:string):string{` |
## src/i18n/fulfillmentCopy.ts

| Line | Existing declaration / event |
|---|---|
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/fulfillmentCopy.ts#L48) | `export function fulfillmentLabel(language:UiLanguage, english:string):string {` |
## src/i18n/importValidationCopy.ts

| Line | Existing declaration / event |
|---|---|
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/importValidationCopy.ts#L71) | `export function translateKnownImportValidation(message:string):string {` |
## src/i18n/importWizardCopy.ts

| Line | Existing declaration / event |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/importWizardCopy.ts#L7) | `export function importTargetTitle(language:UiLanguage,target:ImportTarget):string {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/importWizardCopy.ts#L22) | `export function importWizardError(language:UiLanguage,message:string):string {` |
## src/i18n/notificationCopy.ts

| Line | Existing declaration / event |
|---|---|
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/notificationCopy.ts#L57) | `export function notificationDisplayText(language: UiLanguage, value: string): string {` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/notificationCopy.ts#L61) | `export function notificationDisplayOptions(language: UiLanguage, values: readonly string[]) {` |
## src/i18n/onlineSalesCopy.ts

| Line | Existing declaration / event |
|---|---|
| [179](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/onlineSalesCopy.ts#L179) | `export function onlineLabel(language:UiLanguage,english:string):string {` |
| [182](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/onlineSalesCopy.ts#L182) | `export function onlineOptions(language:UiLanguage,values:readonly string[]) {` |
## src/i18n/partyCopy.ts

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/partyCopy.ts#L15) | `export function partyOpeningDirectionLabel(label:string,language:UiLanguage):string {` |
## src/i18n/partyFinancialCopy.ts

| Line | Existing declaration / event |
|---|---|
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/partyFinancialCopy.ts#L42) | `export function partyFinancialErrorText(language:UiLanguage,message:string):string {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/partyFinancialCopy.ts#L46) | `export function partyLedgerImpactText(language:UiLanguage,label:string):string {` |
## src/i18n/partyImportCopy.ts

| Line | Existing declaration / event |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/partyImportCopy.ts#L25) | `export function partyImportErrorText(language:UiLanguage,message:string):string {` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/partyImportCopy.ts#L29) | `export function partyImportedRoleLabels(roles:readonly PartyRole[],language:UiLanguage):string {` |
## src/i18n/partyLedgerCopy.ts

| Line | Existing declaration / event |
|---|---|
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/partyLedgerCopy.ts#L31) | `export function partyLedgerSourceLabel(language:UiLanguage,source:PartyLedgerRow['source']):string {` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/partyLedgerCopy.ts#L35) | `export function partyLedgerActionLabel(language:UiLanguage,action:PartyAction):string {` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/partyLedgerCopy.ts#L39) | `export function partyLedgerCaption(language:UiLanguage,row:PartyLedgerRow,impactLabel:string,kind:string):string {` |
## src/i18n/productFormsCopy.ts

| Line | Existing declaration / event |
|---|---|
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/productFormsCopy.ts#L144) | `export function productFormLabel(language:UiLanguage, english:string):string {` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/productFormsCopy.ts#L147) | `export function productFormOptions(language:UiLanguage,values:readonly string[]){` |
## src/i18n/productInventoryCopy.ts

| Line | Existing declaration / event |
|---|---|
| [165](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/productInventoryCopy.ts#L165) | `export function productInventoryLabel(language:UiLanguage,english:string):string {` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/productInventoryCopy.ts#L168) | `export function productInventoryOptions(language:UiLanguage,values:readonly string[]){` |
## src/i18n/productsCopy.ts

| Line | Existing declaration / event |
|---|---|
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/productsCopy.ts#L82) | `export function productLabel(language:UiLanguage, english:string):string {` |
## src/i18n/purchaseCopy.ts

| Line | Existing declaration / event |
|---|---|
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/purchaseCopy.ts#L66) | `export function purchaseLabel(language:UiLanguage,english:string):string {` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/purchaseCopy.ts#L70) | `export function purchaseReturnMethod(language:UiLanguage,method:string):string {` |
## src/i18n/quotationCopy.ts

| Line | Existing declaration / event |
|---|---|
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/quotationCopy.ts#L95) | `export function quotationLabel(language:UiLanguage,english:string):string {` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/quotationCopy.ts#L98) | `export function quotationOptionLabels(language:UiLanguage,values:readonly string[]){` |
## src/i18n/salesCopy.ts

| Line | Existing declaration / event |
|---|---|
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/salesCopy.ts#L130) | `export function salesLabel(language:UiLanguage,english:string):string {` |
| [133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/salesCopy.ts#L133) | `export function salesOptions(language:UiLanguage,values:readonly string[]){` |
## src/i18n/uiCopy.ts

| Line | Existing declaration / event |
|---|---|
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/uiCopy.ts#L70) | `export function uiText(language: UiLanguage, english: string, bangla: string): string {` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/uiCopy.ts#L73) | `export function uiWord(language: UiLanguage, key: UiCopyKey): string {` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/uiCopy.ts#L77) | `export function showBanglaHelper(language: UiLanguage): boolean {` |
## src/i18n/useUiCopy.ts

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/useUiCopy.ts#L6) | `export function useUiCopy() {` |
## src/i18n/warrantyCopy.ts

| Line | Existing declaration / event |
|---|---|
| [138](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/warrantyCopy.ts#L138) | `export function warrantyLabel(language:UiLanguage,english:string):string {` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/i18n/warrantyCopy.ts#L143) | `export function warrantyOptions(language:UiLanguage,values:readonly string[]) {` |
## src/motion/MotionNavIndicator.tsx

| Line | Existing declaration / event |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/motion/MotionNavIndicator.tsx#L5) | `export function MotionNavIndicator({ active, layoutId, variant = 'selection' }: { active: boolean; layoutId: string; variant?: 'selection'  /  'hover' }) {` |
## src/motion/MotionTabList.tsx

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/motion/MotionTabList.tsx#L6) | `export function MotionTabList({ children, className, ...props }: ComponentPropsWithoutRef<'div'>) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/motion/MotionTabList.tsx#L16) | `export function MotionTabIndicator({ active }: { active: boolean }) {` |
## src/navigation/resolveErpNavigation.ts

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/navigation/resolveErpNavigation.ts#L9) | `function locationParts(input:string){` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/navigation/resolveErpNavigation.ts#L14) | `function matchesDestination(candidate:string,actual:string){` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/navigation/resolveErpNavigation.ts#L20) | `function isPathAvailable(destination:string,paths:ReadonlySet<string>){` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/navigation/resolveErpNavigation.ts#L23) | `function allowed(feature:string / undefined,permission:string / undefined,ctx:NavigationContext){` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/navigation/resolveErpNavigation.ts#L26) | `export function getVisibleNavigation(groups:readonly ErpNavGroup[],context:NavigationContext):ErpNavGroup[]{` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/navigation/resolveErpNavigation.ts#L36) | `export function resolveNavLocation(path:string,groups:readonly ErpNavGroup[]):NavLocation / null{` |
## src/navigation/useVisibleErpNavigation.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/navigation/useVisibleErpNavigation.ts#L8) | `export function useVisibleErpNavigation() {` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/navigation/useVisibleErpNavigation.ts#L34) | `export function sectionedNav(nav: readonly ErpNavGroup[]) {` |
## src/pages/BrandGuide.tsx

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/BrandGuide.tsx#L18) | `export function BrandGuide() {` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/BrandGuide.tsx#L45) | `<Button size="lg" className="bg-card text-ink hover:bg-ink-50" onClick={() => navigate('/app/dashboard')}>` |
## src/pages/Reports.tsx

| Line | Existing declaration / event |
|---|---|
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L35) | `export function Reports() {` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L51) | `const [refresh,setRefresh]=useState(0),data=useReportData(refresh);` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L52) | `const [page,setPage]=useState(1),[pageSize,setPageSize]=useState(10),[detail,setDetail]=useState<ReportRow / null>(null);` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L53) | `const [librarySearch,setLibrarySearch]=useState(''),[dialog,setDialog]=useState<'columns' / 'save' / 'saved' / null>(null),[viewName,setViewName]=useState('');` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L54) | `const [assumptions,setAssumptions]=useState<PurchaseAssumptions>({leadDays:7,reviewDays:7,safety:0,pack:1,budget:0});` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L55) | `const [showBasis,setShowBasis]=useState(false),[storageWarning,setStorageWarning]=useState('');` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L58) | `const [preferences,setPreferences]=useState<ReportPreferences>(readPreferences);` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L62) | `const savePreferences=(next:ReportPreferences)=>{` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L67) | `const update=(next:ReportFilters)=>{` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L113) | `<Button variant="outline" onClick={()=>{const next=new URLSearchParams(params);if(reviewWorkspace)next.delete('workspace');else next.set('workspace','business-review');setParams(next);}}>` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L117) | `<Button variant="outline" onClick={()=>{setRefresh(v=>v+1);toast(text('Preview records refreshed.','প্রিভিউ রেকর্ড আবার পড়া হয়েছে।'));}} aria-label={text('Refresh reports','রিপোর্ট হালনাগাদ')}><RefreshCw className="size-4" aria-hidden="true"/></Button>` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L118) | `<Button variant="outline" onClick={()=>setDialog('save')}><BookmarkPlus className="size-4" aria-hidden="true"/>{text('Save view','ভিউ সংরক্ষণ')}</Button>` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L119) | `<Button variant="outline" disabled={!!definition.unavailable} onClick={()=>print()}><Printer className="size-4" aria-hidden="true"/>{screen==='library' /  / screen==='overview'?text('Print report','রিপোর্ট প্রিন্ট'):text('Print source report','মূল রিপোর্ট প্রিন্ট')}</Button>` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L120) | `<Button disabled={!!definition.unavailable} onClick={exportCsv}><ArrowDownToLine className="size-4" aria-hidden="true"/>{screen==='library' /  / screen==='overview'?text('Export CSV','সিএসভি নামান'):text('Source CSV','মূল তথ্য নামান')}</Button>` |
| [126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L126) | `<ReportsNav value={screen} onChange={selectScreen}/>` |
| [132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L132) | `onClick={()=>selectReport(reportCatalog.find(r=>r.group===g.id)!.id)}` |
| [133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L133) | `onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?reportGroups.length-1:(index+(e.key==='ArrowRight'?1:-1)+reportGroups.length)%reportGroups.length;selectReport(reportCatalog.find(r=>r.group===reportGroups[next].id)!.id);document.getElementById('report-tab-'+reportGroups[next].id)?.focus();}}}` |
| [139](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L139) | `<div className="flex shrink-0 items-center gap-1 pl-2" role="group" aria-label={text('Report actions','রিপোর্টের কাজ')}><Button variant="ghost" size="icon" aria-label={text(favorite?'Unpin report':'Pin report',favorite?'রিপোর্টের পিন খুলুন':'রিপোর্ট পিন করুন')} aria-pressed={favorite} onClick={toggleFavorite}><Star className={'size-4 '+(favorite?'fill-current text-primary':'text-ink-400')} aria-hidden="true"/></Button><Button variant="ghost" size="icon" aria-label={text('How this report is calculated','রিপোর্ট কীভাবে হিসাব হয়')} aria-expanded={showBasis} onClick={()=>setShowBasis(v=>!v)}><Info className="size-4" aria-hidden="true"/></Button></div>` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L144) | `<nav className="space-y-0.5">{library.map(r=><button key={r.id} type="button" aria-current={r.id===definition.id?'page':undefined} onClick={()=>{selectReport(r.id);setLibrarySearch('');}} className={'flex h-9 w-full items-center gap-2 rounded-lg px-2 text-left text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary '+(r.id===definition.id?'bg-teal-50 font-medium text-teal-700':'text-ink-600 hover:bg-ink-50')}><span className="min-w-0 flex-1 truncate">{text(r.en,r.bn)}</span>{r.unavailable&&<Info className="size-3 shrink-0 text-ink-400" aria-label={text('Needs source data','মূল তথ্য দরকার')}/>}</button>)}</nav>` |
| [148](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L148) | `{screen==='library'&&<div className="lg:hidden"><SearchSelect id="mobile-report-picker" noun={{en:'report',bn:'রিপোর্ট'}} ariaLabel={text('Choose report','রিপোর্ট বাছুন')} value={definition.id} options={reportCatalog.map(r=>({value:r.id,label:text(r.en,r.bn)}))} onChange={v=>selectReport(reportDefinition(v).id)}/></div>}` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L153) | `<div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" onClick={()=>selectReport('data-quality')}>{text('Review data completeness','তথ্যের পূর্ণতা দেখুন')}<ArrowRight className="size-4" aria-hidden="true"/></Button>{definition.id==='reconciliation'&&<Button onClick={()=>navigate('/app/reconciliation')}>{text('Open reconciliation','হিসাব মিলানো খুলুন')}</Button>}</div>` |
| [155](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L155) | `{screen==='library'&&<ReportToolbar definition={definition} filters={filters} options={rawOptions} onChange={update} onColumns={()=>setDialog('columns')} onSaved={()=>setDialog('saved')} asOf={data.asOf}/>}` |
| [163](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L163) | `<div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-semibold text-ink">{text('Buying assumptions','ক্রয়ের অনুমান')}</h3><p className="mt-1 text-xs text-ink-500">{text('Assumptions apply in each product’s base unit.','প্রতিটি পণ্যের মূল এককে এই অনুমান প্রযোজ্য।')}</p></div><Button variant="outline" disabled={!suggestedRows.length} onClick={downloadPurchaseList}><ArrowDownToLine className="size-4" aria-hidden="true"/>{text('Download purchase list','ক্রয়ের তালিকা নামান')}</Button></div>` |
| [166](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L166) | `] as const).map(f=><div key={f.key} className="space-y-1 text-xs text-ink-600"><div className="flex items-center justify-between gap-1"><label htmlFor={'report-assumption-'+f.key}><ReportLabel en={f.en} bn={f.bn}/></label><ReportHelp guide={f.key} label={text(f.en,f.bn)}/></div><Input id={'report-assumption-'+f.key} type="number" aria-label={text(f.en,f.bn)} min={f.key==='pack'?1:0} max={f.key==='leadDays' /  / f.key==='reviewDays'?365:100000000} value={assumptions[f.key]} onChange={e=>{const n=Number(e.target.value);if(Number.isFinite(n))setAssumptions(v=>({...v,[f.key]:Math.max(f.key==='pack'?1:0,Math.min(n,f.key==='leadDays' /  / f.key==='reviewDays'?365:100000000))}));}}/></div>)}</div>` |
| [175](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L175) | `{screen==='library'&&<ReportResults definition={definition} result={result} filters={filters} onChange={update} visible={visible} onDetail={setDetail} page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize}/>}` |
| [181](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L181) | `<Dialog open={dialog!==null} onOpenChange={v=>!v&&setDialog(null)}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{dialog==='columns'?text('Visible columns','দেখানো কলাম'):dialog==='save'?text('Save report view','রিপোর্টের ভিউ সংরক্ষণ'):text('Saved views','সংরক্ষিত ভিউ')}</DialogTitle><DialogDescription>{dialog==='columns'?text('Choose what appears in the table, CSV and printout.','টেবিল, সিএসভি ও প্রিন্টে কী দেখাবেন বাছুন।'):text('Saved on this browser for the current business and user.','এই ব্যবসা ও ব্যবহারকারীর জন্য এই ব্রাউজারে সংরক্ষিত।')}</DialogDescription></DialogHeader>` |
| [182](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L182) | `{dialog==='columns'&&<ColumnVisibilityEditor label={text('Visible columns','দেখানো কলাম')} columns={definition.columns.map(k=>({id:k,label:text(reportColumns[k].en,reportColumns[k].bn)}))} value={visible} required={['label']} onChange={columns=>setParams(paramsForReportScreen(screen,definition.id,filters,columns),{replace:true})}/>}` |
| [183](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L183) | `{dialog==='save'&&<label className="space-y-1 text-sm text-ink"><span>{text('View name','ভিউয়ের নাম')}</span><Input aria-label={text('View name','ভিউয়ের নাম')} value={viewName} maxLength={80} onChange={e=>setViewName(e.target.value)} placeholder={text('e.g. Weekly purchasing review','যেমন: সাপ্তাহিক ক্রয় পর্যালোচনা')}/></label>}` |
| [184](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L184) | `{dialog==='saved'&&<div className="max-h-[50vh] space-y-2 overflow-y-auto">{preferences.views.length?preferences.views.map(v=><div key={v.id} className="flex items-center gap-2 rounded-lg border border-border p-2"><button type="button" className="min-w-0 flex-1 text-left text-sm font-medium text-primary hover:underline" aria-label={text('Open '+v.name,v.name+' খুলুন')} onClick={()=>{setParams(paramsForReportScreen(v.screen??'library',v.report,v.filters,v.columns),{replace:true});setDialog(null);}}>{v.name}<span className="mt-0.5 block text-xs font-normal text-ink-500">{text(reportDefinition(v.report).en,reportDefinition(v.report).bn)}</span></button><Button variant="ghost" size="icon" aria-label={text('Delete '+v.name,v.name+' মুছুন')} onClick={()=>savePreferences({...preferences,views:preferences.views.filter(s=>s.id!==v.id)})}><Trash2 className="size-4" aria-hidden="true"/></Button></d` |
| [185](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reports.tsx#L185) | `<DialogFooter><Button variant="outline" onClick={()=>setDialog(null)}>{dialog==='columns'?text('Done','সম্পন্ন'):text('Close','বন্ধ')}</Button>{dialog==='save'&&<Button disabled={!viewName.trim() /  / preferences.views.length>=20} onClick={()=>{savePreferences({...preferences,views:[...preferences.views,{id:crypto.randomUUID(),name:viewName.trim(),report:definition.id,screen,filters:{...filters},columns:[...visible]}]});setViewName('');setDialog(null);}}><Check className="size-4" aria-hidden="true"/>{text('Save this view','এই ভিউ সংরক্ষণ')}</Button>}</DialogFooter>` |
## src/reports/analysis.ts

| Line | Existing declaration / event |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/analysis.ts#L14) | `export function runCashScenario(input: CashScenarioInput): {` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/analysis.ts#L73) | `export function deriveReportInsights(` |
## src/reports/guidance.ts

| Line | Existing declaration / event |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/guidance.ts#L4) | `export function reportStatusTone(status:string):ReportTone{` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/guidance.ts#L11) | `export function reportValueTone(key:string,row:ReportRow,report:ReportKey):ReportTone{` |
## src/reports/magicpatterns/MagicReportsView.tsx

| Line | Existing declaration / event |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/MagicReportsView.tsx#L24) | `export function evidenceKey(screen:ReportScreen,label:string):ReportKey {` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/MagicReportsView.tsx#L34) | `export function MagicReportsView({screen,data,filters,onFilters,onDetail,onReport,onScreen,scopeKey}:Props){` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/MagicReportsView.tsx#L37) | `const [settings,setSettings]=useState(defaultPremiumSettings);` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/MagicReportsView.tsx#L38) | `const [manualRange,setManualRange]=useState(false);` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/MagicReportsView.tsx#L74) | `<select aria-label={text('Report period','রিপোর্টের সময়কাল')} className="h-9 rounded-lg border border-border bg-card px-2 text-[13px] text-ink" value={preset} onChange={event=>changePreset(event.target.value as PeriodPreset)}>` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/MagicReportsView.tsx#L78) | `<input aria-label={text('From date','শুরুর তারিখ')} type="date" max={data.asOf} value={filters.from} className="h-9 rounded-lg border border-border bg-card px-2 text-[13px]" onChange={event=>onFilters({...filters,from:event.target.value})}/>` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/MagicReportsView.tsx#L79) | `<input aria-label={text('To date','শেষ তারিখ')} type="date" max={data.asOf} value={filters.to} className="h-9 rounded-lg border border-border bg-card px-2 text-[13px]" onChange={event=>onFilters({...filters,to:event.target.value})}/>` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/MagicReportsView.tsx#L101) | `<button type="button" className="text-primary hover:underline" onClick={()=>onReport(screen==='buying'?'reorder':screen==='advisor'?'collections':screen==='profit'?'product-profit':screen==='sales'?'sales-register':screen==='stock'?'stock':screen==='dues'?'receivables':screen==='money'?'cash-book':screen==='customers'?'customer-sales':'overview')}>{text('Full source report in library','সব মূল তথ্য রিপোর্ট লাইব্রেরিতে')}</button>` |
## src/reports/magicpatterns/adapter.ts

| Line | Existing declaration / event |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/adapter.ts#L10) | `export function toMagicReportsDataset(data:ReportData):ReportDataset {` |
## src/reports/magicpatterns/advisorEvidence.ts

| Line | Existing declaration / event |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/advisorEvidence.ts#L3) | `export function advisorEvidenceRequest(r:Recommendation):EvidenceRequest{` |
## src/reports/magicpatterns/components/reports/ReportBits.tsx

| Line | Existing declaration / event |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L5) | `export function SourceLink({report,label,field,value,date,toDate,children}:{report:string;label:string;field?:string;value?:string;date?:string;toDate?:string;children:React.ReactNode}){` |
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L7) | `return <button type="button" className="text-left font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" onClick={()=>open?.({report,label,field,value,date,toDate})}>{children}</button>;` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L22) | `export function InfoTip({ text, label = 'More information' }: { text: React.ReactNode; label?: string }) {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L23) | `const [open, setOpen] = useState(false);` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L33) | `onClick={() => setOpen((o) => !o)}` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L51) | `export function Delta({ value, goodWhenUp = true, suffix = 'vs previous' }: { value: number  /  null; goodWhenUp?: boolean; suffix?: string }) {` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L74) | `export function Kpi({ label, bn, value, tone = 'neutral', help, footer, onClick }: KpiProps) {` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L81) | `? <button type="button" onClick={click} className="min-w-0 text-left focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{label}</button>` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L87) | `? <button type="button" onClick={click} aria-label={ʼView evidence for ${label}: ${value}ʼ} className={ʼmt-1 block w-full truncate text-left text-xl font-semibold tracking-tight focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${toneText[tone]}ʼ}>{value}</button>` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L95) | `export function ShareBar({ value, tone = 'teal' }: { value: number; tone?: 'teal'  /  'warning'  /  'danger'  /  'ink' }) {` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L104) | `export function SectionNote({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral'  /  'warning'  /  'teal' }) {` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L120) | `export function Th({ children, help, numeric = false, className = '' }: { children: React.ReactNode; help?: string; numeric?: boolean; className?: string }) {` |
| [131](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L131) | `export function Td({ children, numeric = false, className = '' }: { children: React.ReactNode; numeric?: boolean; className?: string }) {` |
| [139](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L139) | `export function TableShell({ children, minWidth = 640 }: { children: React.ReactNode; minWidth?: number }) {` |
| [149](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/ReportBits.tsx#L149) | `export function EmptyRow({ cols, message }: { cols: number; message: string }) {` |
## src/reports/magicpatterns/components/reports/basic/DuesReport.tsx

| Line | Existing declaration / event |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/DuesReport.tsx#L16) | `export function DuesReport({ core }: { core: ReportsCore }) {` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/DuesReport.tsx#L17) | `const [view, setView] = useState<View>('customers');` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/DuesReport.tsx#L45) | `<Kpi label="Customers owe you" bn="গ্রাহকের পাওনা" value={taka(receivable)} tone="warning" onClick={() => setView('customers')} />` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/DuesReport.tsx#L47) | `<Kpi label="You owe suppliers" bn="সরবরাহকারীর দেনা" value={taka(payable)} tone="danger" onClick={() => setView('suppliers')} />` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/DuesReport.tsx#L65) | `<Panel title="Dues by party" bodyClassName="p-0" actions={<Button kind="outline" onClick={exportCsv}><Download className="size-4" />CSV</Button>}>` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/DuesReport.tsx#L69) | `onChange={(v) => setView(v as View)}` |
## src/reports/magicpatterns/components/reports/basic/MoneyReport.tsx

| Line | Existing declaration / event |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/MoneyReport.tsx#L12) | `export function MoneyReport({ core, period }: { core: ReportsCore; period: Period }) {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/MoneyReport.tsx#L46) | `actions={<Button kind="outline" onClick={() => downloadCsv('hisabiq-expenses.csv', [['Category', 'Entries', 'This period', 'Previous period'], ...categories.map((r) => [r.category, r.count, r.now, r.before])])}><Download className="size-4" />CSV</Button>}` |
## src/reports/magicpatterns/components/reports/basic/OverviewReport.tsx

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/OverviewReport.tsx#L15) | `export function OverviewReport({ core, period, onOpen }: Props) {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/OverviewReport.tsx#L46) | `onClick={() => onOpen('sales')}` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/OverviewReport.tsx#L73) | `onClick={() => onOpen('money')}` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/OverviewReport.tsx#L84) | `<Kpi label="Customers owe you" bn="পাওনা" value={taka(receivable)} tone="warning" help="Unpaid customer invoices today." onClick={() => onOpen('dues')} />` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/OverviewReport.tsx#L85) | `<Kpi label="You owe suppliers" bn="দেনা" value={taka(payable)} tone="danger" help="Unpaid purchase bills and vendor balances today." onClick={() => onOpen('dues')} />` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/OverviewReport.tsx#L86) | `<Kpi label="Cash, bank & bKash" bn="হাতে টাকা" value={taka(cash)} tone="teal" help="Current balance across cash in hand, bank and mobile banking accounts." onClick={() => onOpen('money')} />` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/OverviewReport.tsx#L93) | `<AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} onClick={state=>{const day=(state?.activePayload?.[0]?.payload as {key?:string} / undefined)?.key;if(day)sourceEvidence?.({report:"sales-register",label:"Sales & gross profit · "+day,date:day,toDate:period.days>45?(addDays(day,6)>period.to?period.to:addDays(day,6)):day});}}>` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/OverviewReport.tsx#L117) | `<button type="button" onClick={() => onOpen(a.tab)} className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">` |
## src/reports/magicpatterns/components/reports/basic/SalesReport.tsx

| Line | Existing declaration / event |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/SalesReport.tsx#L14) | `export function SalesReport({ core, period }: { core: ReportsCore; period: Period }) {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/SalesReport.tsx#L15) | `const [view, setView] = useState<View>('product');` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/SalesReport.tsx#L68) | `actions={<Button kind="outline" onClick={exportCsv}><Download className="size-4" />CSV</Button>}` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/SalesReport.tsx#L73) | `onChange={(v) => setView(v as View)}` |
## src/reports/magicpatterns/components/reports/basic/StockReport.tsx

| Line | Existing declaration / event |
|---|---|
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/StockReport.tsx#L32) | `export function StockReport({ core }: { core: ReportsCore }) {` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/StockReport.tsx#L33) | `const [filter, setFilter] = useState<Filter>('all');` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/StockReport.tsx#L52) | `<Kpi label="Low or out of stock" bn="কম স্টক" value={String(low.length)} tone={low.length ? 'danger' : 'success'} help="Products that may run out before the supplier can deliver." onClick={() => setFilter('low')} />` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/StockReport.tsx#L53) | `<Kpi label="Slow-moving stock" bn="ধীরে বিক্রি" value={taka(slowValue)} tone={slowValue ? 'warning' : 'neutral'} help="Value of stock beyond what you need for about 45 days of sales." onClick={() => setFilter('slow')} />` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/StockReport.tsx#L60) | `actions={<Button kind="outline" onClick={exportCsv}><Download className="size-4" />CSV</Button>}` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/basic/StockReport.tsx#L65) | `onChange={(v) => setFilter(v as Filter)}` |
## src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx

| Line | Existing declaration / event |
|---|---|
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L31) | `export function AdvisorReport({ core, insights, onOpen, scopeKey }: Props) {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L36) | `const [area, setArea] = useState<'All'  /  AdvisorArea>('All');` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L37) | `const [saved, setSaved] = useState<Saved>(()=>readSaved(storageKey));` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L38) | `const [showHandled, setShowHandled] = useState(false);` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L50) | `const handled = recommendations.filter((r) => saved[sourceVersion(r)]);` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L90) | `onClick={() => onOpen(h.tab)}` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L109) | `<Button kind="ghost" onClick={() => setShowHandled((s) => !s)}>` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L117) | `onChange={(v) => setArea(v as 'All'  /  AdvisorArea)}` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L164) | `<Button kind="outline" onClick={() => { const n = { ...saved }; delete n[sourceVersion(r)]; persist(n); }}><RotateCcw className="size-4" />Restore</Button>` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L167) | `<Button kind="outline" onClick={() => sourceEvidence?.(advisorEvidenceRequest(r))}>See details <ArrowRight className="size-4" /></Button>` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L168) | `<Button kind="outline" onClick={() => mark(r, 'done')}><Check className="size-4" />Mark done</Button>` |
| [169](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/AdvisorReport.tsx#L169) | `<Button kind="ghost" onClick={() => mark(r, 'dismissed')}><X className="size-4" />Not now</Button>` |
## src/reports/magicpatterns/components/reports/premium/BuyingReport.tsx

| Line | Existing declaration / event |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/BuyingReport.tsx#L19) | `export function BuyingReport({ core, insights, settings, onSettings }: Props) {` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/BuyingReport.tsx#L61) | `onChange={(e) => onSettings({ ...settings, budget: Number(e.target.value) })}` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/BuyingReport.tsx#L66) | `<Button kind="outline" onClick={exportList}><Download className="size-4" />CSV</Button>` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/BuyingReport.tsx#L73) | `<select className="ref-control rounded-lg border border-ink-200 bg-card px-2 text-[13px]" value={settings.budget} onChange={(e) => onSettings({ ...settings, budget: Number(e.target.value) })}>` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/BuyingReport.tsx#L120) | `onClick={() => toast.info('Preview only — no purchase orders were created.', { description: 'Download the buy list to review these quantities. PO creation and receiving are not connected yet.' })}` |
## src/reports/magicpatterns/components/reports/premium/CashflowReport.tsx

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CashflowReport.tsx#L15) | `export function CashflowReport({ core, insights, settings, onSettings }: Props) {` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CashflowReport.tsx#L43) | `<select className="ref-control rounded-lg border border-ink-200 bg-card px-2 text-[13px]" value={settings.buffer} onChange={(e) => onSettings({ ...settings, buffer: Number(e.target.value) })}>` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CashflowReport.tsx#L50) | `<select className="ref-control rounded-lg border border-ink-200 bg-card px-2 text-[13px]" value={settings.lateDays} onChange={(e) => onSettings({ ...settings, lateDays: Number(e.target.value) })}>` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CashflowReport.tsx#L55) | `<input type="checkbox" className="size-4 accent-teal-600" checked={settings.includePurchases} onChange={(e) => onSettings({ ...settings, includePurchases: e.target.checked })} />` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CashflowReport.tsx#L61) | `<ComposedChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} stackOffset="sign" onClick={state=>{const d=(state?.activePayload?.[0]?.payload as {date?:string} / undefined)?.date;if(d)sourceEvidence?.({report:"cash-book",label:"Projected cash · "+d,date:d});}}>` |
## src/reports/magicpatterns/components/reports/premium/CustomersReport.tsx

| Line | Existing declaration / event |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CustomersReport.tsx#L24) | `export function CustomersReport({ core, period }: { core: ReportsCore; period: Period }) {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CustomersReport.tsx#L25) | `const [filter, setFilter] = useState<Filter>('all');` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CustomersReport.tsx#L40) | `<Kpi label="Sales at risk / month" bn="ঝুঁকিতে বিক্রি" value={taka(atRiskValue)} tone={atRiskValue ? 'warning' : 'neutral'} help="Monthly sales from customers who stopped buying." onClick={() => setFilter('risk')} />` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CustomersReport.tsx#L41) | `<Kpi label="Risky credit" bn="ঝুঁকির বাকি" value={taka(highRisk.reduce((s, c) => s + c.outstanding, 0))} tone="danger" help="Dues from customers who pay slowly or have very old bills." onClick={() => setFilter('credit')} />` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/CustomersReport.tsx#L48) | `onChange={(v) => setFilter(v as Filter)}` |
## src/reports/magicpatterns/components/reports/premium/ProfitReport.tsx

| Line | Existing declaration / event |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/ProfitReport.tsx#L22) | `export function ProfitReport({ core, period }: { core: ReportsCore; period: Period }) {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/ProfitReport.tsx#L24) | `const [view, setView] = useState<View>('products');` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/ProfitReport.tsx#L93) | `<Scatter data={scatter} onClick={point=>{const d=point as {payload?:{name?:string};name?:string};const match=stats.find(s=>s.product.name===(d.payload?.name??d.name));if(match)sourceEvidence?.({report:'product-profit',label:match.product.name,field:'productId',value:match.product.id});}}>` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/components/reports/premium/ProfitReport.tsx#L110) | `onChange={(v) => setView(v as View)}` |
## src/reports/magicpatterns/evidence.ts

| Line | Existing declaration / event |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/evidence.ts#L7) | `export function resolveMagicEvidence(req:EvidenceRequest,data:ReportData,filters:ReportFilters,screen:ReportScreen):ReportRow {` |
## src/reports/magicpatterns/hooks/usePremiumInsights.ts

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/hooks/usePremiumInsights.ts#L18) | `export function usePremiumInsights(core: ReportsCore, settings: PremiumSettings) {` |
## src/reports/magicpatterns/hooks/useReportsData.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/hooks/useReportsData.ts#L8) | `export function useReportsCore(data:ReportData, filters:ReportFilters){` |
## src/reports/magicpatterns/prototype/Ui.tsx

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/prototype/Ui.tsx#L6) | `export function Button({kind='default',...rest}:{kind?:Kind}&ComponentProps<typeof HisabButton>){` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/prototype/Ui.tsx#L9) | `export function Tabs({label,items,value,onChange}:{label:string;items:{id:string;label:string;count?:number}[];value:string;onChange:(v:string)=>void}){` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/prototype/Ui.tsx#L12) | `onClick={()=>onChange(item.id)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?items.length-1:(i+(e.key==='ArrowRight'?1:-1)+items.length)%items.length;onChange(items[next].id);e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();}}}` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/prototype/Ui.tsx#L17) | `export function downloadCsv(name:string,rows:(string / number)[][]){downloadReport(name,rows[0].map(String),rows.slice(1));}` |
## src/reports/magicpatterns/utils/currency.ts

| Line | Existing declaration / event |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/currency.ts#L2) | `export function formatNumber(value: number, decimals = 0): string {` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/currency.ts#L10) | `export function taka(value: number, decimals = 0): string {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/currency.ts#L16) | `export function takaCompact(value: number): string {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/currency.ts#L25) | `export function roundTo(value: number, step = 5): number {` |
## src/reports/magicpatterns/utils/reports/advisor.ts

| Line | Existing declaration / event |
|---|---|
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/advisor.ts#L43) | `export function buildRecommendations(input: AdvisorInput): Recommendation[] {` |
| [325](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/advisor.ts#L325) | `export function businessHealth(input: { last30: Summary; forecast: Forecast; buffer: number; stats: ProductStat[]; tied: TiedRow[]; open: OpenInvoice[] }): HealthPillar[] {` |
## src/reports/magicpatterns/utils/reports/metrics.ts

| Line | Existing declaration / event |
|---|---|
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/metrics.ts#L28) | `export function summarize(ds: ReportDataset, from: string, to: string): Summary {` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/metrics.ts#L68) | `export function salesSeries(ds: ReportDataset, from: string, to: string): SeriesPoint[] {` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/metrics.ts#L118) | `export function productStats(ds: ReportDataset, from: string, to: string): ProductStat[] {` |
| [197](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/metrics.ts#L197) | `export function categoryStats(stats: ProductStat[]) {` |
| [220](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/metrics.ts#L220) | `export function openInvoices(ds: ReportDataset): OpenInvoice[] {` |
| [253](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/metrics.ts#L253) | `export function customerStats(ds: ReportDataset, from: string, to: string): CustomerStat[] {` |
| [311](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/metrics.ts#L311) | `export function payables(ds: ReportDataset): Payable[] {` |
## src/reports/magicpatterns/utils/reports/period.ts

| Line | Existing declaration / event |
|---|---|
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/period.ts#L33) | `export function resolvePeriod(preset: PeriodPreset, asOf: string, customFrom: string, customTo: string): Period {` |
## src/reports/magicpatterns/utils/reports/planning.ts

| Line | Existing declaration / event |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/planning.ts#L22) | `export function buyPlan(stats: ProductStat[], budget: number) {` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/planning.ts#L72) | `export function tiedStock(stats: ProductStat[]): TiedRow[] {` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/planning.ts#L91) | `export function workingCapital(ds: ReportDataset, stats: ProductStat[]) {` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/magicpatterns/utils/reports/planning.ts#L128) | `export function cashForecast(ds: ReportDataset, _stats: ProductStat[], plannedSpend: number, opts: ForecastOptions) {` |
## src/reports/model.ts

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/model.ts#L18) | `export function previousPeriod(range:{from:string;to:string}) {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/model.ts#L24) | `export function reorderQuantity(i:{stock:number;dailyDemand:number;leadDays:number;reviewDays:number;safety:number;pack:number}) {` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/model.ts#L31) | `function netAmounts(total:number,weights:number[]) {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/model.ts#L36) | `export function buildReportData(input:ReportInput):ReportData {` |
| [140](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/model.ts#L140) | `export function reportCell(row:ReportRow,key:string):CellValue {` |
| [148](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/model.ts#L148) | `function matches(row:ReportRow,f:ReportFilters,dated:boolean) {` |
| [162](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/model.ts#L162) | `function grouped(rows:ReportRow[],by:'productId' / 'category' / 'party',label:'label' / 'category' / 'party'):ReportRow[]{` |
| [176](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/model.ts#L176) | `export function runReport(key:ReportKey,data:ReportData,f:ReportFilters,assumptions:PurchaseAssumptions={leadDays:7,reviewDays:7,safety:0,pack:1,budget:0}):ReportResult {` |
## src/reports/preferences.ts

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/preferences.ts#L9) | `export function parsePreferences(raw:string / null):ReportPreferences {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/preferences.ts#L22) | `export function filtersFromParams(params:URLSearchParams):ReportFilters {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/preferences.ts#L32) | `export function paramsForReport(report:ReportKey,filters:ReportFilters,columns:string[]) {` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/preferences.ts#L40) | `export function reportScreenFromParams(params:URLSearchParams):ReportScreen {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/preferences.ts#L46) | `export function paramsForReportScreen(screen:ReportScreen,report:ReportKey,filters:ReportFilters,columns:string[]) {` |
## src/reports/review/auditBook.ts

| Line | Existing declaration / event |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBook.ts#L22) | `function rank(rows:ReportRow[],key:(r:ReportRow)=>string,label:(r:ReportRow)=>string,` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBook.ts#L43) | `function trend(rows:ReportRow[],review:BusinessReviewResult):AuditRank[]{` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBook.ts#L54) | `export function buildAuditBook(data:ReportData,review:BusinessReviewResult):AuditBook{` |
## src/reports/review/auditBookHtml.ts

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBookHtml.ts#L18) | `function barChart(label:string,rows:{label:string;amount:number}[],lang:UiLanguage):string{` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBookHtml.ts#L34) | `function pieChart(label:string,rows:{label:string;amount:number}[],lang:UiLanguage):string{` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBookHtml.ts#L47) | `function ranked(title:string,rows:AuditRank[],lang:UiLanguage,qty=false):string{` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBookHtml.ts#L56) | `function transactions(title:string,rows:ReportRow[],lang:UiLanguage,field='amount'):string{` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBookHtml.ts#L63) | `function metric(title:string,m:ReviewMetric):string{` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBookHtml.ts#L66) | `function note(text:string):string{return '<p class="note">'+escape(text)+'</p>';}` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBookHtml.ts#L67) | `function page(b:AuditBook,index:number,title:string,content:string,lang:UiLanguage):string{` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBookHtml.ts#L77) | `export function auditBookHtml(book:AuditBook,language:UiLanguage='English + Bangla'):string{` |
| [159](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/auditBookHtml.ts#L159) | `export function printAuditBook(book:AuditBook,language:UiLanguage):boolean{` |
## src/reports/review/businessReview.ts

| Line | Existing declaration / event |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/businessReview.ts#L11) | `const records=(rows:ReportRow[],from:string,to:string)=>rows.filter(r=>inRange(r,from,to));` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/businessReview.ts#L16) | `export function reviewPeriod(mode:ReviewMode,options:{asOf:string;month?:string;year?:string;from?:string;to?:string}):ReviewRequest{` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/businessReview.ts#L43) | `function makeMetrics(data:ReportData,from:string,to:string,includeSnapshot:boolean):ReviewMetrics{` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/businessReview.ts#L94) | `function priorities(data:ReportData,metrics:ReviewMetrics,from:string,to:string,includeSnapshot:boolean):ReviewPriority[]{` |
| [105](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/review/businessReview.ts#L105) | `export function buildBusinessReview(data:ReportData,request:ReviewRequest):BusinessReviewResult{` |
## src/reports/salesExperiment.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/salesExperiment.ts#L8) | `export function salesExperimentReportKey(requested?:string / null):ReportKey {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/salesExperiment.ts#L12) | `export function selectSalesExperimentReport(report:ReportKey,filters:ReportFilters):ReportFilters {` |
## src/reports/screens.ts

| Line | Existing declaration / event |
|---|---|
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/screens.ts#L101) | `export function reportKeyForScreen(` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/screens.ts#L111) | `export function filtersForAnalysisReport(` |
## src/reports/useReportData.ts

| Line | Existing declaration / event |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/useReportData.ts#L1) | `import { useMemo, useSyncExternalStore } from 'react';` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/useReportData.ts#L13) | `export function useReportData(refresh:number) {` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/useReportData.ts#L14) | `const sales=useSyncExternalStore(subscribeSalesPreview,getSalesPreviewSnapshot);` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/useReportData.ts#L15) | `const products=useSyncExternalStore(subscribeProductImportPreview,getProductImportPreviewSnapshot);` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/useReportData.ts#L16) | `const expenses=useSyncExternalStore(subscribeExpensePreview,getExpensePreviewSnapshot);` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/useReportData.ts#L17) | `const finance=useSyncExternalStore(subscribeFinancePreview,getFinancePreviewSnapshot);` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/reports/useReportData.ts#L18) | `const purchasesRevision=useSyncExternalStore(subscribePurchasesPreview,getPurchasesPreviewRevision);` |
## src/utils/accountTransferIdentity.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountTransferIdentity.ts#L8) | `export function transferAccountId(` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountTransferIdentity.ts#L21) | `export function transferAccountName(` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountTransferIdentity.ts#L31) | `export function transferAccountLabel(` |
## src/utils/accountingLabels.ts

| Line | Existing declaration / event |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingLabels.ts#L4) | `export function accountingAccountLabel(account: AccountingAccount, mode: TerminologyMode) {` |
## src/utils/accountingProjection.ts

| Line | Existing declaration / event |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingProjection.ts#L13) | `function moneyAccountId(name?: string) {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingProjection.ts#L20) | `function moneyDebitLines(source: AccountingSourceTransaction, amount = source.paid): PostingLine[] {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingProjection.ts#L28) | `function moneyCreditLines(source: AccountingSourceTransaction, amount = source.paid): PostingLine[] {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingProjection.ts#L36) | `function posting(` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingProjection.ts#L54) | `export function postingForTransaction(source: AccountingSourceTransaction): Posting {` |
| [148](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingProjection.ts#L148) | `export function trialBalance(postings: Posting[]) {` |
| [173](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingProjection.ts#L173) | `export function profitAndLoss(postings: Posting[], range: { from: string; to: string }) {` |
| [187](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingProjection.ts#L187) | `export function balanceSheet(postings: Posting[], asOf: string) {` |
| [216](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/accountingProjection.ts#L216) | `export function ledgerForAccount(` |
## src/utils/amountInWords.ts

| Line | Existing declaration / event |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/amountInWords.ts#L14) | `function underThousand(value:number):string {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/amountInWords.ts#L19) | `function positiveWords(value:number):string {` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/amountInWords.ts#L35) | `function englishWords(value: number): string {` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/amountInWords.ts#L44) | `export function amountInWords(value:number, language: 'Bangla'  /  'English' = 'Bangla'):string {` |
## src/utils/auditDisplay.ts

| Line | Existing declaration / event |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditDisplay.ts#L27) | `export function auditFieldLabel(field: string): string {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditDisplay.ts#L32) | `export function formatAuditValue(field: string, value: unknown): string {` |
## src/utils/auditEngine.ts

| Line | Existing declaration / event |
|---|---|
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L31) | `function freezeEvent(event: Omit<AuditEvent, 'changes'> & { changes: AuditChange[] }): AuditEvent {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L36) | `function rebuildDerived(sources: AuditSourceRecord[], auditEvents: AuditEvent[]): AuditState {` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L75) | `export function createAuditState(sources: AuditSourceRecord[]): AuditState {` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L79) | `function sourceFor(state: AuditState, sourceId: string) {` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L83) | `function changesFor(source: AuditSourceRecord, patch: CorrectionCommand['patch']): AuditChange[] {` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L93) | `export function validateCorrection(command: CorrectionCommand, state: AuditState): AuditValidation {` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L129) | `function impactNames(source: AuditSourceRecord, fields: string[]) {` |
| [161](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L161) | `export function buildImpactPreview(command: CorrectionCommand, state: AuditState): AuditImpact {` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L168) | `export function applyCorrection(command: CorrectionCommand, state: AuditState): AuditState {` |
| [195](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L195) | `export function validateDelete(command: DeleteCommand, state: AuditState) {` |
| [206](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L206) | `export function applyDelete(command: DeleteCommand, state: AuditState): AuditState {` |
| [226](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L226) | `export function auditTimelineFor(state: AuditState, sourceId: string) {` |
| [230](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/auditEngine.ts#L230) | `export function deletePostingLine(): never {` |
## src/utils/bankEntry.ts

| Line | Existing declaration / event |
|---|---|
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/bankEntry.ts#L53) | `export function bankEntryMeta(type: BankEntryType) {` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/bankEntry.ts#L57) | `export function bankEntryImpact(type: BankEntryType, amount: number, adjustmentDirection: BankEntryDirection) {` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/bankEntry.ts#L70) | `export function validateBankEntry(draft: BankEntryDraft, today: string, activeCashSession: boolean): string  /  null {` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/bankEntry.ts#L86) | `export function toBankEntryPayload(draft: BankEntryDraft): BankEntryPayload {` |
## src/utils/bodyScrollLock.ts

| Line | Existing declaration / event |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/bodyScrollLock.ts#L12) | `export function lockBodyScroll(): () => void {` |
## src/utils/calculatorScratchpad.ts

| Line | Existing declaration / event |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L11) | `export function normalizeCalculatorExpression(raw: string): string {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L20) | `export function evaluateCalculatorExpression(expression: string): CalculatorResult {` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L31) | `function suffix(value: number): Factor {` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L37) | `function number(): number {` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L52) | `function factor(): Factor {` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L71) | `function term(): Factor {` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L88) | `function expr(): number {` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L113) | `export function formatCalculatorNumber(value: number): string {` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L121) | `export function sanitizeCalculatorLines(value: unknown): string[] {` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/calculatorScratchpad.ts#L128) | `export function summarizeCalculatorLines(lines: string[]) {` |
## src/utils/chequeAccount.ts

| Line | Existing declaration / event |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/chequeAccount.ts#L5) | `export function resolveChequeAccount(accounts: FinanceAccount[], cheque: Pick<ChequeRecord, 'depositAccount'  /  'depositAccountId'>, activeOnly = false) {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/chequeAccount.ts#L15) | `export function chequeMoneyAccount(accounts: FinanceAccount[], cheque: Pick<ChequeRecord, 'depositAccount'  /  'depositAccountId'>) {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/chequeAccount.ts#L20) | `export function renameChequeAccountReferences(` |
## src/utils/counterAllocation.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/counterAllocation.ts#L8) | `export function counterOpenInvoices(sources:readonly PartySourceRecord[],partyId:string,asOf:string,relationship:'Customer' / 'Supplier'='Customer'):CounterOpenInvoice[]{` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/counterAllocation.ts#L44) | `export function assertCounterInvoiceAllocation(sources:readonly PartySourceRecord[],payment:PartyPaymentPayload) {` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/counterAllocation.ts#L55) | `export function counterAllocateOldest(invoices:readonly CounterOpenInvoice[],amount:number){` |
## src/utils/currency.ts

| Line | Existing declaration / event |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/currency.ts#L2) | `export function formatNumber(value: number, decimals = 0): string {` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/currency.ts#L10) | `export function formatMoneyNumber(value: number, decimals = Number.isInteger(value) ? 0 : 2): string {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/currency.ts#L15) | `export function taka(value: number, decimals = Number.isInteger(value) ? 0 : 2): string {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/currency.ts#L21) | `export function takaCompact(value: number): string {` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/currency.ts#L30) | `export function roundTo(value: number, step = 5): number {` |
## src/utils/dateRange.ts

| Line | Existing declaration / event |
|---|---|
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/dateRange.ts#L46) | `export function expenseDateIso(value: string): string {` |
## src/utils/daybook.ts

| Line | Existing declaration / event |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/daybook.ts#L16) | `export function filterDaybookTransactions(` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/daybook.ts#L40) | `export function cashflowSummary(transactions: UnifiedTransaction[]) {` |
## src/utils/designGuide.ts

| Line | Existing declaration / event |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/designGuide.ts#L7) | `export function guideBlocks(body: string): GuideBlock[] {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/designGuide.ts#L21) | `export function guideMarkdown(introduction: string, sections: { title: string; body: string }[]): string {` |
## src/utils/financePaymentDrafts.ts

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/financePaymentDrafts.ts#L15) | `export function financePaymentDraftTotal(rows: readonly FinancePaymentDraft[]): number {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/financePaymentDrafts.ts#L28) | `export function accountsForFinanceMethod(accounts: FinanceAccount[], method: FinancePaymentDraft['method']) {` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/financePaymentDrafts.ts#L37) | `export function normalizeFinancePaymentSplits(` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/financePaymentDrafts.ts#L54) | `export function financePaymentSplitsAreValid(rows: FinancePaymentDraft[], accounts: FinanceAccount[], total: number): boolean {` |
## src/utils/financeTransactions.ts

| Line | Existing declaration / event |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/financeTransactions.ts#L3) | `export function chequeMoneyEffect(cheque: ChequeRecord) {` |
## src/utils/focusField.ts

| Line | Existing declaration / event |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/focusField.ts#L2) | `export function focusField(id: string) {` |
## src/utils/fuzzySearch.ts

| Line | Existing declaration / event |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/fuzzySearch.ts#L2) | `export function normalizeSearch(text:string):string {` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/fuzzySearch.ts#L9) | `function closeSpelling(left:string,right:string):boolean {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/fuzzySearch.ts#L24) | `export function searchScore(query:string,values:readonly SearchField[],options:{substring?:boolean;anyToken?:boolean}={}):number / null {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/fuzzySearch.ts#L46) | `export function matchesSearch(query:string,fields:readonly SearchField[]):boolean {` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/fuzzySearch.ts#L50) | `export function rankSearch<T>(records:readonly T[],query:string,fields:(record:T)=>readonly SearchField[]):T[] {` |
## src/utils/globalSearch.ts

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/globalSearch.ts#L6) | `function score(record:SearchResult,query:string,mode:GlobalSearchMode):number / null {` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/globalSearch.ts#L9) | `export function searchResults(records:readonly SearchResult[],query:string,mode:GlobalSearchMode='Default'):SearchResult[] {` |
## src/utils/globalSearchRecords.ts

| Line | Existing declaration / event |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/globalSearchRecords.ts#L11) | `export function globalSearchRecords(state:TenantSettings, actorId:string, language:PersonalSettings['language']):SearchResult[] {` |
## src/utils/lotSellingPrice.ts

| Line | Existing declaration / event |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/lotSellingPrice.ts#L7) | `export function sellingPriceForStockLot(product: Product, lot: StockLot, unit: string): number {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/lotSellingPrice.ts#L13) | `function offeredPrice(product: Product, unit: string, base: number, offers: ProductOffer[]): number {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/lotSellingPrice.ts#L25) | `export function resolveLotSalePrice(` |
## src/utils/moduleUiActions.ts

| Line | Existing declaration / event |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/moduleUiActions.ts#L22) | `export function chequeLifecycleActions(input: { direction: ChequeDirection; status: ChequeStatus }): ChequeLifecycleAction[] {` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/moduleUiActions.ts#L66) | `export function daybookContextActions(source: TransactionSource): DaybookContextAction[] {` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/moduleUiActions.ts#L72) | `export function isManualAccountingSource(source: AccountingSourceTransaction['source']) {` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/moduleUiActions.ts#L80) | `export function openingBalanceLines(` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/moduleUiActions.ts#L97) | `export function auditDeleteImpact(source: Pick<AuditSourceRecord, 'source'> & Partial<AuditSourceRecord>) {` |
## src/utils/multiUnitTransactions.ts

| Line | Existing declaration / event |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/multiUnitTransactions.ts#L13) | `export function freezeUnitProfile(product: Product): FrozenUnitProfile {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/multiUnitTransactions.ts#L27) | `export function assertUnitQuantities(profile:FrozenUnitProfile, quantities:UnitQuantityMap):void {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/multiUnitTransactions.ts#L36) | `export function unitQuantitiesBase(profile:FrozenUnitProfile,quantities:UnitQuantityMap):number {` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/multiUnitTransactions.ts#L44) | `export function unitQuantitiesSaleTotal(` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/multiUnitTransactions.ts#L58) | `export function describeUnitQuantities(` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/multiUnitTransactions.ts#L66) | `export function unitMapFromLegacy(` |
## src/utils/numericStep.ts

| Line | Existing declaration / event |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/numericStep.ts#L2) | `export function wholeNumberStep(value:string,direction:1 / -1,min:string / number=0,max?:string / number):string / null {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/numericStep.ts#L20) | `export function isZeroNumberText(value:string):boolean {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/numericStep.ts#L24) | `export function wheelStepDirection(event:{deltaY:number;deltaX:number;ctrlKey?:boolean;metaKey?:boolean;altKey?:boolean;shiftKey?:boolean}):1 / -1 / null {` |
## src/utils/partyActions.ts

| Line | Existing declaration / event |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyActions.ts#L20) | `export function partySourceRoute(row:PartyLedgerRow):string / null {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyActions.ts#L27) | `export function ledgerActionAvailability(` |
## src/utils/partyFinance.ts

| Line | Existing declaration / event |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyFinance.ts#L18) | `export function financeRelationshipSourceRows(state:PartyPreviewState,partyId:string,role:PartyRelationship):PartyLedgerRow[]{` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyFinance.ts#L26) | `export function financePartyMoneyImpact(sources:readonly PartySourceRecord[],partyId:string):number {` |
## src/utils/partyIdentity.ts

| Line | Existing declaration / event |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyIdentity.ts#L7) | `export function validatePartyDraft(draft: PartyDraft, existing: Party[], editingId?: string): string[] {` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyIdentity.ts#L17) | `export function resolvePartySelection(parties: Party[], id?: string, role?: string): {partyId:string; relationship:PartyRelationship} / null {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyIdentity.ts#L23) | `export function matchesPartySearch(party: Party, raw: string): boolean {` |
## src/utils/partyImport.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyImport.ts#L8) | `function csvRows(input:string):string[][] {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyImport.ts#L38) | `export function parsePartyCsv(content:string):PartyCsvResult {` |
## src/utils/partyLedger.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyLedger.ts#L8) | `function validIso(value:string):boolean {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyLedger.ts#L13) | `function checkRange(range:IsoRange,today:string):void {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyLedger.ts#L20) | `export function projectPartyStatement(` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyLedger.ts#L49) | `export function pagedStatementRows(statement:LedgerStatement,page:number,pageSize:number,descending=false):LedgerStatement['rows'] {` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyLedger.ts#L55) | `export function computePartyBalanceSummary(` |
## src/utils/partyLedgerImpact.ts

| Line | Existing declaration / event |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyLedgerImpact.ts#L4) | `export function ledgerImpact(row:PartyLedgerRow):LedgerImpact {` |
## src/utils/partyOpening.ts

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyOpening.ts#L6) | `export function isPartyOpening(source:PartySourceRecord):boolean {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyOpening.ts#L11) | `export function activePartyOpening(sources:readonly PartySourceRecord[],partyId:string,role:PartyRole):PartySourceRecord / undefined {` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyOpening.ts#L14) | `export function validateOpening(payload:PartyOpeningPayload,party:Party,sources:readonly PartySourceRecord[]):void {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyOpening.ts#L26) | `export function makeOpeningSource(payload:PartyOpeningPayload,sequence:number,id:string):PartySourceRecord {` |
## src/utils/partyPayment.ts

| Line | Existing declaration / event |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyPayment.ts#L10) | `export function validateBusinessDate(date:string):void {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyPayment.ts#L15) | `export function validatePartySplits(splits:readonly PartyMoneySplit[],amount:number,accounts:readonly FinanceAccount[]=financeAccounts):void {` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyPayment.ts#L34) | `export function validatePartyPayment(payload:PartyPaymentPayload,accounts:readonly FinanceAccount[]=financeAccounts):void {` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyPayment.ts#L42) | `export function validatePartyRefund(payload:PartyRefundPayload):void {` |
## src/utils/partySettlement.ts

| Line | Existing declaration / event |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partySettlement.ts#L23) | `function asOfValid(date:string){` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partySettlement.ts#L27) | `function settle(events:readonly PartySourceRecord[],partyId:string,asOf:string,relationship:'Customer' / 'Supplier'){` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partySettlement.ts#L101) | `export function customerSettlementAsOf(sources:readonly PartySourceRecord[],partyId:string,date:string):CustomerSettlementState{` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partySettlement.ts#L108) | `export function supplierSettlementAsOf(sources:readonly PartySourceRecord[],partyId:string,date:string):SupplierSettlementState{` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partySettlement.ts#L116) | `export function validateCustomerPayment(state:CustomerSettlementState,input:CustomerPaymentInput):SettlementPreview {` |
| [127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partySettlement.ts#L127) | `export function validateCustomerRefund(state:CustomerSettlementState,input:CustomerRefundInput):SettlementPreview {` |
## src/utils/partyStatement.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyStatement.ts#L8) | `export function statementPrintRows(statement:LedgerStatement):LedgerStatement['rows'] {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/partyStatement.ts#L11) | `export function serializePartyStatementCsv(` |
## src/utils/permissions.ts

| Line | Existing declaration / event |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/permissions.ts#L10) | `export function sourcePermissionGroup(source: PermissionSource): PermissionGroup {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/permissions.ts#L19) | `function has(granted: ReadonlySet<string>, permission: string) {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/permissions.ts#L23) | `function sourcePermission(source: PermissionSource, action: SourceAction) {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/permissions.ts#L27) | `export function canDaybookAction(action: DaybookAction, source: TransactionSource, granted: ReadonlySet<string>) {` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/permissions.ts#L34) | `export function canAuditAction(action: AuditAction, source: PermissionSource, granted: ReadonlySet<string>) {` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/permissions.ts#L55) | `export function daybookActionAvailability(source: TransactionSource, granted: ReadonlySet<string>) {` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/permissions.ts#L63) | `export function auditActionAvailability(source: PermissionSource, granted: ReadonlySet<string>) {` |
## src/utils/posCheckoutValidation.ts

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posCheckoutValidation.ts#L6) | `export function posMoney(value:string):number {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posCheckoutValidation.ts#L13) | `export function posUnitPrice(value:string):number {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posCheckoutValidation.ts#L26) | `export function validatePosCheckout(draft:CheckoutDraft,accounts?:Record<string,readonly string[]>):PosCheckoutIssue / null {` |
## src/utils/posMultiUnit.ts

| Line | Existing declaration / event |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posMultiUnit.ts#L13) | `export function saleLineQuantities(line:CartLine): Record<string,string> {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posMultiUnit.ts#L16) | `export function saleLineBaseQty(line:CartLine):number {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posMultiUnit.ts#L20) | `export function freezeSaleLineProfile(line:CartLine):FrozenUnitProfile {` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posMultiUnit.ts#L29) | `export function saleLineTotal(line:CartLine):number {` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posMultiUnit.ts#L39) | `export function saleLineDescription(line:CartLine):string {` |
## src/utils/posQuantity.ts

| Line | Existing declaration / event |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posQuantity.ts#L1) | `function numberValue(value: string  /  number): number {` |
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posQuantity.ts#L6) | `function cleanNumber(value: number): string {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posQuantity.ts#L11) | `export function compoundBaseQuantity(` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posQuantity.ts#L21) | `export function compoundLineTotal(` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posQuantity.ts#L34) | `export function normalizeCompoundQuantity(` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posQuantity.ts#L54) | `export function formatCompoundQuantity(` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posQuantity.ts#L69) | `function escapeRegExp(value: string): string {` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posQuantity.ts#L73) | `export function parseCompoundQuantity(` |
## src/utils/posStock.ts

| Line | Existing declaration / event |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posStock.ts#L3) | `function isExpiredLot(lot: StockLot, now: Date): boolean {` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posStock.ts#L9) | `export function saleAvailableStock(product: Product, lots: StockLot[], now = new Date()): number {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posStock.ts#L22) | `export function saleStockShortage(product: Product, lots: StockLot[], requestedBaseQty: number, now = new Date()): number {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posStock.ts#L27) | `export function quantityFromBaseStock(baseQty: number, factor: number, useAlternateUnit: boolean) {` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/posStock.ts#L35) | `export function blendedVendorUnitCost(requestedBaseQty: number, availableOwnStock: number, ownUnitCost: number, vendorUnitCost: number): number {` |
## src/utils/printUnitQuantity.ts

| Line | Existing declaration / event |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/printUnitQuantity.ts#L14) | `export function freezeInvoiceUnitNames(quantity: string): Record<string, string> {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/printUnitQuantity.ts#L23) | `export function formatPrintQuantity(` |
## src/utils/productDraft.ts

| Line | Existing declaration / event |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L22) | `export function draftUnitRelations(d: ProductDraft): UnitRelation[] {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L28) | `export function factorsOf(d: ProductDraft): Record<string, number> {` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L53) | `export function convertPrice(d: ProductDraft, amount: string, from: string, to: string) {` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L57) | `export function convertQty(d: ProductDraft, amount: string, from: string, to: string) {` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L63) | `export function removeDraftLevel(d: ProductDraft, id: string): ProductDraft  /  null {` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L66) | `const removed = d.unitLevels[index];` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L92) | `export function deriveDraft(d: ProductDraft, isEdit: boolean, existingSerials: string[]): DraftDerived {` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L119) | `export function validateDraft(d: ProductDraft, isEdit: boolean, x: DraftDerived): FieldErrors {` |
| [199](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L199) | `export function errorSection(key: ErrorKey): 'main'  /  'advanced'  /  'other' {` |
| [206](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L206) | `export function buildProduct(d: ProductDraft, x: DraftDerived, isEdit: boolean, existing?: ExistingProduct): SaveResult {` |
| [210](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productDraft.ts#L210) | `const saved = existing.unitRelations ?? (existing.altUnit ? [{ leftUnit: existing.altUnit.unit, rightUnit: existing.unit, quantity: existing.altUnit.factor }] : []);` |
## src/utils/productEntry.ts

| Line | Existing declaration / event |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productEntry.ts#L1) | `function numeric(value: string  /  number): number {` |
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productEntry.ts#L6) | `function factorFor(` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productEntry.ts#L16) | `export function toBaseQuantity(` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productEntry.ts#L26) | `export function toBasePrice(` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productEntry.ts#L37) | `export function switchQuantityUnit(` |
## src/utils/productFeatures.ts

| Line | Existing declaration / event |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L11) | `export function normalizeSerials(input: string): string[] {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L18) | `export function duplicateSerials(serials: string[], existing: string[] = []): string[] {` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L31) | `export function requiredSerialCount(product: Product, baseQuantity: number): number {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L36) | `export function warrantySnapshot(product: Product): WarrantySnapshot  /  undefined {` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L47) | `export function offerStatus(offer: ProductOffer, now = new Date()): ProductOfferStatus {` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L56) | `export function offerDiscountInBaseUnit(product: Product, offer: ProductOffer): number {` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L62) | `export function effectiveOfferPrice(product: Product, offer: ProductOffer): number {` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L66) | `export function validateOffer(product: Product, offer: ProductOffer, others: ProductOffer[]): string  /  null {` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L94) | `export function lotExpiryState(` |
| [107](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L107) | `export function productStockBreakdown(product: Product, lots: StockLot[], now = new Date()) {` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L134) | `export function allocatableLots(product: Product, lots: StockLot[], now = new Date()): StockLot[] {` |
| [150](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L150) | `export function availableSerials(product: Product, lots: StockLot[], now = new Date()): string[] {` |
| [155](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L155) | `export function effectivePriceForUnit(product: Product, offer: ProductOffer  /  undefined, unit: string): number {` |
| [166](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L166) | `export function activeOfferFor(productId: string, offers: ProductOffer[], now = new Date()): ProductOffer  /  undefined {` |
| [170](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFeatures.ts#L170) | `export function allocateLotQuantity(product: Product, lots: StockLot[], quantity: number, now = new Date()) {` |
## src/utils/productFormInitial.ts

| Line | Existing declaration / event |
|---|---|
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productFormInitial.ts#L43) | `export function initialProductDraft(defaults: ProductSettings, product?: Product  /  null): ProductDraft {` |
## src/utils/productMasterEdit.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productMasterEdit.ts#L8) | `export function validateMasterRename(previous: string, proposed: string, options: readonly string[], noun: string): string {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/productMasterEdit.ts#L18) | `export function validateUnitRename(` |
## src/utils/purchaseCart.ts

| Line | Existing declaration / event |
|---|---|
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCart.ts#L29) | `export function baseQty(line: PurchaseCartLine): number {` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCart.ts#L34) | `export function priceInUnit(basePrice: number, product: Product, unit: string): number {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCart.ts#L38) | `export function baseCost(line: PurchaseCartLine): number {` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCart.ts#L44) | `export function enteredLotBaseSellPrice(line: PurchaseCartLine): number  /  undefined {` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCart.ts#L52) | `export function lotBaseSellPrice(line: PurchaseCartLine): number {` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCart.ts#L56) | `export function lineAmount(line: PurchaseCartLine): number {` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCart.ts#L67) | `export function describeQty(line: PurchaseCartLine): string {` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCart.ts#L76) | `export function makePurchaseLine(product: Product): PurchaseCartLine {` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCart.ts#L96) | `export function switchPurchaseUnit(line: PurchaseCartLine, nextUnit: string): PurchaseCartLine {` |
## src/utils/purchaseCheckout.ts

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCheckout.ts#L6) | `export function paymentRemainder(total: number, payments: PurchasePaymentAmount[], rowId: string): number {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseCheckout.ts#L12) | `export function calculatePurchaseCheckout(` |
## src/utils/purchasePaymentMethods.ts

| Line | Existing declaration / event |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchasePaymentMethods.ts#L15) | `export function makePurchasePaymentRow(index = 0, method: PurchasePaymentMethod = 'Cash'): PurchasePaymentRow {` |
## src/utils/purchaseSupplierGuard.ts

| Line | Existing declaration / event |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseSupplierGuard.ts#L3) | `export function purchaseSupplierGuard(selectedSupplierId:string,lockedVendorId?:string):string / null{` |
## src/utils/reconciliation.ts

| Line | Existing declaration / event |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/reconciliation.ts#L4) | `export function reconciliationMatchError(row:StatementTransaction,entry:ErpReconciliationTransaction,rows:readonly StatementTransaction[]):string / null {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/reconciliation.ts#L13) | `export function canCompleteReconciliation(rows:readonly StatementTransaction[],entries:readonly ErpReconciliationTransaction[],difference:number):boolean {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/reconciliation.ts#L20) | `export function reconciliationCsv(rows:readonly StatementTransaction[]):string {` |
## src/utils/reorderCartLines.ts

| Line | Existing declaration / event |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/reorderCartLines.ts#L2) | `export function reorderCartLines<T extends { key: string }>(lines: T[], orderedKeys: string[]): T[] {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/reorderCartLines.ts#L12) | `export function moveCartLine<T extends { key: string }>(lines: T[], key: string, delta: number): T[] {` |
## src/utils/reportOutput.ts

| Line | Existing declaration / event |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/reportOutput.ts#L9) | `export function reportHtml(report:Report):string{` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/reportOutput.ts#L15) | `export function reportCsv(headers:string[],rows:(string / number)[][]):string{` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/reportOutput.ts#L20) | `export function printReport(report:Report):boolean{` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/reportOutput.ts#L30) | `export function downloadReport(filename:string,headers:string[],rows:(string / number)[][]):void{` |
## src/utils/salePresets.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/salePresets.ts#L8) | `export function cartFromPreset(lines:readonly SalePresetLine[],products:readonly Product[]):CartLine[] {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/salePresets.ts#L24) | `export function templateCart(lines:readonly CartLine[]) {` |
## src/utils/salesPaymentAmounts.ts

| Line | Existing declaration / event |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/salesPaymentAmounts.ts#L4) | `export function salesPaymentTotal(rows: readonly {amount: string}[]): number {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/salesPaymentAmounts.ts#L12) | `export function positiveSalesAmount(raw: string): number {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/salesPaymentAmounts.ts#L18) | `export function salesPaymentRemainder(due: number, rows: readonly {id: string; amount: string}[], rowId: string): number {` |
## src/utils/salesReturn.ts

| Line | Existing declaration / event |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/salesReturn.ts#L8) | `export function planOrdinaryReturn(invoice:SalesInvoice,line:SaleLine,rawQuantity:string,serials:readonly string[],returns:readonly SalesReturn[]) {` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/salesReturn.ts#L52) | `export function salesReturnCustomerId(item:SalesReturn,invoices:readonly SalesInvoice[],parties:readonly Party[]):string / undefined {` |
## src/utils/transactionDates.ts

| Line | Existing declaration / event |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/transactionDates.ts#L3) | `function createdDate(createdAt: string) {` |
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/transactionDates.ts#L7) | `export function dateForView(transaction: UnifiedTransaction, view: EntryDateView) {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/transactionDates.ts#L11) | `export function isInDateRange(` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/transactionDates.ts#L21) | `export function sortTransactionsByDate(` |
## src/utils/transactionLines.ts

| Line | Existing declaration / event |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/transactionLines.ts#L5) | `export function transactionLineTotal(line:TransactionLineAmount):number{` |
## src/utils/transactionProjection.ts

| Line | Existing declaration / event |
|---|---|
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/transactionProjection.ts#L30) | `function paymentAccount(payment: PaymentSplit) {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/transactionProjection.ts#L36) | `export function projectSaleTransaction(` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/transactionProjection.ts#L71) | `export function projectTransferTransaction(` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/transactionProjection.ts#L99) | `export function projectUnifiedTransactions(groups: UnifiedTransaction[][]) {` |
## src/utils/unitChain.ts

| Line | Existing declaration / event |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/unitChain.ts#L4) | `export function resolveUnitChain(relations: readonly UnitRelation[]) {` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/unitChain.ts#L34) | `export function productUnits(product: Pick<Product, 'unit'  /  'altUnit'  /  'unitRelations'>): string[] {` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/unitChain.ts#L40) | `export function productUnitFactor(product: Pick<Product, 'unit'  /  'altUnit'  /  'unitRelations'>, selectedUnit: string): number {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/unitChain.ts#L46) | `export function quantityToStockUnit(quantity: number, unit: string, product: Pick<Product,'unit' / 'altUnit' / 'unitRelations'>): number {` |
## src/utils/units.ts

| Line | Existing declaration / event |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/units.ts#L6) | `export function formatStock(product: Product): string {` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/units.ts#L35) | `export function unitsFor(product: Product): string[] {` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/units.ts#L40) | `export function priceFor(product: Product, unit: string): number {` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/units.ts#L49) | `export function stockStatus(product: Product): StockStatus {` |
