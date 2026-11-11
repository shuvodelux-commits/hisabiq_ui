import {getPartyPreviewSnapshot} from './partyPreviewStore.ts';
import {recoveryStore} from '../recovery/store.ts';
import type {RecoveryContext} from '../recovery/model.ts';
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

export type DraftRecoveryContext={tenantId:string;actorId:string;allowed:boolean};
export const legacyRecoveryContext=(ctx:DraftRecoveryContext):RecoveryContext=>({tenantId:ctx.tenantId,actorId:ctx.actorId,view:ctx.allowed,restore:ctx.allowed,purge:false,owner:false,modules:['sales']});
export function listDeletedSalesDrafts(ctx:DraftRecoveryContext){if(!ctx.allowed||!ctx.actorId||ctx.tenantId!=='t1')return [];return recoveryStore.list(legacyRecoveryContext(ctx)).filter(r=>r.kind==='sales-draft'&&r.state==='deleted').map(r=>({draft:r.payload as SalesDraft,tenantId:r.tenantId,deletedBy:r.deletedBy,deletedAt:r.deletedAt,expiresAt:r.expiresAt,deletionId:r.deletionId}));}
export function deleteSalesDraft(id:string,ctx:DraftRecoveryContext,now:string){return recoveryStore.delete('sales-draft',id,legacyRecoveryContext(ctx),now);}
export function restoreSalesDraft(deletionId:string,ctx:DraftRecoveryContext,now:string){const context=legacyRecoveryContext(ctx);const record=recoveryStore.list(context).find(r=>r.deletionId===deletionId);if(!record)throw Error('Deleted draft unavailable. Use its deletion identity.');if(record.state==='restored')return;recoveryStore.restore(deletionId,context,now);}
function checkProducts(lines:readonly {productId:string}[]){if(lines.some(line=>!getProductImportPreviewSnapshot().products.some(p=>p.id===line.productId)))throw Error('A source product is unavailable.');}
recoveryStore.register<SalesDraft>({kind:'sales-draft',module:'sales',tenantId:'t1',get:id=>snapshot.drafts.find(d=>d.id===id),label:d=>d.label,revision:JSON.stringify,checkRestore:d=>{checkProducts(d.lines);if(d.customerId&&!getPartyPreviewSnapshot().parties.some(p=>p.id===d.customerId))throw Error('The original party is unavailable.');},remove:id=>updateSalesPreview('drafts',items=>items.filter(d=>d.id!==id)),restore:d=>updateSalesPreview('drafts',items=>[d,...items])});
recoveryStore.register<SaleTemplate>({kind:'sale-template',module:'sales',tenantId:'t1',get:id=>snapshot.templates.find(d=>d.id===id),label:d=>d.name,revision:JSON.stringify,checkRestore:d=>{checkProducts(d.lines);if(d.customerId&&!getPartyPreviewSnapshot().parties.some(p=>p.id===d.customerId))throw Error('The original party is unavailable.');},remove:id=>updateSalesPreview('templates',items=>items.filter(d=>d.id!==id)),restore:d=>updateSalesPreview('templates',items=>[d,...items])});
