import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  BarChart3,
  MoreHorizontal,
  Paperclip,
  Plus,
  Printer,
  Search,
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { FormSelect } from '../components/FormSelect';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { BillDialog } from '../components/purchases/BillDialog';
import { BillDetailDialog, type BillDetail } from '../components/purchases/BillDetailDialog';
import { expenses as seedExpenses, expenseCategories as seedCategories } from '../data/purchases';
import { parties } from '../data/parties';
import type { Expense } from '../types/erp';
import { taka } from '../utils/currency';

type Tab = 'expenses' | 'categories' | 'payees' | 'reports';

const payees = parties
  .filter((party) => party.roles.some((role) => role === 'Payee' || role === 'Vendor'))
  .map((party) => ({
    id: party.id,
    name: party.name,
    phone: party.phone,
    active: true,
    lastUsed: party.lastActivity
  }));

function ReceiptThumb({ src, onClick }: { src?: string; onClick: () => void }) {
  if (!src) return <span className="text-xs text-ink-300">—</span>;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group relative block size-8 overflow-hidden rounded-md border border-ink-100"
      aria-label="View receipt">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
        <Paperclip className="size-3 text-white" />
      </span>
    </button>
  );
}

export function Expenses() {
  const [tab, setTab] = useState<Tab>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detail, setDetail] = useState<BillDetail | null>(null);
  const [query, setQuery] = useState('');

  const filteredExpenses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return expenses;
    return expenses.filter((expense) =>
      [expense.ref, expense.category, expense.payee, expense.note, expense.method, expense.date]
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [expenses, query]);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const cash = expenses.filter((expense) => expense.method === 'Cash').reduce((sum, expense) => sum + expense.amount, 0);
  const bankAndMfs = total - cash;
  const categoryCount = new Set(expenses.map((expense) => expense.category)).size;

  const tabs: Array<[Tab, string, string]> = [
    ['expenses', 'Expense list', 'History, filters, edit and cancel'],
    ['categories', 'Categories', 'Expense category settings'],
    ['payees', 'Payees', 'People and businesses paid'],
    ['reports', 'Reports', 'Category, payee and payment method analysis']
  ];

  const summary = [
    { label: 'Expenses · Sep', value: taka(total), sub: `${expenses.length} expense entries` },
    { label: 'Cash expenses', value: taka(cash), sub: 'Paid from cash' },
    { label: 'Bank & mobile', value: taka(bankAndMfs), sub: 'Bank, bKash, Nagad & card' },
    { label: 'Categories used', value: String(categoryCount), sub: 'Active this month' }
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Expenses"
        titleBn="খরচ"
        description="Record operating expenses, manage categories and payees, and review expense reports."
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" /> Add expense
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{item.label}</p>
            <p className="mt-0.5 text-lg font-semibold text-ink">{item.value}</p>
            <p className="font-bn text-[11px] text-ink-400">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex flex-wrap gap-1 border-b border-ink-100 px-3" role="tablist">
          {tabs.map(([id, label, helper]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              title={helper}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-[13px] font-medium ${
                tab === id ? 'border-teal-600 text-ink' : 'border-transparent text-ink-500 hover:text-ink'
              }`}>
              {label}
              {id === 'expenses' && (
                <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{expenses.length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'expenses' && (
          <>
            <div className="flex flex-col gap-2 border-b border-ink-100 p-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 lg:max-w-md">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                  placeholder="Search expense, payee, category or reference"
                />
              </div>
              <FormSelect className="w-full lg:w-40" options={['All categories', ...seedCategories]} />
              <FormSelect className="w-full lg:w-40" options={['All payees', ...payees.map((payee) => payee.name)]} />
              <FormSelect className="w-full lg:w-40" options={['All payment methods', 'Cash', 'Bank', 'bKash', 'Nagad', 'Card']} />
              <FormSelect className="w-full lg:w-32" options={['All status', 'Active', 'Cancelled']} />
              <Button variant="outline" size="sm" onClick={() => toast('Expense list exported')}>
                <ArrowDownToLine className="size-4" /> Export
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Expense</TableHead>
                  <TableHead className="h-9 text-xs">Category</TableHead>
                  <TableHead className="h-9 text-xs">Payee</TableHead>
                  <TableHead className="h-9 text-xs">Receipt</TableHead>
                  <TableHead className="h-9 text-xs">Method</TableHead>
                  <TableHead className="h-9 text-xs">Reference</TableHead>
                  <TableHead className="h-9 text-right text-xs">Amount</TableHead>
                  <TableHead className="h-9 text-xs">Status</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => {
                  const open = () =>
                    setDetail({
                      ref: expense.ref,
                      date: expense.date,
                      party: expense.payee,
                      partyId: expense.payeeId,
                      description: expense.note,
                      category: expense.category,
                      total: expense.amount,
                      paid: expense.paid,
                      receipt: expense.receipt
                    });
                  return (
                    <TableRow key={expense.id} className="cursor-pointer text-[13px]" onClick={open}>
                      <TableCell className="py-2 pl-4">
                        <span className="font-medium text-ink">{expense.ref}</span>
                        <span className="block text-[11px] text-ink-400">{expense.date}</span>
                      </TableCell>
                      <TableCell className="py-2"><StatusBadge tone="neutral">{expense.category}</StatusBadge></TableCell>
                      <TableCell className="py-2">
                        {expense.payeeId ? (
                          <Link
                            to={`/app/parties?id=${expense.payeeId}`}
                            onClick={(event) => event.stopPropagation()}
                            className="font-medium text-teal-700 hover:underline">
                            {expense.payee}
                          </Link>
                        ) : (
                          <span className="text-ink-700">{expense.payee}</span>
                        )}
                        <span className="block max-w-[220px] truncate text-[11px] text-ink-400">{expense.note}</span>
                      </TableCell>
                      <TableCell className="py-2"><ReceiptThumb src={expense.receipt} onClick={open} /></TableCell>
                      <TableCell className="py-2 text-ink-600">{expense.method}</TableCell>
                      <TableCell className="py-2 text-ink-500">—</TableCell>
                      <TableCell className="py-2 text-right font-medium">{taka(expense.amount)}</TableCell>
                      <TableCell className="py-2"><StatusBadge tone="success" dot>Active</StatusBadge></TableCell>
                      <TableCell className="py-2 pr-4 text-right">
                        <button
                          className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink"
                          onClick={(event) => {
                            event.stopPropagation();
                            toast('Expense actions', { description: 'View · Edit · Print · Cancel' });
                          }}
                          aria-label={`Actions for ${expense.ref}`}>
                          <MoreHorizontal className="size-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}

        {tab === 'categories' && (
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 p-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Expense categories</p>
                <p className="text-[11px] text-ink-500">Create, rename, activate or deactivate categories used when recording expenses.</p>
              </div>
              <Button size="sm" onClick={() => toast('Add category dialog')}>
                <Plus className="size-4" /> Add category
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Category</TableHead>
                  <TableHead className="h-9 text-xs">Description</TableHead>
                  <TableHead className="h-9 text-right text-xs">This month</TableHead>
                  <TableHead className="h-9 text-xs">Status</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seedCategories.map((category) => {
                  const amount = expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0);
                  return (
                    <TableRow key={category} className="text-[13px]">
                      <TableCell className="py-2 pl-4 font-medium text-ink">{category}</TableCell>
                      <TableCell className="py-2 text-ink-500">Operating expense category</TableCell>
                      <TableCell className="py-2 text-right">{amount ? taka(amount) : '—'}</TableCell>
                      <TableCell className="py-2"><StatusBadge tone="success" dot>Active</StatusBadge></TableCell>
                      <TableCell className="py-2 pr-4 text-right">
                        <button
                          className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink"
                          onClick={() => toast('Category actions', { description: 'Edit · Deactivate' })}>
                          <MoreHorizontal className="size-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {tab === 'payees' && (
          <div>
            <div className="flex items-center justify-between gap-3 border-b border-ink-100 p-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Expense payees</p>
                <p className="text-[11px] text-ink-500">Reusable people and businesses you regularly pay.</p>
              </div>
              <Button size="sm" onClick={() => toast('Add payee dialog')}>
                <Plus className="size-4" /> Add payee
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Payee</TableHead>
                  <TableHead className="h-9 text-xs">Phone</TableHead>
                  <TableHead className="h-9 text-xs">Last used</TableHead>
                  <TableHead className="h-9 text-right text-xs">Total paid</TableHead>
                  <TableHead className="h-9 text-xs">Status</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payees.map((payee) => {
                  const paid = expenses.filter((expense) => expense.payeeId === payee.id).reduce((sum, expense) => sum + expense.amount, 0);
                  return (
                    <TableRow key={payee.id} className="text-[13px]">
                      <TableCell className="py-2 pl-4">
                        <Link to={`/app/parties?id=${payee.id}`} className="font-medium text-teal-700 hover:underline">{payee.name}</Link>
                      </TableCell>
                      <TableCell className="py-2 text-ink-600">{payee.phone || '—'}</TableCell>
                      <TableCell className="py-2 text-ink-500">{payee.lastUsed}</TableCell>
                      <TableCell className="py-2 text-right">{paid ? taka(paid) : '—'}</TableCell>
                      <TableCell className="py-2"><StatusBadge tone="success" dot>Active</StatusBadge></TableCell>
                      <TableCell className="py-2 pr-4 text-right">
                        <button
                          className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink"
                          onClick={() => toast('Payee actions', { description: 'Edit · Deactivate · Delete' })}>
                          <MoreHorizontal className="size-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {tab === 'reports' && (
          <div className="p-4">
            <div className="mb-4 flex flex-col gap-2 rounded-xl border border-ink-100 bg-ink-50/50 p-3 sm:flex-row sm:items-end">
              <label className="text-[12px] font-medium text-ink">
                From
                <Input className="mt-1 w-full sm:w-40" defaultValue="01 Sep 2026" />
              </label>
              <label className="text-[12px] font-medium text-ink">
                To
                <Input className="mt-1 w-full sm:w-40" defaultValue="30 Sep 2026" />
              </label>
              <Button size="sm" onClick={() => toast('Expense report refreshed')}>
                <BarChart3 className="size-4" /> Refresh
              </Button>
              <div className="flex-1" />
              <Button variant="outline" size="sm" onClick={() => toast('Print preview opened')}>
                <Printer className="size-4" /> Print
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {[
                {
                  title: 'By category',
                  icon: Settings2,
                  rows: seedCategories.map((category) => ({
                    label: category,
                    value: expenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0)
                  })).filter((row) => row.value > 0)
                },
                {
                  title: 'By payee',
                  icon: Search,
                  rows: Array.from(new Set(expenses.map((expense) => expense.payee))).map((payee) => ({
                    label: payee,
                    value: expenses.filter((expense) => expense.payee === payee).reduce((sum, expense) => sum + expense.amount, 0)
                  })).sort((a, b) => b.value - a.value).slice(0, 6)
                },
                {
                  title: 'By payment method',
                  icon: BarChart3,
                  rows: Array.from(new Set(expenses.map((expense) => expense.method))).map((method) => ({
                    label: method,
                    value: expenses.filter((expense) => expense.method === method).reduce((sum, expense) => sum + expense.amount, 0)
                  })).sort((a, b) => b.value - a.value)
                }
              ].map((group) => {
                const max = Math.max(...group.rows.map((row) => row.value), 1);
                const Icon = group.icon;
                return (
                  <div key={group.title} className="rounded-xl border border-ink-100 bg-white p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{group.title}</p>
                        <p className="text-[11px] text-ink-500">Sep 2026</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {group.rows.map((row) => (
                        <div key={row.label}>
                          <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                            <span className="truncate text-ink-600">{row.label}</span>
                            <span className="font-medium text-ink">{taka(row.value)}</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-ink-50">
                            <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.max((row.value / max) * 100, 4)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BillDialog
        mode="expense"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nextRef={`EXP-${String(62 + expenses.length - seedExpenses.length).padStart(6, '0')}`}
        onSavePurchase={() => undefined}
        onSaveExpense={(expense) => {
          setExpenses((items) => [expense, ...items]);
          setDialogOpen(false);
          setTab('expenses');
          toast.success(`${expense.ref} saved`, { description: `${expense.category} · ${taka(expense.amount)}` });
        }}
      />

      <BillDetailDialog bill={detail} onClose={() => setDetail(null)} />
    </div>
  );
}
