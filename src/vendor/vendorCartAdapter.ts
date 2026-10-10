import {baseQty,makePurchaseLine} from '../utils/purchaseCart.ts';
import type {PurchaseCartLine} from '../utils/purchaseCart.ts';
import type {Product} from '../types/erp.ts';
import type {VendorSourceInput} from './vendorTypes.ts';

/**
 * Adapt the existing PurchaseCart row for Vendor product movements.
 * A normal Purchase must have a cost; sourced products may remain unpriced.
 * The cart layout, quantity fields, product picker, and keyboard flow stay shared.
 */
export function makeVendorCartLine(product:Product):PurchaseCartLine {
 return {...makePurchaseLine(product),cost:'',lotSellPrice:''};
}

/** Translate shared PurchaseCart lines into the existing Vendor memo command. */
export function makeVendorSourceInputs(
 lines:readonly PurchaseCartLine[],mode:'taken'|'given',operationId:string,date:string
):VendorSourceInput[] {
 if(!lines.length)throw new Error('Add at least one product.');
 return lines.map((line,index)=>{
  const p=line.product;
  const big=Number(line.bigQty||0),small=Number(line.smallQty||0);
  if(!Number.isFinite(big)||!Number.isFinite(small)||big<0||small<0)
   throw new Error('Enter a valid quantity for '+p.name+'.');
  const quantity=baseQty(line);
  if(!Number.isFinite(quantity)||quantity<=0)
   throw new Error('Enter a valid quantity for '+p.name+'.');

  const hasPrice=line.cost.trim().length>0;
  const price=Number(line.cost);
  if(mode==='given'&&!hasPrice)
   throw new Error('Enter the agreed price for '+p.name+'.');
  if(hasPrice&&(!Number.isFinite(price)||price<=0))
   throw new Error('Price must be a positive number for '+p.name+'.');
  const factor=p.altUnit&&line.costUnit===p.altUnit.unit?p.altUnit.factor:1;
  const unitCostBasePaisa=hasPrice?Math.round(price*100/factor):null;
  if(unitCostBasePaisa!==null&&(!Number.isSafeInteger(unitCostBasePaisa)||unitCostBasePaisa<=0))
   throw new Error('Price is too small for the selected unit.');
  return {id:operationId+':'+index,productId:p.id,baseQty:quantity,unitCostBasePaisa,date};
 });
}
