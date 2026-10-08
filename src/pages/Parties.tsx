import React, { useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { PartyDirectory } from '../components/parties/PartyDirectory';
import { PartyDetail } from '../components/parties/PartyDetail';
import { PartyEditorDialog } from '../components/parties/PartyEditorDialog';
import { PartyImportDialog } from '../components/parties/PartyImportDialog';
import { getPartyPreviewSnapshot, subscribePartyPreview, dispatchPartyPreview } from '../data/partyPreviewStore';
import { matchesPartySearch, resolvePartySelection } from '../utils/partyIdentity';
import type { Party, PartyRole, LedgerEntry, LedgerEntryType } from '../types/erp';
import type { PartyDraft, PartyLedgerSource } from '../types/partyLedger';
import { taka } from '../utils/currency';

const ledgerType = (kind:PartyLedgerSource): LedgerEntryType => {
  if(kind==='sale')return 'invoice';
  if(kind==='purchase')return 'purchase';
  if(kind==='opening')return 'opening';
  if(kind==='note')return 'note';
  if(kind.endsWith('return')||kind==='customer-credit-refund')return 'return';
  return 'payment';
};
const displayDate=(iso:string)=>new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'})
  .format(new Date(iso+'T12:00:00Z'));

export function Parties() {
  const [params,setParams]=useSearchParams();
  const [role,setRole]=useState<PartyRole|'All'>('All');
  const [query,setQuery]=useState('');
  const [editing,setEditing]=useState<Party|null|undefined>(undefined);
  const [importOpen,setImportOpen]=useState(false);
  const state=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
  const allParties=state.parties;
  const selected=resolvePartySelection(allParties,params.get('id')??undefined,params.get('role')??undefined);
  const party=selected?allParties.find(p=>p.id===selected.partyId):undefined;
  const relationship=selected?.relationship;
  const filtered=allParties.filter(p=>(role==='All'||p.roles.includes(role))&&matchesPartySearch(p,query));
  const partyEntries:LedgerEntry[]=party&&relationship?state.sources
    .filter(source=>source.partyId===party.id&&source.relationship===relationship&&source.status==='Active')
    .sort((a,b)=>a.date.localeCompare(b.date)||a.sequence-b.sequence)
    .map(source=>({id:source.id,partyId:source.partyId,date:displayDate(source.date),
      type:ledgerType(source.kind),ref:source.reference,description:source.description,
      debit:source.debit,credit:source.credit})):[];

  const receivable=allParties.filter(p=>p.balance>0).reduce((s,p)=>s+p.balance,0);
  const payable=allParties.filter(p=>p.balance<0).reduce((s,p)=>s-p.balance,0);
  const selectParty=(id:string)=>{
    const target=allParties.find(p=>p.id===id);
    if(target)setParams({id,role:target.roles.includes(relationship as PartyRole)?relationship!:target.roles[0]});
  };
  const saveParty=(draft:PartyDraft)=>{
    if(editing)dispatchPartyPreview({type:'update-party',id:editing.id,patch:draft});
    else {
      const previous=new Set(allParties.map(p=>p.id));
      const next=dispatchPartyPreview({type:'create-party',party:draft});
      const created=next.parties.find(p=>!previous.has(p.id));
      if(created)setParams({id:created.id,role:created.roles[0]});
    }
    toast.success(editing?'Party updated in preview':'Party added to preview');
  };
  const changeRole=(next:PartyRole)=>{if(party)setParams({id:party.id,role:next});};
  const noteAction=(type:'add'|'edit'|'delete',idOrText:string,text?:string)=>{
    try {
      if(type==='add'&&party)dispatchPartyPreview({type:'add-note',partyId:party.id,relationship,text:idOrText});
      if(type==='edit')dispatchPartyPreview({type:'edit-note',sourceId:idOrText,text:text??''});
      if(type==='delete')dispatchPartyPreview({type:'delete-note',sourceId:idOrText});
    }catch(error){toast.error(error instanceof Error?error.message:'Note action failed');throw error;}
  };
  return <div className="mx-auto max-w-[1440px] space-y-4">
    <PageHeader title="Parties & Ledger" titleBn="পার্টি ও খাতা"
      description={`Everyone you deal with, in one place · Directory receivables ${taka(receivable)} · payables ${taka(payable)} · preview`}
      actions={<>
        <Button variant="outline" size="sm" onClick={()=>setImportOpen(true)}>
          <Upload className="size-4"/> Import CSV
        </Button>
        <Button size="sm" onClick={()=>setEditing(null)}><Plus className="size-4"/> Add party</Button>
      </>} />
    <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
      <PartyDirectory parties={filtered} selectedId={party?.id??''} onSelect={selectParty}
        role={role} onRole={setRole} query={query} onQuery={setQuery}/>
      {party&&relationship?<PartyDetail key={party.id+'-'+relationship} party={party} entries={partyEntries}
        relationship={relationship} onRoleChange={changeRole}
        onEditParty={()=>setEditing(party)}
        onAddNote={text=>noteAction('add',text)}
        onEditNote={(id,text)=>noteAction('edit',id,text)}
        onDeleteNote={id=>noteAction('delete',id)}/>:
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-ink-500">No parties yet. Add your first party.</div>}
    </div>
    <PartyEditorDialog open={editing!==undefined} party={editing} onClose={()=>setEditing(undefined)} onSave={saveParty}/>
    <PartyImportDialog open={importOpen} onClose={()=>setImportOpen(false)} onImport={parties=>{dispatchPartyPreview({type:"import-parties",parties});toast.success(`${parties.length} parties imported to preview`);}}/>
  </div>;
}
