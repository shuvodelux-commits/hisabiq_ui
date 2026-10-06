import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowDownRight, ArrowUpRight, BookOpen, ChevronRight, FileSpreadsheet, Landmark, Scale, Wallet, Boxes } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { DaybookDialog } from '../components/reports/DaybookDialog';
import { useCashSession } from '../contexts/CashSessionContext';
import { aging, expenseBreakdown, monthlyProfit, profitSummary } from '../data/finance';
import { taka, takaCompact } from '../utils/currency';

const periods = ['Today', 'This week', 'September', 'Quarter', 'FY 2026–27'];

export function Reports() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('September');
  const [daybookOpen, setDaybookOpen] = useState(false);
  const { setOpen: openCash } = useCashSession();
  const expenseTotal = expenseBreakdown.reduce((s, e) => s + e.value, 0);
  const recTotal = aging.reduce((s, a) => s + a.receivable, 0);
  const payTotal = aging.reduce((s, a) => s + a.payable, 0);

  const links = [
  { icon: BookOpen, title: 'Daybook', bn: 'দৈনিক খাতা', desc: 'Every entry today, in order', onClick: () => setDaybookOpen(true) },
  { icon: Wallet, title: 'Cash reconciliation', bn: 'ক্যাশ মিলানো', desc: 'Count drawer, find short/over', onClick: () => openCash(true) },
  { icon: Landmark, title: 'Account reconciliation', bn: 'হিসাব মিলানো', desc: 'Match bank or wallet statements', onClick: () => navigate('/app/reconciliation') },
  { icon: Scale, title: 'Profit & Loss', bn: 'লাভ-ক্ষতি', desc: 'Statement for any period', onClick: () => toast('Opening Profit & Loss…') },
  { icon: Boxes, title: 'Stock valuation', bn: 'স্টকের মূল্য', desc: 'Value at cost and sale price', onClick: () => toast('Opening stock valuation…') }];


  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Reports"
        titleBn="রিপোর্ট"
        description="Business reports, profit, receivables, payables and operational books."
        actions={
        <div className="flex rounded-lg bg-white p-0.5 shadow-card ring-1 ring-ink-100" role="radiogroup" aria-label="Period">
            {periods.map((p) =>
          <button
            key={p}
            role="radio"
            aria-checked={period === p}
            onClick={() => setPeriod(p)}
            className={`h-7 rounded-md px-2.5 text-xs font-medium ${period === p ? 'bg-ink text-white' : 'text-ink-600 hover:bg-ink-50'}`}>
            
                {p}
              </button>
          )}
          </div>
        } />
      

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {profitSummary.map((s, i) => {
          const good = i === 3 ? s.change < 0 : s.change > 0;
          return (
            <div key={s.label} className={`rounded-xl border px-4 py-3 shadow-card ${i === 4 ? 'border-teal-600 bg-teal-600 text-white' : 'border-ink-100 bg-white'}`}>
              <p className={`text-[12.5px] ${i === 4 ? 'text-teal-50' : 'text-ink-500'}`}>
                {s.label} <span className="font-bn text-[11px] opacity-80">· {s.labelBn}</span>
              </p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight">{taka(s.value)}</p>
              <p className={`flex items-center gap-0.5 text-[11.5px] font-medium ${i === 4 ? 'text-teal-50' : good ? 'text-success' : 'text-danger'}`}>
                {s.change > 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {Math.abs(s.change)}% <span className="font-normal opacity-80">vs Aug</span>
              </p>
            </div>);

        })}
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Panel title="Profit trend" subtitle="Gross vs net profit · last 6 months" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyProfit} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barGap={3}>
              <CartesianGrid stroke="#E3E8EE" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8A9BB0' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8A9BB0' }} tickFormatter={takaCompact} width={52} />
              <Tooltip
                cursor={{ fill: '#F5F7FA' }}
                formatter={(v: number, name: string) => [taka(v), name === 'gross' ? 'Gross profit' : 'Net profit']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E3E8EE', fontSize: 12 }} />
              
              <Bar dataKey="gross" fill="#B3E3DC" radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="net" fill="#0D7C74" radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Expense breakdown" subtitle={`${period} · ${taka(expenseTotal)}`}>
          <div className="flex items-center gap-4">
            <div className="relative size-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" innerRadius={44} outerRadius={68} paddingAngle={1.5} stroke="none">
                    {expenseBreakdown.map((e) =>
                    <Cell key={e.name} fill={e.color} />
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-ink-500">Total</span>
                <span className="text-sm font-semibold tabular-nums">{takaCompact(expenseTotal)}</span>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5 text-[12.5px]">
              {expenseBreakdown.map((e) =>
              <li key={e.name} className="flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-sm" style={{ background: e.color }} />
                  <span className="flex-1 truncate text-ink-600">{e.name}</span>
                  <span className="tabular-nums text-ink">{taka(e.value)}</span>
                  <span className="w-9 text-right tabular-nums text-ink-400">{Math.round(e.value / expenseTotal * 100)}%</span>
                </li>
              )}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Panel title="Receivables & payables" subtitle="By age · পাওনা ও দেনা" className="xl:col-span-2" bodyClassName="">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-4 text-xs">Age</TableHead>
                <TableHead className="h-9 text-right text-xs">Receivable</TableHead>
                <TableHead className="h-9 text-xs">&nbsp;</TableHead>
                <TableHead className="h-9 text-right text-xs">Payable</TableHead>
                <TableHead className="h-9 pr-4 text-xs">&nbsp;</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aging.map((a) =>
              <TableRow key={a.bucket} className="text-[13px]">
                  <TableCell className="py-2 pl-4 text-ink-700">{a.bucket}</TableCell>
                  <TableCell className="py-2 text-right tabular-nums font-medium">{a.receivable ? taka(a.receivable) : '—'}</TableCell>
                  <TableCell className="w-[18%] py-2">
                    <div className="h-1.5 rounded-full bg-ink-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${a.receivable / recTotal * 100}%` }} /></div>
                  </TableCell>
                  <TableCell className="py-2 text-right tabular-nums font-medium">{a.payable ? taka(a.payable) : '—'}</TableCell>
                  <TableCell className="w-[18%] py-2 pr-4">
                    <div className="h-1.5 rounded-full bg-ink-100"><div className="h-full rounded-full bg-ink-600" style={{ width: `${a.payable / payTotal * 100}%` }} /></div>
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="bg-ink-50 font-semibold hover:bg-ink-50">
                <TableCell className="py-2 pl-4 text-[13px]">Total</TableCell>
                <TableCell className="py-2 text-right text-[13px] tabular-nums text-teal-700">{taka(recTotal)}</TableCell>
                <TableCell />
                <TableCell className="py-2 text-right text-[13px] tabular-nums text-danger">{taka(payTotal)}</TableCell>
                <TableCell className="pr-4 text-right text-[11px] font-normal text-ink-500">Net {taka(recTotal - payTotal)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Panel>

        <Panel title="Books & tools" subtitle="Quick access" bodyClassName="p-1.5">
          <ul>
            {links.map(({ icon: Icon, title, bn, desc, onClick }) =>
            <li key={title}>
                <button onClick={onClick} className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left hover:bg-ink-50">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">
                      {title} <span className="font-bn text-[11px] font-normal text-ink-400">· {bn}</span>
                    </span>
                    <span className="block text-xs text-ink-500">{desc}</span>
                  </span>
                  <ChevronRight className="size-4 text-ink-300 group-hover:text-ink-500" />
                </button>
              </li>
            )}
            <li>
              <button onClick={() => toast('Exported September report.xlsx')} className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink-200 py-2 text-xs font-medium text-ink-600 hover:bg-ink-50">
                <FileSpreadsheet className="size-3.5" /> Export for accountant
              </button>
            </li>
          </ul>
        </Panel>
      </div>

      <DaybookDialog open={daybookOpen} onOpenChange={setDaybookOpen} />
    </div>);

}