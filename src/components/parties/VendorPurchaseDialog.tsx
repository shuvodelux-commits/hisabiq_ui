import React from 'react';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '../Dialog';
import {PurchaseEditor} from '../../pages/PurchaseEditor';
import {dispatchVendorPreview,getVendorPreviewSnapshot} from '../../vendor/vendorPreviewStore';
import type {Purchase} from '../../types/erp';

type Props={open:boolean;vendorPartyId:string;vendorName:string;onClose:()=>void;onSaved:(purchase:Purchase)=>void};

/**
 * shadcn dialog pattern: title + accessible description + existing Purchase
 * editor embedded unchanged. No duplicate payment/cart logic or route change.
 */
export function VendorPurchaseDialog({open,vendorPartyId,vendorName,onClose,onSaved}:Props){
 const saved=(purchase:Purchase)=>{
   if(purchase.supplierId!==vendorPartyId)throw new Error('Selected Vendor changed during the purchase.');
   // Ordinary owned-stock Purchase and POS borrowing are separate accounts.
   // PurchaseEditor already records this preview Purchase; only project its
   // stock once for later in-kind Vendor replacement demos.
   const state=getVendorPreviewSnapshot();
   dispatchVendorPreview({
    type:'record-purchase-inventory',operationId:'vendor-normal-purchase:'+purchase.id,
    vendorPartyId,purchaseId:purchase.id,
    lines:(purchase.inventoryLines??[]).map(line=>({productId:line.productId,baseQty:line.quantity}))
   });
   onSaved(purchase);
 };
 return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>
  <DialogContent role="dialog" aria-modal="true" aria-label="Buy products from Vendor"
    className="max-h-[94vh] w-[min(98vw,1440px)] max-w-[1440px] overflow-y-auto p-3 sm:p-5">
   <DialogHeader>
    <DialogTitle>Buy products · {vendorName}
      <span className="ml-2 font-bn text-sm font-normal text-ink-500">পণ্য ক্রয়</span>
    </DialogTitle>
    <DialogDescription>
     Ordinary purchase into owned stock. Separate from POS Vendor sourcing and its unpaid source queue.
     Demo preview — no real inventory, cash or payable posting.
    </DialogDescription>
   </DialogHeader>
   {open&&<PurchaseEditor key={vendorPartyId} embedded initialSupplierId={vendorPartyId}
    onCancel={onClose} onCompleted={saved}/>}
  </DialogContent>
 </Dialog>;
}
