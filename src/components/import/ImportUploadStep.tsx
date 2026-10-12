import {useState} from 'react';
import {Download,FileSpreadsheet,UploadCloud} from 'lucide-react';
import {Button} from '../Button';
import {AppSelect} from '../AppSelect';
import {parseImportFile} from '../../import/fileReader.ts';
import {makeTemplateCsv,makeTemplateXlsx,downloadImportBlob} from '../../import/importTemplates.ts';
import type {ImportTable,ImportTarget} from '../../import/importTypes.ts';

export function ImportUploadStep({target,tables,selected,onRead,onSelect,onError}:{
 target:ImportTarget;tables:ImportTable[];selected:ImportTable|null;
 onRead:(tables:ImportTable[])=>void;onSelect:(sheet:string)=>void;onError:(error:string)=>void;
}){
 const [busy,setBusy]=useState(false);
 const onFile=async(file?:File)=>{
  if(!file)return;setBusy(true);onError('');
  try {const data=await parseImportFile(file);onRead(data);}
  catch(e){onRead([]);onError(e instanceof Error?e.message:'Unable to read file.');}
  finally{setBusy(false);}
 };
 const download=async(type:'csv'|'xlsx')=>{
  try{
   const blob=type==='csv'?new Blob([makeTemplateCsv(target)],{type:'text/csv;charset=utf-8'}):
    await makeTemplateXlsx(target);
   downloadImportBlob(blob,'hisabiq-'+target+'s-template.'+type);
  }catch(e){onError(e instanceof Error?e.message:'Unable to generate template.');}
 };
 return <div className="space-y-3">
  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-ink-50 p-3 text-xs">
   <div className="flex items-center gap-2"><FileSpreadsheet className="size-5 text-teal-600"/>
    <div><p className="font-semibold text-ink">Start with a HisabIQ template</p>
      <p className="text-ink-500">Excel and CSV · বাংলা names supported</p></div></div>
   <div className="flex flex-wrap gap-2">
    <Button size="sm" variant="outline" type="button" onClick={()=>void download('csv')}><Download className="size-3.5"/> Download CSV template</Button>
    <Button size="sm" variant="outline" type="button" onClick={()=>void download('xlsx')}><Download className="size-3.5"/> Download Excel template</Button>
   </div>
  </div>
  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-teal-500/50 bg-card p-6 text-center hover:bg-ink-50"
    onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();void onFile(event.dataTransfer.files[0]);}}>
   <UploadCloud className="size-7 text-teal-700"/>
   <span className="text-sm font-semibold text-ink">{busy?'Reading file…':'Choose or drop a file'}</span>
   <span className="text-xs text-ink-500">.xlsx up to 5 MB or .csv up to 1 MB · 5,000 rows maximum</span>
   <input type="file" aria-label="Select Excel or CSV file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
     className="mt-2 block w-full max-w-xs text-xs file:mr-3 file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:py-1.5 file:text-ink"
     disabled={busy} onChange={e=>void onFile(e.currentTarget.files?.[0])}/>
  </label>
  {tables.length>0&&<div className="rounded-lg border border-border p-3 text-xs">
   <strong className="text-ink">{selected?.fileName}</strong>
   {tables.length>1&&<div className="mt-2 max-w-xs">
     <AppSelect label="Excel worksheet" value={selected?.sheet??''} onChange={onSelect}
       options={tables.map(sheet=>({value:sheet.sheet,label:sheet.sheet}))}/>
   </div>}
   <p className="mt-1 text-ink-500">{selected?.rows.length??0} data rows · {selected?.headers.length??0} columns · Sheet: {selected?.sheet}</p>
  </div>}
 </div>;
}
