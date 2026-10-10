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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import { Button } from '../components/Button';
import { FormSelect } from '../components/FormSelect';
import { AppDateRangePicker } from '../components/AppDateRangePicker';
import { expenseDateIso, formatRange, type IsoRange } from '../utils/dateRange';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { BillDialog } from '../components/purchases/BillDialog';
import { BillDetailDialog, type BillDetail } from '../components/purchases/BillDetailDialog';
import { expenses as seedExpenses } from '../data/purchases';
import { availableExpenseCategories, availableParties, createPreviewExpenseCategory, createPreviewParty } from '../data/erpDemoStore';
import { expenseCsv, expenseStatus, filterExpenseList } from '../expenses/expenseWorkflow';
import type { Expense, Party } from '../types/erp';
import { taka } from '../utils/currency';

type Tab = 'expenses' | 'categories' | 'payees' | 'reports';

const reportPaymentMethods = ['Cash', 'Bank', 'bKash', 'Nagad', 'Card'] as const;

function paymentsFor(expense: Expense) {
  if (expense.payments?.length) return expense.payments;
  if (expense.paid <= 0) return [];
  return [{ id: `legacy-${expense.id}`, method: expense.method, amount: expense.paid }];
}

function paymentLabel(expense: Expense) {
  const payments = paymentsFor(expense);
  if (payments.length > 1) return 'Multiple';
  return payments[0]?.method ?? expense.method;
}

const payeesForPreview = () => availableParties()
  .filter((party) => party.roles.some((role) => role === 'Payee' || role === 'Vendor'))
  .map((party) => ({
    id: party.id,
    name: party.name,
    phone: party.phone,
    active: true,
    lastUsed: party.lastActivity
  }));

function ReceiptThumb({ src, onClick }: { src?: string; onClick: () => void }) {
  if (!src) return <span className="text-xs text-helper">—</span>;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group relative block size-8 overflow-hidden rounded-md border border-border"
      aria-label="View receipt">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-inverse/40 opacity-0 transition-opacity group-hover:opacity-100">
        <Paperclip className="size-3 text-white" />
      </span>
    </button>
  );
}

export function Expenses() {
  const [tab, setTab] = useState<Tab>('expenses');
  const [payees,setPayees] = useState(payeesForPreview);
  const [categories,setCategories] = useState(availableExpenseCategories);
  const [quickAdd,setQuickAdd] = useState<'category'|'payee'|null>(null);
  const [quickName,setQuickName] = useState('');
  const [quickPhone,setQuickPhone] = useState('');
  const [quickError,setQuickError] = useState('');
  const [expenseFormRevision,setExpenseFormRevision] = useState(0);
  const [categoryFilter,setCategoryFilter] = useState('All categories');
  const [payeeFilter,setPayeeFilter] = useState('All payees');
  const [paymentFilter,setPaymentFilter] = useState('All payment methods');
  const [statusFilter,setStatusFilter] = useState('All status');
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detail, setDetail] = useState<BillDetail | null>(null);
  const [query, setQuery] = useState('');
  // Keep the initial demonstration report on September's seeded expense entries.
  const [reportRange, setReportRange] = useState<IsoRange>({ from: '2026-09-01', to: '2026-09-30' });
  const reportExpenses = useMemo(() => expenses.filter((expense) => {
    const day = expenseDateIso(expense.date);
    return !!day && (!reportRange.from || day >= reportRange.from) && (!reportRange.to || day <= reportRange.to);
  }), [expenses, reportRange.from, reportRange.to]);
  const reportPeriod = reportRange.from === '2026-09-01' && reportRange.to === '2026-09-30'
    ? 'Sep 2026' : formatRange(reportRange);


  const filteredExpenses = useMemo(()=>filterExpenseList(expenses,{query,category:categoryFilter,payee:payeeFilter,paymentMethod:paymentFilter,status:statusFilter}),
    [expenses,query,categoryFilter,payeeFilter,paymentFilter,statusFilter]);

  const openQuickAdd=(type:'category'|'payee')=>{
    setQuickAdd(type);setQuickName('');setQuickPhone('');setQuickError('');
  };
  const closeQuickAdd=()=>{setQuickAdd(null);setQuickError('');};
  const createQuickEntity=()=>{
    const name=quickName.trim();
    if(!name){setQuickError('Name is required.');return;}
    if(quickAdd==='category'){
      if(categories.some(item=>item.toLocaleLowerCase()===name.toLocaleLowerCase())){
        setQuickError('Category already exists.');return;
      }
      createPreviewExpenseCategory(name);
      setCategories(availableExpenseCategories());
    }else if(quickAdd==='payee'){
      if(availableParties().some(item=>item.name.toLocaleLowerCase()===name.toLocaleLowerCase())){
        setQuickError('A party with this name already exists.');return;
      }
      const party:Party={id:'expense-payee-'+Date.now(),name,phone:quickPhone.trim(),area:'',
        roles:['Payee'],balance:0,lastActivity:'Just now',avatarColor:'#0D7C74'};
      createPreviewParty(party);
      setPayees(payeesForPreview());
    }else{return;}
    setExpenseFormRevision(value=>value+1);
    closeQuickAdd();
    toast.success(name+' created in UI preview');
  };
  const exportExpenses=()=>{
    const csv=expenseCsv(filteredExpenses);
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');
    link.href=url;link.download='hisabiq-expenses-preview.csv';document.body.appendChild(link);link.click();link.remove();
    URL.revokeObjectURL(url);
  };

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const cash = expenses.reduce((sum, expense) =>
    sum + paymentsFor(expense).filter((payment) => payment.method === 'Cash').reduce((paymentSum, payment) => paymentSum + payment.amount, 0), 0);
  const bankAndMfs = expenses.reduce((sum, expense) =>
    sum + paymentsFor(expense).filter((payment) => payment.method !== 'Cash').reduce((paymentSum, payment) => paymentSum + payment.amount, 0), 0);
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
          <div key={item.label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{item.label}</p>
            <p className="mt-0.5 text-lg font-semibold text-ink">{item.value}</p>
            <p className="font-bn text-[11px] text-ink-400">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex flex-wrap gap-1 border-b border-border px-3" role="tablist">
          {tabs.map(([id, label, helper]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              title={helper}
              className={`flex items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-medium ${
                tab === id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'
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
            <div className="flex flex-col gap-2 border-b border-border p-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 lg:max-w-md">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                  placeholder="Search expense, payee, category or reference"
                />
              </div>
              <FormSelect aria-label="Expense category filter" className="w-full lg:w-40" value={categoryFilter} onChange={event=>setCategoryFilter(event.target.value)} options={['All categories', ...categories]} />
              <FormSelect aria-label="Expense payee filter" className="w-full lg:w-40" value={payeeFilter} onChange={event=>setPayeeFilter(event.target.value)} options={['All payees', ...new Set([...payees.map(payee=>payee.name),...expenses.map(expense=>expense.payee)])]} />
              <FormSelect aria-label="Expense payment filter" className="w-full lg:w-40" value={paymentFilter} onChange={event=>setPaymentFilter(event.target.value)} options={['All payment methods', 'Cash', 'Bank', 'bKash', 'Nagad', 'Card']} />
              <FormSelect aria-label="Expense status filter" className="w-full lg:w-32" value={statusFilter} onChange={event=>setStatusFilter(event.target.value)} options={['All status', 'Active', 'Cancelled']} />
              <Button variant="outline" size="sm" onClick={exportExpenses}>
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
                      payments: expense.payments,
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
                      <TableCell className="py-2 text-ink-600">
                        {paymentLabel(expense)}
                        {expense.payments && expense.payments.length > 1 && (
                          <span className="block text-[10.5px] text-ink-400">
                            {expense.payments.map((payment) => payment.method).join(' + ')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-ink-500">—</TableCell>
                      <TableCell className="py-2 text-right font-medium">{taka(expense.amount)}</TableCell>
                      <TableCell className="py-2"><StatusBadge tone={expenseStatus(expense)==='Active'?'success':'neutral'} dot>{expenseStatus(expense)}</StatusBadge></TableCell>
                      <TableCell className="py-2 pr-4 text-right">
                        <button
                          className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink"
                          onClick={(event) => { event.stopPropagation(); open(); }}
                           title="View expense details · editing and cancellation require an audited workflow"
                           aria-label={`View ${expense.ref}`}>
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
            <div className="flex items-center justify-between gap-3 border-b border-border p-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Expense categories</p>
                <p className="text-[11px] text-ink-500">Create, rename, activate or deactivate categories used when recording expenses.</p>
              </div>
              <Button size="sm" onClick={() => openQuickAdd('category')}>
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
                {categories.map((category) => {
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
                          disabled title="Category changes to used records require an audited workflow" aria-label="Category changes unavailable in preview">
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
            <div className="flex items-center justify-between gap-3 border-b border-border p-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Expense payees</p>
                <p className="text-[11px] text-ink-500">Reusable people and businesses you regularly pay.</p>
              </div>
              <Button size="sm" onClick={() => openQuickAdd('payee')}>
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
                  const paid = expenses.filter((expense) => expense.payeeId === payee.id).reduce((sum, expense) => sum + expense.paid, 0);
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
                          disabled title="Edit payee identity in Parties; deactivation requires an audited workflow" aria-label="Payee changes unavailable in preview">
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
            <div className="mb-4 flex flex-col gap-2 rounded-xl border border-border bg-ink-50/50 p-3 sm:flex-row sm:items-end">
              <div className="w-full sm:w-auto">
                <p className="mb-1 text-[12px] font-medium text-ink">Date range <span className="font-bn text-ink-400">· সময়কাল</span></p>
                <AppDateRangePicker label="Expense report date range" className="w-full sm:w-[280px]"
                  value={reportRange} onChange={setReportRange} />
              </div>
              <Button size="sm" variant="outline" disabled title="Report updates automatically with date range">
                <BarChart3 className="size-4" /> Refresh
              </Button>
              <div className="flex-1" />
              <Button variant="outline" size="sm" disabled title="A dedicated Expense report print template is not yet available">
                <Printer className="size-4" /> Print
              </Button>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {[
                {
                  title: 'By category',
                  icon: Settings2,
                  rows: categories.map((category) => ({
                    label: category,
                    value: reportExpenses.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0)
                  })).filter((row) => row.value > 0)
                },
                {
                  title: 'By payee',
                  icon: Search,
                  rows: Array.from(new Set(reportExpenses.map((expense) => expense.payee))).map((payee) => ({
                    label: payee,
                    value: reportExpenses.filter((expense) => expense.payee === payee).reduce((sum, expense) => sum + expense.amount, 0)
                  })).sort((a, b) => b.value - a.value).slice(0, 6)
                },
                {
                  title: 'By payment method',
                  icon: BarChart3,
                  rows: reportPaymentMethods.map((method) => ({
                    label: method,
                    value: reportExpenses.reduce((sum, expense) =>
                      sum + paymentsFor(expense)
                        .filter((payment) => payment.method === method)
                        .reduce((paymentSum, payment) => paymentSum + payment.amount, 0), 0)
                  })).filter((row) => row.value > 0).sort((a, b) => b.value - a.value)
                }
              ].map((group) => {
                const max = Math.max(...group.rows.map((row) => row.value), 1);
                const Icon = group.icon;
                return (
                  <div key={group.title} className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink">{group.title}</p>
                        <p className="text-[11px] text-ink-500">{reportPeriod}</p>
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

      <Dialog open={quickAdd!==null} onOpenChange={next=>{if(!next)closeQuickAdd();}}>
        <DialogContent role="dialog" aria-label={quickAdd==='category'?'New expense category':'New expense payee'} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{quickAdd==='category'?'New expense category':'New expense payee'}</DialogTitle>
            <DialogDescription>
              Quick Add stays in Expenses · <span className="font-bn">একই পেজে নতুন তথ্য যোগ করুন</span>. Local UI preview only.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={event=>{event.preventDefault();createQuickEntity();}}>
            <label className="block text-[13px] font-medium text-ink">
              {quickAdd==='category'?'Category name':'Payee name'}
              <Input autoFocus aria-label={quickAdd==='category'?'Category name':'Payee name'} className="mt-1"
                value={quickName} onChange={event=>{setQuickName(event.target.value);setQuickError('');}} />
            </label>
            {quickAdd==='payee'&&<label className="block text-[13px] font-medium text-ink">
              Phone <span className="font-bn text-xs text-ink-400">· ফোন</span>
              <Input aria-label="Payee phone" className="mt-1" value={quickPhone} onChange={event=>setQuickPhone(event.target.value)} />
            </label>}
            {quickError&&<p role="alert" className="text-xs text-danger">{quickError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeQuickAdd}>Cancel</Button>
              <Button type="submit"><Plus className="size-4"/> {quickAdd==='category'?'Create category':'Create payee'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <BillDialog
        key={expenseFormRevision}
        mode="expense"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nextRef={`EXP-${String(62 + expenses.length - seedExpenses.length).padStart(6, '0')}`}
        onSavePurchase={() => undefined}
        onSaveExpense={(expense) => {
          setExpenses((items) => [expense, ...items]);
          setDialogOpen(false);
          setTab('expenses');
          toast.success(`${expense.ref} saved in UI preview`, { description: `${expense.category} · ${taka(expense.amount)} · No ledger or account payment posted` });
        }}
      />

      <BillDetailDialog bill={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

