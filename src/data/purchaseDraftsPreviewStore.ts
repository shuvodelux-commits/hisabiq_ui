import {getPartyPreviewSnapshot} from './partyPreviewStore.ts';
import {recoveryStore} from '../recovery/store.ts';
import type {RecoveryContext} from '../recovery/model.ts';
import {getProductImportPreviewSnapshot} from './productImportPreviewStore.ts';
import type { PurchaseCartLine } from '../utils/purchaseCart';
import type { PurchaseDiscountMode } from '../utils/purchaseCheckout';
import type { PurchasePaymentRow } from '../utils/purchasePaymentMethods';

/**
 * Same-session Purchase draft preview, analogous to the POS draft preview.
 * Never posts stock, ledgers, cash or supplier balances. Real durable storage
 * requires a tenant-scoped backend API; this in-memory store resets on reload.
 */
export type PurchaseDraftInput = {
  tenantId: string;
  supplierId: string;
  supplierName: string;
  date: string;
  backdateReason: string;
  referenceNo: string;
  notes: string;
  lines: PurchaseCartLine[];
  payments: PurchasePaymentRow[];
  discount: string;
  discountMode: PurchaseDiscountMode;
  photos: string[];
  total: number;
};
export type PurchaseDraft = PurchaseDraftInput & {
  id: string;
  savedAt: string;
};

let drafts: readonly PurchaseDraft[] = [];
const subscribers = new Set<() => void>();
export const getPurchaseDrafts = () => drafts;
export function subscribePurchaseDrafts(callback: () => void) {
  subscribers.add(callback);
  return () => { subscribers.delete(callback); };
}
function publish(next: PurchaseDraft[]) {
  drafts = next;
  subscribers.forEach(callback => callback());
}
export function savePurchaseDraft(input: PurchaseDraftInput, currentId?: string | null): PurchaseDraft {
  if (currentId && !drafts.some(d => d.id === currentId && d.tenantId === input.tenantId)) {
    throw new Error('This purchase draft no longer exists. Choose another draft.');
  }
  if (!input.tenantId) throw new Error('Business is required to save purchase drafts.');
  if (input.lines.some(line => !line.id || !line.product?.id)) {
    throw new Error('A draft line is missing its product identity.');
  }
  const draft: PurchaseDraft = {
    ...structuredClone(input),
    id: currentId || 'pd-' + crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  publish(currentId
    ? drafts.map(item => item.id === currentId ? draft : item)
    : [draft, ...drafts]);
  return structuredClone(draft);
}
export function consumePurchaseDraft(id: string) {
  if (!drafts.some(item => item.id === id)) return;
  publish(drafts.filter(item => item.id !== id));
}

export function deletePurchaseDraft(id:string,ctx:RecoveryContext){return recoveryStore.delete('purchase-draft',id,ctx);}
recoveryStore.register<PurchaseDraft>({kind:'purchase-draft',module:'purchases',tenantId:'t1',get:id=>drafts.find(d=>d.id===id),label:d=>d.referenceNo||d.supplierName,revision:JSON.stringify,checkDelete:d=>{if(d.tenantId!=='t1')throw Error('Draft belongs to another business.');},checkRestore:d=>{if(d.supplierId&&!getPartyPreviewSnapshot().parties.some(p=>p.id===d.supplierId))throw Error('The original supplier is unavailable.');if(d.lines.some(l=>!getProductImportPreviewSnapshot().products.some(p=>p.id===l.product.id)))throw Error('A source product is unavailable.');},remove:consumePurchaseDraft,restore:d=>publish([d,...drafts])});
