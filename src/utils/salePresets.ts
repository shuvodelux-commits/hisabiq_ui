import type {CartLine} from '../hooks/usePosCart.ts';
import type {Product,SalePresetLine} from '../types/erp.ts';
import {compoundLineTotal} from './posQuantity.ts';

export function cartFromPreset(lines:readonly SalePresetLine[],products:readonly Product[]):CartLine[] {
  return lines.flatMap((sourceLine,index)=>{
    const product=products.find(item=>item.id===sourceLine.productId);
    if(!product)return [];
    const unit=sourceLine.unit===product.altUnit?.unit?sourceLine.unit:product.unit;
    return [{key:`preset-${sourceLine.productId}-${index}`,product,qty:sourceLine.qty,
      secondaryQty:sourceLine.secondaryQty??'',unit,price:String(sourceLine.price),
      serials:sourceLine.serials??[],stockSource:sourceLine.stockSource,
      ...(product.kind==='Bundle'?{bundleRevision:sourceLine.bundleRevision,bundleRecipeSignature:sourceLine.bundleRecipeSignature,
        bundleSources:sourceLine.bundleSources,bundleSerials:sourceLine.bundleSerials}:{})}];
  });
}

/** Validate planned cart data, without requiring stock, serial fulfillment or collecting money. */
export function templateCart(lines:readonly CartLine[]) {
  if(!lines.length)throw new Error('Add at least one product.');
  let paisa=0;
  const presets:SalePresetLine[]=lines.map(line=>{
    const decimal=(raw:string)=>/^(?:\d+(?:\.\d{1,6})?|\.\d{1,6})$/.test(raw)?Number(raw):NaN;
    const qty=decimal(line.qty||'0'),secondary=decimal(line.secondaryQty||'0'),price=decimal(line.price);
    const factor=line.unit===line.product.altUnit?.unit?line.product.altUnit.factor:1;
    if(!Number.isFinite(qty)||!Number.isFinite(secondary)||!Number.isFinite(price)||price<0||
      !Number.isFinite(factor)||factor<1||
      qty*factor+secondary<=0||!Number.isSafeInteger(Math.round(price*100))||Math.abs(Math.round(price*100)/100-price)>1e-7||
      (line.unit!==line.product.unit&&line.unit!==line.product.altUnit?.unit)||
      (factor===1&&secondary>0)||(line.product.kind==='Bundle'&&(!Number.isSafeInteger(qty)||secondary!==0)))
      throw new Error('Check product quantities, units and prices.');
    const total=compoundLineTotal(qty,secondary,factor,price);
    paisa+=Math.round(total*100);
    if(!Number.isSafeInteger(paisa))throw new Error('Template amount is too large.');
    return {productId:line.product.id,qty:line.qty,secondaryQty:line.secondaryQty,unit:line.unit,price,
      ...(line.product.kind==='Bundle'?{bundleRevision:line.bundleRevision,bundleRecipeSignature:line.bundleRecipeSignature}: {})};
  });
  return {lines:presets,items:presets.length,total:paisa/100};
}
