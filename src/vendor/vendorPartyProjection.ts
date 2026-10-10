import type {IsoRange} from '../utils/dateRange.ts';
import type {Purchase} from '../types/erp.ts';
import {vendorBalances} from './vendorModel.ts';
import {projectVendorStatement,type VendorStatement} from './vendorLedger.ts';
import {projectVendorActivity,ordinaryVendorPurchaseDuePaisa,type VendorActivityRow} from './vendorActivity.ts';
import type {VendorPreviewState} from './vendorTypes.ts';

export type VendorPartyProfile={
 partyId:string;
 summary:{takenDuePaisa:number;givenDuePaisa:number;purchaseDuePaisa:number;priceNotSetBaseQty:number;priceNotSetCount:number};
 takenStatement:VendorStatement;
 givenStatement:VendorStatement;
 activity:VendorActivityRow[];
 documents:VendorActivityRow[];
 payments:VendorActivityRow[];
};

/** Read-only Vendor view shared between operational Vendor and Party profile. */
export function projectVendorPartyProfile(
 state:VendorPreviewState,purchases:readonly Purchase[],partyId:string,range:IsoRange
):VendorPartyProfile{
 const balances=vendorBalances(state,partyId);
 const activity=projectVendorActivity(state,partyId,purchases,range);
 return {
  partyId,
  summary:{
   takenDuePaisa:balances.knownPayablePaisa,
   givenDuePaisa:balances.knownReceivablePaisa,
   purchaseDuePaisa:ordinaryVendorPurchaseDuePaisa(purchases,partyId),
   priceNotSetBaseQty:balances.unpricedSourceBaseQty,
   priceNotSetCount:balances.unpricedSourceCount
  },
  takenStatement:projectVendorStatement(state,partyId,'payable',range),
  givenStatement:projectVendorStatement(state,partyId,'receivable',range),
  activity,
  documents:activity.filter(e=>['sourcing','issue','purchase'].includes(e.kind)),
  payments:activity.filter(e=>['settlement','purchase-payment'].includes(e.kind))
 };
}
