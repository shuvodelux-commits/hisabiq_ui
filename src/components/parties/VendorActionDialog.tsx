import React from 'react';
import {Button} from '../Button';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '../Dialog';
import {taka} from '../../utils/currency';
import type {VendorSource} from '../../vendor/vendorTypes';
import {products} from '../../data/products';
type Props={source:VendorSource|null;onClose:()=>void};
export function VendorActionDialog({source,onClose}:Props){
 const product=products.find(p=>p.id===source?.productId);
 return <Dialog open={!!source} onOpenChange={v=>!v&&onClose()}>
  <DialogContent role="dialog" aria-label="Vendor source details" className="sm:max-w-md">
   <DialogHeader><DialogTitle>Vendor source details</DialogTitle>
    <DialogDescription>Read-only linked source · Demo preview — not accounting records.</DialogDescription>
   </DialogHeader>
   {source&&<dl className="grid grid-cols-2 gap-3 text-sm">
    <div><dt className="text-xs text-ink-500">Reference</dt><dd>{source.reference??source.id}</dd></div>
    <div><dt className="text-xs text-ink-500">Date</dt><dd>{source.date}</dd></div>
    <div><dt className="text-xs text-ink-500">Product</dt><dd>{product?.name??source.productId}</dd></div>
    <div><dt className="text-xs text-ink-500">Quantity</dt><dd>{source.baseQty} {product?.unit??'base units'}</dd></div>
    <div><dt className="text-xs text-ink-500">Source price</dt>
      <dd>{source.unitCostBasePaisa===null?'Price pending · দাম পরে নির্ধারণ':taka(source.unitCostBasePaisa/100)+' / '+(product?.unit??'unit')}</dd></div>
    <div><dt className="text-xs text-ink-500">Known total</dt>
      <dd>{source.sourceAmountPaisa===null?'Not yet priced':taka(source.sourceAmountPaisa/100)}</dd></div>
   </dl>}
   <p className="text-xs text-ink-500">Evening price confirmation and physical return settlement are planned for the next increment. They are not simulated here.</p>
   <div className="flex justify-end"><Button size="sm" onClick={onClose}>Close</Button></div>
  </DialogContent>
 </Dialog>;
}
