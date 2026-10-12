import {CheckCircle2,Download} from 'lucide-react';
import {Button} from '../Button';
import {makeImportErrorCsv,downloadImportBlob} from '../../import/importTemplates.ts';
import type {ImportResult,StagedImportRow} from '../../import/importTypes.ts';
export function ImportFinishStep({result,rows,onAnother,onView}:{
 result:ImportResult;rows:readonly StagedImportRow[];onAnother:()=>void;onView:()=>void;
}){
 const rejectedRows=rows.filter(row=>row.decision==='reject'||row.issues.some(issue=>issue.severity==='error'));
 const metrics=[
  ['Created',result.created],['Master updated',result.masterUpdated],
  ['Role added',result.roleAdded],['Opening balances',result.openingSources],
  ['Opening lots',result.openingLots],['Skipped',result.skipped],['Rejected',result.rejected]
 ];
 return <div className="space-y-3 py-4 text-center">
  <CheckCircle2 className="mx-auto size-10 text-teal-700"/>
  <h3 className="text-base font-semibold text-ink">Added to UI preview</h3>
  <p className="text-xs text-ink-500">In-memory UI preview only — no records were saved to a server.</p>
  <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink-50 p-3 text-xs sm:grid-cols-4">
   {metrics.map(([label,value])=><div key={label}><strong className="text-lg text-ink">{value}</strong><p className="text-ink-500">{label}</p></div>)}
  </div>
  <div className="flex flex-wrap justify-center gap-2">
   {rejectedRows.length>0&&<Button variant="outline" onClick={()=>
    downloadImportBlob(new Blob([makeImportErrorCsv(rejectedRows)],{type:'text/csv;charset=utf-8'}),
     'hisabiq-import-errors.csv')}><Download className="size-4"/> Download error report (.csv)</Button>}
   <Button variant="outline" onClick={onAnother}>Import another file</Button>
   <Button onClick={onView}>View records</Button>
  </div>
 </div>;
}
