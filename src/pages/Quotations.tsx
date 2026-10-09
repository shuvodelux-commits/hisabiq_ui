import React,{useMemo,useState,useSyncExternalStore} from 'react';
import {useNavigate} from 'react-router-dom';
import {Copy,FileText,Plus,Printer,Search,Trash2,ArrowUp,ArrowDown,Pencil,Check,Send, X} from 'lucide-react';
import {toast} from 'sonner';
import {PageHeader} from '../components/PageHeader';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {AppSelect} from '../components/AppSelect';
import {AppDateRangePicker} from '../components/AppDateRangePicker';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle,DialogFooter} from '../components/Dialog';
import {StatusBadge} from '../components/StatusBadge';
import {Table,TableHeader,TableHead,TableBody,TableRow,TableCell} from '../components/Table';
import {availableProducts,availableParties,createPreviewProduct} from '../data/erpDemoStore';
import {TransactionCartEditor} from '../components/transactions/TransactionCartEditor';
import {AddProductDialog} from '../components/products/AddProductDialog';
import type {Product} from '../types/erp';
import {businessToday,addDays} from '../utils/dateRange';
import {taka} from '../utils/currency';
import {getQuoteSnapshot,subscribeQuotes,saveQuote,duplicateQuote,changeQuoteStatus,deleteDraftQuote,
 quoteSubtotal,quoteTotal,quoteLineTotal,quoteDisplayStatus,type Quotation,type QuoteDraft,type QuoteLine,type QuoteStatus
} from '../quotations/quotePreviewStore';

const statusTone={Draft:'neutral',Sent:'info',Accepted:'success',Declined:'danger',Expired:'warning'} as const;
const freshDraft=():QuoteDraft=>({date:businessToday(),validUntil:addDays(businessToday(),7),
 customerName:'',customerPhone:'',note:'',status:'Draft',discount:0,lines:[]});
const copyDraft=(q:Quotation):QuoteDraft=>({
 date:q.date,validUntil:q.validUntil,partyId:q.partyId,customerName:q.customerName,
 customerPhone:q.customerPhone,lines:q.lines.map(l=>({...l})),note:q.note,discount:q.discount,status:q.status
});
let lineCounter=0;
function QuotationEditor({open,original,onClose}:{
 open:boolean;original:Quotation|null;onClose:()=>void;
}){
 const [draft,setDraft]=useState<QuoteDraft>(()=>original?copyDraft(original):freshDraft());
 const [error,setError]=useState('');
 const [creatingProduct,setCreatingProduct]=useState(false);
 const products=availableProducts().filter(p=>p.active);
 const customers=availableParties().filter(p=>p.roles.includes('Customer')&&p.status!=='Inactive');
 const patch=(partial:Partial<QuoteDraft>)=>setDraft(prev=>({...prev,...partial}));
 const patchLine=(id:string,partial:Partial<QuoteLine>)=>
  patch({lines:draft.lines.map(line=>line.id===id?{...line,...partial}:line)});
 const addProduct=(p:Product)=>{
  const unit=p.stockViewUnit===p.altUnit?.unit?p.altUnit!.unit:p.unit;
  const price=unit===p.altUnit?.unit?(p.altUnit.price??p.sellPrice*p.altUnit.factor):p.sellPrice;
  patch({lines:[...draft.lines,{id:'quote-line-'+(++lineCounter),productId:p.id,name:p.name,quantity:1,unit,price,unitFactor:p.altUnit&&unit===p.altUnit.unit?p.altUnit.factor:1,secondaryQuantity:0}]});
 };
 const changeUnit=(line:QuoteLine,unit:string)=>{
  const p=products.find(product=>product.id===line.productId);if(!p)return;
  patchLine(line.id,{unit,price:unit===p.altUnit?.unit?(p.altUnit.price??p.sellPrice*p.altUnit.factor):p.sellPrice});
 };
 const reorder=(id:string,delta:number)=>{
  const index=draft.lines.findIndex(line=>line.id===id),next=index+delta;
  if(index<0||next<0||next>=draft.lines.length)return;
  const reordered=[...draft.lines];
  [reordered[index],reordered[next]]=[reordered[next],reordered[index]];
  patch({lines:reordered});
 };
 const save=()=>{
  setError('');
  try{
   const saved=saveQuote(draft,original?.id);
   toast.success(original?'Quotation revised':'Quotation created',{description:saved.number+' · UI preview only'});
   onClose();
  }catch(e){setError(e instanceof Error?e.message:'Cannot save quotation.');}
 };
 return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>
  <DialogContent role="dialog" aria-label={original?'Edit quotation':'New quotation'} className="max-h-[94vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-4xl">
   <DialogHeader>
    <DialogTitle>{original?'Revise quotation':'New quotation'} <span className="font-bn text-sm font-normal text-ink-500">· মূল্য প্রস্তাব</span></DialogTitle>
    <DialogDescription>Prices only: quotations do not reserve stock, collect money or post to the Party ledger.</DialogDescription>
   </DialogHeader>
   <div className="grid gap-3 sm:grid-cols-2">
    <label className="space-y-1 text-xs font-medium text-ink">Customer · <span className="font-bn text-ink-400">ক্রেতা</span>
     <AppSelect label="Choose quotation customer" value={draft.partyId??''}
       options={[{value:'',label:'Walk-in / enter name'},...customers.map(p=>({value:p.id,label:p.name+(p.phone?' · '+p.phone:'')}))]}
       onChange={id=>{const p=customers.find(x=>x.id===id);patch({partyId:p?.id,customerName:p?.name??'',customerPhone:p?.phone??''});}}/>
    </label>
    <label className="space-y-1 text-xs font-medium text-ink">Customer name
     <Input aria-label="Quotation customer name" value={draft.customerName}
       onChange={e=>patch({customerName:e.target.value,partyId:undefined})} placeholder="Customer or business name"/>
    </label>
    <label className="space-y-1 text-xs font-medium text-ink">Phone · <span className="font-bn text-ink-400">ফোন</span>
     <Input aria-label="Quotation customer phone" value={draft.customerPhone??''} onChange={e=>patch({customerPhone:e.target.value})} placeholder="Optional"/>
    </label>
    <div className="grid grid-cols-2 gap-2">
     <label className="space-y-1 text-xs font-medium text-ink">Issue date
      <AppDateRangePicker single label="Quotation issue date" value={{from:draft.date,to:draft.date}}
       onChange={next=>patch({date:next.from})}/>
     </label>
     <label className="space-y-1 text-xs font-medium text-ink">Valid until
      <AppDateRangePicker single label="Quotation expiry date" value={{from:draft.validUntil,to:draft.validUntil}}
       onChange={next=>patch({validUntil:next.from})}/>
     </label>
    </div>
   </div>
   <section className="space-y-2">
    <div className="flex items-center justify-between gap-2">
     <h3 className="text-sm font-semibold text-ink">Items <span className="font-bn text-xs font-normal text-ink-400">· পণ্যের তালিকা</span></h3>
     <span className="text-xs text-ink-500">{draft.lines.length} rows · POS-style entry</span>
    </div>
    <TransactionCartEditor mode="quotation" products={products} lines={draft.lines}
     onAdd={addProduct} onUpdate={patchLine}
     onRemove={id=>patch({lines:draft.lines.filter(x=>x.id!==id)})}
     onMove={reorder} onCreate={()=>setCreatingProduct(true)}/>
   </section>
   <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
    <label className="space-y-1 text-xs font-medium text-ink">Terms / note · <span className="font-bn text-ink-400">শর্ত</span>
     <textarea aria-label="Quotation terms" rows={3} value={draft.note} maxLength={600}
      onChange={e=>patch({note:e.target.value})}
      className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-500/20"/>
    </label>
    <div className="space-y-2 rounded-lg bg-ink-50 p-3 text-sm">
     <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><strong>{taka(quoteSubtotal(draft))}</strong></div>
     <label className="flex items-center justify-between gap-2 text-ink-500">Discount · ছাড়
      <Input aria-label="Quotation discount" type="number" min="0" step="any" className="w-36 text-right" value={draft.discount}
       onChange={e=>patch({discount:Number(e.target.value)})}/>
     </label>
     <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-ink"><span>Total</span><span>{taka(quoteTotal(draft))}</span></div>
    </div>
   </div>
   {error&&<p role="alert" className="rounded-md bg-danger-bg p-2 text-sm text-danger">{error}</p>}
   <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}><Check className="size-4"/> Save draft</Button></DialogFooter>
  <AddProductDialog open={creatingProduct} onOpenChange={setCreatingProduct} onSave={product=>{
   createPreviewProduct(product);addProduct(product);setCreatingProduct(false);
  }}/>
  </DialogContent>
 </Dialog>;
}
function QuotationDetail({quote,onClose,onEdit,onDuplicate,onTransition,onDelete,onCreateOrder}:{
 quote:Quotation|null;onClose:()=>void;onEdit:(q:Quotation)=>void;
 onCreateOrder:(q:Quotation)=>void;
 onDuplicate:(q:Quotation)=>void;onTransition:(q:Quotation,status:QuoteStatus)=>void;
 onDelete:(q:Quotation)=>void;
}){
 if(!quote)return null;
 const status=quoteDisplayStatus(quote);
 return <Dialog open={true} onOpenChange={value=>!value&&onClose()}>
  <DialogContent role="dialog" aria-label={'Quotation '+quote.number} className="max-h-[94vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-3xl">
   <style>{'@media print { body * { visibility:hidden !important } #quotation-print, #quotation-print * {visibility:visible !important} #quotation-print {position:absolute !important;inset:0; width:100%;background:white;color:black;padding:24px} }'}</style>
   <DialogHeader>
    <DialogTitle>{quote.number} <StatusBadge tone={statusTone[status]}>{status}</StatusBadge></DialogTitle>
    <DialogDescription>Quotation preview only — not an invoice or payment request.</DialogDescription>
   </DialogHeader>
   <div id="quotation-print" className="space-y-4 rounded-xl border border-border bg-card p-4 text-sm text-ink">
    <div className="flex items-start justify-between gap-4">
     <div><strong className="text-lg">HisabIQ</strong><p className="text-xs text-ink-500">Quotation · মূল্য প্রস্তাব</p></div>
     <div className="text-right"><strong>{quote.number}</strong><p className="text-xs">Issue: {quote.date}</p><p className="text-xs">Valid until: {quote.validUntil}</p></div>
    </div>
    <div className="border-t border-border pt-3"><span className="text-xs text-ink-500">Prepared for</span>
     <p className="font-semibold">{quote.customerName}</p><p className="text-xs">{quote.customerPhone??''}</p>
    </div>
    <div className="overflow-x-auto">
     <table className="w-full border-collapse text-left text-xs">
      <thead><tr className="border-b border-border text-ink-500"><th className="py-2">#</th><th>Product</th><th className="text-right">Qty</th><th className="text-right">Price</th><th className="text-right">Amount</th></tr></thead>
      <tbody>{quote.lines.map((line,i)=><tr key={line.id} className="border-b border-border/60"><td className="py-2">{i+1}</td><td>{line.name}</td><td className="text-right">{line.quantity} {line.unit}</td><td className="text-right">{taka(line.price)}</td><td className="text-right">{taka(quoteLineTotal(line))}</td></tr>)}</tbody>
     </table>
    </div>
    <div className="ml-auto max-w-xs space-y-1 text-right">
     <p>Subtotal: {taka(quoteSubtotal(quote))}</p><p>Discount: {taka(quote.discount)}</p>
     <p className="border-t border-border pt-2 text-lg font-semibold">Total: {taka(quoteTotal(quote))}</p>
    </div>
    {quote.note&&<p className="border-t border-border pt-3 text-xs">Terms: {quote.note}</p>}
    <p className="text-[11px] text-ink-500">Quotation only. No stock reservation or financial posting.</p>
   </div>
   <div className="flex flex-wrap gap-2">
    <Button variant="outline" size="sm" onClick={()=>window.print()}><Printer className="size-4"/> Print</Button>
    <Button variant="outline" size="sm" onClick={()=>onDuplicate(quote)}><Copy className="size-4"/> Duplicate</Button>
    {quote.status!=='Declined'&&<Button variant="outline" size="sm" onClick={()=>onEdit(quote)}><Pencil className="size-4"/> Revise</Button>}
    {quote.status==='Draft'&&<Button size="sm" onClick={()=>onTransition(quote,'Sent')}><Send className="size-4"/> Mark sent</Button>}
    {quote.status==='Sent'&&<>
      <Button variant="outline" size="sm" onClick={()=>onTransition(quote,'Draft')}>Return to draft</Button>
      <Button variant="outline" size="sm" onClick={()=>onTransition(quote,'Declined')}><X className="size-4"/> Declined</Button>
      <Button size="sm" disabled={status==='Expired'} onClick={()=>onTransition(quote,'Accepted')}><Check className="size-4"/> Accepted</Button>
     </>}
    {quote.status==='Accepted'&&<Button size="sm" onClick={()=>onCreateOrder(quote)}>Create online order</Button>}
    {quote.status==='Draft'&&<Button size="sm" variant="outline" onClick={()=>onDelete(quote)}><Trash2 className="size-4"/> Delete draft</Button>}
   </div>
  </DialogContent>
 </Dialog>;
}
export function Quotations(){
 const {quotes}=useSyncExternalStore(subscribeQuotes,getQuoteSnapshot);
 const navigate=useNavigate();
 const [search,setSearch]=useState('');
 const [status,setStatus]=useState('All');
 const [editing,setEditing]=useState<Quotation|null>(null);
 const [editorOpen,setEditorOpen]=useState(false);
 const [detailId,setDetailId]=useState<string|null>(null);
 const [deleteTarget,setDeleteTarget]=useState<Quotation|null>(null);
 const detail=quotes.find(q=>q.id===detailId)??null;
 const filtered=useMemo(()=>quotes.filter(q=>(status==='All'||quoteDisplayStatus(q)===status)&&
 [q.number,q.customerName,q.customerPhone??'',...q.lines.map(l=>l.name)].some(value=>value.toLowerCase().includes(search.toLowerCase().trim()))),[quotes,search,status]);
 const create=()=>{setEditing(null);setEditorOpen(true);};
 const edit=(q:Quotation)=>{setDetailId(null);setEditing(q);setEditorOpen(true);};
 const duplicate=(q:Quotation)=>{try{const copy=duplicateQuote(q.id);setDetailId(copy.id);toast.success('Quotation duplicated as draft');}catch(e){toast.error(String(e));}};
 const transition=(q:Quotation,to:QuoteStatus)=>{try{changeQuoteStatus(q.id,to);toast.success('Quotation marked '+to.toLowerCase()+' in preview');}catch(e){toast.error(e instanceof Error?e.message:String(e));}};
 const remove=()=>{if(!deleteTarget)return;try{deleteDraftQuote(deleteTarget.id);setDetailId(null);toast.success('Draft deleted');}catch(e){toast.error(String(e));}setDeleteTarget(null);};
 const totalValue=quotes.reduce((sum,q)=>sum+quoteTotal(q),0);
 const openCount=quotes.filter(q=>['Draft','Sent'].includes(quoteDisplayStatus(q))).length;
 return <div className="mx-auto max-w-[1440px] space-y-4">
  <PageHeader title="Quotations" titleBn="মূল্য প্রস্তাব"
    description="Create price estimates, track customer approval and print professional quotes · UI preview only."
    actions={<Button size="sm" onClick={create}><Plus className="size-4"/> New quotation</Button>}/>
  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
   {[
    ['Total quotations',String(quotes.length),'All preview quotes'],
    ['Open quotations',String(openCount),'Draft or sent'],
    ['Accepted',String(quotes.filter(q=>q.status==='Accepted').length),'Customer-approved'],
    ['Quoted value',taka(totalValue),'No revenue posted']
   ].map(([label,value,sub])=><div key={label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
     <p className="text-[12.5px] text-ink-500">{label}</p><p className="mt-1 text-lg font-semibold text-ink">{value}</p><p className="text-[11px] text-ink-400">{sub}</p>
    </div>)}
  </div>
  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
   <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
    <div className="relative min-w-[180px] flex-1 sm:max-w-sm">
     <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"/>
     <Input aria-label="Search quotations" className="pl-8" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search quote, customer or item…"/>
    </div>
    <div className="flex flex-wrap gap-1">{['All','Draft','Sent','Accepted','Declined','Expired'].map(s=>
     <Button key={s} type="button" variant={status===s?'default':'outline'} size="sm" onClick={()=>setStatus(s)}>{s}</Button>)}</div>
   </div>
   <div className="overflow-x-auto">
    <Table><TableHeader><TableRow>
     <TableHead>Quote</TableHead><TableHead>Customer</TableHead><TableHead>Date / expiry</TableHead>
     <TableHead className="text-right">Items</TableHead><TableHead className="text-right">Total</TableHead>
     <TableHead>Status</TableHead><TableHead>Actions</TableHead>
    </TableRow></TableHeader>
    <TableBody>{filtered.map(q=>{
     const currentStatus=quoteDisplayStatus(q);
     return <TableRow key={q.id}>
      <TableCell><button className="font-semibold text-teal-700 hover:underline dark:text-teal-400" onClick={()=>setDetailId(q.id)}>{q.number}</button></TableCell>
      <TableCell><span className="font-medium text-ink">{q.customerName}</span><p className="text-[11px] text-ink-400">{q.customerPhone||'—'}</p></TableCell>
      <TableCell><p>{q.date}</p><p className="text-[11px] text-ink-500">Valid: {q.validUntil}</p></TableCell>
      <TableCell className="text-right">{q.lines.length}</TableCell>
      <TableCell className="text-right font-semibold">{taka(quoteTotal(q))}</TableCell>
      <TableCell><StatusBadge tone={statusTone[currentStatus]}>{currentStatus}</StatusBadge></TableCell>
      <TableCell><div className="flex items-center gap-1">
       <Button size="sm" variant="outline" onClick={()=>setDetailId(q.id)}><FileText className="size-3.5"/> View</Button>
       <Button size="sm" variant="outline" onClick={()=>duplicate(q)} aria-label={'Duplicate '+q.number}><Copy className="size-3.5"/></Button>
      </div></TableCell>
     </TableRow>;
    })}</TableBody></Table>
   </div>
   {!filtered.length&&<div className="px-4 py-12 text-center text-sm text-ink-500">No matching quotations. <button className="text-teal-700 underline" onClick={()=>{setSearch('');setStatus('All');}}>Clear filters</button></div>}
   <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-ink-500"><span>Showing {filtered.length} of {quotes.length}</span><span>Prices only · no financial posting</span></div>
  </div>
  {editorOpen&&<QuotationEditor key={editing?.id??'new'} open original={editing} onClose={()=>{setEditorOpen(false);setEditing(null);}}/>}
  <QuotationDetail quote={detail} onClose={()=>setDetailId(null)} onEdit={edit} onDuplicate={duplicate} onTransition={transition} onDelete={setDeleteTarget} onCreateOrder={q=>navigate('/app/online-sales?quote='+encodeURIComponent(q.id))}/>
  <Dialog open={Boolean(deleteTarget)} onOpenChange={value=>!value&&setDeleteTarget(null)}>
   <DialogContent role="dialog" aria-label="Confirm delete quotation" className="sm:max-w-md">
    <DialogHeader><DialogTitle>Delete draft quotation?</DialogTitle><DialogDescription>{deleteTarget?.number} will be deleted from the in-memory preview. This action cannot be undone.</DialogDescription></DialogHeader>
    <DialogFooter><Button variant="outline" onClick={()=>setDeleteTarget(null)}>Cancel</Button>
     <Button onClick={remove}>Delete draft</Button></DialogFooter>
   </DialogContent>
  </Dialog>
 </div>;
}
