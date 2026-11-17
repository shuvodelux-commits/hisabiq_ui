import { useEffect, useMemo, useState } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { useUiCopy } from '../../i18n/useUiCopy';
import { useSession } from '../../integration/SessionProvider.tsx';
import { ApiError } from '../../integration/errors.ts';
import { readTradingParties, type TradingParty, type TradingPartyList, type TradingRole } from '../../integration/party-reads.ts';
import { readMoneyAccounts, type ServerMoneyAccountList } from '../../integration/accounts.ts';
import { fetchCashDay, type CashDayStatus } from '../../services/cashSessionApi.ts';

/**
 * MOD-006 T02-H1 — connected Counter READ-ONLY. This is deliberately NOT the
 * preview CounterWorkspace: its preview Party/account mutation paths must never
 * run with authenticated tenant data. Actual posting and global connected-route
 * activation remain separate, explicitly reviewed tasks.
 */
type CounterRole = Extract<TradingRole, 'CUSTOMER' | 'SUPPLIER'>;
type State<T> = {
  scope: symbol;
  key: string;
  status: 'loading' | 'ready' | 'denied' | 'error';
  data?: T;
};
type Choice = { scope: symbol; role: CounterRole; id: string };

function outcome(error: unknown): 'denied' | 'error' {
  return error instanceof ApiError && error.kind === 'http' &&
    (error.status === 401 || error.status === 403) ? 'denied' : 'error';
}
function minorText(value: number): string {
  if (!Number.isSafeInteger(value)) throw Error('Invalid source money amount');
  const amount = BigInt(value < 0 ? -value : value);
  const whole = (amount / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (value < 0 ? '−' : '') + '৳' + whole + '.' + (amount % 100n).toString().padStart(2, '0');
}
function dayLabel(day: CashDayStatus): 'OFF' | 'OPEN' | 'BLOCKED' | 'CLOSED' | 'NOT_STARTED' | 'NOT_CONFIGURED' {
  if (!day.enabled) return 'OFF';
  if (!day.drawerAccountId) return 'NOT_CONFIGURED';
  if (day.blockedByDate) return 'BLOCKED';
  if (day.todaySession?.status === 'OPEN' &&
      day.todaySession.businessDate === day.businessDate &&
      day.todaySession.accountId === day.drawerAccountId) return 'OPEN';
  return day.todaySession?.status === 'CLOSED' ? 'CLOSED' : 'NOT_STARTED';
}
function balanceDescription(role: CounterRole, party: TradingParty): string {
  if (party.balance.direction === 'SETTLED') return 'Settled / নিষ্পত্তি';
  if (role === 'CUSTOMER') return party.balance.direction === 'RECEIVABLE'
    ? 'Customer owes shop / ক্রেতার কাছে পাওনা'
    : 'Customer advance / ক্রেতার অগ্রিম';
  return party.balance.direction === 'PAYABLE'
    ? 'Shop owes supplier / সরবরাহকারীর দেনা'
    : 'Supplier advance / সরবরাহকারীর অগ্রিম';
}

export function ConnectedCounterReadWorkspace() {
  const { mode, snapshot } = useSession();
  const { text } = useUiCopy();
  const [role, setRole] = useState<CounterRole>('CUSTOMER');
  const [search, setSearch] = useState('');
  const [reload, setReload] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [accountChoice, setAccountChoice] = useState<{ scope: symbol; id: string } | null>(null);
  const [partiesState, setPartiesState] = useState<State<TradingPartyList> | null>(null);
  const [accountsState, setAccountsState] = useState<State<ServerMoneyAccountList> | null>(null);
  const [dayState, setDayState] = useState<State<CashDayStatus> | null>(null);

  // A changed signed snapshot/epoch/token/permissions or explicit refresh
  // invalidates all displayed records during render, before effect cleanup.
  const scope = useMemo(() =>
    mode === 'connected' && snapshot.status === 'authenticated'
      ? Symbol('connected-counter-server-scope') : null,
    [mode, snapshot, reload],
  );
  const query = search.trim().slice(0, 120);
  const key = role + ':' + query;

  useEffect(() => {
    if (!scope || mode !== 'connected' || snapshot.status !== 'authenticated') return;
    const abort = new AbortController();
    let active = true;
    setAccountsState({ scope, key: 'accounts', status: 'loading' });
    void readMoneyAccounts(snapshot.accessToken, {}, abort.signal).then(
      data => { if (active) setAccountsState({ scope, key: 'accounts', status: 'ready', data }); },
      error => { if (active) setAccountsState({ scope, key: 'accounts', status: outcome(error) }); },
    );
    setDayState({ scope, key: 'day', status: 'loading' });
    void fetchCashDay(snapshot.accessToken, abort.signal).then(
      data => { if (active) setDayState({ scope, key: 'day', status: 'ready', data }); },
      error => { if (active) setDayState({ scope, key: 'day', status: outcome(error) }); },
    );
    return () => { active = false; abort.abort(); };
  }, [scope, mode, snapshot]);

  useEffect(() => {
    if (!scope || mode !== 'connected' || snapshot.status !== 'authenticated') return;
    const abort = new AbortController();
    let active = true;
    setPartiesState({ scope, key, status: 'loading' });
    void readTradingParties(
      snapshot.accessToken, role, { status: 'ACTIVE', search: query, limit: 30 },
      abort.signal,
    ).then(
      data => { if (active) setPartiesState({ scope, key, status: 'ready', data }); },
      error => { if (active) setPartiesState({ scope, key, status: outcome(error) }); },
    );
    return () => { active = false; abort.abort(); };
  }, [scope, mode, snapshot, role, key, query]);

  if (mode !== 'connected' || snapshot.status !== 'authenticated' || scope === null) {
    return <main role="status" className="p-4 text-sm text-ink-500">
      {text('Sign in to view verified Counter records.', 'যাচাই করা কাউন্টারের হিসাব দেখতে সাইন ইন করুন।')}
    </main>;
  }

  const partiesPage = partiesState?.scope === scope && partiesState.key === key ? partiesState : null;
  const accountsPage = accountsState?.scope === scope ? accountsState : null;
  const cashPage = dayState?.scope === scope ? dayState : null;
  const parties = partiesPage?.status === 'ready'
    ? partiesPage.data?.data.filter(p => p.status === 'ACTIVE' &&
      p.roles.includes(role) && p.readRole === role && !p.isSystemReserved) ?? [] : [];
  const accounts = accountsPage?.status === 'ready'
    ? accountsPage.data?.accounts.filter(a => a.status === 'ACTIVE' &&
      (a.type === 'CASH' || a.type === 'BANK' || a.type === 'MFS')) ?? [] : [];
  const selected = choice?.scope === scope && choice.role === role
    ? parties.find(p => p.id === choice.id) : undefined;
  const selectedAccount = accountChoice?.scope === scope
    ? accounts.find(a => a.id === accountChoice.id) : undefined;
  const currentCash = cashPage?.status === 'ready' && cashPage.data
    ? dayLabel(cashPage.data) : null;
  const actions = [
    { id: 'CUSTOMER', label: text('Customer Receive', 'ক্রেতার টাকা নিন'), enabled: true },
    { id: 'SUPPLIER', label: text('Supplier Pay', 'সরবরাহকারীকে টাকা দিন'), enabled: true },
    { id: 'EXPENSE', label: text('Expense', 'খরচ'), enabled: false },
    { id: 'TRANSFER', label: text('Bank Transfer', 'টাকা স্থানান্তর'), enabled: false },
    { id: 'BANK_ENTRY', label: text('Bank Entry', 'ব্যাংক এন্ট্রি'), enabled: false },
  ] as const;

  return <section data-connected-counter="" data-read-only="true"
    className="space-y-3 p-3 sm:space-y-4 sm:p-4">
    <header className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h1 className="text-lg font-semibold text-ink">{text('Counter', 'কাউন্টার')}</h1>
        <p className="text-xs text-ink-500">
          {text('Verified server records · read-only', 'সার্ভারের যাচাই করা হিসাব · শুধু দেখার জন্য')}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => {
        setChoice(null); setAccountChoice(null); setReload(value => value + 1);
      }}>{text('Refresh', 'রিফ্রেশ')}</Button>
    </header>
    <div className="grid grid-cols-2 gap-1.5 min-[390px]:grid-cols-3 xl:grid-cols-5"
      role="group" aria-label="Connected Counter actions">
      {actions.map(action => <button type="button" key={action.id}
        aria-pressed={action.enabled && role === action.id}
        disabled={!action.enabled}
        title={!action.enabled ? text('Server posting not connected', 'সার্ভারে লেনদেন এখনো যুক্ত হয়নি') : undefined}
        onClick={() => {
          if (action.id === 'CUSTOMER' || action.id === 'SUPPLIER') {
            setRole(action.id); setChoice(null); setSearch(''); setAccountChoice(null);
          }
        }}
        className={'min-h-12 rounded-md border px-2.5 py-2 text-left text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ' +
          (action.enabled && role === action.id
            ? 'border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground'
            : 'border-border bg-card text-ink') +
          (!action.enabled ? ' cursor-not-allowed opacity-50' : '')}
      >{action.label}</button>)}
    </div>
    <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <label htmlFor="connected-counter-party-search" className="block text-sm font-semibold">
            {role === 'CUSTOMER'
              ? text('Search customer', 'ক্রেতা খুঁজুন')
              : text('Search supplier', 'সরবরাহকারী খুঁজুন')}
          </label>
          <Input id="connected-counter-party-search" className="mt-2"
            placeholder={text('Search name or phone', 'নাম বা ফোন লিখুন')}
            value={search} onChange={event => {
              setSearch(event.target.value.slice(0, 120)); setChoice(null);
            }}/>
          <div className="mt-2" data-counter-party-state={partiesPage?.status ?? 'loading'}>
            {partiesPage?.status === 'loading' || !partiesPage
              ? <p role="status" className="text-xs text-ink-500">{text('Loading verified parties…', 'যাচাই করা পার্টি আনা হচ্ছে…')}</p>
              : partiesPage.status !== 'ready'
                ? <p role="alert" className="text-xs text-danger">{text('Party records unavailable. No preview records shown.', 'পার্টির হিসাব পাওয়া যায়নি। নমুনার হিসাব দেখানো হচ্ছে না।')}</p>
                : <div className="space-y-1">
                  {parties.length === 0 && <p role="status" className="text-xs text-ink-500">
                    {text('No matching active party.', 'চালু পার্টি পাওয়া যায়নি।')}
                  </p>}
                  {parties.map(p => <button type="button" key={p.id}
                    data-counter-party={p.id}
                    aria-pressed={selected?.id === p.id}
                    onClick={() => setChoice({ scope, role, id: p.id })}
                    className={'flex min-h-9 w-full items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-left text-sm ' +
                      (selected?.id === p.id
                        ? 'border-sidebar-primary bg-sidebar-accent' : 'border-border hover:bg-ink-50')}>
                    <span className="min-w-0 truncate font-medium">{p.name}</span>
                    <span className="shrink-0 text-xs text-ink-500">{p.phone ?? ''}</span>
                  </button>)}
                  {partiesPage.data?.page.hasMore && <p className="pt-2 text-xs text-ink-500">
                    {text('More results exist. Refine search.', 'আরও ফল আছে। খোঁজ নির্দিষ্ট করুন।')}
                  </p>}
                </div>}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <h2 className="text-sm font-semibold">{text('Payment sources', 'টাকার মাধ্যম')}</h2>
          <p className="mt-1 text-xs text-ink-500">
            {text('Actual account balances, not projected payments.', 'আসল হিসাবের জের, অনুমান করা পেমেন্ট নয়।')}
          </p>
          <label htmlFor="connected-counter-account" className="mt-3 block text-xs font-medium">
            {text('Choose account to inspect', 'দেখার জন্য হিসাব বাছুন')}
          </label>
          <select id="connected-counter-account" data-counter-account-state={accountsPage?.status ?? 'loading'}
            disabled={accountsPage?.status !== 'ready'}
            value={selectedAccount?.id ?? ''}
            onChange={event => setAccountChoice({ scope, id: event.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2 text-sm text-ink">
            <option value="">{text('Choose a verified account', 'যাচাই করা হিসাব বাছুন')}</option>
            {accounts.map(a => <option key={a.id} value={a.id}>
              {a.name + ' · ' + a.type}
            </option>)}
          </select>
          {accountsPage?.status === 'ready'
            ? <p className="mt-2 text-xs text-ink-500">
              {text('Active Cash / Bank / MFS accounts', 'চালু ক্যাশ / ব্যাংক / মোবাইল হিসাব')}: {accounts.length}
            </p>
            : accountsPage?.status === 'loading' || !accountsPage
              ? <p role="status" className="mt-2 text-xs">{text('Loading accounts…', 'হিসাব আনা হচ্ছে…')}</p>
              : <p role="alert" className="mt-2 text-xs text-danger">
                {text('Source accounts unavailable; no preview fallback.', 'সার্ভারের হিসাব পাওয়া যায়নি; নমুনা দেখানো হচ্ছে না।')}
              </p>}
          {selectedAccount && <p data-counter-source-balance=""
            className="mt-2 text-base font-semibold text-ink">
            {selectedAccount.name}: {minorText(selectedAccount.balanceMinor)}
          </p>}
        </div>
      </div>
      <aside className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <h2 className="text-sm font-semibold">{text('Selected Party balance', 'বাছা পার্টির জের')}</h2>
          {selected ? <div data-counter-source-party={selected.id} className="mt-2 space-y-1">
            <p className="font-medium">{selected.name}</p>
            <p className="text-xl font-semibold" data-counter-party-net={selected.balance.netMinor}>
              {minorText(selected.balance.netMinor)}
            </p>
            <p className="text-xs text-ink-500">{balanceDescription(role, selected)}</p>
            <p className="text-xs text-ink-500">
              {text('Outstanding', 'বকেয়া')}: {minorText(selected.balance.outstandingMinor)}
              {' · '}{text('Advance', 'অগ্রিম')}: {minorText(selected.balance.advanceMinor)}
            </p>
          </div> : <p className="mt-2 text-xs text-ink-500">
            {text('Choose a verified Party.', 'যাচাই করা পার্টি বাছুন।')}
          </p>}
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <h2 className="text-sm font-semibold">{text('Cash Session', 'ক্যাশ সেশন')}</h2>
          <p className="mt-2 text-sm font-medium"
            data-counter-cash-status={currentCash ?? cashPage?.status ?? 'loading'}>
            {currentCash === 'OPEN'
              ? text('Cash Day open', 'ক্যাশ দিন চালু')
              : currentCash === 'OFF' ? text('Cash Session OFF', 'ক্যাশ সেশন বন্ধ')
              : currentCash === 'BLOCKED' ? text('Previous day must close first', 'আগের দিন আগে বন্ধ করুন')
              : currentCash === 'CLOSED' ? text('Cash Day closed', 'ক্যাশ দিন বন্ধ')
              : currentCash === 'NOT_CONFIGURED' ? text('Drawer not configured', 'ক্যাশ ড্রয়ার সেট করা নেই')
              : currentCash === 'NOT_STARTED' ? text('Cash Day not started', 'ক্যাশ দিন শুরু হয়নি')
              : cashPage?.status === 'denied' ? text('Cash Day access denied', 'ক্যাশ দিনের অনুমতি নেই')
              : cashPage?.status === 'error' ? text('Cash Day unavailable', 'ক্যাশ দিনের তথ্য পাওয়া যায়নি')
              : text('Loading Cash Day…', 'ক্যাশ দিনের তথ্য আনা হচ্ছে…')}
          </p>
          {cashPage?.status === 'ready' && cashPage.data && <p className="mt-1 text-xs text-ink-500">
            {text('Business date', 'ব্যবসার দিন')}: {cashPage.data.businessDate}
          </p>}
        </div>
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
          <h2 className="text-sm font-semibold">{text('Payment review', 'পেমেন্ট যাচাই')}</h2>
          <p className="mt-2 text-xs text-ink-500">
            {text('Posting, split tenders, invoice allocation and discounts are not connected yet. Existing preview forms remain available in preview mode.', 'সার্ভারের পেমেন্ট, একাধিক মাধ্যম, বিলের সমন্বয় ও ছাড় এখনো যুক্ত হয়নি। নমুনার ফর্ম প্রিভিউ মোডে আগের মতো আছে।')}
          </p>
          <Button disabled className="mt-3 w-full" data-counter-submit-disabled="">
            {text('Review and record — unavailable', 'যাচাই ও লেখা — এখনো চালু নয়')}
          </Button>
        </div>
      </aside>
    </div>
  </section>;
}
