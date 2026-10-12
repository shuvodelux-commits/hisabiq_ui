import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { parsePartyCsv, type PartyCsvResult } from '../../utils/partyImport';
import type { PartyDraft } from '../../types/partyLedger';

type Props = { open:boolean; onClose:()=>void; onImport:(parties:PartyDraft[])=>void };
export function PartyImportDialog({open,onClose,onImport}:Props){
  const [result,setResult]=useState<PartyCsvResult|null>(null);
  const [error,setError]=useState('');
  const [filename,setFilename]=useState('');
  const pick=async(file?:File)=>{
    setError('');setResult(null);setFilename(file?.name??'');
    if(!file)return;
    try {setResult(parsePartyCsv(await file.text()));}
    catch(reason){setError(reason instanceof Error?reason.message:'Cannot read CSV.');}
  };
  const importRows=()=>{
    if(!result?.valid.length)return;
    try{onImport(result.valid);setResult(null);setError('');onClose();}
    catch(reason){setError(reason instanceof Error?reason.message:'Import rejected.');}
  };
  return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>
    <DialogContent role="dialog" aria-modal="true" aria-label="Import parties from CSV" className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>Import parties from CSV</DialogTitle>
        <DialogDescription>Preview accepted and rejected rows before adding them to this browser's in-memory preview. Columns: name, nameBn, phone, area, roles. Use | between multiple roles.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <label className="block space-y-1 text-xs font-medium text-ink-700">Select CSV file
          <input type="file" accept=".csv,text/csv" aria-label="Select CSV file" onChange={event=>void pick(event.target.files?.[0])}
            className="block w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-ink"/>
        </label>
        {filename&&<p className="text-xs text-ink-500">{filename}</p>}
        {error&&<p role="alert" className="rounded-md bg-danger-bg p-2 text-sm text-danger">{error}</p>}
        {result&&<div className="space-y-2">
          <div className="flex gap-3 rounded-lg bg-ink-50 p-3 text-sm">
            <span><strong>{result.valid.length}</strong> ready</span>
            <span className="text-danger"><strong>{result.rejected.length}</strong> rejected</span>
          </div>
          <div className="max-h-48 overflow-auto rounded-md border border-border">
            {result.valid.slice(0,20).map((p,i)=><div key={i} className="border-b border-border px-3 py-2 text-xs text-ink">
              <strong>{p.name}</strong> <span className="text-ink-500">{p.nameBn} · {p.phone} · {p.roles.join(', ')}</span>
            </div>)}
            {result.valid.length>20&&<p className="p-2 text-xs text-ink-500">Showing first 20 accepted rows.</p>}
            {result.rejected.map(r=><p key={r.row} className="border-b border-border p-2 text-xs text-danger">Row {r.row}: {r.reason}</p>)}
          </div>
        </div>}
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button disabled={!result?.valid.length} onClick={importRows}>Import {result?.valid.length??0} parties</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
