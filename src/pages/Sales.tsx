import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  Banknote,
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  CornerUpLeft,
  FileClock,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Printer,
  Search,
  ShieldCheck,
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
import { customerCredits as seedCredits, saleTemplates, salesDrafts, salesInvoices as seedInvoices, salesReturns as seedReturns } from '../data/sales';
import { products } from '../data/products';
import type { CustomerCredit, PaymentMethod, SalePayment, SalesInvoice, SalesInvoiceStatus, SalesReturn } from '../types/erp';
import { taka } from '../utils/currency';
import { invoiceReceipt, invoiceQuantity, returnDocument } from '../utils/salesDocuments';
import { downloadReport, printReport } from '../utils/reportOutput';
const printInvoice = (invoice: SalesInvoice) => {
  const view = window.open('', '_blank');
  if (!view) { toast.error('Allow the print popup and try again.'); return; }
  view.opener = null;
  void import('../components/brand/printReceipt').then(({printReceipt}) => printReceipt(invoiceReceipt(invoice), view))
    .catch(() => { view.close(); toast.error('Could not open the print document. Try again.'); });
};
const printReturn = (item: SalesReturn) => { if (!printReport(returnDocument(item))) toast.error('Allow the print popup and try again.'); };

type Tab = 'sales' | 'return' | 'returns' | 'credits' | 'drafts';

const paymentMethods: PaymentMethod[] = ['Cash', 'bKash', 'Nagad', 'Card', 'Bank'];

const statusTone: Record<SalesInvoiceStatus, StatusTone> = {
  Paid: 'success',
  Partial: 'warning',
  Due: 'danger',
  'Part returned': 'info',
  Returned: 'neutral'
};

type SalesColumn = 'invoice' | 'customer' | 'items' | 'total' | 'profit' | 'paid' | 'due' | 'payment' | 'status';

const salesColumns: Array<{ id: SalesColumn; label: string }> = [
  { id: 'invoice', label: 'Invoice' },
  { id: 'customer', label: 'Customer' },
  { id: 'items', label: 'Items' },
  { id: 'total', label: 'Total' },
  { id: 'profit', label: 'Profit' },
  { id: 'paid', label: 'Paid' },
  { id: 'due', label: 'Due' },
  { id: 'payment', label: 'Payment' },
  { id: 'status', label: 'Status' }
];

const defaultVisibleSalesColumns: Record<SalesColumn, boolean> = {
  invoice: true,
  customer: true,
  items: true,
  total: true,
  profit: true,
  paid: true,
  due: true,
  payment: true,
  status: true
};

const salesColumnStorageKey = 'hisabiq-sales-visible-columns';
const purchasePriceByProductId = new Map(products.map((product) => [product.id, product.purchasePrice]));

function lineBaseQuantity(line: SalesInvoice['lines'][number]) {
  return line.returnableQuantity ?? (parseFloat(line.quantity) || 0);
}

function invoiceCogs(invoice: SalesInvoice) {
  return invoice.lines.reduce((sum, line) => {
    const unitCost = line.unitCost ?? purchasePriceByProductId.get(line.productId) ?? 0;
    return sum + lineBaseQuantity(line) * unitCost;
  }, 0);
}

function invoiceProfit(invoice: SalesInvoice) {
  return invoice.total - invoiceCogs(invoice);
}

function SalesColumnPicker({
  visible,
  onToggle
}: {
  visible: Record<SalesColumn, boolean>;
  onToggle: (column: SalesColumn) => void;
}) {
  return (
    <FloatingPanel
      label="Choose sales invoice columns"
      width={210}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
          Columns
          <ChevronDown className={`size-3.5 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}>
      {() => (
        <div className="py-1">
          {salesColumns.map((column) => (
            <button
              key={column.id}
              type="button"
              role="menuitemcheckbox"
              aria-checked={visible[column.id]}
              onClick={() => onToggle(column.id)}
              className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
              <span>{column.label}</span>
              {visible[column.id] && <Check className="size-4 text-ink" />}
            </button>
          ))}
        </div>
      )}
    </FloatingPanel>
  );
}

function PaymentStatus({ invoice }: { invoice: SalesInvoice }) {
  return <StatusBadge tone={statusTone[invoice.status]} dot>{invoice.status}</StatusBadge>;
}

const invoiceQty = invoiceQuantity;

function returnLimit(line: SalesInvoice['lines'][number]) {
  return line.returnableQuantity ?? (parseFloat(line.quantity) || 0);
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
        <div className="py-1" onClick={(event) => event.stopPropagation()}>
          <button className={itemClass} onClick={() => { close(); onView(); }}>
            <FileText className="size-4 text-ink-400" /> View invoice
          </button>
          <button className={itemClass} onClick={() => { close(); navigate(`/app/pos?mode=edit&invoice=${invoice.invoice}`); }}>
            <Pencil className="size-4 text-ink-400" /> Edit sale
          </button>
          <button className={itemClass} onClick={() => { close(); navigate(`/app/pos?mode=duplicate&invoice=${invoice.invoice}`); }}>
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
          <button className={itemClass} onClick={() => { close(); navigate(`/app/warranty?invoice=${invoice.invoice}`); }}>
            <ShieldCheck className="size-4 text-ink-400" /> Receive warranty
          </button>
          {invoice.partyId && (
            <button className={itemClass} onClick={() => { close(); navigate(`/app/parties?id=${invoice.partyId}`); }}>
              <UserRound className="size-4 text-ink-400" /> Customer ledger
            </button>
          )}
          <button className={itemClass} onClick={() => { close(); printInvoice(invoice); }}>
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
                <div className="rounded-xl border border-border">
                  <div className="grid grid-cols-2 gap-3 border-b border-border p-3 text-[12.5px] sm:grid-cols-4">
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
                            {line.warranty ? <p className="mt-0.5 text-[11px] text-ink-400">Warranty: {line.warranty.duration} {line.warranty.durationUnit} · {line.warranty.type}{line.warranty.terms ? ` · ${line.warranty.terms}` : ''}</p> : null}
                          </TableCell>
                          <TableCell className="py-2">{invoiceQty(line)}</TableCell>
                          <TableCell className="py-2 text-right">{taka(line.price, line.price % 1 ? 2 : 0)}/{line.unit}</TableCell>
                          <TableCell className="py-2 pr-3 text-right font-medium">{taka(line.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="grid gap-1 border-t border-border p-3 text-[12.5px] sm:ml-auto sm:w-72">
                    <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span>{taka(invoice.subtotal)}</span></div>
                    {invoice.discount > 0 && <div className="flex justify-between"><span className="text-ink-500">Discount</span><span>−{taka(invoice.discount)}</span></div>}
                    <div className="flex justify-between"><span className="text-ink-500">Rounding</span><span>{invoice.rounding >= 0 ? '+' : '−'}{taka(Math.abs(invoice.rounding))}</span></div>
                    <div className="flex justify-between border-t border-border pt-1.5 text-sm font-semibold"><span>Total</span><span>{taka(invoice.total)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-500">Gross profit</span><span className={invoiceProfit(invoice) < 0 ? 'font-medium text-danger' : 'font-medium text-success'}>{invoiceProfit(invoice) < 0 ? '−' : ''}{taka(Math.abs(invoiceProfit(invoice)), Math.abs(invoiceProfit(invoice)) % 1 ? 2 : 0)}</span></div>
                    <div className="flex justify-between"><span className="text-ink-500">Paid</span><span>{taka(invoice.paid)}</span></div>
                    <div className="flex justify-between font-medium"><span className="text-ink-500">Due</span><span className={invoice.due > 0 ? 'text-danger' : 'text-success'}>{invoice.due > 0 ? taka(invoice.due) : '৳0'}</span></div>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-400">Payments</p>
                  {invoice.payments.length ? (
                    <div className="mt-2 divide-y divide-border">
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
                <ReceiptPreview {...invoiceReceipt(invoice)} />
              </div>
            </div>

            {invoice.note && <p className="rounded-lg bg-warning-bg px-3 py-2 text-[12.5px] text-warning">{invoice.note}</p>}

            <DialogFooter className="flex-wrap">
              {invoice.partyId && (
                <Button variant="outline" onClick={() => navigate(`/app/parties?id=${invoice.partyId}`)}>
                  <BookOpen className="size-4" /> Ledger
                </Button>
              )}
              <Button variant="outline" onClick={() => printInvoice(invoice)}>
                <Printer className="size-4" /> Print
              </Button>
              <Button variant="outline" onClick={() => navigate(`/app/pos?mode=duplicate&invoice=${invoice.invoice}`)}>
                <Copy className="size-4" /> Duplicate
              </Button>
              <Button variant="outline" onClick={() => navigate(`/app/pos?mode=edit&invoice=${invoice.invoice}`)}>
                <Pencil className="size-4" /> Edit
              </Button>
              <Button variant="outline" onClick={() => onReturn(invoice)}>
                <CornerUpLeft className="size-4" /> Return
              </Button>
              <Button variant="outline" onClick={() => navigate(`/app/warranty?invoice=${invoice.invoice}`)}>
                <ShieldCheck className="size-4" /> Warranty
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
                <div key={row.id} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[140px_1fr_120px_auto]">
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
                    className="self-end rounded-md p-2 text-helper hover:bg-danger-bg hover:text-danger disabled:opacity-30"
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


type CustomerPaymentDraft = {
  customer: string;
  amount: string;
  method: PaymentMethod;
  account: string;
  allocation: 'Settle oldest due' | 'Keep as customer credit';
};

function CustomerPaymentDialog({
  open,
  customers,
  onClose,
  onSave
}: {
  open: boolean;
  customers: string[];
  onClose: () => void;
  onSave: (draft: CustomerPaymentDraft) => void;
}) {
  const [customer, setCustomer] = useState(customers[0] ?? '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [account, setAccount] = useState('');
  const [allocation, setAllocation] = useState<CustomerPaymentDraft['allocation']>('Settle oldest due');
  const amountNumber = parseFloat(amount) || 0;

  const close = () => {
    setAmount('');
    setAccount('');
    setAllocation('Settle oldest due');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Customer payment <span className="font-bn text-sm font-normal text-ink-500">কাস্টমার পেমেন্ট</span></DialogTitle>
          <DialogDescription>Receive money against customer dues or keep it as reusable customer credit.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[12px] font-medium text-ink sm:col-span-2">
            Customer
            <FormSelect className="mt-1" value={customer} onChange={(event) => setCustomer(event.target.value)} options={customers} />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Method
            <FormSelect className="mt-1" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)} options={paymentMethods} />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Account
            <Input className="mt-1" value={account} onChange={(event) => setAccount(event.target.value)} placeholder={method === 'Cash' ? 'Cash counter' : 'Account / wallet'} />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Amount
            <Input className="mt-1 text-right" value={amount} inputMode="decimal" onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} placeholder="0" />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Allocation
            <FormSelect className="mt-1" value={allocation} onChange={(event) => setAllocation(event.target.value as CustomerPaymentDraft['allocation'])} options={['Settle oldest due', 'Keep as customer credit']} />
          </label>
        </div>
        <div className="rounded-lg bg-ink-50 p-3 text-[12px] text-ink-600">
          {allocation === 'Settle oldest due'
            ? 'HisabIQ applies this payment to the customer’s oldest due invoices first. Any remainder becomes customer credit.'
            : 'The full amount stays as customer credit and can be applied to an invoice or refunded later.'}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button disabled={!customer || amountNumber <= 0} onClick={() => {
            onSave({ customer, amount, method, account, allocation });
            close();
          }}>Save payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreditActionDialog({
  action,
  invoices,
  onClose,
  onApply,
  onRefund
}: {
  action: { credit: CustomerCredit; mode: 'apply' | 'refund' } | null;
  invoices: SalesInvoice[];
  onClose: () => void;
  onApply: (credit: CustomerCredit, invoiceId: string, amount: number) => void;
  onRefund: (credit: CustomerCredit, amount: number, method: PaymentMethod, account: string) => void;
}) {
  const credit = action?.credit ?? null;
  const dueInvoices = credit ? invoices.filter((invoice) => invoice.party === credit.customer && invoice.due > 0) : [];
  const [invoiceId, setInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [account, setAccount] = useState('');
  const selectedInvoice = dueInvoices.find((invoice) => invoice.invoice === invoiceId) ?? dueInvoices[0] ?? null;
  const maxAmount = credit ? Math.min(credit.balance, action?.mode === 'apply' ? selectedInvoice?.due ?? 0 : credit.balance) : 0;
  const amountNumber = parseFloat(amount) || 0;

  const close = () => {
    setInvoiceId('');
    setAmount('');
    setMethod('Cash');
    setAccount('');
    onClose();
  };

  return (
    <Dialog open={!!action} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogContent className="sm:max-w-lg">
        {credit && action && (
          <>
            <DialogHeader>
              <DialogTitle>{action.mode === 'apply' ? 'Apply customer credit' : 'Refund customer credit'}</DialogTitle>
              <DialogDescription>{credit.customer} · available {taka(credit.balance)}</DialogDescription>
            </DialogHeader>
            {action.mode === 'apply' ? (
              <div className="space-y-3">
                <label className="text-[12px] font-medium text-ink">
                  Due invoice
                  <FormSelect
                    className="mt-1"
                    value={selectedInvoice?.invoice ?? ''}
                    onChange={(event) => { setInvoiceId(event.target.value); setAmount(''); }}
                    options={dueInvoices.map((invoice) => invoice.invoice)}
                  />
                </label>
                {selectedInvoice && (
                  <div className="rounded-lg bg-ink-50 p-3 text-[12px]">
                    <div className="flex justify-between"><span className="text-ink-500">Invoice</span><span className="font-medium">{selectedInvoice.invoice}</span></div>
                    <div className="mt-1 flex justify-between"><span className="text-ink-500">Due</span><span className="font-medium text-danger">{taka(selectedInvoice.due)}</span></div>
                  </div>
                )}
                <label className="text-[12px] font-medium text-ink">
                  Amount
                  <Input className="mt-1 text-right" value={amount} inputMode="decimal" onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} placeholder={maxAmount ? String(maxAmount) : '0'} />
                </label>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-[12px] font-medium text-ink sm:col-span-2">
                  Refund amount
                  <Input className="mt-1 text-right" value={amount} inputMode="decimal" onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} placeholder={String(credit.balance)} />
                </label>
                <label className="text-[12px] font-medium text-ink">
                  Method
                  <FormSelect className="mt-1" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)} options={paymentMethods} />
                </label>
                <label className="text-[12px] font-medium text-ink">
                  Account
                  <Input className="mt-1" value={account} onChange={(event) => setAccount(event.target.value)} placeholder={method === 'Cash' ? 'Cash counter' : 'Account / wallet'} />
                </label>
              </div>
            )}
            {!selectedInvoice && action.mode === 'apply' && <p className="rounded-lg bg-warning-bg p-3 text-xs text-warning">This customer has no due invoice to settle.</p>}
            <DialogFooter>
              <Button variant="outline" onClick={close}>Cancel</Button>
              <Button
                disabled={amountNumber <= 0 || amountNumber > maxAmount || (action.mode === 'apply' && !selectedInvoice)}
                onClick={() => {
                  if (action.mode === 'apply' && selectedInvoice) onApply(credit, selectedInvoice.id, amountNumber);
                  if (action.mode === 'refund') onRefund(credit, amountNumber, method, account);
                  close();
                }}>
                {action.mode === 'apply' ? 'Apply credit' : 'Refund credit'}
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
  const [searchParams,setSearchParams] = useSearchParams();
  const routeTab=searchParams.get('tab');
  const allowedTabs:Tab[]=['sales','return','returns','credits','drafts'];
  const [tab,setTab]=useState<Tab>(()=>allowedTabs.includes(routeTab as Tab)?routeTab as Tab:'sales');
  useEffect(()=>{if(routeTab&&allowedTabs.includes(routeTab as Tab))setTab(routeTab as Tab);else if(!routeTab)setTab('sales');},[routeTab]);
  const chooseTab=(id:Tab)=>{setTab(id);setSearchParams(current=>{
   const next=new URLSearchParams(current);if(id==='sales')next.delete('tab');else next.set('tab',id);return next;
  },{replace:true});};
  const [invoices, setInvoices] = useState<SalesInvoice[]>(seedInvoices);
  const [returns, setReturns] = useState<SalesReturn[]>(seedReturns);
  const [returnDetail, setReturnDetail] = useState<SalesReturn | null>(null);
  const [credits, setCredits] = useState<CustomerCredit[]>(seedCredits);
  const [drafts, setDrafts] = useState(salesDrafts);
  const [templates, setTemplates] = useState(saleTemplates);
  const routeQuery=searchParams.get('q') ?? '';
  const [query, setQuery] = useState(routeQuery);
  useEffect(()=>setQuery(routeQuery),[routeQuery]);
  const [customerFilter, setCustomerFilter] = useState('All customers');
  const [status, setStatus] = useState('All status');
  const [method, setMethod] = useState('All payments');
  const [visibleSalesColumns, setVisibleSalesColumns] = useState<Record<SalesColumn, boolean>>(() => {
    if (typeof window === 'undefined') return defaultVisibleSalesColumns;
    try {
      const stored = window.localStorage.getItem(salesColumnStorageKey);
      return stored ? { ...defaultVisibleSalesColumns, ...JSON.parse(stored) } : defaultVisibleSalesColumns;
    } catch {
      return defaultVisibleSalesColumns;
    }
  });
  const [detail, setDetail] = useState<SalesInvoice | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<SalesInvoice | null>(null);
  const [customerPaymentOpen, setCustomerPaymentOpen] = useState(false);
  const [creditAction, setCreditAction] = useState<{ credit: CustomerCredit; mode: 'apply' | 'refund' } | null>(null);
  const [returnCustomer, setReturnCustomer] = useState('Rahman Hardware');
  const [returnInvoiceIds, setReturnInvoiceIds] = useState<string[]>([]);
  const [returnQty, setReturnQty] = useState<Record<string, string>>({});
  const [returnPrice, setReturnPrice] = useState<Record<string, string>>({});
  const [returnReason, setReturnReason] = useState<Record<string, string>>({});
  const [returnSerials, setReturnSerials] = useState<Record<string, string>>({});
  const [returnSettlement, setReturnSettlement] = useState<SalesReturn['settlement']>('Adjust due');
  const [returnRefundMethod, setReturnRefundMethod] = useState<Exclude<PaymentMethod, 'Customer Credit'>>('Cash');
  const [returnRefundAccount, setReturnRefundAccount] = useState('');

  const toggleSalesColumn = (column: SalesColumn) => {
    setVisibleSalesColumns((current) => {
      const next = { ...current, [column]: !current[column] };
      try {
        window.localStorage.setItem(salesColumnStorageKey, JSON.stringify(next));
      } catch {
        // Keep the current-session preference when storage is unavailable.
      }
      return next;
    });
  };

  const customerNames = useMemo(
    () => Array.from(new Set(invoices.map((invoice) => invoice.party))),
    [invoices]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      if (customerFilter !== 'All customers' && invoice.party !== customerFilter) return false;
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
  }, [customerFilter, invoices, method, query, status]);

  const salesTotal = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const receivedTotal = invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  const dueTotal = invoices.reduce((sum, invoice) => sum + invoice.due, 0);
  const returnTotal = returns.reduce((sum, item) => sum + item.amount, 0);
  const creditTotal = credits.reduce((sum, item) => sum + item.balance, 0);

  const summary = [
    { label: 'Sales · Oct', value: taka(salesTotal), sub: `${invoices.length} invoices` },
    { label: 'Received · Oct', value: taka(receivedTotal), sub: 'Cash, bank & mobile' },
    { label: 'Outstanding due', value: taka(dueTotal), sub: 'Customer receivable · বাকি', tone: 'text-danger' },
    { label: 'Sales returns', value: taka(returnTotal), sub: `${returns.length} return memos · credit ${taka(creditTotal)}`, tone: 'text-warning' }
  ];

  const customerInvoices = invoices.filter((invoice) => invoice.party === returnCustomer);
  const selectedReturnDue = customerInvoices.filter((invoice) => returnInvoiceIds.includes(invoice.id)).reduce((sum, invoice) => sum + invoice.due, 0);
  const selectedReturnInvoices = invoices.filter((invoice) => returnInvoiceIds.includes(invoice.id));
  const selectedReturnLines = selectedReturnInvoices.flatMap((invoice) => invoice.lines.map((line) => ({ invoice, line })));
  const returnPriceFor = (line: SalesInvoice['lines'][number]) => {
    const raw = returnPrice[line.id];
    return raw === undefined || raw === '' ? line.price : parseFloat(raw) || 0;
  };
  const returnAmount = selectedReturnLines.reduce((sum, item) => sum + (parseFloat(returnQty[item.line.id] ?? '') || 0) * returnPriceFor(item.line), 0);
  const returnIssues = selectedReturnLines.flatMap(({ line }) => {
    const qty = parseFloat(returnQty[line.id] ?? '') || 0;
    if (qty <= 0) return [];
    const issues: string[] = [];
    if (qty > returnLimit(line)) issues.push(`${line.name}: maximum return is ${returnLimit(line)} ${line.unit}.`);
    if (line.serials?.length) {
      const serials = (returnSerials[line.id] ?? '').split(',').map((value) => value.trim()).filter(Boolean);
      if (!serials.length) issues.push(`${line.name}: select or enter the returned serial number.`);
      if (serials.some((serial) => !line.serials?.includes(serial))) issues.push(`${line.name}: one or more serial numbers do not belong to this sale.`);
    }
    return issues;
  });

  const openReturn = (invoice: SalesInvoice) => {
    setReturnCustomer(invoice.party);
    setReturnInvoiceIds([invoice.id]);
    setReturnQty({});
    setReturnPrice({});
    setReturnReason({});
    setReturnSerials({});
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

  const receiveCustomerPayment = (draft: CustomerPaymentDraft) => {
    const amount = parseFloat(draft.amount) || 0;
    if (amount <= 0) return;

    const allocations = new Map<string, number>();
    let remainder = amount;
    if (draft.allocation === 'Settle oldest due') {
      for (const invoice of invoices.filter((item) => item.party === draft.customer && item.due > 0)) {
        if (remainder <= 0) break;
        const applied = Math.min(invoice.due, remainder);
        allocations.set(invoice.id, applied);
        remainder -= applied;
      }

      setInvoices((items) => items.map((invoice) => {
        const applied = allocations.get(invoice.id) ?? 0;
        if (!applied) return invoice;
        const paid = invoice.paid + applied;
        const due = Math.max(invoice.total - paid, 0);
        return {
          ...invoice,
          paid,
          due,
          method: draft.method,
          status: due === 0 ? 'Paid' : 'Partial',
          payments: [...invoice.payments, {
            id: `${invoice.id}-customer-${Date.now()}`,
            method: draft.method,
            amount: applied,
            ...(draft.account.trim() ? { account: draft.account.trim() } : {})
          }]
        };
      }));
    } else {
      remainder = amount;
    }

    if (remainder > 0) {
      setCredits((items) => {
        const existing = items.find((credit) => credit.customer === draft.customer);
        if (existing) return items.map((credit) => credit.id === existing.id ? {
          ...credit,
          balance: credit.balance + remainder,
          source: draft.allocation === 'Keep as customer credit' ? 'Customer payment' : 'Payment remainder',
          updatedAt: '01 Oct 2026'
        } : credit);
        return [{
          id: `CR-${String(32 + items.length - seedCredits.length).padStart(6, '0')}`,
          customer: draft.customer,
          balance: remainder,
          source: draft.allocation === 'Keep as customer credit' ? 'Customer payment' : 'Payment remainder',
          updatedAt: '01 Oct 2026'
        }, ...items];
      });
    }

    toast.success('Customer payment saved', {
      description: remainder > 0 ? `${taka(amount - remainder)} settled · ${taka(remainder)} credit` : `${taka(amount)} settled against due invoices`
    });
  };

  const applyCustomerCredit = (credit: CustomerCredit, invoiceId: string, amount: number) => {
    setInvoices((items) => items.map((invoice) => {
      if (invoice.id !== invoiceId) return invoice;
      const paid = Math.min(invoice.total, invoice.paid + amount);
      const due = Math.max(invoice.total - paid, 0);
      return {
        ...invoice,
        paid,
        due,
        method: 'Customer Credit',
        status: due === 0 ? 'Paid' : 'Partial',
        payments: [...invoice.payments, { id: `${invoice.id}-credit-${Date.now()}`, method: 'Customer Credit', amount, account: 'Customer credit' }]
      };
    }));
    setCredits((items) => items.map((item) => item.id === credit.id ? { ...item, balance: Math.max(item.balance - amount, 0), source: `Applied to invoice`, updatedAt: '01 Oct 2026' } : item));
    toast.success('Customer credit applied', { description: `${credit.customer} · ${taka(amount)}` });
  };

  const refundCustomerCredit = (credit: CustomerCredit, amount: number, method: PaymentMethod, account: string) => {
    setCredits((items) => items.map((item) => item.id === credit.id ? { ...item, balance: Math.max(item.balance - amount, 0), source: `Refunded by ${method}`, updatedAt: '01 Oct 2026' } : item));
    toast.success('Customer credit refunded', { description: `${credit.customer} · ${taka(amount)}${account.trim() ? ` · ${account.trim()}` : ''}` });
  };

  const completeReturn = () => {
    if (!returnInvoiceIds.length || returnAmount <= 0) {
      toast.error('Select invoice items and enter return quantity');
      return;
    }
    if (returnIssues.length) {
      toast.error('Check return quantities and serial numbers', { description: returnIssues[0] });
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
        .map(({ line }) => {
          const reason = returnReason[line.id] ?? 'Customer return';
          const serial = (returnSerials[line.id] ?? '').trim();
          return `${line.name} · ${returnQty[line.id]} ${line.unit} · ${reason}${serial ? ` · SN ${serial}` : ''}`;
        })
        .join(', '),
      amount: returnAmount,
      settlement: returnSettlement,
      ...(returnSettlement === 'Cash refund' ? {
        refundMethod: returnRefundMethod,
        ...(returnRefundAccount.trim() ? { refundAccount: returnRefundAccount.trim() } : {})
      } : {})
    };
    setReturns((items) => [newReturn, ...items]);

    const dueAdjustments = new Map<string, number>();
    let remainingAdjustment = returnSettlement === 'Adjust due' ? returnAmount : 0;
    if (returnSettlement === 'Adjust due') {
      for (const invoice of selectedReturnInvoices) {
        if (remainingAdjustment <= 0) break;
        const applied = Math.min(invoice.due, remainingAdjustment);
        if (applied > 0) dueAdjustments.set(invoice.id, applied);
        remainingAdjustment -= applied;
      }
    }

    const creditFromReturn = returnSettlement === 'Customer credit'
      ? returnAmount
      : returnSettlement === 'Adjust due'
        ? Math.max(returnAmount - selectedReturnDue, 0)
        : 0;

    if (creditFromReturn > 0) {
      setCredits((items) => {
        const existing = items.find((credit) => credit.customer === returnCustomer);
        if (existing) return items.map((credit) => credit.id === existing.id ? { ...credit, balance: credit.balance + creditFromReturn, source: newReturn.id, updatedAt: newReturn.date } : credit);
        return [{ id: `CR-${String(32 + items.length - seedCredits.length).padStart(6, '0')}`, customer: returnCustomer, balance: creditFromReturn, source: newReturn.id, updatedAt: newReturn.date }, ...items];
      });
    }

    setInvoices((items) => items.map((invoice) => {
      if (!returnInvoiceIds.includes(invoice.id)) return invoice;
      const returnedLines = invoice.lines.filter((line) => (parseFloat(returnQty[line.id] ?? '') || 0) > 0);
      const fullReturn = returnedLines.length === invoice.lines.length && invoice.lines.every((line) => (parseFloat(returnQty[line.id] ?? '') || 0) >= returnLimit(line));
      const applied = dueAdjustments.get(invoice.id) ?? 0;
      const due = Math.max(invoice.due - applied, 0);
      const total = applied > 0 ? Math.max(invoice.total - applied, invoice.paid) : invoice.total;
      return { ...invoice, total, due, status: fullReturn ? 'Returned' : 'Part returned' };
    }));
    setReturnInvoiceIds([]);
    setReturnQty({});
    setReturnPrice({});
    setReturnReason({});
    setReturnSerials({});
    setReturnRefundMethod('Cash');
    setReturnRefundAccount('');
    setTab('returns');
    toast.success(`${newReturn.id} saved`, { description: `${taka(returnAmount)} · ${returnSettlement}` });
  };

  const tabs: Array<[Tab, string, string]> = [
    ['sales', 'Sales', 'Invoice list & management'],
    ['return', 'Sales return', 'Batch return across customer invoices'],
    ['returns', 'Return history', 'Completed sales returns'],
    ['credits', 'Customer credit', 'Payments, settlements and refunds'],
    ['drafts', 'Drafts & templates', 'Continue or reuse sales']
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Sales"
        titleBn="বিক্রয়"
        description="Manage invoices, collect due payments, handle returns, drafts and reusable sale templates."
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
          <div key={item.label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{item.label}</p>
            <p className={`mt-0.5 text-lg font-semibold ${item.tone ?? 'text-ink'}`}>{item.value}</p>
            <p className="font-bn text-[11px] text-ink-400">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-border px-3 scrollbar-thin" role="tablist">
          {tabs.map(([id, label, helper]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => chooseTab(id)}
              title={helper}
              className={`flex shrink-0 items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-medium ${tab === id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'}`}>
              {label}
              {id === 'sales' && <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{invoices.length}</span>}
              {id === 'returns' && <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{returns.length}</span>}
              {id === 'credits' && <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{credits.filter((credit) => credit.balance > 0).length}</span>}
              {id === 'drafts' && <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{drafts.length + templates.length}</span>}
            </button>
          ))}
        </div>

        {tab === 'sales' && (
          <>
            <div className="flex flex-col gap-2 border-b border-border p-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 lg:max-w-lg">
                <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-8"
                  placeholder="Search invoice, customer, phone or product"
                  aria-label="Search sales"
                />
              </div>
              <FormSelect
                className="w-full lg:w-44"
                value={customerFilter}
                onChange={(event) => setCustomerFilter(event.target.value)}
                options={['All customers', ...customerNames]}
              />
              <FormSelect
                className="w-full lg:w-36"
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
              <SalesColumnPicker visible={visibleSalesColumns} onToggle={toggleSalesColumn} />
              <Button variant="outline" size="sm" onClick={() => downloadReport('hisabiq-sales.csv', ['Invoice','Date','Customer','Phone','Items','Total','Paid','Due','Payment','Status'], filtered.map(invoice => [invoice.invoice,invoice.date,invoice.party,invoice.phone ?? '',invoice.lines.map(line => line.name+' · '+invoiceQty(line)).join('; '),invoice.total,invoice.paid,invoice.due,invoice.payments.map(p => p.method).join(' + ') || invoice.method,invoice.status]))}>
                <ArrowDownToLine className="size-4" /> Export
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {visibleSalesColumns.invoice && <TableHead className="h-9 pl-4 text-xs">Invoice</TableHead>}
                  {visibleSalesColumns.customer && <TableHead className="h-9 text-xs">Customer</TableHead>}
                  {visibleSalesColumns.items && <TableHead className="h-9 text-xs">Items</TableHead>}
                  {visibleSalesColumns.total && <TableHead className="h-9 text-right text-xs">Total</TableHead>}
                  {visibleSalesColumns.profit && <TableHead className="h-9 text-right text-xs" title="Invoice total minus cost of goods sold">Profit</TableHead>}
                  {visibleSalesColumns.paid && <TableHead className="h-9 text-right text-xs">Paid</TableHead>}
                  {visibleSalesColumns.due && <TableHead className="h-9 text-right text-xs">Due</TableHead>}
                  {visibleSalesColumns.payment && <TableHead className="h-9 text-xs">Payment</TableHead>}
                  {visibleSalesColumns.status && <TableHead className="h-9 text-xs">Status</TableHead>}
                  <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((invoice) => (
                  <TableRow key={invoice.id} className="cursor-pointer text-[13px]" onClick={() => setDetail(invoice)}>
                    {visibleSalesColumns.invoice && <TableCell className="py-2 pl-4">
                      <span className="font-medium text-ink">{invoice.invoice}</span>
                      <span className="block text-[11px] text-ink-400">{invoice.date} · {invoice.time}</span>
                    </TableCell>}
                    {visibleSalesColumns.customer && <TableCell className="py-2">
                      {invoice.partyId ? (
                        <button
                          onClick={(event) => { event.stopPropagation(); navigate(`/app/parties?id=${invoice.partyId}`); }}
                          className="font-medium text-teal-700 hover:underline">
                          {invoice.party}
                        </button>
                      ) : <p className="font-medium text-ink">{invoice.party}</p>}
                      <p className="text-[11px] text-ink-400">{invoice.phone ?? 'No phone'}</p>
                    </TableCell>}
                    {visibleSalesColumns.items && <TableCell className="max-w-[270px] py-2 text-ink-600">
                      <span className="block truncate">{invoice.lines.map((line) => line.name).join(', ')}</span>
                      <span className="text-[11px] text-ink-400">{invoice.items} line{invoice.items === 1 ? '' : 's'}</span>
                    </TableCell>}
                    {visibleSalesColumns.total && <TableCell className="py-2 text-right font-medium">{taka(invoice.total)}</TableCell>}
                    {visibleSalesColumns.profit && <TableCell className={`py-2 text-right font-medium ${invoiceProfit(invoice) < 0 ? 'text-danger' : 'text-success'}`}>
                      {invoiceProfit(invoice) < 0 ? '−' : ''}{taka(Math.abs(invoiceProfit(invoice)), Math.abs(invoiceProfit(invoice)) % 1 ? 2 : 0)}
                    </TableCell>}
                    {visibleSalesColumns.paid && <TableCell className="py-2 text-right text-ink-600">{taka(invoice.paid)}</TableCell>}
                    {visibleSalesColumns.due && <TableCell className={`py-2 text-right ${invoice.due > 0 ? 'font-medium text-danger' : 'text-helper'}`}>{invoice.due > 0 ? taka(invoice.due) : '—'}</TableCell>}
                    {visibleSalesColumns.payment && <TableCell className="py-2 text-ink-600">{invoice.payments.length > 1 ? 'Multiple' : invoice.method}</TableCell>}
                    {visibleSalesColumns.status && <TableCell className="py-2"><PaymentStatus invoice={invoice} /></TableCell>}
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
                <Button variant="outline" size="sm" className="mt-3" onClick={() => { setQuery(''); setCustomerFilter('All customers'); setStatus('All status'); setMethod('All payments'); }}>Clear filters</Button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-ink-500">
              <span>Showing {filtered.length} of {invoices.length} invoices</span>
              <span>Click a row to view invoice details</span>
            </div>
          </>
        )}

        {tab === 'return' && (
          <div className="grid gap-4 p-4 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-ink-50/50 p-4">
                <div className="mb-3 flex items-start gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <UserRound className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">Choose customer</p>
                    <p className="text-xs text-ink-500">Select a customer to load invoices that can be returned together.</p>
                  </div>
                </div>
                <FormSelect
                  className="mt-3"
                  value={returnCustomer}
                  onChange={(event) => {
                    setReturnCustomer(event.target.value);
                    setReturnInvoiceIds([]);
                    setReturnQty({});
                    setReturnPrice({});
                    setReturnReason({});
                    setReturnSerials({});
                  }}
                  options={customerNames}
                />
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border p-3">
                  <p className="text-[13px] font-medium text-ink">Select invoices <span className="font-bn text-[11px] font-normal text-ink-400">· ইনভয়েস বাছুন</span></p>
                  <p className="mt-0.5 text-[11px] text-ink-500">Choose one or more invoices for a batch return.</p>
                </div>
                <div className="divide-y divide-border">
                  {customerInvoices.map((invoice) => (
                    <label key={invoice.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-ink-50">
                      <input
                        type="checkbox"
                        checked={returnInvoiceIds.includes(invoice.id)}
                        onChange={(event) => {
                          setReturnInvoiceIds((ids) => event.target.checked ? [...ids, invoice.id] : ids.filter((id) => id !== invoice.id));
                          setReturnQty({});
                          setReturnPrice({});
                          setReturnReason({});
                          setReturnSerials({});
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

            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border p-3">
                <p className="text-[13px] font-medium text-ink">Return items <span className="font-bn text-[11px] font-normal text-ink-400">· ফেরত পণ্য</span></p>
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
                              {qty > 0 && (
                                <div className="mt-2 max-w-[260px] space-y-1.5">
                                  <FormSelect
                                    value={returnReason[line.id] ?? 'Customer return'}
                                    onChange={(event) => setReturnReason((value) => ({ ...value, [line.id]: event.target.value }))}
                                    options={['Customer return', 'Damaged', 'Wrong item', 'Warranty claim']}
                                  />
                                  {line.serials?.length ? (
                                    <>
                                      <Input
                                        value={returnSerials[line.id] ?? ''}
                                        onChange={(event) => setReturnSerials((value) => ({ ...value, [line.id]: event.target.value }))}
                                        placeholder="Returned serial, comma separated"
                                        className="h-8"
                                      />
                                      <p className="text-[10.5px] text-ink-400">Sold serials: {line.serials.join(', ')}</p>
                                    </>
                                  ) : null}
                                  {(returnReason[line.id] ?? 'Customer return') === 'Warranty claim' && (
                                    <p className="text-[10.5px] text-teal-700">This return will be available for warranty intake.</p>
                                  )}
                                </div>
                              )}
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
                              <p className={`mt-1 text-[10.5px] ${qty > returnLimit(line) ? 'font-medium text-danger' : 'text-ink-400'}`}>
                                max {returnLimit(line)} {line.unit}
                              </p>
                            </TableCell>
                            <TableCell className="py-2 pr-3">
                              <div className="ml-auto w-28">
                                <Input
                                  value={returnPrice[line.id] ?? String(line.price)}
                                  onChange={(event) => setReturnPrice((value) => ({ ...value, [line.id]: event.target.value.replace(/[^\d.]/g, '') }))}
                                  inputMode="decimal"
                                  className="h-8 text-right"
                                  aria-label={`Return price for ${line.name}`}
                                />
                                <p className="mt-1 text-right text-[10.5px] text-ink-400">
                                  {qty > 0 ? taka(qty * returnPriceFor(line)) : `/${line.unit}`}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <div className="grid gap-3 border-t border-border bg-ink-50/40 p-3 sm:grid-cols-[minmax(0,1fr)_180px_160px] sm:items-end">
                    <label className="text-[12px] font-medium text-ink">
                      Settlement
                      <FormSelect
                        className="mt-1"
                        value={returnSettlement}
                        onChange={(event) => setReturnSettlement(event.target.value as SalesReturn['settlement'])}
                        options={['Adjust due', 'Customer credit', 'Cash refund']}
                      />
                      <span className="mt-1 block text-[10.5px] font-normal text-ink-400">
                        {returnSettlement === 'Adjust due'
                          ? `Selected invoice due ${taka(selectedReturnDue)}. Any extra return value becomes customer credit.`
                          : returnSettlement === 'Customer credit'
                            ? 'Keep the full return value on the customer account.'
                            : 'Refund the return value from cash or another payment account.'}
                      </span>
                    </label>
                    <div className="rounded-lg bg-ink-50 px-3 py-2">
                      <p className="text-[11px] text-ink-400">Return amount</p>
                      <p className="text-base font-semibold text-ink">{taka(returnAmount)}</p>
                    </div>
                    <Button onClick={completeReturn}><CornerUpLeft className="size-4" /> Complete return</Button>
                    {returnSettlement === 'Cash refund' && (
                      <div className="grid gap-3 sm:col-span-3 sm:grid-cols-2">
                        <label className="text-[12px] font-medium text-ink">
                          Refund method
                          <FormSelect
                            className="mt-1"
                            value={returnRefundMethod}
                            onChange={(event) => setReturnRefundMethod(event.target.value as Exclude<PaymentMethod, 'Customer Credit'>)}
                            options={paymentMethods}
                          />
                        </label>
                        <label className="text-[12px] font-medium text-ink">
                          Refund account
                          <Input
                            className="mt-1"
                            value={returnRefundAccount}
                            onChange={(event) => setReturnRefundAccount(event.target.value)}
                            placeholder={returnRefundMethod === 'Cash' ? 'Cash counter' : 'Bank / wallet account'}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="px-4 py-16 text-center">
                  <CornerUpLeft className="mx-auto size-7 text-helper" />
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
                  <TableCell className="py-2">
                    <StatusBadge tone={item.settlement === 'Cash refund' ? 'warning' : 'info'}>{item.settlement}</StatusBadge>
                    {item.refundMethod && <p className="mt-1 text-[10.5px] text-ink-400">{item.refundMethod}{item.refundAccount ? ` · ${item.refundAccount}` : ''}</p>}
                  </TableCell>
                  <TableCell className="py-2 pr-4 text-right">
                    <FloatingPanel
                      label={`Actions for ${item.id}`}
                      width={210}
                      trigger={({ toggle, open }) => (
                        <button onClick={toggle} aria-expanded={open} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink" aria-label={`Actions for ${item.id}`}>
                          <MoreHorizontal className="size-4" />
                        </button>
                      )}>
                      {(close) => (
                        <div className="py-1">
                          <button onClick={() => { close(); setReturnDetail(item); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
                            <FileText className="size-4 text-ink-400" /> View return
                          </button>
                          <button onClick={() => { close(); printReturn(item); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
                            <Printer className="size-4 text-ink-400" /> Print
                          </button>
                          <button onClick={() => { close(); navigate('/app/parties'); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
                            <BookOpen className="size-4 text-ink-400" /> Customer ledger
                          </button>
                          <button onClick={() => {
                            close();
                            setReturnCustomer(item.customer);
                            setReturnInvoiceIds([]);
                            setReturnQty({});
                            setReturnPrice({});
                            setReturnReason({});
                            setReturnSerials({});
                            setTab('return');
                          }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
                            <CornerUpLeft className="size-4 text-ink-400" /> Start another return
                          </button>
                        </div>
                      )}
                    </FloatingPanel>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}


        {tab === 'credits' && (
          <div>
            <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13px] font-medium text-ink">Customer payments & credit <span className="font-bn text-[11px] font-normal text-ink-400">· কাস্টমার জমা</span></p>
                <p className="mt-0.5 text-[11px] text-ink-500">Receive customer payments, settle invoice dues, keep advance credit, or refund unused credit.</p>
              </div>
              <Button size="sm" onClick={() => setCustomerPaymentOpen(true)}>
                <Plus className="size-4" /> Receive customer payment
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Customer</TableHead>
                  <TableHead className="h-9 text-xs">Source</TableHead>
                  <TableHead className="h-9 text-xs">Updated</TableHead>
                  <TableHead className="h-9 text-right text-xs">Credit balance</TableHead>
                  <TableHead className="h-9 text-xs">Status</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {credits.map((credit) => (
                  <TableRow key={credit.id} className="text-[13px]">
                    <TableCell className="py-2 pl-4">
                      <p className="font-medium text-ink">{credit.customer}</p>
                      <p className="text-[11px] text-ink-400">{credit.id}</p>
                    </TableCell>
                    <TableCell className="py-2 text-ink-600">{credit.source}</TableCell>
                    <TableCell className="py-2 text-ink-500">{credit.updatedAt}</TableCell>
                    <TableCell className="py-2 text-right font-medium">{taka(credit.balance)}</TableCell>
                    <TableCell className="py-2">
                      <StatusBadge tone={credit.balance > 0 ? 'teal' : 'neutral'} dot={credit.balance > 0}>
                        {credit.balance > 0 ? 'Available' : 'Settled'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="py-2 pr-4 text-right">
                      <FloatingPanel
                        label={`Credit actions for ${credit.customer}`}
                        width={220}
                        trigger={({ toggle, open }) => (
                          <button
                            onClick={toggle}
                            aria-expanded={open}
                            aria-label={`Actions for ${credit.customer} credit`}
                            className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink">
                            <MoreHorizontal className="size-4" />
                          </button>
                        )}>
                        {(close) => (
                          <div className="py-1">
                            <button
                              disabled={credit.balance <= 0}
                              onClick={() => { close(); setCreditAction({ credit, mode: 'apply' }); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-helper">
                              <FileText className="size-4 text-ink-400" /> Apply to invoice
                            </button>
                            <button
                              disabled={credit.balance <= 0}
                              onClick={() => { close(); setCreditAction({ credit, mode: 'refund' }); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:text-helper">
                              <Banknote className="size-4 text-ink-400" /> Refund credit
                            </button>
                            <button
                              onClick={() => { close(); navigate(credit.customerId ? `/app/parties?id=${credit.customerId}` : '/app/parties'); }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
                              <BookOpen className="size-4 text-ink-400" /> Customer ledger
                            </button>
                          </div>
                        )}
                      </FloatingPanel>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-ink-500">
              <span>Total customer credit {taka(creditTotal)}</span>
              <span>Credit can settle invoice due or be refunded from a selected account</span>
            </div>
          </div>
        )}

        {tab === 'drafts' && (
          <div className="grid gap-4 p-4 xl:grid-cols-2">
            <section className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center justify-between border-b border-border p-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink"><FileClock className="size-4 text-teal-700" /> Draft sales <span className="font-bn text-[11px] font-normal text-ink-400">· খসড়া</span></p>
                  <p className="mt-0.5 text-[11px] text-ink-500">Continue, edit, duplicate or archive a held sale.</p>
                </div>
                <StatusBadge tone="teal">{drafts.length}</StatusBadge>
              </div>
              <div className="divide-y divide-border">
                {drafts.map((draft) => (
                  <div key={draft.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-medium text-ink">{draft.label} · {draft.customer ?? 'Walk-in customer'}</p>
                        <p className="mt-0.5 text-[11px] text-ink-400">{draft.items} items · {draft.savedAt}</p>
                      </div>
                      <span className="text-[13px] font-semibold">{taka(draft.total)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" onClick={() => { toast(`${draft.label} continued in POS`); navigate(`/app/pos?mode=continue-draft&draft=${draft.id}`); }}>Continue</Button>
                      <FloatingPanel
                        label={`Actions for ${draft.label}`}
                        width={190}
                        trigger={({ toggle, open }) => (
                          <Button size="sm" variant="outline" onClick={toggle} aria-expanded={open}><MoreHorizontal className="size-4" /> Actions</Button>
                        )}>
                        {(close) => (
                          <div className="py-1">
                            <button onClick={() => { close(); toast(`${draft.label} opened for editing`); navigate(`/app/pos?mode=edit-draft&draft=${draft.id}`); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
                              <Pencil className="size-4 text-ink-400" /> Edit
                            </button>
                            <button onClick={() => { close(); toast(`${draft.label} duplicated`); navigate(`/app/pos?mode=duplicate-draft&draft=${draft.id}`); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
                              <Copy className="size-4 text-ink-400" /> Duplicate
                            </button>
                            <button onClick={() => {
                              close();
                              setDrafts((items) => items.filter((item) => item.id !== draft.id));
                              toast.error(`${draft.label} archived`);
                            }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-danger hover:bg-danger-bg">
                              <Trash2 className="size-4" /> Archive
                            </button>
                          </div>
                        )}
                      </FloatingPanel>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-border">
              <div className="flex items-center justify-between border-b border-border p-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink"><FileText className="size-4 text-teal-700" /> Sale templates <span className="font-bn text-[11px] font-normal text-ink-400">· টেমপ্লেট</span></p>
                  <p className="mt-0.5 text-[11px] text-ink-500">Reuse common carts without recreating every line.</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => {
                  const next = {
                    id: `t${Date.now()}`,
                    name: `Sale template ${templates.length + 1}`,
                    items: 0,
                    total: 0,
                    lastUsed: 'Not used yet',
                    lines: []
                  };
                  setTemplates((items) => [next, ...items]);
                  toast.success(`${next.name} created`);
                }}><Plus className="size-3.5" /> Template</Button>
              </div>
              <div className="divide-y divide-border">
                {templates.map((template) => (
                  <div key={template.id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-medium text-ink">{template.name}</p>
                        <p className="mt-0.5 text-[11px] text-ink-400">{template.customer ?? 'Any customer'} · {template.items} items · last used {template.lastUsed}</p>
                      </div>
                      <span className="text-[13px] font-semibold">{taka(template.total)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" onClick={() => { toast(`${template.name} loaded into POS`); navigate(`/app/pos?mode=template&template=${template.id}`); }}>Use template</Button>
                      <FloatingPanel
                        label={`Actions for ${template.name}`}
                        width={190}
                        trigger={({ toggle, open }) => (
                          <Button size="sm" variant="outline" onClick={toggle} aria-expanded={open}><MoreHorizontal className="size-4" /> Actions</Button>
                        )}>
                        {(close) => (
                          <div className="py-1">
                            <button onClick={() => { close(); toast(`Editing ${template.name}`); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
                              <Pencil className="size-4 text-ink-400" /> Edit template
                            </button>
                            <button onClick={() => {
                              close();
                              const copy = { ...template, id: `t${Date.now()}`, name: `${template.name} copy`, lastUsed: 'Not used yet' };
                              setTemplates((items) => [copy, ...items]);
                              toast.success(`${template.name} duplicated`);
                            }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
                              <Copy className="size-4 text-ink-400" /> Duplicate
                            </button>
                            <button onClick={() => {
                              close();
                              setTemplates((items) => items.filter((item) => item.id !== template.id));
                              toast.error(`${template.name} deleted`);
                            }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-danger hover:bg-danger-bg">
                              <Trash2 className="size-4" /> Delete
                            </button>
                          </div>
                        )}
                      </FloatingPanel>
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

      <CustomerPaymentDialog
        open={customerPaymentOpen}
        customers={customerNames.filter((customer) => customer !== 'Walk-in customer')}
        onClose={() => setCustomerPaymentOpen(false)}
        onSave={receiveCustomerPayment}
      />

      <CreditActionDialog
        action={creditAction}
        invoices={invoices}
        onClose={() => setCreditAction(null)}
        onApply={applyCustomerCredit}
        onRefund={refundCustomerCredit}
      />
      <Dialog open={!!returnDetail} onOpenChange={open => !open && setReturnDetail(null)}>
        <DialogContent role="dialog" aria-label="Sales return details" className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{returnDetail?.id}</DialogTitle><DialogDescription>Return source preview · no new refund or stock movement.</DialogDescription></DialogHeader>
          {returnDetail && <dl className="space-y-2 text-sm">{returnDocument(returnDetail).rows.map(([label,value]) => <div key={String(label)} className="flex flex-wrap justify-between gap-2"><dt className="text-ink-500">{label}</dt><dd className="max-w-full break-words text-ink">{value}</dd></div>)}</dl>}
          <DialogFooter><Button variant="outline" onClick={() => setReturnDetail(null)}>Close</Button><Button onClick={() => returnDetail && printReturn(returnDetail)}>Print return</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

