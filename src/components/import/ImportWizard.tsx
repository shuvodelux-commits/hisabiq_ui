import {useEffect,useRef,useState} from 'react';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '../Dialog';
import {Button} from '../Button';
import {ImportUploadStep} from './ImportUploadStep';
import {ImportMappingStep} from './ImportMappingStep';
import {ImportReviewStep} from './ImportReviewStep';
import {ImportFinishStep} from './ImportFinishStep';
import {suggestColumnMapping,mapImportRows} from '../../import/columnMapping.ts';
import type {ImportTarget,ImportStep,ImportTable,ColumnMapping,StagedImportRow,ImportResult} from '../../import/importTypes.ts';

const order:ImportStep[]=['upload','map','review','finish'];
const labels:{[K in ImportStep]:string}={upload:'Upload',map:'Map columns',review:'Review',finish:'Finish'};
export function ImportWizard({target,open,onClose,onApply,prepareRows}:{
 target:ImportTarget;open:boolean;onClose:()=>void;
 onApply?:(rows:StagedImportRow[],sessionId:string)=>Promise<ImportResult>;
 prepareRows?:(rows:StagedImportRow[])=>StagedImportRow[];
}){
 const [step,setStep]=useState<ImportStep>('upload');
 const [tables,setTables]=useState<ImportTable[]>([]);
 const [sheet,setSheet]=useState('');
 const [mapping,setMapping]=useState<ColumnMapping>({});
 const [rows,setRows]=useState<StagedImportRow[]>([]);
 const [result,setResult]=useState<ImportResult|null>(null);
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const headerRef=useRef<HTMLHeadingElement>(null);
 const current=tables.find(t=>t.sheet===sheet)??tables[0]??null;
 useEffect(()=>{if(open){setStep('upload');setTables([]);setSheet('');setMapping({});setRows([]);setResult(null);setError('');}},[open,target]);
 useEffect(()=>{if(open)headerRef.current?.focus();},[open,step]);
 const selectSheet=(name:string)=>{
  const table=tables.find(t=>t.sheet===name);if(!table)return;
  setSheet(name);setMapping(suggestColumnMapping(target,table.headers).mapping);setRows([]);setError('');
 };
 const read=(next:ImportTable[])=>{
  setTables(next);const chosen=next.find(t=>t.headers.length>0)??next[0];
  setSheet(chosen?.sheet??'');setMapping(chosen?suggestColumnMapping(target,chosen.headers).mapping:{});
  setRows([]);setError('');
 };
 const next=async()=>{
  setError('');
  if(step==='upload'){
   if(!current||!current.headers.length){setError('Select a file with at least one heading row.');return;}
   setStep('map');return;
  }
  if(step==='map'){
   if(!current)return;
   try{if(!rows.length){const mapped=mapImportRows(current,mapping);setRows(prepareRows?prepareRows(mapped):mapped);}setStep('review');}
   catch(e){setError(e instanceof Error?e.message:'Invalid column mapping.');}
   return;
  }
  if(step==='review'&&onApply){
   if(!rows.some(row=>row.decision!=='skip'&&row.decision!=='reject')){setError('Select at least one valid row to import.');return;}
   setBusy(true);
   try{
    const outcome=await onApply(rows,globalThis.crypto?.randomUUID?.()??String(Date.now()));
    setResult(outcome);setStep('finish');
   }catch(e){setError(e instanceof Error?e.message:'Import was not applied.');}
   finally{setBusy(false);}
  }
 };
 const previous=()=>{const index=order.indexOf(step);if(index>0){setStep(order[index-1]);setError('');}};
 const restart=()=>{setStep('upload');setTables([]);setSheet('');setMapping({});setRows([]);setResult(null);setError('');};
 const title=target==='product'?'Import products':target==='customer'?'Import customers':'Import suppliers';
 return <Dialog open={open} onOpenChange={value=>{if(!value&&!busy)onClose();}}>
  <DialogContent role="dialog" aria-modal="true" aria-label={title}
    className="max-h-[94vh] w-[calc(100vw-1rem)] overflow-y-auto sm:max-w-4xl">
   <DialogHeader>
    <DialogTitle ref={headerRef} tabIndex={-1}>{title} <span className="font-bn text-sm font-normal text-ink-500">· ডাটা ইমপোর্ট</span></DialogTitle>
    <DialogDescription>Excel (.xlsx) and CSV (.csv) · UI preview only — no server records are posted.</DialogDescription>
   </DialogHeader>
   <div className="grid grid-cols-4 gap-1.5" aria-label="Import progress">
    {order.map((stage,index)=><div key={stage} aria-current={stage===step?'step':undefined}
     className={ "min-w-0 rounded-md px-1.5 py-2 text-center text-[11px] font-medium " +
      (stage===step?'bg-teal-700 text-white':'bg-ink-50 text-ink-500')}>
     {index+1}. {labels[stage]}
    </div>)}
   </div>
   {error&&<p className="rounded-md bg-danger-bg p-3 text-xs text-danger" role="alert">{error}</p>}
   {step==='upload'&&<ImportUploadStep target={target} tables={tables} selected={current} onRead={read} onSelect={selectSheet} onError={setError}/>}
   {step==='map'&&current&&<ImportMappingStep target={target} table={current} mapping={mapping} onMapping={nextMapping=>{setMapping(nextMapping);setRows([]);setError('');}}/>}
   {step==='review'&&<ImportReviewStep target={target} rows={rows} onRowsChange={next=>setRows(prepareRows?prepareRows(next):next)}/>}
   {step==='finish'&&result&&<ImportFinishStep result={result} rows={rows} onAnother={restart} onView={onClose}/>}
   {step!=='finish'&&<div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
    <Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
    <div className="flex flex-wrap items-center justify-end gap-2">
     {step!=='upload'&&<Button type="button" variant="outline" onClick={previous}>Back</Button>}
     {step==='upload'&&<Button type="button" disabled={!current?.headers.length} onClick={()=>void next()}>Next: Map columns</Button>}
     {step==='map'&&<Button type="button" onClick={()=>void next()}>Next: Review</Button>}
     {step==='review'&&<Button type="button" disabled={!onApply||busy||!rows.some(row=>row.decision!=='skip'&&row.decision!=='reject')||rows.some(row=>row.decision!=='skip'&&row.issues.some(i=>i.severity==='error'))} onClick={()=>void next()}>
       {busy?'Importing…':'Confirm import'}
     </Button>}
    </div>
   </div>}
   {step==='review'&&onApply&&rows.some(row=>!['skip','reject'].includes(row.decision)&&
    Number(target==='product'?row.mapped.openingStock:row.mapped.openingAmount)>0)&&
    <p className="text-xs text-warning" role="note">Confirming will create Opening {target==='product'?'Stock lots':'Ledger balances'} for the selected rows.
      Party opening balances are unverified historical entries; no payment account is changed.</p>}
   {step==='review'&&!onApply&&<p role="note" className="text-right text-xs text-ink-500">
    Confirm is unavailable until the {target} import adapter is connected. No data has been saved.
   </p>}
  </DialogContent>
 </Dialog>;
}
