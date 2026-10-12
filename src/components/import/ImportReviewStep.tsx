import {useState} from 'react';
import {CheckCircle2,Search,AlertTriangle,Pencil} from 'lucide-react';
import type {ImportTarget,StagedImportRow} from '../../import/importTypes.ts';
import {validateMappedRow} from '../../import/columnMapping.ts';
import {Input} from '../Input';
import {Button} from '../Button';
import {AppSelect} from '../AppSelect';
import {toBasePrice,toBaseQuantity} from '../../utils/productEntry.ts';

function partyOpeningPreview(row:StagedImportRow,target:'customer'|'supplier'):string|null {
 const amount=Number(row.mapped.openingAmount||0);
 const direction=String(row.mapped.openingDirection||'').trim().toUpperCase();
 if(!Number.isFinite(amount)||amount<=0)return null;
 const explanation=target==='customer'
  ?(direction==='DR'?'Customer owes us':'We owe customer')
  :(direction==='CR'?'We owe supplier':'Supplier advance');
 return 'Opening: '+direction+' '+amount.toLocaleString('en-BD')+' · '+explanation+' · legacy-unverified, no money moved';
}
function productConversion(row:StagedImportRow):string|null {
 const m=row.mapped,base=String(m.baseUnit??'').trim(),large=String(m.largeUnit??'').trim();
 const factor=large?Number(m.conversionFactor):1;
 if(!base||!Number.isFinite(factor)||factor<=0)return null;
 const opening=Number(m.openingStock||0),cost=Number(m.purchasePrice||0);
 const openingUnit=String(m.openingStockUnit||base),costUnit=String(m.purchasePriceUnit||base);
 if(![base,large].includes(openingUnit)||![base,large].includes(costUnit))return null;
 if(!Number.isFinite(opening)||!Number.isFinite(cost)||opening<0||cost<0)return null;
 const parts=[];
 if(opening>0)parts.push('Opening: '+opening+' '+openingUnit+' → '+toBaseQuantity(opening,openingUnit,base,large,factor)+' '+base);
 if(cost>0)parts.push('Purchase: '+cost+'/'+costUnit+' → '+toBasePrice(cost,costUnit,base,large,factor).toFixed(2)+'/'+base);
 return parts.join(' · ')||null;
}
type Filter='all'|'ready'|'errors'|'skipped';
const status=(row:StagedImportRow):Exclude<Filter,'all'>=>
 row.decision==='skip'?'skipped':row.issues.some(i=>i.severity==='error')?'errors':'ready';

export function ImportReviewStep({target,rows,onRowsChange}:{
 target:ImportTarget;rows:StagedImportRow[];onRowsChange:(rows:StagedImportRow[])=>void;
}){
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState<Filter>('all');
 const [editing,setEditing]=useState<number|null>(null);
 const [draft,setDraft]=useState<Record<string,string>>({});
 const counts={ready:rows.filter(row=>status(row)==='ready').length,
  errors:rows.filter(row=>status(row)==='errors').length,
  skipped:rows.filter(row=>status(row)==='skipped').length};
 const filtered=rows.filter(row=>{
  if(filter!=='all'&&status(row)!==filter)return false;
  const corpus=Object.values(row.mapped).map(String).join(' ').toLocaleLowerCase();
  return !query||corpus.includes(query.toLocaleLowerCase());
 });
 const begin=(row:StagedImportRow)=>{
  setEditing(row.sourceRow);setDraft(Object.fromEntries(Object.entries(row.mapped).map(([key,value])=>[key,String(value??'')])));
 };
 const save=(row:StagedImportRow)=>{
  const mapped={...row.mapped,...draft};
  const validated=validateMappedRow({...row,mapped},target);
  onRowsChange(rows.map(candidate=>candidate===row?validated:candidate));
  setEditing(null);setDraft({});
 };
 const skip=(row:StagedImportRow)=>{
  onRowsChange(rows.map(candidate=>candidate===row?{...candidate,decision:row.decision==='skip'?'create':'skip'}:candidate));
 };
 return <div className="space-y-3">
  <div className="grid grid-cols-3 gap-2 rounded-md bg-ink-50 p-3 text-xs sm:grid-cols-4">
   <div><strong className="text-base text-ink">{rows.length}</strong><p className="text-ink-500">Mapped rows</p></div>
   <div><strong className="text-base text-teal-700 dark:text-teal-400">{counts.ready}</strong><p className="text-ink-500">Ready</p></div>
   <div><strong className="text-base text-danger">{counts.errors}</strong><p className="text-ink-500">Errors</p></div>
   <div><strong className="text-base text-ink-500">{counts.skipped}</strong><p className="text-ink-500">Skipped</p></div>
  </div>
  <p className="text-xs text-ink-500">Review source values, converted amounts and duplicate decisions before confirming. No server records are posted.</p>
  <div className="flex flex-wrap gap-1.5" aria-label="Review status filters">
   {([['all','All ('+rows.length+')'],['ready','Ready ('+counts.ready+')'],
     ['errors','Errors ('+counts.errors+')'],['skipped','Skipped ('+counts.skipped+')']] as const).map(([value,label])=>
    <Button key={value} type="button" size="sm" variant={filter===value?'default':'outline'} onClick={()=>setFilter(value)}>
      {label}
    </Button>)}
  </div>
  <div className="relative max-w-sm"><Search className="absolute left-2.5 top-2.5 size-4 text-ink-400"/>
   <Input aria-label="Search mapped rows" value={query} placeholder="Search rows…"
    onChange={e=>setQuery(e.target.value)} className="pl-8"/>
  </div>
  <div className="max-h-72 divide-y divide-border overflow-y-auto rounded-md border border-border">
   {filtered.slice(0,50).map(row=><div key={row.sourceSheet+'-'+row.sourceRow} className="space-y-2 px-3 py-2 text-xs">
    <div className="flex items-start gap-3">
     <span className="w-10 shrink-0 text-ink-400">#{row.sourceRow}</span>
     <div className="min-w-0 flex-1">
      <p className="break-words font-semibold text-ink">{String(row.mapped.name??'Unnamed row')||'Unnamed row'}</p>
      <p className="break-words text-ink-500">
       {Object.entries(row.mapped).filter(([k])=>k!=='name').slice(0,5).map(([k,v])=>k+': '+String(v)).join(' · ')}
      </p>
      {target==='product'&&productConversion(row)&&<p className="mt-1 text-[11px] font-medium text-teal-700 dark:text-teal-400">{productConversion(row)}</p>}
      {target!=='product'&&partyOpeningPreview(row,target)&&<p className="mt-1 text-[11px] font-medium text-teal-700 dark:text-teal-400">{partyOpeningPreview(row,target)}</p>}
      {row.match&&<p className="mt-1 text-warning">
       {target==='product'?'Existing SKU match: ':'Potential Party match: '}{row.match.label}
       {target==='product'?' · Update master data only; stock is unchanged.':' · Matching by phone does not merge automatically. Choose a deliberate action.'}
      </p>}
      {row.issues.map((issue,i)=><p key={i} className={issue.severity==='warning'?'mt-1 text-warning':'mt-1 text-danger'} role={issue.severity==='warning'?'note':'alert'}>{issue.field?issue.field+': ':''}{issue.message}</p>)}
     </div>
     {status(row)==='errors'?<span className="inline-flex items-center gap-1 text-danger"><AlertTriangle className="size-3.5"/> Error</span>
      :status(row)==='skipped'?<span className="text-ink-500">Skipped</span>
      :<span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400"><CheckCircle2 className="size-3.5"/> Ready</span>}
    </div>
    {editing===row.sourceRow?<div className="space-y-2 rounded-md bg-ink-50 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
       {Object.entries(draft).map(([key,value])=><label key={key} className="space-y-1 text-[11px] font-medium text-ink-600">
        <span>{key}</span>
        <Input aria-label={'Edit '+key+' row '+row.sourceRow} value={value}
         onChange={event=>setDraft(prev=>({...prev,[key]:event.target.value}))}/>
       </label>)}
      </div>
      <div className="flex justify-end gap-2">
       <Button size="sm" type="button" variant="outline" onClick={()=>{setEditing(null);setDraft({});}}>Cancel edit</Button>
       <Button size="sm" type="button" onClick={()=>save(row)}>Save row {row.sourceRow}</Button>
      </div>
     </div>:
     <div className="flex items-center justify-end gap-2">
      {target==='product'?<div className="min-w-[160px]">
       <AppSelect label={'Import action for row '+row.sourceRow} compact value={row.decision}
        options={row.match
         ?[{value:'skip',label:'Skip duplicate'},{value:'update-master',label:'Update master only'}]
         :[{value:'create',label:'Create product'},{value:'skip',label:'Skip row'}]}
        onChange={value=>onRowsChange(rows.map(item=>item===row?{...item,decision:value as StagedImportRow['decision']}:item))}/>
      </div>:row.match?<div className="min-w-[185px]">
       <AppSelect label={'Party identity action for row '+row.sourceRow} compact value={row.decision}
        options={[
         {value:'skip',label:'Skip matched Party'},
         ...(!row.match.hasRole?[{value:'add-role',label:'Add missing relationship'}]:[]),
         ...(row.match.kind==='suggested'?[{value:'create',label:'Create separately (distinct person)'}]:[])
        ]}
        onChange={value=>onRowsChange(rows.map(item=>item===row?{...item,decision:value as StagedImportRow['decision']}:item))}/>
      </div>:<Button size="sm" type="button" variant="outline" onClick={()=>skip(row)}>
       {row.decision==='skip'?'Include row':'Skip row'}
      </Button>}
      <Button size="sm" type="button" variant="outline" onClick={()=>begin(row)}
       aria-label={'Edit mapped row '+row.sourceRow}><Pencil className="size-3"/> Edit</Button>
     </div>}
   </div>)}
   {filtered.length>50&&<p className="p-3 text-xs text-ink-500">Showing first 50 mapped rows. Search to narrow results.</p>}
   {!filtered.length&&<p className="p-6 text-center text-xs text-ink-500">No matching rows.</p>}
  </div>
 </div>;
}
