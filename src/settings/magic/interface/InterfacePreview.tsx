import { useState } from 'react';
import { ArrowDownLeft } from 'lucide-react';
import { Tabs } from './InterfaceTabs';
import { accessFor, visibleColumns } from './experienceResolver';
import type { ExperienceSnapshot, Viewport } from './experienceTypes';

const sample: Record<string, Record<string, string>> = {
  sales: { Invoice: 'INV-000241', Customer: 'Rahman Hardware', Date: '24 Oct', Total: '৳25,550', Paid: '৳18,000', Due: '৳7,550', Status: 'Partial', Payment: 'Split', Items: 'PVC Pipe 1" ×10, Valve ×5', 'Payment split': 'Cash ৳18,000 · bKash ৳500', Profit: '৳2,940' },
  products: { Product: 'LED Bulb 12W', Category: 'Electrical', Brand: 'Super Star', Stock: '34 Box 2 Pcs', Unit: 'Box / Pcs', Purchase: '৳128', Selling: '৳165', Status: 'In stock', 'Stock value': '৳43,776' },
  parties: { Date: '01 Oct', Particulars: 'INV-000241', Debit: '25,550', Credit: '—', Balance: '48,650 Dr' },
  purchases: { Bill: 'PUR-000118', Supplier: 'Karim Traders', Items: 'Gate Valve ¾" × 100…', Receipt: 'Attached', Total: '৳58,600', Paid: '৳30,000', Due: '৳28,600', Status: 'Partial' },
};
const numeric = new Set(['Total', 'Paid', 'Due', 'Profit', 'Debit', 'Credit', 'Balance', 'Purchase', 'Selling', 'Stock value', 'Stock']);
const linkCells: Record<string, Record<string, string>> = {
  sales: { Customer: 'sales.links.customerLedger' },
  parties: { Particulars: 'parties.links.invoice' },
  purchases: { Supplier: 'purchases.links.supplierLedger' },
};

/** Optional, on-demand preview that uses the same resolver as the real module screens. */
export function InterfacePreview({ snapshot, moduleId }: { snapshot: ExperienceSnapshot; moduleId: string }) {
  const [vp, setVp] = useState<Viewport>('desktop');
  const cols = visibleColumns(snapshot, moduleId, vp);
  const row = sample[moduleId] ?? {};
  const on = (key: string) => accessFor(snapshot, key).enabled;
  const isLink = (col: string) => {
    const key = linkCells[moduleId]?.[col];
    return key ? on(key) : false;
  };

  return (
    <div className="rounded-lg border border-ink-100">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pr-3">
        <Tabs label="Preview size" items={[{ id: 'desktop', label: 'Desktop' }, { id: 'tablet', label: 'Tablet' }, { id: 'mobile', label: 'Mobile' }]} value={vp} onChange={(v) => setVp(v as Viewport)} />
        <span className="ref-helper">Sample row · not your data</span>
      </div>
      {vp === 'mobile' ? (
        <div className="space-y-1 p-3 text-[13px]">
          {cols.slice(0, 4).map((c) => (
            <div key={c} className="flex justify-between gap-3">
              <span className="text-[12px] text-ink-500">{c}</span>
              <span className={isLink(c) ? 'font-medium text-teal-700 underline-offset-2 hover:underline' : 'text-ink'}>{row[c]}</span>
            </div>
          ))}
          <p className="pt-1 text-[11px] text-ink-500">Other fields open with “Details” on mobile.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table data-erp-table className="w-full min-w-[520px] text-left text-[13px]">
            <thead className="bg-ink-50">
              <tr>
                {cols.map((c) => (
                  <th key={c} className={`px-3 py-2 text-[12px] font-medium text-ink-500 ${numeric.has(c) ? 'text-right' : ''}`}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {cols.map((c) => (
                  <td key={c} className={`px-3 py-2 align-top ${numeric.has(c) ? 'text-right' : ''}`}>
                    <span className={isLink(c) ? 'font-medium text-teal-700' : 'text-ink'}>{row[c]}</span>
                    {moduleId === 'parties' && c === 'Particulars' && on('parties.ledger.items') && (
                      <span className="block text-[11px] text-ink-500">MS Angle 1.5" · 220 Kg × ৳112</span>
                    )}
                    {moduleId === 'parties' && c === 'Credit' && on('parties.ledger.directionIcons') && (
                      <ArrowDownLeft className="ml-1 inline size-3 text-success" aria-label="Money in" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {moduleId === 'sales' && (
        <p className="border-t border-ink-100 px-3 py-2 text-[11px] text-ink-500">
          Row action: {on('sales.actions.receivePayment') ? <b className="font-medium text-ink">“Money in” on due invoices</b> : 'none — payments use “Receive payment” at the top of Sales'}
        </p>
      )}
    </div>
  );
}
