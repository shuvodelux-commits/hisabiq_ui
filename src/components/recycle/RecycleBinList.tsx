import {RecoveryDetails} from './RecoveryDetails';
import {recoveryDisplayDate} from '../../recovery/display';
import {recoveryKind,recoveryMessage} from '../../recovery/copy';
import {useTenantSettings} from '../../settings/TenantSettingsProvider';
import {MotionTabList,MotionTabIndicator} from '../../motion/MotionTabList';
import {useId,useState,useSyncExternalStore} from 'react';
import {Link} from 'react-router-dom';
import {Button} from '../Button';
import {Input} from '../Input';
import {AppSelect} from '../AppSelect';
import {Table,TableHeader,TableBody,TableRow,TableHead,TableCell} from '../Table';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from '../Dialog';
import {useUiCopy} from '../../i18n/useUiCopy';
import {recoveryStore,createRecoveryStore} from '../../recovery/store';
import {useRecoveryContext} from '../../recovery/useRecoveryContext';
import type {RecoveryRecord,RecoveryContext} from '../../recovery/model';
import '../../recovery/adapters';
const paths:Record<string,string>={sales:'/app/sales?tab=drafts',purchases:'/app/purchases/new',products:'/app/products',parties:'/app/parties'};
export function RecycleBinList({store=recoveryStore,context}:{store?:ReturnType<typeof createRecoveryStore>;context?:RecoveryContext}={}){
 const tabsId=useId();const {state}=useTenantSettings();const actorName=(id:string)=>state.sections.team.employees.find(e=>e.id===id)?.name??id;
 const actualContext=useRecoveryContext(),ctx=context??actualContext,{text}=useUiCopy();useSyncExternalStore(store.subscribe,store.snapshot);
 const [query,setQuery]=useState(''),[module,setModule]=useState('all'),[status,setStatus]=useState('deleted'),[selected,setSelected]=useState<string[]>([]),[detail,setDetail]=useState<RecoveryRecord|null>(null),[purge,setPurge]=useState<RecoveryRecord|null>(null),[confirmation,setConfirmation]=useState(''),[outcomes,setOutcomes]=useState<Record<string,string>>({});
 const [restoreResults,setRestoreResults]=useState<Array<{deletionId:string;label:string;error?:string}>>([]);
 if(!ctx.view)return <p role="alert">{text('You do not have permission to view recovery records.','মুছে ফেলা তথ্য দেখার অনুমতি নেই।')}</p>;
 const rows=store.list(ctx).filter(r=>(module==='all'||module==='online'?module==='all'||r.kind==='online-order':module==='quotations'?r.kind==='quotation':r.module===module&&(module!=='sales'||!['quotation','online-order'].includes(r.kind)))&&(status==='all'||(status==='expired'?r.state==='deleted'&&Date.now()>=Date.parse(r.expiresAt):r.state===status))&&(r.label+' '+r.kind+' '+r.deletedBy).toLowerCase().includes(query.toLowerCase()));
 const eligible=(r:RecoveryRecord)=>r.state==='deleted'&&Date.now()<Date.parse(r.expiresAt)&&ctx.restore;
 const change=(fn:()=>void)=>{setSelected([]);fn();};
 const restore=(ids:string[])=>{
  const labels=new Map(store.list(ctx).map(r=>[r.deletionId,r.label]));
  const results=store.bulkRestore(ids,ctx).map(r=>({...r,label:labels.get(r.deletionId)??r.deletionId,error:r.error?recoveryMessage(r.error,text):undefined}));
  setRestoreResults(results);
  setOutcomes(Object.fromEntries(results.map(r=>[r.deletionId,r.error??text('Restored with original identity.','আগের পরিচয়ে ফিরিয়ে আনা হয়েছে।')])));
  setSelected(results.filter(r=>r.error).map(r=>r.deletionId));
 };
 return <div className="space-y-4">
 <p className="text-xs text-helper">{text('Same-session preview · 30-day recovery. Reloading resets these stores. No stock, cash or ledger posting. Permanent delete removes only the preview payload and retains audit metadata.','বর্তমান সেশনের প্রিভিউ · ৩০ দিন পর্যন্ত উদ্ধার। রিলোডে তথ্য রিসেট হয়। মজুত, নগদ বা খাতায় কোনো পোস্টিং হয় না। স্থায়ী মুছলে অডিট পরিচয় থাকে।')}</p>
 {restoreResults.length>0&&<section role="status" aria-label={text('Restore results','ফিরিয়ে আনার ফলাফল')} className="space-y-2 rounded-xl border border-border bg-card p-4 text-sm">
  <h2 className="font-medium">{text('Restore results','ফিরিয়ে আনার ফলাফল')}</h2>
  <p>{text('Restored','ফেরানো')}: {restoreResults.filter(r=>!r.error).length} · {text('Not restored','ফেরানো যায়নি')}: {restoreResults.filter(r=>r.error).length}</p>
  <ul className="space-y-1">{restoreResults.map(r=><li key={r.deletionId}><strong className="font-medium">{r.label}</strong> · {r.error?`${text('Not restored','ফেরানো যায়নি')}: ${r.error}`:text('Restored with original identity.','আগের পরিচয়ে ফিরিয়ে আনা হয়েছে।')}</li>)}</ul>
 </section>}
 <MotionTabList aria-label={text('Recovery modules','উদ্ধারের বিভাগ')} className="flex flex-wrap gap-2 border-b border-border">
 {[["all",text('All modules','সব বিভাগ')],["sales",text('Sales','বিক্রয়')],["purchases",text('Purchases','ক্রয়')],["quotations",text('Quotations','মূল্য প্রস্তাব')],["online",text('Online','অনলাইন')],["products",text('Products','পণ্য')],["parties",text('Parties & Notes','পার্টি ও নোট')]].map(([id,label])=><Button key={id} id={`${tabsId}-tab-${id}`} aria-controls={`${tabsId}-panel`} role="tab" aria-selected={module===id} tabIndex={module===id?0:-1} className="relative" variant="ghost" onClick={()=>change(()=>setModule(id))} onKeyDown={e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const parent=e.currentTarget.parentElement;if(!parent)return;const tabs=Array.from(parent.querySelectorAll<HTMLButtonElement>('[role=tab]'));const index=tabs.indexOf(e.currentTarget);tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length].click();tabs[e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length].focus();}}>{label}<MotionTabIndicator active={module===id}/></Button>)}
 </MotionTabList>
 <div role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-tab-${module}`} tabIndex={0} className="space-y-4">
 <div className="flex flex-wrap gap-2">
 <div className="min-w-48 flex-1"><Input aria-label={text('Search deleted records','মুছে ফেলা তথ্য খুঁজুন')} placeholder={text('Search deleted records','মুছে ফেলা তথ্য খুঁজুন')} value={query} onChange={e=>change(()=>setQuery(e.target.value))}/></div>

 <AppSelect label={text('Status','অবস্থা')} value={status} onChange={v=>change(()=>setStatus(v))} options={[['deleted',text('Deleted','মুছে ফেলা')],['restored',text('Restored','ফিরিয়ে আনা')],['expired',text('Expired','মেয়াদ শেষ')],['purged',text('Permanently deleted','স্থায়ীভাবে মুছে ফেলা')],['all',text('All statuses','সব অবস্থা')]].map(([value,label])=>({value,label}))}/>
 <Button variant="outline" disabled={!selected.length} onClick={()=>restore(rows.filter(r=>selected.includes(r.deletionId)&&eligible(r)).map(r=>r.deletionId))}>{text('Restore selected','নির্বাচিত তথ্য ফেরান')} ({selected.length})</Button>
 </div>
 <div className="overflow-x-auto rounded-xl border border-border bg-card"><Table><TableHeader><TableRow><TableHead>{text('Select','নির্বাচন')}</TableHead><TableHead>{text('Record','তথ্য')}</TableHead><TableHead>{text('Deleted / expires','মুছে ফেলা / মেয়াদ')}</TableHead><TableHead>{text('Status','অবস্থা')}</TableHead><TableHead>{text('Actions','কাজ')}</TableHead></TableRow></TableHeader><TableBody>
 {rows.map(r=><TableRow key={r.deletionId}><TableCell><input type="checkbox" aria-label={`${text('Select','নির্বাচন')} ${r.label}`} checked={selected.includes(r.deletionId)} disabled={!eligible(r)} onChange={e=>setSelected(ids=>e.target.checked?[...ids,r.deletionId]:ids.filter(id=>id!==r.deletionId))}/></TableCell><TableCell>{r.label}<p data-table-helper>{recoveryKind(r.kind,text)} · {actorName(r.deletedBy)}</p></TableCell><TableCell>{recoveryDisplayDate(r.deletedAt)}<p data-table-helper>{recoveryDisplayDate(r.expiresAt)}</p></TableCell><TableCell>{r.state==='deleted'&&Date.now()>=Date.parse(r.expiresAt)?text('Expired','মেয়াদ শেষ'):r.state==='deleted'?text('Deleted','মুছে ফেলা'):r.state==='restored'?text('Restored','ফেরানো'):text('Purged','স্থায়ীভাবে মোছা')} {outcomes[r.deletionId]&&<p role="status" data-table-helper>{outcomes[r.deletionId]}</p>}</TableCell><TableCell><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>setDetail(r)}>{text('Details','বিস্তারিত')}</Button>{r.state==='restored'?<Link className="text-primary underline" to={r.kind==='quotation'?'/app/quotations':r.kind==='online-order'?'/app/online-sales':paths[r.module]}>{text('Open','খুলুন')}</Link>:<Button variant="outline" disabled={!eligible(r)} onClick={()=>restore([r.deletionId])}>{text('Restore','ফেরান')}</Button>}{ctx.owner&&ctx.purge&&r.state==='deleted'&&<Button variant="destructive" onClick={()=>{setPurge(r);setConfirmation('');}}>{text('Delete permanently','স্থায়ীভাবে মুছুন')}</Button>}</div></TableCell></TableRow>)}
 {!rows.length&&<TableRow><TableCell colSpan={5}>{text('No records match these filters.','এই ফিল্টারে কোনো তথ্য নেই।')}</TableCell></TableRow>}
 </TableBody></Table></div>
 </div>
 <Dialog open={!!detail} onOpenChange={v=>!v&&setDetail(null)}><DialogContent><DialogHeader><DialogTitle>{detail?.label}</DialogTitle><DialogDescription>{text('Recovery details · original source identity','উদ্ধারের বিবরণ · আগের পরিচয়')}</DialogDescription></DialogHeader>{detail&&<RecoveryDetails record={detail}/>}<DialogFooter><Button variant="outline" onClick={()=>setDetail(null)}>{text('Close','বন্ধ')}</Button></DialogFooter></DialogContent></Dialog>
 <Dialog open={!!purge} onOpenChange={v=>!v&&setPurge(null)}><DialogContent><DialogHeader><DialogTitle>{text('Delete permanently?','স্থায়ীভাবে মুছবেন?')}</DialogTitle><DialogDescription>{text('This preview payload cannot be restored. Type the displayed record name to confirm.','এই প্রিভিউ তথ্য আর ফেরানো যাবে না। নিশ্চিত করতে নিচের নাম লিখুন।')}</DialogDescription></DialogHeader><label className="text-sm">{purge?.label}<Input aria-label={text('Confirmation text','নিশ্চিতকরণের লেখা')} value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label>{purge&&outcomes[purge.deletionId]&&<p role="alert">{outcomes[purge.deletionId]}</p>}<DialogFooter><Button variant="outline" onClick={()=>setPurge(null)}>{text('Cancel','বাতিল')}</Button><Button variant="destructive" disabled={confirmation!==purge?.label} onClick={()=>{if(!purge)return;try{store.purge(purge.deletionId,ctx,confirmation);setPurge(null);}catch(e){setOutcomes({...outcomes,[purge.deletionId]:recoveryMessage(String(e),text)});}}}>{text('Delete permanently','স্থায়ীভাবে মুছুন')}</Button></DialogFooter></DialogContent></Dialog>
 </div>;
}
