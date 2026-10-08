import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDownToLine,
  CornerUpLeft,
  FileText,
  MoreHorizontal,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Undo2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { FormSelect } from '../components/FormSelect';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { BillDetailDialog, type BillDetail } from '../components/purchases/BillDetailDialog';
import { availablePurchases } from '../data/erpDemoStore';
import type { Purchase } from '../types/erp';
import { taka } from '../utils/currency';

type Tab = 'purchases' | 'return' | 'return-history';

const returnHistory = [
  { id: 'PR-000028', date: '29 Sep 2026', purchase: 'PUR-000117', supplier: 'Bismillah Steel House', items: 'MS Angle 1.5" · 45 Kg', amount: 4410, method: 'Supplier credit' },
  { id: 'PR-000027', date: '24 Sep 2026', purchase: 'PUR-000115', supplier: 'Hossain Electric', items: 'Ceiling Fan Regulator · 2 Pcs', amount: 510, method: 'Cash refund' },
  { id: 'PR-000026', date: '18 Sep 2026', purchase: 'PUR-000114', supplier: 'Bismillah Steel House', items: 'GI Wire 14 SWG · 12 Kg', amount: 1512, method: 'Supplier credit' }
];

function PayStatus({ total, paid }: { total: number; paid: number }) {
  if (paid >= total) return <StatusBadge tone="success" dot>Paid</StatusBadge>;
  if (paid > 0) return <StatusBadge tone="warning" dot>Partial</StatusBadge>;
  return <StatusBadge tone="danger" dot>Due</StatusBadge>;
}

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

export function Purchases() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('purchases');
  const [purchases] = useState<Purchase[]>(availablePurchases);
  const [detail, setDetail] = useState<BillDetail | null>(null);
  const [query, setQuery] = useState('');
  const [returnQuery, setReturnQuery] = useState('');
  const [returnPurchase, setReturnPurchase] = useState<Purchase | null>(null);
  const [refundMethod, setRefundMethod] = useState('Adjust supplier due');

  const filteredPurchases = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter((p) =>
      [p.ref, p.supplier, p.items, p.date].some((value) => value.toLowerCase().includes(q))
    );
  }, [purchases, query]);

  const purchaseTotal = purchases.reduce((sum, p) => sum + p.total, 0);
  const paidTotal = purchases.reduce((sum, p) => sum + p.paid, 0);
  const supplierDue = purchaseTotal - paidTotal;
  const returnsTotal = returnHistory.reduce((sum, item) => sum + item.amount, 0);

  const summary = [
    { label: 'Purchases · Sep', value: taka(purchaseTotal), sub: `${purchases.length} purchase invoices` },
    { label: 'Due to suppliers', value: taka(supplierDue), sub: 'Supplier payable · দেনা', tone: 'text-danger' },
    { label: 'Paid · Sep', value: taka(paidTotal), sub: 'Cash, bank & mobile' },
    { label: 'Purchase returns', value: taka(returnsTotal), sub: `${returnHistory.length} return memos`, tone: 'text-warning' }
  ];

  const selectReturnPurchase = () => {
    const q = returnQuery.trim().toLowerCase();
    const match = purchases.find((p) =>
      !q || p.ref.toLowerCase().includes(q) || p.supplier.toLowerCase().includes(q)
    );
    if (!match) {
      toast.error('No purchase found');
      return;
    }
    setReturnPurchase(match);
  };

  const tabs: Array<[Tab, string, string]> = [
    ['purchases', 'Purchases', 'Purchase list & management'],
    ['return', 'Purchase return', 'Find purchase & return items'],
    ['return-history', 'Return history', 'Completed purchase returns']
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Purchases"
        titleBn="ক্রয়"
        description="Purchase stock, manage supplier bills, update purchases and handle purchase returns."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/app/parties')}>
              <FileText className="size-4" /> Supplier ledger
            </Button>
            <Button size="sm" onClick={() => navigate('/app/purchases/new')}>
              <Plus className="size-4" /> New purchase
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
              {id === 'purchases' && (
                <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{purchases.length}</span>
              )}
              {id === 'return-history' && (
                <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{returnHistory.length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'purchases' && (
          <>
            <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                  placeholder="Search purchase ID, supplier or product"
                />
              </div>
              <FormSelect className="w-full sm:w-40" options={['All suppliers', ...Array.from(new Set(purchases.map((purchase) => purchase.supplier)))]} />
              <FormSelect className="w-full sm:w-36" options={['All status', 'Paid', 'Partial', 'Due']} />
              <Button variant="outline" size="sm" onClick={() => toast('Purchase list refreshed')}>
                <RefreshCw className="size-4" /> Refresh
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Purchase</TableHead>
                  <TableHead className="h-9 text-xs">Supplier</TableHead>
                  <TableHead className="h-9 text-xs">Items</TableHead>
                  <TableHead className="h-9 text-xs">Memo</TableHead>
                  <TableHead className="h-9 text-right text-xs">Total</TableHead>
                  <TableHead className="h-9 text-right text-xs">Paid</TableHead>
                  <TableHead className="h-9 text-right text-xs">Due</TableHead>
                  <TableHead className="h-9 text-xs">Status</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((p) => {
                  const open = () =>
                    setDetail({
                      ref: p.ref,
                      date: p.date,
                      party: p.supplier,
                      partyId: p.supplierId,
                      description: p.items,
                      total: p.total,
                      paid: p.paid,
                      payments: p.payments,
                      receipt: p.receipt
                    });
                  return (
                    <TableRow key={p.id} className="cursor-pointer text-[13px]" onClick={open}>
                      <TableCell className="py-2 pl-4">
                        <span className="font-medium text-ink">{p.ref}</span>
                        <span className="block text-[11px] text-ink-400">{p.date}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link
                          to={`/app/parties?id=${p.supplierId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-teal-700 hover:underline">
                          {p.supplier}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate py-2 text-ink-600">{p.items}</TableCell>
                      <TableCell className="py-2"><ReceiptThumb src={p.receipt} onClick={open} /></TableCell>
                      <TableCell className="py-2 text-right font-medium">{taka(p.total)}</TableCell>
                      <TableCell className="py-2 text-right text-ink-600">{taka(p.paid)}</TableCell>
                      <TableCell className={`py-2 text-right ${p.total - p.paid > 0 ? 'font-medium text-danger' : 'text-ink-400'}`}>
                        {p.total - p.paid > 0 ? taka(p.total - p.paid) : '—'}
                      </TableCell>
                      <TableCell className="py-2"><PayStatus total={p.total} paid={p.paid} /></TableCell>
                      <TableCell className="py-2 pr-4 text-right">
                        <button
                          className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast('Purchase actions', { description: 'View · Edit · Return · Print · Delete' });
                          }}
                          aria-label={`Actions for ${p.ref}`}>
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

        {tab === 'return' && (
          <div className="p-4">
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <div className="rounded-xl border border-border bg-ink-50/50 p-4">
                <div className="mb-3 flex items-start gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Search className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Find original purchase</h3>
                    <p className="text-xs text-ink-500">Search by Purchase ID or supplier name.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    value={returnQuery}
                    onChange={(e) => setReturnQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && selectReturnPurchase()}
                    placeholder="PUR-000117 or supplier name"
                  />
                  <Button className="w-full" onClick={selectReturnPurchase}>
                    <Search className="size-4" /> Find purchase
                  </Button>
                </div>
                <div className="mt-4 border-t border-border pt-3 text-xs text-ink-500">
                  Return workflow keeps the original purchase price and unit conversion, then posts the refund to cash or supplier credit.
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card">
                {!returnPurchase ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                    <Undo2 className="mb-3 size-8 text-helper" />
                    <p className="text-sm font-medium text-ink">No purchase selected</p>
                    <p className="mt-1 max-w-md text-xs text-ink-500">
                      Find a purchase first. HisabIQ will load the original items, historical units and quantities available to return.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">{returnPurchase.ref}</p>
                        <p className="text-xs text-ink-500">{returnPurchase.supplier} · {returnPurchase.date}</p>
                      </div>
                      <StatusBadge tone="teal">Original purchase loaded</StatusBadge>
                    </div>
                    <div className="p-4">
                      <div className="rounded-lg border border-border">
                        <div className="grid grid-cols-[1fr_100px_120px] gap-2 border-b border-border bg-ink-50/50 px-3 py-2 text-xs font-medium text-ink-500">
                          <span>Item</span>
                          <span>Return qty</span>
                          <span className="text-right">Refund</span>
                        </div>
                        <div className="grid grid-cols-[1fr_100px_120px] items-center gap-2 px-3 py-3 text-[13px]">
                          <div>
                            <p className="font-medium text-ink">{returnPurchase.items.split(',')[0]}</p>
                            <p className="text-[11px] text-ink-400">Historical unit conversion preserved</p>
                          </div>
                          <Input defaultValue="1" inputMode="decimal" />
                          <p className="text-right font-medium">{taka(Math.round(returnPurchase.total * 0.1))}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="text-[13px] font-medium text-ink">
                          Refund method
                          <FormSelect
                            className="mt-1.5"
                            value={refundMethod}
                            onChange={(e) => setRefundMethod(e.target.value)}
                            options={['Adjust supplier due', 'Cash refund']}
                          />
                        </label>
                        <label className="text-[13px] font-medium text-ink">
                          Return date
                          <Input className="mt-1.5" defaultValue="06 Oct 2026" />
                        </label>
                        <label className="text-[13px] font-medium text-ink sm:col-span-2">
                          Return reason
                          <Input className="mt-1.5" placeholder="Damaged, wrong item, excess quantity…" />
                        </label>
                      </div>

                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setReturnPurchase(null)}>Cancel</Button>
                        <Button onClick={() => toast.success('Purchase return prepared', { description: `Refund via ${refundMethod}` })}>
                          <CornerUpLeft className="size-4" /> Complete return
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'return-history' && (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-border p-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Purchase return history</p>
                <p className="text-[11px] text-ink-500">Completed returns, refund method and source purchase.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast('Return history exported')}>
                <ArrowDownToLine className="size-4" /> Export
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Return</TableHead>
                  <TableHead className="h-9 text-xs">Purchase</TableHead>
                  <TableHead className="h-9 text-xs">Supplier</TableHead>
                  <TableHead className="h-9 text-xs">Returned items</TableHead>
                  <TableHead className="h-9 text-xs">Refund method</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnHistory.map((item) => (
                  <TableRow key={item.id} className="text-[13px]">
                    <TableCell className="py-2 pl-4">
                      <span className="font-medium text-ink">{item.id}</span>
                      <span className="block text-[11px] text-ink-400">{item.date}</span>
                    </TableCell>
                    <TableCell className="py-2 text-teal-700">{item.purchase}</TableCell>
                    <TableCell className="py-2">{item.supplier}</TableCell>
                    <TableCell className="max-w-[280px] truncate py-2 text-ink-600">{item.items}</TableCell>
                    <TableCell className="py-2">
                      <StatusBadge tone={item.method === 'Cash refund' ? 'success' : 'neutral'}>{item.method}</StatusBadge>
                    </TableCell>
                    <TableCell className="py-2 pr-4 text-right font-medium">{taka(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      <BillDetailDialog bill={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

