import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { PartyDirectory } from '../components/parties/PartyDirectory';
import { PartyDetail } from '../components/parties/PartyDetail';
import {getVendorPreviewSnapshot,subscribeVendorPreview} from '../vendor/vendorPreviewStore';
import {projectVendorPartyProfile} from '../vendor/vendorPartyProjection';
import {vendorWorkLink,type VendorWorkTab} from '../vendor/vendorRoute';
import { PartyEditorDialog } from '../components/parties/PartyEditorDialog';
import { PartyImportDialog } from '../components/parties/PartyImportDialog';
import {PartyExcelImportDialog} from '../components/parties/PartyExcelImportDialog';
import { getPartyPreviewSnapshot, subscribePartyPreview, dispatchPartyPreview } from '../data/partyPreviewStore';
import { availableParties } from '../data/erpDemoStore';
import { matchesPartySearch, resolvePartySelection } from '../utils/partyIdentity';
import type { Party, PartyRole, LedgerEntry, LedgerEntryType } from '../types/erp';
import type { PartyDraft, PartyLedgerSource, PartyLedgerRow, PartyAction, PartyOpeningPayload } from '../types/partyLedger';
import { projectPartyStatement, pagedStatementRows, computePartyBalanceSummary } from '../utils/partyLedger';
import { ledgerActionAvailability, partySourceRoute } from '../utils/partyActions';
import { demoPermissions } from '../utils/permissions';
import type { IsoRange } from '../utils/dateRange';
import { taka } from '../utils/currency';
import { isPartyOpening } from '../utils/partyOpening';

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
  const navigate=useNavigate();
  const [range,setRange]=useState<IsoRange>({from:'',to:''});
  const [kind,setKind]=useState('All types');
  const [ledgerQuery,setLedgerQuery]=useState('');
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(25);
  const [statementOpen,setStatementOpen]=useState(false);
  const [role,setRole]=useState<PartyRole|'All'>('All');
  const routeRole=params.get('role'),routeGroup=params.get('group'),routeId=params.get('id');
  useEffect(()=>{
   if(routeId)return;
   const known:PartyRole[]=['Customer','Supplier','Vendor','Lender','Borrower','Owner','Payee'];
   setRole(routeGroup?'All':known.includes(routeRole as PartyRole)?routeRole as PartyRole:'All');
  },[routeRole,routeGroup,routeId]);
  const [query,setQuery]=useState('');
  const [editing,setEditing]=useState<Party|null|undefined>(undefined);
  const [importOpen,setImportOpen]=useState(false);
  const [legacyImportOpen,setLegacyImportOpen]=useState(false);
  const state=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
  const vendorState=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);
  const allParties=availableParties();
  const selected=resolvePartySelection(allParties,params.get('id')??undefined,params.get('role')??undefined);
  const party=selected?allParties.find(p=>p.id===selected.partyId):undefined;
  const relationship=selected?.relationship;
  const vendorProfile=party&&relationship==='Vendor'
   ?projectVendorPartyProfile(vendorState,availablePurchases(),party.id,range):undefined;
  const filtered=allParties.filter(p=>(routeGroup==='loans'?p.roles.some(r=>r==='Lender'||r==='Borrower')
    :routeGroup==='owners'?p.roles.some(r=>r==='Owner'||r==='Payee')
    :role==='All'||p.roles.includes(role))&&matchesPartySearch(p,query))
    .map(p=>({...p,balance:role!=='All'
      ?computePartyBalanceSummary(state,p.id,role).netBalance
      :p.roles.length===1?computePartyBalanceSummary(state,p.id,p.roles[0]).netBalance:0}));
  const partyEntries:LedgerEntry[]=party&&relationship?state.sources
    .filter(source=>source.partyId===party.id&&source.relationship===relationship&&source.status==='Active')
    .sort((a,b)=>a.date.localeCompare(b.date)||a.sequence-b.sequence)
    .map(source=>({id:source.id,partyId:source.partyId,date:displayDate(source.date),
      type:ledgerType(source.kind),ref:source.reference,description:source.description,
      debit:source.debit,credit:source.credit})):[];

  const normalizedRows:PartyLedgerRow[]=state.sources.map(source=>({
    id:source.id,partyId:source.partyId,relationship:source.relationship,
    source:source.kind,sourceId:source.id,reference:source.reference,
    date:source.date,description:source.description,debit:source.debit,credit:source.credit,
    sequence:source.sequence,status:source.status,amountPaid:source.amountPaid,
    discount:source.discount,method:source.method,accountId:source.accountId,financeType:source.financeType
  }));
  const statement=party&&relationship
    ? projectPartyStatement(normalizedRows,party.id,relationship,range)
    : null;
  const summary=party&&relationship
    ? computePartyBalanceSummary(state,party.id,relationship) : null;
  const searched=statement
    ? statement.rows.filter(row=>(kind==='All types'||row.source===kind)
      &&[row.reference,row.description,row.source].some(value=>String(value??'').toLowerCase().includes(ledgerQuery.toLowerCase().trim())))
    : [];
  const filteredStatement=statement?{...statement,rows:searched}:null;
  const visibleRows=filteredStatement
    ? pagedStatementRows(filteredStatement,page,pageSize,true) : [];
  const totalPages=Math.max(1,Math.ceil(searched.length/pageSize));
  const actionsForRow=(row:PartyLedgerRow)=>ledgerActionAvailability(row,demoPermissions,new Set<PartyAction>(
    row.source==='sale'?['view','source','edit']
      :row.sourceId?.startsWith('party-payment:')?['view','edit','delete']
      :row.sourceId?.startsWith('party-refund:')?['view','delete']
      :row.sourceId?.startsWith('party-finance:')?['view','reverse']:['view']
  ));
  const resetLedger=()=>{setRange({from:'',to:''});setKind('All types');setLedgerQuery('');setPage(1);};
  const handleLedgerAction=(action:PartyAction,row:PartyLedgerRow)=>{
    if((action==='edit'||action==='source')&&partySourceRoute(row)){
      navigate(partySourceRoute(row)!);
    }else if(action==='view'){
      // A read-only dialog in PartyDetail handles the source record.
    }else{
      toast.error('This transaction action is not connected to a source editor yet.');
    }
  };

  // Sum each relationship separately; a customer receivable must never
  // silently offset the same party's supplier payable.
  const balances=allParties.flatMap(p=>p.roles.map(r=>computePartyBalanceSummary(state,p.id,r).netBalance));
  const receivable=balances.filter(n=>n>0).reduce((s,n)=>s+n,0);
  const payable=balances.filter(n=>n<0).reduce((s,n)=>s-n,0);
  const selectParty=(id:string)=>{
    const target=allParties.find(p=>p.id===id);
    if(target){setParams({id,role:target.roles.includes(relationship as PartyRole)?relationship!:target.roles[0]});resetLedger();}
  };
  const saveParty=(draft:PartyDraft,openings:Omit<PartyOpeningPayload,'partyId'>[])=>{
    if(editing)dispatchPartyPreview({type:'update-party',id:editing.id,patch:draft,openings});
    else {
      const previous=new Set(allParties.map(p=>p.id));
      const next=dispatchPartyPreview({type:'create-party',party:draft,openings});
      const created=next.parties.find(p=>!previous.has(p.id));
      if(created)setParams({id:created.id,role:created.roles[0]});
    }
    toast.success(editing?'Party updated in preview':'Party added to preview');
  };
  const changeRole=(next:PartyRole)=>{if(party){setParams({id:party.id,role:next});resetLedger();}};
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
          <Upload className="size-4"/> Import Excel / CSV
        </Button>
        <Button size="sm" onClick={()=>setEditing(null)}><Plus className="size-4"/> Add party</Button>
      </>} />
    <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
      <PartyDirectory parties={filtered} selectedId={party?.id??''} onSelect={selectParty}
        role={role} onRole={value=>{
         setRole(value);const next=new URLSearchParams(params);next.delete('group');next.delete('id');
         if(value==='All')next.delete('role');else next.set('role',value);setParams(next);
        }} query={query} onQuery={setQuery}/>
      {party&&relationship?<PartyDetail key={party.id+'-'+relationship} party={party} entries={partyEntries}
        vendorProfile={vendorProfile}
        onOpenVendorWork={(tab?:VendorWorkTab,sourceId?:string)=>
          navigate(vendorWorkLink(party.id,tab,sourceId))}
        relationship={relationship} onRoleChange={changeRole}
        onEditParty={()=>setEditing(party)}
        statement={statement!} balanceSummary={summary!} visibleRows={visibleRows}
        range={range} onRange={next=>{setRange(next);setPage(1);}}
        kind={kind} onKind={value=>{setKind(value);setPage(1);}}
        ledgerQuery={ledgerQuery} onLedgerQuery={value=>{setLedgerQuery(value);setPage(1);}}
        pageSize={pageSize} onPageSize={value=>{setPageSize(value);setPage(1);}}
        onResetLedger={resetLedger} onStatement={()=>setStatementOpen(true)}
        page={page} pages={totalPages} onPage={setPage}
        actionsForRow={actionsForRow} onLedgerAction={handleLedgerAction}
        statementOpen={statementOpen} onCloseStatement={()=>setStatementOpen(false)}
        sources={state.sources}
        onRecordPayment={payload=>{dispatchPartyPreview({type:'record-payment',payload});toast.success('Payment recorded in preview (no bank posting)');}}
        onRefundCredit={payload=>{dispatchPartyPreview({type:'refund-credit',payload});toast.success('Credit refund recorded in preview (no bank posting)');}}
        onRecordFinance={payload=>{dispatchPartyPreview({type:'record-finance',payload});toast.success('Capital / loan transaction saved in preview (no bank posting)');}}
        onSetOpening={payload=>{dispatchPartyPreview({type:'set-opening',payload});toast.success('Opening balance updated in preview; previous amount retained in audit');}}
        onEditSourcePayment={(sourceId,payload,reason)=>{
          dispatchPartyPreview({type:'edit-source-payment',sourceId,payload,reason});
          toast.success('Preview payment corrected; dependent balances recalculated');
        }}
        onReverseSource={(sourceId,reason)=>{
          dispatchPartyPreview({type:'reverse-source',sourceId,reason});
          toast.success('Preview transaction reversed with an audit record');
        }}
        onAddNote={text=>noteAction('add',text)}
        onEditNote={(id,text)=>noteAction('edit',id,text)}
        onDeleteNote={id=>noteAction('delete',id)}/>:
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-ink-500">No parties yet. Add your first party.</div>}
    </div>
    <PartyEditorDialog open={editing!==undefined} party={editing}
      existingOpenings={editing?.id?state.sources.filter(source=>source.partyId===editing.id&&source.status==='Active'&&isPartyOpening(source)):[]}
      onClose={()=>setEditing(undefined)} onSave={saveParty}/>
    <PartyExcelImportDialog open={importOpen} selectedRole={role} onClose={()=>setImportOpen(false)}
      onLegacyImport={()=>{setImportOpen(false);setLegacyImportOpen(true);}}/>
    <PartyImportDialog open={legacyImportOpen} onClose={()=>setLegacyImportOpen(false)}
      onImport={parties=>{dispatchPartyPreview({type:"import-parties",parties});
        toast.success(`${parties.length} legacy parties imported to preview`);}}/>
  </div>;
}
