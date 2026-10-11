import React from 'react';
import {Button} from '../Button';
import {Input} from '../Input';
import {AppDateRangePicker} from '../AppDateRangePicker';
import {taka} from '../../utils/currency';
import type {VendorPartyProfile} from '../../vendor/vendorPartyProjection';
import type {VendorLedgerEvent,VendorPreviewState,VendorSide} from '../../vendor/vendorTypes';
import type {IsoRange} from '../../utils/dateRange';

type Props={
 profile:VendorPartyProfile;snapshot:VendorPreviewState;side:VendorSide;
 setSide:(side:VendorSide)=>void;range:IsoRange;setRange:(range:IsoRange)=>void;
 query:string;setQuery:(query:string)=>void;review:(event:VendorLedgerEvent)=>void;
};
const money=(paisa:number)=>taka(paisa/100);
export function VendorLedgerWorkspace({profile,snapshot,side,setSide,range,setRange,query,setQuery,review}:Props){
 return <div data-testid="vendor-ledger-workspace" className="min-w-0 space-y-3">
     <div className="mb-3 flex flex-wrap items-center gap-2">
      <label className="text-xs text-ink-500">Account
       <select aria-label="Vendor balance side" value={side} onChange={e=>setSide(e.target.value as VendorSide)}
        className="ml-2 rounded-md border border-input bg-card px-2 py-2 text-sm text-ink">
        <option value="payable">Amount Payable</option><option value="receivable">Amount Receivable</option>
       </select></label>
      <AppDateRangePicker value={range} onChange={setRange} label="Vendor ledger date range"/>
      {Boolean(range.from)!==Boolean(range.to)&&<span className="text-xs text-warning">Choose both dates to filter</span>}
      <Input className="w-full sm:ml-auto sm:w-56" value={query} onChange={e=>setQuery(e.target.value)}
       aria-label="Search Vendor ledger" placeholder="Search reference or note"/>
     </div>
     <div className="mb-2 flex flex-wrap justify-between gap-2 bg-ink-50 px-3 py-2 text-xs text-ink-600">
      <span>Opening: {money((side==='payable'?profile.takenStatement:profile.givenStatement).openingPaisa)}</span>
      <span>Increased: {money((side==='payable'?profile.takenStatement:profile.givenStatement).periodIncreasePaisa)}</span>
      <span>Decreased: {money((side==='payable'?profile.takenStatement:profile.givenStatement).periodDecreasePaisa)}</span>
     </div>
     <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-xs">
      <thead><tr className="border-b border-border bg-ink-50">
       {['Date','Details','Increase','Decrease','Running','Actions'].map(x=><th key={x} className="p-2 text-left">{x}</th>)}
      </tr></thead><tbody>
      {(side==='payable'?profile.takenStatement:profile.givenStatement).rows.filter(e=>(e.reference+' '+e.description).toLowerCase().includes(query.toLowerCase())).map(e=>
       <tr key={e.id} className="border-b border-border/70"><td className="p-2 text-ink-500">{e.date}</td>
        <td className="p-2 font-medium text-ink">{e.reference??e.kind}<p className="font-normal text-ink-500">{e.description}</p></td>
        <td className="p-2 text-right">{e.deltaPaisa>0?money(e.deltaPaisa):'—'}</td>
        <td className="p-2 text-right">{e.deltaPaisa<0?money(-e.deltaPaisa):'—'}</td>
        <td className="p-2 text-right font-semibold">{money(e.runningPaisa)}</td>
        <td className="p-2 text-right"><Button size="sm" variant="ghost" onClick={()=>review(e)}>Review</Button></td>
       </tr>)}
      </tbody></table></div>
     {side==='payable'&&profile.takenStatement.unpricedSources.length>0&&<p className="mt-2 text-xs text-ink-500">
      {profile.takenStatement.unpricedSources.length} source(s) with <strong>Price not set</strong>. See Products Received; no money value has been assigned.</p>}
     {profile.activity.filter(item=>item.bucket===(side==='payable'?'vendor-payable':'vendor-receivable')
       &&item.moneyPaisa===null
       &&(item.reference+' '+item.description).toLowerCase().includes(query.toLowerCase())).length>0&&
      <div className="mt-3 rounded-lg border border-border">
       <h4 className="border-b border-border bg-ink-50 px-3 py-2 text-xs font-semibold text-ink">
        Records without a money amount · দাম ঠিক হয়নি / সংশোধন
       </h4>
       {profile.activity.filter(item=>item.bucket===(side==='payable'?'vendor-payable':'vendor-receivable')
         &&item.moneyPaisa===null
         &&(item.reference+' '+item.description).toLowerCase().includes(query.toLowerCase())).map(item=>
        <div key={item.id} className="flex flex-wrap items-center gap-3 border-b border-border/60 px-3 py-2 text-xs">
         <span className="text-ink-500">{item.date}</span>
         <div className="min-w-0 flex-1"><strong className="text-ink">{item.reference}</strong>
          <p className="text-ink-500">{item.description}</p></div>
         <span className="text-ink-500">No money amount</span>
         {item.sourceEventId&&item.kind!=='reversal'&&
          <Button type="button" size="sm" variant="ghost" onClick={()=>{
           const entry=snapshot.events.find(e=>e.id===item.sourceEventId);if(entry)review(entry);
          }}>Review</Button>}
        </div>)}
      </div>}
 </div>;
}
