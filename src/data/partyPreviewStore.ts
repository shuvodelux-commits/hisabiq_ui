import { parties as seedParties, ledgerEntries as seedLedgerEntries } from './parties.ts';
import { normalizePartyFixture } from './partyFixtureAdapter.ts';
import { validatePartyDraft } from '../utils/partyIdentity.ts';
import { businessToday } from '../utils/dateRange.ts';
import { validatePartyPayment, validatePartyRefund } from '../utils/partyPayment.ts';
import { customerSettlementAsOf, supplierSettlementAsOf, validateCustomerPayment, validateCustomerRefund } from '../utils/partySettlement.ts';
import type { Party, PartyRole } from '../types/erp';
import type { PartyDraft, PartyPreviewState, PartySourceRecord, PartyPaymentPayload, PartyRefundPayload } from '../types/partyLedger';

export type PartyPreviewCommand =
  | {type:'create-party'; party:PartyDraft}
  | {type:'import-parties'; parties:PartyDraft[]}
  | {type:'update-party'; id:string; patch:Partial<PartyDraft>}
  | {type:'deactivate-party'; id:string}
  | {type:'add-note'; partyId:string; text:string; relationship?:PartyRole}
  | {type:'edit-note'; sourceId:string; text:string}
  | {type:'delete-note'; sourceId:string}
  | {type:'record-payment'; payload:PartyPaymentPayload}
  | {type:'refund-credit'; payload:PartyRefundPayload};

const listeners = new Set<()=>void>();
let counter = 0;
const fresh = () => normalizePartyFixture(seedParties, seedLedgerEntries);
let state:PartyPreviewState = fresh();

export function getPartyPreviewSnapshot():PartyPreviewState { return state; }
export function subscribePartyPreview(listener:()=>void):()=>void {
  listeners.add(listener);
  return () => {listeners.delete(listener);};
}
export function resetPartyPreviewForTest():void { counter=0; state=fresh(); listeners.forEach(listener=>listener()); }

function checkedText(value:string,field:string):string {
  const text=value.trim();
  if (!text) throw new Error(field+' is required.');
  return text;
}
function addParty(input:PartyDraft, existing:Party[]):Party {
  const errors=validatePartyDraft(input,existing);
  if(errors.length)throw new Error(errors.join(' '));
  const id=input.id?.trim()||'party-preview-'+(++counter);
  return {
    id,
    name:input.name.trim(),
    nameBn:input.nameBn?.trim(),
    phone:input.phone.trim(),
    area:input.area.trim(),
    roles:[...input.roles],
    avatarColor:input.avatarColor??'#0D7C74',
    image:input.image,
    balance:0,
    lastActivity:'Just now',
    status:'Active'
  };
}

export function dispatchPartyPreview(command:PartyPreviewCommand):PartyPreviewState {
  let parties=state.parties;
  let sources=state.sources;
  let targetPartyId='';
  let sourceId:string|undefined;
  let before:unknown;
  let after:unknown;
  const findParty=(id:string)=> {
    const party=parties.find(p=>p.id===id);
    if(!party)throw new Error('Party not found.');
    return party;
  };
  if(command.type==='create-party'){
    const party=addParty(command.party,parties);
    parties=[...parties,party];
    targetPartyId=party.id;after=party;
  } else if(command.type==='import-parties'){
    const additions:Party[]=[];
    for(const draft of command.parties) additions.push(addParty(draft,[...parties,...additions]));
    if(!additions.length)throw new Error('No parties to import.');
    parties=[...parties,...additions];
    targetPartyId=additions[0].id;after=additions;
  } else if(command.type==='update-party'){
    const party=findParty(command.id);
    const patch={...party,...command.patch,id:party.id};
    const errors=validatePartyDraft(patch,parties,party.id);
    if(errors.length)throw new Error(errors.join(' '));
    before=party;
    after={...patch,name:patch.name.trim(),phone:patch.phone.trim(),area:patch.area.trim(),roles:[...patch.roles]};
    parties=parties.map(p=>p.id===party.id?after as Party:p);
    targetPartyId=party.id;
  } else if(command.type==='deactivate-party'){
    const party=findParty(command.id);
    if(sources.some(s=>s.partyId===party.id&&s.status==='Active'&&s.kind!=='note'))throw new Error('Cannot deactivate a party with linked transactions.');
    before=party;after={...party,status:'Inactive' as const};
    parties=parties.map(p=>p.id===party.id?after as Party:p);
    targetPartyId=party.id;
  } else if(command.type==='record-payment'||command.type==='refund-credit'){
    const isRefund=command.type==='refund-credit';
    const payload=command.payload;
    if(isRefund)validatePartyRefund(payload as PartyRefundPayload);
    else validatePartyPayment(payload as PartyPaymentPayload);
    const party=findParty(payload.partyId);
    if(!party.roles.includes(payload.relationship))throw new Error('Party does not have the selected relationship.');
    if(party.status==='Inactive')throw new Error('Inactive party cannot receive new transactions.');
    const current=payload.relationship==='Customer'
      ? customerSettlementAsOf(sources,party.id,payload.date)
      : supplierSettlementAsOf(sources,party.id,payload.date);
    const total=payload.amount;
    if(isRefund)validateCustomerRefund(current,{amount:total});
    else {
      validateCustomerPayment(current,{amount:total,discount:(payload as PartyPaymentPayload).discount,
        reason:(payload as PartyPaymentPayload).reason});
      const invoiceId=(payload as PartyPaymentPayload).invoiceId;
      if(invoiceId){
        const kind=payload.relationship==='Customer'?'sale':'purchase';
        const matching=sources.find(row=>row.partyId===party.id&&row.relationship===payload.relationship
          &&row.kind===kind&&row.status==='Active'&&row.date<=payload.date
          &&(row.reference===invoiceId||row.id===invoiceId));
        if(!matching)throw new Error('Invoice or purchase reference must belong to this party and predate payment.');
      }
    }
    const op=payload.operationId;
    if(op&&!/^[a-zA-Z0-9_-]{4,100}$/.test(op))throw new Error('Invalid operation ID.');
    const id=(isRefund?'party-refund:':'party-payment:')+(op??(++counter).toString());
    if(sources.some(row=>row.id===id))throw new Error('Duplicate payment operation; already recorded.');
    const discount=isRefund?0:(payload as PartyPaymentPayload).discount??0;
    const kind=isRefund
      ? (payload.relationship==='Customer'?'customer-credit-refund':'supplier-credit-refund')
      : (payload.relationship==='Customer'?'customer-payment':'supplier-payment');
    const debit=payload.relationship==='Customer'
      ? (isRefund?total:0)
      : (isRefund?0:total+discount);
    const credit=payload.relationship==='Customer'
      ? (isRefund?0:total+discount)
      : (isRefund?total:0);
    const source:PartySourceRecord={
      id,partyId:party.id,relationship:payload.relationship,kind,date:payload.date,
      sequence:Math.max(0,...sources.map(row=>row.sequence))+1,
      reference:id.replace('party-','').toUpperCase(),
      description:(isRefund?'Credit refunded':'Payment recorded')+' · '+party.name+
        (payload.reason?.trim()?' · '+payload.reason.trim():''),
      debit,credit,amountPaid:total,discount,provenance:'verified',
      invoiceId:!isRefund?(payload as PartyPaymentPayload).invoiceId:undefined,
      paymentSplits:payload.splits.map(row=>({...row})),
      method:payload.splits.length===1?payload.splits[0].method:'Multiple',
      accountId:payload.splits.length===1?payload.splits[0].accountId:undefined,
      status:'Active'
    };
    const proposed=[...sources,source];
    // Replay all later events after back-dated actions. A previously valid
    // refund must never become unfunded because a source changed earlier in time.
    if(payload.relationship==='Customer')customerSettlementAsOf(proposed,party.id,businessToday());
    else supplierSettlementAsOf(proposed,party.id,businessToday());
    sources=proposed;targetPartyId=party.id;sourceId=id;after=source;
  } else if(command.type==='add-note'){
    const noteParty=findParty(command.partyId);
    if(command.relationship&&!noteParty.roles.includes(command.relationship))throw new Error('Party does not have this relationship.');
    const description=checkedText(command.text,'Note');
    const note:PartySourceRecord={id:'note-preview-'+(++counter),partyId:command.partyId,
      relationship:command.relationship??noteParty.roles[0],kind:'note',date:businessToday(),
      sequence:Math.max(0,...sources.map(s=>s.sequence))+1,description,debit:0,credit:0,status:'Active'};
    sources=[...sources,note];targetPartyId=command.partyId;sourceId=note.id;after=note;
  } else if(command.type==='edit-note'||command.type==='delete-note'){
    const note=sources.find(s=>s.id===command.sourceId&&s.kind==='note'&&s.status==='Active');
    if(!note)throw new Error('Active note not found.');
    before=note;
    const updated:PartySourceRecord=command.type==='edit-note'
      ? {...note,description:checkedText(command.text,'Note')}
      : {...note,status:'Deleted'};
    after=updated;sources=sources.map(s=>s.id===note.id?updated:s);
    targetPartyId=note.partyId;sourceId=note.id;
  } else {
    throw new Error('Unsupported preview action.');
  }
  const updated:PartyPreviewState={parties,sources,revision:state.revision+1,
    audit:[...state.audit,{id:'audit-preview-'+(++counter),partyId:targetPartyId,sourceId,
      action:command.type,before,after,actor:'Preview user',at:new Date().toISOString()}]};
  state=updated;
  listeners.forEach(listener=>listener());
  return updated;
}
