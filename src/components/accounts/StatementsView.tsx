import { useMemo, useState } from 'react';
import { ArrowDownToLine, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { AppDateRangePicker } from '../AppDateRangePicker';
import { datePreset, type IsoRange } from '../../utils/dateRange';
import type { Posting } from '../../types/accounting';
import { accountingAccounts } from '../../data/accounting';
import { balanceSheet, profitAndLoss } from '../../utils/accountingProjection';
import { taka } from '../../utils/currency';

function accountNet(postings: Posting[], accountId: string, from: string, to: string) {
  const account = accountingAccounts.find((item) => item.id === accountId);
  if (!account) return 0;
  return postings
    .filter((posting) => posting.status === 'Posted' && (!from || posting.transactionDate >= from) && (!to || posting.transactionDate <= to))
    .flatMap((posting) => posting.lines)
    .filter((line) => line.accountId === accountId)
    .reduce((sum, line) => sum + (account.group === 'Income' || account.group === 'Liability' || account.group === 'Equity'
      ? line.credit - line.debit
      : line.debit - line.credit), 0);
}

export function StatementsView({ postings }: { postings: Posting[] }) {
  // Display demo Sep–Oct initially, but quick presets always use the actual business date.
  const [range, setRange] = useState<IsoRange>({ from: '2026-09-01', to: '2026-10-31' });
  const { from, to } = range;
  const pnl = useMemo(() => profitAndLoss(postings, {
    from: from || '0001-01-01', to: to || '9999-12-31'
  }), [from, postings, to]);
  const sheet = useMemo(() => balanceSheet(postings, to || '9999-12-31'), [postings, to]);
  const sales = accountNet(postings, 'income-sales', from, to);
  const cogs = accountNet(postings, 'expense-cogs', from, to);
  const otherIncome = Math.max(0, pnl.income - sales);
  const operatingExpenses = Math.max(0, pnl.expenses - cogs);
  const grossProfit = sales - cogs;

  const setPreset = (preset: 'month' | 'quarter' | 'year') => {
    const key = preset === 'month' ? 'This month' : preset === 'quarter' ? 'This quarter' : 'This year';
    setRange(datePreset(key));
  };

  const exportCsv = () => {
    const csv = [
      ['Statement', 'Line', 'Amount'],
      ['Profit & Loss', 'Sales Revenue', sales],
      ['Profit & Loss', 'Other Income', otherIncome],
      ['Profit & Loss', 'Cost of Goods Sold', cogs],
      ['Profit & Loss', 'Gross Profit', grossProfit],
      ['Profit & Loss', 'Operating Expenses', operatingExpenses],
      ['Profit & Loss', 'Net Profit', pnl.netProfit],
      ['Balance Sheet', 'Assets', sheet.assets],
      ['Balance Sheet', 'Liabilities', sheet.liabilities],
      ['Balance Sheet', 'Equity', sheet.equity]
    ].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'financial-statements-' + (from || 'all') + '-to-' + (to || 'all') + '.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Statements exported');
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          <button onClick={() => setPreset('month')} className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-ink-50">This month</button>
          <button onClick={() => setPreset('quarter')} className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-ink-50">Quarter</button>
          <button onClick={() => setPreset('year')} className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-ink-600 hover:bg-ink-50">Year</button>
        </div>
        <AppDateRangePicker label="Financial statements date range"
          className="w-full sm:w-[286px]" value={range} onChange={setRange} />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}><ArrowDownToLine className="size-4" /> Export</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
        </div>
        <p className="w-full text-right text-[10.5px] text-ink-400">Financial statements always use Transaction Date.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ink">Profit & Loss</p>
            <p className="font-bn text-[11px] text-ink-400">কত লাভ বা ক্ষতি হয়েছে</p>
          </div>
          <div className="space-y-2 p-4 text-[13px]">
            <div className="flex justify-between"><span className="text-ink-500">Sales Revenue</span><span>{taka(sales)}</span></div>
            {otherIncome > 0 && <div className="flex justify-between"><span className="text-ink-500">Other Income</span><span>{taka(otherIncome)}</span></div>}
            <div className="flex justify-between"><span className="text-ink-500">Cost of Goods Sold</span><span>−{taka(cogs)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Gross Profit <span className="font-bn text-[11px] font-normal text-ink-400">· পণ্য বিক্রির লাভ</span></span><span>{grossProfit < 0 ? '−' : ''}{taka(Math.abs(grossProfit))}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Operating Expenses</span><span>−{taka(operatingExpenses)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold"><span>Net Profit <span className="font-bn text-[11px] font-normal text-ink-400">· সব খরচের পর লাভ</span></span><span className={pnl.netProfit < 0 ? 'text-danger' : 'text-success'}>{pnl.netProfit < 0 ? '−' : ''}{taka(Math.abs(pnl.netProfit))}</span></div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ink">Balance Sheet</p>
            <p className="font-bn text-[11px] text-ink-400">ব্যবসার সম্পদ, দেনা ও মালিকের অংশ</p>
          </div>
          <div className="space-y-2 p-4 text-[13px]">
            <div className="flex justify-between"><span className="text-ink-500">Assets</span><span>{taka(sheet.assets)}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Liabilities</span><span>{taka(sheet.liabilities)}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Equity</span><span>{taka(sheet.equity)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span>Books check</span>
              <span className={sheet.balanced ? 'text-success' : 'text-danger'}>{sheet.balanced ? 'Balanced' : 'Needs review'}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

