import {useSearchParams} from 'react-router-dom';
import {AppDatePicker} from '../components/AppDateRangePicker';
import {expenseDateIso,formatDay} from '../utils/dateRange';
import {reconciliationMatchError,canCompleteReconciliation,reconciliationCsv} from '../utils/reconciliation';
import { AppSelect } from '../components/AppSelect';
import { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  CheckCircle2,
  FileText,
  FileUp,
  Landmark,
  Link2,
  MoreHorizontal,
  Plus,
  Search,
  Undo2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import { FormSelect } from '../components/FormSelect';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge, type StatusTone } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { parties } from '../data/parties';
import {
  erpReconciliationTransactions as seedErp,
  reconciliationAccounts,
  reconciliationHistory,
  statementTransactions as seedStatement
} from '../data/reconciliation';
import type {
  ErpReconciliationTransaction,
  ReconciliationStatus,
  StatementTransaction
} from '../types/erp';
import { taka } from '../utils/currency';

type Tab = 'reconcile' | 'history';

const statusTone: Record<ReconciliationStatus, StatusTone> = {
  Matched: 'success',
  Review: 'warning',
  Unmatched: 'danger',
  Ignored: 'neutral'
};

function ReconciliationBadge({ status }: { status: ReconciliationStatus }) {
  return <StatusBadge tone={statusTone[status]} dot>{status}</StatusBadge>;
}

function UploadStatementDialog({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}) {
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent role="dialog" aria-modal="true" className="sm:max-w-lg">
  <DialogHeader><DialogTitle>Bank statement import</DialogTitle>
   <DialogDescription>PDF reading is not connected yet. The transactions on this screen are sample data; choosing a file would not import its contents.</DialogDescription></DialogHeader>
  <p className="text-sm text-ink-600 font-bn">এখন নমুনা তথ্য দিয়ে হিসাব মিলানো দেখুন। আসল ব্যাংক স্টেটমেন্ট আমদানি এখনো চালু হয়নি।</p>
  <DialogFooter><Button onClick={()=>onOpenChange(false)}>Back to sample transactions</Button></DialogFooter>
 </DialogContent></Dialog>;
}

function ErpEditor({
  transaction,
  statement,
  onSave,
  onMatch,
  matchError
}: {
  transaction: ErpReconciliationTransaction;
  statement: StatementTransaction;
  onSave: (transaction: ErpReconciliationTransaction) => void;
  onMatch: () => void;
  matchError: string|null;
}) {
  const [date, setDate] = useState(expenseDateIso(transaction.date));
  const [party, setParty] = useState(transaction.party);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [reference, setReference] = useState(transaction.reference);

  const [reason,setReason]=useState('');
  const amountNumber = Number(amount);
  const valid=Boolean(date&&amount.trim()&&Number.isFinite(amountNumber)&&amountNumber>0&&reason.trim());
  const dirty=date!==expenseDateIso(transaction.date)||party!==transaction.party||amountNumber!==transaction.amount||reference!==transaction.reference;
  const amountDiff = statement.amount - amountNumber;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Selected ERP transaction</p>
            <p className="mt-1 text-sm font-semibold text-ink">{transaction.type}</p>
          </div>
          <StatusBadge tone={amountDiff === 0 ? 'success' : 'warning'}>
            {amountDiff === 0 ? 'Amount matches' : `Difference ${taka(Math.abs(amountDiff))}`}
          </StatusBadge>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-[12px] font-medium text-ink">
            Date
            <AppDatePicker className="mt-1" label="Transaction date" value={date} onChange={setDate} />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Party
            <FormSelect
              className="mt-1"
              value={party}
              onChange={(event) => setParty(event.target.value)}
              options={Array.from(new Set([transaction.party, ...parties.map((item) => item.name), 'Unassigned']))}
            />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Amount
            <Input
              className="mt-1 text-right"
              value={amount}
              inputMode="decimal"
              onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
            />
          </label>
          <label className="text-[12px] font-medium text-ink">
            Reference
            <Input className="mt-1" value={reference} onChange={(event) => setReference(event.target.value)} />
          </label>
        </div>

        <label className="mt-3 block text-xs text-ink-600">Why change this? · কারণ<Input className="mt-1" value={reason} onChange={event=>setReason(event.target.value)} placeholder="Required for a preview correction" /></label>
        {(matchError||dirty)&&<p role="status" className="mt-2 text-xs text-warning">{dirty?'Save the correction before matching.':matchError}</p>}
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!valid||!dirty}
            onClick={() => {
              if(!valid)return;
              onSave({ ...transaction, date:formatDay(date), party, partyId:parties.find(item=>item.name===party)?.id, amount: amountNumber, reference });
              setReason('');
              toast.success('Sample transaction updated', {description:reason});
            }}>
            Save preview correction
          </Button>
          <Button size="sm" disabled={Boolean(matchError)||dirty} onClick={onMatch}>
            <Link2 className="size-4" /> Match transaction
          </Button>
        </div>
      </div>

      <div className="rounded-xl bg-ink-50 p-3 text-[12px]">
        <div className="flex justify-between gap-3"><span className="text-ink-500">Bank description</span><span className="max-w-[65%] text-right font-medium text-ink">{statement.description}</span></div>
        <div className="mt-1 flex justify-between gap-3"><span className="text-ink-500">Bank reference</span><span className="font-medium text-ink">{statement.reference ?? '—'}</span></div>
        <div className="mt-1 flex justify-between gap-3"><span className="text-ink-500">Bank amount</span><span className="font-semibold text-ink">{taka(statement.amount)}</span></div>
      </div>
    </div>
  );
}

export function Reconciliation() {
  const [tab, setTab] = useState<Tab>('reconcile');
  const [params]=useSearchParams();
  const [accountId, setAccountId] = useState(()=>reconciliationAccounts.find(item=>item.id===params.get('accountId')||item.name===params.get('account'))?.id??reconciliationAccounts[0].id);
  const [history,setHistory]=useState(reconciliationHistory);
  const [historyItem,setHistoryItem]=useState<(typeof reconciliationHistory)[number]|null>(null);
  const [completed,setCompleted]=useState<Record<string,boolean>>({});
  const [showRows,setShowRows]=useState(false);
  const [statement, setStatement] = useState<StatementTransaction[]>(seedStatement);
  const [erp, setErp] = useState<ErpReconciliationTransaction[]>(seedErp);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [selectedStatementId, setSelectedStatementId] = useState(
    seedStatement.find((item) => item.accountId === reconciliationAccounts[0].id)?.id ?? ''
  );
  const [selectedErpId, setSelectedErpId] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [statementFile] = useState<Record<string, string>>({
    'acc-bank-dbbl': 'DBBL-Sep-2026.pdf',
    'acc-bkash': 'bKash-Sep-2026.pdf'
  });

  const account = reconciliationAccounts.find((item) => item.id === accountId) ?? reconciliationAccounts[0];
  const accountStatement = statement.filter((item) => item.accountId === accountId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return accountStatement.filter((item) => {
      if (statusFilter !== 'All status' && item.status !== statusFilter) return false;
      if (!q) return true;
      return [item.date, item.description, item.reference ?? '', String(item.amount)]
        .some((value) => value.toLowerCase().includes(q));
    });
  }, [accountStatement, query, statusFilter]);

  const selectedStatement = filtered.find((item) => item.id === selectedStatementId) ?? filtered[0] ?? null;
  const accountErp = erp.filter((item) => item.accountId === accountId);

  const candidateIds = selectedStatement
    ? Array.from(new Set([
        selectedStatement.matchedErpId,
        selectedStatement.suggestedErpId,
        ...accountErp
          .filter((item) => item.direction === selectedStatement.direction)
          .sort((a, b) => Math.abs(a.amount - selectedStatement.amount) - Math.abs(b.amount - selectedStatement.amount))
          .slice(0, 4)
          .map((item) => item.id)
      ].filter(Boolean) as string[]))
    : [];

  const candidates = candidateIds
    .map((id) => accountErp.find((item) => item.id === id))
    .filter((item): item is ErpReconciliationTransaction => Boolean(item))
    .filter(item=>!statement.some(row=>row.id!==selectedStatement?.id&&row.status==='Matched'&&row.matchedErpId===item.id));

  const activeErpId = selectedErpId && candidates.some((item) => item.id === selectedErpId)
    ? selectedErpId
    : selectedStatement?.matchedErpId ?? selectedStatement?.suggestedErpId ?? candidates[0]?.id ?? '';
  const selectedErp = candidates.find((item) => item.id === activeErpId) ?? null;

  const matchedCount = accountStatement.filter((item) => item.status === 'Matched').length;
  const reviewCount = accountStatement.filter((item) => item.status === 'Review').length;
  const unmatchedCount = accountStatement.filter((item) => item.status === 'Unmatched').length;

  const initialDifference = seedStatement
    .filter((item) => item.accountId === accountId && (item.status === 'Review' || item.status === 'Unmatched'))
    .reduce((sum, item) => {
      const sign = item.direction === 'in' ? 1 : -1;
      if (item.status === 'Unmatched' || !item.suggestedErpId) return sum + sign * item.amount;
      const candidate = seedErp.find((entry) => entry.id === item.suggestedErpId);
      if (!candidate) return sum + sign * item.amount;
      return sum + sign * (item.amount - candidate.amount);
    }, 0);

  const erpAdjustment = erp
    .filter((item) => item.accountId === accountId)
    .reduce((sum, item) => {
      const seed = seedErp.find((entry) => entry.id === item.id);
      const sign = item.direction === 'in' ? 1 : -1;
      return sum + sign * (item.amount - (seed?.amount ?? 0));
    }, 0);

  const statementClosing = account.balance + initialDifference;
  const erpClosing = account.balance + erpAdjustment;
  const difference = statementClosing - erpClosing;
  const canFinish = !completed[accountId]&&canCompleteReconciliation(accountStatement,accountErp,difference);

  const summary = [
    { label: 'Statement closing', value: taka(statementClosing), sub: statementFile[accountId] ?? 'No statement uploaded' },
    { label: 'ERP balance', value: taka(erpClosing), sub: account.detail ?? account.type },
    { label: 'Matched', value: `${matchedCount}/${accountStatement.length}`, sub: `${reviewCount} review · ${unmatchedCount} unmatched`, tone: 'text-success' },
    { label: 'Difference', value: taka(Math.abs(difference)), sub: completed[accountId]?'Preview saved':difference===0?'Balances agree; review all rows':'Needs review', tone: difference === 0 ? 'text-success' : 'text-danger' }
  ];

  const selectStatement = (item: StatementTransaction) => {
    setSelectedStatementId(item.id);
    setShowRows(false);
    setSelectedErpId(item.matchedErpId ?? item.suggestedErpId ?? '');
  };

  const updateSelectedStatus = (status: ReconciliationStatus, matchedErpId?: string) => {
    if (!selectedStatement) return;
    setCompleted(current=>({...current,[accountId]:false}));
    setStatement((items) => items.map((item) => item.id === selectedStatement.id ? {
      ...item,
      status,
      ...(matchedErpId ? { matchedErpId } : { matchedErpId: undefined })
    } : item));
  };

  const matchSelected = (erpId: string) => {
    const entry=erp.find(item=>item.id===erpId);
    if(!selectedStatement||!entry)return;
    const error=reconciliationMatchError(selectedStatement,entry,statement);
    if(error){toast.error(error);return;}
    updateSelectedStatus('Matched', erpId);
    toast.success('Matched in preview');
  };

  const createFromStatement = () => {
    if (!selectedStatement) return;
    const next: ErpReconciliationTransaction = {
      id: `erp-new-${Date.now()}`,
      accountId,
      date: selectedStatement.date,
      type: selectedStatement.description.toLowerCase().includes('charge') ? 'Expense' : 'Other',
      party: 'Unassigned',
      reference: selectedStatement.reference ?? `Imported ${selectedStatement.id}`,
      amount: selectedStatement.amount,
      direction: selectedStatement.direction
    };
    setErp((items) => [next, ...items]);
    setSelectedErpId(next.id);
    updateSelectedStatus('Matched', next.id);
    toast.success('Sample transaction created and matched');
  };

  const switchAccount = (nextId: string) => {
    setAccountId(nextId);
    setShowRows(false);
    const first = statement.find((item) => item.accountId === nextId);
    setSelectedStatementId(first?.id ?? '');
    setSelectedErpId('');
    setQuery('');
    setStatusFilter('All status');
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Account reconciliation"
        titleBn="হিসাব মিলানো"
        description="Match money in and money out · টাকা আসা–যাওয়া মিলান. Sample data only; changes last until this page reloads."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => {
              const url=URL.createObjectURL(new Blob([reconciliationCsv(filtered)],{type:'text/csv;charset=utf-8'}));
              const link=document.createElement('a');link.href=url;link.download='reconciliation-'+accountId+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
            }}>
              <ArrowDownToLine className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <FileUp className="size-4" /> Statement import
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-border bg-card p-3 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Landmark className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Account</p>
            <AppSelect label="Reconciliation account" className="mt-1 max-w-sm"
              value={accountId} onChange={switchAccount}
              options={reconciliationAccounts.map((item) => ({ value: item.id, label: item.name }))} />
            <p className="mt-1 text-[11px] text-ink-500">{account.detail ?? account.type}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[11px] text-ink-400">Statement</p>
            <p className="text-[12.5px] font-medium text-ink">{statementFile[accountId] ?? 'No file uploaded'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{item.label}</p>
            <p className={`mt-0.5 text-lg font-semibold ${item.tone ?? 'text-ink'}`}>{item.value}</p>
            <p className="text-[11px] text-ink-400">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-border px-3 scrollbar-thin" role="tablist">
          {([
            ['reconcile', 'Reconcile', 'Statement vs ERP'],
            ['history', 'History', 'Previous reconciliations']
          ] as Array<[Tab, string, string]>).map(([id, label, helper]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              title={helper}
              className={`flex shrink-0 items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-medium ${tab === id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'reconcile' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-ink-50/40 px-3 py-2">
              <p className="text-[11.5px] text-ink-500">
                {matchedCount} matched · {reviewCount} review · {unmatchedCount} unmatched
              </p>
              <Button
                size="sm"
                disabled={!canFinish} title={canFinish?'Save this sample review':'Match every statement row and resolve the balance difference first'}
                onClick={() => {
                  if(!canFinish)return;
                  setHistory(items=>[{id:'PREVIEW-'+Date.now(),accountId,accountName:account.name,period:'Sample statement review',statementFile:statementFile[accountId]??'Sample',statementClosing,erpClosing,matched:matchedCount,review:0,status:'Completed'},...items]);
                  setCompleted(current=>({...current,[accountId]:true}));setTab('history');toast.success('Review saved in this preview');
                }}>
                <CheckCircle2 className="size-4" /> {completed[accountId]?'Preview saved':'Save reviewed preview'}
              </Button>
            </div>
            <div className="p-3 lg:hidden"><Button variant="outline" className="min-h-11 w-full" aria-expanded={showRows} onClick={()=>setShowRows(!showRows)}>{showRows?'Back to selected transaction':'Choose statement transaction · লেনদেন বাছুন'}</Button></div>
            <div className="grid lg:min-h-[620px] lg:grid-cols-2">
            <section className={(showRows?'block':'hidden')+' min-w-0 border-b border-border lg:block lg:border-b-0 lg:border-r'}>
              <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-8" aria-label="Search statement transactions" placeholder="Search statement transaction" />
                </div>
                <FormSelect
                  className="w-full sm:w-36"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  options={['All status', 'Matched', 'Review', 'Unmatched', 'Ignored']}
                />
              </div>

              <div className="max-h-[560px] overflow-auto scrollbar-thin">
                {filtered.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectStatement(item)}
                    className={`flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition-colors ${selectedStatement?.id === item.id ? 'bg-teal-50/60' : 'hover:bg-ink-50'}`}>
                    <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.direction === 'in' ? 'bg-success' : 'bg-danger'}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[12.5px] font-medium text-ink">{item.date}</span>
                        <ReconciliationBadge status={item.status} />
                        {item.confidence && item.status !== 'Matched' ? <span className="text-[10.5px] text-ink-400">{item.confidence}% suggestion</span> : null}
                      </span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-ink-700">{item.description}</span>
                      <span className="mt-0.5 block text-[10.5px] text-ink-400">{item.reference ?? 'No reference'}</span>
                    </span>
                    <span className={`shrink-0 text-[13px] font-semibold ${item.direction === 'in' ? 'text-success' : 'text-ink'}`}>
                      {item.direction === 'in' ? '+' : '−'}{taka(item.amount)}
                    </span>
                  </button>
                ))}

                {filtered.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <FileText className="mx-auto size-7 text-helper" />
                    <p className="mt-2 text-sm font-medium text-ink">No statement rows match</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => { setQuery(''); setStatusFilter('All status'); }}>Clear filters</Button>
                  </div>
                )}
              </div>
            </section>

            <section className={(showRows?'hidden':'block')+' min-w-0 bg-ink-50/30 lg:block'}>
              {!selectedStatement ? (
                <div className="flex h-full min-h-96 flex-col items-center justify-center p-6 text-center">
                  <Link2 className="size-8 text-helper" />
                  <p className="mt-2 font-medium text-ink">Select a statement transaction</p>
                  <p className="mt-1 text-sm text-ink-500">HisabIQ will show likely ERP matches on this side.</p>
                </div>
              ) : (
                <div className="space-y-3 p-3">
                  <div className="rounded-xl border border-border bg-card p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">Statement transaction</p>
                        <p className="mt-1 text-sm font-semibold text-ink">{selectedStatement.description}</p>
                        <p className="mt-0.5 text-[11px] text-ink-500">{selectedStatement.date} · {selectedStatement.reference ?? 'No reference'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-semibold ${selectedStatement.direction === 'in' ? 'text-success' : 'text-ink'}`}>
                          {selectedStatement.direction === 'in' ? '+' : '−'}{taka(selectedStatement.amount)}
                        </p>
                        <ReconciliationBadge status={selectedStatement.status} />
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedStatement.status === 'Matched' ? (
                        <Button variant="outline" size="sm" onClick={() => { updateSelectedStatus('Review'); toast('Match removed'); }}>
                          <Undo2 className="size-4" /> Unmatch
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={createFromStatement}>
                            <Plus className="size-4" /> Create sample transaction
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => { updateSelectedStatus('Ignored'); toast('Statement row ignored'); }}>
                            <X className="size-4" /> Ignore
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {candidates.length > 0 && (
                    <div className="rounded-xl border border-border bg-card">
                      <div className="border-b border-border p-3">
                        <p className="text-[13px] font-medium text-ink">ERP matches</p>
                        <p className="mt-0.5 text-[11px] text-ink-500">Compare account, money direction and amount. Correct sample data only after checking the source.</p>
                      </div>
                      <div className="divide-y divide-border">
                        {candidates.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedErpId(item.id)}
                            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left ${activeErpId === item.id ? 'bg-teal-50/60' : 'hover:bg-ink-50'}`}>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[12.5px] font-medium text-ink">{item.party}</span>
                              <span className="block text-[10.5px] text-ink-400">{item.date} · {item.reference} · {item.type}</span>
                            </span>
                            <span className="text-[12.5px] font-semibold text-ink">{taka(item.amount)}</span>
                            {selectedStatement.matchedErpId === item.id && <CheckCircle2 className="size-4 text-success" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedErp ? (
                    <ErpEditor
                      key={selectedStatement.id+selectedErp.id}
                      transaction={selectedErp}
                      statement={selectedStatement}
                      onSave={(updated) => {setErp((items) => items.map((item) => item.id === updated.id ? updated : item));setCompleted(current=>({...current,[accountId]:false}));updateSelectedStatus('Review');}}
                      matchError={reconciliationMatchError(selectedStatement,selectedErp,statement)}
                      onMatch={() => matchSelected(selectedErp.id)}
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-ink-200 bg-card p-6 text-center">
                      <p className="text-sm font-medium text-ink">No ERP match found</p>
                      <p className="mt-1 text-xs text-ink-500">Create a new ERP transaction from the statement row or ignore it.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
            </div>
          </>
        )}

        {tab === 'history' && (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-4 text-xs">Reconciliation</TableHead>
                <TableHead className="h-9 text-xs">Account</TableHead>
                <TableHead className="h-9 text-xs">Statement</TableHead>
                <TableHead className="h-9 text-right text-xs">Statement closing</TableHead>
                <TableHead className="h-9 text-right text-xs">ERP closing</TableHead>
                <TableHead className="h-9 text-right text-xs">Difference</TableHead>
                <TableHead className="h-9 text-xs">Status</TableHead>
                <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.filter(item=>item.accountId===accountId).map((item) => {
                const diff = item.statementClosing - item.erpClosing;
                return (
                  <TableRow key={item.id} className="text-[13px]">
                    <TableCell className="py-2 pl-4">
                      <p className="font-medium text-ink">{item.id}</p>
                      <p className="text-[11px] text-ink-400">{item.period}</p>
                    </TableCell>
                    <TableCell className="py-2 font-medium text-ink">{item.accountName}</TableCell>
                    <TableCell className="py-2 text-ink-600">{item.statementFile}</TableCell>
                    <TableCell className="py-2 text-right">{taka(item.statementClosing)}</TableCell>
                    <TableCell className="py-2 text-right">{taka(item.erpClosing)}</TableCell>
                    <TableCell className={`py-2 text-right font-medium ${diff === 0 ? 'text-success' : 'text-danger'}`}>{taka(Math.abs(diff))}</TableCell>
                    <TableCell className="py-2">
                      <StatusBadge tone={item.status === 'Completed' ? 'success' : 'warning'} dot>{item.status}</StatusBadge>
                    </TableCell>
                    <TableCell className="py-2 pr-4 text-right">
                      <button
                        onClick={() => setHistoryItem(item)}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink"
                        aria-label={`Open ${item.id}`}>
                        <MoreHorizontal className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <UploadStatementDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <Dialog open={Boolean(historyItem)} onOpenChange={open=>!open&&setHistoryItem(null)}><DialogContent role="dialog" aria-modal="true" className="sm:max-w-lg">
       <DialogHeader><DialogTitle>Reconciliation review</DialogTitle><DialogDescription>Sample history only · no bank or ledger posting.</DialogDescription></DialogHeader>
       {historyItem&&<dl className="space-y-3 text-sm">{[['Account',historyItem.accountName],['Period',historyItem.period],['Statement',historyItem.statementFile],['Bank closing',taka(historyItem.statementClosing)],['ERP closing',taka(historyItem.erpClosing)],['Matched',String(historyItem.matched)],['Status',historyItem.status]].map(([label,value])=><div key={label} className="flex flex-wrap justify-between gap-2"><dt className="text-ink-500">{label}</dt><dd className="font-medium text-ink">{value}</dd></div>)}</dl>}
      </DialogContent></Dialog>
    </div>
  );
}
