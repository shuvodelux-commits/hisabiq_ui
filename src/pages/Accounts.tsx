import {useTenantSettings} from '../settings/TenantSettingsProvider';
import {sourceDeleteAuthority} from '../deletion/authority';
import {SourceDeleteAction} from '../deletion/SourceDeleteAction';
import {isManualAccountingSource} from '../utils/moduleUiActions';
import { MotionTabList, MotionTabIndicator } from '../motion/MotionTabList';
import '../utils/accountingLabels'; // Keep existing module initialization.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, BookOpen, FileText, Landmark, Plus, Scale, Settings2, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import {useUiCopy} from '../i18n/useUiCopy';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { VoucherDialog } from '../components/accounts/VoucherDialog';
import { VoucherActionDialog } from '../components/accounts/VoucherActionDialog';
import { OpeningBalanceDialog } from '../components/accounts/OpeningBalanceDialog';
import { FloatingPanel } from '../components/layout/FloatingPanel';
import { ActionMenuList, ActionMenuItem, ActionMenuTrigger } from '../components/layout/ActionMenu';
import { Eye } from 'lucide-react';
import { LedgerView } from '../components/accounts/LedgerView';
import { TrialBalanceView } from '../components/accounts/TrialBalanceView';
import { StatementsView } from '../components/accounts/StatementsView';
import { ChartOfAccountsView } from '../components/accounts/ChartOfAccountsView';
import { BankEntryTab } from '../components/accounts/BankEntryTab';
import { Finance } from './Finance';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { accountingAccounts, accountingSources as seedSources } from '../data/accounting';
import type { AccountingSourceTransaction, Posting, VoucherType } from '../types/accounting';
import { balanceSheet, postingForTransaction, profitAndLoss, trialBalance } from '../utils/accountingProjection';
import { taka } from '../utils/currency';

type Tab = 'overview' | 'money-accounts' | 'vouchers' | 'ledger' | 'trial' | 'statements' | 'chart' | 'bank-entry';
const validTabs:Tab[] = ['overview','money-accounts','vouchers','ledger','trial','statements','chart','bank-entry'];

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
  const {currentAuthority}=useTenantSettings();
  const [entryMode,setEntryMode]=useState<'view'|'delete'>('view');
  const {text}=useUiCopy();
  const navigate = useNavigate();
  const { terminologyMode, setTerminologyMode, entryDateView } = useUserPreferences();
  const [params,setParams] = useSearchParams();
  const requestedTab = params.get('tab');
  const [tab, setTab] = useState<Tab>(() => validTabs.includes(requestedTab as Tab) ? requestedTab as Tab : 'overview');
   useEffect(() => { setTab(validTabs.includes(requestedTab as Tab) ? requestedTab as Tab : 'overview'); }, [requestedTab]);
  const chooseTab = (nextTab: Tab) => { setTab(nextTab); setParams(current => { const next = new URLSearchParams(current); if (nextTab === 'overview') next.delete('tab'); else next.set('tab',nextTab); if(nextTab!=='bank-entry')next.delete('accountId'); return next; }, {replace:true}); };
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
    toast.success(text('Accounts export ready','হিসাব ডাউনলোডের জন্য প্রস্তুত'));
  };

  const goToAccountingSource = (source: AccountingSourceTransaction) => {
    const route = source.source === 'sale' || source.source === 'customer-payment' ? '/app/sales'
      : source.source === 'purchase' || source.source === 'supplier-payment' ? '/app/purchases'
      : source.source === 'expense' ? '/app/expenses'
      : source.source === 'finance' || source.source === 'transfer' ? '/app/finance'
      : '/app/audit-ledger';
    navigate(`${route}?open=${encodeURIComponent(source.id)}`);
  };

  // Compact English-only tab labels; Bangla guidance remains inside each panel.
  const tabs: Array<[Tab, string]> = [
    ['overview', 'Overview'],
    ['money-accounts', 'Money Accounts'],
    ['bank-entry', 'Bank Entry'],
    ['vouchers', 'Vouchers'],
    ['ledger', 'Ledger'],
    ['trial', 'Trial Balance'],
    ['statements', 'Statements'],
    ['chart', 'Chart of Accounts']
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-3 sm:space-y-4">
      <PageHeader
        title="Accounts"
        titleBn="হিসাব"
        description="Bookkeeping, vouchers, ledgers and financial statements — separate from daily money movement."
        descriptionBn="ভাউচার, খাতা ও আর্থিক প্রতিবেদন — দৈনিক টাকা লেনদেনের আলাদা হিসাব।"
        actions={
          <>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1" aria-label={text("Terminology preference","হিসাবের ভাষার ধরন")}>
              <button
                onClick={() => setTerminologyMode('simple')}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${terminologyMode === 'simple' ? 'bg-inverse text-white' : 'text-ink-500 hover:bg-ink-50'}`}>
                {text('Simple','সহজ')}
              </button>
              <button
                onClick={() => setTerminologyMode('accounting')}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${terminologyMode === 'accounting' ? 'bg-inverse text-white' : 'text-ink-500 hover:bg-ink-50'}`}>
                {text('Accounting','হিসাববিজ্ঞান')}
              </button>
            </div>
            <Button variant="outline" size="sm" onClick={() => setOpeningOpen(true)}>
              <Plus className="size-4" /> {text('Opening balance','শুরুর জের')}
            </Button>
            <Button variant="outline" size="sm" onClick={exportAccounts}>
              <ArrowDownToLine className="size-4" /> {text('Export','ডাউনলোড')}
            </Button>
            <Button size="sm" onClick={() => openVoucher('receipt')}>
              <Plus className="size-4" /> {text('New voucher','নতুন ভাউচার')}
            </Button>
          </>
        }
      />

      {tab === 'overview' && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { label: text('Net Profit','নিট লাভ'), helper: 'সব খরচের পর লাভ', value: pnl.netProfit, icon: WalletCards, tone: pnl.netProfit < 0 ? 'text-danger' : 'text-success' },
          { label: text(terminologyMode === 'simple' ? 'Customer Due' : 'Accounts Receivable','ক্রেতার কাছে পাওনা'), helper: 'গ্রাহকের কাছ থেকে পাবো', value: customerDue, icon: BookOpen, tone: 'text-teal-700' },
          { label: text(terminologyMode === 'simple' ? 'Supplier Due' : 'Accounts Payable','সরবরাহকারীকে দেনা'), helper: 'সাপ্লায়ারকে দিতে হবে', value: supplierDue, icon: FileText, tone: 'text-danger' },
          { label: text('Assets','সম্পদ'), helper: 'ব্যবসার মোট সম্পদ', value: sheet.assets, icon: Landmark, tone: 'text-ink' },
          { label: text('Liabilities','দেনা'), helper: 'ব্যবসার মোট দেনা', value: sheet.liabilities, icon: Scale, tone: 'text-ink' }
        ].map(({ label, helper, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12.5px] text-ink-500">{label}</p>
              <Icon className="size-4 text-helper" />
            </div>
            <p className={`mt-0.5 break-words text-base font-semibold sm:text-lg ${tone}`}>{value < 0 ? '−' : ''}{taka(Math.abs(value))}</p>
            <p className="font-bn text-[10.5px] text-ink-400">{helper}</p>
          </div>
        ))}
      </div>}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <MotionTabList className="flex flex-nowrap gap-1 overflow-x-auto border-b border-border px-3 scrollbar-thin" role="tablist" aria-label="Account sections"
          onKeyDown={(event) => {
            if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
            const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
            const index = buttons.findIndex((button) => button === document.activeElement);
            if (index < 0) return;
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
              : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
            event.preventDefault();
            buttons[next]?.focus();
            chooseTab(tabs[next][0]);
          }}>
          {tabs.map(([id, label]) => (
            <button
              key={id}
              data-accounts-tab={id}
              role="tab"
              aria-selected={tab === id}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => chooseTab(id)}
              className={`flex shrink-0 items-center rounded-sm px-2.5 py-2.5 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 ${tab === id ? 'text-ink' : 'text-ink-500 hover:text-ink'}`}>
              {label}
              <MotionTabIndicator active={tab === id} />
            </button>
          ))}
        </MotionTabList>

        {tab === 'money-accounts' && <Finance moneyAccountsOnly />}

        {tab === 'overview' && (
          <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-[1.2fr_1fr]">
            <section className="rounded-xl border border-border">
              <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{text('Recent accounting entries','সাম্প্রতিক হিসাবের এন্ট্রি')}</p>
                  <p className="font-bn text-[11px] text-ink-400">Sales, Purchase, Expense ও Finance থেকে নিজে থেকেই হিসাব তৈরি হয়</p>
                </div>
                <button onClick={() => chooseTab('vouchers')} className="text-xs font-medium text-teal-700 hover:underline">{text('View all','সব দেখুন')}</button>
              </div>
              <div className="divide-y divide-border">
                {sources.slice().reverse().slice(0, 6).map((source) => (
                  <button type="button" key={source.id} onClick={() => setEntryActionId(source.id)} aria-label={`Open details for ${source.reference}`} className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 sm:px-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                      <FileText className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium text-ink">{sourceLabel(source.source)} · {source.reference}</span>
                      <span className="block truncate text-[10.5px] text-ink-400">{source.transactionDate} · {source.description || sourceHelper(source.source)} · {source.postedBy}</span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-[12.5px] font-semibold text-ink">{taka(source.amount)}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="rounded-lg border border-border p-3 sm:p-4">
                <p className="text-sm font-semibold text-ink">{text('Books status','হিসাবের অবস্থা')}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2"><span className="text-[12px] text-ink-600">{text('Trial Balance','ট্রায়াল ব্যালেন্স')}</span><StatusBadge tone={Math.abs(trial.totalDebit - trial.totalCredit) < 0.01 ? 'success' : 'danger'} dot>{Math.abs(trial.totalDebit - trial.totalCredit) < 0.01 ? text('Balanced','হিসাব মিলেছে') : text('Needs review','মিলিয়ে দেখুন')}</StatusBadge></div>
                  <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2"><span className="text-[12px] text-ink-600">{text('Balance Sheet','ব্যালেন্স শিট')}</span><StatusBadge tone={sheet.balanced ? 'success' : 'danger'} dot>{sheet.balanced ? text('Balanced','হিসাব মিলেছে') : text('Needs review','মিলিয়ে দেখুন')}</StatusBadge></div>
                  <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2"><span className="text-[12px] text-ink-600">{text('Ledger date view','খাতার তারিখ')}</span><span className="text-[11px] font-medium text-ink">{text(entryDateView === 'transaction' ? 'Transaction Date' : 'Created Date',entryDateView === 'transaction'?'লেনদেনের তারিখ':'লেখার তারিখ')}</span></div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="size-4 text-teal-700" />
                  <p className="text-sm font-semibold text-ink">{text('Quick accounting','দ্রুত হিসাব')}</p>
                </div>
                <p className="mt-1 font-bn text-[11px] text-ink-400">সাধারণ কাজ সহজ রাখুন, হিসাব নিজে থেকেই দুই পাশে মিলবে</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {([['Receipt Voucher', 'receipt'], ['Payment Voucher', 'payment'], ['Account Transfer', 'transfer'], ['Adjustment Entry', 'adjustment']] as Array<[string, VoucherType]>).map(([label, type]) => (
                    <button key={label} onClick={() => openVoucher(type)} className="min-h-12 rounded-md border border-border px-2.5 py-2 text-left text-[12px] font-medium text-ink transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                      {text(label,label==='Receipt Voucher'?'টাকা পাওয়ার ভাউচার':label==='Payment Voucher'?'টাকা দেওয়ার ভাউচার':label==='Account Transfer'?'হিসাবে টাকা সরান':'সমন্বয় এন্ট্রি')}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'vouchers' && (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border p-3">
              <div>
                <p className="text-[13px] font-medium text-ink">{text('Vouchers & postings','ভাউচার ও হিসাব এন্ট্রি')}</p>
                <p className="font-bn text-[11px] text-ink-400">কোথা থেকে হিসাব এসেছে এবং কে এন্ট্রি করেছেন</p>
              </div>
              <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setOpeningOpen(true)}>{text('Opening balance','শুরুর জের')}</Button><Button size="sm" onClick={() => openVoucher('receipt')}><Plus className="size-4" /> {text('New voucher','নতুন ভাউচার')}</Button></div>
            </div>
            <div className="overflow-x-auto">
              <Table className="w-full table-fixed lg:table-auto">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 min-w-0 pl-3 pr-1 text-xs lg:hidden">{text('Entry','এন্ট্রি')}</TableHead>
                    <TableHead className="hidden h-9 pl-4 text-xs lg:table-cell">{text('Date','তারিখ')}</TableHead>
                    <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Type','ধরন')}</TableHead>
                    <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Reference','নম্বর')}</TableHead>
                    <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Description','বিবরণ')}</TableHead>
                    <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Posted by','যিনি লিখেছেন')}</TableHead>
                    <TableHead className="h-9 w-[116px] pr-2 text-right text-xs sm:w-[132px] lg:w-auto">{text('Amount','টাকা')}</TableHead>
                    <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Status','অবস্থা')}</TableHead>
                    <TableHead className="sticky right-0 z-10 h-9 w-12 min-w-12 border-l border-border bg-card pr-2 text-right text-xs">{text('Action','কাজ')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources.slice().reverse().map((source) => (
                    <TableRow key={source.id} className="text-[13px]">
                      <TableCell data-accounts-mobile-summary="" className="min-w-0 py-2 pl-3 pr-1 lg:hidden">
                        <span data-accounts-mobile-ref="" className="block break-all text-[12px] font-semibold leading-tight text-teal-700">{source.reference}</span>
                        <span className="mt-1 block text-[11px] leading-tight text-ink-600">{source.transactionDate} · {sourceLabel(source.source)}</span>
                        <span className="mt-0.5 block truncate text-[10.5px] text-ink-400">{source.description || sourceHelper(source.source)}</span>
                      </TableCell>
                      <TableCell className="hidden py-2 pl-4 lg:table-cell">{source.transactionDate}</TableCell>
                      <TableCell className="hidden py-2 lg:table-cell"><p className="font-medium text-ink">{sourceLabel(source.source)}</p><p data-table-helper="" className="font-bn text-[10.5px] text-ink-400">{sourceHelper(source.source)}</p></TableCell>
                      <TableCell className="hidden py-2 font-medium text-teal-700 lg:table-cell">{source.reference}</TableCell>
                      <TableCell className="hidden max-w-[360px] py-2 lg:table-cell"><p className="truncate text-ink-600">{source.description || '—'}</p></TableCell>
                      <TableCell className="hidden py-2 text-ink-600 lg:table-cell">{source.postedBy}</TableCell>
                      <TableCell data-accounts-amount="" className="w-[116px] py-2 pr-2 text-right font-semibold sm:w-[132px] lg:w-auto"><span className="whitespace-nowrap text-[12px] lg:text-[13px]">{taka(source.amount)}</span>
                        <span data-accounts-mobile-status="" className="mt-0.5 block text-[10px] font-normal text-ink-500 lg:hidden">{text(source.recordStatus ?? 'Posted',source.recordStatus==='Deleted'?'মুছে ফেলা':'লেখা হয়েছে')}</span>
                      </TableCell>
                      <TableCell className="hidden py-2 lg:table-cell"><StatusBadge tone={source.recordStatus === 'Deleted' ? 'neutral' : 'success'} dot>{text(source.recordStatus ?? 'Posted',source.recordStatus==='Deleted'?'মুছে ফেলা':'লেখা হয়েছে')}</StatusBadge></TableCell>
                      <TableCell className="sticky right-0 z-10 w-12 min-w-12 border-l border-border bg-card py-1 pr-2 text-right">
                        <FloatingPanel
                          label={`Actions for ${source.reference}`}
                          width={180}
                          trigger={({ toggle, open }) => <ActionMenuTrigger label={`Actions for ${source.reference}`} expanded={open} onClick={toggle} />}>
                          {(close) => <ActionMenuList><ActionMenuItem icon={Eye} onClick={() => { close(); setEntryMode('view');setEntryActionId(source.id); }}>{text('Open details','বিস্তারিত খুলুন')}</ActionMenuItem><SourceDeleteAction kind="projection" onReview={isManualAccountingSource(source.source)&&source.recordStatus!=='Deleted'?()=>{close();setEntryMode('delete');setEntryActionId(source.id);}:undefined}/></ActionMenuList>}

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
        {tab === 'bank-entry' && <div>
          <div className="border-b border-border px-3 py-2">
            <Button variant="outline" size="sm" onClick={() => chooseTab('money-accounts')}>
              {text('Back to Money Accounts','টাকার হিসাবে ফিরে যান')}
            </Button>
          </div>
          <BankEntryTab initialAccountId={params.get('accountId') || undefined} />
        </div>}
      </div>

      <VoucherActionDialog
        source={entryAction}
        initialMode={entryMode}
        posting={entryPosting}
        onClose={() => setEntryActionId(null)}
        onUpdate={(updated) => {
          setSources((current) => current.map((item) => item.id === updated.id ? updated : item));
          toast.success('Voucher corrected', { description: updated.reference });
        }}
        onDelete={(source, reason) => {
          const audit=sourceDeleteAuthority(currentAuthority(),'money',source.id,reason);
          if(!isManualAccountingSource(source.source)||source.recordStatus==='Deleted')throw Error('Only an active original manual voucher can be deleted here.');
          const live=sources.find(s=>s.id===source.id);
          if(!live||JSON.stringify(live)!==JSON.stringify(source))throw Error('Source changed. Reopen review.');
          setSources((current) => current.map((item) => item.id === source.id ? { ...item, recordStatus: 'Deleted', deletedAt: audit.at, deletedBy: audit.actorId, deleteReason: audit.reason } : item));
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

