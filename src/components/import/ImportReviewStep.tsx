import React,{useState} from 'react';
import {CheckCircle2,Search} from 'lucide-react';
import type {StagedImportRow} from '../../import/importTypes.ts';
import {Input} from '../Input';

export function ImportReviewStep({rows}:{rows:StagedImportRow[]}){
 const [query,setQuery]=useState('');
 const filtered=rows.filter(row=>{
  const corpus=Object.values(row.mapped).map(String).join(' ').toLocaleLowerCase();
  return !query||corpus.includes(query.toLocaleLowerCase());
 });
 return <div className="space-y-3">
  <div className="grid grid-cols-2 gap-2 rounded-md bg-ink-50 p-3 text-xs sm:grid-cols-4">
   <div><strong className="text-base text-ink">{rows.length}</strong><p className="text-ink-500">Mapped rows</p></div>
   <div><strong className="text-base text-ink">0</strong><p className="text-ink-500">Posted</p></div>
   <div><strong className="text-base text-ink">—</strong><p className="text-ink-500">Duplicates</p></div>
   <div><strong className="text-base text-ink">—</strong><p className="text-ink-500">Domain validation</p></div>
  </div>
  <p className="text-xs text-ink-500">Mapping preview only. Product, Party and opening-balance checks activate when their import adapters are connected.</p>
  <div className="relative max-w-sm"><Search className="absolute left-2.5 top-2.5 size-4 text-ink-400"/>
   <Input aria-label="Search mapped rows" value={query} placeholder="Search rows…"
    onChange={e=>setQuery(e.target.value)} className="pl-8"/>
  </div>
  <div className="max-h-64 divide-y divide-border overflow-y-auto rounded-md border border-border">
   {filtered.slice(0,50).map(row=><div key={row.sourceSheet+'-'+row.sourceRow} className="flex items-start gap-3 px-3 py-2 text-xs">
    <span className="w-10 shrink-0 text-ink-400">#{row.sourceRow}</span>
    <div className="min-w-0 flex-1">
     <p className="break-words font-semibold text-ink">{String(row.mapped.name??'Unnamed row')}</p>
     <p className="break-words text-ink-500">
      {Object.entries(row.mapped).filter(([k])=>k!=='name').slice(0,5).map(([k,v])=>k+': '+String(v)).join(' · ')}
     </p>
    </div>
    <span className="inline-flex shrink-0 items-center gap-1 text-teal-700 dark:text-teal-400"><CheckCircle2 className="size-3.5"/> Mapped</span>
   </div>)}
   {filtered.length>50&&<p className="p-3 text-xs text-ink-500">Showing first 50 mapped rows. Search to narrow results.</p>}
   {!filtered.length&&<p className="p-6 text-center text-xs text-ink-500">No matching rows.</p>}
  </div>
 </div>;
}
