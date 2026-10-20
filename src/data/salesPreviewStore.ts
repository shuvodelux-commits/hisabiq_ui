import type {CustomerCredit, SalesInvoice, SalesReturn, SaleTemplate} from '../types/erp.ts';
import {customerCredits, salesInvoices, salesReturns, saleTemplates, salesDrafts, type SalesDraft} from './sales.ts';
import {getProductImportPreviewSnapshot} from './productImportPreviewStore.ts';
import {unitsFor} from '../utils/units.ts';
import {cartFromPreset,templateCart} from '../utils/salePresets.ts';

/** Single-browser-session design preview. No backend, stock, ledger or cash posting. */
type SalesPreview={invoices:SalesInvoice[];returns:SalesReturn[];credits:CustomerCredit[];templates:SaleTemplate[];drafts:SalesDraft[]};
let snapshot:SalesPreview=structuredClone({invoices:salesInvoices,returns:salesReturns,credits:customerCredits,templates:saleTemplates,drafts:salesDrafts});
const listeners=new Set<()=>void>();
export const getSalesPreviewSnapshot=()=>snapshot;
export function subscribeSalesPreview(listener:()=>void) {
  listeners.add(listener);return ()=>{listeners.delete(listener);};
}
export function updateSalesPreview<K extends keyof SalesPreview>(key:K,update:(items:SalesPreview[K])=>SalesPreview[K]) {
  snapshot={...snapshot,[key]:update(snapshot[key])};
  for(const listener of listeners)listener();
}
export function saveSaleTemplate(template:Omit<SaleTemplate,'id'|'lastUsed'>,expected?:SaleTemplate):SaleTemplate {
  if(!template.name.trim()||!template.lines.length||!Number.isFinite(template.total)||template.total<0)
    throw new Error('Add a template name and valid products.');
  if(expected&&JSON.stringify(snapshot.templates.find(item=>item.id===expected.id))!==JSON.stringify(expected))
    throw new Error('Template changed. Close and reopen the editor.');
  const catalog=getProductImportPreviewSnapshot().products;
  if(template.lines.some(line=>{
    const product=catalog.find(item=>item.id===line.productId);
    return product&&!unitsFor(product).includes(line.unit);
  }))throw new Error('Choose a valid product unit.');
  const lines=cartFromPreset(template.lines,catalog);
  if(lines.length!==template.lines.length)throw new Error('A source product is unavailable.');
  const validated=templateCart(lines);
  const saved:SaleTemplate={...structuredClone(template),...validated,name:template.name.trim(),id:expected?.id??`template-${crypto.randomUUID()}`,lastUsed:expected?.lastUsed??'Not used yet'};
  updateSalesPreview('templates',items=>expected?items.map(item=>item.id===expected.id?saved:item):[saved,...items]);
  return saved;
}
