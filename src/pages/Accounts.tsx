import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, BookOpen, FileText, Landmark, MoreHorizontal, Plus, Scale, Settings2, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { VoucherDialog } from '../components/accounts/VoucherDialog';
import { VoucherActionDialog } from '../components/accounts/VoucherActionDialog';
import { OpeningBalanceDialog } from '../components/accounts/OpeningBalanceDialog';
import { FloatingPanel } from '../components/layout/FloatingPanel';
import { LedgerView } from '../components/accounts/LedgerView';
import { TrialBalanceView } from '../components/accounts/TrialBalanceView';
import { StatementsView } from '../components/accounts/StatementsView';
import { ChartOfAccountsView } from '../components/accounts/ChartOfAccountsView';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { accountingAccounts, accountingSources as seedSources } from '../data/accounting';
import type { AccountingSourceTransaction, Posting, VoucherType } from '../types/accounting';
import { accountingAccountLabel } from '../utils/accountingLabels';
import { balanceSheet, postingForTransaction, profitAndLoss, trialBalance } from '../utils/accountingProjection';
import { taka } from '../utils/currency';

type Tab = 'overview' | 'vouchers' | 'ledger' | 'trial' | 'statements' | 'chart';
const validTabs:Tab[] = ['overview','vouchers','ledger','trial','statements','chart'];

function sourceLabel(source: AccountingSourceTransaction['source']) {
  if (source === 'receipt-voucher') return 'Receipt Voucher';
  if (source === 'payment-voucher') return 'Payment Voucher';
  if (source === 'transfer') return 'Account Transfer';
  if (source === 'adjustment') return 'Adjustment Entry';
  if (source === 'opening-balance') return 'Opening Balance';
  if (source === 'customer-payment') return 'Customer Payment';
  if (source === 'supplier-payment') return 'Supplier Payment';
  if (source === 'sale') return 'Sale';
  if (source === 'purchase') return 'Purchase';
  if (source === 'expense') return 'Expense';
  if (source === 'finance') return 'Finance';
  return source;
}

function sourceHelper(source: AccountingSourceTransaction['source']) {
  if (source === 'receipt-voucher') return 'টাকা পেয়েছি';
  if (source === 'payment-voucher') return 'টাকা দিয়েছি';
  if (source === 'transfer') return 'নিজের অ্যাকাউন্টে টাকা সরানো';
  if (source === 'adjustment') return 'হিসাব ঠিক করার এন্ট্রি';
  if (source === 'opening-balance') return 'শুরুর হিসাব';
  if (source === 'customer-payment') return 'গ্রাহকের টাকা পেয়েছি';
  if (source === 'supplier-payment') return 'সাপ্লায়ারকে টাকা দিয়েছি';
  if (source === 'sale') return 'বিক্রির হিসাব';
  if (source === 'purchase') return 'ক্রয়ের হিসাব';
  if (source === 'expense') return 'খরচের হিসাব';
  if (source === 'finance') return 'টাকা-পয়সার হিসাব';
  return '';
}

function rowBalance(postings: Posting[], accountId: string) {
  const account = accountingAccounts.find((item) => item.id === accountId);
  if (!account) return 0;
  let debit = 0;
  let credit = 0;
  for (const posting of postings) {
    if (posting.status !== 'Posted') continue;
    for (const line of posting.lines) {
      if (line.accountId !== accountId) continue;
      debit += line.debit;
      credit += line.credit;
    }
  }
  return account.group === 'Asset' || account.group === 'Expense' ? debit - credit : credit - debit;
}

export function Accounts() {
  const navigate = useNavigate();
  const { terminologyMode, setTerminologyMode, entryDateView } = useUserPreferences();
  const [params,setParams] = useSearchParams();
  const requestedTab = params.get('tab');
  const [tab, setTab] = useState<Tab>(() => validTabs.includes(requestedTab as Tab) ? requestedTab as Tab : 'overview');
  useEffect(() => { setTab(validTabs.includes(requestedTab as Tab) ? requestedTab as Tab : 'overview'); }, [requestedTab]);
  const chooseTab = (nextTab: Tab) => { setTab(nextTab); setParams(current => { const next = new URLSearchParams(current); if (nextTab === 'overview') next.delete('tab'); else next.set('tab',nextTab); return next; }, {replace:true}); };
  const [sources, setSources] = useState<AccountingSourceTransaction[]>(seedSources);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [voucherType, setVoucherType] = useState<VoucherType>('receipt');
  const [openingOpen, setOpeningOpen] = useState(false);
  const [entryActionId, setEntryActionId] = useState<string | null>(null);

  const postings = useMemo(() => sources.map(postingForTransaction), [sources]);
  const pnl = useMemo(() => profitAndLoss(postings, { from: '2026-09-01', to: '2026-10-31' }), [postings]);
  const sheet = useMemo(() => balanceSheet(postings, '2026-10-31'), [postings]);
  const trial = useMemo(() => trialBalance(postings), [postings]);
  const customerDue = rowBalance(postings, 'asset-ar');
  const supplierDue = rowBalance(postings, 'liability-ap');
  const entryAction = entryActionId ? sources.find((item) => item.id === entryActionId) ?? null : null;
  const entryPosting = entryAction ? postings.find((item) => item.sourceId === entryAction.id) : undefined;

  const openVoucher = (type: VoucherType = 'receipt') => {
    setVoucherType(type);
    setVoucherOpen(true);
  };

  const exportAccounts = () => {
    const header = 'Date,Type,Reference,Description,Posted by,Amount,Status';
    const rows = sources.map((source) => [source.transactionDate, sourceLabel(source.source), source.reference, source.description ?? '', source.postedBy, source.amount, source.recordStatus ?? 'Posted']
      .map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','));
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'hisabiq-accounts.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Accounts export ready');
  };

  const goToAccountingSource = (source: AccountingSourceTransaction) => {
    const route = source.source === 'sale' || source.source === 'customer-payment' ? '/app/sales'
      : source.source === 'purchase' || source.source === 'supplier-payment' ? '/app/purchases'
      : source.source === 'expense' ? '/app/expenses'
      : source.source === 'finance' || source.source === 'transfer' ? '/app/finance'
      : '/app/audit-ledger';
    navigate(`${route}?open=${encodeURIComponent(source.id)}`);
  };

  const tabs: Array<[Tab, string, string]> = [
    ['overview', 'Overview', 'হিসাবের সারাংশ'],
    ['vouchers', 'Vouchers', 'টাকা পাওয়া, দেওয়া ও হিসাব ঠিক করার এন্ট্রি'],
    ['ledger', 'Ledger', 'এই হিসাবের সব লেনদেন'],
    ['trial', 'Trial Balance', 'সব হিসাব ঠিকমতো মিলছে কি না'],
    ['statements', 'Statements', 'লাভ-ক্ষতি ও Balance Sheet'],
    ['chart', 'Chart of Accounts', 'ব্যবসার সব হিসাবের খাত']
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Accounts"
        titleBn="হিসাব"
        description="Bookkeeping, vouchers, ledgers and financial statements — separate from daily money movement."
        actions={
          <>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1" aria-label="Terminology preference">
              <button
                onClick={() => setTerminologyMode('simple')}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${terminologyMode === 'simple' ? 'bg-inverse text-white' : 'text-ink-500 hover:bg-ink-50'}`}>
                Simple
              </button>
              <button
                onClick={() => setTerminologyMode('accounting')}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${terminologyMode === 'accounting' ? 'bg-inverse text-white' : 'text-ink-500 hover:bg-ink-50'}`}>
                Accounting
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setOpeningOpen(true)}>
              <Plus className="size-4" /> Opening balance
            </Button>
            <Button variant="outline" size="sm" onClick={exportAccounts}>
              <ArrowDownToLine className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={() => openVoucher('receipt')}>
              <Plus className="size-4" /> New voucher
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Net Profit', helper: 'সব খরচের পর লাভ', value: pnl.netProfit, icon: WalletCards, tone: pnl.netProfit < 0 ? 'text-danger' : 'text-success' },
          { label: terminologyMode === 'simple' ? 'Customer Due' : 'Accounts Receivable', helper: 'গ্রাহকের কাছ থেকে পাবো', value: customerDue, icon: BookOpen, tone: 'text-teal-700' },
          { label: terminologyMode === 'simple' ? 'Supplier Due' : 'Accounts Payable', helper: 'সাপ্লায়ারকে দিতে হবে', value: supplierDue, icon: FileText, tone: 'text-danger' },
          { label: 'Assets', helper: 'ব্যবসার মোট সম্পদ', value: sheet.assets, icon: Landmark, tone: 'text-ink' },
          { label: 'Liabilities', helper: 'ব্যবসার মোট দেনা', value: sheet.liabilities, icon: Scale, tone: 'text-ink' }
        ].map(({ label, helper, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12.5px] text-ink-500">{label}</p>
              <Icon className="size-4 text-helper" />
            </div>
            <p className={`mt-0.5 text-lg font-semibold ${tone}`}>{value < 0 ? '−' : ''}{taka(Math.abs(value))}</p>
            <p className="font-bn text-[10.5px] text-ink-400">{helper}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-border px-3 scrollbar-thin" role="tablist">
          {tabs.map(([id, label, helper]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => chooseTab(id)}
              className={`flex shrink-0 items-baseline gap-1.5 px-2.5 py-2.5 text-[13px] font-medium ${tab === id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'}`}>
              {label}
              <span className="font-bn text-[10.5px] font-normal text-ink-400">{helper}</span>
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid gap-4 p-4 xl:grid-cols-[1.2fr_1fr]">
            <section className="rounded-xl border border-border">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Recent accounting entries</p>
                  <p className="font-bn text-[11px] text-ink-400">Sales, Purchase, Expense ও Finance থেকে নিজে থেকেই হিসাব তৈরি হয়</p>
                </div>
                <button onClick={() => chooseTab('vouchers')} className="text-xs font-medium text-teal-700 hover:underline">View all</button>
              </div>
              <div className="divide-y divide-border">
                {sources.slice().reverse().slice(0, 6).map((source) => (
                  <div key={source.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-ink">{sourceLabel(source.source)} · {source.reference}</p>
                      <p className="truncate text-[10.5px] text-ink-400">{source.transactionDate} · {source.description || sourceHelper(source.source)} · {source.postedBy}</p>
                    </div>
                    <span className="text-[12.5px] font-semibold text-ink">{taka(source.amount)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold text-ink">Books status</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2"><span className="text-[12px] text-ink-600">Trial Balance</span><StatusBadge tone={Math.abs(trial.totalDebit - trial.totalCredit) < 0.01 ? 'success' : 'danger'} dot>{Math.abs(trial.totalDebit - trial.totalCredit) < 0.01 ? 'Balanced' : 'Needs review'}</StatusBadge></div>
                  <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2"><span className="text-[12px] text-ink-600">Balance Sheet</span><StatusBadge tone={sheet.balanced ? 'success' : 'danger'} dot>{sheet.balanced ? 'Balanced' : 'Needs review'}</StatusBadge></div>
                  <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2"><span className="text-[12px] text-ink-600">Ledger date view</span><span className="text-[11px] font-medium text-ink">{entryDateView === 'transaction' ? 'Transaction Date' : 'Created Date'}</span></div>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="size-4 text-teal-700" />
                  <p className="text-sm font-semibold text-ink">Quick accounting</p>
                </div>
                <p className="mt-1 font-bn text-[11px] text-ink-400">সাধারণ কাজ সহজ রাখুন, হিসাব নিজে থেকেই দুই পাশে মিলবে</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {([['Receipt Voucher', 'receipt'], ['Payment Voucher', 'payment'], ['Account Transfer', 'transfer'], ['Adjustment Entry', 'adjustment']] as Array<[string, VoucherType]>).map(([label, type]) => (
                    <button key={label} onClick={() => openVoucher(type)} className="rounded-lg border border-border p-3 text-left text-[12px] font-medium text-ink hover:bg-ink-50">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'vouchers' && (
          <div>
            <div className="flex items-center justify-between border-b border-border p-3">
              <div>
                <p className="text-[13px] font-medium text-ink">Vouchers & postings</p>
                <p className="font-bn text-[11px] text-ink-400">কোথা থেকে হিসাব এসেছে এবং কে এন্ট্রি করেছেন</p>
              </div>
              <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setOpeningOpen(true)}>Opening balance</Button><Button size="sm" onClick={() => openVoucher('receipt')}><Plus className="size-4" /> New voucher</Button></div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 pl-4 text-xs">Date</TableHead>
                    <TableHead className="h-9 text-xs">Type</TableHead>
                    <TableHead className="h-9 text-xs">Reference</TableHead>
                    <TableHead className="h-9 text-xs">Description</TableHead>
                    <TableHead className="h-9 text-xs">Posted by</TableHead>
                    <TableHead className="h-9 text-right text-xs">Amount</TableHead>
                    <TableHead className="h-9 text-xs">Status</TableHead>
                    <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.slice().reverse().map((source) => (
                    <TableRow key={source.id} className="text-[13px]">
                      <TableCell className="py-2 pl-4">{source.transactionDate}</TableCell>
                      <TableCell className="py-2"><p className="font-medium text-ink">{sourceLabel(source.source)}</p><p className="font-bn text-[10.5px] text-ink-400">{sourceHelper(source.source)}</p></TableCell>
                      <TableCell className="py-2 font-medium text-teal-700">{source.reference}</TableCell>
                      <TableCell className="max-w-[360px] py-2"><p className="truncate text-ink-600">{source.description || '—'}</p></TableCell>
                      <TableCell className="py-2 text-ink-600">{source.postedBy}</TableCell>
                      <TableCell className="py-2 text-right font-semibold">{taka(source.amount)}</TableCell>
                      <TableCell className="py-2"><StatusBadge tone={source.recordStatus === 'Deleted' ? 'neutral' : 'success'} dot>{source.recordStatus ?? 'Posted'}</StatusBadge></TableCell>
                      <TableCell className="py-2 pr-4 text-right">
                        <FloatingPanel
                          label={`Actions for ${source.reference}`}
                          width={180}
                          trigger={({ toggle }) => <button onClick={toggle} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink" aria-label={`Actions for ${source.reference}`}><MoreHorizontal className="size-4" /></button>}>
                          {(close) => <div className="py-1"><button className="flex w-full items-center px-3 py-2 text-left text-[12.5px] text-ink-700 hover:bg-ink-50" onClick={() => { close(); setEntryActionId(source.id); }}>Open details</button></div>}
                        </FloatingPanel>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {tab === 'ledger' && <LedgerView postings={postings} dateView={entryDateView} terminologyMode={terminologyMode} />}
        {tab === 'trial' && <TrialBalanceView postings={postings} terminologyMode={terminologyMode} />}
        {tab === 'statements' && <StatementsView postings={postings} />}
        {tab === 'chart' && <ChartOfAccountsView terminologyMode={terminologyMode} onOpeningBalance={() => setOpeningOpen(true)} />}
      </div>

      <VoucherActionDialog
        source={entryAction}
        posting={entryPosting}
        onClose={() => setEntryActionId(null)}
        onUpdate={(updated) => {
          setSources((current) => current.map((item) => item.id === updated.id ? updated : item));
          toast.success('Voucher corrected', { description: updated.reference });
        }}
        onDelete={(source, reason) => {
          setSources((current) => current.map((item) => item.id === source.id ? { ...item, recordStatus: 'Deleted', deletedAt: '2026-10-07T16:25:00+06:00', deletedBy: 'Shuvo', deleteReason: reason } : item));
          toast.success('Voucher deleted safely', { description: source.reference + ' remains in history' });
        }}
        onDuplicate={(source) => {
          const copy = { ...source, id: 'copy-' + Date.now(), reference: source.reference + '-COPY', createdAt: '2026-10-07T16:25:00+06:00', postedBy: 'Shuvo', recordStatus: 'Posted' as const, updatedAt: undefined, updatedBy: undefined, deletedAt: undefined, deletedBy: undefined, deleteReason: undefined };
          setSources((current) => [...current, copy]);
          toast.success('Voucher duplicated', { description: copy.reference });
        }}
        onGoToSource={goToAccountingSource}
      />

      <OpeningBalanceDialog
        open={openingOpen}
        onOpenChange={setOpeningOpen}
        onSave={(source) => {
          setSources((current) => [...current, source]);
          toast.success('Opening balance posted', { description: source.reference + ' · ' + taka(source.amount) });
        }}
      />

      <VoucherDialog
        open={voucherOpen}
        initialType={voucherType}
        onOpenChange={setVoucherOpen}
        onSave={(source) => {
          setSources((current) => [...current, source]);
          toast.success('Voucher posted', { description: `${sourceLabel(source.source)} · ${taka(source.amount)}` });
        }}
      />
    </div>
  );
}

