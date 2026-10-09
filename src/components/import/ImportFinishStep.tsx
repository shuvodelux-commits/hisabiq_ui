import React from 'react';
import {CheckCircle2} from 'lucide-react';
import {Button} from '../Button';
import type {ImportResult} from '../../import/importTypes.ts';
export function ImportFinishStep({result,onAnother,onView}:{
 result:ImportResult;onAnother:()=>void;onView:()=>void;
}){
 return <div className="space-y-3 py-4 text-center">
  <CheckCircle2 className="mx-auto size-10 text-teal-700"/>
  <h3 className="text-base font-semibold text-ink">Import preview updated</h3>
  <p className="text-xs text-ink-500">In-memory UI preview only — no records were saved to a server.</p>
  <div className="grid grid-cols-3 gap-2 rounded-lg bg-ink-50 p-3 text-xs">
   <div><strong className="text-lg text-ink">{result.created}</strong><p>Created</p></div>
   <div><strong className="text-lg text-ink">{result.skipped}</strong><p>Skipped</p></div>
   <div><strong className="text-lg text-ink">{result.rejected}</strong><p>Rejected</p></div>
  </div>
  <div className="flex flex-wrap justify-center gap-2">
   <Button variant="outline" onClick={onAnother}>Import another file</Button>
   <Button onClick={onView}>View records</Button>
  </div>
 </div>;
}
