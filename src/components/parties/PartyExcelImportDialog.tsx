import {useEffect,useState} from 'react';
import {toast} from 'sonner';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '../Dialog';
import {Button} from '../Button';
import {AppSelect} from '../AppSelect';
import {ImportWizard} from '../import/ImportWizard';
import {planPartyImport,resolvePartyImportDecisions,type PartyImportTarget} from '../../import/partyImport.ts';
import {commitPartyImportBatch,getPartyPreviewSnapshot} from '../../data/partyPreviewStore.ts';
import {businessToday} from '../../utils/dateRange.ts';
import type {PartyRole} from '../../types/erp.ts';
import type {StagedImportRow} from '../../import/importTypes.ts';

export function PartyExcelImportDialog({open,selectedRole,onClose,onLegacyImport}:{
 open:boolean;selectedRole:PartyRole|'All';onClose:()=>void;onLegacyImport:()=>void;
}){
 const [target,setTarget]=useState<PartyImportTarget|''>('');
 useEffect(()=>{
  if(open)setTarget(selectedRole==='Customer'?'customer':selectedRole==='Supplier'?'supplier':'');
 },[open,selectedRole]);
 const prepareRows=(rows:StagedImportRow[]):StagedImportRow[]=>{
  if(!target)return rows;
  const cleaned=rows.map(row=>({...row,issues:row.issues.filter(issue=>!['party','identity'].includes(issue.field??''))}));
  const resolved=resolvePartyImportDecisions(cleaned,target,getPartyPreviewSnapshot());
  const planned=planPartyImport(resolved,target,getPartyPreviewSnapshot(),{sessionId:'party-review',today:businessToday()});
  return resolved.map(row=>({...row,issues:[...row.issues,...planned.issues.filter(issue=>issue.sourceRow===row.sourceRow)]}));
 };
 if(!open)return null;
 if(!target)return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>
  <DialogContent className="sm:max-w-md" role="dialog" aria-label="Choose Party import type">
   <DialogHeader>
    <DialogTitle>Import customers or suppliers <span className="font-bn text-xs font-normal text-ink-500">· ডাটা ইমপোর্ট</span></DialogTitle>
    <DialogDescription>Choose one relationship. A person can be both Customer and Supplier; each opening balance remains separate.</DialogDescription>
   </DialogHeader>
   <div className="space-y-2">
    <AppSelect label="Relationship to import" value={target} onChange={value=>setTarget(value as PartyImportTarget)}
     placeholder="Choose customer or supplier" options={[
      {value:'customer',label:'Customers · ক্রেতা'},
      {value:'supplier',label:'Suppliers · সরবরাহকারী'}
     ]}/>
    <p className="text-xs text-ink-500">Imported opening balances never move Cash, Bank or Mobile Banking accounts.</p>
   </div>
   <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-3">
    <Button variant="outline" onClick={onClose}>Cancel</Button>
    <Button variant="outline" onClick={onLegacyImport}>Legacy multi-role CSV</Button>
   </div>
  </DialogContent>
 </Dialog>;
 return <ImportWizard target={target} open={open} onClose={onClose} prepareRows={prepareRows}
  onApply={async(rows,sessionId)=>{
   const snapshot=getPartyPreviewSnapshot();
   const cleaned=rows.map(row=>({...row,issues:row.issues.filter(issue=>issue.field!=='party')}));
   const resolved=resolvePartyImportDecisions(cleaned,target,snapshot);
   const plan=planPartyImport(resolved,target,snapshot,{sessionId,today:businessToday()});
   if(plan.issues.length){
    const errors=plan.issues.filter(issue=>issue.severity==='error');
    if(errors.length)throw new Error(errors.slice(0,3).map(issue=>'Row '+issue.sourceRow+': '+issue.message).join(' • ')+
     (errors.length>3?' ('+errors.length+' errors)':''));
   }
   const result=commitPartyImportBatch(plan);
   toast.success(target==='customer'?'Customer import applied to preview':'Supplier import applied to preview',
    {description:result.created+' created · '+result.roleAdded+' roles added · '+result.openingSources+' openings'});
   return result;
  }}/>;
}
