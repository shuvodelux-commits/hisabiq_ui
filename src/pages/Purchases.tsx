import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Paperclip, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { BillDialog } from '../components/purchases/BillDialog';
import { BillDetailDialog, type BillDetail } from '../components/purchases/BillDetailDialog';
import { expenses as seedExpenses, purchases as seedPurchases } from '../data/purchases';
import type { Expense, Purchase } from '../types/erp';
import { taka } from '../utils/currency';

type Tab = 'purchases' | 'expenses';

function PayStatus({ total, paid }: {total: number;paid: number;}) {
  if (paid >= total) return <StatusBadge tone="success" dot>Paid</StatusBadge>;
  if (paid > 0) return <StatusBadge tone="warning" dot>Partial</StatusBadge>;
  return <StatusBadge tone="danger" dot>Due</StatusBadge>;
}

function ReceiptThumb({ src, onClick }: {src?: string;onClick: () => void;}) {
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
    </button>);

}

export function Purchases() {
  const [tab, setTab] = useState<Tab>('purchases');
  const [purchases, setPurchases] = useState<Purchase[]>(seedPurchases);
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses);
  const [dialog, setDialog] = useState<Tab | null>(null);
  const [detail, setDetail] = useState<BillDetail | null>(null);

  const purchaseTotal = purchases.reduce((s, p) => s + p.total, 0);
  const supplierDue = purchases.reduce((s, p) => s + p.total - p.paid, 0);
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const expenseDue = expenses.reduce((s, e) => s + e.amount - e.paid, 0);
  const missingReceipts =
  purchases.filter((p) => !p.receipt).length + expenses.filter((e) => !e.receipt).length;

  const summary = [
  { label: 'Purchases · Sep', value: taka(purchaseTotal), sub: `${purchases.length} bills` },
  { label: 'Due to suppliers', value: taka(supplierDue), sub: 'দেনা', tone: 'text-danger' },
  { label: 'Expenses · Sep', value: taka(expenseTotal), sub: expenseDue ? `${taka(expenseDue)} unpaid` : 'All paid' },
  { label: 'Missing receipts', value: String(missingReceipts), sub: 'Attach for clean books', tone: missingReceipts ? 'text-warning' : 'text-ink' }];


  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Purchases & Expenses"
        titleBn="ক্রয় ও খরচ"
        description="Supplier bills and day-to-day spending, with receipts attached."
        actions={
        <>
            <Button variant="outline" size="sm" onClick={() => setDialog('expenses')}>
              <Plus className="size-4" /> Add expense
            </Button>
            <Button size="sm" onClick={() => setDialog('purchases')}>
              <Plus className="size-4" /> Record purchase
            </Button>
          </>
        } />
      

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) =>
        <div key={s.label} className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{s.label}</p>
            <p className={`mt-0.5 text-lg font-semibold tabular-nums ${s.tone ?? 'text-ink'}`}>{s.value}</p>
            <p className="font-bn text-[11px] text-ink-400">{s.sub}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex gap-1 border-b border-ink-100 px-3" role="tablist">
          {(
          [
          ['purchases', 'Purchases', purchases.length],
          ['expenses', 'Expenses', expenses.length]] as
          [Tab, string, number][]).
          map(([id, label, count]) =>
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-[13px] font-medium ${
            tab === id ? 'border-teal-600 text-ink' : 'border-transparent text-ink-500 hover:text-ink'}`
            }>
            
              {label} <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{count}</span>
            </button>
          )}
        </div>

        {tab === 'purchases' ?
        <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-4 text-xs">Bill</TableHead>
                <TableHead className="h-9 text-xs">Supplier</TableHead>
                <TableHead className="h-9 text-xs">Items</TableHead>
                <TableHead className="h-9 text-xs">Receipt</TableHead>
                <TableHead className="h-9 text-right text-xs">Total</TableHead>
                <TableHead className="h-9 text-right text-xs">Paid</TableHead>
                <TableHead className="h-9 text-right text-xs">Due</TableHead>
                <TableHead className="h-9 pr-4 text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((p) => {
              const open = () =>
              setDetail({ ref: p.ref, date: p.date, party: p.supplier, partyId: p.supplierId, description: p.items, total: p.total, paid: p.paid, receipt: p.receipt });
              return (
                <TableRow key={p.id} className="cursor-pointer text-[13px]" onClick={open}>
                    <TableCell className="py-2 pl-4">
                      <span className="font-medium text-ink">{p.ref}</span>
                      <span className="block text-[11px] text-ink-400">{p.date}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      <Link to={`/app/parties?id=${p.supplierId}`} onClick={(e) => e.stopPropagation()} className="font-medium text-teal-700 hover:underline">
                        {p.supplier}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate py-2 text-ink-600">{p.items}</TableCell>
                    <TableCell className="py-2"><ReceiptThumb src={p.receipt} onClick={open} /></TableCell>
                    <TableCell className="py-2 text-right tabular-nums font-medium">{taka(p.total)}</TableCell>
                    <TableCell className="py-2 text-right tabular-nums text-ink-600">{taka(p.paid)}</TableCell>
                    <TableCell className={`py-2 text-right tabular-nums ${p.total - p.paid > 0 ? 'font-medium text-danger' : 'text-ink-400'}`}>
                      {p.total - p.paid > 0 ? taka(p.total - p.paid) : '—'}
                    </TableCell>
                    <TableCell className="py-2 pr-4"><PayStatus total={p.total} paid={p.paid} /></TableCell>
                  </TableRow>);

            })}
            </TableBody>
          </Table> :

        <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-4 text-xs">Expense</TableHead>
                <TableHead className="h-9 text-xs">Category</TableHead>
                <TableHead className="h-9 text-xs">Paid to</TableHead>
                <TableHead className="h-9 text-xs">Receipt</TableHead>
                <TableHead className="h-9 text-xs">Method</TableHead>
                <TableHead className="h-9 text-right text-xs">Amount</TableHead>
                <TableHead className="h-9 pr-4 text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((e) => {
              const open = () =>
              setDetail({ ref: e.ref, date: e.date, party: e.payee, partyId: e.payeeId, description: e.note, category: e.category, total: e.amount, paid: e.paid, receipt: e.receipt });
              return (
                <TableRow key={e.id} className="cursor-pointer text-[13px]" onClick={open}>
                    <TableCell className="py-2 pl-4">
                      <span className="font-medium text-ink">{e.ref}</span>
                      <span className="block text-[11px] text-ink-400">{e.date}</span>
                    </TableCell>
                    <TableCell className="py-2"><StatusBadge tone="neutral">{e.category}</StatusBadge></TableCell>
                    <TableCell className="py-2">
                      {e.payeeId ?
                    <Link to={`/app/parties?id=${e.payeeId}`} onClick={(ev) => ev.stopPropagation()} className="font-medium text-teal-700 hover:underline">{e.payee}</Link> :

                    <span className="text-ink-700">{e.payee}</span>
                    }
                      <span className="block max-w-[240px] truncate text-[11px] text-ink-400">{e.note}</span>
                    </TableCell>
                    <TableCell className="py-2"><ReceiptThumb src={e.receipt} onClick={open} /></TableCell>
                    <TableCell className="py-2 text-ink-600">{e.method}</TableCell>
                    <TableCell className="py-2 text-right tabular-nums font-medium">{taka(e.amount)}</TableCell>
                    <TableCell className="py-2 pr-4"><PayStatus total={e.amount} paid={e.paid} /></TableCell>
                  </TableRow>);

            })}
            </TableBody>
          </Table>
        }
      </div>

      {dialog &&
      <BillDialog
        key={dialog}
        mode={dialog === 'purchases' ? 'purchase' : 'expense'}
        open
        onOpenChange={(o) => !o && setDialog(null)}
        nextRef={dialog === 'purchases' ? `PUR-${String(119 + purchases.length - seedPurchases.length).padStart(6, '0')}` : `EXP-${String(62 + expenses.length - seedExpenses.length).padStart(6, '0')}`}
        onSavePurchase={(p) => {
          setPurchases((ps) => [p, ...ps]);
          setTab('purchases');
          setDialog(null);
          toast.success(`${p.ref} saved`, { description: p.total - p.paid > 0 ? `${taka(p.total - p.paid)} added to ${p.supplier}’s payable` : 'Fully paid' });
        }}
        onSaveExpense={(e) => {
          setExpenses((es) => [e, ...es]);
          setTab('expenses');
          setDialog(null);
          toast.success(`${e.ref} saved`, { description: `${e.category} · ${taka(e.amount)}` });
        }} />

      }

      <BillDetailDialog bill={detail} onClose={() => setDetail(null)} />
    </div>);

}