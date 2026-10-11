import {sourceOutstanding} from './vendorModel.ts';
import type {VendorPreviewState,VendorSource} from './vendorTypes.ts';

/** Never use an unvalidated deep-link ID or a source belonging to another Vendor. */
export function selectVendorSource(
 sources:readonly VendorSource[],
 state:VendorPreviewState,
 partyId:string,
 kind:VendorSource['sourceKind'],
 preferredId?:string|null
):VendorSource|null {
 const candidates=sources.filter(source=>
  source.vendorPartyId===partyId&&source.sourceKind===kind&&source.status==='Active');
 if(!candidates.length)return null;
 const preferred=preferredId&&candidates.find(source=>source.id===preferredId);
 if(preferred)return preferred;
 return candidates.find(source=>{
  const due=sourceOutstanding(state,source.id);
  return due.unpricedBaseQty>0||(due.monetaryDuePaisa??0)>0;
 })??candidates[0];
}
