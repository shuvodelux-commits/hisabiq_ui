import React from 'react';
import { Download, Printer } from 'lucide-react';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import type { Party } from '../../types/erp';
import type { LedgerStatement } from '../../types/partyLedger';
import { statementPrintRows, serializePartyStatementCsv } from '../../utils/partyStatement';
import { businessToday } from '../../utils/dateRange';
import { formatNumber } from '../../utils/currency';
import { ledgerImpact } from '../../utils/partyLedgerImpact';

type Props={open:boolean;onClose:()=>void;party:Party;statement:LedgerStatement};
export function PartyStatementDialog({open,onClose,party,statement}:Props){
  const period=statement.from&&statement.to
    ? statement.from+' — '+statement.to
    : 'All time (through '+businessToday()+')';
  const download=()=>{
    const csv=serializePartyStatementCsv(statement,{business:'HisabIQ · Business preview',party:party.name});
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;
    a.download='party-ledger-'+party.id+'-'+(statement.from||'all')+'-'+(statement.to||businessToday())+'.csv';
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  };
  const rows=statementPrintRows(statement);
  return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>
    <DialogContent role="dialog" aria-modal="true" aria-label="Party ledger statement"
      className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Party ledger statement</DialogTitle>
        <DialogDescription>Clean dated statement. Print using your browser or Save as PDF; no backend posting.</DialogDescription>
      </DialogHeader>
      <div id="party-statement-print" className="party-statement-print space-y-4 rounded-lg border border-border bg-card p-4 text-ink">
        <div className="border-b border-border pb-3">
          <h2 className="text-lg font-semibold">HisabIQ · Business preview</h2>
          <p className="text-xs text-ink-500">Unverified demo business identity — configure your tenant before sharing a statement.</p>
          <div className="mt-2 flex flex-wrap justify-between gap-2">
            <div><strong>{party.name}</strong>{party.nameBn&&<span className="ml-2 font-bn">{party.nameBn}</span>}
              <p className="text-xs text-ink-500">{party.phone} · {party.area}</p>
            </div>
            <div className="text-right text-xs"><strong>{statement.relationship} ledger</strong>
              <p>{period}</p><p>Printed: {businessToday()}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between text-sm"><span title="Balance before the selected date range; dated opening entries appear in the table">Opening balance (brought forward)</span><strong>৳{formatNumber(statement.openingBalance)}</strong></div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead><tr className="border-y border-border bg-ink-50 text-ink-700">
              <th className="p-2 text-left">Date</th><th className="p-2 text-left">Particulars</th>
              <th className="p-2 text-right">Debit</th><th className="p-2 text-right">Credit</th><th className="p-2 text-right">Balance</th>
            </tr></thead>
            <tbody>{rows.map(row=><tr key={row.id} className="border-b border-border/70">
              <td className="whitespace-nowrap p-2">{row.date}</td>
              <td className="p-2"><span className="font-medium">{row.reference||row.source}</span>
               <span className="ml-1 text-[10px] text-ink-500">· {ledgerImpact(row).label}</span>
               <p className="max-w-sm break-words text-ink-500">{row.description}</p></td>
              <td className="p-2 text-right">{row.debit?formatNumber(row.debit):'—'}</td>
              <td className="p-2 text-right">{row.credit?formatNumber(row.credit):'—'}</td>
              <td className="p-2 text-right">{formatNumber(row.runningBalance)}</td>
            </tr>)}
            {!rows.length&&<tr><td colSpan={5} className="p-5 text-center">No transactions in this date range.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="ml-auto max-w-sm space-y-1 border-t border-border pt-2 text-xs">
          <div className="flex justify-between"><span>Period debit</span><strong>{formatNumber(statement.periodDebit)}</strong></div>
          <div className="flex justify-between"><span>Period credit</span><strong>{formatNumber(statement.periodCredit)}</strong></div>
          <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold"><span>Closing balance</span><span>৳{formatNumber(statement.closingBalance)}</span></div>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-2 party-statement-controls">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="outline" onClick={download}><Download className="size-4"/> Export CSV</Button>
        <Button onClick={()=>window.print()}><Printer className="size-4"/> Print</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
