# MOD-020 source-action census

Static extraction of handlers, states and event bindings. Read at pinned source. Inline snippets may be shortened; they are not substitutes for complete handlers or a behavior proof.

## src/pages/RecycleBin.tsx

| Source line | Existing declaration / binding |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/RecycleBin.tsx#L1) | `import {useSyncExternalStore} from 'react';` |
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/RecycleBin.tsx#L6) | `export function RecycleBin(){const ctx=useRecoveryContext();useSyncExternalStore(recoveryStore.subscribe,recoveryStore.snapshot);const count=ctx.view?recoveryStore.list(ctx).filter(r=>r.state==='deleted').length:0;return <div className="space-y-4"><PageHeader title={ʼRecycle Bin (${count})ʼ} titleBn={ʼরিসাইকেল বিন (${count})ʼ} description="Review deleted preview records and restore their original identity." descriptionBn="মুছে ফেলা প্রিভিউ তথ্য দেখুন ও আগের পরিচয়ে ফেরান।"/><RecycleBinList/></div>;}` |
## src/recovery/adapters.ts

| Source line | Existing declaration / binding |
|---|---|
| [16](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/adapters.ts#L16) | `export function productDeleteReason(id:string):string / undefined{` |
| [25](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/adapters.ts#L25) | `export function partyDeleteReason(id:string):string / undefined{` |
## src/recovery/authority.ts

| Source line | Existing declaration / binding |
|---|---|
| [6](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/authority.ts#L6) | `export function resolveRecoveryContext({state,actorId}:CurrentAuthority):RecoveryContext{` |
| [12](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/authority.ts#L12) | `export function restoreWithCurrentAuthority(store:ReturnType<typeof createRecoveryStore>,deletionId:string,current:()=>CurrentAuthority){store.restore(deletionId,resolveRecoveryContext(current()));}` |
## src/recovery/copy.ts

| Source line | Existing declaration / binding |
|---|---|
| [5](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/copy.ts#L5) | `export function recoveryKind(kind:string,text:RecoveryCopy){const copy=kinds[kind];return copy?text(...copy):text('Record','তথ্য');}` |
| [34](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/copy.ts#L34) | `export function recoveryMessage(message:string,text:RecoveryCopy){const clean=message.replace(/^Error: /,'');return text(clean,restrictions[clean]??'এই কাজটি করা যায়নি। উৎস ও অনুমতি যাচাই করে আবার চেষ্টা করুন।');}` |
| [35](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/copy.ts#L35) | `export function recoveryRestriction(message:string / undefined,text:RecoveryCopy){return message?recoveryMessage(message,text):undefined;}` |
## src/recovery/display.ts

| Source line | Existing declaration / binding |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/display.ts#L2) | `export function recoveryDisplayDate(value:string){const stamp=Date.parse(value);if(!Number.isFinite(stamp))return value;const dhakaDay=new Date(stamp+6*3600000).toISOString().slice(0,10);return ʼ${formatDay(dhakaDay)} · ${new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dhaka'}).format(stamp)} · Dhakaʼ;}` |
## src/recovery/store.ts

| Source line | Existing declaration / binding |
|---|---|
| [2](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/store.ts#L2) | `function immutable<T>(value:T):T{if(value&&typeof value==='object'){Object.values(value).forEach(immutable);Object.freeze(value);}return value;}` |
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/store.ts#L3) | `export function createRecoveryStore(){` |
| [7](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/store.ts#L7) | `function permit(ctx:RecoveryContext,module?:string){if(!ctx.actorId /  / !ctx.tenantId /  / !ctx.view /  / module&&!ctx.modules.includes(module))throw Error('Recovery permission denied.');}` |
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/store.ts#L8) | `function adapter(kind:string,ctx:RecoveryContext){const a=adapters.get(kind);if(!a)throw Error('Source adapter unavailable.');permit(ctx,a.module);if(ctx.tenantId!==a.tenantId)throw Error('Source belongs to another business.');return a;}` |
| [9](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/store.ts#L9) | `function row(id:string,ctx:RecoveryContext){permit(ctx);const r=rows.find(r=>r.deletionId===id&&r.tenantId===ctx.tenantId);if(!r)throw Error('Recovery record unavailable for this business.');permit(ctx,r.module);return r;}` |
## src/recovery/useRecoveryContext.ts

| Source line | Existing declaration / binding |
|---|---|
| [3](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/useRecoveryContext.ts#L3) | `export function useRecoveryContext(){const {state,actorId}=useTenantSettings();return resolveRecoveryContext({state,actorId});}` |
## src/recovery/useRecoveryDelete.tsx

| Source line | Existing declaration / binding |
|---|---|
| [13](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/useRecoveryDelete.tsx#L13) | `export function useRecoveryDelete(){const {currentAuthority}=useTenantSettings();const ctx=useRecoveryContext(),{text}=useUiCopy();const [target,setTarget]=useState<Target / null>(null),[error,setError]=useState('');` |
| [14](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/useRecoveryDelete.tsx#L14) | `return {request:(next:Target)=>{setError('');setTarget(next);},dialog:<Dialog open={!!target} onOpenChange={v=>!v&&setTarget(null)}><DialogContent><DialogHeader><DialogTitle>{text('Move to Recycle Bin?','রিসাইকেল বিনে সরাবেন?')}</DialogTitle><DialogDescription>{target?.label} · {text('Recoverable for 30 days in this session. No financial or stock posting. Reloading resets preview stores.','এই সেশনে ৩০ দিন পর্যন্ত ফেরানো যাবে। খাতা বা মজুতে পোস্টিং হয় না। রিলোডে প্রিভিউ রিসেট হয়।')}</DialogDescription></DialogHeader>{error&&<p role="alert" className="text-sm text-danger">{error}</p>}<DialogFooter><Button variant="outline" onClick={()=>setTarget(null)}>{text('Cancel','বাতিল')}</Button><Button variant="destructive" onClick={()=>{if(!target)return;try{const deleted=recoveryStore.delete(target.kind,target.id,ctx,new Date().toISOString(),target.revision);target.onDeleted?.();setTarget(null);` |
## src/settings/DraftRecovery.tsx

| Source line | Existing declaration / binding |
|---|---|
| [1](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DraftRecovery.tsx#L1) | `import {useSyncExternalStore} from 'react';` |
| [8](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DraftRecovery.tsx#L8) | `export function DraftRecovery(){const ctx=useRecoveryContext(),{text}=useUiCopy();useSyncExternalStore(recoveryStore.subscribe,recoveryStore.snapshot);const count=ctx.view?recoveryStore.list(ctx).filter(r=>r.state==='deleted').length:0;return <SettingCard title={text('Recycle Bin','রিসাইকেল বিন')}><p className="text-xs text-helper">{text('Deleted records in this session:','এই সেশনে মুছে ফেলা তথ্য:')} {count}. {text('30-day preview recovery; resets on reload.','৩০ দিনের প্রিভিউ উদ্ধার; রিলোডে রিসেট হয়।')}</p><Link className="text-sm text-primary underline" to="/app/recycle-bin">{text('Open Recycle Bin','রিসাইকেল বিন খুলুন')}</Link></SettingCard>;}` |
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
