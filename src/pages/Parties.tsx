import {matchesSearch as fuzzyMatch} from '../utils/fuzzySearch';
import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/Dialog';
import { PartyAvatar } from '../components/PartyAvatar';
import {useUiCopy} from '../i18n/useUiCopy';
import { PartyDirectory } from '../components/parties/PartyDirectory';
import { PartyDetail } from '../components/parties/PartyDetail';
import {getVendorPreviewSnapshot,subscribeVendorPreview} from '../vendor/vendorPreviewStore';
import {projectVendorPartyProfile} from '../vendor/vendorPartyProjection';
import {vendorWorkLink,type VendorWorkTab} from '../vendor/vendorRoute';
import { PartyEditorDialog } from '../components/parties/PartyEditorDialog';
import { PartyImportDialog } from '../components/parties/PartyImportDialog';
import {PartyExcelImportDialog} from '../components/parties/PartyExcelImportDialog';
import { getPartyPreviewSnapshot, subscribePartyPreview, dispatchPartyPreview } from '../data/partyPreviewStore';
import { availableParties, availablePurchases } from '../data/erpDemoStore';
import { matchesPartySearch, resolvePartySelection } from '../utils/partyIdentity';
import type { Party, PartyRole, LedgerEntry, LedgerEntryType } from '../types/erp';
import type { PartyDraft, PartyLedgerSource, PartyLedgerRow, PartyAction, PartyOpeningPayload } from '../types/partyLedger';
import { projectPartyStatement, pagedStatementRows, computePartyBalanceSummary } from '../utils/partyLedger';
import { ledgerActionAvailability, partySourceRoute } from '../utils/partyActions';
import { demoPermissions } from '../utils/permissions';
import { businessToday, type IsoRange } from '../utils/dateRange';
import { taka } from '../utils/currency';
import { isPartyOpening } from '../utils/partyOpening';
import type { PartyWorkspaceContext } from '../utils/partyNavigation';

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
  const {text:uiText}=useUiCopy();
  const [params,setParams]=useSearchParams();
  const navigate=useNavigate();
  const location=useLocation();
  const returnState=location.state as {hisabiqSource?:string;partyWorkspace?:PartyWorkspaceContext}|null;
  const restored=returnState?.hisabiqSource==='party-pos-return'?returnState.partyWorkspace:undefined;
  const [range,setRange]=useState<IsoRange>(restored?.range??{from:'',to:''});
  const [kind,setKind]=useState(restored?.kind??'All types');
  const [ledgerQuery,setLedgerQuery]=useState(restored?.ledgerQuery??'');
  const [page,setPage]=useState(restored?.page??1);
  const [pageSize,setPageSize]=useState(restored?.pageSize??25);
  const [statementOpen,setStatementOpen]=useState(false);
  const [role,setRole]=useState<PartyRole|'All'>(restored?.role??'All');
  const routeRole=params.get('role'),routeGroup=params.get('group'),routeId=params.get('id');
  useEffect(()=>{
   if(routeId)return;
   const known:PartyRole[]=['Customer','Supplier','Vendor','Lender','Borrower','Owner','Payee'];
   setRole(routeGroup?'All':known.includes(routeRole as PartyRole)?routeRole as PartyRole:'All');
  },[routeRole,routeGroup,routeId]);
  const [query,setQuery]=useState(restored?.query??'');
  const [chooserOpen,setChooserOpen]=useState(false);
  useLayoutEffect(()=>{
    if(!restored)return;
    const frame=requestAnimationFrame(()=>{
      window.scrollTo(0,restored.scrollY);
      const list=document.querySelector('[data-party-directory-list]');
      if(list)list.scrollTop=restored.directoryScrollTop;
    });
    return()=>cancelAnimationFrame(frame);
  },[restored]);
  const [editing,setEditing]=useState<Party|null|undefined>(undefined);
  const [importOpen,setImportOpen]=useState(false);
  const [legacyImportOpen,setLegacyImportOpen]=useState(false);
  const state=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
  const vendorState=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);
  const allParties=availableParties();
  const selected=resolvePartySelection(allParties,params.get('id')??undefined,params.get('role')??undefined);
  const party=selected?allParties.find(p=>p.id===selected.partyId):undefined;
  const relationship=selected?.relationship;
  const completeVendorRange=Boolean(range.from)===Boolean(range.to)?range:{from:'',to:''};
  const vendorProfile=party&&relationship==='Vendor'
   ?projectVendorPartyProfile(vendorState,availablePurchases(),party.id,completeVendorRange):undefined;
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
      &&fuzzyMatch(ledgerQuery,[row.reference,row.description,row.source]))
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
      toast.error(uiText('This transaction action is not connected to a source editor yet.','এই লেনদেন সংশোধনের কাজটি এখনো চালু হয়নি।'));
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
  const changeDirectoryRole=(value:PartyRole|'All')=>{
    setRole(value);
    const next=new URLSearchParams(params);
    next.delete('group');next.delete('id');
    if(value==='All')next.delete('role');else next.set('role',value);
    setParams(next);
  };
  const chooseParty=(id:string)=>{selectParty(id);setChooserOpen(false);};
  const saveParty=(draft:PartyDraft,openings:Omit<PartyOpeningPayload,'partyId'>[])=>{
    if(editing)dispatchPartyPreview({type:'update-party',id:editing.id,patch:draft,openings});
    else {
      const previous=new Set(allParties.map(p=>p.id));
      const next=dispatchPartyPreview({type:'create-party',party:draft,openings});
      const created=next.parties.find(p=>!previous.has(p.id));
      if(created)setParams({id:created.id,role:created.roles[0]});
    }
    toast.success(editing?uiText('Party updated in preview','প্রিভিউতে পার্টির তথ্য বদলানো হয়েছে'):uiText('Party added to preview','প্রিভিউতে নতুন পার্টি যোগ হয়েছে'));
  };
  const changeRole=(next:PartyRole)=>{if(party){setParams({id:party.id,role:next});resetLedger();}};
  const noteAction=(type:'add'|'edit'|'delete',idOrText:string,text?:string)=>{
    try {
      if(type==='add'&&party)dispatchPartyPreview({type:'add-note',partyId:party.id,relationship,text:idOrText});
      if(type==='edit')dispatchPartyPreview({type:'edit-note',sourceId:idOrText,text:text??''});
      if(type==='delete')dispatchPartyPreview({type:'delete-note',sourceId:idOrText});
    }catch(error){toast.error(error instanceof Error?error.message:uiText('Note action failed','নোটের কাজ করা যায়নি'));throw error;}
  };
  return <div className="mx-auto min-w-0 max-w-[1440px] space-y-3 sm:space-y-4">
    <div className="hidden sm:block"><PageHeader title="Parties & Ledger" titleBn="পার্টি ও খাতা"
      description={`${uiText('Everyone you deal with, in one place','যাদের সঙ্গে লেনদেন করেন, সবাই এক জায়গায়')} · ${uiText('Directory receivables','মোট পাওনা')} ${taka(receivable)} · ${uiText('payables','মোট দেনা')} ${taka(payable)} · ${uiText('preview','নমুনা')}`}
      actions={<>
        <Button variant="outline" size="sm" onClick={()=>setImportOpen(true)}>
          <Upload className="size-4"/> {uiText('Import Excel / CSV','এক্সেল / CSV থেকে আনুন')}
        </Button>
        <Button size="sm" onClick={()=>setEditing(null)}><Plus className="size-4"/> {uiText('Add party','নতুন পার্টি যোগ করুন')}</Button>
      </>} /></div>
    <div className="flex items-center justify-between gap-2 sm:hidden">
      <h1 className="min-w-0 text-lg font-semibold text-ink">{uiText('Parties & Ledger','পার্টি ও খাতা')}</h1>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button size="sm" variant="outline" onClick={()=>setImportOpen(true)} aria-label={uiText('Import Excel / CSV','এক্সেল / CSV থেকে আনুন')}><Upload className="size-4" /></Button>
        <Button size="sm" aria-label={uiText('Add party','নতুন পার্টি যোগ করুন')} onClick={()=>setEditing(null)}><Plus className="size-4" /> <span aria-hidden="true">{uiText('Add party','নতুন পার্টি')}</span></Button>
      </div>
    </div>
    {party&&<button type="button" aria-label={uiText('Change party','পার্টি বদলান')} aria-haspopup="dialog" aria-expanded={chooserOpen}
      onClick={()=>setChooserOpen(true)} className="flex min-h-14 w-full min-w-0 items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left shadow-card transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 lg:hidden">
      <PartyAvatar name={party.name} color={party.avatarColor} image={party.image} size={36} />
      <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-ink">{party.name}</strong><span className="block truncate text-xs text-ink-500">{party.phone} · {uiText('Change party','পার্টি বদলান')}</span></span>
      <ChevronDown className="size-5 shrink-0 text-ink-500" aria-hidden="true" />
    </button>}
    <div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="hidden min-w-0 lg:block"><PartyDirectory parties={filtered} selectedId={party?.id??''} onSelect={selectParty}
        role={role} onRole={changeDirectoryRole} query={query} onQuery={setQuery}/></div>
      {party&&relationship?<PartyDetail key={party.id+'-'+relationship} party={party} entries={partyEntries}
        vendorProfile={vendorProfile}
        onOpenVendorWork={(tab?:VendorWorkTab,sourceId?:string)=>
          navigate(vendorWorkLink(party.id,tab,sourceId))}
        relationship={relationship} onRoleChange={changeRole}
        onEditParty={()=>setEditing(party)}
        onNewInvoice={()=>navigate(`/app/pos?partyId=${encodeURIComponent(party.id)}`,{
          state:{hisabiqSource:'party-profile',returnTo:`${location.pathname}${location.search}`,
            partyWorkspace:{range,kind,ledgerQuery,page,pageSize,role,query,scrollY:window.scrollY,
              directoryScrollTop:document.querySelector('[data-party-directory-list]')?.scrollTop??0} satisfies PartyWorkspaceContext}
        })}
        statement={statement!} balanceSummary={summary!} visibleRows={visibleRows}
        range={range} onRange={next=>{
          const today=businessToday();
          if(next.from>today){toast.error(uiText('Choose a statement start date up to today.','বিবরণের শুরুর তারিখ আজ বা তার আগে বাছুন।'));return;}
          setRange({...next,to:next.to>today?today:next.to});setPage(1);
        }}
        kind={kind} onKind={value=>{setKind(value);setPage(1);}}
        ledgerQuery={ledgerQuery} onLedgerQuery={value=>{setLedgerQuery(value);setPage(1);}}
        pageSize={pageSize} onPageSize={value=>{setPageSize(value);setPage(1);}}
        onResetLedger={resetLedger} onStatement={()=>setStatementOpen(true)}
        page={page} pages={totalPages} onPage={setPage}
        actionsForRow={actionsForRow} onLedgerAction={handleLedgerAction}
        statementOpen={statementOpen} onCloseStatement={()=>setStatementOpen(false)}
        sources={state.sources}
        onRecordPayment={payload=>{dispatchPartyPreview({type:'record-payment',payload});toast.success(uiText('Payment recorded in preview (no bank posting)','প্রিভিউতে টাকা জমা রাখা হয়েছে। ব্যাংকে এন্ট্রি হয়নি।'));}}
        onRefundCredit={payload=>{dispatchPartyPreview({type:'refund-credit',payload});toast.success(uiText('Credit refund recorded in preview (no bank posting)','প্রিভিউতে জমা টাকা ফেরত দেখানো হয়েছে। ব্যাংকে এন্ট্রি হয়নি।'));}}
        onRecordFinance={payload=>{dispatchPartyPreview({type:'record-finance',payload});toast.success(uiText('Capital / loan transaction saved in preview (no bank posting)','প্রিভিউতে মূলধন / ধার লেনদেন রাখা হয়েছে। ব্যাংকে এন্ট্রি হয়নি।'));}}
        onSetOpening={payload=>{dispatchPartyPreview({type:'set-opening',payload});toast.success(uiText('Opening balance updated in preview; previous amount retained in audit','প্রিভিউতে শুরুর জের বদলেছে। আগের টাকার হিসাব ইতিহাসে আছে।'));}}
        onEditSourcePayment={(sourceId,payload,reason)=>{
          dispatchPartyPreview({type:'edit-source-payment',sourceId,payload,reason});
          toast.success(uiText('Preview payment corrected; dependent balances recalculated','প্রিভিউতে জমার তথ্য ঠিক হয়েছে। সংশ্লিষ্ট জের আবার হিসাব করা হয়েছে।'));
        }}
        onReverseSource={(sourceId,reason)=>{
          dispatchPartyPreview({type:'reverse-source',sourceId,reason});
          toast.success(uiText('Preview transaction reversed with an audit record','প্রিভিউতে লেনদেন উল্টানো হয়েছে। ইতিহাসে তথ্য রাখা আছে।'));
        }}
        onAddNote={text=>noteAction('add',text)}
        onEditNote={(id,text)=>noteAction('edit',id,text)}
        onDeleteNote={id=>noteAction('delete',id)}/>:
        <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-ink-500">{uiText('No parties yet. Add your first party.','এখনো কোনো পার্টি নেই। নতুন পার্টি যোগ করুন।')}</div>}
    </div>
    <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
      <DialogContent aria-label={uiText('Change party','পার্টি বদলান')} className="flex max-h-[90dvh] w-[calc(100vw-1rem)] flex-col overflow-hidden p-0 sm:max-w-lg lg:hidden">
        <DialogHeader className="shrink-0 border-b border-border px-4 py-3">
          <DialogTitle>{uiText('Change party','পার্টি বদলান')}</DialogTitle>
          <DialogDescription>{uiText('Search by name or phone, then choose a party.','নাম বা ফোন দিয়ে খুঁজে পার্টি বাছুন।')}</DialogDescription>
        </DialogHeader>
        <PartyDirectory picker parties={filtered} selectedId={party?.id??''} onSelect={chooseParty}
          role={role} onRole={changeDirectoryRole} query={query} onQuery={setQuery}/>
        <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-border p-3">
          <Button size="sm" variant="outline" className="min-h-11 whitespace-normal" onClick={()=>{setChooserOpen(false);setImportOpen(true);}}><Upload className="size-4 shrink-0" />{uiText('Import Excel / CSV','এক্সেল / CSV থেকে আনুন')}</Button>
          <Button size="sm" className="min-h-11" onClick={()=>{setChooserOpen(false);setEditing(null);}}><Plus className="size-4 shrink-0" />{uiText('Add party','নতুন পার্টি যোগ করুন')}</Button>
        </div>
      </DialogContent>
    </Dialog>
    <PartyEditorDialog open={editing!==undefined} party={editing}
      existingOpenings={editing?.id?state.sources.filter(source=>source.partyId===editing.id&&source.status==='Active'&&isPartyOpening(source)):[]}
      onClose={()=>setEditing(undefined)} onSave={saveParty}/>
    <PartyExcelImportDialog open={importOpen} selectedRole={role} onClose={()=>setImportOpen(false)}
      onLegacyImport={()=>{setImportOpen(false);setLegacyImportOpen(true);}}/>
    <PartyImportDialog open={legacyImportOpen} onClose={()=>setLegacyImportOpen(false)}
      onImport={parties=>{dispatchPartyPreview({type:"import-parties",parties});
        toast.success(`${parties.length} ${uiText('legacy parties imported to preview','টি পুরোনো পার্টি প্রিভিউতে আনা হয়েছে')}`);}}/>
  </div>;
}
