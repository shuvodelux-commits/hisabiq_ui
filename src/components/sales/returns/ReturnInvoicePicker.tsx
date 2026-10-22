import {Input} from '../../Input';
import {useUiCopy} from '../../../i18n/useUiCopy';
import type {SalesInvoice} from '../../../types/erp';

export function ReturnInvoicePicker({invoices,selectedIds,onToggle,search,onSearchChange}:{
 invoices:readonly SalesInvoice[];selectedIds:readonly string[];
 onToggle:(invoice:SalesInvoice,checked:boolean)=>void;search:string;onSearchChange:(next:string)=>void;
}){
 const {text}=useUiCopy();
 return <div className="rounded-xl border border-border bg-card">
  <div className="space-y-2 border-b border-border p-3">
   <p className="text-[13px] font-medium text-ink">{text('Select invoices','ইনভয়েস বাছুন')}</p>
   <Input value={search} onChange={event=>onSearchChange(event.target.value)}
    aria-label={text('Search invoices by number or phone','ইনভয়েস নম্বর বা ফোন দিয়ে খুঁজুন')}
    placeholder={text('Invoice no. / phone / customer','ইনভয়েস / ফোন / ক্রেতা')} className="h-9"/>
  </div>
  <div className="divide-y divide-border">
   {invoices.map(invoice=><label key={invoice.id}
     className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-ink-50">
     <input type="checkbox" className="size-4 rounded border-ink-300 text-teal-600 focus:ring-teal-500"
      checked={selectedIds.includes(invoice.id)}
      onChange={event=>onToggle(invoice,event.target.checked)}
      aria-label={text('Select invoice ','ইনভয়েস বাছুন ')+invoice.invoice}/>
     <span className="min-w-0 flex-1">
      <span className="block text-[13px] font-medium text-ink">{invoice.invoice}</span>
      <span className="block truncate text-[11px] text-ink-500">{invoice.party} · {invoice.phone??text('No phone','ফোন নেই')}</span>
      <span className="block text-[10.5px] text-ink-400">{invoice.date} · {invoice.items} {text('lines','পণ্য')}</span>
     </span>
     <span className="shrink-0 text-right text-[11px] text-ink-600">৳{invoice.total.toLocaleString('en-BD')}</span>
    </label>)}
   {!invoices.length&&<p className="px-3 py-4 text-xs text-ink-500">{text('No matching invoices.','মিল থাকা বিল পাওয়া যায়নি।')}</p>}
  </div>
 </div>;
}
