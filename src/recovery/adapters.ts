import {getVendorPreviewSnapshot} from '../vendor/vendorPreviewStore.ts';
import {getExpensePreviewSnapshot} from '../data/expensePreviewStore.ts';
import {getFinancePreviewSnapshot} from '../data/financePreviewStore.ts';
import {purchases} from '../data/purchases.ts';
import {recoveryStore} from './store.ts';
import {getSalesPreviewSnapshot} from '../data/salesPreviewStore.ts';
import {getPurchaseDrafts} from '../data/purchaseDraftsPreviewStore.ts';
import {getQuoteSnapshot} from '../quotations/quotePreviewStore.ts';
import {getOnlineSnapshot} from '../onlineSales/onlineStore.ts';
import {getProductImportPreviewSnapshot,removeProductForRecovery,restoreProductForRecovery} from '../data/productImportPreviewStore.ts';
import {getPartyPreviewSnapshot,removePartyForRecovery,restorePartyForRecovery,removeNoteForRecovery,restoreNoteForRecovery} from '../data/partyPreviewStore.ts';
import {products as seeds} from '../data/products.ts';
import {parties as partySeeds} from '../data/parties.ts';
import type {Party,Product,BundleVersion} from '../types/erp.ts';
import type {PartySourceRecord} from '../types/partyLedger.ts';
export function productDeleteReason(id:string):string|undefined{
 const catalog=getProductImportPreviewSnapshot(),sales=getSalesPreviewSnapshot();const p=catalog.products.find(p=>p.id===id);
 if(!p)return 'Product unavailable.';
 if(seeds.some(p=>p.id===id))return 'Historical use of this sample product cannot be fully verified. Deactivate it instead.';
 if(p.stock||catalog.lots.some(l=>l.productId===id)||catalog.movements.some(m=>m.productId===id)||catalog.bundleSaleReferences.some(r=>r.bundleProductId===id))return 'Product has stock or inventory/sale history. Deactivate it instead.';
 if(getVendorPreviewSnapshot().sources.some(s=>s.productId===id))return 'Product has purchase or vendor source history.';
 if(catalog.bundleVersions.some(v=>v.bundleProductId!==id&&v.components.some(c=>c.productId===id)))return 'Product is a package component.';
 if([...sales.invoices,...sales.templates,...sales.drafts,...getQuoteSnapshot().quotes,...getOnlineSnapshot().orders].some(r=>r.lines?.some(l=>l.productId===id))||getPurchaseDrafts().some(d=>d.lines.some(l=>l.product.id===id)))return 'Product is referenced by another source. Deactivate it instead.';
}
export function partyDeleteReason(id:string):string|undefined{
 const state=getPartyPreviewSnapshot(),p=state.parties.find(p=>p.id===id);if(!p)return 'Party unavailable.';
 if(partySeeds.some(p=>p.id===id))return 'Historical use across this sample party’s roles cannot be fully verified. Deactivate it instead.';
 if(p.balance||state.sources.some(s=>s.partyId===id)||state.audit.some(e=>e.partyId===id&& !['create-party','update-party','import-parties','import-party-batch'].includes(e.action)))return 'Party has source or financial history across its roles. Deactivate it instead.';
 if(getExpensePreviewSnapshot().expenses.some(e=>e.payeeId===id)||getFinancePreviewSnapshot().transactions.some(t=>t.partyId===id)||purchases.some(p=>p.supplierId===id)||[...getVendorPreviewSnapshot().sources,...getVendorPreviewSnapshot().settlements,...getVendorPreviewSnapshot().openings,...getVendorPreviewSnapshot().events].some(s=>s.vendorPartyId===id))return 'Party has expense, finance, purchase or vendor history.';
 if(getQuoteSnapshot().quotes.some(q=>q.partyId===id)||getOnlineSnapshot().orders.some(o=>o.partyId===id)||getPurchaseDrafts().some(d=>d.supplierId===id))return 'Party is referenced by another source.';
 // Retain audited former names when a legacy source has no party identity.
 const nameKey=(name:string)=>name.trim().normalize('NFKC').toLocaleLowerCase();
 const names=new Set([nameKey(p.name)]);
 for(const event of state.audit.filter(e=>e.partyId===id))for(const candidate of [event.before,event.after])if(candidate&&typeof candidate==='object'&&'name' in candidate&&typeof candidate.name==='string')names.add(nameKey(candidate.name));
 const matchesName=(name:string|undefined)=>!!name&&names.has(nameKey(name));
 const sales=getSalesPreviewSnapshot();if(sales.credits.some(r=>r.customerId===id||matchesName(r.customer)))return 'Party has customer credit history. Deactivate it instead.';if(sales.invoices.some(r=>r.partyId===id||matchesName(r.party))||sales.returns.some(r=>r.customerId===id)||[...sales.drafts,...sales.templates].some(r=>r.customerId===id||matchesName(r.customer)))return 'Party is referenced by a sale source.';
}
type ProductPayload={id:string;product:Product;versions:readonly BundleVersion[]};
recoveryStore.register<ProductPayload>({kind:'product',module:'products',tenantId:'t1',get:id=>{const s=getProductImportPreviewSnapshot(),product=s.products.find(p=>p.id===id);return product?{id,product,versions:s.bundleVersions.filter(v=>v.bundleProductId===id)}:undefined;},label:p=>p.product.name,revision:JSON.stringify,checkDelete:p=>{const reason=productDeleteReason(p.id);if(reason)throw Error(reason);},checkRestore:p=>{const s=getProductImportPreviewSnapshot();if(s.products.some(x=>x.sku.trim().toUpperCase()===p.product.sku.trim().toUpperCase()))throw Error('SKU already exists.');if(p.versions.some(v=>v.components.some(c=>!s.products.some(x=>x.id===c.productId))))throw Error('A package component is unavailable.');},remove:removeProductForRecovery,restore:restoreProductForRecovery});
recoveryStore.register<Party>({kind:'party',module:'parties',tenantId:'t1',get:id=>getPartyPreviewSnapshot().parties.find(p=>p.id===id),label:p=>p.name,revision:JSON.stringify,checkDelete:p=>{const reason=partyDeleteReason(p.id);if(reason)throw Error(reason);},checkRestore:p=>{if(p.phone&&getPartyPreviewSnapshot().parties.some(x=>x.phone.replace(/\D/g,'')===p.phone.replace(/\D/g,'')))throw Error('Phone already exists.');},remove:removePartyForRecovery,restore:restorePartyForRecovery});
recoveryStore.register<PartySourceRecord>({kind:'party-note',module:'parties',tenantId:'t1',get:id=>getPartyPreviewSnapshot().sources.find(s=>s.id===id&&s.kind==='note'&&s.status==='Active'),label:p=>p.description,revision:JSON.stringify,checkRestore:p=>{if(!getPartyPreviewSnapshot().parties.some(x=>x.id===p.partyId))throw Error('The original party is unavailable.');},remove:removeNoteForRecovery,restore:restoreNoteForRecovery});
