import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Banknote,
  BookOpen,
  Copy,
  CornerUpLeft,
  FileClock,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  UserRound
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import { FormSelect } from '../components/FormSelect';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { ReceiptPreview } from '../components/brand/ReceiptPreview';
import { FloatingPanel } from '../components/layout/FloatingPanel';
import { StatusBadge, type StatusTone } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { saleTemplates, salesDrafts, salesInvoices as seedInvoices, salesReturns as seedReturns } from '../data/sales';
import type { PaymentMethod, SalePayment, SalesInvoice, SalesInvoiceStatus, SalesReturn } from '../types/erp';
import { taka } from '../utils/currency';

type Tab = 'sales' | 'return' | 'returns' | 'drafts';

const paymentMethods: PaymentMethod[] = ['Cash', 'bKash', 'Nagad', 'Card', 'Bank'];

const statusTone: Record<SalesInvoiceStatus, StatusTone> = {
  Paid: 'success',
  Partial: 'warning',
  Due: 'danger',
  'Part returned': 'info',
  Returned: 'neutral'
};

function PaymentStatus({ invoice }: { invoice: SalesInvoice }) {
  return <StatusBadge tone={statusTone[invoice.status]} dot>{invoice.status}</StatusBadge>;
}

function invoiceQty(line: SalesInvoice['lines'][number]) {
  return line.quantity.toLowerCase().includes(line.unit.toLowerCase()) ? line.quantity : `${line.quantity} ${line.unit}`;
}

function InvoiceActions({
  invoice,
  onView,
  onPayment,
  onReturn
}: {
  invoice: SalesInvoice;
  onView: () => void;
  onPayment: () => void;
  onReturn: () => void;
}) {
  const navigate = useNavigate();
  const itemClass = 'flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50';

  return (
    <FloatingPanel
      label={`Actions for ${invoice.invoice}`}
      width={210}
      trigger={({ toggle, open }) => (
        <button
          onClick={(event) => {
            event.stopPropagation();
            toggle();
          }}
          aria-expanded={open}
          aria-label={`Actions for ${invoice.invoice}`}
          className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink">
          <MoreHorizontal className="size-4" />
        </button>
      )}>
      {(close) => (
        <div className="py-1">
          <button className={itemClass} onClick={() => { close(); onView(); }}>
            <FileText className="size-4 text-ink-400" /> View invoice
          </button>
          <button className={itemClass} onClick={() => { close(); toast('Opening sale in POS edit mode'); navigate('/app/pos'); }}>
            <Pencil className="size-4 text-ink-400" /> Edit sale
          </button>
          <button className={itemClass} onClick={() => { close(); toast('Duplicating invoice into POS'); navigate('/app/pos'); }}>
            <Copy className="size-4 text-ink-400" /> Duplicate
          </button>
          {invoice.due > 0 && (
            <button className={itemClass} onClick={() => { close(); onPayment(); }}>
              <Banknote className="size-4 text-ink-400" /> Take payment
            </button>
          )}
          <button className={itemClass} onClick={() => { close(); onReturn(); }}>
            <CornerUpLeft className="size-4 text-ink-400" /> Return items
          </button>
          {invoice.partyId && (
            <button className={itemClass} onClick={() => { close(); navigate(`/app/parties?id=${invoice.partyId}`); }}>
              <UserRound className="size-4 text-ink-400" /> Customer ledger
            </button>
          )}
          <button className={itemClass} onClick={() => { close(); toast.success('Invoice sent to printer'); }}>
            <Printer className="size-4 text-ink-400" /> Print
          </button>
        </div>
      )}
    </FloatingPanel>
  );
}

function InvoiceDialog({
  invoice,
  onClose,
  onPayment,
  onReturn
}: {
  invoice: SalesInvoice | null;
  onClose: () => void;
  onPayment: (invoice: SalesInvoice) => void;
  onReturn: (invoice: SalesInvoice) => void;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl scrollbar-thin">
        {invoice && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                {invoice.invoice}
                <PaymentStatus invoice={invoice} />
              </DialogTitle>
              <DialogDescription>
                {invoice.date}, {invoice.time} · {invoice.party} · {invoice.salesperson}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-3">
                <div className="rounded-xl border border-ink-100">
                  <div className="grid grid-cols-2 gap-3 border-b border-ink-100 p-3 text-[12.5px] sm:grid-cols-4">
                    <div><p className="text-ink-400">Customer</p><p className="font-medium text-ink">{invoice.party}</p></div>
                    <div><p className="text-ink-400">Phone</p><p className="font-medium text-ink">{invoice.phone ?? '—'}</p></div>
                    <div><p className="text-ink-400">Guardian</p><p className="font-medium text-ink">{invoice.guardianName ?? '—'}</p></div>
                    <div><p className="text-ink-400">Address</p><p className="font-medium text-ink">{invoice.address ?? '—'}</p></div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-9 pl-3 text-xs">Item</TableHead>
                        <TableHead className="h-9 text-xs">Qty</TableHead>
                        <TableHead className="h-9 text-right text-xs">Price</TableHead>
                        <TableHead className="h-9 pr-3 text-right text-xs">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.lines.map((line) => (
                        <TableRow key={line.id} className="text-[12.5px]">
                          <TableCell className="py-2 pl-3">
                            <p className="font-medium text-ink">{line.name}</p>
                            {line.serials?.length ? <p className="mt-0.5 text-[11px] text-ink-400">Serial: {line.serials.join(', ')}</p> : null}
                          </TableCell>
                          <TableCell className="py-2">{invoiceQty(line)}</TableCell>
                          <TableCell className="py-2 text-right">{taka(line.price, line.price % 1 ? 2 : 0)}/{line.unit}</TableCell>
                          <TableCell className="py-2 pr-3 text-right font-medium">{taka(line.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="grid gap-1 border-t border-ink-100 p-3 text-[12.5px] sm:ml-auto sm:w-72">
                    <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span>{taka(invoice.subtotal)}</span></div>
                    {invoice.discount > 0 && <div className="flex justify-between"><span className="text-ink-500">Discount</span><span>−{taka(invoice.discount)}</span></div>}
                    <div className="flex justify-between"><span className="text-ink-500">Rounding</span><span>{invoice.rounding >= 0 ? '+' : '−'}{taka(Math.abs(invoice.rounding))}</span></div>
                    <div className="flex justify-between border-t border-ink-100 pt-1.5 text-sm font-semibold"><span>Total</span><span>{taka(invoice.total)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-500">Paid</span><span>{taka(invoice.paid)}</span></div>
                    <div className="flex justify-between font-medium"><span className="text-ink-500">Due</span><span className={invoice.due > 0 ? 'text-danger' : 'text-success'}>{invoice.due > 0 ? taka(invoice.due) : '৳0'}</span></div>
                  </div>
                </div>

                <div className="rounded-xl border border-ink-100 p-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">Payments</p>
                  {invoice.payments.length ? (
                    <div className="mt-2 divide-y divide-ink-100">
                      {invoice.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between gap-3 py-2 text-[12.5px]">
                          <div>
                            <p className="font-medium text-ink">{payment.method}</p>
                            <p className="text-[11px] text-ink-400">{payment.account ?? 'Default account'}</p>
                          </div>
                          <span className="font-medium">{taka(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="mt-2 text-sm text-ink-500">No payment received yet.</p>}
                </div>
              </div>

              <div className="rounded-xl bg-ink-50 py-4">
                <ReceiptPreview
                  invoice={invoice.invoice}
                  customer={invoice.party === 'Walk-in customer' ? undefined : invoice.party}
                  lines={invoice.lines.map((line) => ({
                    name: line.name,
                    qty: invoiceQty(line),
                    price: line.price,
                    total: line.total
                  }))}
                  subtotal={invoice.subtotal}
                  discount={invoice.discount}
                  rounding={invoice.rounding}
                  total={invoice.total}
                  paid={invoice.paid}
                  due={invoice.due}
                  method={invoice.payments.length > 1 ? 'Multiple' : invoice.method}
                />
              </div>
            </div>

            {invoice.note && <p className="rounded-lg bg-warning-bg px-3 py-2 text-[12.5px] text-warning">{invoice.note}</p>}

            <DialogFooter className="flex-wrap">
              {invoice.partyId && (
                <Button variant="outline" onClick={() => navigate(`/app/parties?id=${invoice.partyId}`)}>
                  <BookOpen className="size-4" /> Ledger
                </Button>
              )}
              <Button variant="outline" onClick={() => toast.success('Invoice sent to printer')}>
                <Printer className="size-4" /> Print
              </Button>
              <Button variant="outline" onClick={() => onReturn(invoice)}>
                <CornerUpLeft className="size-4" /> Return
              </Button>
              {invoice.due > 0 && <Button onClick={() => onPayment(invoice)}><Banknote className="size-4" /> Take payment</Button>}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

type PaymentDraft = { id: string; method: PaymentMethod; amount: string; account: string };

function PaymentDialog({
  invoice,
  onClose,
  onSave
}: {
  invoice: SalesInvoice | null;
  onClose: () => void;
  onSave: (invoice: SalesInvoice, rows: PaymentDraft[]) => void;
}) {
  const [rows, setRows] = useState<PaymentDraft[]>([{ id: 'p1', method: 'Cash', amount: '', account: '' }]);

  const total = rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

  const close = () => {
    setRows([{ id: 'p1', method: 'Cash', amount: '', account: '' }]);
    onClose();
  };

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-xl">
        {invoice && (
          <>
            <DialogHeader>
              <DialogTitle>Take payment <span className="font-bn text-sm font-normal text-ink-500">পেমেন্ট নিন</span></DialogTitle>
              <DialogDescription>{invoice.invoice} · {invoice.party} · due {taka(invoice.due)}</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              {rows.map((row, index) => (
                <div key={row.id} className="grid gap-2 rounded-xl border border-ink-100 p-3 sm:grid-cols-[140px_1fr_120px_auto]">
                  <label className="text-[12px] font-medium text-ink">
                    Method
                    <FormSelect
                      className="mt-1"
                      value={row.method}
                      onChange={(event) => setRows((items) => items.map((item) => item.id === row.id ? { ...item, method: event.target.value as PaymentMethod } : item))}
                      options={paymentMethods}
                    />
                  </label>
                  <label className="text-[12px] font-medium text-ink">
                    Account
                    <Input
                      className="mt-1"
                      value={row.account}
                      onChange={(event) => setRows((items) => items.map((item) => item.id === row.id ? { ...item, account: event.target.value } : item))}
                      placeholder={row.method === 'Cash' ? 'Cash counter' : 'Account / wallet'}
                    />
                  </label>
                  <label className="text-[12px] font-medium text-ink">
                    Amount
                    <Input
                      className="mt-1 text-right"
                      value={row.amount}
                      inputMode="decimal"
                      onChange={(event) => setRows((items) => items.map((item) => item.id === row.id ? { ...item, amount: event.target.value.replace(/[^\d.]/g, '') } : item))}
                      placeholder="0"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={rows.length === 1}
                    onClick={() => setRows((items) => items.filter((item) => item.id !== row.id))}
                    className="self-end rounded-md p-2 text-ink-300 hover:bg-danger-bg hover:text-danger disabled:opacity-30"
                    aria-label={`Remove payment ${index + 1}`}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setRows((items) => [...items, { id: `p${Date.now()}`, method: 'Cash', amount: '', account: '' }])}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-teal-700 hover:underline">
                <Plus className="size-3.5" /> Add another payment source
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl bg-ink-50 p-3 text-center text-[12px]">
              <div><p className="text-ink-400">Invoice due</p><p className="mt-0.5 font-semibold text-ink">{taka(invoice.due)}</p></div>
              <div><p className="text-ink-400">This payment</p><p className="mt-0.5 font-semibold text-ink">{taka(total)}</p></div>
              <div><p className="text-ink-400">Remaining</p><p className={`mt-0.5 font-semibold ${invoice.due - total > 0 ? 'text-danger' : 'text-success'}`}>{taka(Math.max(invoice.due - total, 0))}</p></div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button
                disabled={total <= 0 || total > invoice.due}
                onClick={() => {
                  onSave(invoice, rows);
                  close();
                }}>
                Save payment
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function Sales() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('sales');
  const [invoices, setInvoices] = useState<SalesInvoice[]>(seedInvoices);
  const [returns, setReturns] = useState<SalesReturn[]>(seedReturns);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All status');
  const [method, setMethod] = useState('All payments');
  const [detail, setDetail] = useState<SalesInvoice | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<SalesInvoice | null>(null);
  const [returnCustomer, setReturnCustomer] = useState('Rahman Hardware');
  const [returnInvoiceIds, setReturnInvoiceIds] = useState<string[]>([]);
  const [returnQty, setReturnQty] = useState<Record<string, string>>({});
  const [returnSettlement, setReturnSettlement] = useState<SalesReturn['settlement']>('Adjust due');

  const customerNames = useMemo(
    () => Array.from(new Set(invoices.filter((invoice) => invoice.party !== 'Walk-in customer').map((invoice) => invoice.party))),
    [invoices]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (status !== 'All status' && invoice.status !== status) return false;
      if (method !== 'All payments' && !invoice.payments.some((payment) => payment.method === method) && invoice.method !== method) return false;
      if (!q) return true;
      return [
        invoice.invoice,
        invoice.party,
        invoice.phone ?? '',
        invoice.address ?? '',
        ...invoice.lines.map((line) => line.name)
      ].some((value) => value.toLowerCase().includes(q));
    });
  }, [invoices, method, query, status]);

  const salesTotal = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const receivedTotal = invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  const dueTotal = invoices.reduce((sum, invoice) => sum + invoice.due, 0);
  const returnTotal = returns.reduce((sum, item) => sum + item.amount, 0);

  const summary = [
    { label: 'Sales · current', value: taka(salesTotal), sub: `${invoices.length} invoices` },
    { label: 'Received', value: taka(receivedTotal), sub: 'Cash, bank & mobile' },
    { label: 'Outstanding due', value: taka(dueTotal), sub: 'Customer receivable · বাকি', tone: 'text-danger' },
    { label: 'Sales returns', value: taka(returnTotal), sub: `${returns.length} return memos`, tone: 'text-warning' }
  ];

  const customerInvoices = invoices.filter((invoice) => invoice.party === returnCustomer);
  const selectedReturnInvoices = invoices.filter((invoice) => returnInvoiceIds.includes(invoice.id));
  const selectedReturnLines = selectedReturnInvoices.flatMap((invoice) => invoice.lines.map((line) => ({ invoice, line })));
  const returnAmount = selectedReturnLines.reduce((sum, item) => sum + (parseFloat(returnQty[item.line.id] ?? '') || 0) * item.line.price, 0);

  const openReturn = (invoice: SalesInvoice) => {
    if (invoice.party !== 'Walk-in customer') setReturnCustomer(invoice.party);
    setReturnInvoiceIds([invoice.id]);
    setReturnQty({});
    setDetail(null);
    setTab('return');
  };

  const savePayment = (invoice: SalesInvoice, rows: PaymentDraft[]) => {
    const amount = rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    const payments: SalePayment[] = rows
      .filter((row) => (parseFloat(row.amount) || 0) > 0)
      .map((row, index) => ({
        id: `${invoice.id}-new-${Date.now()}-${index}`,
        method: row.method,
        amount: parseFloat(row.amount),
        ...(row.account.trim() ? { account: row.account.trim() } : {})
      }));
    setInvoices((items) => items.map((item) => {
      if (item.id !== invoice.id) return item;
      const paid = Math.min(item.total, item.paid + amount);
      const due = Math.max(item.total - paid, 0);
      return {
        ...item,
        paid,
        due,
        method: payments[0]?.method ?? item.method,
        status: due === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Due',
        payments: [...item.payments, ...payments]
      };
    }));
    toast.success('Payment saved', { description: `${invoice.invoice} · ${taka(amount)}` });
  };

  const completeReturn = () => {
    if (!returnInvoiceIds.length || returnAmount <= 0) {
      toast.error('Select invoice items and enter return quantity');
      return;
    }
    const selected = selectedReturnInvoices;
    const newReturn: SalesReturn = {
      id: `RTN-${String(15 + returns.length - seedReturns.length).padStart(6, '0')}`,
      date: '01 Oct 2026',
      customer: returnCustomer,
      invoices: selected.map((invoice) => invoice.invoice),
      items: selectedReturnLines
        .filter(({ line }) => (parseFloat(returnQty[line.id] ?? '') || 0) > 0)
        .map(({ line }) => `${line.name} · ${returnQty[line.id]} ${line.unit}`)
        .join(', '),
      amount: returnAmount,
      settlement: returnSettlement
    };
    setReturns((items) => [newReturn, ...items]);
    setInvoices((items) => items.map((invoice) => returnInvoiceIds.includes(invoice.id) ? { ...invoice, status: 'Part returned' } : invoice));
    setReturnInvoiceIds([]);
    setReturnQty({});
    setTab('returns');
    toast.success(`${newReturn.id} saved`, { description: `${taka(returnAmount)} · ${returnSettlement}` });
  };

  const tabs: Array<[Tab, string, string]> = [
    ['sales', 'Sales', 'Invoice list & management'],
    ['return', 'Sales return', 'Batch return across customer invoices'],
    ['returns', 'Return history', 'Completed sales returns'],
    ['drafts', 'Drafts & templates', 'Continue or reuse sales']
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Sales management"
        titleBn="বিক্রয় ব্যবস্থাপনা"
        description="Find invoices, collect due payments, edit or duplicate sales, handle returns, drafts and reusable templates."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/app/parties')}>
              <BookOpen className="size-4" /> Customer ledger
            </Button>
            <Button size="sm" onClick={() => navigate('/app/pos')}>
              <Plus className="size-4" /> New sale
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{item.label}</p>
            <p className={`mt-0.5 text-lg font-semibold ${item.tone ?? 'text-ink'}`}>{item.value}</p>
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
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-2.5 py-2.5 text-[13px] font-medium ${tab === id ? 'border-teal-600 text-ink' : 'border-transparent text-ink-500 hover:text-ink'}`}>
              {label}
              {id === 'sales' && <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{invoices.length}</span>}
              {id === 'returns' && <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{returns.length}</span>}
              {id === 'drafts' && <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{salesDrafts.length + saleTemplates.length}</span>}
            </button>
          ))}
        </div>

        {tab === 'sales' && (
          <>
            <div className="flex flex-col gap-2 border-b border-ink-100 p-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 lg:max-w-lg">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-8"
                  placeholder="Search invoice, customer, phone or product"
                  aria-label="Search sales"
                />
              </div>
              <FormSelect
                className="w-full lg:w-40"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                options={['All status', 'Paid', 'Partial', 'Due', 'Part returned', 'Returned']}
              />
              <FormSelect
                className="w-full lg:w-40"
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                options={['All payments', ...paymentMethods]}
              />
              <Button variant="outline" size="sm" onClick={() => toast('Sales list refreshed')}>Refresh</Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Invoice</TableHead>
                  <TableHead className="h-9 text-xs">Customer</TableHead>
                  <TableHead className="h-9 text-xs">Items</TableHead>
                  <TableHead className="h-9 text-right text-xs">Total</TableHead>
                  <TableHead className="h-9 text-right text-xs">Paid</TableHead>
                  <TableHead className="h-9 text-right text-xs">Due</TableHead>
                  <TableHead className="h-9 text-xs">Payment</TableHead>
                  <TableHead className="h-9 text-xs">Status</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer text-[13px]" onClick={() => setDetail(invoice)}>
                    <TableCell className="py-2 pl-4">
                      <span className="font-medium text-ink">{invoice.invoice}</span>
                      <span className="block text-[11px] text-ink-400">{invoice.date} · {invoice.time}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      <p className="font-medium text-ink">{invoice.party}</p>
                      <p className="text-[11px] text-ink-400">{invoice.phone ?? 'No phone'}</p>
                    </TableCell>
                    <TableCell className="max-w-[270px] py-2 text-ink-600">
                      <span className="block truncate">{invoice.lines.map((line) => line.name).join(', ')}</span>
                      <span className="text-[11px] text-ink-400">{invoice.items} line{invoice.items === 1 ? '' : 's'}</span>
                    </TableCell>
                    <TableCell className="py-2 text-right font-medium">{taka(invoice.total)}</TableCell>
                    <TableCell className="py-2 text-right text-ink-600">{taka(invoice.paid)}</TableCell>
                    <TableCell className={`py-2 text-right ${invoice.due > 0 ? 'font-medium text-danger' : 'text-ink-300'}`}>{invoice.due > 0 ? taka(invoice.due) : '—'}</TableCell>
                    <TableCell className="py-2 text-ink-600">{invoice.payments.length > 1 ? 'Multiple' : invoice.method}</TableCell>
                    <TableCell className="py-2"><PaymentStatus invoice={invoice} /></TableCell>
                    <TableCell className="py-2 pr-4 text-right">
                      <InvoiceActions
                        invoice={invoice}
                        onView={() => setDetail(invoice)}
                        onPayment={() => setPaymentTarget(invoice)}
                        onReturn={() => openReturn(invoice)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filtered.length === 0 && (
              <div className="px-4 py-10 text-center">
                <p className="font-medium text-ink">No sales match</p>
                <p className="mt-1 text-sm text-ink-500">Try another invoice, customer, phone or filter.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => { setQuery(''); setStatus('All status'); setMethod('All payments'); }}>Clear filters</Button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 px-4 py-2.5 text-xs text-ink-500">
              <span>Showing {filtered.length} of {invoices.length} invoices</span>
              <span>Click a row to view invoice details</span>
            </div>
          </>
        )}

        {tab === 'return' && (
          <div className="grid gap-4 p-4 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="rounded-xl border border-ink-100 p-3">
                <p className="text-sm font-semibold text-ink">1. Choose customer</p>
                <p className="mt-0.5 text-[11px] text-ink-500">Select a customer to see all invoices that can be returned together.</p>
                <FormSelect
                  className="mt-3"
                  value={returnCustomer}
                  onChange={(event) => {
                    setReturnCustomer(event.target.value);
                    setReturnInvoiceIds([]);
                    setReturnQty({});
                  }}
                  options={customerNames}
                />
              </div>

              <div className="rounded-xl border border-ink-100">
                <div className="border-b border-ink-100 p-3">
                  <p className="text-sm font-semibold text-ink">2. Select invoices</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">Batch return supports more than one invoice.</p>
                </div>
                <div className="divide-y divide-ink-100">
                  {customerInvoices.map((invoice) => (
                    <label key={invoice.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-ink-50">
                      <input
                        type="checkbox"
                        checked={returnInvoiceIds.includes(invoice.id)}
                        onChange={(event) => {
                          setReturnInvoiceIds((ids) => event.target.checked ? [...ids, invoice.id] : ids.filter((id) => id !== invoice.id));
                          setReturnQty({});
                        }}
                        className="size-4 rounded border-ink-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-ink">{invoice.invoice}</span>
                        <span className="block text-[11px] text-ink-400">{invoice.date} · {invoice.items} lines · {taka(invoice.total)}</span>
                      </span>
                      <PaymentStatus invoice={invoice} />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-ink-100">
              <div className="border-b border-ink-100 p-3">
                <p className="text-sm font-semibold text-ink">3. Return items</p>
                <p className="mt-0.5 text-[11px] text-ink-500">Enter quantity against any item from the selected invoices.</p>
              </div>

              {selectedReturnLines.length ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="h-9 pl-3 text-xs">Invoice / item</TableHead>
                        <TableHead className="h-9 text-xs">Sold</TableHead>
                        <TableHead className="h-9 w-36 text-xs">Return qty</TableHead>
                        <TableHead className="h-9 pr-3 text-right text-xs">Refund</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedReturnLines.map(({ invoice, line }) => {
                        const qty = parseFloat(returnQty[line.id] ?? '') || 0;
                        return (
                          <TableRow key={line.id} className="text-[12.5px]">
                            <TableCell className="py-2 pl-3">
                              <p className="font-medium text-ink">{line.name}</p>
                              <p className="text-[11px] text-ink-400">{invoice.invoice}</p>
                            </TableCell>
                            <TableCell className="py-2">{invoiceQty(line)}</TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={returnQty[line.id] ?? ''}
                                  onChange={(event) => setReturnQty((value) => ({ ...value, [line.id]: event.target.value.replace(/[^\d.]/g, '') }))}
                                  inputMode="decimal"
                                  className="h-8 text-right"
                                  placeholder="0"
                                />
                                <span className="w-10 text-[11px] text-ink-400">{line.unit}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2 pr-3 text-right font-medium">{qty > 0 ? taka(qty * line.price) : '—'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <div className="grid gap-3 border-t border-ink-100 p-3 sm:grid-cols-[minmax(0,1fr)_180px_160px] sm:items-end">
                    <label className="text-[12px] font-medium text-ink">
                      Settlement
                      <FormSelect
                        className="mt-1"
                        value={returnSettlement}
                        onChange={(event) => setReturnSettlement(event.target.value as SalesReturn['settlement'])}
                        options={['Adjust due', 'Customer credit', 'Cash refund']}
                      />
                    </label>
                    <div className="rounded-lg bg-ink-50 px-3 py-2">
                      <p className="text-[11px] text-ink-400">Return amount</p>
                      <p className="text-base font-semibold text-ink">{taka(returnAmount)}</p>
                    </div>
                    <Button onClick={completeReturn}><CornerUpLeft className="size-4" /> Complete return</Button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-16 text-center">
                  <CornerUpLeft className="mx-auto size-7 text-ink-300" />
                  <p className="mt-2 font-medium text-ink">Select one or more invoices</p>
                  <p className="mt-1 text-sm text-ink-500">Their items will appear here for a batch return.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'returns' && (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-4 text-xs">Return</TableHead>
                <TableHead className="h-9 text-xs">Customer</TableHead>
                <TableHead className="h-9 text-xs">Invoices</TableHead>
                <TableHead className="h-9 text-xs">Items</TableHead>
                <TableHead className="h-9 text-right text-xs">Amount</TableHead>
                <TableHead className="h-9 text-xs">Settlement</TableHead>
                <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((item) => (
                <TableRow key={item.id} className="text-[13px]">
                  <TableCell className="py-2 pl-4">
                    <p className="font-medium text-ink">{item.id}</p>
                    <p className="text-[11px] text-ink-400">{item.date}</p>
                  </TableCell>
                  <TableCell className="py-2 font-medium">{item.customer}</TableCell>
                  <TableCell className="py-2 text-ink-600">{item.invoices.join(', ')}</TableCell>
                  <TableCell className="max-w-[300px] truncate py-2 text-ink-600">{item.items}</TableCell>
                  <TableCell className="py-2 text-right font-medium">{taka(item.amount)}</TableCell>
                  <TableCell className="py-2"><StatusBadge tone={item.settlement === 'Cash refund' ? 'warning' : 'info'}>{item.settlement}</StatusBadge></TableCell>
                  <TableCell className="py-2 pr-4 text-right">
                    <button onClick={() => toast('Return actions', { description: 'View · Print · Customer ledger' })} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink" aria-label={`Actions for ${item.id}`}>
                      <MoreHorizontal className="size-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tab === 'drafts' && (
          <div className="grid gap-4 p-4 xl:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-ink-100">
              <div className="flex items-center justify-between border-b border-ink-100 p-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink"><FileClock className="size-4 text-teal-700" /> Draft sales</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">Continue, edit or duplicate a held sale.</p>
                </div>
                <StatusBadge tone="teal">{salesDrafts.length}</StatusBadge>
              </div>
              <div className="divide-y divide-ink-100">
                {salesDrafts.map((draft) => (
                  <div key={draft.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-medium text-ink">{draft.label} · {draft.customer ?? 'Walk-in customer'}</p>
                        <p className="mt-0.5 text-[11px] text-ink-400">{draft.items} items · {draft.savedAt}</p>
                      </div>
                      <span className="text-[13px] font-semibold">{taka(draft.total)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => { toast(`${draft.label} continued in POS`); navigate('/app/pos'); }}>Continue</Button>
                      <Button size="sm" variant="outline" onClick={() => { toast(`${draft.label} opened for editing`); navigate('/app/pos'); }}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => { toast(`${draft.label} duplicated`); navigate('/app/pos'); }}><Copy className="size-3.5" /> Duplicate</Button>
                      <Button size="sm" variant="ghost" onClick={() => toast.error(`${draft.label} archived`)}>Archive</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-ink-100">
              <div className="flex items-center justify-between border-b border-ink-100 p-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink"><FileText className="size-4 text-teal-700" /> Sale templates</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">Reuse common invoice carts without recreating every line.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast('Save current POS cart as template')}><Plus className="size-3.5" /> Template</Button>
              </div>
              <div className="divide-y divide-ink-100">
                {saleTemplates.map((template) => (
                  <div key={template.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-medium text-ink">{template.name}</p>
                        <p className="mt-0.5 text-[11px] text-ink-400">{template.customer ?? 'Any customer'} · {template.items} items · last used {template.lastUsed}</p>
                      </div>
                      <span className="text-[13px] font-semibold">{taka(template.total)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => { toast(`${template.name} loaded into POS`); navigate('/app/pos'); }}>Use template</Button>
                      <Button size="sm" variant="outline" onClick={() => toast(`Editing ${template.name}`)}>Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => toast(`${template.name} duplicated`)}><Copy className="size-3.5" /> Duplicate</Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <InvoiceDialog
        invoice={detail}
        onClose={() => setDetail(null)}
        onPayment={(invoice) => { setDetail(null); setPaymentTarget(invoice); }}
        onReturn={openReturn}
      />

      <PaymentDialog
        invoice={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSave={savePayment}
      />
    </div>
  );
}
