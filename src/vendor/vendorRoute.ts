import type {Party} from '../types/erp.ts';

export type VendorWorkTab='ledger'|'taken'|'given'|'purchases'|'payments';
export type VendorPaymentIntent='make'|'receive';
const tabs:readonly VendorWorkTab[]=['ledger','taken','given','purchases','payments'];
export const vendorWorkTabs=tabs;

export function resolveVendorView(search:string,parties:readonly Party[]):{partyId:string|null;tab:VendorWorkTab}{
 const q=new URLSearchParams(search.startsWith('?')?search.slice(1):search);
 const id=q.get('partyId');
 const allowed=Boolean(id&&parties.some(p=>p.id===id&&p.roles.includes('Vendor')));
 const tab=q.get('tab');
 return {partyId:allowed?id:null,tab:allowed&&tabs.includes(tab as VendorWorkTab)?tab as VendorWorkTab:'ledger'};
}
export function vendorWorkLink(partyId:string,tab?:VendorWorkTab,sourceId?:string,intent?:VendorPaymentIntent):string{
 const p=new URLSearchParams({partyId});
 if(tab)p.set('tab',tab);
 if(sourceId)p.set('sourceId',sourceId);
 if(intent&&tab==='payments')p.set('intent',intent);
 return '/app/vendors?'+p.toString();
}
export function filterVendors(parties:readonly Party[],text:string):Party[]{
 const q=text.trim().toLocaleLowerCase();
 return parties.filter(p=>p.roles.includes('Vendor')&&(!q||
 [p.name,p.nameBn,p.phone,p.area].some(value=>(value??'').toLocaleLowerCase().includes(q))));
}

export function resolveVendorPaymentIntent(search:string):VendorPaymentIntent|null{
 const params=new URLSearchParams(search.startsWith('?')?search.slice(1):search);
 if(params.get('tab')!=='payments')return null;
 const intent=params.get('intent');
 return intent==='make'||intent==='receive'?intent:null;
}
