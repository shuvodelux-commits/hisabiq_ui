import { AppSelect } from '../components/AppSelect';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  FileText,
  MoreHorizontal,
  PackageCheck,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  Wrench
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import { FormSelect } from '../components/FormSelect';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { FloatingPanel } from '../components/layout/FloatingPanel';
import { StatusBadge, type StatusTone } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { parties } from '../data/parties';
import { products } from '../data/products';
import { salesInvoices } from '../data/sales';
import { warrantyCases as seedCases } from '../data/warranty';
import type { WarrantyCase, WarrantyRoute, WarrantyStatus } from '../types/erp';

type Tab = 'cases' | 'supplier' | 'history';

const openStatuses: WarrantyStatus[] = [
  'Received',
  'Checking',
  'Sent to supplier',
  'Waiting supplier',
  'Received from supplier',
  'Ready for customer'
];

const supplierStatuses: WarrantyStatus[] = ['Sent to supplier', 'Waiting supplier', 'Received from supplier'];

const statusTone: Record<WarrantyStatus, StatusTone> = {
  Received: 'info',
  Checking: 'warning',
  'Sent to supplier': 'teal',
  'Waiting supplier': 'warning',
  'Received from supplier': 'info',
  'Ready for customer': 'success',
  Resolved: 'success',
  Rejected: 'danger'
};

const statusLabels: Record<WarrantyStatus, string> = {
  Received: 'Received',
  Checking: 'Checking',
  'Sent to supplier': 'Sent to supplier',
  'Waiting supplier': 'Waiting supplier',
  'Received from supplier': 'Received from supplier',
  'Ready for customer': 'Ready for customer',
  Resolved: 'Resolved',
  Rejected: 'Rejected'
};

function WarrantyBadge({ status }: { status: WarrantyStatus }) {
  return <StatusBadge tone={statusTone[status]} dot>{statusLabels[status]}</StatusBadge>;
}

function nextAction(item: WarrantyCase) {
  switch (item.status) {
    case 'Received':
      return { label: 'Start checking', next: 'Checking' as WarrantyStatus, icon: Wrench };
    case 'Checking':
      return item.route === 'In-house'
        ? { label: 'Ready for customer', next: 'Ready for customer' as WarrantyStatus, icon: CheckCircle2 }
        : { label: item.route === 'Manufacturer' ? 'Send to manufacturer' : 'Send to supplier', next: 'Sent to supplier' as WarrantyStatus, icon: Send };
    case 'Sent to supplier':
      return { label: 'Mark waiting', next: 'Waiting supplier' as WarrantyStatus, icon: Clock3 };
    case 'Waiting supplier':
      return { label: item.route === 'Manufacturer' ? 'Receive from manufacturer' : 'Receive from supplier', next: 'Received from supplier' as WarrantyStatus, icon: PackageCheck };
    case 'Received from supplier':
      return { label: 'Ready for customer', next: 'Ready for customer' as WarrantyStatus, icon: CheckCircle2 };
    case 'Ready for customer':
      return { label: 'Complete warranty', next: 'Resolved' as WarrantyStatus, icon: CheckCircle2 };
    default:
      return null;
  }
}

function WarrantyActions({
  item,
  onView,
  onAdvance,
  onReject,
  onTemporaryReplacement
}: {
  item: WarrantyCase;
  onView: () => void;
  onAdvance: (item: WarrantyCase) => void;
  onReject: (item: WarrantyCase) => void;
  onTemporaryReplacement: (item: WarrantyCase) => void;
}) {
  const navigate = useNavigate();
  const action = nextAction(item);
  const itemClass = 'flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50';

  return (
    <FloatingPanel
      label={`Actions for ${item.id}`}
      width={230}
      trigger={({ toggle, open }) => (
        <button
          onClick={(event) => { event.stopPropagation(); toggle(); }}
          aria-expanded={open}
          aria-label={`Actions for ${item.id}`}
          className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink">
          <MoreHorizontal className="size-4" />
        </button>
      )}>
      {(close) => (
        <div className="py-1" onClick={(event) => event.stopPropagation()}>
          <button className={itemClass} onClick={() => { close(); onView(); }}>
            <FileText className="size-4 text-ink-400" /> View case
          </button>
          {action && (
            <button className={itemClass} onClick={() => { close(); onAdvance(item); }}>
              <action.icon className="size-4 text-ink-400" /> {action.label}
            </button>
          )}
          {openStatuses.includes(item.status) && !item.replacement && (
            <button className={itemClass} onClick={() => { close(); onTemporaryReplacement(item); }}>
              <RotateCcw className="size-4 text-ink-400" /> Temporary replacement
            </button>
          )}
          {item.customerId && (
            <button className={itemClass} onClick={() => { close(); navigate(`/app/parties?id=${item.customerId}`); }}>
              <UserRound className="size-4 text-ink-400" /> Customer ledger
            </button>
          )}
          <button className={itemClass} onClick={() => { close(); toast.success(`${item.id} sent to printer`); }}>
            <Printer className="size-4 text-ink-400" /> Print receipt
          </button>
          {openStatuses.includes(item.status) && (
            <button
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-danger hover:bg-danger-bg"
              onClick={() => { close(); onReject(item); }}>
              <ShieldCheck className="size-4" /> Reject warranty
            </button>
          )}
        </div>
      )}
    </FloatingPanel>
  );
}

function WarrantyDetailDialog({
  item,
  onClose,
  onAdvance,
  onTemporaryReplacement,
  onReject
}: {
  item: WarrantyCase | null;
  onClose: () => void;
  onAdvance: (item: WarrantyCase) => void;
  onTemporaryReplacement: (item: WarrantyCase) => void;
  onReject: (item: WarrantyCase) => void;
}) {
  const navigate = useNavigate();
  const action = item ? nextAction(item) : null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl scrollbar-thin">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                {item.id}
                <WarrantyBadge status={item.status} />
              </DialogTitle>
              <DialogDescription>{item.receivedAt} · {item.customer} · {item.product}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-3">
                <div className="rounded-xl border border-border">
                  <div className="grid grid-cols-2 gap-3 border-b border-border p-3 text-[12.5px] sm:grid-cols-4">
                    <div><p className="text-ink-400">Customer</p><p className="font-medium text-ink">{item.customer}</p></div>
                    <div><p className="text-ink-400">Phone</p><p className="font-medium text-ink">{item.phone ?? '—'}</p></div>
                    <div><p className="text-ink-400">Invoice</p><p className="font-medium text-ink">{item.invoice}</p></div>
                    <div><p className="text-ink-400">Serial</p><p className="font-medium text-ink">{item.serial ?? '—'}</p></div>
                  </div>
                  <div className="space-y-3 p-3 text-[12.5px]">
                    <div>
                      <p className="text-ink-400">Issue</p>
                      <p className="mt-0.5 font-medium text-ink">{item.issue}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div><p className="text-ink-400">Route</p><p className="font-medium text-ink">{item.route}</p></div>
                      <div><p className="text-ink-400">Supplier / manufacturer</p><p className="font-medium text-ink">{item.supplier ?? '—'}</p></div>
                      <div><p className="text-ink-400">Supplier reference</p><p className="font-medium text-ink">{item.supplierRef ?? '—'}</p></div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div><p className="text-ink-400">Expected</p><p className="font-medium text-ink">{item.expectedDate ?? '—'}</p></div>
                      <div><p className="text-ink-400">Resolution</p><p className="font-medium text-ink">{item.resolution ?? 'Not decided'}</p></div>
                    </div>
                    {item.finalReplacement && (
                      <div className="rounded-lg bg-ink-50 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Final replacement</p>
                        <p className="mt-1 text-[12.5px] font-medium text-ink">{item.finalReplacement.product}</p>
                        <p className="text-[11px] text-ink-500">{item.finalReplacement.serial ? `Serial ${item.finalReplacement.serial}` : 'No serial recorded'}</p>
                      </div>
                    )}
                    {item.note && <p className="rounded-lg bg-warning-bg px-3 py-2 text-warning">{item.note}</p>}
                  </div>
                </div>

                {item.replacement && (
                  <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-teal-700">Temporary replacement</p>
                    <div className="mt-2 grid gap-2 text-[12.5px] sm:grid-cols-3">
                      <div><p className="text-teal-700/70">Product</p><p className="font-medium text-ink">{item.replacement.product}</p></div>
                      <div><p className="text-teal-700/70">Serial</p><p className="font-medium text-ink">{item.replacement.serial ?? '—'}</p></div>
                      <div><p className="text-teal-700/70">Given</p><p className="font-medium text-ink">{item.replacement.givenAt}</p></div>
                    </div>
                    <p className="mt-2 text-[11px] text-teal-700">
                      {item.replacement.returnedAt ? `Returned ${item.replacement.returnedAt}` : 'Still with customer · collect before closing case'}
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border p-3">
                  <p className="text-[13px] font-semibold text-ink">Case timeline</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">Every handoff stays visible.</p>
                </div>
                <ol className="space-y-0 p-3">
                  {item.events.map((event, index) => (
                    <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                      {index < item.events.length - 1 && <span className="absolute left-[7px] top-4 h-[calc(100%-4px)] w-px bg-ink-100" />}
                      <span className="relative mt-1.5 size-3.5 shrink-0 rounded-full border-2 border-card bg-teal-600 ring-1 ring-teal-200" />
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium text-ink">{event.title}</p>
                        <p className="text-[10.5px] text-ink-400">{event.date}</p>
                        {event.note && <p className="mt-1 text-[11px] text-ink-500">{event.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <DialogFooter className="flex-wrap">
              {item.customerId && (
                <Button variant="outline" onClick={() => navigate(`/app/parties?id=${item.customerId}`)}>
                  <UserRound className="size-4" /> Customer
                </Button>
              )}
              <Button variant="outline" onClick={() => toast.success(`${item.id} sent to printer`)}>
                <Printer className="size-4" /> Print
              </Button>
              {openStatuses.includes(item.status) && !item.replacement && (
                <Button variant="outline" onClick={() => onTemporaryReplacement(item)}>
                  <RotateCcw className="size-4" /> Temporary replacement
                </Button>
              )}
              {openStatuses.includes(item.status) && (
                <Button variant="outline" onClick={() => onReject(item)}>
                  Reject
                </Button>
              )}
              {action && (
                <Button onClick={() => onAdvance(item)}>
                  <action.icon className="size-4" /> {action.label}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function IntakeDialog({
  open,
  initialInvoice,
  onOpenChange,
  onSave
}: {
  open: boolean;
  initialInvoice?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (item: WarrantyCase) => void;
}) {
  const customerInvoices = salesInvoices;
  const [invoiceNo, setInvoiceNo] = useState(customerInvoices[0]?.invoice ?? '');
  const selectedInvoice = customerInvoices.find((invoice) => invoice.invoice === invoiceNo) ?? customerInvoices[0];
  const [productId, setProductId] = useState(selectedInvoice?.lines[0]?.productId ?? products[0].id);
  const selectedLine = selectedInvoice?.lines.find((line) => line.productId === productId) ?? selectedInvoice?.lines[0];
  const [serial, setSerial] = useState(selectedLine?.serials?.[0] ?? '');
  const [issue, setIssue] = useState('');
  const [route, setRoute] = useState<WarrantyRoute>('Supplier');
  const [supplier, setSupplier] = useState('Padma Electric Supply');
  const [expectedDate, setExpectedDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open || !initialInvoice) return;
    const nextInvoice = customerInvoices.find((invoice) => invoice.invoice === initialInvoice);
    if (!nextInvoice) return;
    setInvoiceNo(nextInvoice.invoice);
    const firstLine = nextInvoice.lines[0];
    if (firstLine) {
      setProductId(firstLine.productId);
      setSerial(firstLine.serials?.[0] ?? '');
    }
  }, [initialInvoice, open]);

  const reset = () => {
    setIssue('');
    setExpectedDate('');
    setNote('');
  };

  const save = () => {
    if (!selectedInvoice || !selectedLine || !issue.trim()) {
      toast.error('Choose an invoice item and describe the warranty issue');
      return;
    }
    const party = parties.find((item) => item.id === selectedInvoice.partyId);
    const next: WarrantyCase = {
      id: `WRN-${String(22 + Date.now() % 1000).padStart(6, '0')}`,
      receivedAt: '06 Oct 2026, 09:25 PM',
      customer: selectedInvoice.party,
      ...(selectedInvoice.partyId ? { customerId: selectedInvoice.partyId } : {}),
      ...(selectedInvoice.phone ? { phone: selectedInvoice.phone } : {}),
      invoice: selectedInvoice.invoice,
      productId: selectedLine.productId,
      product: selectedLine.name,
      ...(serial.trim() ? { serial: serial.trim() } : {}),
      issue: issue.trim(),
      status: 'Received',
      route,
      ...(route !== 'In-house' && supplier ? { supplier } : {}),
      ...(expectedDate.trim() ? { expectedDate: expectedDate.trim() } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
      events: [{
        id: `we-${Date.now()}`,
        date: '06 Oct, 09:25 PM',
        title: 'Warranty received',
        note: `Verified against ${selectedInvoice.invoice}${party ? ` · ${party.phone}` : ''}.`
      }]
    };
    onSave(next);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Receive warranty <span className="font-bn text-sm font-normal text-ink-500">ওয়ারেন্টি গ্রহণ</span></DialogTitle>
          <DialogDescription>Find the original sale, verify the product/serial, then record the issue.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[12px] font-medium text-ink">
            Invoice
            <FormSelect
              className="mt-1"
              value={invoiceNo}
              onChange={(event) => {
                const nextInvoice = customerInvoices.find((invoice) => invoice.invoice === event.target.value);
                setInvoiceNo(event.target.value);
                const firstLine = nextInvoice?.lines[0];
                if (firstLine) {
                  setProductId(firstLine.productId);
                  setSerial(firstLine.serials?.[0] ?? '');
                }
              }}
              options={customerInvoices.map((invoice) => invoice.invoice)}
            />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Customer
            <Input className="mt-1" value={selectedInvoice?.party ?? ''} readOnly />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Product
            <AppSelect label="Warranty product" className="mt-1"
              value={selectedLine?.productId ?? ''}
              onChange={(next) => {
                const line = selectedInvoice?.lines.find((item) => item.productId === next);
                setProductId(next);
                setSerial(line?.serials?.[0] ?? '');
              }}
              options={(selectedInvoice?.lines ?? []).map((line) => ({ value: line.productId, label: line.name }))} />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Serial number
            <Input className="mt-1" value={serial} onChange={(event) => setSerial(event.target.value)} placeholder="Optional if product has no serial" />
          </label>
          <label className="text-[12px] font-medium text-ink sm:col-span-2">
            Issue
            <textarea
              value={issue}
              onChange={(event) => setIssue(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-ink shadow-xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="What problem did the customer report?"
            />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Route
            <FormSelect className="mt-1" value={route} onChange={(event) => setRoute(event.target.value as WarrantyRoute)} options={['In-house', 'Supplier', 'Manufacturer']} />
          </label>
          {route !== 'In-house' ? (
            <label className="text-[12px] font-medium text-ink">
              Supplier / manufacturer
              <FormSelect className="mt-1" value={supplier} onChange={(event) => setSupplier(event.target.value)} options={['Padma Electric Supply', 'Karim Traders', 'Hossain Electric', 'Bismillah Steel House']} />
            </label>
          ) : <div />}
          <label className="text-[12px] font-medium text-ink">
            Expected date
            <Input className="mt-1" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} placeholder="e.g. 10 Oct 2026" />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Note
            <Input className="mt-1" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional internal note" />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}><ShieldCheck className="size-4" /> Receive warranty</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function SendExternalDialog({
  item,
  onClose,
  onSave
}: {
  item: WarrantyCase | null;
  onClose: () => void;
  onSave: (item: WarrantyCase, supplier: string, supplierRef: string, expectedDate: string) => void;
}) {
  const [supplier, setSupplier] = useState('');
  const [supplierRef, setSupplierRef] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  useEffect(() => {
    if (!item) return;
    setSupplier(item.supplier ?? 'Padma Electric Supply');
    setSupplierRef(item.supplierRef ?? '');
    setExpectedDate(item.expectedDate ?? '');
  }, [item]);

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>{item.route === 'Manufacturer' ? 'Send to manufacturer' : 'Send to supplier'}</DialogTitle>
              <DialogDescription>{item.id} · {item.customer} · {item.product}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[12px] font-medium text-ink sm:col-span-2">
                {item.route === 'Manufacturer' ? 'Manufacturer / forwarding supplier' : 'Supplier'}
                <FormSelect
                  className="mt-1"
                  value={supplier}
                  onChange={(event) => setSupplier(event.target.value)}
                  options={['Padma Electric Supply', 'Karim Traders', 'Hossain Electric', 'Bismillah Steel House']}
                />
              </label>
              <label className="text-[12px] font-medium text-ink">
                External reference
                <Input className="mt-1" value={supplierRef} onChange={(event) => setSupplierRef(event.target.value)} placeholder="Supplier warranty ref" />
              </label>
              <label className="text-[12px] font-medium text-ink">
                Expected back
                <Input className="mt-1" value={expectedDate} onChange={(event) => setExpectedDate(event.target.value)} placeholder="e.g. 12 Oct 2026" />
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => { onSave(item, supplier, supplierRef, expectedDate); onClose(); }}>
                <Send className="size-4" /> Send
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReceiveExternalDialog({
  item,
  onClose,
  onSave
}: {
  item: WarrantyCase | null;
  onClose: () => void;
  onSave: (
    item: WarrantyCase,
    resolution: 'Repair' | 'Replace' | 'Rejected',
    replacementSerial: string,
    note: string
  ) => void;
}) {
  const [resolution, setResolution] = useState<'Repair' | 'Replace' | 'Rejected'>('Repair');
  const [replacementSerial, setReplacementSerial] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!item) return;
    setResolution(item.resolution === 'Replace' || item.resolution === 'Rejected' ? item.resolution : 'Repair');
    setReplacementSerial(item.finalReplacement?.serial ?? '');
    setNote('');
  }, [item]);

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>{item.route === 'Manufacturer' ? 'Receive from manufacturer' : 'Receive from supplier'}</DialogTitle>
              <DialogDescription>{item.id} · {item.supplier ?? item.route} · {item.product}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[12px] font-medium text-ink">
                Outcome
                <FormSelect
                  className="mt-1"
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value as 'Repair' | 'Replace' | 'Rejected')}
                  options={['Repair', 'Replace', 'Rejected']}
                />
              </label>
              {resolution === 'Replace' ? (
                <label className="text-[12px] font-medium text-ink">
                  New serial
                  <Input className="mt-1" value={replacementSerial} onChange={(event) => setReplacementSerial(event.target.value)} placeholder="Replacement serial" />
                </label>
              ) : <div />}
              <label className="text-[12px] font-medium text-ink sm:col-span-2">
                Note
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-ink shadow-xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="Supplier/manufacturer note, repair details, rejection reason…"
                />
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => { onSave(item, resolution, replacementSerial, note); onClose(); }}>
                <PackageCheck className="size-4" /> Receive
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TemporaryReplacementDialog({
  item,
  onClose,
  onSave
}: {
  item: WarrantyCase | null;
  onClose: () => void;
  onSave: (item: WarrantyCase, product: string, serial: string) => void;
}) {
  const [product, setProduct] = useState('LED Bulb 12W');
  const [serial, setSerial] = useState('');

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        {item && (
          <>
            <DialogHeader>
              <DialogTitle>Temporary replacement</DialogTitle>
              <DialogDescription>{item.id} · {item.customer} · give a temporary product while the warranty case is open.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[12px] font-medium text-ink">
                Replacement product
                <FormSelect className="mt-1" value={product} onChange={(event) => setProduct(event.target.value)} options={products.filter((p) => p.active).map((p) => p.name)} />
              </label>
              <label className="text-[12px] font-medium text-ink">
                Serial
                <Input className="mt-1" value={serial} onChange={(event) => setSerial(event.target.value)} placeholder="Optional serial" />
              </label>
            </div>
            <div className="rounded-lg bg-warning-bg p-3 text-xs text-warning">
              This product remains company stock on loan. It must be returned before the warranty case is closed.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => { onSave(item, product, serial); onClose(); }}>Issue replacement</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function Warranty() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intakeInvoice = searchParams.get('invoice') ?? undefined;
  const intakeOpened = useRef(false);
  const [tab, setTab] = useState<Tab>('cases');
  const [cases, setCases] = useState<WarrantyCase[]>(seedCases);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All status');
  const [route, setRoute] = useState('All routes');
  const [detail, setDetail] = useState<WarrantyCase | null>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [replacementTarget, setReplacementTarget] = useState<WarrantyCase | null>(null);
  const [sendTarget, setSendTarget] = useState<WarrantyCase | null>(null);
  const [receiveTarget, setReceiveTarget] = useState<WarrantyCase | null>(null);

  useEffect(() => {
    if (!intakeInvoice || intakeOpened.current) return;
    intakeOpened.current = true;
    setIntakeOpen(true);
  }, [intakeInvoice]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((item) => {
      const inTab = tab === 'cases'
        ? openStatuses.includes(item.status)
        : tab === 'supplier'
          ? supplierStatuses.includes(item.status)
          : item.status === 'Resolved' || item.status === 'Rejected';
      if (!inTab) return false;
      if (status !== 'All status' && item.status !== status) return false;
      if (route !== 'All routes' && item.route !== route) return false;
      if (!q) return true;
      return [item.id, item.customer, item.phone ?? '', item.invoice, item.product, item.serial ?? '', item.supplier ?? '', item.supplierRef ?? '', item.issue]
        .some((value) => value.toLowerCase().includes(q));
    });
  }, [cases, query, route, status, tab]);

  const openCount = cases.filter((item) => openStatuses.includes(item.status)).length;
  const supplierCount = cases.filter((item) => supplierStatuses.includes(item.status)).length;
  const readyCount = cases.filter((item) => item.status === 'Ready for customer').length;
  const temporaryCount = cases.filter((item) => item.replacement && !item.replacement.returnedAt && openStatuses.includes(item.status)).length;

  const summary = [
    { label: 'Open cases', value: String(openCount), sub: 'Currently active' },
    { label: 'With supplier', value: String(supplierCount), sub: 'Supplier / manufacturer' },
    { label: 'Ready for customer', value: String(readyCount), sub: 'Awaiting pickup', tone: 'text-success' },
    { label: 'Temporary products', value: String(temporaryCount), sub: 'Still with customers', tone: 'text-warning' }
  ];

  const updateCase = (id: string, patch: Partial<WarrantyCase>, eventTitle?: string, eventNote?: string) => {
    setCases((items) => items.map((item) => {
      if (item.id !== id) return item;
      return {
        ...item,
        ...patch,
        events: eventTitle
          ? [...item.events, { id: `we-${Date.now()}`, date: '06 Oct, 09:25 PM', title: eventTitle, ...(eventNote ? { note: eventNote } : {}) }]
          : item.events
      };
    }));
    setDetail((item) => item?.id === id ? {
      ...item,
      ...patch,
      events: eventTitle
        ? [...item.events, { id: `we-${Date.now()}`, date: '06 Oct, 09:25 PM', title: eventTitle, ...(eventNote ? { note: eventNote } : {}) }]
        : item.events
    } : item);
  };

  const advance = (item: WarrantyCase) => {
    const action = nextAction(item);
    if (!action) return;

    if (item.status === 'Checking' && item.route !== 'In-house') {
      setDetail(null);
      setSendTarget(item);
      return;
    }

    if (item.status === 'Waiting supplier') {
      setDetail(null);
      setReceiveTarget(item);
      return;
    }

    if (action.next === 'Resolved' && item.replacement && !item.replacement.returnedAt) {
      toast.error('Collect the temporary replacement before closing this warranty');
      return;
    }

    let patch: Partial<WarrantyCase> = { status: action.next };
    if (item.status === 'Checking' && item.route === 'In-house' && !item.resolution) {
      patch = { ...patch, resolution: 'Repair' };
    }
    updateCase(item.id, patch, action.label);
    toast.success(`${item.id} · ${action.next}`);
  };

  const sendExternal = (item: WarrantyCase, supplier: string, supplierRef: string, expectedDate: string) => {
    updateCase(item.id, {
      status: 'Sent to supplier',
      supplier,
      ...(supplierRef.trim() ? { supplierRef: supplierRef.trim() } : {}),
      ...(expectedDate.trim() ? { expectedDate: expectedDate.trim() } : {})
    }, item.route === 'Manufacturer' ? 'Sent to manufacturer' : 'Sent to supplier', `${supplier}${supplierRef.trim() ? ` · ${supplierRef.trim()}` : ''}`);
    toast.success(`${item.id} sent`, { description: supplier });
  };

  const receiveExternal = (
    item: WarrantyCase,
    resolution: 'Repair' | 'Replace' | 'Rejected',
    replacementSerial: string,
    note: string
  ) => {
    if (resolution === 'Rejected') {
      if (item.replacement && !item.replacement.returnedAt) {
        toast.error('Collect the temporary replacement before rejecting this warranty');
        return;
      }
      updateCase(item.id, {
        status: 'Rejected',
        resolution: 'Rejected'
      }, item.route === 'Manufacturer' ? 'Received rejected from manufacturer' : 'Received rejected from supplier', note || undefined);
      toast.error(`${item.id} rejected by ${item.route.toLowerCase()}`);
      return;
    }

    updateCase(item.id, {
      status: 'Received from supplier',
      resolution,
      ...(resolution === 'Replace' ? {
        finalReplacement: {
          product: item.product,
          ...(replacementSerial.trim() ? { serial: replacementSerial.trim() } : {})
        }
      } : {})
    }, item.route === 'Manufacturer' ? 'Received from manufacturer' : 'Received from supplier', note || (resolution === 'Replace' ? 'Replacement product received.' : 'Repaired product received.'));
    toast.success(`${item.id} received back`, { description: resolution });
  };

  const reject = (item: WarrantyCase) => {
    if (item.replacement && !item.replacement.returnedAt) {
      toast.error('Collect the temporary replacement before rejecting this warranty');
      return;
    }
    updateCase(item.id, { status: 'Rejected', resolution: 'Rejected' }, 'Warranty rejected');
    toast.error(`${item.id} rejected`);
  };

  const issueReplacement = (item: WarrantyCase, product: string, serial: string) => {
    updateCase(item.id, {
      replacement: {
        product,
        ...(serial.trim() ? { serial: serial.trim() } : {}),
        givenAt: '06 Oct 2026'
      }
    }, 'Temporary replacement given', `${product}${serial.trim() ? ` · ${serial.trim()}` : ''}`);
    toast.success('Temporary replacement issued');
  };

  const returnTemporary = (item: WarrantyCase) => {
    if (!item.replacement) return;
    updateCase(item.id, {
      replacement: { ...item.replacement, returnedAt: '06 Oct 2026' }
    }, 'Temporary replacement returned');
    toast.success('Temporary product returned');
  };

  const tabs: Array<[Tab, string, string]> = [
    ['cases', 'Open cases', 'Active warranty cases'],
    ['supplier', 'Supplier queue', 'Cases sent outside the shop'],
    ['history', 'History', 'Resolved and rejected cases']
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Warranty"
        titleBn="ওয়ারেন্টি"
        description="Receive warranty products, track supplier/manufacturer handoffs, temporary replacements and customer delivery."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast('Warranty list exported')}>
              <ArrowDownToLine className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setIntakeOpen(true)}>
              <Plus className="size-4" /> Receive warranty
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
              onClick={() => setTab(id)}
              title={helper}
              className={`flex shrink-0 items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-medium ${tab === id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'}`}>
              {label}
              <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">
                {id === 'cases' ? openCount : id === 'supplier' ? supplierCount : cases.length - openCount}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-b border-border p-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-lg">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-8"
              placeholder="Search case, invoice, customer, serial or supplier"
              aria-label="Search warranty cases"
            />
          </div>
          <FormSelect
            className="w-full lg:w-44"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={['All status', ...Object.keys(statusLabels)]}
          />
          <FormSelect
            className="w-full lg:w-40"
            value={route}
            onChange={(event) => setRoute(event.target.value)}
            options={['All routes', 'In-house', 'Supplier', 'Manufacturer']}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 pl-4 text-xs">Case</TableHead>
              <TableHead className="h-9 text-xs">Customer</TableHead>
              <TableHead className="h-9 text-xs">Product</TableHead>
              <TableHead className="h-9 text-xs">Supplier / route</TableHead>
              <TableHead className="h-9 text-xs">Expected</TableHead>
              <TableHead className="h-9 text-xs">Temporary</TableHead>
              <TableHead className="h-9 text-xs">Status</TableHead>
              <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id} className="cursor-pointer text-[13px]" onClick={() => setDetail(item)}>
                <TableCell className="py-2 pl-4">
                  <p className="font-medium text-ink">{item.id}</p>
                  <p className="text-[11px] text-ink-400">{item.receivedAt}</p>
                </TableCell>
                <TableCell className="py-2">
                  {item.customerId ? (
                    <button
                      onClick={(event) => { event.stopPropagation(); navigate(`/app/parties?id=${item.customerId}`); }}
                      className="font-medium text-teal-700 hover:underline">
                      {item.customer}
                    </button>
                  ) : <p className="font-medium text-ink">{item.customer}</p>}
                  <p className="text-[11px] text-ink-400">{item.phone ?? item.invoice}</p>
                </TableCell>
                <TableCell className="max-w-[280px] py-2">
                  <p className="truncate font-medium text-ink">{item.product}</p>
                  <p className="truncate text-[11px] text-ink-400">{item.serial ? `SN ${item.serial} · ` : ''}{item.issue}</p>
                </TableCell>
                <TableCell className="py-2">
                  <p className="text-ink-600">{item.supplier ?? item.route}</p>
                  <p className="text-[11px] text-ink-400">{item.supplierRef ?? item.route}</p>
                </TableCell>
                <TableCell className="py-2 text-ink-600">{item.expectedDate ?? '—'}</TableCell>
                <TableCell className="py-2">
                  {item.replacement ? (
                    <div>
                      <StatusBadge tone={item.replacement.returnedAt ? 'neutral' : 'warning'}>
                        {item.replacement.returnedAt ? 'Returned' : 'On loan'}
                      </StatusBadge>
                      {!item.replacement.returnedAt && (
                        <button onClick={(event) => { event.stopPropagation(); returnTemporary(item); }} className="mt-1 block text-[10.5px] font-medium text-teal-700 hover:underline">
                          Mark returned
                        </button>
                      )}
                    </div>
                  ) : <span className="text-helper">—</span>}
                </TableCell>
                <TableCell className="py-2"><WarrantyBadge status={item.status} /></TableCell>
                <TableCell className="py-2 pr-4 text-right">
                  <WarrantyActions
                    item={item}
                    onView={() => setDetail(item)}
                    onAdvance={advance}
                    onReject={reject}
                    onTemporaryReplacement={setReplacementTarget}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <ShieldCheck className="mx-auto size-8 text-helper" />
            <p className="mt-2 font-medium text-ink">No warranty cases match</p>
            <p className="mt-1 text-sm text-ink-500">Try another search, status or route.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => { setQuery(''); setStatus('All status'); setRoute('All routes'); }}>
              Clear filters
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-ink-500">
          <span>Showing {filtered.length} warranty cases</span>
          <span>Invoice and serial verification stay linked to every case</span>
        </div>
      </div>

      <WarrantyDetailDialog
        item={detail}
        onClose={() => setDetail(null)}
        onAdvance={advance}
        onTemporaryReplacement={(item) => { setDetail(null); setReplacementTarget(item); }}
        onReject={reject}
      />

      <IntakeDialog
        open={intakeOpen}
        initialInvoice={intakeInvoice}
        onOpenChange={(open) => {
          setIntakeOpen(open);
          if (!open && intakeInvoice) navigate('/app/warranty', { replace: true });
        }}
        onSave={(item) => {
          setCases((items) => [item, ...items]);
          setTab('cases');
          toast.success(`${item.id} received`, { description: `${item.customer} · ${item.product}` });
        }}
      />

      <SendExternalDialog
        item={sendTarget}
        onClose={() => setSendTarget(null)}
        onSave={sendExternal}
      />

      <ReceiveExternalDialog
        item={receiveTarget}
        onClose={() => setReceiveTarget(null)}
        onSave={receiveExternal}
      />

      <TemporaryReplacementDialog
        item={replacementTarget}
        onClose={() => setReplacementTarget(null)}
        onSave={issueReplacement}
      />
    </div>
  );
}

