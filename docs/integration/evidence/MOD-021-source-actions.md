# MOD-021 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/magic-saas/MagicSaasEntry.tsx

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/MagicSaasEntry.tsx#L5) | `export function MagicSaasEntry() {` |
## src/magic-saas/components/Checkbox.tsx

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/Checkbox.tsx#L9) | `function Checkbox({ checked, onCheckedChange, className = '', ...props }, ref) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/Checkbox.tsx#L16) | `onChange={(event) => onCheckedChange?.(event.currentTarget.checked)}` |
## src/magic-saas/components/StatusBadge.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/StatusBadge.tsx#L23) | `export function StatusBadge({ tone = 'neutral', dot = false, children, className = '' }: StatusBadgeProps) {` |
## src/magic-saas/components/brand/Logo.tsx

| Source line | Existing declaration / binding |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/brand/Logo.tsx#L24) | `export function LogoMark({ size = 32, tone = 'color', className, title = 'HisabIQ' }: LogoMarkProps) {` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/brand/Logo.tsx#L57) | `export function Wordmark({ size = 24, tone = 'color', bangla = false, className }: WordmarkProps) {` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/brand/Logo.tsx#L96) | `export function LogoLockup({ size = 32, tone = 'color', bangla = false, className }: LockupProps) {` |
## src/magic-saas/components/layout/FloatingPanel.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/layout/FloatingPanel.tsx#L12) | `export function FloatingPanel({ trigger, children, align = 'right', width = 320, label }: FloatingPanelProps) {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/layout/FloatingPanel.tsx#L13) | `const [open, setOpen] = useState(false);` |
## src/magic-saas/components/saas/AccessRequestCard.tsx

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AccessRequestCard.tsx#L9) | `export function AccessRequestCard({ a, showBusiness }: { a: SupportAccess; showBusiness?: boolean }) {` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AccessRequestCard.tsx#L52) | `<Button kind="ghost" onClick={() => run(saas.ownerDecision(a.id, true))}>Simulate owner approves</Button>` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AccessRequestCard.tsx#L53) | `<Button kind="ghost" onClick={() => run(saas.ownerDecision(a.id, false))}>Simulate owner declines</Button>` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AccessRequestCard.tsx#L56) | `{a.state === 'APPROVED' && <Button kind="primary" disabled={!saas.canFor('support.access', a.tenantId)} onClick={() => run(saas.applyAccess(a.id))}>Apply change</Button>}` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AccessRequestCard.tsx#L57) | `{saas.canFor('support.access', a.tenantId) && <Button onClick={() => run(saas.withdrawAccess(a.id))}>Withdraw</Button>}` |
## src/magic-saas/components/saas/AuditTable.tsx

| Source line | Existing declaration / binding |
|---|---|
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L21) | `export function AuditTable({ events, showBusiness = false }: { events: AuditEvent[]; showBusiness?: boolean }) {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L23) | `const [q, setQ] = useState('');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L24) | `const [group, setGroup] = useState('All areas');` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L25) | `const [actor, setActor] = useState('Everyone');` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L26) | `const [range, setRange] = useState({ from: '', to: '' });` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L47) | `<Button onClick={() => downloadCsv('hisabiq-audit.csv', [['Time', 'Actor', 'Business', 'Action', 'Summary', 'Detail'], ...rows.map((e) => [e.at, e.actor, e.tenantId ?? 'Platform', e.action, e.summary, e.detail ?? ''])])}><ArrowDownToLine className="size-4" />Export</Button>` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L48) | `<Button onClick={() => window.print()}><Printer className="size-4" />Print</Button>` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L52) | `<SearchBox value={q} onChange={setQ} placeholder="Search who, what, invoice or TRX ID" />` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L54) | `<div className="w-full sm:w-[260px]"><AppDateRangePicker label="Event date" value={range} onChange={setRange} /></div>` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L55) | `<div className="w-full sm:w-[170px]"><Select label="Filter by area" value={group} onChange={setGroup} options={areas} /></div>` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L56) | `<div className="w-full sm:w-[190px]"><Select label="Filter by person" value={actor} onChange={setActor} options={actors} /></div>` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/AuditTable.tsx#L57) | `<Button kind="ghost" disabled={!filtered} onClick={reset} className="text-ink-500">Reset</Button>` |
## src/magic-saas/components/saas/BillingLedger.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/BillingLedger.tsx#L13) | `export function BillingLedger({ orders, showBusiness = false, stateFilter = true, empty = 'No payment orders yet.' }: Props) {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/BillingLedger.tsx#L15) | `const [open, setOpen] = useState<string  /  null>(null);` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/BillingLedger.tsx#L16) | `const [state, setState] = useState<'ALL'  /  OrderState>('ALL');` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/BillingLedger.tsx#L27) | `<Select value={state} onChange={(v) => setState(v as 'ALL'  /  OrderState)} options={[{ value: 'ALL', label: 'All states' }, ...Object.entries(orderMeta).map(([k, m]) => ({ value: k, label: m.label }))]} />` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/BillingLedger.tsx#L52) | `<tr key={o.id} onClick={() => setOpen(o.id)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/BillingLedger.tsx#L55) | `<button type="button" onClick={(e) => { e.stopPropagation(); setOpen(o.id); }} className="font-medium text-teal-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">{o.id}</button>` |
## src/magic-saas/components/saas/CheckoutDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L16) | `export function CheckoutDialog({ tenantId, kind, packageId, onClose }: Props) {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L20) | `const [pkgId, setPkgId] = useState(packageId ?? options[0]?.id ?? '');` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L21) | `const [code, setCode] = useState('');` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L22) | `const [method, setMethod] = useState<PaymentMethod>('bKash');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L23) | `const [error, setError] = useState('');` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L35) | `const submit = () => {` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L58) | `<Button onClick={onClose}>Cancel</Button>` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L59) | `<Button kind="primary" disabled={!pkg} onClick={submit}>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L72) | `<Select value={pkgId} onChange={setPkgId} options={options.map((p) => ({ value: p.id, label: ʼ${p.name} · ${taka(p.priceBdt)} ${billingLabel(p)}ʼ }))} />` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L75) | `<Select value={method} onChange={(v) => setMethod(v as PaymentMethod)} options={['bKash', 'Nagad', 'Bank transfer']} />` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L79) | `<Input value={code} onChange={(v) => setCode(v.toUpperCase())} placeholder={autoOffer ? ʼ${autoOffer.name} applies automaticallyʼ : 'e.g. PUJO20'} />` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/CheckoutDialog.tsx#L122) | `function Row({ label, value, helper, strong, tone }: { label: string; value: string; helper?: string; strong?: boolean; tone?: 'success' }) {` |
## src/magic-saas/components/saas/ControlCenterShell.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ControlCenterShell.tsx#L23) | `function ActivePill({ reduced }: { reduced: boolean }) {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ControlCenterShell.tsx#L32) | `function Count({ value, className }: { value: number; className: string }) {` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ControlCenterShell.tsx#L41) | `export function ControlCenterShell() {` |
## src/magic-saas/components/saas/GlobalSearch.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GlobalSearch.tsx#L10) | `export function GlobalSearch() {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GlobalSearch.tsx#L13) | `const [q, setQ] = useState('');` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GlobalSearch.tsx#L14) | `const [open, setOpen] = useState(false);` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GlobalSearch.tsx#L15) | `const [active, setActive] = useState(0);` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GlobalSearch.tsx#L70) | `onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GlobalSearch.tsx#L72) | `onKeyDown={(e) => {` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GlobalSearch.tsx#L91) | `<button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(h)} className={ʼflex w-full items-start gap-3 px-3 py-2 text-left ${i === active ? 'bg-teal-50' : ''}ʼ}>` |
## src/magic-saas/components/saas/GrantDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L9) | `export function GrantDialog({ tenantId, kind, onClose }: { tenantId: string; kind: 'TRIAL'  /  'GRANT'; onClose: () => void }) {` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L14) | `const [feature, setFeature] = useState(options[0]?.key ?? '');` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L15) | `const [days, setDays] = useState(kind === 'TRIAL' ? '14' : '30');` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L16) | `const [memberId, setMemberId] = useState('');` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L17) | `const [reason, setReason] = useState('');` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L18) | `const [error, setError] = useState('');` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L21) | `const submit = () => {` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L32) | `footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!options.length} onClick={submit}>{kind === 'TRIAL' ? 'Start trial' : 'Issue grant'}</Button></>}` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L39) | `<Field label="Feature"><Select value={feature} onChange={setFeature} options={options.map((f) => ({ value: f.key, label: f.label }))} /></Field>` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L40) | `<Field label="Days"><Input type="number" min={1} value={days} onChange={setDays} /></Field>` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L42) | `<Field label="Scope"><Select value={memberId} onChange={setMemberId} options={[{ value: '', label: 'Whole business' }, ...tenant.members.filter((m) => m.status === 'Active').map((m) => ({ value: m.id, label: ʼ${m.name} onlyʼ }))]} /></Field>` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/GrantDialog.tsx#L43) | `<Field label="Reason (saved in audit log)"><Textarea value={reason} onChange={setReason} placeholder={kind === 'TRIAL' ? 'e.g. Owner wants to try warranty before buying' : 'e.g. Compensation for 2-day SMS outage'} /></Field>` |
## src/magic-saas/components/saas/IdentityChip.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/IdentityChip.tsx#L7) | `export function IdentityChip() {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/IdentityChip.tsx#L16) | `<button type="button" onClick={toggle} aria-expanded={open} className="flex items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/IdentityChip.tsx#L44) | `onClick={() => { saas.setStaffId(s.id); close(); }}` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/IdentityChip.tsx#L62) | `function initials(name: string) {` |
## src/magic-saas/components/saas/MessageOwnerDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/MessageOwnerDialog.tsx#L11) | `export function fillTemplate(text: string, t: Tenant, graceDays: number): string {` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/MessageOwnerDialog.tsx#L35) | `export function MessageOwnerDialog({ tenantId, templateId, onClose }: { tenantId: string; templateId: string; onClose: () => void }) {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/MessageOwnerDialog.tsx#L38) | `const [tpl, setTpl] = useState(templateId);` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/MessageOwnerDialog.tsx#L39) | `const [error, setError] = useState('');` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/MessageOwnerDialog.tsx#L49) | `footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.sendNudge(t.id, template.id); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Send {template.channel === 'SMS' ? 'SMS' : 'in-app'}</Button></>}` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/MessageOwnerDialog.tsx#L53) | `<Field label="Template"><Select value={tpl} onChange={setTpl} options={saas.state.templates.map((x) => ({ value: x.id, label: ʼ${x.name} · ${x.channel}ʼ }))} /></Field>` |
## src/magic-saas/components/saas/OrderDetailDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L14) | `export function OrderDetailDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L18) | `const [mode, setMode] = useState<null  /  'reference'  /  'reject'  /  'refund'>(null);` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L19) | `const [ref, setRef] = useState('');` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L20) | `const [file, setFile] = useState<string  /  null>(null);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L21) | `const [reason, setReason] = useState('');` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L22) | `const [amount, setAmount] = useState('');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L23) | `const [error, setError] = useState('');` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L38) | `<Modal title={ʼ${o.id} · ${o.terms.name}ʼ} onClose={onClose} footer={<Button onClick={onClose}>Close</Button>}>` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L78) | `<Field label="Transaction ID"><Input value={ref} onChange={(v) => setRef(v.toUpperCase())} placeholder="e.g. 9KX2M4QP7A" /></Field>` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L81) | `<input type="file" accept="image/*" className="mt-1 block text-xs" onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)} />` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L83) | `<div className="flex justify-end gap-2"><Button onClick={() => setMode(null)}>Cancel</Button><Button kind="primary" onClick={() => run(saas.submitReference(o.id, ref, file))}>Submit for verification</Button></div>` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L88) | `<Field label="Why couldn’t it be matched?"><Textarea value={reason} onChange={setReason} placeholder="e.g. Reference not in bKash statement for 25 Oct" /></Field>` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L89) | `<div className="flex justify-end gap-2"><Button onClick={() => setMode(null)}>Cancel</Button><Button kind="danger" onClick={() => run(saas.rejectPayment(o.id, reason))}>Mark failed</Button></div>` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L95) | `<Field label="Amount ৳"><Input type="number" value={amount} onChange={setAmount} /></Field>` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L96) | `<Field label="Reason"><Input value={reason} onChange={setReason} placeholder="e.g. Paid twice" /></Field>` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L99) | `<div className="flex justify-end gap-2"><Button onClick={() => setMode(null)}>Cancel</Button><Button kind="danger" onClick={() => run(saas.requestRefund(o.id, Number(amount), reason))}>Approve refund</Button></div>` |
| [106](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L106) | `{(o.state === 'PAYMENT_PENDING'  /  /  o.state === 'FAILED') && <Button onClick={() => { setError(''); setMode('reference'); }}>Enter reference for owner</Button>}` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L109) | `<Button kind="primary" disabled={!saas.can('payments.view')} onClick={() => { onClose(); navigate(ʼ/saas/payments?order=${o.id}ʼ); }}>Open in verification</Button>` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L112) | `{o.state === 'ACTIVATION_PENDING' && <Button kind="primary" disabled={!saas.canFor('payments.verify', o.tenantId)} onClick={() => run(saas.activate(o.id))}>Activate benefits</Button>}` |
| [113](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L113) | `{(o.state === 'COMPLETED'  /  /  o.state === 'ACTIVATION_PENDING') && o.total > 0 && <Button disabled={!saas.canFor('payments.refund', o.tenantId)} onClick={() => { setAmount(String(o.total)); setReason(''); setError(''); setMode('refund'); }}>Refund</Button>}` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/OrderDetailDialog.tsx#L114) | `{o.state === 'REFUND_PENDING' && <Button kind="primary" disabled={!saas.canFor('payments.refund', o.tenantId)} onClick={() => run(saas.completeRefund(o.id))}>Mark money returned</Button>}` |
## src/magic-saas/components/saas/RequestChangeDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L10) | `export function RequestChangeDialog({ tenant, ticketId, onClose }: { tenant: Tenant; ticketId?: string; onClose: () => void }) {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L13) | `const [ticket, setTicket] = useState(ticketId ?? tickets[0]?.id ?? '');` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L14) | `const [memberId, setMemberId] = useState('');` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L15) | `const [setting, setSetting] = useState(erpSettingChoices[0].label);` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L18) | `const [after, setAfter] = useState('');` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L19) | `const [reason, setReason] = useState('');` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L20) | `const [error, setError] = useState('');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L29) | `<Button onClick={onClose}>Cancel</Button>` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L30) | `<Button kind="primary" disabled={!tickets.length} onClick={() => { const r = saas.requestAccess({ tenantId: tenant.id, ticketId: ticket, memberId: memberId  /  /  null, changes: [{ setting, before, after: value }], reason }); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Send to owner</Button>` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L38) | `<Field label="Ticket"><Select value={ticket} onChange={setTicket} options={tickets.map((t) => ({ value: t.id, label: ʼ${t.id} · ${t.subject}ʼ }))} /></Field>` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L39) | `<Field label="Applies to"><Select value={memberId} onChange={setMemberId} options={[{ value: '', label: 'Whole business' }, ...tenant.members.map((m) => ({ value: m.id, label: ʼ${m.name} (${m.role}) onlyʼ }))]} /></Field>` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L40) | `<Field label="ERP setting"><Select value={setting} onChange={(v) => { setSetting(v); setAfter(''); }} options={erpSettingChoices.map((c) => c.label)} /></Field>` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L41) | `<Field label={ʼNew value · now “${before}”ʼ}>{choice.options.length ? <Select value={value} onChange={setAfter} options={choice.options} /> : <Input value={after} onChange={(v) => setAfter(v.toUpperCase())} placeholder="New value" />}</Field>` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RequestChangeDialog.tsx#L49) | `<Field label="Reason the owner will see"><Textarea value={reason} onChange={setReason} placeholder="e.g. You asked for invoices to start with KT" /></Field>` |
## src/magic-saas/components/saas/RowActions.tsx

| Source line | Existing declaration / binding |
|---|---|
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RowActions.tsx#L30) | `export function RowActions({` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RowActions.tsx#L39) | `const [open, setOpen] = useState(false);` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RowActions.tsx#L40) | `const [pos, setPos] = useState<Pos  /  null>(null);` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RowActions.tsx#L100) | `<button ref={trigger} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} title="Actions" onClick={() => setOpen(v => !v)} className={ʼinline-flex size-9 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${open ? 'bg-ink-50 text-ink' : ''}ʼ}>` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RowActions.tsx#L116) | `}} onKeyDown={onListKey} style={{` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/RowActions.tsx#L128) | `<button type="button" role="menuitem" data-action-menu-item="" disabled={a.disabled} title={a.hint} onClick={() => {` |
## src/magic-saas/components/saas/SaasBits.tsx

| Source line | Existing declaration / binding |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L25) | `export function PageTitle({ title, bn, description, actions }: { title: string; bn: string; description: string; actions?: React.ReactNode }) {` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L39) | `export function MeterBar({ label, value, pct, helper }: { label: string; value: string; pct: number; helper?: string }) {` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L58) | `export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L67) | `onChange={(e) => onChange(e.target.value)}` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L73) | `<button type="button" aria-label={ʼClear ${placeholder}ʼ} title="Clear" onClick={() => onChange('')} className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink">` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L81) | `export function LoadingList({ rows = 4 }: { rows?: number }) {` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L89) | `export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L119) | `export function Badge({ tone, children, dot }: { tone: StatusTone; children: React.ReactNode; dot?: boolean }) {` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L128) | `export function SummaryStrip({ items }: { items: { label: string; value: React.ReactNode; helper?: React.ReactNode; tone?: 'danger'  /  'warning'  /  'success' }[] }) {` |
| [149](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L149) | `export function Denied({ what, role }: { what: string; role: string }) {` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L168) | `export function EmptyRow({ cols, text }: { cols: number; text: string }) {` |
| [178](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L178) | `export function Feedback({ result, onClose }: { result: { ok: boolean; message: string }  /  null; onClose: () => void }) {` |
| [183](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L183) | `<button type="button" onClick={onClose} className="shrink-0 font-medium underline">` |
| [190](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SaasBits.tsx#L190) | `export function Proposed() {` |
## src/magic-saas/components/saas/SmsCreditPanel.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SmsCreditPanel.tsx#L13) | `export function SmsCreditPanel({ tenant, onBuy }: { tenant: Tenant; onBuy: () => void }) {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SmsCreditPanel.tsx#L15) | `const [all, setAll] = useState(false);` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SmsCreditPanel.tsx#L16) | `const [text, setText] = useState('প্রিয় গ্রাহক, আপনার বকেয়া ৳৪,৪৫০। ধন্যবাদ।');` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SmsCreditPanel.tsx#L17) | `const [recipients, setRecipients] = useState('40');` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SmsCreditPanel.tsx#L26) | `<SettingCard title="SMS credits" titleBn="এসএমএস ক্রেডিট" bodyClassName="" actions={<button type="button" onClick={onBuy} className="text-xs font-medium text-teal-700 hover:underline">Buy credits</button>}>` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SmsCreditPanel.tsx#L52) | `{moves.length > 5 && <button type="button" onClick={() => setAll((v) => !v)} className="w-full border-t border-ink-100 py-2 text-xs font-medium text-teal-700 hover:bg-ink-50">{all ? 'Show recent only' : ʼShow all ${moves.length}ʼ}</button>}` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SmsCreditPanel.tsx#L57) | `<textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="Message text" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600/40" />` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/SmsCreditPanel.tsx#L60) | `<label className="flex items-center gap-1.5">× <input type="number" min={0} value={recipients} onChange={(e) => setRecipients(e.target.value)} aria-label="Recipients" className="ref-control w-20 rounded-lg border border-ink-200 px-2 text-right text-[13px]" /> recipients</label>` |
## src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L13) | `export function VerifyPaymentDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L16) | `const [mode, setMode] = useState<null  /  'reject'  /  'info'>(null);` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L17) | `const [reason, setReason] = useState('');` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L18) | `const [error, setError] = useState('');` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L21) | `const [amount, setAmount] = useState(String(line ? Math.min(line.amount, balance) : balance));` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L43) | `!pending  /  /  !canVerify ? <Button onClick={onClose}>Close</Button> : !o.claimedBy ? (` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L44) | `<><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => run(saas.claimPayment(o.id))}>Claim to review</Button></>` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L46) | `<Button onClick={onClose}>Close</Button>` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L48) | `<><Button onClick={() => setMode(null)}>Back</Button><Button kind={mode === 'reject' ? 'danger' : 'primary'} onClick={() => run(saas.rejectPayment(o.id, reason, mode === 'info'), true)}>{mode === 'reject' ? 'Reject payment' : 'Send request to owner'}</Button></>` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L51) | `<Button kind="ghost" onClick={() => run(saas.claimPayment(o.id, true), true)}>Release</Button>` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L52) | `<Button onClick={() => { setReason(''); setMode('info'); }}>Request info</Button>` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L53) | `<Button kind="danger" onClick={() => { setReason(hardStop ? checks.find((c) => c.level === 'error')!.text : ''); setMode('reject'); }}>Reject</Button>` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L54) | `<Button kind="primary" disabled={hardStop  /  /  ownSubmission} title={ownSubmission ? 'Someone else must verify proof you entered' : hardStop ? 'Resolve the red checks first' : undefined} onClick={() => run(saas.verifyPayment(o.id, Number(amount)), true)}>Verify ৳{Number(amount)  /  /  0}</Button>` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L109) | `<Input type="number" min={0} value={amount} onChange={setAmount} />` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L114) | `<Textarea value={reason} onChange={setReason} placeholder={mode === 'reject' ? 'e.g. TRX not found in our bKash statement for 25 Oct' : 'e.g. Please send the bKash SMS with the full TRX ID'} />` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/billing/VerifyPaymentDialog.tsx#L123) | `function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {` |
## src/magic-saas/components/saas/ops/NewTicketDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L8) | `export function NewTicketDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L11) | `const [f, setF] = useState({ tenantId: list[0]?.id ?? '', subject: '', priority: 'Normal' as Ticket['priority'], channel: 'Phone' as Ticket['channel'], text: '' });` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L12) | `const [error, setError] = useState('');` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L17) | `footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!list.length} onClick={() => { const r = saas.createTicket(f); if (!r.ok) return setError(r.message); toast.success(r.message); onCreated(r.id!); }}>Log ticket</Button></>}` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L21) | `<Field label="Business"><Select value={f.tenantId} onChange={(tenantId) => setF({ ...f, tenantId })} options={list.map((t) => ({ value: t.id, label: ʼ${t.name} · ${t.owner}ʼ }))} /></Field>` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L22) | `<Field label="Came in by"><Select value={f.channel} onChange={(v) => setF({ ...f, channel: v as Ticket['channel'] })} options={['Phone', 'WhatsApp', 'In-app']} /></Field>` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L23) | `<Field label="Priority" hint="High = 1 hour SLA · Normal = 4 hours · Low = 1 day"><Select value={f.priority} onChange={(v) => setF({ ...f, priority: v as Ticket['priority'] })} options={['High', 'Normal', 'Low']} /></Field>` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L24) | `<Field label="Subject"><Input value={f.subject} onChange={(subject) => setF({ ...f, subject })} placeholder="e.g. Can’t print 80 mm receipts" /></Field>` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/NewTicketDialog.tsx#L26) | `<Field label="What the owner said"><Textarea value={f.text} onChange={(text) => setF({ ...f, text })} /></Field>` |
## src/magic-saas/components/saas/ops/ServiceDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L23) | `export function ServiceDialog({ serviceId, onClose }: { serviceId: string; onClose: () => void }) {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L26) | `const [quote, setQuote] = useState(String(sv?.quoteBdt ?? 0));` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L27) | `const [when, setWhen] = useState(sv?.scheduledAt?.slice(0, 16) ?? '2026-10-27T11:00');` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L29) | `const [assignee, setAssignee] = useState(sv?.assignee  /  /  (coordinators.some((c) => c.name === saas.staff.name) ? saas.staff.name : coordinators[0]?.name ?? ''));` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L30) | `const [error, setError] = useState('');` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L55) | `{canEdit && !['COMPLETED', 'CANCELLED', 'IN_PROGRESS'].includes(sv.state) && <Button kind="ghost" onClick={() => run(saas.advanceService(sv.id, 'CANCELLED'))}>Cancel service</Button>}` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L56) | `<Button onClick={onClose}>Close</Button>` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L57) | `{canEdit && primary && <Button kind="primary" onClick={primary.go}>{primary.label}</Button>}` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L80) | `<Field label="Quote (৳)" hint="Catalog: ৳399 call · ৳999 import · from ৳1,999 onboarding"><Input type="number" min={0} value={quote} onChange={setQuote} /></Field>` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L81) | `<Field label="Coordinator"><Select value={assignee} onChange={setAssignee} options={coordinators.map((c) => c.name)} /></Field>` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L86) | `<Field label="Date & time (Dhaka)"><Input type="datetime-local" value={when} onChange={setWhen} /></Field>` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/ServiceDialog.tsx#L87) | `<Field label="Coordinator"><Select value={assignee} onChange={setAssignee} options={coordinators.map((c) => c.name)} /></Field>` |
## src/magic-saas/components/saas/ops/TicketDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketDialog.tsx#L7) | `export function TicketDialog({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketDialog.tsx#L13) | `<Modal title={ʼ${t.id} · ${t.subject}ʼ} onClose={onClose} footer={<Button onClick={onClose}>Close</Button>}>` |
## src/magic-saas/components/saas/ops/TicketThread.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketThread.tsx#L10) | `export function TicketThread({ ticket, onSent }: { ticket: Ticket; onSent?: () => void }) {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketThread.tsx#L12) | `const [kind, setKind] = useState<'public'  /  'internal'>('public');` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketThread.tsx#L13) | `const [text, setText] = useState('');` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketThread.tsx#L14) | `const [error, setError] = useState('');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketThread.tsx#L36) | `<button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={ʼrounded-md px-2.5 py-1 text-xs font-medium ${kind === k ? (k === 'public' ? 'bg-teal-50 text-teal-800' : 'bg-warning-bg text-warning') : 'text-ink-500 hover:bg-ink-50'}ʼ}>` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketThread.tsx#L41) | `<Textarea value={text} onChange={setText} placeholder={kind === 'public' ? 'Write a reply in simple words…' : 'Only HisabIQ staff will see this'} />` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/ops/TicketThread.tsx#L44) | `<Button kind="primary" onClick={() => { const r = saas.replyTicket(ticket.id, kind, text); if (!r.ok) return setError(r.message); toast.success(r.message); setText(''); setError(''); onSent?.(); }}>{kind === 'public' ? 'Send reply' : 'Save note'}</Button>` |
## src/magic-saas/components/saas/packages/BuilderBits.tsx

| Source line | Existing declaration / binding |
|---|---|
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L29) | `export function BuilderShell({ title, subtitle, step, onStep, issues, canEdit, canPublish, dirty, onCancel, onSave, onPublish, children }: ShellProps) {` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L41) | `<Tabs label="Builder steps" value={step} onChange={onStep} items={steps.map((s) => ({ ...s, count: s.id === 'review' && errors ? errors : undefined }))} />` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L48) | `<Button onClick={onCancel}>{dirty ? 'Discard' : 'Close'}</Button>` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L49) | `{idx > 0 && <Button kind="ghost" onClick={() => onStep(steps[idx - 1].id)}>Back</Button>}` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L51) | `<Button kind="primary" onClick={() => onStep(steps[idx + 1].id)}>Next</Button>` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L54) | `{canEdit && <Button onClick={onSave} disabled={!dirty}>Save draft</Button>}` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L55) | `<Button kind="primary" disabled={!canPublish  /  /  errors > 0} title={!canPublish ? 'Only staff with publish permission can publish' : undefined} onClick={onPublish}>Review & publish</Button>` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L64) | `export function IssueList({ issues }: { issues: Issue[] }) {` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L83) | `export function Advanced({ children, label = 'Advanced' }: { children: React.ReactNode; label?: string }) {` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L84) | `const [open, setOpen] = useState(false);` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L87) | `<button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between px-3 py-2 text-[13px] font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L96) | `export function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {` |
| [105](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L105) | `export function PublishDialog({ name, impact, onClose, onConfirm }: { name: string; impact: string[]; onClose: () => void; onConfirm: (summary: string) => void }) {` |
| [106](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L106) | `const [summary, setSummary] = useState('');` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L111) | `footer={<><Button onClick={onClose}>Keep editing</Button><Button kind="primary" disabled={!summary.trim()} onClick={() => onConfirm(summary.trim())}>Publish</Button></>}` |
| [115](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/BuilderBits.tsx#L115) | `<Field label="What changed (saved with the version)"><Input value={summary} onChange={setSummary} placeholder="e.g. Added 100 SMS each month" /></Field>` |
## src/magic-saas/components/saas/packages/OfferBuilder.tsx

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L20) | `export function OfferBuilder({ initial, onClose }: { initial: Offer; onClose: () => void }) {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L22) | `const [o, setO] = useState<Offer>(initial);` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L23) | `const [step, setStep] = useState('details');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L24) | `const [publishing, setPublishing] = useState(false);` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L25) | `const [estimate, setEstimate] = useState('50');` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L44) | `const save = () => {` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L62) | `onSave={save}` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L67) | `<Field label="Offer name"><Input value={o.name} onChange={(v) => set('name', v)} placeholder="e.g. Pohela Boishakh 15% off" /></Field>` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L68) | `<Field label="Offer type"><Select value={o.type} onChange={(v) => set('type', v as OfferType)} options={Object.entries(typeMeta).map(([value, m]) => ({ value, label: m.label }))} /></Field>` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L69) | `<Field label={typeMeta[o.type].value}><Input type="number" min={0} value={o.value} onChange={(v) => set('value', Number(v))} /></Field>` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L70) | `{o.type === 'INTRO' && <Field label="Intro periods"><Input type="number" min={1} value={o.introPeriods} onChange={(v) => set('introPeriods', Number(v))} /></Field>}` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L71) | `<Field label="How it applies"><Select value={o.code === null ? 'AUTO' : 'CODE'} onChange={(v) => set('code', v === 'AUTO' ? null : o.code ?? '')} options={[{ value: 'AUTO', label: 'Automatically at checkout' }, { value: 'CODE', label: 'With a coupon code' }]} /></Field>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L72) | `{o.code !== null && <Field label="Coupon code"><Input value={o.code} onChange={(v) => set('code', v.toUpperCase().replace(/\s/g, ''))} placeholder="BOISHAKH15" /></Field>}` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L99) | `<Field label="Who is eligible"><Select value={o.audience} onChange={(v) => set('audience', v as Offer['audience'])} options={[{ value: 'ALL', label: 'All businesses' }, { value: 'NEW', label: 'New customers (never paid)' }, { value: 'EXISTING', label: 'Existing paying customers' }, { value: 'SELECTED', label: 'Selected businesses' }]} /></Field>` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L100) | `<Field label="Starts"><Input type="date" value={o.startsAt} onChange={(v) => set('startsAt', v)} /></Field>` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L101) | `<Field label="Ends"><Input type="date" value={o.endsAt} onChange={(v) => set('endsAt', v)} /></Field>` |
| [117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L117) | `<Field label="Total redemptions (blank = no limit)"><Input type="number" min={1} value={o.maxRedemptions ?? ''} onChange={(v) => set('maxRedemptions', v === '' ? null : Number(v))} /></Field>` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L118) | `<Field label="Per business"><Input type="number" min={1} value={o.perBusiness} onChange={(v) => set('perBusiness', Number(v))} /></Field>` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L119) | `<Field label="Minimum purchase ৳"><Input type="number" min={0} value={o.minPurchase} onChange={(v) => set('minPurchase', Number(v))} /></Field>` |
| [146](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L146) | `<label className="flex items-center gap-2 text-xs text-ink-600">If <input type="number" min={0} value={estimate} onChange={(e) => setEstimate(e.target.value)} aria-label="Estimated redemptions" className="ref-control w-20 rounded-lg border border-ink-200 px-2 text-right text-[13px]" /> businesses redeem:</label>` |
| [170](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/OfferBuilder.tsx#L170) | `onConfirm={() => {` |
## src/magic-saas/components/saas/packages/PackageBuilder.tsx

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L16) | `export function PackageBuilder({ initial, onClose }: { initial: SaasPackage; onClose: () => void }) {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L18) | `const [p, setP] = useState<SaasPackage>(initial);` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L19) | `const [step, setStep] = useState('details');` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L20) | `const [publishing, setPublishing] = useState(false);` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L26) | `const confirmed = saas.state.tariffs.every((t) => t.confirmed);` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L55) | `const save = () => {` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L75) | `onSave={save}` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L80) | `<Field label="Package type"><Select value={p.kind} onChange={(v) => set('kind', v as PackageKind)} options={Object.entries(kindLabel).map(([value, label]) => ({ value, label }))} /></Field>` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L81) | `<Field label="Start from"><Select value="" onChange={startFrom} options={[{ value: '', label: 'Keep current' }, ...saas.state.packages.filter((x) => x.version > 0).map((x) => ({ value: x.id, label: ʼ${x.name} v${x.version}ʼ }))]} /></Field>` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L82) | `{p.kind === 'PLAN' && <Field label="Base plan"><Select value={p.basePlan ?? 'PRO'} onChange={(v) => setP((x) => ({ ...x, basePlan: v as PlanCode, features: [...new Set([...planFeatures[v as PlanCode], ...x.features.filter((f) => !Object.values(planFeatures).flat().includes(f))])], interfaceLevel: levelFromFeatures(planFeatures[v as PlanCode]) }))} options={['FREE', 'COUNTER', 'PRO', 'PLUS']} /></Field>}` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L83) | `<Field label="Name"><Input value={p.name} onChange={(v) => set('name', v)} placeholder="e.g. Pharmacy Starter" /></Field>` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L84) | `<Field label="Billing"><Select value={p.billing} onChange={(v) => set('billing', v as SaasPackage['billing'])} options={[{ value: 'MONTHLY', label: 'Recurring · monthly' }, { value: 'YEARLY', label: 'Recurring · yearly' }, { value: 'PASS', label: 'Fixed-duration pass' }, { value: 'ONE_TIME', label: 'One-time purchase' }]} /></Field>` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L85) | `{p.billing === 'PASS' && <Field label="Pass length (days)"><Input type="number" min={1} value={p.passDays} onChange={(v) => set('passDays', Number(v))} /></Field>}` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L86) | `<div className="sm:col-span-2 lg:col-span-3"><Field label="Description customers see"><Textarea value={p.description} onChange={(v) => set('description', v)} /></Field></div>` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L94) | `<Field label="Price (৳)"><Input type="number" min={0} value={p.priceBdt} onChange={(v) => set('priceBdt', Number(v))} /></Field>` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L95) | `<Field label="Interface level"><Select value={p.interfaceLevel} onChange={(v) => setLevel(v as InterfaceLevel)} options={[{ value: 'BASIC', label: 'Basic' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'PREMIUM', label: 'Premium' }]} /></Field>` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L96) | `<Field label="User limit"><Input type="number" min={1} value={p.userLimit} onChange={(v) => set('userLimit', Number(v))} /></Field>` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L97) | `<Field label="SMS credits"><Input type="number" min={0} value={p.smsCredits} onChange={(v) => set('smsCredits', Number(v))} /></Field>` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L101) | `<Field label="SMS granted"><Select value={p.smsGrant} onChange={(v) => set('smsGrant', v as SaasPackage['smsGrant'])} options={[{ value: 'ONCE', label: 'Once, at activation' }, { value: 'EACH_PERIOD', label: 'Each billing period' }]} /></Field>` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L102) | `<Field label="Credits expire after (days)"><Input type="number" min={1} value={p.smsExpiryDays} onChange={(v) => set('smsExpiryDays', Number(v))} /></Field>` |
| [133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L133) | `<Field label="Storage (GB)"><Input type="number" min={0} step="0.5" value={p.storageGb} onChange={(v) => set('storageGb', Number(v))} /></Field>` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L134) | `<Field label="Reports"><Select value={p.reports} onChange={(v) => set('reports', v as SaasPackage['reports'])} options={['Basic', 'Medium', 'Premium']} /></Field>` |
| [135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L135) | `<Field label="Support"><Select value={p.support} onChange={(v) => set('support', v as SaasPackage['support'])} options={['Standard', 'Priority']} /></Field>` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L144) | `<Field label="Who can buy"><Select value={p.visibility} onChange={(v) => set('visibility', v as SaasPackage['visibility'])} options={[{ value: 'PUBLIC', label: 'Everyone (public)' }, { value: 'INVITE', label: 'Invitation link only' }, { value: 'RESTRICTED', label: 'Selected businesses' }]} /></Field>` |
| [145](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L145) | `<Field label="Available from"><Input type="date" value={p.availableFrom} onChange={(v) => set('availableFrom', v)} /></Field>` |
| [146](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L146) | `<Field label="Available until (optional)"><Input type="date" value={p.availableTo ?? ''} onChange={(v) => set('availableTo', v  /  /  null)} /></Field>` |
| [228](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L228) | `onConfirm={(summary) => {` |
| [230](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/packages/PackageBuilder.tsx#L230) | `const saved = dirty  /  /  !inStore  /  /  p.status !== 'DRAFT' ? saas.savePackage(p) : { ok: true as const, message: '', id: p.id };` |
## src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L9) | `export function CreateBusinessDialog({ onClose }: { onClose: () => void }) {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L12) | `const [f, setF] = useState({ name: '', owner: '', phone: '', district: '', businessType: 'Grocery' as BusinessType });` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L13) | `const [error, setError] = useState('');` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L19) | `footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.createTenant(f); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); if (r.id) navigate(ʼ/saas/tenants/${r.id}ʼ); }}>Create & send invite</Button></>}` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L23) | `<Field label="Business name"><Input value={f.name} onChange={(name) => setF({ ...f, name })} placeholder="e.g. Fresh Mart Mirpur" /></Field>` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L24) | `<Field label="Business type"><Select value={f.businessType} onChange={(v) => setF({ ...f, businessType: v as BusinessType })} options={businessTypes.map((b) => b.type)} /></Field>` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L25) | `<Field label="Owner name"><Input value={f.owner} onChange={(owner) => setF({ ...f, owner })} /></Field>` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L26) | `<Field label="Owner mobile"><Input value={f.phone} onChange={(phone) => setF({ ...f, phone })} placeholder="01711-234567" /></Field>` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/CreateBusinessDialog.tsx#L27) | `<Field label="District"><Input value={f.district} onChange={(district) => setF({ ...f, district })} placeholder="Dhaka" /></Field>` |
## src/magic-saas/components/saas/tenant/HistoryTab.tsx

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/HistoryTab.tsx#L5) | `export function HistoryTab({ tenant }: { tenant: Tenant }) {` |
## src/magic-saas/components/saas/tenant/OverviewTab.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/OverviewTab.tsx#L11) | `export function OverviewTab({ tenant, onTab }: Props) {` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/OverviewTab.tsx#L53) | `<button type="button" onClick={() => onTab(a.tab)} className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-[13px] hover:bg-ink-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/OverviewTab.tsx#L64) | `<SettingCard title="What this business has" titleBn="সুবিধা" bodyClassName="" actions={<button type="button" onClick={() => onTab('plan')} className="text-xs font-medium text-teal-700 hover:underline">Details</button>}>` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/OverviewTab.tsx#L81) | `<SettingCard title="Recent activity" titleBn="সাম্প্রতিক" bodyClassName="" actions={<button type="button" onClick={() => onTab('history')} className="text-xs font-medium text-teal-700 hover:underline">Full history</button>}>` |
## src/magic-saas/components/saas/tenant/PlanUsageTab.tsx

| Source line | Existing declaration / binding |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L17) | `export function PlanUsageTab({ tenant, onCheckout }: { tenant: Tenant; onCheckout: () => void }) {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L19) | `const [source, setSource] = useState<'ALL'  /  EntitlementSource>('ALL');` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L20) | `const [grant, setGrant] = useState<null  /  'TRIAL'  /  'GRANT'>(null);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L21) | `const [revoke, setRevoke] = useState<string  /  null>(null);` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L22) | `const [reason, setReason] = useState('');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L23) | `const [error, setError] = useState('');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L24) | `const [smsCheckout, setSmsCheckout] = useState(false);` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L37) | `<Button kind="primary" className="mt-2" onClick={onCheckout}>Renew plan</Button>` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L48) | `<Button disabled={!saas.canFor('grants.trial', tenant.id)} title={saas.canFor('grants.trial', tenant.id) ? undefined : 'Needs trial permission for this business'} onClick={() => setGrant('TRIAL')}><Timer className="size-4" />Trial</Button>` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L49) | `<Button disabled={!saas.canFor('grants.issue', tenant.id)} title={saas.canFor('grants.issue', tenant.id) ? undefined : 'Only Super Admins issue complimentary grants'} onClick={() => setGrant('GRANT')}><Gift className="size-4" />Grant</Button>` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L55) | `<button key={s} role="tab" aria-selected={source === s} onClick={() => setSource(s)} type="button" className={ʼ-mb-px flex h-11 items-center border-b-2 px-2.5 text-[13px] font-medium transition-colors focus-visible:rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500/30 ${source === s ? 'border-teal-600 text-ink' : 'border-transparent text-ink-500 hover:text-ink'}ʼ}>` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L108) | `footer={<><Button onClick={() => setRevoke(null)}>Cancel</Button><Button kind="danger" onClick={() => { const r = saas.revokeEntitlement(revoke, reason); if (!r.ok) return setError(r.message); toast.success(r.message); setRevoke(null); }}>Revoke</Button></>}` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L112) | `<Field label="Reason"><Input value={reason} onChange={setReason} /></Field>` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/PlanUsageTab.tsx#L121) | `function Meter({ label, value, pct, hideBar }: { label: string; value: string; pct: number; hideBar?: boolean }) {` |
## src/magic-saas/components/saas/tenant/SettingsTab.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L13) | `export function SettingsTab({ tenant }: { tenant: Tenant }) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L16) | `const [draft, setDraft] = useState<TenantSettings>(tenant.settings);` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L17) | `const [error, setError] = useState('');` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L18) | `const [member, setMember] = useState<Member  /  null>(null);` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L19) | `const [memberError, setMemberError] = useState('');` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L27) | `const save = () => {` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L43) | `<Field label="Invoice prefix"><Input value={draft.invoicePrefix} onChange={(v) => set('invoicePrefix', v.toUpperCase())} disabled={!canEdit} /></Field>` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L44) | `<Field label="Language"><Select value={draft.language} onChange={(v) => set('language', v as TenantSettings['language'])} options={['English + Bangla', 'English', 'Bangla']} disabled={!canEdit} /></Field>` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L45) | `<Field label="Screen lock (minutes)"><Input type="number" min={1} value={draft.lockMinutes} onChange={(v) => set('lockMinutes', Number(v))} disabled={!canEdit} /></Field>` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L46) | `<Field label="SMS sender name"><Input value={draft.smsSender  /  /  'Not approved'} onChange={() => undefined} disabled /></Field>` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L49) | `<ToggleRow label="Allow selling below zero stock" helper="Stock can show negative until purchases are entered." checked={draft.allowNegativeStock} onChange={(v) => set('allowNegativeStock', v)} disabled={!canEdit} />` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L50) | `<ToggleRow label="Automatic due reminders" helper="Uses SMS credits. Sent at 10:00 to customers with dues over 7 days." checked={draft.dueReminders} onChange={(v) => set('dueReminders', v)} disabled={!canEdit} />` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L56) | `<Button disabled={!dirty} onClick={() => { setDraft(tenant.settings); setError(''); }}>Discard</Button>` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L57) | `<Button kind="primary" disabled={!dirty} onClick={save}>Save</Button>` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L67) | `actions={canEdit ? <Button onClick={() => { setMemberError(''); setMember({ id: sid('M'), name: '', role: 'Sales', phone: '', status: 'Active', lastSeen: '' }); }}><Plus className="size-4" />Add member</Button> : undefined}` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L94) | `footer={<><Button onClick={() => setMember(null)}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.saveMember(tenant.id, member); if (!r.ok) return setMemberError(r.message); toast.success(r.message); setMember(null); }}>Save</Button></>}` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L98) | `<Field label="Name"><Input value={member.name} onChange={(name) => setMember({ ...member, name })} /></Field>` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L99) | `<Field label="Mobile"><Input value={member.phone} onChange={(phone) => setMember({ ...member, phone })} placeholder="01711-234567" /></Field>` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L100) | `<Field label="Role"><Select value={member.role} onChange={(role) => setMember({ ...member, role: role as Member['role'] })} options={['Owner', 'Manager', 'Sales', 'Viewer']} /></Field>` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L101) | `<Field label="Status"><Select value={member.status} onChange={(status) => setMember({ ...member, status: status as Member['status'] })} options={[{ value: 'Active', label: 'Active' }, { value: 'Disabled', label: 'Paused (can’t sign in)' }]} /></Field>` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SettingsTab.tsx#L111) | `function ToggleRow({ label, helper, checked, onChange, disabled }: { label: string; helper: string; checked: boolean; onChange: (v: boolean) => void; disabled: boolean }) {` |
## src/magic-saas/components/saas/tenant/SignalsPanel.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SignalsPanel.tsx#L14) | `export function SignalsPanel({ tenant }: { tenant: Tenant }) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SignalsPanel.tsx#L16) | `const [message, setMessage] = useState<string  /  null>(null);` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SignalsPanel.tsx#L54) | `<Button onClick={() => { const r = saas.requestGuidedSetup(tenant.id); r.ok ? toast.success(r.message) : toast.error(r.message); }}>Offer guided setup ৳399</Button>` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SignalsPanel.tsx#L63) | `{canMessage && <div className="mt-1.5"><Button onClick={() => setMessage('TPL-UPGRADE')}>Send upgrade nudge</Button></div>}` |
## src/magic-saas/components/saas/tenant/SupportTab.tsx

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SupportTab.tsx#L20) | `export function SupportTab({ tenant }: { tenant: Tenant }) {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SupportTab.tsx#L24) | `const [dialog, setDialog] = useState(false);` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SupportTab.tsx#L25) | `const [ticket, setTicket] = useState<string  /  null>(null);` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SupportTab.tsx#L26) | `const [diagOpen, setDiagOpen] = useState(false);` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SupportTab.tsx#L39) | `<tr key={t.id} onClick={() => setTicket(t.id)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SupportTab.tsx#L40) | `<td className={td}><button type="button" onClick={(e) => { e.stopPropagation(); setTicket(t.id); }} className="font-medium text-teal-700 hover:underline">{t.id}</button><span className="block text-[11px] text-ink-500">{t.subject}</span></td>` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SupportTab.tsx#L57) | `actions={<Button disabled={!canAccess  /  /  !tickets.some((t) => t.status !== 'Resolved')} title={!canAccess ? 'Needs support access for this business' : !tickets.some((t) => t.status !== 'Resolved') ? 'Link an open ticket first' : undefined} onClick={() => setDialog(true)}><Plus className="size-4" />Request change</Button>}` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/saas/tenant/SupportTab.tsx#L66) | `onClick={() => {` |
## src/magic-saas/components/settings/SettingCard.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/components/settings/SettingCard.tsx#L13) | `export function SettingCard({ title, titleBn, description, actions, children, bodyClassName = 'space-y-5 p-4' }: SettingCardProps) {` |
## src/magic-saas/contexts/SaasContext.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/contexts/SaasContext.tsx#L12) | `function useSaasStore(staffId: string) {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/contexts/SaasContext.tsx#L38) | `export function SaasProvider({ staffId, children }: { staffId: string; children: React.ReactNode }) {` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/contexts/SaasContext.tsx#L43) | `export function useSaas(): SaasApi {` |
## src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx

| Source line | Existing declaration / binding |
|---|---|
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L21) | `function Month({` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L47) | `onClick={() => choose(day)}` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L48) | `onKeyDown={(event) => {` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L67) | `export function AppDateRangePicker({ value, onChange, label = 'Date range', className = '', single = false }: Props) {` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L70) | `const [open, setOpen] = useState(false);` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L71) | `const [draft, setDraft] = useState<IsoRange>(value);` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L72) | `const [first, setFirst] = useState(isoDay(utcDate(value.from  /  /  businessToday()).getUTCFullYear(), utcDate(value.from  /  /  businessToday()).getUTCMonth(), 1));` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L73) | `const [position, setPosition] = useState<{ top: number; left: number; width: number; maxHeight: number }  /  null>(null);` |
| [133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L133) | `aria-controls={open ? id : undefined} onClick={() => open ? close() : show()}` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L147) | `<button type="button" aria-label={t('Previous month','আগের মাস')} onClick={() => setFirst(addMonths(first, -1))}` |
| [149](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L149) | `<button type="button" aria-label={t('Next month','পরের মাস')} onClick={() => setFirst(addMonths(first, 1))}` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L160) | `{presets.map((preset) => <button key={preset} type="button" onClick={() => {` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L168) | `<button type="button" onClick={() => commit(empty)}` |
| [171](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L171) | `<button type="button" onClick={close} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-ink-50">{t('Cancel','বাতিল')}</button>` |
| [172](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L172) | `<button type="button" onClick={() => commit(draft)} disabled={!draft.from  /  /  !draft.to}` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L180) | `export function AppDatePicker({ value, onChange, label = 'Date', className = '' }: {` |
| [184](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppDateRangePicker.tsx#L184) | `value={{ from: value, to: value }} onChange={(range) => onChange(range.from)} />;` |
## src/magic-saas/hisabiq-library/components/AppSelect.tsx

| Source line | Existing declaration / binding |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppSelect.tsx#L25) | `export function AppSelect({` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppSelect.tsx#L28) | `const [open, setOpen] = useState(false);` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppSelect.tsx#L30) | `const [active, setActiveState] = useState(0);` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppSelect.tsx#L37) | `const [rect, setRect] = useState<{ left: number; top: number; width: number; maxHeight: number }  /  null>(null);` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppSelect.tsx#L120) | `onKeyDown={onKeyboard}` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppSelect.tsx#L121) | `onClick={(event) => {` |
| [149](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/components/AppSelect.tsx#L149) | `onClick={() => choose(option)}` |
## src/magic-saas/hisabiq-library/i18n/datePickerCopy.ts

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/datePickerCopy.ts#L16) | `export function datePickerMonthLabel(language:UiLanguage,first:string):string {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/datePickerCopy.ts#L21) | `export function datePickerDayLabel(language:UiLanguage,iso:string):string {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/datePickerCopy.ts#L27) | `export function datePickerRangeLabel(language:UiLanguage,value:IsoRange):string {` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/datePickerCopy.ts#L34) | `export function datePickerWord(language:UiLanguage,en:string,bn:string):string {` |
## src/magic-saas/hisabiq-library/i18n/uiCopy.ts

| Source line | Existing declaration / binding |
|---|---|
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/uiCopy.ts#L70) | `export function uiText(language: UiLanguage, english: string, bangla: string): string {` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/uiCopy.ts#L73) | `export function uiWord(language: UiLanguage, key: UiCopyKey): string {` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/uiCopy.ts#L77) | `export function showBanglaHelper(language: UiLanguage): boolean {` |
## src/magic-saas/hisabiq-library/i18n/useUiCopy.ts

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/i18n/useUiCopy.ts#L5) | `export function useUiCopy() {` |
## src/magic-saas/hisabiq-library/motion/MotionTabList.tsx

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/motion/MotionTabList.tsx#L6) | `export function MotionTabList({ children, className, ...props }: ComponentPropsWithoutRef<'div'>) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/motion/MotionTabList.tsx#L16) | `export function MotionTabIndicator({ active }: { active: boolean }) {` |
## src/magic-saas/hisabiq-library/settings/TenantSettingsProvider.tsx

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/settings/TenantSettingsProvider.tsx#L6) | `export function TenantSettingsProvider({ children }: { children: ReactNode }) { return <Settings.Provider value={{ personal }}>{children}</Settings.Provider>; }` |
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/settings/TenantSettingsProvider.tsx#L7) | `export function useTenantSettings() { return useContext(Settings); }` |
## src/magic-saas/hisabiq-library/utils/dateRange.ts

| Source line | Existing declaration / binding |
|---|---|
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/utils/dateRange.ts#L46) | `export function expenseDateIso(value: string): string {` |
## src/magic-saas/hisabiq-library/utils/libraryPortal.tsx

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hisabiq-library/utils/libraryPortal.tsx#L4) | `export function createPortal(children: ReactNode, container: Element  /  DocumentFragment, key?: string  /  null) {` |
## src/magic-saas/hooks/saas/useAdminCommands.ts

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useAdminCommands.ts#L6) | `export function useAdminCommands(core: SaasCore) {` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useAdminCommands.ts#L57) | `const saveTemplate = (t: MessageTemplate): Result =>` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useAdminCommands.ts#L67) | `const saveAnnouncement = (a: Announcement): Result =>` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useAdminCommands.ts#L90) | `const saveStaff = (m: StaffMember): Result =>` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useAdminCommands.ts#L116) | `const updatePlatformSettings = (patch: Partial<PlatformSettings>): Result =>` |
## src/magic-saas/hooks/saas/useBillingCommands.ts

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useBillingCommands.ts#L7) | `export function useBillingCommands(core: SaasCore) {` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useBillingCommands.ts#L43) | `const createRenewalInvoice = (tenantId: string): Result =>` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useBillingCommands.ts#L63) | `const submitReference = (id: string, reference: string, evidence: string  /  null, payer?: string): Result => {` |
## src/magic-saas/hooks/saas/useCatalogCommands.ts

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useCatalogCommands.ts#L6) | `export function useCatalogCommands(core: SaasCore) {` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useCatalogCommands.ts#L9) | `const savePackage = (p: SaasPackage): Result =>` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useCatalogCommands.ts#L45) | `const saveOffer = (o: Offer): Result =>` |
## src/magic-saas/hooks/saas/useFirstLoad.ts

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useFirstLoad.ts#L4) | `export function useFirstLoad(ms = 300): boolean {` |
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useFirstLoad.ts#L5) | `const [loading, setLoading] = useState(true);` |
## src/magic-saas/hooks/saas/useSaasCore.ts

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useSaasCore.ts#L10) | `export function useSaasCore(initialStaffId: string) {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useSaasCore.ts#L11) | `const [state, setState] = useState<SaasState>(createInitialState);` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useSaasCore.ts#L12) | `const [staffId, setStaffId] = useState(initialStaffId);` |
## src/magic-saas/hooks/saas/useSupportCommands.ts

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useSupportCommands.ts#L8) | `function settingPatch(setting: string, after: string): Partial<TenantSettings>  /  null {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useSupportCommands.ts#L26) | `export function useSupportCommands(core: SaasCore) {` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useSupportCommands.ts#L120) | `const createTicket = (input: { tenantId: string; subject: string; priority: Ticket['priority']; channel: Ticket['channel']; text: string }): Result =>` |
| [174](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useSupportCommands.ts#L174) | `const saveArticle = (a: Article): Result =>` |
## src/magic-saas/hooks/saas/useTenantCommands.ts

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useTenantCommands.ts#L10) | `export function effectivePlan(t: { status: string; planCode: PlanCode }): PlanCode {` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useTenantCommands.ts#L14) | `export function useTenantCommands(core: SaasCore) {` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useTenantCommands.ts#L160) | `const createTenant = (input: { name: string; owner: string; phone: string; district: string; businessType: Tenant['businessType'] }): Result =>` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useTenantCommands.ts#L180) | `const updateSettings = (tenantId: string, next: Tenant['settings']): Result =>` |
| [192](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useTenantCommands.ts#L192) | `const saveMember = (tenantId: string, m: Tenant['members'][number]): Result =>` |
## src/magic-saas/hooks/saas/useWorkQueue.ts

| Source line | Existing declaration / binding |
|---|---|
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useWorkQueue.ts#L26) | `export function useWorkQueue(): WorkItem[] {` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/hooks/saas/useWorkQueue.ts#L111) | `function addMinutes(iso: string, mins: number): string {` |
## src/magic-saas/pages/saas/AuditLog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/AuditLog.tsx#L6) | `export function AuditLog() {` |
## src/magic-saas/pages/saas/PackagesOffers.tsx

| Source line | Existing declaration / binding |
|---|---|
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L32) | `export function PackagesOffers({ view = 'plans' }: { view?: 'plans'  /  'addons'  /  'offers' }) {` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L34) | `const [tab, setTab] = useState(view === 'offers' ? 'offers' : 'packages');` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L35) | `const [pkg, setPkg] = useState<SaasPackage  /  null>(null);` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L36) | `const [offer, setOffer] = useState<Offer  /  null>(null);` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L75) | `<Button kind="primary" onClick={() => setOffer(blankOffer())}><Plus className="size-4" />New offer</Button>` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L77) | `<Button kind="primary" onClick={() => setPkg({ ...blankPackage(), kind: view === 'plans' ? 'PLAN' : 'FEATURE', basePlan: view === 'plans' ? 'PRO' : null })}><Plus className="size-4" />{view === 'plans' ? 'New plan version' : 'New add-on'}</Button>` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L82) | `<Tabs label="Catalog" value={tab} onChange={setTab} items={view === 'offers' ? [{ id: 'offers', label: 'Offers', count: offers.length }, { id: 'performance', label: 'Performance' }] : [{ id: 'packages', label: view === 'plans' ? 'Plans' : 'Add-ons', count: packages.length }]} />` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L93) | `<button type="button" onClick={() => setPkg(p)} className="font-medium text-ink hover:text-teal-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">{p.name}</button>` |
| [127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/PackagesOffers.tsx#L127) | `<td className={td}><button type="button" onClick={() => setOffer(o)} className="font-medium text-ink hover:text-teal-700 hover:underline">{o.name}</button><span className="block text-[11px] text-ink-500">{o.packageIds.map((id) => packages.find((p) => p.id === id)?.name).join(', ')}</span></td>` |
## src/magic-saas/pages/saas/Payments.tsx

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/Payments.tsx#L16) | `export function Payments() {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/Payments.tsx#L21) | `const [tab, setTab] = useState<'verify'  /  'activate'  /  'failed'>('verify');` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/Payments.tsx#L46) | `<Tabs label="Verification queues" value={tab} onChange={(v) => setTab(v as typeof tab)} items={[{ id: 'verify', label: 'To verify', count: lists.verify.length }, { id: 'activate', label: 'To activate', count: lists.activate.length }, { id: 'failed', label: 'Rejected', count: lists.failed.length }]} />` |
## src/magic-saas/pages/saas/SmsAdmin.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L14) | `export function SmsAdmin() {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L18) | `const [tab, setTab] = useState(params.get('tab') ?? 'messages');` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L19) | `const [tariffEdit, setTariffEdit] = useState<{ id: string; cost: string; confirmed: boolean }  /  null>(null);` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L20) | `const [reject, setReject] = useState<{ id: string; note: string }  /  null>(null);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L21) | `const [templateEdit, setTemplateEdit] = useState<MessageTemplate  /  null>(null);` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L22) | `const [error, setError] = useState('');` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L54) | `<Tabs label="SMS administration" value={tab} onChange={(v) => { setTab(v); setError(''); setParams(v === 'messages' ? {} : { tab: v }, { replace: true }); }} items={[{ id: 'messages', label: 'Messages', count: failed.length  /  /  undefined }, { id: 'templates', label: 'Owner templates', count: saas.state.templates.length }, { id: 'packages', label: 'Packages & margin' }, { id: 'tariffs', label: 'Supplier tariffs', count: tariffs.length }, { id: 'senders', label: 'Sender names', count: senders.filter((s) => s.status === 'Pending').length  /  /  undefined }, { id: 'providers', label: 'Provider health' }, { id: 'recon', label: 'Reconciliation' }]} />` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L92) | `{canTemplates && <Button kind="ghost" onClick={() => setTemplateEdit({ ...t })}>Edit</Button>}` |
| [209](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L209) | `<Modal title="Edit tariff" onClose={() => setTariffEdit(null)} footer={<><Button onClick={() => setTariffEdit(null)}>Cancel</Button><Button kind="primary" onClick={() => run(saas.setTariff(tariffEdit.id, Number(tariffEdit.cost), tariffEdit.confirmed), () => setTariffEdit(null))}>Save</Button></>}>` |
| [211](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L211) | `<Field label="Cost per segment (৳)"><Input type="number" step="0.01" value={tariffEdit.cost} onChange={(cost) => setTariffEdit({ ...tariffEdit, cost })} /></Field>` |
| [218](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L218) | `<Modal title={ʼEdit template · ${templateEdit.name}ʼ} onClose={() => setTemplateEdit(null)} footer={<><Button onClick={() => setTemplateEdit(null)}>Cancel</Button><Button kind="primary" onClick={() => run(saas.saveTemplate(templateEdit), () => setTemplateEdit(null))}>Save</Button></>}>` |
| [220](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L220) | `<Field label="Name"><Input value={templateEdit.name} onChange={(name) => setTemplateEdit({ ...templateEdit, name })} /></Field>` |
| [221](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L221) | `<Field label="Message" hint="Placeholders: {business} {plan} {date} {used} {limit} {what} {suggested} {newLimit} {diff} {pct} {nextStep} {graceEnds}"><Textarea value={templateEdit.text} onChange={(text) => setTemplateEdit({ ...templateEdit, text })} /></Field>` |
| [228](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L228) | `<Modal title="Reject sender name" onClose={() => setReject(null)} footer={<><Button onClick={() => setReject(null)}>Cancel</Button><Button kind="danger" onClick={() => run(saas.decideSender(reject.id, false, reject.note), () => setReject(null))}>Reject</Button></>}>` |
| [229](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SmsAdmin.tsx#L229) | `<Field label="Note the business will see"><Input value={reject.note} onChange={(note) => setReject({ ...reject, note })} /></Field>` |
## src/magic-saas/pages/saas/SupportAccessQueue.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SupportAccessQueue.tsx#L11) | `export function SupportAccessQueue() {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SupportAccessQueue.tsx#L13) | `const [tab, setTab] = useState<'approved'  /  'waiting'  /  'closed'>('approved');` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/SupportAccessQueue.tsx#L33) | `<Tabs label="Access requests" value={tab} onChange={(v) => setTab(v as typeof tab)} items={[{ id: 'approved', label: 'Ready to apply', count: lists.approved.length }, { id: 'waiting', label: 'Waiting for owner', count: lists.waiting.length }, { id: 'closed', label: 'Closed', count: lists.closed.length }]} />` |
## src/magic-saas/pages/saas/TenantWorkspace.tsx

| Source line | Existing declaration / binding |
|---|---|
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L21) | `export function TenantWorkspace() {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L26) | `const [loading, setLoading] = useState(true);` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L27) | `const [checkout, setCheckout] = useState(false);` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L28) | `const [statusDialog, setStatusDialog] = useState(false);` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L81) | `{saas.canFor('tenants.edit', tenant.id) && <Button onClick={() => setStatusDialog(true)}>Account status</Button>}` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L82) | `<Button kind="primary" disabled={tenant.account !== 'Active'} title={tenant.account !== 'Active' ? 'Reactivate the account first' : undefined} onClick={() => setCheckout(true)}>` |
| [99](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L99) | `onChange={(id) => setParams(id === 'overview' ? {} : { tab: id }, { replace: true })}` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L122) | `function Fact({ label, value, tone }: { label: string; value: string; tone?: 'neutral'  /  'warning'  /  'danger' }) {` |
| [131](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L131) | `function StatusDialog({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {` |
| [133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L133) | `const [action, setAction] = useState<'suspend'  /  'reactivate'  /  'archive'>(tenant.account === 'Active' ? 'suspend' : 'reactivate');` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L134) | `const [reason, setReason] = useState('');` |
| [135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L135) | `const [error, setError] = useState('');` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L143) | `<Button onClick={onClose}>Cancel</Button>` |
| [146](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L146) | `onClick={() => {` |
| [163](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L163) | `onChange={(v) => { setAction(v as typeof action); setError(''); }}` |
| [171](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L171) | `<Field label="Reason (saved in audit log)"><Textarea value={reason} onChange={setReason} placeholder="e.g. Chargeback under review" /></Field>` |
| [173](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L173) | `{tenant.invite === 'Pending' && <Button kind="ghost" onClick={() => { const r = saas.resendInvite(tenant.id); r.ok ? toast.success(r.message) : setError(r.message); }}>Resend owner invitation</Button>}` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/TenantWorkspace.tsx#L180) | `onClick={() => {` |
## src/magic-saas/pages/saas/admin/Announcements.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L14) | `export function Announcements() {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L16) | `const [edit, setEdit] = useState<Announcement  /  null>(null);` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L26) | `actions={canEdit && <Button kind="primary" onClick={() => setEdit({ id: sid('AN'), title: '', body: '', channel: 'In-app', plans: ['FREE', 'COUNTER', 'PRO', 'PLUS'], tenantIds: [], state: 'DRAFT', scheduledAt: '2026-10-26T10:00:00+06:00', createdBy: '', reach: 0 })}><Plus className="size-4" />New announcement</Button>}` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L35) | `<td className={td}><button type="button" onClick={() => setEdit(a)} className="font-medium text-ink hover:text-teal-700 hover:underline">{a.title}</button><span className="block max-w-[360px] truncate text-[11px] text-ink-500">{a.channel} · {a.body}</span></td>` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L61) | `function AnnouncementDialog({ initial, canEdit, onClose }: { initial: Announcement; canEdit: boolean; onClose: () => void }) {` |
| [63](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L63) | `const [a, setA] = useState(initial);` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L64) | `const [error, setError] = useState('');` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L67) | `<Modal title={a.title  /  /  'New announcement'} onClose={onClose} footer={canEdit ? <><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.saveAnnouncement(a); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Save draft</Button></> : <Button onClick={onClose}>Close</Button>}>` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L69) | `<Field label="Title"><Input value={a.title} onChange={(title) => setA({ ...a, title })} disabled={!canEdit} /></Field>` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L70) | `<Field label="Message"><Textarea value={a.body} onChange={(body) => setA({ ...a, body })} disabled={!canEdit} /></Field>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L72) | `<Field label="Channel"><Select value={a.channel} onChange={(v) => setA({ ...a, channel: v as Announcement['channel'] })} options={['In-app', 'SMS', 'In-app + SMS']} disabled={!canEdit} /></Field>` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L73) | `<Field label="Send at (Dhaka)"><Input type="datetime-local" value={a.scheduledAt.slice(0, 16)} onChange={(v) => setA({ ...a, scheduledAt: ʼ${v}:00+06:00ʼ })} disabled={!canEdit} /></Field>` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Announcements.tsx#L80) | `<input type="checkbox" className="size-4 accent-teal-600" disabled={!canEdit} checked={a.plans.includes(p)} onChange={() => setA({ ...a, plans: a.plans.includes(p) ? a.plans.filter((x) => x !== p) : [...a.plans, p] })} />{p}` |
## src/magic-saas/pages/saas/admin/PlatformReports.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformReports.tsx#L12) | `export function PlatformReports() {` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformReports.tsx#L31) | `actions={saas.can('reports.export') && <Button onClick={() => downloadCsv('hisabiq-platform.csv', [['Plan', 'Businesses', 'MRR'], ...byPlan.map((r) => [r.plan, r.businesses, r.mrr])])}><Download className="size-4" />CSV</Button>}` |
## src/magic-saas/pages/saas/admin/PlatformSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L10) | `export function PlatformSettings() {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L12) | `const [draft, setDraft] = useState<Settings>(saas.state.settings);` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L13) | `const [error, setError] = useState('');` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L25) | `<Field label="Timezone"><Input value={draft.timezone} onChange={() => undefined} disabled /></Field>` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L26) | `<Field label="Currency"><Input value={draft.currency} onChange={() => undefined} disabled /></Field>` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L27) | `<Field label="Grace period (days)" hint="After a plan ends, before falling back to Free."><Input type="number" min={0} value={draft.graceDays} onChange={(v) => setDraft({ ...draft, graceDays: Number(v) })} disabled={!canEdit} /></Field>` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L38) | `<Field label="Method"><Select value={a.method} onChange={() => undefined} options={[a.method]} disabled /></Field>` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L39) | `<Field label="Label"><Input value={a.label} onChange={(label) => setAcc(a.id, { label })} disabled={!canEdit} /></Field>` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L40) | `<Field label="Number"><Input value={a.number} onChange={(number) => setAcc(a.id, { number })} disabled={!canEdit} /></Field>` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L49) | `<Button disabled={!dirty} onClick={() => { setDraft(saas.state.settings); setError(''); }}>Discard</Button>` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L50) | `<Button kind="primary" disabled={!dirty} onClick={() => { const r = saas.updatePlatformSettings(draft); if (!r.ok) return setError(r.message); toast.success(r.message); setError(''); }}>Save</Button>` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/PlatformSettings.tsx#L51) | `<Button kind="ghost" onClick={() => { const r = saas.reset(); r.ok ? toast.success(r.message) : toast.error(r.message); }}>Reset demo data</Button>` |
## src/magic-saas/pages/saas/admin/Team.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L13) | `export function Team() {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L15) | `const [tab, setTab] = useState('people');` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L16) | `const [edit, setEdit] = useState<StaffMember  /  null>(null);` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L27) | `actions={canEdit && tab === 'people' && <Button kind="primary" onClick={() => setEdit({ id: sid('ST'), name: '', staffId: ʼHQ-${String(saas.state.staff.length + 1).padStart(3, '0')}ʼ, email: '', phone: '', status: 'Active', assignments: [{ roleId: 'SUPPORT_ENGINEER', scope: 'ALL' }], lastActive: '' })}><Plus className="size-4" />Add staff</Button>}` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L30) | `<Tabs label="Team" value={tab} onChange={setTab} items={[{ id: 'people', label: 'People', count: saas.state.staff.length }, { id: 'roles', label: 'Roles', count: roleDefs.length }]} />` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L77) | `function StaffDialog({ initial, canEdit, onClose }: { initial: StaffMember; canEdit: boolean; onClose: () => void }) {` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L79) | `const [m, setM] = useState(initial);` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L80) | `const [error, setError] = useState('');` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L90) | `footer={canEdit ? <><Button onClick={onClose}>Cancel</Button><Button kind="primary" onClick={() => { const r = saas.saveStaff(m); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Save</Button></> : <Button onClick={onClose}>Close</Button>}` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L94) | `<Field label="Name"><Input value={m.name} onChange={(name) => setM({ ...m, name })} disabled={!canEdit} /></Field>` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L95) | `<Field label="Work email"><Input value={m.email} onChange={(email) => setM({ ...m, email })} placeholder="name@hisabiq.com" disabled={!canEdit} /></Field>` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L102) | `<div className="flex-1"><Select value={a.roleId} onChange={(v) => setA(i, { ...a, roleId: v as StaffRole })} options={roleDefs.filter((r) => r.id === a.roleId  /  /  !m.assignments.some((x) => x.roleId === r.id)).map((r) => ({ value: r.id, label: r.label }))} disabled={!canEdit} /></div>` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L103) | `<div className="w-[170px]"><Select value={a.scope === 'ALL' ? 'ALL' : 'SOME'} onChange={(v) => setA(i, { ...a, scope: v === 'ALL' ? 'ALL' : [] })} options={[{ value: 'ALL', label: 'All businesses' }, { value: 'SOME', label: 'Assigned only' }]} disabled={!canEdit} /></div>` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L104) | `{canEdit && m.assignments.length > 1 && <Button kind="ghost" onClick={() => setM({ ...m, assignments: m.assignments.filter((_, j) => j !== i) })}><Trash2 className="size-4" /><span className="sr-only">Remove role</span></Button>}` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L112) | `<input type="checkbox" checked={on} disabled={!canEdit} onChange={() => setA(i, { ...a, scope: on ? (a.scope as string[]).filter((x) => x !== t.id) : [...(a.scope as string[]), t.id] })} className="size-4 accent-teal-600" />` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/admin/Team.tsx#L121) | `{canEdit && unused.length > 0 && <Button kind="ghost" onClick={() => setM({ ...m, assignments: [...m.assignments, { roleId: unused[0].id, scope: 'ALL' }] })}><Plus className="size-4" />Add role</Button>}` |
## src/magic-saas/pages/saas/customers/Businesses.tsx

| Source line | Existing declaration / binding |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L17) | `export function Businesses() {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L21) | `const [q, setQ] = useState('');` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L22) | `const [view, setView] = useState<View>('all');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L23) | `const [plan, setPlan] = useState('All plans');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L24) | `const [type, setType] = useState('All types');` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L25) | `const [creating, setCreating] = useState(false);` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L70) | `<Button onClick={() => downloadCsv('hisabiq-businesses.csv', [['ID', 'Business', 'Type', 'Owner', 'Phone', 'Plan', 'Subscription', 'Account', 'Health', 'Setup %', 'Products'], ...filtered.map((r) => [r.t.id, r.t.name, r.t.businessType, r.t.owner, r.t.phone, r.plan, r.t.status, r.t.account, r.health.level, r.setup.pct, r.t.erp.productCount])])}><Download className="size-4" />CSV</Button>` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L71) | `{saas.canFor('tenants.edit', null) && <Button kind="primary" onClick={() => setCreating(true)}><Plus className="size-4" />Add business</Button>}` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L77) | `<Tabs label="Saved views" value={view} onChange={(v) => setView(v as View)} items={views.map((v) => ({ id: v.id, label: v.label, count: rows.filter(v.test).length }))} />` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L79) | `<SearchBox value={q} onChange={setQ} placeholder="Search name, owner, phone or ID" />` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L80) | `<div className="w-full sm:w-[150px]"><Select label="Filter by plan" value={plan} onChange={setPlan} options={['All plans', ...planCatalog.map((p) => p.label)]} /></div>` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L81) | `<div className="w-full sm:w-[160px]"><Select label="Filter by business type" value={type} onChange={setType} options={['All types', ...businessTypes.map((b) => b.type)]} /></div>` |
| [107](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L107) | `<tr key={t.id} onClick={() => navigate(ʼ/saas/tenants/${t.id}ʼ)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L109) | `<Link to={ʼ/saas/tenants/${t.id}ʼ} onClick={(e) => e.stopPropagation()} className="font-medium text-ink hover:text-teal-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">{t.name}</Link>` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/customers/Businesses.tsx#L129) | `<td className={tdAction} onClick={(e) => e.stopPropagation()}>` |
## src/magic-saas/pages/saas/home/MyWork.tsx

| Source line | Existing declaration / binding |
|---|---|
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/home/MyWork.tsx#L32) | `export function MyWork() {` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/home/MyWork.tsx#L37) | `const [scope, setScope] = useState<Scope>('team');` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/home/MyWork.tsx#L38) | `const [kinds, setKinds] = useState<WorkKind[]  /  null>(null);` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/home/MyWork.tsx#L39) | `const [dialog, setDialog] = useState<Dialog>(null);` |
| [80](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/home/MyWork.tsx#L80) | `<button key={t.label} type="button" aria-pressed={active} onClick={() => setKinds(active ? null : t.kinds)} className={ʼrounded-xl border bg-card px-3 py-2.5 text-left shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${active ? 'border-teal-600' : 'border-ink-100 hover:border-ink-200'}ʼ}>` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/home/MyWork.tsx#L91) | `<Tabs label="Whose work" value={scope} onChange={(v) => setScope(v as Scope)} items={[{ id: 'mine', label: 'Mine', count: all.filter((w) => w.owner === me).length }, { id: 'team', label: 'My team', count: all.filter((w) => !w.owner  /  /  w.owner === me).length }, { id: 'all', label: 'All in scope', count: all.length }]} />` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/home/MyWork.tsx#L92) | `{kinds && <Button kind="ghost" onClick={() => setKinds(null)}>Clear filter</Button>}` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/home/MyWork.tsx#L114) | `<Button kind={w.tone === 'danger' ? 'primary' : 'outline'} className={w.action.length >= 17 ? 'max-[360px]:col-start-2 max-[360px]:justify-self-end' : ''} onClick={() => act(w)}>{w.action}</Button>` |
## src/magic-saas/pages/saas/ops/DataRequests.tsx

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/DataRequests.tsx#L15) | `export function DataRequests() {` |
## src/magic-saas/pages/saas/ops/KnowledgeBase.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L10) | `export function KnowledgeBase() {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L12) | `const [q, setQ] = useState('');` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L13) | `const [edit, setEdit] = useState<Article  /  null>(null);` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L24) | `actions={canEdit && <Button kind="primary" onClick={() => setEdit({ id: sid('KB'), title: '', titleBn: '', category: 'Getting started', visibility: 'Public', status: 'Draft', body: '', updatedAt: '', updatedBy: '', views: 0 })}><Plus className="size-4" />New article</Button>}` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L27) | `<div className="border-b border-ink-100 p-3"><SearchBox value={q} onChange={setQ} placeholder="Search articles (English or Bangla)" /></div>` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L33) | `<tr key={a.id} onClick={() => setEdit(a)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L51) | `function ArticleDialog({ article, canEdit, onClose }: { article: Article; canEdit: boolean; onClose: () => void }) {` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L53) | `const [a, setA] = useState(article);` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L54) | `const [error, setError] = useState('');` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L55) | `const save = (status: Article['status']) => {` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L62) | `<Modal title={a.title  /  /  'New article'} onClose={onClose} footer={canEdit ? <><Button onClick={onClose}>Cancel</Button><Button onClick={() => save('Draft')}>Save draft</Button><Button kind="primary" onClick={() => save('Published')}>Publish</Button></> : <Button onClick={onClose}>Close</Button>}>` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L65) | `<Field label="Title (English)"><Input value={a.title} onChange={(title) => setA({ ...a, title })} disabled={!canEdit} /></Field>` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L66) | `<Field label="Title (Bangla)"><Input value={a.titleBn} onChange={(titleBn) => setA({ ...a, titleBn })} disabled={!canEdit} /></Field>` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L67) | `<Field label="Category"><Select value={a.category} onChange={(category) => setA({ ...a, category })} options={['Getting started', 'Sales & POS', 'Stock', 'Money', 'Billing', 'SMS', 'Internal']} disabled={!canEdit} /></Field>` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L68) | `<Field label="Audience"><Select value={a.visibility} onChange={(v) => setA({ ...a, visibility: v as Article['visibility'] })} options={[{ value: 'Public', label: 'Owners (in-app help)' }, { value: 'Internal', label: 'Staff only' }]} disabled={!canEdit} /></Field>` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/KnowledgeBase.tsx#L70) | `<Field label="Article"><Textarea value={a.body} onChange={(body) => setA({ ...a, body })} disabled={!canEdit} /></Field>` |
## src/magic-saas/pages/saas/ops/Services.tsx

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Services.tsx#L19) | `export function Services() {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Services.tsx#L22) | `const [tab, setTab] = useState('new');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Services.tsx#L23) | `const [open, setOpen] = useState<string  /  null>(null);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Services.tsx#L32) | `<Tabs label="Service stages" value={tab} onChange={setTab} items={groups.map((x) => ({ id: x.id, label: x.label, count: all.filter((s) => x.states.includes(s.state)).length }))} />` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Services.tsx#L39) | `<tr key={s.id} onClick={() => setOpen(s.id)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Services.tsx#L40) | `<td className={td}><button type="button" onClick={(e) => { e.stopPropagation(); setOpen(s.id); }} className="font-medium text-teal-700 hover:underline">{s.title}</button><span className="block text-[11px] text-ink-500">{s.id} · requested {fmtDateTime(s.requestedAt)}</span></td>` |
## src/magic-saas/pages/saas/ops/Tickets.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L18) | `export function Tickets() {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L22) | `const [view, setView] = useState<View>('open');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L23) | `const [q, setQ] = useState('');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L24) | `const [change, setChange] = useState(false);` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L25) | `const [creating, setCreating] = useState(false);` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L54) | `actions={saas.can('tickets.edit') && <Button kind="primary" onClick={() => setCreating(true)}><Plus className="size-4" />Log ticket</Button>}` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L57) | `<Tabs label="Ticket views" value={view} onChange={(v) => setView(v as View)} items={(Object.keys(tests) as View[]).map((id) => ({ id, label: { unassigned: 'Unassigned', mine: 'Mine', open: 'Open', waiting: 'Waiting on owner', resolved: 'Resolved' }[id], count: all.filter(tests[id]).length }))} />` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L58) | `<div className="border-b border-ink-100 p-3"><SearchBox value={q} onChange={setQ} placeholder="Search ticket, subject or business" /></div>` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L67) | `<button type="button" onClick={() => setParams({ ticket: t.id })} aria-current={selected?.id === t.id} className={ʼw-full px-4 py-2.5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${selected?.id === t.id ? 'bg-teal-50' : 'hover:bg-ink-50/60'}ʼ}>` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L87) | `<div className="w-[200px]"><Select value={selected.assignee} onChange={(v) => run(saas.assignTicket(selected.id, v))} options={[{ value: '', label: 'Unassigned' }, ...agents.map((a) => ({ value: a, label: a }))]} /></div>` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L89) | `<Button onClick={() => run(saas.assignTicket(selected.id, me))}>Assign to me</Button>` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L91) | `{saas.canFor('tickets.edit', selected.tenantId) && (selected.status === 'Resolved' ? <Button onClick={() => run(saas.setTicketStatus(selected.id, 'Open'))}>Reopen</Button> : <Button onClick={() => run(saas.setTicketStatus(selected.id, 'Resolved'))}>Resolve</Button>)}` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/ops/Tickets.tsx#L92) | `{saas.canFor('support.access', selected.tenantId) && selected.status !== 'Resolved' && <Button onClick={() => setChange(true)}>Request setting change</Button>}` |
## src/magic-saas/pages/saas/revenue/Invoices.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L18) | `export function Invoices() {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L23) | `const [view, setView] = useState<(typeof views)[number]>('All');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L24) | `const [kind, setKind] = useState('All types');` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L25) | `const [q, setQ] = useState('');` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L26) | `const [pick, setPick] = useState(false);` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L27) | `const [checkoutFor, setCheckoutFor] = useState<string  /  null>(null);` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L28) | `const [voiding, setVoiding] = useState<string  /  null>(null);` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L55) | `<Button onClick={() => downloadCsv('hisabiq-invoices.csv', [['Invoice', 'Business', 'Type', 'For', 'Total', 'Paid', 'Balance', 'Status', 'Issued', 'Due'], ...rows.map((o) => [o.id, name(o.tenantId), invoiceKind(o), o.terms.name, o.total, o.paidAmount ?? 0, balanceDue(o), invoiceStatus(o), o.createdAt.slice(0, 10), dueDate(o)])])}><Download className="size-4" />CSV</Button>` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L56) | `{canCreate && <Button kind="primary" onClick={() => setPick(true)}><Plus className="size-4" />New invoice</Button>}` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L69) | `<Tabs label="Invoice status" value={view} onChange={(v) => setView(v as typeof view)} items={views.map((v) => ({ id: v, label: v, count: v === 'All' ? all.length : all.filter((o) => invoiceStatus(o) === v).length }))} />` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L71) | `<SearchBox value={q} onChange={setQ} placeholder="Search invoice, TRX ID or business" />` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L72) | `<div className="w-[170px]"><Select value={kind} onChange={setKind} options={['All types', 'Subscription', 'SMS', 'Service', 'Other · add-on']} /></div>` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L83) | `<td className={td}><button type="button" onClick={() => setParams({ order: o.id })} className="font-medium text-teal-700 hover:underline">{o.id}</button><span className="block text-[11px] text-ink-500">{o.terms.benefit}</span></td>` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L116) | `function PickBusiness({ onClose, onPick }: { onClose: () => void; onPick: (id: string) => void }) {` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L119) | `const [id, setId] = useState(list[0]?.id ?? '');` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L121) | `<Modal title="New invoice" onClose={onClose} footer={<><Button onClick={onClose}>Cancel</Button><Button kind="primary" disabled={!id} onClick={() => onPick(id)}>Continue</Button></>}>` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L122) | `{list.length ? <Field label="Business"><Select value={id} onChange={setId} options={list.map((t) => ({ value: t.id, label: ʼ${t.name} · ${t.owner}ʼ }))} /></Field> : <p className="text-[13px] text-ink-500">No active businesses you can bill.</p>}` |
| [127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L127) | `function VoidDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L129) | `const [reason, setReason] = useState('');` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L130) | `const [error, setError] = useState('');` |
| [132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L132) | `<Modal title={ʼVoid ${orderId}ʼ} onClose={onClose} footer={<><Button onClick={onClose}>Back</Button><Button kind="danger" onClick={() => { const r = saas.voidInvoice(orderId, reason); if (!r.ok) return setError(r.message); toast.success(r.message); onClose(); }}>Void invoice</Button></>}>` |
| [135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Invoices.tsx#L135) | `<Field label="Reason"><Textarea value={reason} onChange={setReason} placeholder="e.g. Owner chose a different plan" /></Field>` |
## src/magic-saas/pages/saas/revenue/Refunds.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Refunds.tsx#L8) | `export function Refunds() {` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Refunds.tsx#L10) | `const [tab, setTab] = useState<'pending'  /  'done'  /  'eligible'>('pending');` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Refunds.tsx#L28) | `<Tabs label="Refund views" value={tab} onChange={(v) => setTab(v as typeof tab)} items={[{ id: 'pending', label: 'To send', count: lists.pending.length }, { id: 'done', label: 'Refunded', count: lists.done.length }, { id: 'eligible', label: 'Paid invoices', count: lists.eligible.length }]} />` |
## src/magic-saas/pages/saas/revenue/Subscriptions.tsx

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L19) | `export function Subscriptions() {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L23) | `const [view, setView] = useState<View>('all');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L24) | `const [q, setQ] = useState('');` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L25) | `const [action, setAction] = useState<Action>(null);` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L60) | `<Tabs label="Subscription views" value={view} onChange={(v) => setView(v as View)} items={(Object.keys(tests) as View[]).map((id) => ({ id, label: { all: 'All', renewing: 'Renewing soon', trial: 'Trials', grace: 'Grace', expired: 'Expired', scheduled: 'Scheduled changes' }[id], count: tenants.filter(tests[id]).length }))} />` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L61) | `<div className="border-b border-ink-100 p-3"><SearchBox value={q} onChange={setQ} placeholder="Search business, owner or phone" /></div>` |
| [105](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L105) | `function ChangeDialog({ kind, tenant, onClose }: { kind: 'extend'  /  'change'  /  'cancel'; tenant: Tenant; onClose: () => void }) {` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L108) | `const [plan, setPlan] = useState<PlanCode>(others[0]);` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L109) | `const [reason, setReason] = useState('');` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L110) | `const [error, setError] = useState('');` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L118) | `<Modal title={ʼ${kind === 'extend' ? 'Extend trial' : kind === 'change' ? 'Change plan at renewal' : 'Cancel at renewal'} · ${tenant.name}ʼ} onClose={onClose} footer={<><Button onClick={onClose}>Back</Button><Button kind={kind === 'cancel' ? 'danger' : 'primary'} onClick={go}>Confirm</Button></>}>` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L123) | `<Field label="Reason"><Textarea value={reason} onChange={setReason} placeholder="e.g. Owner still importing opening stock" /></Field>` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/pages/saas/revenue/Subscriptions.tsx#L128) | `<Field label="New plan"><Select value={plan} onChange={(v) => setPlan(v as PlanCode)} options={others.map((p) => ({ value: p, label: ʼ${p} · ৳${planPrice[p]}/monthʼ }))} /></Field>` |
## src/magic-saas/prototype/Ui.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L7) | `export function Button({children,onClick,kind='outline',type='button',disabled=false,className='',title,workflow=false}:{children:React.ReactNode;onClick?:()=>void;kind?:'primary' / 'outline' / 'danger' / 'ghost';type?:'button' / 'submit';disabled?:boolean;className?:string;title?:string;workflow?:boolean}){` |
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L8) | `return <button type={type} onClick={onClick} disabled={disabled} title={title} data-erp-workflow-action={workflow?'complete':undefined} className={'ref-action inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 '+(workflow?'h-12 px-4 ':'h-9 ')+(kind==='primary'?'ref-button-primary border-teal-600 bg-teal-600 text-white hover:bg-teal-700':kind==='danger'?'border-danger/25 bg-danger-bg text-danger hover:border-danger/40':kind==='ghost'?'border-transparent bg-transparent text-ink-600 hover:bg-ink-50 hover:text-ink':'ref-button-outline border-ink-200 bg-card text-ink hover:border-teal-300 hover:bg-teal-50/60 hover:text-` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L11) | `export function Field({label,children,hint}:{label:string;children:React.ReactNode;hint?:string}){return <FieldLabel.Provider value={label}><label className="block min-w-0 text-[12px] font-medium text-ink-700">{label}<span className="mt-1.5 block font-normal">{children}</span>{hint&&<span className="ref-helper mt-1 block font-normal">{hint}</span>}</label></FieldLabel.Provider>}` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L14) | `export function Input({value,onChange,type='text',placeholder='',min,step,disabled=false}:{value:string / number;onChange:(v:string)=>void;type?:string;placeholder?:string;min?:number;step?:number / string;disabled?:boolean}){return <input data-hisabiq-input="" className={controlCls} value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} min={min} step={step} disabled={disabled}/>}` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L16) | `export function Select({value,onChange,options,disabled=false,label}:{value:string;onChange:(v:string)=>void;options:(string / {value:string;label:string})[];disabled?:boolean;label?:string}){const fieldLabel=useContext(FieldLabel);const first=options[0];const fallback=typeof first==='string'?first:first?.label;return <AppSelect label={label??fieldLabel??fallback??'Choose'} value={value} options={options} onChange={onChange} disabled={disabled} className="w-full"/>}` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L17) | `export function Textarea({value,onChange,placeholder='',disabled=false}:{value:string;onChange:(v:string)=>void;placeholder?:string;disabled?:boolean}){return <textarea rows={3} disabled={disabled} className="block w-full rounded-lg border border-input bg-card px-3 py-2 text-[13px] font-normal text-ink shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20 disabled:cursor-not-allowed disabled:border-ink-100 disabled:bg-ink-50 disabled:text-ink-500" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L18) | `export function Panel({title,subtitle,actions,children}:{title?:string;subtitle?:string;actions?:React.ReactNode;children:React.ReactNode}){return <section className="min-w-0 rounded-xl border border-ink-100 bg-card p-4 shadow-card">{(title /  / subtitle /  / actions)&&<div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div>{title&&<h2 className="text-[15px] font-semibold text-ink">{title}</h2>}{subtitle&&<p className="ref-helper mt-0.5">{subtitle}</p>}</div>{actions}</div>}{children}</section>}` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L20) | `export function Modal({title,children,onClose,footer,wide=false}:{title:string;children:React.ReactNode;onClose:()=>void;footer?:React.ReactNode;wide?:boolean}){` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L25) | `<header className="flex items-center justify-between border-b border-ink-100 px-4 py-3"><h2 className="text-base font-semibold text-ink">{title}</h2><button className="flex size-9 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40" aria-label="Close" onClick={onClose}><X className="size-4"/></button></header>` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L31) | `export function Segmented({options,value,onChange,label}:{options:{id:string;label:string}[];value:string;onChange:(id:string)=>void;label:string}){` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L34) | `{options.map(o=>{const active=o.id===value;return <button key={o.id} type="button" role="radio" aria-checked={active} onClick={()=>onChange(o.id)} className={'relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 '+(active?'text-white':'text-ink-500 hover:bg-ink-50 hover:text-ink')}>` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L38) | `export function Notice({children}:{children:React.ReactNode}){return <div className="flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 p-3 text-[12px] text-teal-800"><Info className="mt-0.5 size-4 shrink-0"/><div>{children}</div></div>}` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L42) | `export function Tabs({items,value,onChange,label='Section tabs'}:{` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L46) | `const handleKey=(event:React.KeyboardEvent<HTMLButtonElement>,index:number)=>{` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L60) | `tabIndex={value===t.id?0:-1} onClick={()=>onChange(t.id)}` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L61) | `onKeyDown={event=>handleKey(event,index)}` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L71) | `export function Metric({label,value,helper}:{label:string;value:string;helper?:string}){return <div className="rounded-xl border border-ink-100 bg-card p-3 shadow-card"><p className="text-[12px] text-ink-500">{label}</p><p className="mt-1 text-xl font-semibold text-ink">{value}</p>{helper&&<p className="ref-helper mt-1">{helper}</p>}</div>}` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L72) | `export function downloadCsv(name:string,rows:(string / number)[][]){const escaped=rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url='data:text/csv;charset=utf-8,'+encodeURIComponent('\uFEFF'+escaped);const a=document.createElement('a');a.href=url;a.download=name;a.click();}` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L73) | `export function Tag({children,color='neutral'}:{children:React.ReactNode;color?:'neutral' / 'success' / 'danger' / 'warning'}){return <span data-table-badge className={'inline-flex rounded-md px-2 py-1 text-[11px] font-medium '+(color==='success'?'bg-success-bg text-success':color==='danger'?'bg-danger-bg text-danger':color==='warning'?'bg-warning-bg text-warning':'bg-ink-50 text-ink-600')}>{children}</span>}` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L74) | `export function Empty({message='Nothing matches these filters'}:{message?:string}){return <div className="py-8 text-center text-sm text-ink-500">{message}</div>}` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/prototype/Ui.tsx#L75) | `export function useFeedback(){const [feedback,setFeedback]=useState('');return {feedback,notify:(x:string)=>{setFeedback(x);},Feedback:()=>feedback?<p role="status" className="rounded-lg border border-teal-200 bg-teal-50 p-2 text-[12px] text-teal-700">{feedback}</p>:null}}` |
## src/magic-saas/utils/currency.ts

| Source line | Existing declaration / binding |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/currency.ts#L2) | `export function formatNumber(value: number, decimals = 0): string {` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/currency.ts#L10) | `export function taka(value: number, decimals = 0): string {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/currency.ts#L16) | `export function takaCompact(value: number): string {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/currency.ts#L25) | `export function roundTo(value: number, step = 5): number {` |
## src/magic-saas/utils/saas.ts

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L10) | `export function addDays(date: string, days: number): string {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L16) | `export function daysBetween(from: string, to: string): number {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L20) | `export function fmtDate(date: string  /  null  /  undefined): string {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L26) | `export function fmtDateTime(iso: string): string {` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L31) | `export function expiryText(date: string  /  null): { text: string; tone: 'neutral'  /  'warning'  /  'danger' } {` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L45) | `export function segmentInfo(text: string) {` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L56) | `export function levelFromFeatures(features: string[]): InterfaceLevel {` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L64) | `export function periodDays(pkg: Pick<SaasPackage, 'billing'  /  'passDays'>): number  /  null {` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L71) | `export function billingLabel(pkg: Pick<SaasPackage, 'billing'  /  'passDays'>): string {` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L81) | `export function validatePackage(p: SaasPackage, catalog: Feature[]): Issue[] {` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L103) | `export function validateOffer(o: Offer): Issue[] {` |
| [132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L132) | `export function quote(pkg: SaasPackage, offer: Offer  /  null): Quote {` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L153) | `export function offerEligibility(offer: Offer, pkg: SaasPackage, tenant: Tenant, orders: PaymentOrder[]): { ok: boolean; reason?: string } {` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saas.ts#L168) | `export function planRank(code: PlanCode): number {` |
## src/magic-saas/utils/saasAccess.ts

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasAccess.ts#L7) | `function expand(perms: SaasPermission[]): Set<string> {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasAccess.ts#L20) | `export function hasPermission(staff: StaffMember  /  undefined, p: SaasPermission, tenantId?: string  /  null): boolean {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasAccess.ts#L36) | `export function effectiveAccess(assignments: Assignment[]): EffectiveRow[] {` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasAccess.ts#L55) | `export function roleLabel(staff: Pick<StaffMember, 'assignments'>): string {` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasAccess.ts#L59) | `export function isScoped(staff: StaffMember): boolean {` |
## src/magic-saas/utils/saasBilling.ts

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasBilling.ts#L8) | `export function invoiceStatus(o: PaymentOrder): InvoiceStatus {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasBilling.ts#L27) | `export function invoiceKind(o: PaymentOrder): string {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasBilling.ts#L36) | `export function paymentChecks(o: PaymentOrder, statement: StatementLine[], orders: PaymentOrder[], settings: PlatformSettings): { checks: Check[]; line: StatementLine  /  null } {` |
## src/magic-saas/utils/saasSignals.ts

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasSignals.ts#L14) | `export function businessHealth(t: Tenant, openTickets: number): Health {` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasSignals.ts#L48) | `export function setupProgress(t: Tenant): Setup {` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasSignals.ts#L60) | `export function planFit(t: Tenant, plan: PlanCode): PlanFit {` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasSignals.ts#L79) | `export function moduleAdoption(t: Tenant, activeFeatures: Set<string>): ModuleRow[] {` |
## src/magic-saas/utils/saasState.ts

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasState.ts#L20) | `function clone<T>(x: T): T {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/magic-saas/utils/saasState.ts#L25) | `export function createInitialState(): SaasState {` |
## src/saas/AttachmentField.tsx

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/AttachmentField.tsx#L4) | `export function AttachmentField({` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/AttachmentField.tsx#L13) | `const [error, setError] = useState("");` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/AttachmentField.tsx#L19) | `onChange={(e) => {` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/AttachmentField.tsx#L53) | `onClick={() => onChange(undefined)}` |
## src/saas/OverviewPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/OverviewPage.tsx#L6) | `export function OverviewPage() {` |
## src/saas/SaasProvider.tsx

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasProvider.tsx#L16) | `export function SaasProvider({ children }: { children: React.ReactNode }) {` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasProvider.tsx#L17) | `const [initial] = useState(() => {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasProvider.tsx#L27) | `const [state, setState] = useState(initial.state);` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasProvider.tsx#L29) | `const [actor, setActorState] = useState<Actor>({` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasProvider.tsx#L33) | `const [persistenceError, setError] = useState(initial.error);` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasProvider.tsx#L34) | `const save = (next: SaasState) => {` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasProvider.tsx#L43) | `const dispatch = (c: SaasCommand) => {` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasProvider.tsx#L77) | `export function useSaas() {` |
## src/saas/SaasShell.tsx

| Source line | Existing declaration / binding |
|---|---|
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasShell.tsx#L58) | `export function SaasShell() {` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasShell.tsx#L60) | `const [mobile, setMobile] = useState(false);` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasShell.tsx#L70) | `onClick={() => setMobile(false)}` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasShell.tsx#L102) | `onClick={() => setMobile(false)}` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasShell.tsx#L130) | `onClick={() => setMobile(true)}` |
| [149](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasShell.tsx#L149) | `onChange={(e) => {` |
| [193](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasShell.tsx#L193) | `<Button onClick={() => setActor({ kind: "staff", id: "admin" })}>` |
| [203](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/SaasShell.tsx#L203) | `export function Guard({` |
## src/saas/TenantPortal.tsx

| Source line | Existing declaration / binding |
|---|---|
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L21) | `export function TenantSession({ children, embedded = false }: { children: React.ReactNode; embedded?: boolean }) {` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L47) | `onChange={(e) => {` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L74) | `export function TenantSupport({ detail = false, embedded = false }: { detail?: boolean; embedded?: boolean }) {` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L81) | `export function TenantSubscription({ embedded = false }: { embedded?: boolean }) {` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L88) | `function SubscriptionContent({ embedded = false }: { embedded?: boolean }) {` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L90) | `const [tab, setTab] = useState("Invoices");` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L91) | `const [proof, setProof] = useState<{` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L95) | `const [order, setOrder] = useState<{ kind: string; id: string }  /  null>(null);` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L147) | `onChange={setTab}` |
| [163](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L163) | `<Button onClick={() => setProof({ invoiceId: i.id })}>` |
| [188](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L188) | `onClick={() =>` |
| [210](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L210) | `<Button onClick={() => setOrder({ kind: "sms", id: p.id })}>` |
| [227](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L227) | `onClick={() => setOrder({ kind: "service", id: v.id })}` |
| [248](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L248) | `onClick={() => {` |
| [285](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/TenantPortal.tsx#L285) | `onClick={() => {` |
## src/saas/admin/AnnouncementsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L18) | `export function AnnouncementsPage() {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L20) | `const [edit, setEdit] = useState<string  /  null>(null);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L21) | `const [body, setBody] = useState("");` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L22) | `const [ids, setIds] = useState<string[]>([]);` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L23) | `const [channel, setChannel] = useState("In-app");` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L34) | `onClick={() => {` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L74) | `onClick={() => {` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L88) | `onClick={() =>` |
| [102](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L102) | `onClick={() => {` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L123) | `onClick={() => {` |
| [152](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L152) | `onSubmit={(e) => {` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L180) | `onChange={(e) => setBody(e.target.value)}` |
| [187](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L187) | `onChange={(e) => setChannel(e.target.value)}` |
| [208](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L208) | `onClick={() =>` |
| [223](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AnnouncementsPage.tsx#L223) | `onChange={(e) =>` |
## src/saas/admin/AuditPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AuditPage.tsx#L5) | `export function AuditPage() {` |
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AuditPage.tsx#L8) | `const [id, setId] = useState("");` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/AuditPage.tsx#L36) | `<Button size="sm" variant="outline" onClick={() => setId(a.id)}>` |
## src/saas/admin/ReportsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/ReportsPage.tsx#L15) | `export function ReportsPage() {` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/ReportsPage.tsx#L17) | `const [from, setFrom] = useState("2026-01-01");` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/ReportsPage.tsx#L18) | `const [to, setTo] = useState("2026-12-31");` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/ReportsPage.tsx#L92) | `<Button onClick={csv}>Export CSV</Button>` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/ReportsPage.tsx#L100) | `onChange={(e: React.ChangeEvent<HTMLInputElement>) =>` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/ReportsPage.tsx#L110) | `onChange={(e: React.ChangeEvent<HTMLInputElement>) =>` |
## src/saas/admin/SettingsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/SettingsPage.tsx#L12) | `export function SettingsPage() {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/SettingsPage.tsx#L25) | `onSubmit={(e) => {` |
| [107](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/SettingsPage.tsx#L107) | `onClick={() => {` |
## src/saas/admin/TeamPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L18) | `export function TeamPage() {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L20) | `const [tab, setTab] = useState("Employees");` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L21) | `const [edit, setEdit] = useState<{ kind: string; id?: string }  /  null>(null);` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L31) | `onClick={() =>` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L39) | `<Tabs tabs={["Employees", "Roles"]} value={tab} onChange={setTab} />` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L74) | `onClick={() => setEdit({ kind: "staff", id: x.id })}` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L103) | `onClick={() => setEdit({ kind: "role", id: x.id })}` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L111) | `onClick={() => setEdit({ kind: "duplicate", id: x.id })}` |
| [135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L135) | `onSubmit={(e) => {` |
| [180](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L180) | `function StaffEditor({` |
| [190](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L190) | `const [roleSearch, setRoleSearch] = useState("");` |
| [191](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L191) | `const [grants, setGrants] = useState<Assignment[]>(` |
| [208](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L208) | `onChange={(e) => setRoleSearch(e.target.value)}` |
| [227](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L227) | `onChange={(ev) =>` |
| [246](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L246) | `onChange={(ev) =>` |
| [275](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L275) | `onChange={(ev) =>` |
| [327](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L327) | `onClick={() => {` |
| [342](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L342) | `onClick={() => {` |
| [354](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L354) | `onClick={() => {` |
| [372](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L372) | `onClick={() => {` |
| [394](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L394) | `function RoleEditor({` |
| [406](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L406) | `const [ps, setPs] = useState<Permission[]>(role?.permissions  /  /  []);` |
| [407](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L407) | `const [name, setName] = useState(` |
| [416](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L416) | `onSubmit={(e) => {` |
| [435](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L435) | `onChange={(e: React.ChangeEvent<HTMLInputElement>) =>` |
| [459](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L459) | `onChange={(e) =>` |
| [508](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/TeamPage.tsx#L508) | `onClick={() => {` |
## src/saas/admin/auditSelectors.ts

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/auditSelectors.ts#L18) | `export function auditEvents(s: SaasState, actor: Actor) {` |
## src/saas/admin/schedule.ts

| Source line | Existing declaration / binding |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/schedule.ts#L1) | `export function localDateTime(iso: string) {` |
## src/saas/admin/teamTransitions.ts

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/teamTransitions.ts#L10) | `export function teamTransition(s: SaasState, a: Actor, c: SaasCommand) {` |
## src/saas/admin/transitions.ts

| Source line | Existing declaration / binding |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/admin/transitions.ts#L3) | `export function adminTransition(` |
## src/saas/billing/InvoicesPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L24) | `export function InvoicesPage() {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L27) | `const [open, setOpen] = useState(false);` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L35) | `<Button onClick={() => setOpen(true)}>Issue invoice</Button>` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L98) | `onSubmit={(e) => {` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L147) | `export function InvoicePage() {` |
| [150](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L150) | `const [action, setAction] = useState("");` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L164) | `<Button variant="outline" onClick={() => window.print()}>` |
| [169](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L169) | `<Button onClick={() => setAction("proof")}>` |
| [189](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L189) | `<Button variant="outline" onClick={() => setAction("allocate")}>` |
| [196](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L196) | `onClick={() => setAction("void")}` |
| [237](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/InvoicesPage.tsx#L237) | `onSubmit={(e) => {` |
## src/saas/billing/PaymentForm.tsx

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentForm.tsx#L6) | `export function PaymentForm({` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentForm.tsx#L16) | `const [evidence, setEvidence] = useState<Attachment  /  undefined>(` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentForm.tsx#L19) | `const [error, setError] = useState("");` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentForm.tsx#L20) | `const [reading, setReading] = useState(false);` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentForm.tsx#L24) | `onSubmit={(e) => {` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentForm.tsx#L74) | `onChange={(e) => {` |
## src/saas/billing/PaymentsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L22) | `export function PaymentsPage() {` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L79) | `export function PaymentReview() {` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L82) | `const [action, setAction] = useState("");` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L101) | `onClick={() =>` |
| [165](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L165) | `onClick={() => setAction("requestInfo")}` |
| [169](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L169) | `<Button variant="outline" onClick={() => setAction("reject")}>` |
| [174](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L174) | `onClick={() => setAction("verify")}` |
| [192](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L192) | `<Button variant="outline" onClick={() => setAction("refund")}>` |
| [197](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L197) | `onClick={() => setAction("reverse")}` |
| [207](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L207) | `<Button onClick={() => setAction("resubmit")}>` |
| [245](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PaymentsPage.tsx#L245) | `onSubmit={(e) => {` |
## src/saas/billing/PlansPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PlansPage.tsx#L16) | `export function PlansPage() {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PlansPage.tsx#L18) | `const [edit, setEdit] = useState<string  /  null>(null);` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PlansPage.tsx#L28) | `<Button onClick={() => setEdit("new")}>Create plan</Button>` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PlansPage.tsx#L52) | `<Button variant="outline" onClick={() => setEdit(p.id)}>` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PlansPage.tsx#L56) | `onClick={() => {` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PlansPage.tsx#L69) | `onClick={() =>` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/PlansPage.tsx#L87) | `onSubmit={(e) => {` |
## src/saas/billing/SubscriptionsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/SubscriptionsPage.tsx#L18) | `export function SubscriptionsPage() {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/SubscriptionsPage.tsx#L21) | `const [edit, setEdit] = useState<{ id: string; action: string }  /  null>(null);` |
| [70](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/SubscriptionsPage.tsx#L70) | `onClick={() => setEdit({ id: x.id, action: "change" })}` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/SubscriptionsPage.tsx#L78) | `onClick={() =>` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/SubscriptionsPage.tsx#L88) | `onClick={() =>` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/SubscriptionsPage.tsx#L111) | `onSubmit={(e) => {` |
## src/saas/billing/transitions.ts

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/transitions.ts#L10) | `function attachment(value: unknown): Attachment  /  undefined {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/transitions.ts#L22) | `export function settle(s: SaasState, i: Invoice, now: string) {` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/billing/transitions.ts#L59) | `export function billingTransition(` |
## src/saas/components.tsx

| Source line | Existing declaration / binding |
|---|---|
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L50) | `export function Heading({` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L71) | `export function Card({` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L92) | `export function Badge({ children }: { children: React.ReactNode }) {` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L112) | `export function Field({` |
| [132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L132) | `export function Select({` |
| [142](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L142) | `export function Area(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {` |
| [145](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L145) | `export function Modal({` |
| [176](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L176) | `onChange={() => {` |
| [187](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L187) | `onClick={close}` |
| [197](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L197) | `export function Actions({ children }: { children: React.ReactNode }) {` |
| [204](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L204) | `export function Empty({ text = "No matching records." }: { text?: string }) {` |
| [211](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L211) | `export function DataTable<T extends { id: string }>({` |
| [246](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L246) | `onChange={(e) => set("q", e.target.value)}` |
| [289](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L289) | `onClick={() => set("page", String(current - 1))}` |
| [297](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L297) | `onClick={() => set("page", String(current + 1))}` |
| [307](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L307) | `export function Tabs({` |
| [326](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L326) | `onClick={() => onChange(t)}` |
| [335](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L335) | `export function Metric({` |
| [352](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L352) | `export function useModal() {` |
| [353](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/components.tsx#L353) | `return useState<{ kind: string; id?: string }  /  null>(null);` |
## src/saas/guards.ts

| Source line | Existing declaration / binding |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/guards.ts#L3) | `export function requirePermission(` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/guards.ts#L12) | `export function find<T extends { id: string; version?: number }>(` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/guards.ts#L25) | `export function text(value: unknown, label = "Value") {` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/guards.ts#L30) | `export function number(value: unknown, label = "Amount", zero = false) {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/guards.ts#L38) | `export function email(v: unknown) {` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/guards.ts#L44) | `export function date(v: unknown) {` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/guards.ts#L51) | `export function validAttachment(value: unknown): Attachment  /  undefined {` |
## src/saas/hooks.ts

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/hooks.ts#L5) | `export function useScoped<T extends { tenantId: string }>(` |
## src/saas/messaging/SmsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L23) | `export function SmsPage() {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L27) | `const [tab, setTab] = useState("Delivery logs");` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L28) | `const [action, setAction] = useState("");` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L29) | `const [body, setBody] = useState("");` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L30) | `const [pack, setPack] = useState("");` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L31) | `const [templateId, setTemplateId] = useState("");` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L43) | `<Button onClick={() => setAction("send")}>Compose demo SMS</Button>` |
| [69](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L69) | `onChange={setTab}` |
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L76) | `onClick={() => {` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L101) | `onClick={() => {` |
| [145](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L145) | `onClick={() =>` |
| [163](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L163) | `onClick={() => {` |
| [209](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L209) | `onClick={() => {` |
| [232](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L232) | `onClick={() => {` |
| [241](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L241) | `onClick={() => {` |
| [269](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L269) | `onSubmit={(e) => {` |
| [317](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L317) | `onChange={(e) => setBody(e.target.value)}` |
| [327](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L327) | `onChange={(e) => {` |
| [348](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/SmsPage.tsx#L348) | `onChange={(e) => setBody(e.target.value)}` |
## src/saas/messaging/transitions.ts

| Source line | Existing declaration / binding |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/transitions.ts#L3) | `export function smsBalance(s: SaasState, tenant: string, now: string) {` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/transitions.ts#L11) | `export function segments(value: string) {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/transitions.ts#L18) | `function reserveCredits(` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/messaging/transitions.ts#L57) | `export function smsTransition(` |
## src/saas/permissions.ts

| Source line | Existing declaration / binding |
|---|---|
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/permissions.ts#L21) | `export function withViews(p: Permission[]): Permission[] {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/permissions.ts#L26) | `export function can(` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/permissions.ts#L67) | `export function allowed(s: SaasState, a: Actor, p: Permission) {` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/permissions.ts#L72) | `export function visibleTenantIds(s: SaasState, a: Actor) {` |
## src/saas/seed.ts

| Source line | Existing declaration / binding |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/seed.ts#L3) | `export function seed(): SaasState {` |
## src/saas/services/ServicesPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L22) | `export function ServicesPage() {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L25) | `const [tab, setTab] = useState("Orders");` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L26) | `const [action, setAction] = useState("");` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L34) | `<Button onClick={() => setAction("request")}>Request service</Button>` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L37) | `<Button variant="outline" onClick={() => setAction("catalogSave")}>` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L42) | `<Tabs tabs={["Orders", "Catalog"]} value={tab} onChange={setTab} />` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L93) | `onSubmit={(e) => {` |
| [162](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L162) | `export function ServiceOrderPage() {` |
| [165](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L165) | `const [action, setAction] = useState("");` |
| [202](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L202) | `onClick={() => setAction(action)}` |
| [233](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/ServicesPage.tsx#L233) | `onSubmit={(e) => {` |
## src/saas/services/transitions.ts

| Source line | Existing declaration / binding |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/services/transitions.ts#L3) | `export function serviceTransition(` |
## src/saas/state.ts

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/state.ts#L12) | `export function applyCommand(` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/state.ts#L56) | `export function readState(storage: Pick<Storage, "getItem">): {` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/state.ts#L75) | `export function writeState(` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/state.ts#L87) | `function sanitize(value: unknown): unknown {` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/state.ts#L97) | `function record(` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/state.ts#L111) | `function tenantOf(` |
## src/saas/support/KnowledgePage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/KnowledgePage.tsx#L18) | `export function KnowledgePage() {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/KnowledgePage.tsx#L20) | `const [edit, setEdit] = useState<string  /  null>(null);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/KnowledgePage.tsx#L21) | `const [q, setQ] = useState("");` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/KnowledgePage.tsx#L33) | `<Button onClick={() => setEdit("new")}>Write article</Button>` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/KnowledgePage.tsx#L40) | `onChange={(e: React.ChangeEvent<HTMLInputElement>) =>` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/KnowledgePage.tsx#L55) | `<Button variant="outline" onClick={() => setEdit(x.id)}>` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/KnowledgePage.tsx#L59) | `onClick={() =>` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/KnowledgePage.tsx#L75) | `onSubmit={(e) => {` |
## src/saas/support/TicketsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L25) | `export function TicketsPage({ basePath }: { basePath?: string } = {}) {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L28) | `const [view, setView] = useState("All tickets");` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L29) | `const [open, setOpen] = useState(false);` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L39) | `<Button onClick={() => setOpen(true)}>New ticket</Button>` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L46) | `onChange={setView}` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L85) | `onSubmit={(e) => {` |
| [142](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L142) | `export function TicketPage() {` |
| [145](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L145) | `const [mode, setMode] = useState("Public reply");` |
| [146](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L146) | `const [body, setBody] = useState("");` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L147) | `const [attachment, setAttachment] = useState<Attachment  /  undefined>();` |
| [148](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L148) | `const [reading, setReading] = useState(false);` |
| [149](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L149) | `const [action, setAction] = useState("");` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L164) | `<Button variant="outline" onClick={() => setAction("status")}>` |
| [211](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L211) | `onChange={setMode}` |
| [222](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L222) | `onSubmit={(e) => {` |
| [250](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L250) | `onChange={(e) => setBody(e.target.value)}` |
| [256](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L256) | `onChange={setAttachment}` |
| [286](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L286) | `<Button variant="outline" onClick={() => setAction("assign")}>` |
| [318](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L318) | `onClick={() =>` |
| [331](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L331) | `onClick={() =>` |
| [342](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L342) | `<Button variant="outline" onClick={() => setAction("access")}>` |
| [363](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/TicketsPage.tsx#L363) | `onSubmit={(e) => {` |
## src/saas/support/transitions.ts

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/transitions.ts#L10) | `export function ticketReplies(s: SaasState, a: Actor, id: string) {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/transitions.ts#L18) | `export function publicArticles(s: SaasState, a: Actor) {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/support/transitions.ts#L25) | `export function supportTransition(` |
## src/saas/tenants/TenantsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L20) | `export function TenantsPage() {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L22) | `const [open, setOpen] = useState(false);` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L30) | `<Button onClick={() => setOpen(true)}>Create tenant</Button>` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L89) | `onSubmit={(e) => {` |
| [137](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L137) | `export function TenantPage() {` |
| [141](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L141) | `const [tab, setTab] = useState("Overview");` |
| [142](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L142) | `const [action, setAction] = useState("");` |
| [159](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L159) | `<Button variant="outline" onClick={() => setAction("update")}>` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L164) | `onClick={() =>` |
| [183](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L183) | `onChange={setTab}` |
| [210](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L210) | `<Button variant="outline" onClick={() => setAction("archive")}>` |
| [228](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L228) | `onClick={() =>` |
| [267](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/TenantsPage.tsx#L267) | `onSubmit={(e) => {` |
## src/saas/tenants/transitions.ts

| Source line | Existing declaration / binding |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/tenants/transitions.ts#L3) | `export function tenantTransition(` |
## src/saas/validateState.ts

| Source line | Existing declaration / binding |
|---|---|
| [76](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/saas/validateState.ts#L76) | `export function validState(value: unknown): value is SaasState {` |
