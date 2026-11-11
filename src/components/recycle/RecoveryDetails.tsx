import {recoveryDisplayDate} from '../../recovery/display';
import type {ReactNode} from 'react';
import {useUiCopy} from '../../i18n/useUiCopy';
import {useTenantSettings} from '../../settings/TenantSettingsProvider';
import {formatDay} from '../../utils/dateRange';
import {taka} from '../../utils/currency';
import {getProductImportPreviewSnapshot} from '../../data/productImportPreviewStore';
import {getPartyPreviewSnapshot} from '../../data/partyPreviewStore';
import {quoteTotal,type Quotation} from '../../quotations/quotePreviewStore';
import {orderTotals,type OnlineOrder} from '../../onlineSales/onlineStore';
import type {SalesDraft} from '../../data/sales';
import type {SaleTemplate,Product} from '../../types/erp';
import type {PurchaseDraft} from '../../data/purchaseDraftsPreviewStore';
import type {PartySourceRecord} from '../../types/partyLedger';
import type {Party} from '../../types/erp';
import type {RecoveryRecord} from '../../recovery/model';
import {recoveryKind} from '../../recovery/copy';
export function RecoveryDetails({record}:{record:RecoveryRecord}){
 const {text}=useUiCopy(),{state}=useTenantSettings();
 const fields:Array<[string,ReactNode]>=[];const add=(en:string,bn:string,value:ReactNode)=>{if(value!==undefined&&value!==null&&value!=='')fields.push([text(en,bn),value]);};
 const productName=(id:string)=>getProductImportPreviewSnapshot().products.find(p=>p.id===id)?.name??id;
 const partyName=(id:string)=>getPartyPreviewSnapshot().parties.find(p=>p.id===id)?.name??id;
 let lines:ReactNode[]=[];
 if(record.payload){
  if(record.kind==='sales-draft'||record.kind==='sale-template'){
   const p=record.payload as SalesDraft|SaleTemplate;add('Customer','ক্রেতা',p.customer??(p.customerId?partyName(p.customerId):text('Walk-in','সাধারণ ক্রেতা')));add('Total','মোট',taka(p.total));lines=p.lines.map((l,i)=><li key={i}>{productName(l.productId)} · {l.qty} {l.unit}{l.secondaryQty?` + ${l.secondaryQty}`:''} · {taka(l.price)}</li>);
  }else if(record.kind==='purchase-draft'){
   const p=record.payload as PurchaseDraft;add('Supplier','সরবরাহকারী',p.supplierName||(p.supplierId?partyName(p.supplierId):text('Not selected','বাছাই করা হয়নি')));add('Reference','রেফারেন্স',p.referenceNo);add('Date','তারিখ',formatDay(p.date));add('Total','মোট',taka(p.total));add('Notes','নোট',p.notes);lines=p.lines.map(l=><li key={l.id}>{l.product.name} · {l.bigQty} {l.costUnit}{l.smallQty?` + ${l.smallQty}`:''} · {taka(Number(l.cost)||0)}</li>);
  }else if(record.kind==='quotation'||record.kind==='online-order'){
   const p=record.payload as Quotation|OnlineOrder;add('Customer','ক্রেতা',p.customerName);add('Phone','ফোন','phone' in p?p.phone:p.customerPhone);add('Total','মোট',taka(record.kind==='quotation'?quoteTotal(p as Quotation):orderTotals(p as OnlineOrder).grand));add('Notes','নোট',p.note);if('address' in p)add('Address','ঠিকানা',p.address);lines=p.lines.map(l=><li key={l.id}>{l.name} · {l.quantity} {l.unit} · {taka(l.price)}</li>);
  }else if(record.kind==='product'){
   const {product:p}=record.payload as {product:Product};add('SKU','SKU',p.sku);add('Category','বিভাগ',p.category);add('Brand','ব্র্যান্ড',p.brand);add('Unit','একক',p.unit);add('Selling price','বিক্রয় মূল্য',taka(p.sellPrice));
  }else if(record.kind==='party'){
   const p=record.payload as Party;add('Name','নাম',p.name);add('Phone','ফোন',p.phone);add('Area','এলাকা',p.area);const roles:Record<string,string>={Customer:'ক্রেতা',Supplier:'সরবরাহকারী',Vendor:'ভেন্ডর',Payee:'প্রাপক',Owner:'মালিক',Lender:'ঋণদাতা',Borrower:'ঋণগ্রহীতা'};add('Relationships','সম্পর্ক',p.roles.map(r=>text(r,roles[r]??r)).join(', '));
  }else if(record.kind==='party-note'){
   const p=record.payload as PartySourceRecord;add('Party','পার্টি',partyName(p.partyId));add('Date','তারিখ',formatDay(p.date));add('Note','নোট',p.description);
  }
 }
 const actor=state.sections.team.employees.find(e=>e.id===record.deletedBy)?.name??record.deletedBy;
 return <div className="max-h-[60vh] space-y-4 overflow-y-auto text-sm">
 {!record.payload&&<p className="text-helper">{text('The recovery payload is unavailable after restore or permanent deletion. Open the restored source from its row.','ফেরানো বা স্থায়ীভাবে মোছার পরে উদ্ধারের তথ্য থাকে না। সারি থেকে ফেরানো উৎস খুলুন।')}</p>}
 <dl className="space-y-2">{fields.map(([label,value])=><div key={label}><dt className="text-xs text-helper">{label}</dt><dd className="whitespace-pre-wrap break-words">{value}</dd></div>)}</dl>
 {!!lines.length&&<div><h3 className="font-medium">{text('Products','পণ্য')}</h3><ul className="mt-1 space-y-2">{lines}</ul></div>}
 <dl className="space-y-2 border-t border-border pt-3"><div><dt className="text-xs text-helper">{text('Record type','তথ্যের ধরন')}</dt><dd>{recoveryKind(record.kind,text)}</dd></div><div><dt className="text-xs text-helper">{text('Deleted by','মুছেছেন')}</dt><dd>{actor}</dd></div><div><dt className="text-xs text-helper">{text('Deleted at','মোছার সময়')}</dt><dd>{recoveryDisplayDate(record.deletedAt)}</dd></div><div><dt className="text-xs text-helper">{text('Recovery deadline','উদ্ধারের শেষ সময়')}</dt><dd>{recoveryDisplayDate(record.expiresAt)}</dd></div><div><dt className="text-xs text-helper">{text('Source identity','উৎসের পরিচয়')}</dt><dd className="break-all">{record.sourceId}</dd></div><div><dt className="text-xs text-helper">{text('Deletion identity','মুছে ফেলার পরিচয়')}</dt><dd className="break-all">{record.deletionId}</dd></div></dl>
 </div>;
}
