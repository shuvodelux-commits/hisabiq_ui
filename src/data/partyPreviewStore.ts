import { parties as seedParties, ledgerEntries as seedLedgerEntries } from './parties.ts';
import { normalizePartyFixture } from './partyFixtureAdapter.ts';
import { validatePartyDraft } from '../utils/partyIdentity.ts';
import { businessToday } from '../utils/dateRange.ts';
import type { Party } from '../types/erp';
import type { PartyDraft, PartyPreviewState, PartySourceRecord } from '../types/partyLedger';

export type PartyPreviewCommand =
  | {type:'create-party'; party:PartyDraft}
  | {type:'import-parties'; parties:PartyDraft[]}
  | {type:'update-party'; id:string; patch:Partial<PartyDraft>}
  | {type:'deactivate-party'; id:string}
  | {type:'add-note'; partyId:string; text:string}
  | {type:'edit-note'; sourceId:string; text:string}
  | {type:'delete-note'; sourceId:string};

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
  } else if(command.type==='add-note'){
    findParty(command.partyId);
    const description=checkedText(command.text,'Note');
    const note:PartySourceRecord={id:'note-preview-'+(++counter),partyId:command.partyId,
      relationship:findParty(command.partyId).roles[0],kind:'note',date:businessToday(),
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
