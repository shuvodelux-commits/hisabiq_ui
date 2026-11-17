# MOD-022 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/settings/AccountSecuritySettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L13) | `export function AccountSecuritySettings({ language }: Props) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L16) | `const [lockPreview, setLockPreview] = useState(true);` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L17) | `const [pinOpen, setPinOpen] = useState(false);` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L18) | `const [pin, setPin] = useState('');` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L19) | `const [confirmPin, setConfirmPin] = useState('');` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L20) | `const [pinVisible, setPinVisible] = useState(false);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L21) | `const [pinError, setPinError] = useState('');` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L22) | `const [pinReviewed, setPinReviewed] = useState(false);` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L23) | `const [activeAction, setActiveAction] = useState<SecurityAction>(null);` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L24) | `const [phoneDraft, setPhoneDraft] = useState('');` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L25) | `const [phoneError, setPhoneError] = useState('');` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L26) | `const [reviewMessage, setReviewMessage] = useState('');` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L71) | `action={<Button variant="outline" size="sm" onClick={() => openAction('mobile')}>{t('Change', 'পরিবর্তন')}</Button>} />` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L74) | `action={<Button variant="outline" size="sm" onClick={() => openAction('gmail')}>{t('Manage', 'পরিচালনা')}</Button>} />` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L77) | `action={<Button variant="outline" size="sm" onClick={() => openAction('password')}>{t('Change', 'পরিবর্তন')}</Button>} />` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L88) | `action={<Button variant="outline" size="sm" onClick={() => { setPinReviewed(false); clearPin(); setPinOpen(true); }}>{t('Preview setup', 'পিন সেটআপ দেখুন')}</Button>} />` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L111) | `action={<Button variant="outline" size="sm" onClick={() => openAction('devices')}>{t('View devices', 'ডিভাইস দেখুন')}</Button>} />` |
| [127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L127) | `<form onSubmit={reviewPin} className="space-y-4" data-testid="pin-setup-preview">` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L129) | `<Button variant="ghost" size="sm" type="button" aria-label={t('Show or hide PIN', 'পিন দেখুন বা লুকান')} onClick={() => setPinVisible(x => !x)}>` |
| [136](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L136) | `value={pin} aria-describedby={describedBy} onChange={e => {setPin(normalizeDigits(e.target.value).replace(/\D/g,'').slice(0,6));setPinError('');}} />}` |
| [140](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L140) | `value={confirmPin} onChange={e => {setConfirmPin(normalizeDigits(e.target.value).replace(/\D/g,'').slice(0,6));setPinError('');}} />}` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L144) | `<Button variant="outline" onClick={clearPin}>{t('Cancel', 'বাতিল')}</Button>` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L153) | `{activeAction === 'mobile' ? <form className="space-y-4" noValidate onSubmit={reviewPhone}>` |
| [157](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L157) | `aria-invalid={!!phoneError} aria-describedby={describedBy} onChange={e => {setPhoneDraft(e.target.value);setPhoneError('');setReviewMessage('');}} />}` |
| [161](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L161) | `<div className="flex justify-end gap-2"><Button variant="outline" onClick={closeAction}>{t('Close', 'বন্ধ করুন')}</Button>` |
| [167](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L167) | `{activeAction === 'password' && <Link className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline" to="/recovery" onClick={closeAction}>{t('Open recovery preview', 'পুনরুদ্ধার প্রিভিউ দেখুন')} <ArrowRight size={14} /></Link>}` |
| [168](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L168) | `{activeAction === 'gmail' && <Link className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline" to="/login" onClick={closeAction}>{t('Open sign-in preview', 'লগইন প্রিভিউ দেখুন')} <ArrowRight size={14} /></Link>}` |
| [169](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L169) | `<div className="flex justify-end"><Button variant="outline" onClick={closeAction}>{t('Close', 'বন্ধ করুন')}</Button></div>` |
| [175](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L175) | `function SecurityRow({ icon: Icon, title, description, action, helper }: RowProps) {` |
## src/settings/DataSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L19) | `async function readFile(file: File, reportError: (message: string) => void) {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L28) | `export function DataSettings() {` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L30) | `const [dataTab, setDataTab] = useState('backup');` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L32) | `const [backup, setBackup] = useState<TenantSettings  /  null>(null),` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L33) | `[revision, setRevision] = useState(0),` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L34) | `[error, setError] = useState(""),` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L35) | `[notice, setNotice] = useState("");` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L36) | `const [csv, setCsv] = useState<string[][]>([]),` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L37) | `[mapping, setMapping] = useState<Record<string, string>>({}),` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L38) | `[preview, setPreview] = useState(false);` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L66) | `onChange={setDataTab}` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L85) | `onClick={() =>` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L103) | `onChange={async (e) => {` |
| [163](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L163) | `onChange={async (e) => {` |
| [204](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L204) | `onChange={(next) => setMapping({ ...mapping, [field]: next })}` |
| [213](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L213) | `onClick={() => {` |
| [283](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L283) | `<Button variant="outline" onClick={() => setBackup(null)}>` |
| [288](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L288) | `onClick={() => {` |
## src/settings/SettingsSqlBackup.tsx

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L9) | `export function SettingsSqlBackup({ state, exportAllowed, importAllowed, onReview }: {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L13) | `const [secret, setSecret] = useState(""), [confirm, setConfirm] = useState("");` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L14) | `const [file, setFile] = useState<{ name: string; content: string }  /  null>(null);` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L15) | `const [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L22) | `{id => <Input id={id} type="password" autoComplete="new-password" value={secret} minLength={12} maxLength={1024} disabled={busy  /  /  (!exportAllowed && !importAllowed)} onChange={e => setSecret(e.target.value)} placeholder={text("At least 12 characters", "কমপক্ষে ১২টি অক্ষর")} />}` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L25) | `{id => <Input id={id} type="password" autoComplete="new-password" value={confirm} maxLength={1024} disabled={busy  /  /  !exportAllowed} onChange={e => setConfirm(e.target.value)} />}` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L27) | `<Button variant="outline" disabled={!exportAllowed  /  /  !supported  /  /  busy  /  /  secret.length < 12  /  /  secret !== confirm} onClick={async () => {` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L38) | `<input type="file" accept=".sql,.hiq,.sql.hiq" disabled={!importAllowed  /  /  busy} className="block w-full text-xs text-ink-600 file:mr-3 file:rounded-md file:border file:border-input file:bg-card file:px-3 file:py-2 file:text-ink" onChange={async e => {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L46) | `{file && <div className="space-y-2"><p className="break-words text-xs text-helper">{file.name}</p><Button variant="outline" disabled={!importAllowed  /  /  busy  /  /  (!file.content.startsWith("-- HisabIQ") && (!supported  /  /  secret.length < 12))} onClick={async () => {` |
## src/settings/magic/DataSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L18) | `export function DataSettings({ canEdit }: { canEdit: boolean }) {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L19) | `const [tab, setTab] = useState<'backup'  /  'reset'>('backup');` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L20) | `const [pendingRestore, setPendingRestore] = useState<BackupPreview  /  null>(null);` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L21) | `const [confirmReset, setConfirmReset] = useState(false);` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L22) | `const [error, setError] = useState('');` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L23) | `const [feedback, setFeedback] = useState('');` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L24) | `const [reading, setReading] = useState(false);` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L81) | `onClick={() => setTab(item.id)}` |
| [82](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L82) | `onKeyDown={event => {` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L110) | `<Button onClick={() => previewAction('UI preview only. No backup file was created or downloaded.')}>` |
| [122](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L122) | `onChange={event => { void read(event.target.files?.[0] ?? null); }} />` |
| [123](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L123) | `<Button disabled={reading} onClick={() => fileRef.current?.click()}>` |
| [135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L135) | `<Button kind="danger" onClick={() => setConfirmReset(true)}>Reset demo</Button>` |
| [148](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L148) | `<Button onClick={() => setPendingRestore(null)}>Cancel</Button>` |
| [149](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L149) | `<Button kind="danger" onClick={() => previewAction('UI preview only. No demo or business data was restored.')}>` |
| [165](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L165) | `<Button onClick={() => setConfirmReset(false)}>Cancel</Button>` |
| [166](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L166) | `<Button kind="danger" onClick={() => previewAction('UI preview only. No demo or business data was reset.')}>Reset</Button>` |
## src/settings/magic/security/ActivityPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [4](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L4) | `function downloadCsv(name: string, rows: (string  /  number)[][]) {` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L31) | `export function ActivityPage({ canView }: { canView: boolean }) {` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L35) | `const [query, setQuery] = useState('');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L36) | `const [personId, setPersonId] = useState('');` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L37) | `const [area, setArea] = useState('');` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L38) | `const [period, setPeriod] = useState('today');` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L39) | `const [lookOnly, setLookOnly] = useState(params.get('look') === '1');` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L40) | `const [open, setOpen] = useState<string  /  null>(null);` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L41) | `const [notice, setNotice] = useState('');` |
| [93](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L93) | `<Input value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} clearable placeholder="Search what happened" aria-label="Search activity" className="ref-control h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-[13px] text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20" />` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L95) | `<Select label="Person" value={personId} onChange={setPersonId} options={[{ value: '', label: 'Everyone' }, ...sec.staff.map((s) => ({ value: s.id, label: ʼ${s.name} · ${s.role}ʼ }))]} />` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L96) | `<Select label="Area" value={area} onChange={setArea} options={[{ value: '', label: 'All areas' }, ...areas.map((a) => ({ value: a, label: a }))]} />` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L97) | `<Select label="Period" value={period} onChange={setPeriod} options={[{ value: 'today', label: 'Today' }, { value: 'week', label: 'Last 7 days' }, { value: 'all', label: 'All time' }]} />` |
| [98](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L98) | `<Button kind="ghost" onClick={reset}><RotateCcw className="size-4" />Reset</Button>` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L104) | `<input type="checkbox" className="size-4 accent-teal-600" checked={lookOnly} onChange={(e) => setLookOnly(e.target.checked)} />` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L109) | `<Button kind="ghost" onClick={() => { downloadCsv(ʼsample-staff-activity-${today}.csvʼ, [['Time', 'Person', 'Area', 'What happened', 'Before', 'After', 'Device'], ...rows.map((r) => [dhakaTime(r.at), name(r.personId), r.area, r.summary, r.before ?? '', r.after ?? '', r.device])]); setNotice('Sample activity CSV downloaded. No actual audit records were accessed or exported.'); }}>` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L112) | `<Button kind="ghost" onClick={() => { setNotice('Printing the demo activity page only; no real audit records were accessed.'); window.print(); }}><Printer className="size-4" />Print</Button>` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L129) | `function ActivityRow({ entry: r, name, role, open, onToggle, onPerson, onOpenRecord }: RowProps) {` |
| [139](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L139) | `<button type="button" onClick={onPerson} className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40">{name}</button>{' '}` |
| [149](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L149) | `<button type="button" onClick={onToggle} aria-expanded={open} aria-controls={open ? detailsId : undefined} aria-label={ʼ${open ? 'Hide' : 'Show'} details for ${name}: ${r.summary}ʼ} className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-500 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40">` |
| [161](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L161) | `{r.link && <Link to={r.link} onClick={e => { e.preventDefault(); onOpenRecord(); }} className="font-medium text-teal-700 hover:underline sm:col-span-3">Open the record →</Link>}` |
## src/settings/magic/security/OfflinePage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L36) | `export function OfflinePage({ canManage }: { canManage: boolean }) {` |
| [42](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L42) | `const [switchTo, setSwitchTo] = useState<string  /  null>(null);` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L43) | `const [turnOff, setTurnOff] = useState(false);` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L44) | `const [progress, setProgress] = useState(0);` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L114) | `<Button onClick={sync}><RefreshCw className="size-4" />Sync now</Button>` |
| [115](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L115) | `<Button kind="ghost" onClick={() => setTurnOff(true)}>Turn off</Button>` |
| [129](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L129) | `<Button onClick={sync}>Sync now</Button>` |
| [130](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L130) | `<Button kind="ghost" onClick={() => { sec.cancelHandover(); previewToast('Switch cancelled'); }}>Cancel switch</Button>` |
| [151](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L151) | `<Button onClick={() => { sec.resolveProblem(p.id); previewToast.success('Stock difference accepted'); }}>{p.fix}</Button>` |
| [152](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L152) | `<Button kind="ghost" onClick={() => previewToast('Sample product only', { description: 'The linked stock record is not a real product; no navigation was performed.' })}>Open product</Button>` |
| [170](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L170) | `<Button disabled={!s.trusted} title={s.trusted ? undefined : 'Only trusted devices can sell offline'} onClick={() => setSwitchTo(s.id)}>Make this the offline device</Button>` |
| [183](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L183) | `<Select label="Sync deadline" value={String(o.maxHours)} onChange={(v) => sec.updateOffline({ maxHours: Number(v) as 4  /  12  /  24  /  72 })} options={[{ value: '4', label: '4 hours' }, { value: '12', label: '12 hours' }, { value: '24', label: '24 hours' }, { value: '72', label: '3 days' }]} />` |
| [189](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L189) | `<Input type="number" min={5} max={100} value={o.warnAt} onChange={(e) => sec.updateOffline({ warnAt: Math.max(5, Math.min(100, Number(e.target.value)  /  /  5)) })} className={numInput} />` |
| [201](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L201) | `<Input type="number" min={0} value={o.creditLimit} onChange={(e) => sec.updateOffline({ creditLimit: Math.max(0, Number(e.target.value)  /  /  0) })} className={numInput} />` |
| [210](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L210) | `<Button kind={o.simulateOffline ? 'primary' : 'outline'} onClick={() => sec.updateOffline({ simulateOffline: !o.simulateOffline })}><WifiOff className="size-4" />{o.simulateOffline ? 'Back online' : 'Go offline'}</Button>` |
| [211](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L211) | `<Button disabled={!o.simulateOffline} onClick={testSale}>Record a test offline sale</Button>` |
| [241](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L241) | `onConfirm={() => approve(switchTo)}` |
| [250](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L250) | `<><Button onClick={() => setTurnOff(false)}>Close</Button><Button kind="primary" onClick={sync}><RefreshCw className="size-4" />Sync now</Button></>` |
| [252](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L252) | `<><Button onClick={() => setTurnOff(false)}>Cancel</Button><Button kind="danger" onClick={() => { sec.disableOffline(); setTurnOff(false); previewToast.success('Offline selling turned off'); }}>Turn off</Button></>` |
## src/settings/magic/security/PinConfirmDialog.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L8) | `export function PinConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onClose }: Props) {` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L9) | `const [pin, setPin] = useState('');` |
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L10) | `const [error, setError] = useState('');` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L14) | `const submit = () => {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L28) | `<Button onClick={onClose}>Cancel</Button>` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L29) | `<Button kind={danger ? 'danger' : 'primary'} onClick={submit}>{confirmLabel}</Button>` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L44) | `onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L45) | `onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}` |
## src/settings/magic/security/RowActions.tsx

| Source line | Existing declaration / binding |
|---|---|
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/RowActions.tsx#L30) | `export function RowActions({` |
| [39](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/RowActions.tsx#L39) | `const [open, setOpen] = useState(false);` |
| [40](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/RowActions.tsx#L40) | `const [pos, setPos] = useState<Pos  /  null>(null);` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/RowActions.tsx#L100) | `<button ref={trigger} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} title="Actions" onClick={() => setOpen(v => !v)} className={ʼinline-flex size-9 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${open ? 'bg-ink-50 text-ink' : ''}ʼ}>` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/RowActions.tsx#L116) | `}} onKeyDown={onListKey} style={{` |
| [128](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/RowActions.tsx#L128) | `<button type="button" role="menuitem" data-action-menu-item="" disabled={a.disabled} title={a.hint} onClick={() => {` |
## src/settings/magic/security/SessionsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L18) | `function previewToast(message: string, options?: { action?: { label: string; onClick: () => void } }) {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L27) | `export function SessionsPage({ canManage }: { canManage: boolean }) {` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L30) | `const [filter, setFilter] = useState('all');` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L31) | `const [query, setQuery] = useState('');` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L32) | `const [confirm, setConfirm] = useState<LoginSession  /  null>(null);` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L33) | `const [personAction, setPersonAction] = useState<{ personId: string; pause: boolean }  /  null>(null);` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L34) | `const [allOut, setAllOut] = useState(false);` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L35) | `const [idle, setIdle] = useState('30');` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L36) | `const [pinNew, setPinNew] = useState(true);` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L56) | `const removed = sec.signOut(s.id);` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L83) | `<Input value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} clearable placeholder="Search person, device or city" aria-label="Search devices" className="ref-control h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-[13px] text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20" />` |
| [85](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L85) | `<div className="min-w-0 max-w-full overflow-x-auto"><Segmented label="Filter devices" value={filter} onChange={setFilter} options={[{ id: 'all', label: 'All' }, { id: 'online', label: 'Online now' }, { id: 'new', label: 'New' }, { id: 'unusual', label: 'Unusual' }]} /></div>` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L86) | `<Button kind="danger" disabled={stats.total <= 1} onClick={() => setAllOut(true)}><LogOut className="size-4" />Sign out everyone except me</Button>` |
| [175](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L175) | `<Select label="Idle sign-out" value={idle} onChange={(v) => { setIdle(v); previewToast('Idle sign-out updated'); }} options={[{ value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' }, { value: '60', label: '1 hour' }, { value: '480', label: '8 hours' }]} />` |
| [190](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L190) | `<Modal title="Sign out this device?" onClose={() => setConfirm(null)} footer={<><Button onClick={() => setConfirm(null)}>Cancel</Button><Button kind="danger" onClick={() => doSignOut(confirm)}><LogOut className="size-4" />Sign out</Button></>}>` |
| [201](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L201) | `<Button onClick={() => setPersonAction(null)}>Cancel</Button>` |
| [202](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L202) | `<Button kind="danger" onClick={() => { const n = sec.signOutPerson(personAction.personId, personAction.pause); previewToast(ʼ${n} device${n === 1 ? '' : 's'} signed out${personAction.pause ? ' · access paused' : ''}ʼ); setPersonAction(null); }}>` |
| [218](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L218) | `onConfirm={() => { const n = sec.signOutAllExceptMe(); setAllOut(false); previewToast(ʼ${n} devices signed outʼ); }}` |
## src/settings/magic/security/SessionsUi.tsx

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsUi.tsx#L5) | `export function Select({ label, value, onChange, options }: {` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsUi.tsx#L9) | `return <AppSelect label={label} value={value} onChange={onChange} options={options} className="w-full" />;` |
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsUi.tsx#L11) | `export function Tag({ children, color = 'neutral' }: { children: ReactNode; color?: 'neutral' / 'warning' / 'danger' / 'success' }) {` |
## src/settings/magic/security/StatTile.tsx

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/StatTile.tsx#L7) | `export function StatTile({ label, value, tone = 'neutral', hint }: Props) {` |
## src/settings/magic/security/activityPreview.ts

| Source line | Existing declaration / binding |
|---|---|
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/activityPreview.ts#L44) | `export function lakhGroup(value: number, decimals = 2): string {` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/activityPreview.ts#L54) | `export function useActivityPreview() {` |
## src/settings/magic/security/offlinePreview.ts

| Source line | Existing declaration / binding |
|---|---|
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/offlinePreview.ts#L51) | `export function useOfflinePreview() {` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/offlinePreview.ts#L54) | `const [offline,setOffline]=useState<OfflineState>(()=>({` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/offlinePreview.ts#L59) | `const updateOffline=(patch:Pick<Partial<OfflineState>,'maxHours' / 'warnAt' / 'allowCredit' / 'creditLimit' / 'simulateOffline' / 'pending' / 'numbersLeft'>)=>{` |
## src/settings/magic/security/sessionPreview.ts

| Source line | Existing declaration / binding |
|---|---|
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/sessionPreview.ts#L47) | `export function ago(iso: string): string {` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/sessionPreview.ts#L54) | `export function dhakaTime(iso: string): string {` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/sessionPreview.ts#L59) | `export function useSessionsPreview() {` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/sessionPreview.ts#L60) | `const [staff,setStaff]=useState<StaffMember[]>(()=>seedStaff.map(p=>({...p})));` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/sessionPreview.ts#L61) | `const [sessions,setSessions]=useState<LoginSession[]>(()=>seedSessions.map(s=>({...s,flags:[...s.flags]})));` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/sessionPreview.ts#L68) | `const restoreSession=(s:LoginSession)=>setSessions(list=>list.some(x=>x.id===s.id)?list:[...list,s]);` |
## src/settings/sqlBackup.ts

| Source line | Existing declaration / binding |
|---|---|
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/sqlBackup.ts#L9) | `export function settingsToSql(state: TenantSettings): string {` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/sqlBackup.ts#L12) | `export function settingsFromSql(raw: string, tenantId: string): TenantSettings {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/sqlBackup.ts#L22) | `function secretBytes(secret: string) {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/sqlBackup.ts#L27) | `function bytes(value: unknown, max: number): Uint8Array<ArrayBuffer> {` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/sqlBackup.ts#L31) | `async function derive(secret: string, salt: Uint8Array<ArrayBuffer>) {` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/sqlBackup.ts#L35) | `export async function encryptSettingsSql(state: TenantSettings, secret: string): Promise<string> {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/sqlBackup.ts#L46) | `export async function decryptSettingsSql(raw: string, secret: string, tenantId: string): Promise<TenantSettings> {` |
