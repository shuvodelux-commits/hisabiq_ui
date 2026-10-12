import {useMemo,useRef,useState,useSyncExternalStore,type Dispatch,type SetStateAction} from 'react';
import {CheckCircle2,Plus,Search,Trash2,AlertTriangle,ArrowRight} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '../Button';
import {Input} from '../Input';
import {AppSelect} from '../AppSelect';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '../Dialog';
import {getPartyPreviewSnapshot,subscribePartyPreview,dispatchPartyPreview} from '../../data/partyPreviewStore';
import {customerSettlementAsOf,supplierSettlementAsOf} from '../../utils/partySettlement';
import {businessToday} from '../../utils/dateRange';
import {counterOpenInvoices,counterAllocateOldest} from '../../utils/counterAllocation';
import {amountInWords} from '../../utils/amountInWords';
import {taka} from '../../utils/currency';
import type {FinanceAccount} from '../../data/financeAccounts';
import type {Party,PartyRole} from '../../types/erp';
import type {PartyMoneySplit,PartyPaymentPayload} from '../../types/partyLedger';

type Action='Customer Receive'|'Supplier Pay'|'Expense'|'Bank Transfer';
type Row={id:string;method:'Cash'|'Bank'|'Mobile Banking';accountId:string;amount:string};
const kinds:Action[]=['Customer Receive','Supplier Pay','Expense','Bank Transfer'];
const money=(n:number)=>Math.round(n*100)/100;
const validMoney=(s:string)=>/^\d+(?:\.\d{1,2})?$/.test(s.trim())&&Number(s)>0;
const names:Record<Action,string>={'Customer Receive':'Receive payment','Supplier Pay':'Pay supplier',Expense:'Record expense','Bank Transfer':'Transfer money'};
export function CounterWorkspace({accounts,setAccounts}:{
 accounts:FinanceAccount[];setAccounts:Dispatch<SetStateAction<FinanceAccount[]>>;
}){
 const state=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
 const [type,setType]=useState<Action>('Customer Receive');
 const [partyId,setPartyId]=useState('');
 const [search,setSearch]=useState('');
 const [searching,setSearching]=useState(false);
 const [allocation,setAllocation]=useState('');
 const [rows,setRows]=useState<Row[]>([]);
 const [amount,setAmount]=useState('');
 const [expenseCategory,setExpenseCategory]=useState('');
 const [from,setFrom]=useState('');
 const [to,setTo]=useState('');
 const [note,setNote]=useState('');
 const [review,setReview]=useState(false);
 const [error,setError]=useState('');
 const [submitted,setSubmitted]=useState(false);
 const busy=useRef(false);
 const [reviewRevision,setReviewRevision]=useState(0);
 const cashAccount=accounts.find(a=>a.status==='Active'&&(a.type==='Cash'||a.type==='Petty Cash'));
 const effectiveRows=rows.length?rows:[{id:'default',method:'Cash' as const,accountId:cashAccount?.id??'',amount:''}];
 const payerRole:PartyRole=type==='Customer Receive'?'Customer':'Supplier';
 const parties=state.parties.filter(p=>p.roles.includes(payerRole)&&p.status!=='Inactive');
 const selected=parties.find(p=>p.id===partyId);
 const filtered=parties.filter(p=>[p.name,p.nameBn,p.phone,p.area].some(x=>(x??'').toLowerCase().includes(search.toLowerCase()))).slice(0,7);
 const date=businessToday();
 const settlement=selected&&(type==='Customer Receive'||type==='Supplier Pay')
  ?type==='Customer Receive'?customerSettlementAsOf(state.sources,selected.id,date)
   :supplierSettlementAsOf(state.sources,selected.id,date):null;
 const openInvoices=useMemo(()=>selected&&type==='Customer Receive'
  ?counterOpenInvoices(state.sources,selected.id,date):[],[state,selected?.id,type,date]);
 const chosen=openInvoices.find(i=>i.id===allocation);
 const maxDue=chosen?Math.min(chosen.due,settlement?.invoiceDue??0):settlement?.invoiceDue??0;
 const total=type==='Bank Transfer'?Number(amount)||0:money(effectiveRows.reduce((n,r)=>n+(Number(r.amount)||0),0));
 const predicted=settlement?money(settlement.netBalance+(type==='Customer Receive'?-total:total)):0;
 const methods:Row['method'][]=['Cash','Bank','Mobile Banking'];
 const accountOptions=(method:Row['method'])=>accounts.filter(a=>a.status==='Active'&&(
  method==='Cash'?(a.type==='Cash'||a.type==='Petty Cash'):a.type===method));
 const splits:PartyMoneySplit[]=effectiveRows.map(r=>({id:r.id,method:r.method,accountId:r.accountId,amount:Number(r.amount)}));
 const olderAllocation=counterAllocateOldest(openInvoices,total);
 const previewAllocation=chosen?[{invoice:chosen.reference,amount:Math.min(chosen.due,total)}]:olderAllocation;
 const reset=()=>{
  setPartyId('');setSearch('');setSearching(false);setAllocation('');
  setRows([]);setAmount('');setNote('');setError('');setReview(false);setSubmitted(false);
 };
 const changeType=(next:Action)=>{setType(next);reset();};
 const selectParty=(p:Party)=>{setPartyId(p.id);setSearch(p.name);setSearching(false);setAllocation('');setError('');setReview(false);setSubmitted(false);};
 const editRows=(next:Row[])=>{setRows(next);setReview(false);setError('');setSubmitted(false);};
 const addRow=()=>{
  const next:Row={id:'counter-'+Date.now()+'-'+effectiveRows.length,method:'Cash',accountId:cashAccount?.id??'',amount:''};
  editRows([...effectiveRows,next]);
 };
 const fillDue=()=>{const next=money(maxDue);if(next<=0)return;
  editRows(effectiveRows.map((r,i)=>({...r,amount:i===0?String(next):''})));
 };
 const validate=()=>{
  if(!Number.isFinite(total)||total<=0||Math.round(total*100)!==total*100) return 'Enter a valid payment amount (up to two decimal places).';
  if(type==='Bank Transfer'){
   if(!from||!to||from===to)return 'Choose two different active money accounts.';
   if(!accounts.find(a=>a.id===from&&a.status==='Active')||!accounts.find(a=>a.id===to&&a.status==='Active'))return 'Account is no longer active.';
   return '';
  }
  if(type==='Expense'&&!expenseCategory.trim())return 'Select an expense category.';
  if(type!=='Expense'&&!selected)return 'Select a customer or supplier.';
  if(splits.some(s=>!validMoney(String(s.amount))))return 'Each payment source needs a positive amount (up to two decimals).';
  if(new Set(splits.map(s=>s.id)).size!==splits.length)return 'Duplicate payment source row.';
  if(splits.some(s=>!accountOptions(s.method).some(a=>a.id===s.accountId)))return 'Choose a valid active account for every payment.';
  if(type==='Customer Receive'||type==='Supplier Pay'){
   if(total>money(maxDue)+0.001)return chosen?'Payment exceeds the selected invoice outstanding balance.':'Payment exceeds the outstanding due. Record an advance separately.';
  }
  return '';
 };
 const beginReview=()=>{const message=validate();if(message){setError(message);return;}setError('');setReviewRevision(state.revision);setReview(true);};
 const confirm=()=>{
  if(busy.current)return;
  if(reviewRevision!==getPartyPreviewSnapshot().revision){setReview(false);setError('Party ledger changed. Please review the latest balance.');return;}
  const message=validate();if(message){setReview(false);setError(message);return;}
  busy.current=true;
  try{
   if((type==='Customer Receive'||type==='Supplier Pay')&&selected){
    const payload:PartyPaymentPayload={partyId:selected.id,relationship:type==='Customer Receive'?'Customer':'Supplier',
     date,amount:total,invoiceId:chosen?.reference,reason:note,splits,operationId:'counter-'+Date.now()};
    dispatchPartyPreview({type:'record-payment',payload});
   }
   setAccounts(current=>current.map(account=>{
    const adjustment=type==='Bank Transfer'
     ?(account.id===from?-total:account.id===to?total:0)
     :splits.filter(s=>s.accountId===account.id).reduce((v,s)=>v+(type==='Customer Receive'?s.amount:-s.amount),0);
    return adjustment?{...account,balance:money(account.balance+adjustment),lastActivity:'Just now'}:account;
   }));
   setReview(false);setSubmitted(true);setError('');
   toast.success(names[type]+' recorded in preview',{description:taka(total)+(selected?' · '+selected.name:'')});
   setRows([]);setAmount('');setNote('');setAllocation('');
  }catch(e){setError(e instanceof Error?e.message:'Could not record this transaction.');setReview(false);}
  finally{busy.current=false;}
 };
 const highlight=(value:number)=>value===0?'text-ink':payerRole==='Supplier'?(value<0?'text-danger':'text-success'):(value>0?'text-danger':'text-success');
 return <section className="space-y-4 p-3 sm:p-4">
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" role="group" aria-label="Counter transaction type">
   {kinds.map(item=><button type="button" key={item} aria-pressed={type===item} onClick={()=>changeType(item)}
    className={'min-h-14 rounded-xl border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring '+
     (type===item?'border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground':'border-border bg-card text-ink hover:bg-ink-50')}>
    <span className="block text-[13px] font-semibold">{item}</span>
    <span className="text-[11px] text-ink-500">{item==='Customer Receive'?'Customer money':item==='Supplier Pay'?'Supplier payment':item==='Expense'?'Quick expense':'Between accounts'}</span>
   </button>)}
  </div>
  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
   <div className="min-w-0 space-y-4">
    {(type==='Customer Receive'||type==='Supplier Pay')&&<div className="rounded-xl border border-border bg-card p-4">
     <label className="mb-1.5 block text-sm font-semibold text-ink">{type==='Customer Receive'?'Find customer':'Find supplier'}</label>
     <div className="relative">
      <Search aria-hidden="true" className="absolute left-3 top-2.5 size-4 text-ink-400"/>
      <Input className="pl-9" aria-label={type==='Customer Receive'?'Search customer':'Search supplier'} value={search}
       placeholder="Search name, phone or area" onFocus={()=>setSearching(true)}
       onChange={e=>{setSearch(e.target.value);setPartyId('');setAllocation('');setSearching(true);setReview(false);}}
       onKeyDown={e=>{if(e.key==='Escape')setSearching(false);if(e.key==='Enter'&&filtered[0]){e.preventDefault();selectParty(filtered[0]);}}}/>
     </div>
     {searching&&<div role="listbox" aria-label="Matching parties" className="mt-1 max-h-52 overflow-auto rounded-lg border border-border bg-popover p-1 shadow-card">
      {filtered.length?filtered.map(p=><button type="button" key={p.id} role="option" aria-selected={p.id===partyId}
       onMouseDown={e=>e.preventDefault()} onClick={()=>selectParty(p)}
       className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left hover:bg-sidebar-accent focus-visible:bg-sidebar-accent">
       <span className="min-w-0"><span className="block truncate text-sm font-medium">{p.name}</span><span className="block text-xs text-ink-500">{p.phone} · {p.area}</span></span>
       <ArrowRight className="size-4 shrink-0 text-ink-400"/>
      </button>):<p className="p-3 text-xs text-ink-500">No matching parties</p>}
     </div>}
     {selected&&settlement&&<div className="mt-3 rounded-lg border border-border bg-ink-50/60 p-3" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-3">
       <div><p className="text-[11px] text-ink-500">Selected {payerRole.toLowerCase()}</p><p className="font-semibold">{selected.name}</p>
        <p className="text-xs text-ink-500">{selected.phone}</p></div>
       <div className="text-right"><p className="text-xs text-ink-500">Current balance</p>
        <p className={'text-xl font-semibold '+highlight(settlement.netBalance)}>{taka(Math.abs(settlement.netBalance))}</p>
        <p className="text-xs text-ink-500">{settlement.netBalance>0?(payerRole==='Customer'?'Customer owes us':'Advance with supplier'):settlement.netBalance<0?(payerRole==='Customer'?'Customer has credit':'We owe supplier'):'Settled'}</p>
       </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 border-t border-border pt-2 text-xs">
       <span>Outstanding due <strong>{taka(settlement.invoiceDue)}</strong></span>
       {settlement.availableCredit>0&&<span>Available credit <strong className="text-success">{taka(settlement.availableCredit)}</strong></span>}
      </div>
     </div>}
    </div>}
    {type==='Customer Receive'&&selected&&settlement&&<div className="rounded-xl border border-border bg-card p-4">
     <label className="mb-2 block text-sm font-semibold">Apply payment to</label>
     <AppSelect label="Invoice allocation" value={allocation} onChange={v=>{setAllocation(v);setReview(false);setError('');}}
      options={[{value:'',label:'Oldest outstanding due first'},...openInvoices.filter(r=>!r.opening).map(r=>({value:r.id,label:r.reference+' · '+taka(r.due)}))]}/>
     <p className="mt-2 text-xs text-ink-500">{chosen
      ?'Only '+chosen.reference+' will be paid. Available invoice due '+taka(chosen.due)+'.'
      :'Oldest unpaid invoices and opening balance are settled first.'}</p>
     {!!previewAllocation.length&&<div className="mt-3 space-y-1 border-t border-border pt-2 text-xs">
      <p className="font-semibold text-ink">Payment allocation preview</p>
      {previewAllocation.map((row,i)=><div key={row.invoice+i} className="flex justify-between gap-3"><span>{row.invoice}</span><strong>{taka(row.amount)}</strong></div>)}
     </div>}
    </div>}
    {type==='Expense'&&<label className="block rounded-xl border border-border bg-card p-4 text-sm font-semibold">Expense category
      <Input className="mt-2" value={expenseCategory} onChange={e=>setExpenseCategory(e.target.value)} placeholder="e.g. Transport"/>
    </label>}
    {type==='Bank Transfer'&&<div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
     <label className="text-sm font-semibold">From account
      <AppSelect className="mt-2" label="From account" value={from} onChange={v=>{setFrom(v);setReview(false);}}
       options={accounts.filter(a=>a.status==='Active').map(a=>({value:a.id,label:a.name+' · '+taka(a.balance)}))}/>
     </label>
     <label className="text-sm font-semibold">To account
      <AppSelect className="mt-2" label="To account" value={to} onChange={v=>{setTo(v);setReview(false);}}
       options={accounts.filter(a=>a.status==='Active').map(a=>({value:a.id,label:a.name}))}/>
     </label>
     <label className="text-sm font-semibold sm:col-span-2">Transfer amount
      <Input className="mt-2 text-right" aria-label="Transfer amount" inputMode="decimal" value={amount} onChange={e=>{setAmount(e.target.value);setReview(false);}} placeholder="0.00"/>
     </label>
    </div>}
    {type!=='Bank Transfer'&&<div className="rounded-xl border border-border bg-card">
     <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
      <div><h3 className="text-sm font-semibold">Payment sources</h3><p className="text-xs text-ink-500">Add cash, bank and mobile banking payments. Total updates automatically.</p></div>
      <div className="flex gap-2">
       {(type==='Customer Receive'||type==='Supplier Pay')&&maxDue>0&&<Button variant="outline" size="sm" onClick={fillDue}>Full due</Button>}
       <Button variant="outline" size="sm" onClick={addRow}><Plus className="size-4"/> Add payment</Button>
      </div>
     </div>
     <div className="space-y-2 p-3 sm:p-4">
      {effectiveRows.map(row=>{
       const available=accountOptions(row.method);
       return <div key={row.id} className="grid grid-cols-[1fr_1fr_34px] gap-2 sm:grid-cols-[130px_1fr_140px_34px]">
        <AppSelect label="Payment method" value={row.method} onChange={method=>editRows(effectiveRows.map(x=>x.id===row.id?{...x,method:method as Row['method'],accountId:accountOptions(method as Row['method'])[0]?.id??''}:x))} options={methods}/>
        <AppSelect label="Payment account" value={row.accountId} onChange={accountId=>editRows(effectiveRows.map(x=>x.id===row.id?{...x,accountId}:x))}
         options={available.map(x=>({value:x.id,label:x.name}))}/>
        <Input className="col-span-2 text-right sm:col-span-1" aria-label="Payment source amount" inputMode="decimal"
         value={row.amount} onChange={e=>editRows(effectiveRows.map(x=>x.id===row.id?{...x,amount:e.target.value}:x))} placeholder="0.00"/>
        <button type="button" aria-label="Remove payment" disabled={effectiveRows.length===1} onClick={()=>editRows(effectiveRows.filter(x=>x.id!==row.id))}
         className="row-start-1 col-start-3 flex size-9 items-center justify-center text-ink-500 hover:text-danger disabled:opacity-30 sm:row-auto sm:col-auto"><Trash2 className="size-4"/></button>
       </div>;
      })}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3"><span className="text-sm text-ink-500">Automatically calculated total</span>
       <strong className="text-xl text-ink" aria-live="polite">{taka(total)}</strong></div>
     </div>
    </div>}
    <label className="block rounded-xl border border-border bg-card p-4 text-sm font-semibold">Reference / note (optional)
     <Input className="mt-2" value={note} onChange={e=>{setNote(e.target.value);setReview(false);}} placeholder="Transaction details"/>
    </label>
   </div>
   <aside className="h-fit rounded-xl border border-border bg-card p-4 xl:sticky xl:top-4">
    <h3 className="mb-3 text-sm font-semibold">Transaction summary</h3>
    <p className="text-xs text-ink-500">Total amount</p><p className="text-2xl font-semibold text-ink" aria-live="polite">{taka(total)}</p>
    <p className="mt-1 text-xs leading-5 text-ink-500" aria-live="polite">{amountInWords(total)}</p>
    {settlement&&<div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
     <div className="flex justify-between gap-2"><span>Before payment</span><strong>{taka(settlement.netBalance)}</strong></div>
     <div className="flex justify-between gap-2"><span>{type==='Customer Receive'?'Receive':'Pay'}</span><strong>{taka(total)}</strong></div>
     <div className="flex justify-between gap-2 border-t border-border pt-2"><span>Balance after</span><strong className={highlight(predicted)}>{taka(predicted)}</strong></div>
    </div>}
    {submitted&&<div role="status" className="mt-3 rounded-lg border border-success/20 bg-success/5 p-3 text-xs text-success"><CheckCircle2 className="mb-1 size-4"/> Recorded in preview. Ledger balance is updated.</div>}
    {error&&<p role="alert" className="mt-3 rounded-lg border border-danger/30 bg-danger-bg p-3 text-xs text-danger">{error}</p>}
    <Button className="mt-4 w-full" onClick={beginReview} disabled={total<=0}>{'Review '+names[type].toLowerCase()}</Button>
   </aside>
  </div>
  <Dialog open={review} onOpenChange={setReview}>
   <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
    <DialogHeader><DialogTitle>Confirm {names[type].toLowerCase()}</DialogTitle>
     <DialogDescription>Check the party, amount, payment accounts and updated balance before recording.</DialogDescription></DialogHeader>
    <div className="space-y-3 text-sm">
     <div className="rounded-xl border border-border bg-ink-50 p-4">
      <p className="text-xs text-ink-500">Total transaction amount</p>
      <p className="text-2xl font-semibold">{taka(total)}</p>
      <p className="mt-1 text-xs text-ink-500">{amountInWords(total)}</p>
     </div>
     {selected&&<p><strong>{payerRole}: </strong>{selected.name} · {selected.phone}</p>}
     {chosen&&<p><strong>Invoice:</strong> {chosen.reference} · outstanding {taka(chosen.due)}</p>}
     {!chosen&&type==='Customer Receive'&&<p><strong>Allocation:</strong> Oldest outstanding first</p>}
     {type==='Bank Transfer'?<p>{accounts.find(a=>a.id===from)?.name} → {accounts.find(a=>a.id===to)?.name}</p>
      :<div className="space-y-1">{splits.map((s,i)=><p key={s.id}>{i+1}. {s.method} · {accounts.find(a=>a.id===s.accountId)?.name} <strong>{taka(s.amount)}</strong></p>)}</div>}
     {settlement&&<div className="rounded-lg border border-border p-3">
      <div className="flex justify-between"><span>Current balance</span><strong>{taka(settlement.netBalance)}</strong></div>
      <div className="mt-2 flex justify-between border-t border-border pt-2"><span>After payment</span><strong className={highlight(predicted)}>{taka(predicted)}</strong></div>
     </div>}
     {note&&<p className="text-xs text-ink-500">Note: {note}</p>}
     <p className="flex items-start gap-2 text-xs text-ink-500"><AlertTriangle className="size-4 shrink-0 text-warning"/> This records an in-browser ERP preview, not a bank transfer or backend posting.</p>
     <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={()=>setReview(false)}>Edit details</Button>
      <Button onClick={confirm} disabled={busy.current}><CheckCircle2 className="size-4"/> Confirm & record</Button></div>
    </div>
   </DialogContent>
  </Dialog>
 </section>;
}
