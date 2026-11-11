# MOD-001 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/contexts/UserPreferencesContext.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/UserPreferencesContext.tsx#L11) | `export function UserPreferencesProvider({ children }: { children: ReactNode }) {` |
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/UserPreferencesContext.tsx#L28) | `export function useUserPreferences() {` |
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
## src/settings/CommerceSettingsPanels.tsx

| Source line | Existing declaration / binding |
|---|---|
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L17) | `function PolicySelect({ label, bn, hint, value, options, disabled, onChange }: {` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L23) | `options={options} onChange={onChange} disabled={disabled} />}` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L27) | `export function RegionalCurrencySettings({ value, financialYear, disabled, onChange }: RegionalProps) {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L46) | `onChange={v=>set('symbol', v as RegionalPreferences['symbol'])}/>` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L49) | `onChange={v=>set('grouping', v as RegionalPreferences['grouping'])}/>` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L52) | `onChange={v=>set('digits', v as RegionalPreferences['digits'])}/>` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L55) | `onChange={v=>set('dateFormat', v as RegionalPreferences['dateFormat'])}/>` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L58) | `onChange={v=>set('timeFormat', v as RegionalPreferences['timeFormat'])}/>` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L61) | `onChange={v=>set('negativeFormat', v as RegionalPreferences['negativeFormat'])}/>` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L86) | `export function TaxVatSettings({ value, regional, disabled, onChange }: TaxProps) {` |
| [104](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L104) | `onChange={e=>patch({registrationBin:e.target.value})} placeholder="Enter registration reference" />}` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L108) | `onChange={pricing=>patch({pricing:pricing as TaxPreferences['pricing']})}/>` |
| [121](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L121) | `onChange={e=>patch({rates:value.rates.map(v=>v.id===r.id?{...v,label:e.target.value}:v)})}/>}` |
| [125](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L125) | `onChange={e=>patch({rates:value.rates.map(v=>v.id===r.id?{...v,percentage:e.target.value===''?NaN:Number(e.target.value)}:v)})}/>}` |
| [134](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L134) | `onClick={()=>patch({rates:value.rates.filter(v=>v.id!==r.id)})}><Trash2 className="size-4" aria-hidden="true"/></Button>` |
| [137](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L137) | `<Button variant="outline" size="sm" disabled={disabled  /  /  value.rates.length>=12} onClick={()=>{` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L144) | `disabled={disabled} onChange={defaultRateId=>patch({defaultRateId})}/>` |
| [163](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L163) | `export function DocumentNumberingSettings({ value, disabled, onChange }: NumberingProps) {` |
| [165](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L165) | `const [kind,setKind] = useState<DocumentKind>('sale');` |
| [177](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L177) | `{(id,desc)=><AppSelect id={id} describedBy={desc} label="Document type" value={kind} onChange={v=>setKind(v as DocumentKind)}` |
| [183](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L183) | `onChange={e=>patch({prefix:e.target.value.toUpperCase()})}/>}` |
| [187](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L187) | `options={['3','4','5','6','7','8','9','10']} onChange={v=>patch({digits:Number(v)})}/>}` |
| [192](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L192) | `onChange={e=>patch({nextNumber:e.target.value===''?NaN:Number(e.target.value)})}/>}` |
| [196](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L196) | `onChange={v=>patch({year:v as typeof rule.year})}/>` |
| [208](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/CommerceSettingsPanels.tsx#L208) | `onClick={()=>setKind(k)} className={'flex w-full min-w-0 items-center justify-between gap-2 px-1 py-2 text-left text-xs hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring '+(kind===k?'font-semibold text-primary':'text-ink')}>` |
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
## src/settings/DocumentDesignSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L36) | `export function DocumentDesignSettings({` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L49) | `const [compare, setCompare] = useState(false);` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L50) | `const [notice, setNotice] = useState("");` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L53) | `const update = (patch: Partial<InvoiceDesign>) => {` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L160) | `onClick={() => {` |
| [219](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L219) | `onClick={() => update({ paper: item.id })}` |
| [233](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L233) | `onChange={(event) => update({ topOffset: Number(event.target.value) })}` |
| [253](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L253) | `onClick={() => update({ language: item.id })}` |
| [278](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L278) | `onChange={(next) => update({ orientation: next as InvoiceDesign["orientation"] })}` |
| [288](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L288) | `value={d.margin} onChange={(event) => update({ margin: Number(event.target.value) })}` |
| [314](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L314) | `onChange={(event) => update({ [key]: event.target.checked })}` |
| [329](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L329) | `onChange={(event) => update({ footer: event.target.value })}` |
| [370](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L370) | `onChange={(e) => update({ [k]: e.target.value })}` |
| [391](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L391) | `onClick={() => move(s, -1)}` |
| [399](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L399) | `onClick={() => move(s, 1)}` |
| [422](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L422) | `<button type="button" role="radio" aria-checked={!compare} onClick={() => setCompare(false)}` |
| [424](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L424) | `<button type="button" role="radio" aria-checked={compare} onClick={() => setCompare(true)}` |
| [428](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DocumentDesignSettings.tsx#L428) | `<Button variant="ghost" onClick={() => {` |
## src/settings/DraftRecovery.tsx

| Source line | Existing declaration / binding |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DraftRecovery.tsx#L1) | `import {useSyncExternalStore} from 'react';` |
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DraftRecovery.tsx#L8) | `export function DraftRecovery(){const ctx=useRecoveryContext(),{text}=useUiCopy();useSyncExternalStore(recoveryStore.subscribe,recoveryStore.snapshot);const count=ctx.view?recoveryStore.list(ctx).filter(r=>r.state==='deleted').length:0;return <SettingCard title={text('Recycle Bin','রিসাইকেল বিন')}><p className="text-xs text-helper">{text('Deleted records in this session:','এই সেশনে মুছে ফেলা তথ্য:')} {count}. {text('30-day preview recovery; resets on reload.','৩০ দিনের প্রিভিউ উদ্ধার; রিলোডে রিসেট হয়।')}</p><Link className="text-sm text-primary underline" to="/app/recycle-bin">{text('Open Recycle Bin','রিসাইকেল বিন খুলুন')}</Link></SettingCard>;}` |
## src/settings/EmployeeDirectory.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L14) | `export function EmployeeDirectory({ value, canEdit, onAccess, onEdit, actions, language }: {` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L19) | `const [search, setSearch] = useState(""), [status, setStatus] = useState(""), [role, setRole] = useState("");` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L20) | `const [range, setRange] = useState({ from: "", to: "" });` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L21) | `const [expanded, setExpanded] = useState(false), [columnsOpen, setColumnsOpen] = useState(false);` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L22) | `const [page, setPage] = useState(1), [size, setSize] = useState(10);` |
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L43) | `value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />}` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L48) | `onChange={v => { setStatus(v); setPage(1); }} /></label>` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L51) | `onChange={v => { setRole(v); setPage(1); }} /></label>` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L57) | `<Button variant="ghost" onClick={() => { setSearch(""); setRole(""); setStatus(""); setRange({ from: "", to: "" }); setPage(1); }}>{text("Clear employee filters", "কর্মীর ফিল্টার মুছুন")}</Button>` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L60) | `<AppDateRangePicker label={text("Employee joined date range", "কর্মীর যোগদানের সময়কাল")} value={range} onChange={next => { setRange(next); setPage(1); }} className="max-w-full" />` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L61) | `<Button variant="outline" aria-expanded={expanded} aria-controls={filterId} onClick={() => setExpanded(v => !v)}><SlidersHorizontal className="size-4" aria-hidden="true" />{text("Filters", "ফিল্টার")}{active > 0 && ʼ (${active})ʼ}</Button>` |
| [62](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L62) | `<Button variant="outline" onClick={() => setColumnsOpen(true)}><Columns3 className="size-4" aria-hidden="true" />{text("Columns", "কলাম")}</Button>` |
| [72](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L72) | `<td className="px-3 py-2"><button type="button" className="text-left font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" onClick={() => onAccess(e)}>{e.name}</button></td>` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L78) | `<Button variant="ghost" aria-label={ʼView access for ${e.name}ʼ} onClick={() => onAccess(e)}><Eye className="size-4" aria-hidden="true" /></Button>` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L79) | `{canEdit && <Button variant="ghost" aria-label={ʼEdit employee ${e.name}ʼ} onClick={() => onEdit(e)}><Pencil className="size-4" aria-hidden="true" /></Button>}` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L87) | `<div className="flex items-center gap-2"><AppSelect label={text("Employee rows per page", "প্রতি পাতায় কর্মী")} value={String(size)} className="w-20" options={[10, 25, 50].map(n => ({ value: String(n), label: String(n) }))} onChange={v => { setSize(Number(v)); setPage(1); }} />` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L88) | `<Button variant="outline" aria-label={text("Previous employee page", "আগের পাতা")} disabled={current <= 1} onClick={() => setPage(current - 1)}><ChevronLeft className="size-4" /></Button>` |
| [90](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L90) | `<Button variant="outline" aria-label={text("Next employee page", "পরের পাতা")} disabled={current >= totalPages} onClick={() => setPage(current + 1)}><ChevronRight className="size-4" /></Button>` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L95) | `<ColumnVisibilityEditor label={text("Employee columns", "কর্মীদের কলাম")} columns={columns} value={columns.filter(c => visible(c.id)).map(c => c.id)} required={["name", "actions"]} onChange={setColumns} />` |
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/EmployeeDirectory.tsx#L96) | `<div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setColumns(columns.map(c => c.id))}>{text("Reset columns", "কলাম আগের মতো করুন")}</Button><Button onClick={() => setColumnsOpen(false)}>{text("Done", "শেষ")}</Button></div>` |
## src/settings/FinancialTerminologySettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L18) | `export function FinancialTerminologySettings({` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L29) | `const [context, setContext] = useState<FinancialContext>("Customer"),` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L30) | `[query, setQuery] = useState(""),` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L31) | `[showAll, setShowAll] = useState(false);` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L33) | `const update = (patch: Partial<FinancialProfile>) =>` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L67) | `onChange={(v) => setContext(v as FinancialContext)}` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L79) | `onChange={(v) =>` |
| [103](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L103) | `onChange={(v) =>` |
| [116](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L116) | `onClick={() => update(financialDefaults().contexts[context])}` |
| [132](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L132) | `onChange={(e) => setQuery(e.target.value)}` |
| [151](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L151) | `onChange={(e) => edit(key, field, e.target.value)}` |
| [161](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L161) | `onChange={(e) => edit(key, "helper", e.target.value)}` |
| [166](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/FinancialTerminologySettings.tsx#L166) | `<Button variant="ghost" onClick={() => setShowAll((v) => !v)}>` |
## src/settings/InterfaceSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InterfaceSettings.tsx#L10) | `function Columns({` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InterfaceSettings.tsx#L21) | `const [scope, setScope] = useState("mine");` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InterfaceSettings.tsx#L44) | `onChange={setScope}` |
| [79](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InterfaceSettings.tsx#L79) | `onChange={(e) =>` |
| [97](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InterfaceSettings.tsx#L97) | `onClick={() =>` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InterfaceSettings.tsx#L119) | `export function InterfaceSettings(props: {` |
| [124](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InterfaceSettings.tsx#L124) | `const [module, setModule] = useState<ViewModule>("sales");` |
| [133](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InterfaceSettings.tsx#L133) | `onChange={(v) => setModule(v as ViewModule)}` |
## src/settings/InvoicePresentationEditor.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L11) | `export function InvoicePresentationEditor({` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L19) | `const [name, setName] = useState(` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L22) | `[note, setNote] = useState(` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L25) | `[labels, setLabels] = useState<Record<string, string>>({}),` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L26) | `[error, setError] = useState(""),` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L27) | `[notice, setNotice] = useState("");` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L46) | `onChange={(e) => setName(e.target.value)}` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L61) | `onChange={(e) =>` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L73) | `onChange={(e) => setNote(e.target.value)}` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/InvoicePresentationEditor.tsx#L88) | `onClick={() => {` |
## src/settings/ModuleSettingsEntry.tsx

| Source line | Existing declaration / binding |
|---|---|
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ModuleSettingsEntry.tsx#L33) | `export function ModuleSettingsEntry({ children }: { children: ReactNode }) {` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ModuleSettingsEntry.tsx#L36) | `const [moduleOpen, setOpen] = useState(false);` |
| [68](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ModuleSettingsEntry.tsx#L68) | `onClick={() => setOpen(true)}` |
| [81](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ModuleSettingsEntry.tsx#L81) | `<Button ref={backButtonRef} variant="outline" size="sm" onClick={closeModuleSettings}>` |
## src/settings/ModuleSettingsToolbarContext.tsx

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ModuleSettingsToolbarContext.tsx#L6) | `export function useModuleSettingsAction(): ReactNode {` |
## src/settings/OutputDesignSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L10) | `export function OutputDesignSettings({` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L21) | `const [kind, setKind] = useState<"ledger"  /  "report">("ledger");` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L23) | `const update = (patch: Partial<OutputProfile>) =>` |
| [41](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L41) | `onChange={(v) => setKind(v as typeof kind)}` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L56) | `onChange={(v) =>` |
| [74](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L74) | `onChange={(v) =>` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L91) | `onChange={(e) => update({ margin: Number(e.target.value) })}` |
| [120](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L120) | `onChange={(e) => update({ footer: e.target.value })}` |
| [126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/OutputDesignSettings.tsx#L126) | `onClick={() =>` |
## src/settings/SettingsActivity.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L12) | `export function SettingsActivity({ events }: { events: SettingsEvent[] }) {` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L14) | `const [search, setSearch] = useState(""), [section, setSection] = useState("");` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L15) | `const [range, setRange] = useState({ from: "", to: "" });` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L16) | `const [expanded, setExpanded] = useState(false), [columnsOpen, setColumnsOpen] = useState(false);` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L17) | `const [visible, setVisible] = useState(["at", "actor", "section", "changes"]);` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L30) | `<WorkspaceToolbar search={<Input type="search" aria-label={text("Search settings activity", "সেটিংসের কার্যক্রম খুঁজুন")} placeholder={text("Search employee, section or changed field…", "কর্মী, বিভাগ বা পরিবর্তিত তথ্য খুঁজুন…")} value={search} onChange={e => setSearch(e.target.value)} />}` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L32) | `{expanded && <div id={id} className="border-t border-border pt-3"><AppSelect label={text("Activity section", "কার্যক্রমের বিভাগ")} value={section} onChange={setSection} options={[{ value: "", label: text("All sections", "সব বিভাগ") }, ...[...new Set(events.map(e => e.section))].map(value => ({ value, label: sectionLabel(value) }))]} /></div>}` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L33) | `{filtered && <div className="flex flex-wrap items-center gap-2 text-xs text-helper"><span role="status">{rows.length} {text("matching changes", "টি পরিবর্তন পাওয়া গেছে")}</span><Button variant="ghost" onClick={() => { setSearch(""); setSection(""); setRange({ from: "", to: "" }); }}>{text("Clear activity filters", "কার্যক্রমের ফিল্টার মুছুন")}</Button></div>}` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L35) | `<AppDateRangePicker label={text("Settings activity date range", "সেটিংসের কার্যক্রমের সময়কাল")} value={range} onChange={setRange} className="max-w-full" />` |
| [36](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L36) | `<Button variant="outline" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(v => !v)}><SlidersHorizontal className="size-4" aria-hidden="true" />{text("Filters", "ফিল্টার")}{section && " (1)"}</Button>` |
| [37](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L37) | `<Button variant="outline" onClick={() => setColumnsOpen(true)}><Columns3 className="size-4" aria-hidden="true" />{text("Columns", "কলাম")}</Button>` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L53) | `<ColumnVisibilityEditor label={text("Activity columns", "কার্যক্রমের কলাম")} columns={columns} value={visible} required={["at"]} onChange={setVisible} />` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsActivity.tsx#L54) | `<div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setVisible(columns.map(c => c.id))}>{text("Reset columns", "কলাম আগের মতো করুন")}</Button><Button onClick={() => setColumnsOpen(false)}>{text("Done", "শেষ")}</Button></div>` |
## src/settings/SettingsDirectory.tsx

| Source line | Existing declaration / binding |
|---|---|
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsDirectory.tsx#L27) | `export function SettingsDirectory({ items, selected, onSelect, id, panelId, language }: {` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsDirectory.tsx#L35) | `const [query, setQuery] = useState('');` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsDirectory.tsx#L46) | `value={query} onChange={event=>setQuery(event.target.value)}` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsDirectory.tsx#L66) | `onClick={()=>{ onSelect(item.id); setQuery(''); }}` |
| [67](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsDirectory.tsx#L67) | `onKeyDown={event=>{` |
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
## src/settings/SettingsTabs.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsTabs.tsx#L12) | `export function SettingsTabs({ items, value, onChange, label, id, panelId, secondary = false,` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsTabs.tsx#L21) | `const [search, setSearch] = useState("");` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsTabs.tsx#L27) | `const [scroll, setScroll] = useState({ overflow: false, left: false, right: false });` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsTabs.tsx#L65) | `onKeyDown={event => {` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsTabs.tsx#L73) | `onClick={() => { onChange(item.id); setSearch(""); }}` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsTabs.tsx#L87) | `onClick={() => list.current?.scrollBy({ left: -Math.max(120, list.current.clientWidth * 0.75) })}>` |
| [101](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsTabs.tsx#L101) | `onClick={() => list.current?.scrollBy({ left: Math.max(120, list.current.clientWidth * 0.75) })}>` |
## src/settings/TeamSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L34) | `export function TeamSettings({` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L50) | `const [tab, setTab] = useState("employees"),` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L51) | `[showDirectory, setShowDirectory] = useState(false),` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L52) | `[role, setRole] = useState<BusinessRole  /  null>(null),` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L53) | `[employee, setEmployee] = useState<BusinessEmployee  /  null>(null),` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L54) | `[access, setAccess] = useState<BusinessEmployee  /  null>(null),` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L55) | `[error, setError] = useState(""),` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L56) | `[ack, setAck] = useState(false);` |
| [119](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L119) | `<Button onClick={() => openEmployee()}>` |
| [162](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L162) | `onClick={() => setAccess(member)}` |
| [177](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L177) | `<Button variant="ghost" aria-label={ʼEdit employee ${member.name}ʼ} onClick={() => openEmployee(member)}>` |
| [218](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L218) | `<Button variant="ghost" onClick={() => setShowDirectory((previous) => !previous)}>` |
| [221](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L221) | `{canSeeRoles && <Button variant="outline" onClick={() => setTab("roles")}>Manage roles</Button>}` |
| [232](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L232) | `{canSeeUsers && <Button variant="outline" onClick={() => setTab("employees")}>Back to team</Button>}` |
| [234](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L234) | `<Button onClick={() => openRole()}>` |
| [298](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L298) | `<Button variant="outline" onClick={() => openRole(r)}>` |
| [304](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L304) | `onClick={() => {` |
| [362](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L362) | `onChange={(e) => setRole({ ...role, name: e.target.value })}` |
| [390](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L390) | `onChange={(e) =>` |
| [429](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L429) | `onChange={(e) =>` |
| [464](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L464) | `onChange={(e) => setAck(e.target.checked)}` |
| [474](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L474) | `<Button variant="outline" onClick={close}>` |
| [479](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L479) | `onClick={() => {` |
| [518](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L518) | `onChange={(e) =>` |
| [530](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L530) | `onChange={(e) =>` |
| [537](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L537) | `{() => <AppDatePicker label="Joined date" value={employee.joinedDate ?? ""} onChange={joinedDate => setEmployee({ ...employee, joinedDate })} />}` |
| [556](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L556) | `onChange={(e) =>` |
| [574](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L574) | `onChange={(e) =>` |
| [586](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L586) | `<Button variant="outline" onClick={close}>` |
| [590](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TeamSettings.tsx#L590) | `onClick={() => {` |
## src/settings/TenantSettingsHub.tsx

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsHub.tsx#L10) | `export function TenantSettingsHub({onNavigate}:{onNavigate?:(path:string,event:React.MouseEvent<HTMLAnchorElement>)=>void}){` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsHub.tsx#L27) | `onClick={e=>onNavigate?.(item.path,e)}` |
## src/settings/TenantSettingsPage.tsx

| Source line | Existing declaration / binding |
|---|---|
| [96](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L96) | `function LogoField({` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L109) | `const [error, setError] = useState(""),` |
| [110](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L110) | `[reading, setReading] = useState(false);` |
| [139](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L139) | `onChange={(e) => {` |
| [172](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L172) | `onClick={() => onChange("")}` |
| [190](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L190) | `function Fields({` |
| [212](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L212) | `const update = (next: unknown) =>` |
| [249](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L249) | `onChange={update}` |
| [262](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L262) | `onChange={(e) => update(e.target.value)}` |
| [272](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L272) | `onChange={update}` |
| [291](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L291) | `onChange={(e) =>` |
| [310](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L310) | `export function SettingsPageContent({` |
| [328](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L328) | `const [readingLogo, setReadingLogo] = useState(false);` |
| [329](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L329) | `const [draft, setDraft] = useState<Draft>(() =>` |
| [338](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L338) | `const [baseline, setBaseline] = useState(JSON.stringify(draft)),` |
| [339](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L339) | `[revision, setRevision] = useState(state.revision);` |
| [340](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L340) | `const [personalDraft, setPersonalDraft] = useState<PersonalSettings>({` |
| [343](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L343) | `[themeDraft, setThemeDraft] = useState(theme);` |
| [344](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L344) | `const [query, setQuery] = useState(""),` |
| [345](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L345) | `[error, setError] = useState(""),` |
| [346](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L346) | `[notice, setNotice] = useState(""),` |
| [347](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L347) | `[resetOpen, setResetOpen] = useState(false),` |
| [348](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L348) | `[reviewOpen, setReviewOpen] = useState(false),` |
| [349](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L349) | `[leaveOpen, setLeaveOpen] = useState(false);` |
| [352](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L352) | `const [activeSubsections, setActiveSubsections] = useState<` |
| [406](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L406) | `function requestChange(action: () => void) {` |
| [573](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L573) | `<input type="checkbox" className="size-4 accent-teal-600" checked={personal.mode === "Advanced"} onChange={(event) => updatePersonal({ mode: event.target.checked ? "Advanced" : "Simple" })}/>` |
| [581](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L581) | `onChange={(id) => requestChange(() => setActorId(id))}` |
| [618](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L618) | `onKeyDown={(event) => {` |
| [631](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L631) | `onChange={(event) => setQuery(event.target.value)}` |
| [645](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L645) | `onClick={() => {` |
| [697](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L697) | `onChange={(id) => requestChange(() => setActorId(id))}` |
| [717](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L717) | `onChange={() => updatePersonal({ mode })}` |
| [730](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L730) | `onSelect={(value)=>{ if (value !== section) requestChange(()=>navigate(ʼ/app/settings/${value}ʼ, { state:{settingsTabFocus:value} })); }}` |
| [744](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L744) | `onChange={(value) => {` |
| [772](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L772) | `onChange={selectSubsection}` |
| [799](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L799) | `onSubmit={(e) => {` |
| [823](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L823) | `onChange={setDraft}` |
| [828](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L828) | `onChange={setDraft}` |
| [836](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L836) | `onChange={setDraft}` |
| [853](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L853) | `onChange={(next) =>` |
| [875](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L875) | `onChange={(language) =>` |
| [900](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L900) | `onChange={(searchMode) =>` |
| [934](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L934) | `onChange={(density) =>` |
| [955](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L955) | `onChange={(terminology) =>` |
| [982](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L982) | `onChange={(dateView) =>` |
| [1013](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1013) | `onChange={(regional) => setDraft((previous) => ({ ...previous, regional }))}` |
| [1017](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1017) | `value={draft} onChange={setDraft} disabled={!editable} language={personal.language} onReading={setReadingLogo}/>` |
| [1025](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1025) | `onChange={(tax) => setDraft((previous) => ({ ...previous, tax }))}` |
| [1039](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1039) | `onChange={setDraft}` |
| [1073](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1073) | `onChange={setDraft}` |
| [1094](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1094) | `onChange={setDraft}` |
| [1117](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1117) | `onChange={(event) => updatePersonal({ mode: event.target.checked ? "Advanced" : "Simple" })}` |
| [1127](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1127) | `value={draft} onChange={setDraft} disabled={!editable}` |
| [1157](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1157) | `value={draft} onChange={setDraft} disabled={!editable}` |
| [1186](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1186) | `value={draft} onChange={setDraft} disabled={!editable}` |
| [1216](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1216) | `onChange={setDraft}` |
| [1241](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1241) | `onChange={setDraft}` |
| [1286](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1286) | `onChange={setDraft}` |
| [1293](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1293) | `onChange={(numbering) => setDraft((previous) => ({ ...previous, numbering, prefix: numbering.sale.prefix }))}` |
| [1301](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1301) | `onChange={setDraft}` |
| [1382](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1382) | `onClick={() => updatePersonal({ mode: "Advanced" })}` |
| [1417](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1417) | `onSave={() => {` |
| [1451](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1451) | `onClick={() => {` |
| [1461](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1461) | `<Button variant="outline" onClick={() => setLeaveOpen(false)}>` |
| [1465](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1465) | `onClick={() => {` |
| [1482](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1482) | `<Button variant="outline" onClick={() => setResetOpen(false)}>` |
| [1486](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1486) | `onClick={() => {` |
| [1536](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1536) | `<Button variant="outline" onClick={() => setReviewOpen(false)}>` |
| [1539](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1539) | `<Button onClick={commit}>Confirm save</Button>` |
| [1548](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1548) | `export function TenantSettingsPage() {` |
| [1552](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1552) | `const [magicDirty, setMagicDirty] = useState(false);` |
| [1553](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1553) | `const [invoiceStudioDirty, setInvoiceStudioDirty] = useState(false);` |
| [1554](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1554) | `const [interfaceMagicDirty, setInterfaceMagicDirty] = useState(false);` |
| [1555](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1555) | `const [teamMagicDirty, setTeamMagicDirty] = useState(false);` |
| [1556](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1556) | `const [invoiceNumberDirty, setInvoiceNumberDirty] = useState(false);` |
| [1557](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1557) | `const [pendingMagicUrl, setPendingMagicUrl] = useState<string  /  null>(null);` |
| [1598](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1598) | `<Button onClick={() => downloadSettings('hisabiq-settings.json', JSON.stringify(state, null, 2))} title="Download settings JSON only; not a full ERP data backup">` |
| [1674](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1674) | `<Button variant="outline" onClick={() => setPendingMagicUrl(null)}>Keep editing</Button>` |
| [1675](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsPage.tsx#L1675) | `<Button onClick={() => {` |
## src/settings/TenantSettingsProvider.tsx

| Source line | Existing declaration / binding |
|---|---|
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L26) | `function readInitial() {` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L86) | `export function TenantSettingsProvider({ children }: { children: ReactNode }) {` |
| [87](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L87) | `const [initial] = useState(readInitial);` |
| [88](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L88) | `const [state, setState] = useState(initial.state);` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L92) | `const [personal, setPersonal] = useState(initial.personal);` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L94) | `const [warning, setWarning] = useState(initial.warning);` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L95) | `const [actorId, changeActorId] = useState("mahmud");` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L118) | `function persist(next: TenantSettings) {` |
| [149](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L149) | `function updatePersonal(patch: Partial<PersonalSettings>) {` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L164) | `function restore(value: TenantSettings, expectedRevision: number) {` |
| [207](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/TenantSettingsProvider.tsx#L207) | `export function useTenantSettings() {` |
## src/settings/commercePolicies.ts

| Source line | Existing declaration / binding |
|---|---|
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L46) | `export function regionalDefaults(): RegionalPreferences {` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L53) | `export function taxDefaults(): TaxPreferences {` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L60) | `export function numberingDefaults(salePrefix = 'INV'): DocumentNumberingPreferences {` |
| [73](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L73) | `export function validateRegional(value: unknown): string  /  null {` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L86) | `export function validateTax(value: unknown): string  /  null {` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L112) | `export function validateNumbering(value: unknown): string  /  null {` |
| [131](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L131) | `export function previewDocumentNumber(rule: DocumentNumberRule, year = 2026): string {` |
| [135](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L135) | `export function regionalMoney(amount: number, config: RegionalPreferences): string {` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L144) | `export function regionalDate(date: Date, config: RegionalPreferences): string {` |
| [153](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/commercePolicies.ts#L153) | `export function previewVat(amount: number, percentage: number, pricing: TaxPreferences['pricing']) {` |
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
## src/settings/magic/GeneralSettingsSection.tsx

| Source line | Existing declaration / binding |
|---|---|
| [43](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L43) | `export function GeneralSettingsSection({` |
| [49](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L49) | `const [cashFeedback,setCashFeedback]=useState('');` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L51) | `const [advanced, setAdvanced] = useState(false);` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L52) | `const [draft, setDraft] = useState<Draft>(() => initialDraft(all, bridge.state.settings));` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L53) | `const [baseline] = useState<Draft>(() => initialDraft(all, bridge.state.settings));` |
| [54](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L54) | `const [errors, setErrors] = useState<Record<string, string>>({});` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L55) | `const [feedback, setFeedback] = useState('');` |
| [56](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L56) | `const [reviewWarnings, setReviewWarnings] = useState<string[]  /  null>(null);` |
| [71](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L71) | `const restoreDefaults = () => {` |
| [160](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L160) | `onChange={v => set(field.key, v)} options={field.options ?? []} disabled={disabled} />` |
| [164](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L164) | `value={String(draft[field.key] ?? '')} onChange={e => set(field.key, e.target.value)}` |
| [171](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L171) | `onChange={e => set(field.key,` |
| [195](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L195) | `onClick={() => setAdvanced(value => !value)}` |
| [211](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L211) | `<button type="button" onClick={() => setAdvanced(true)}` |
| [225](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L225) | `onSave={reviewSave} onDiscard={discard} onRestore={restoreDefaults}` |
| [235](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L235) | `<Button onClick={() => setReviewWarnings(null)}>Go back</Button>` |
| [236](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L236) | `<Button kind="primary" onClick={() => {` |
| [257](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/GeneralSettingsSection.tsx#L257) | `function initialDraft(fields: SettingField[], bridge: Record<string, unknown>): Draft {` |
## src/settings/magic/KhataPreview.tsx

| Source line | Existing declaration / binding |
|---|---|
| [11](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/KhataPreview.tsx#L11) | `export function KhataPreview({ draft }: { draft: KhataPreviewDraft }) {` |
## src/settings/magic/SaveBar.tsx

| Source line | Existing declaration / binding |
|---|---|
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SaveBar.tsx#L24) | `export function SaveBar({` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SaveBar.tsx#L47) | `<Button variant="ghost" size="sm" disabled={saving  /  /  restoreDisabled} onClick={onRestore}>` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SaveBar.tsx#L52) | `<Button variant="outline" size="sm" disabled={!dirty  /  /  saving} onClick={onDiscard}>` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SaveBar.tsx#L55) | `<Button size="sm" disabled={!dirty  /  /  saving  /  /  saveDisabled} onClick={onSave}>` |
## src/settings/magic/SettingsHome.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsHome.tsx#L14) | `export function SettingsHome({ urlFor }: Props) {` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsHome.tsx#L17) | `const [query, setQuery] = useState('');` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsHome.tsx#L19) | `const [wizard, setWizard] = useState(false);` |
| [55](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsHome.tsx#L55) | `<button type="button" onClick={() => setWizard(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-[13px] font-medium text-white hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">` |
| [92](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsHome.tsx#L92) | `onChange={(e) => setQuery(e.target.value)}` |
| [155](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsHome.tsx#L155) | `<button type="button" onClick={() => setWizard(true)} className="font-medium text-teal-700 hover:underline">Run guided setup again</button> ·{' '}` |
## src/settings/magic/SettingsNav.tsx

| Source line | Existing declaration / binding |
|---|---|
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsNav.tsx#L15) | `export function SettingsNav({ activeId, urlFor, onNavigate }: SettingsNavProps) {` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsNav.tsx#L16) | `const [query, setQuery] = useState('');` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsNav.tsx#L51) | `onClick={(e) => onNavigate('/app/settings', e)}` |
| [61](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsNav.tsx#L61) | `onChange={(e) => setQuery(e.target.value)}` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsNav.tsx#L84) | `onClick={(e) => onNavigate(url, e)}` |
## src/settings/magic/SettingsToggle.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsToggle.tsx#L14) | `function SettingsToggle({ checked, disabled, className = '', onChange, onCheckedChange, ...rest }, ref) {` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SettingsToggle.tsx#L44) | `onChange={(event) => {` |
## src/settings/magic/SetupWizard.tsx

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SetupWizard.tsx#L20) | `export function SetupWizard({ onClose }: { onClose: () => void }) {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SetupWizard.tsx#L21) | `const [step, setStep] = useState(0);` |
| [38](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SetupWizard.tsx#L38) | `<Link to={current.route} onClick={onClose} className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-600 px-3.5 text-[13px] font-medium text-white hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">` |
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SetupWizard.tsx#L44) | `<Button variant="ghost" onClick={onClose}>Skip for now</Button>` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SetupWizard.tsx#L45) | `{step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/SetupWizard.tsx#L46) | `{step < steps.length - 1 ? <Button onClick={() => setStep(step + 1)}>Continue</Button> : <Button onClick={onClose}>Finish</Button>}` |
## src/settings/magic/TeamSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L12) | `function Input({ value, onChange, placeholder = '', inputRef, invalid, errorId }: { value: string; onChange: (value: string) => void; placeholder?: string; inputRef?: React.Ref<HTMLInputElement>; invalid?: boolean; errorId?: string }) {` |
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L13) | `return <input ref={inputRef} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} aria-invalid={invalid  /  /  undefined} aria-describedby={errorId} aria-errormessage={invalid ? errorId : undefined}` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L16) | `function Field({ label, children }: { label: string; children: React.ReactNode }) {` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L20) | `function Select({ value, onChange, options, describedBy }: { value: string; onChange: (value: string) => void; options: string[]; describedBy?: string }) {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L21) | `return <AppSelect label="Role" value={value} options={options} onChange={onChange} describedBy={describedBy} className="w-full" />;` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L23) | `function Tag({ children, color }: { children: React.ReactNode; color: 'success'  /  'neutral' }) {` |
| [27](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L27) | `function localPreviewStaff(roles: { id: string; name: string }[], employees: { id: string; name: string; roleIds: string[]; active: boolean }[]): Staff[] {` |
| [46](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L46) | `export function TeamSettings({ canEdit, onDirtyChange }: { canEdit: boolean; onDirtyChange: (dirty: boolean) => void }) {` |
| [51](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L51) | `const [staff, setStaff] = useState<Staff[]>(() => localPreviewStaff(source.roles, source.employees));` |
| [52](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L52) | `const [initialStaff] = useState<Staff[]>(() => localPreviewStaff(source.roles, source.employees));` |
| [53](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L53) | `const [feedback, setFeedback] = useState('');` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L57) | `const [editor, setEditor] = useState<Staff  /  null>(null);` |
| [58](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L58) | `const [error, setError] = useState('');` |
| [59](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L59) | `const [errorField, setErrorField] = useState<'name'  /  'role'  /  'active'  /  null>(null);` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L75) | `const save = () => {` |
| [100](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L100) | `onClick={() => {` |
| [143](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L143) | `onClick={() => {` |
| [177](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L177) | `<Button onClick={() => setEditor(null)}>Cancel</Button>` |
| [178](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L178) | `<Button kind="primary" onClick={save}>Save</Button>` |
| [184](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L184) | `<Input value={editor.name} onChange={(name) => { clearError(); setEditor({ ...editor, name }); }} inputRef={nameInputRef} invalid={Boolean(error) && errorField === 'name'} errorId={errorField === 'name' ? errorId : undefined} placeholder="e.g. Sabbir Hossain" />` |
| [189](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/TeamSettings.tsx#L189) | `<span className="mt-1.5 block font-normal"><Select value={editor.role} onChange={(role) => { clearError(); setEditor({ ...editor, role }); }} describedBy={errorField === 'role' ? errorId : undefined} options={roles.map((r) => r.role)} /></span>` |
## src/settings/magic/interface/CapabilityRow.tsx

| Source line | Existing declaration / binding |
|---|---|
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/CapabilityRow.tsx#L20) | `export function CapabilityRow({ descriptor: d, mode, checked, onChange, source, changed, blockedBy, saving = false, saved = false }: CapabilityRowProps) {` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/CapabilityRow.tsx#L21) | `const [why, setWhy] = useState(false);` |
| [66](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/CapabilityRow.tsx#L66) | `onClick={() => setWhy((w) => !w)}` |
## src/settings/magic/interface/InterfacePreview.tsx

| Source line | Existing declaration / binding |
|---|---|
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfacePreview.tsx#L21) | `export function InterfacePreview({ snapshot, moduleId }: { snapshot: ExperienceSnapshot; moduleId: string }) {` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfacePreview.tsx#L22) | `const [vp, setVp] = useState<Viewport>('desktop');` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfacePreview.tsx#L34) | `<Tabs label="Preview size" items={[{ id: 'desktop', label: 'Desktop' }, { id: 'tablet', label: 'Tablet' }, { id: 'mobile', label: 'Mobile' }]} value={vp} onChange={(v) => setVp(v as Viewport)} />` |
## src/settings/magic/interface/InterfaceSettings.tsx

| Source line | Existing declaration / binding |
|---|---|
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L21) | `export function InterfaceSettings({ onDirtyChange, canBusiness }: { onDirtyChange?: (dirty: boolean) => void; canBusiness: boolean }) {` |
| [24](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L24) | `const [showAdvanced, setShowAdvanced] = useState(false);` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L25) | `const [showPreview, setShowPreview] = useState(false);` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L50) | `onChange={(v) => (isTenant ? s.set(d.key, v) : s.applyNow(d.key, v))}` |
| [78](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L78) | `<ModuleSelector value={s.moduleId} counts={counts} onChange={(id) => s.requestSwitch({ kind: 'module', value: id })} />` |
| [84](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L84) | `onChange={(v) => s.requestSwitch({ kind: 'scope', value: v })}` |
| [95](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L95) | `<button className="ml-1 font-medium underline" onClick={() => s.setNotice(null)}>Dismiss</button>` |
| [147](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L147) | `onClick={() => setShowAdvanced((v) => !v)}` |
| [181](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L181) | `<Button kind="ghost" onClick={() => setShowPreview((v) => !v)}>` |
| [188](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L188) | `<Button kind="ghost" disabled={s.overrideCount === 0  /  /  !!s.savingKey} onClick={s.resetMineNow}>` |
| [210](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L210) | `onSave={s.save}` |
| [225](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L225) | `<Button onClick={() => s.setPending(null)}>Keep editing</Button>` |
| [226](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L226) | `<Button kind="danger" onClick={s.confirmSwitch}>Discard</Button>` |
| [242](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L242) | `<Button onClick={() => s.setReview(false)}>Keep editing</Button>` |
| [243](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceSettings.tsx#L243) | `<Button kind="primary" onClick={s.commit}>Continue preview (no save)</Button>` |
## src/settings/magic/interface/InterfaceTabs.tsx

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceTabs.tsx#L5) | `export function Tabs({ items, value, onChange, label = 'Section tabs' }: {` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceTabs.tsx#L29) | `tabIndex={active ? 0 : -1} onClick={() => onChange(t.id)}` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/InterfaceTabs.tsx#L30) | `onKeyDown={event => onKey(event, index)}` |
## src/settings/magic/interface/ModuleSelector.tsx

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/ModuleSelector.tsx#L14) | `export function ModuleSelector({ value, onChange, counts }: ModuleSelectorProps) {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/ModuleSelector.tsx#L15) | `const [open, setOpen] = useState(false);` |
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/ModuleSelector.tsx#L16) | `const [query, setQuery] = useState('');` |
| [17](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/ModuleSelector.tsx#L17) | `const [active, setActive] = useState(0);` |
| [45](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/ModuleSelector.tsx#L45) | `onClick={() => setOpen((o) => !o)}` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/ModuleSelector.tsx#L60) | `onChange={(e) => {` |
| [64](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/ModuleSelector.tsx#L64) | `onKeyDown={(e) => {` |
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/ModuleSelector.tsx#L89) | `onClick={() => choose(m.id)}` |
## src/settings/magic/interface/experienceResolver.ts

| Source line | Existing declaration / binding |
|---|---|
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/experienceResolver.ts#L35) | `export function resolveAll(input: ResolveInput) {` |
| [75](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/experienceResolver.ts#L75) | `export function buildSnapshot(args: {` |
| [105](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/experienceResolver.ts#L105) | `export function accessFor(snapshot: ExperienceSnapshot, key: string): AccessDecision {` |
| [109](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/experienceResolver.ts#L109) | `export function visibleColumns(snapshot: ExperienceSnapshot, module: string, viewport: Viewport): string[] {` |
## src/settings/magic/interface/useInterfaceDraft.ts

| Source line | Existing declaration / binding |
|---|---|
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L14) | `export function useInterfaceDraft(canBusiness: boolean) {` |
| [18](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L18) | `const [moduleId, setModuleId] = useState(initial && validModules.includes(initial) ? initial : 'sales');` |
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L19) | `const [scopeKind, setScopeKind] = useState<'user'  /  'tenant'>('user');` |
| [20](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L20) | `const [draft, setDraft] = useState<Record<string, SettingValue  /  null>>({});` |
| [21](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L21) | `const [pending, setPending] = useState<{ kind: 'module'  /  'scope'; value: string }  /  null>(null);` |
| [22](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L22) | `const [review, setReview] = useState(false);` |
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L23) | `const [notice, setNotice] = useState<{ tone: 'info'  /  'warning'  /  'danger'; text: string }  /  null>(null);` |
| [94](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L94) | `const confirmSwitch = () => {` |
| [111](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/interface/useInterfaceDraft.ts#L111) | `const save = () => { if (dirty) setReview(true); };` |
## src/settings/magic/invoice/DesignGallery.tsx

| Source line | Existing declaration / binding |
|---|---|
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/DesignGallery.tsx#L12) | `export function DesignGallery({ value, premium, disabled, onPick }: Props) {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/DesignGallery.tsx#L26) | `onClick={() => onPick(d.id)}` |
## src/settings/magic/invoice/InvoiceDocument.tsx

| Source line | Existing declaration / binding |
|---|---|
| [28](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceDocument.tsx#L28) | `export function InvoiceDocument({ design, paper, lang, accent, content, padOffset = 30, footer, offline, invoice }: InvoiceDocumentProps) {` |
| [240](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceDocument.tsx#L240) | `function Row({ label, value, strong, danger, accent }: { label: React.ReactNode; value: string; strong?: boolean; danger?: boolean; accent?: string }) {` |
| [249](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceDocument.tsx#L249) | `function Dash() {` |
## src/settings/magic/invoice/InvoiceStudio.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L23) | `export function InvoiceStudio({ canEdit, onDirtyChange }: Props) {` |
| [29](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L29) | `const saved = defaultInvoiceDesign;` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L30) | `const [draft, setDraft] = useState<InvoiceDesignSettings>(saved);` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L31) | `const [locked, setLocked] = useState<InvoiceDesignId  /  'pad'  /  'color'  /  null>(null);` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L32) | `const [compare, setCompare] = useState(false);` |
| [33](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L33) | `const [feedback, setFeedback] = useState('');` |
| [91](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L91) | `onClick={() => pickPaper(p.id)}` |
| [106](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L106) | `<input type="range" min={0} max={100} step={5} value={draft.padOffset} disabled={!canEdit} onChange={(e) => set({ padOffset: Number(e.target.value) })} className="mt-2 block w-full accent-teal-600" />` |
| [112](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L112) | `<Segmented label="Document language" options={langOptions} value={draft.lang} onChange={(id) => canEdit && set({ lang: id as InvoiceDesignSettings['lang'] })} />` |
| [137](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L137) | `onClick={() => (!premium && c.id !== 'teal' ? setLocked('color') : set({ accent: c.hex }))}` |
| [144](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L144) | `<input type="color" value={draft.accent} disabled={!canEdit  /  /  !premium} onChange={(e) => set({ accent: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-ink-200 bg-card p-0.5" />` |
| [174](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L174) | `onChange={(e) => set({ footer: e.target.value.slice(0, 80) })}` |
| [189](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L189) | `{dirty && <Segmented label="Compare" options={[{ id: 'draft', label: 'New' }, { id: 'saved', label: 'Current' }]} value={compare ? 'saved' : 'draft'} onChange={(id) => setCompare(id === 'saved')} />}` |
| [190](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L190) | `<Button kind="ghost" onClick={() => setFeedback('This sample invoice is a UI preview; production printing will be connected in Phase 2.')} title="Print preview"><Printer className="size-4" />Print</Button>` |
| [218](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L218) | `onSave={doSave}` |
| [232](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L232) | `<Button onClick={() => setLocked(null)}>Keep current design</Button>` |
| [233](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L233) | `<Button kind="primary" onClick={() => { setLocked(null); navigate('/app/subscription'); }}>` |
| [264](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/InvoiceStudio.tsx#L264) | `function contrastRatio(hex: string): number {` |
## src/settings/magic/invoice/Ui.tsx

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/Ui.tsx#L8) | `export function Button({children,onClick,kind='outline',type='button',disabled=false,className='',title,workflow=false}:{children:React.ReactNode;onClick?:()=>void;kind?:'primary' / 'outline' / 'danger' / 'ghost';type?:'button' / 'submit';disabled?:boolean;className?:string;title?:string;workflow?:boolean}){` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/Ui.tsx#L9) | `return <button type={type} onClick={onClick} disabled={disabled} title={title} data-erp-workflow-action={workflow?'complete':undefined} className={'ref-action inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 '+(workflow?'h-12 px-4 ':'h-9 ')+(kind==='primary'?'ref-button-primary border-teal-600 bg-teal-600 text-white hover:bg-teal-700':kind==='danger'?'border-danger/25 bg-danger-bg text-danger hover:border-danger/40':kind==='ghost'?'border-transparent bg-transparent text-ink-600 hover:bg-ink-50 hover:text-ink':'ref-button-outline border-ink-200 bg-card text-ink-700 hover:border-teal-300 hover:bg-teal-50/60 hover:t` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/Ui.tsx#L15) | `export function Modal({title,children,onClose,footer,wide=false}:{title:string;children:React.ReactNode;onClose:()=>void;footer?:React.ReactNode;wide?:boolean}){` |
| [77](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/Ui.tsx#L77) | `<header className="flex items-center justify-between border-b border-ink-100 px-4 py-3"><h2 className="text-base font-semibold text-ink">{title}</h2><button type="button" className="flex size-9 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40" aria-label="Close" onClick={onClose}><X className="size-4"/></button></header>` |
| [83](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/Ui.tsx#L83) | `export function Segmented({options,value,onChange,label}:{options:{id:string;label:string}[];value:string;onChange:(id:string)=>void;label:string}){` |
| [86](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/Ui.tsx#L86) | `{options.map(o=>{const active=o.id===value;return <button key={o.id} type="button" role="radio" aria-checked={active} onClick={()=>onChange(o.id)} className={'relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 '+(active?'text-white':'text-ink-500 hover:bg-ink-50 hover:text-ink')}>` |
## src/settings/magic/invoice/bangla.ts

| Source line | Existing declaration / binding |
|---|---|
| [10](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/bangla.ts#L10) | `export function toBnDigits(value: string  /  number): string {` |
| [15](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/bangla.ts#L15) | `export function lakhGroup(value: number, decimals = 2): string {` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/bangla.ts#L25) | `export function docMoney(value: number, lang: DocLanguage, decimals = 2): string {` |
| [30](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/bangla.ts#L30) | `export function docNumber(value: string  /  number, lang: DocLanguage): string {` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/bangla.ts#L35) | `export function docDate(iso: string, lang: DocLanguage): string {` |
| [50](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/bangla.ts#L50) | `export function amountWordsEn(value: number): string {` |
| [65](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/invoice/bangla.ts#L65) | `export function docAmountWords(value: number, lang: DocLanguage): string {` |
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
## src/settings/magic/settingsBridge.ts

| Source line | Existing declaration / binding |
|---|---|
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/settingsBridge.ts#L7) | `export function useMagicSettingsState() {` |
| [26](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/settingsBridge.ts#L26) | `const saved = { paper: inv.paper, showBangla: inv.showBangla, showLogo: inv.showLogo };` |
## src/settings/model.ts

| Source line | Existing declaration / binding |
|---|---|
| [186](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/model.ts#L186) | `export function defaults(tenantId = currentBusinessId): TenantSettings {` |
| [333](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/model.ts#L333) | `export function canManage(` |
| [353](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/model.ts#L353) | `export function validateSection<K extends BusinessSection>(` |
| [524](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/model.ts#L524) | `export function validPersonal(v: unknown): v is PersonalSettings {` |
| [535](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/model.ts#L535) | `export function parseSettings(` |
| [589](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/model.ts#L589) | `export function saveSection<K extends BusinessSection>(` |
| [667](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/model.ts#L667) | `export function roundInvoice(net: number, setting: SalesSettings["rounding"]) {` |
## src/settings/moduleViews.ts

| Source line | Existing declaration / binding |
|---|---|
| [44](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/moduleViews.ts#L44) | `export function resolveModuleColumns(` |
| [60](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/moduleViews.ts#L60) | `export function validModuleViews(value: unknown): value is ModuleViews {` |
## src/settings/navigationGuard.ts

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/navigationGuard.ts#L6) | `export function listenSettingsPop(handler: (event: PopStateEvent) => void) {` |
## src/settings/rbac.ts

| Source line | Existing declaration / binding |
|---|---|
| [89](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/rbac.ts#L89) | `export function effectivePermissions(` |
| [114](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/rbac.ts#L114) | `export function roleImpact(team: TeamSettings, next: BusinessRole) {` |
| [126](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/rbac.ts#L126) | `export function validateRoleChange(` |
## src/settings/settingsHub.ts

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/settingsHub.ts#L16) | `export function getSettingsHubItems(context:NavigationContext):SettingsHubItem[]{` |
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
## src/settings/subsections.ts

| Source line | Existing declaration / binding |
|---|---|
| [19](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/subsections.ts#L19) | `export function businessFieldGroup(key: string) {` |
## src/settings/ui.tsx

| Source line | Existing declaration / binding |
|---|---|
| [23](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ui.tsx#L23) | `export function Button({` |
| [47](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ui.tsx#L47) | `export function Switch(props: {` |
| [57](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ui.tsx#L57) | `export function SettingsDialog({` |
| [108](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ui.tsx#L108) | `onClick={onClose}` |
| [118](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ui.tsx#L118) | `export function SettingsField({` |
| [162](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ui.tsx#L162) | `export function SettingCard({` |
| [194](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/ui.tsx#L194) | `export function download(` |
## src/settings/useModuleColumns.ts

| Source line | Existing declaration / binding |
|---|---|
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/useModuleColumns.ts#L8) | `export function useModuleColumns<K extends string>(` |
| [31](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/useModuleColumns.ts#L31) | `const [own, setOwn] = useState(read),` |
| [32](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/useModuleColumns.ts#L32) | `[warning, setWarning] = useState("");` |
| [48](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/useModuleColumns.ts#L48) | `const save = (next: Record<string, boolean>) => {` |
