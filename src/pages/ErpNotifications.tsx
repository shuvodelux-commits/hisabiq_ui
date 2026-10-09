import React,{useMemo,useState,useSyncExternalStore} from 'react';
import {Link} from 'react-router-dom';
import {toast} from 'sonner';
import {Bell,Search,MessageSquareText,ShieldCheck,Settings2} from 'lucide-react';
import {PageHeader} from '../components/PageHeader';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {AppSelect} from '../components/AppSelect';
import {notificationEvents,groups,smsTokens,subscribeNotificationRules,getNotificationSnapshot,
 updateNotificationRule,renderNotificationPreview,notificationEligibility,
 type ErpNotificationEvent,type NotificationGroup,type SmsLanguage,type TriggerMode
} from '../notifications/erpNotificationRules';

const example={business:'HisabIQ Demo',number:'SRV-00102',total:'2500',paid:'1000',due:'1500',
 party:'Rahman',customer:'Rahman',item:'Panjabi',amount:'1500',balance:'1500',courier:'Steadfast',
 tracking:'DEMO-8761',due_date:'2026-10-20',ready_date:'2026-10-11',date:'2026-10-09',status:'Ready'};
const recipients=['Customer','Service customer','Supplier','Borrower','Lender','Owner / staff','Related party'];

export function ErpNotificationsWorkbench({embedded=false}:{embedded?:boolean}){
 const {rules}=useSyncExternalStore(subscribeNotificationRules,getNotificationSnapshot);
 const [group,setGroup]=useState<NotificationGroup|'All'>('All');
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState<ErpNotificationEvent>('service_ready');
 const [phone,setPhone]=useState('01711482093'),[consent,setConsent]=useState(false);
 const [draft,setDraft]=useState<string|null>(null);
 const [error,setError]=useState('');
 const selectedDef=notificationEvents.find(e=>e.id===selected)!;
 const rule=rules[selected];
 const events=useMemo(()=>notificationEvents.filter(ev=>
  (group==='All'||ev.group===group)&&[ev.label,ev.bn,ev.source].some(s=>s.toLowerCase().includes(query.toLowerCase().trim()))),
  [group,query]);
 const choose=(id:ErpNotificationEvent)=>{setSelected(id);setDraft(null);setError('');};
 const patch=(patch:Parameters<typeof updateNotificationRule>[1])=>{
  try{updateNotificationRule(selected,patch);setError('');}catch(e){setError(e instanceof Error?e.message:'Invalid rule');}
 };
 const eligibility=notificationEligibility(selected,{phone,consent,gatewayConnected:false});
 const saveTemplate=()=>{try{updateNotificationRule(selected,{template:draft??rule.template});setDraft(null);setError('');toast.success('SMS template saved in UI preview');}
  catch(e){setError(e instanceof Error?e.message:'Invalid SMS template.');}};
 return <div className="space-y-4">
  {!embedded&&<PageHeader title="ERP Notifications" titleBn="এসএমএস ও নোটিফিকেশন"
    description="One event-based notification system for customers, tailoring, suppliers, borrowers, lenders and the rest of HisabIQ."/>}
  <p className="rounded-lg border border-warning/30 bg-warning-bg px-4 py-3 text-xs text-warning">
   SMS gateway disconnected: settings and messages are <strong>preview only — no SMS will be sent or billed</strong>.
   All event switches default OFF. Enabling a rule does not send a message, schedule a reminder or alter SMS credits.
  </p>
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
   {[
    ['Event types',String(notificationEvents.length)],
    ['Enabled rules',String(notificationEvents.filter(e=>rules[e.id].enabled).length)],
    ['Configured groups',String(groups.length)],
    ['SMS transmitted','0 — preview only']
   ].map(([label,value])=><div key={label} className="rounded-lg border border-border bg-card p-3">
    <p className="text-[11px] text-ink-500">{label}</p><p className="mt-1 text-base font-semibold text-ink">{value}</p></div>)}
  </div>
  <div className="grid gap-4 lg:grid-cols-[minmax(300px,1fr)_minmax(300px,1fr)]">
   <section className="rounded-xl border border-border bg-card">
    <div className="space-y-2 border-b border-border p-3">
     <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[170px] flex-1"><Input aria-label="Search ERP notification events" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search notifications or modules"/></div>
      <AppSelect label="Filter notification group" value={group} options={['All',...groups]} className="min-w-44" onChange={v=>setGroup(v as NotificationGroup|'All')}/>
     </div>
     <p className="text-xs text-ink-500">SMS events are grouped by ERP workflow; select one to change its settings.</p>
    </div>
    <div className="max-h-[560px] space-y-1 overflow-y-auto p-2">
     {events.map(ev=><div key={ev.id} className={'flex items-center gap-2 rounded-lg border p-2.5 '+(selected===ev.id?'border-teal-400 bg-teal-50/30 dark:bg-teal-900/10':'border-border')}>
      <button type="button" className="min-w-0 flex-1 text-left" onClick={()=>choose(ev.id)}>
       <strong className="block text-xs text-ink">{ev.label}</strong>
       <p className="font-bn text-[11px] text-ink-500">{ev.bn}</p>
       <p className="text-[10px] text-ink-400">{ev.source} · {ev.audience}</p>
      </button>
      <label className="flex shrink-0 items-center gap-1 text-xs text-ink-500">
       <input type="checkbox" aria-label={'Enable SMS '+ev.id} checked={rules[ev.id].enabled}
        onChange={e=>{try{updateNotificationRule(ev.id,{enabled:e.target.checked});choose(ev.id);}catch{}}}/>
       {rules[ev.id].enabled?'On':'Off'}
      </label>
     </div>)}
     {!events.length&&<p className="p-5 text-center text-sm text-ink-500">No events match this filter.</p>}
    </div>
   </section>
   <section className="h-fit space-y-3 rounded-xl border border-border bg-card p-4">
    <div><h3 className="text-sm font-semibold text-ink">{selectedDef.label}</h3>
     <p className="font-bn text-xs text-ink-500">{selectedDef.bn}</p>
     <p className="mt-1 text-xs text-ink-500">Source: {selectedDef.source} · Default audience: {selectedDef.audience}</p></div>
    <div className="grid grid-cols-2 gap-2">
     <label className="space-y-1 text-xs text-ink-500">SMS language
      <AppSelect label="SMS language" value={rule.language} options={['English','Bangla']} onChange={v=>{patch({language:v as SmsLanguage});setDraft(null);}}/>
     </label>
     <label className="space-y-1 text-xs text-ink-500">When to notify
      <AppSelect label="Notification trigger" value={rule.triggerMode} options={['Manual','On event']}
       onChange={v=>patch({triggerMode:v as TriggerMode})}/>
     </label>
     <label className="space-y-1 text-xs text-ink-500">Recipient role
      <AppSelect label="Notification recipient" value={rule.recipient} options={recipients} onChange={v=>patch({recipient:v})}/>
     </label>
     <label className="space-y-1 text-xs text-ink-500">Reminder lead time (days)
      <Input aria-label="Reminder days" type="number" min="0" max="365" value={rule.reminderDays} onChange={e=>patch({reminderDays:Number(e.target.value)})}/>
     </label>
    </div>
    <div className="flex flex-wrap items-center gap-4">
     <label className="flex items-center gap-2 text-xs text-ink">
      <input type="checkbox" aria-label="Respect quiet hours" checked={rule.quietHours} onChange={e=>patch({quietHours:e.target.checked})}/>Respect quiet hours
     </label>
     <span className="text-[11px] text-ink-500">Customer consent required (always)</span>
    </div>
    <label className="block space-y-1 text-xs font-medium text-ink">SMS template · বার্তার নমুনা
     <textarea aria-label="SMS template" rows={4} maxLength={320} value={draft??rule.template}
      onChange={e=>setDraft(e.target.value)} className="w-full resize-y rounded-md border border-input bg-card p-2 text-sm text-ink"/>
    </label>
    <div className="flex items-center justify-between gap-2">
     <span className="text-[11px] text-ink-500">{(draft??rule.template).length} / 320 characters</span>
     <Button size="sm" variant="outline" disabled={draft===null} onClick={saveTemplate}>Save template</Button>
    </div>
    <p className="text-[11px] text-ink-500">Available placeholders: {smsTokens.join(' ')}</p>
    {error&&<p role="alert" className="rounded-md bg-danger-bg p-2 text-xs text-danger">{error}</p>}
    <div className="space-y-2 rounded-lg bg-ink-50 p-3">
     <p className="text-xs font-medium text-ink">Message preview — উদাহরণ</p>
     <p className="text-sm text-ink" data-testid="erp-sms-preview">{renderNotificationPreview(selected,{...example,item:rule.language==='Bangla'?'পাঞ্জাবি':'Panjabi'})}</p>
     <p className="text-[11px] text-ink-500">Example item: Panjabi (পাঞ্জাবি). Replace placeholders with actual record fields when backend events exist.</p>
    </div>
    <div className="grid gap-2 sm:grid-cols-2">
     <label className="space-y-1 text-xs text-ink-500">Recipient phone preview
      <Input aria-label="SMS preview phone" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="017XXXXXXXX"/></label>
     <label className="flex items-center gap-2 pt-4 text-xs text-ink"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> Consent recorded</label>
    </div>
    <p className="text-xs text-warning">{eligibility.reasons.join(' · ')||'Policy eligible, but demo never sends.'}</p>
    <Button size="sm" variant="outline" onClick={()=>toast('Preview only. No SMS was sent.')}>Preview only — never send</Button>
    {!embedded&&<p className="border-t border-border pt-2 text-xs text-ink-500">
     Configuration applies ERP-wide, not just online orders. Future server integration will connect event triggers, gateway, credits, delivery reports and opt-outs.
     <Link className="ml-1 text-teal-700 hover:underline dark:text-teal-400" to="/app/subscription">See SMS credits</Link>.
    </p>}
   </section>
  </div>
 </div>;
}
export function ErpNotifications(){return <div className="mx-auto max-w-[1440px]"><ErpNotificationsWorkbench/></div>;}
