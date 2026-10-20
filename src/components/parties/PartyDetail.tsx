import { MotionTabList, MotionTabIndicator } from '../../motion/MotionTabList';
import { PartyActionSheet } from './PartyActionSheet';
import { FloatingPanel } from '../layout/FloatingPanel';
import {matchesSearch as fuzzyMatch} from '../../utils/fuzzySearch';
import { useEffect, useState } from 'react';
import { FileText, HandCoins, MapPin, MessageSquare, MoreHorizontal, ArrowLeftRight, Clock, ChevronLeft, ChevronRight, Printer, Paperclip, Phone, Plus, Receipt, Send, StickyNote, Pencil, Trash2, BookOpen, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Input } from '../Input';
import { FormSelect } from '../FormSelect';
import { AppSelect } from '../AppSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../Dialog';
import { PartyAvatar } from '../PartyAvatar';
import { RoleBadge } from './RoleBadge';
import { LedgerTable } from './LedgerTable';
import { PartyLedgerToolbar } from './PartyLedgerToolbar';
import { PartyStatementDialog } from './PartyStatementDialog';
import {useUiCopy} from '../../i18n/useUiCopy';
import { PartyPaymentDialog } from './PartyPaymentDialog';
import { PartyCreditRefundDialog } from './PartyCreditRefundDialog';
import { PartyTransactionDialog } from './PartyTransactionDialog';
import { PartyFinanceDialog } from './PartyFinanceDialog';
import { PartyOpeningDialog } from './PartyOpeningDialog';
import { activePartyOpening } from '../../utils/partyOpening';
import type { FinanceRole } from '../../utils/partyFinance';
import type { LedgerEntry, Party, PartyRole } from '../../types/erp';
import type { LedgerStatement, PartyLedgerRow, PartyAction, PartyBalanceSummary, PartySourceRecord, PartyPaymentPayload, PartyRefundPayload, PartyFinancePayload, PartyOpeningPayload } from '../../types/partyLedger';
import type { IsoRange } from '../../utils/dateRange';
import { formatNumber, taka } from '../../utils/currency';
import {projectVendorPartyLedger,type VendorPartyProfile} from '../../vendor/vendorPartyProjection';
import type {VendorSide} from '../../vendor/vendorTypes';
import type {VendorWorkTab} from '../../vendor/vendorRoute';

type Tab = 'ledger' | 'invoices' | 'payments' | 'notes' | 'attachments';

type PartyDetailProps = {
  party: Party;
  entries: LedgerEntry[];
  vendorProfile?:VendorPartyProfile;
  onOpenVendorWork?:(tab?:VendorWorkTab,sourceId?:string)=>void;
  onAddNote: (text: string) => void;
  onEditNote: (id: string, text: string) => void;
  onDeleteNote: (id: string) => void;
  relationship: PartyRole;
  onRoleChange: (role: PartyRole) => void;
  onEditParty: () => void;
  onChangeParty: () => void;
  onNewInvoice: () => void;
  statement: LedgerStatement;
  balanceSummary: PartyBalanceSummary;
  visibleRows: LedgerStatement['rows'];
  range: IsoRange; onRange: (range: IsoRange) => void;
  kind: string; onKind: (kind: string) => void;
  ledgerQuery: string; onLedgerQuery: (query: string) => void;
  pageSize: number; onPageSize: (n: number) => void;
  onResetLedger: () => void; onStatement: () => void;
  page: number; pages: number; onPage: (n: number) => void;
  actionsForRow: (row: PartyLedgerRow) => Array<{action:PartyAction;enabled:boolean;reason?:string}>;
  onLedgerAction: (action:PartyAction,row:PartyLedgerRow) => void;
  statementOpen: boolean; onCloseStatement: () => void;
  sources: readonly PartySourceRecord[];
  onRecordPayment: (payload:PartyPaymentPayload) => void;
  onRefundCredit: (payload:PartyRefundPayload) => void;
  onEditSourcePayment: (sourceId:string,payload:PartyPaymentPayload,reason:string) => void;
  onReverseSource: (sourceId:string,reason:string) => void;
  onRecordFinance: (payload:PartyFinancePayload) => void;
  onSetOpening: (payload:PartyOpeningPayload) => void;
};

export function PartyDetail({
  party, entries, relationship, onRoleChange, onEditParty, onChangeParty, onNewInvoice, onAddNote, onEditNote, onDeleteNote,
  statement, balanceSummary, visibleRows, range, onRange, kind, onKind, ledgerQuery, onLedgerQuery,
  pageSize, onPageSize, onResetLedger, onStatement, page, pages, onPage, actionsForRow,
  onLedgerAction, statementOpen, onCloseStatement, sources, onRecordPayment, onRefundCredit,
  onEditSourcePayment, onReverseSource, onRecordFinance, onSetOpening,
  vendorProfile,onOpenVendorWork
}: PartyDetailProps) {
  const {text}=useUiCopy();
  const [tab, setTab] = useState<Tab>('ledger');
  const [mobileActionsOpen,setMobileActionsOpen] = useState(false);
  useEffect(()=>{
    const media=window.matchMedia('(min-width: 768px)');
    const close=()=>{if(media.matches)setMobileActionsOpen(false);};
    media.addEventListener('change',close);
    close();
    return ()=>media.removeEventListener('change',close);
  },[]);
  const [vendorSide,setVendorSide]=useState<VendorSide>('payable');
  const [note, setNote] = useState('');
  const [editingNote, setEditingNote] = useState<LedgerEntry | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteNote, setDeleteNote] = useState<LedgerEntry | null>(null);
  const [attachment, setAttachment] = useState<LedgerEntry | null>(null);
  const [viewedRow,setViewedRow] = useState<PartyLedgerRow|null>(null);
  const [paymentOpen,setPaymentOpen] = useState(false);
  const [refundOpen,setRefundOpen] = useState(false);
  const [financeOpen,setFinanceOpen]=useState(false);
  const [openingOpen,setOpeningOpen]=useState(false);
  const existingOpening=activePartyOpening(sources,party.id,relationship);
  const [editorRow,setEditorRow]=useState<PartyLedgerRow|null>(null);
  const [editorMode,setEditorMode]=useState<'edit'|'reverse'>('edit');
  const doRowAction=(action:PartyAction,row:PartyLedgerRow)=>{
    if(vendorProfile&&action!=='view'){
     onOpenVendorWork?.(vendorSide==='payable'?'taken':'given',row.sourceId);return;
    }
    if(action==='view'){setViewedRow(row);return;}
    if((action==='edit'||action==='delete'||action==='reverse')&&
       /^party-(payment|refund|finance):/.test(row.sourceId??'')){
      setEditorMode(action==='edit'?'edit':'reverse');setEditorRow(row);return;
    }
    onLedgerAction(action,row);
  };

  const invoices = entries.filter((e) => e.type === 'invoice' || e.type === 'purchase');
  const payments = entries.filter((e) => e.type === 'payment' || e.type === 'return');
  const notes = entries.filter((e) => e.type === 'note');
  const attachments = entries.filter((e) => e.attachment);
  const shownStatement=vendorProfile?projectVendorPartyLedger(vendorProfile,vendorSide):statement;
  const shownFiltered=vendorProfile?shownStatement.rows.filter(r=>
    fuzzyMatch(ledgerQuery,[r.reference,r.description])):[];
  const shownRows=vendorProfile?shownFiltered.slice(Math.max(0,(page-1)*pageSize),page*pageSize):visibleRows;
  const shownPages=vendorProfile?Math.max(1,Math.ceil(shownFiltered.length/pageSize)):pages;
  const shownActions=(r:PartyLedgerRow)=>vendorProfile?
   [{action:'view' as const,enabled:true},{action:'source' as const,enabled:true}]:actionsForRow(r);

  const tabs: {id: Tab;label: string;count?: number;}[] = [
  { id: 'ledger', label: text('Ledger','খাতা') },
  { id: 'invoices', label:vendorProfile?text('Bills & Memos','বিল ও মেমো'):text('Invoices','বিল'), count:vendorProfile?vendorProfile.documents.length:invoices.length },
  { id: 'payments', label: text('Payments','পেমেন্ট'), count:vendorProfile?vendorProfile.payments.length:payments.length },
  { id: 'notes', label: text('Notes','মন্তব্য'), count: notes.length },
  { id: 'attachments', label: text('Attachments','ফাইল'), count: attachments.length }];


  const currentBalance=balanceSummary.netBalance;
  const isReceivable = currentBalance > 0;
  const payable = ['Supplier','Lender','Owner','Payee','Vendor'].includes(relationship);
  const balanceLabel = relationship==='Owner'?text('Owner capital','মালিকের মূলধন'):
    relationship==='Lender'?text('Lender loan','ঋণদাতাকে দেনা'):relationship==='Borrower'?text('Borrower balance','ঋণগ্রহীতার কাছে পাওনা'):
    relationship==='Supplier'?text('Supplier payable','সরবরাহকারীকে দেনা'):
    relationship==='Customer'?text('Customer balance','ক্রেতার হিসাব'):text(relationship+' balance','জের');

  // Exact Magic Patterns ActionMenuItems information architecture; real app handlers stay in place.
  const menuActions: Array<{
    id: string; icon: LucideIcon; label: string; helper: string;
    run: () => void; disabledReason?: string;
  }> = [
    {
      id: 'opening', icon: BookOpen,
      label: text('Opening balance', 'শুরুর জের'), helper: text('Set or edit opening balance', 'প্রারম্ভিক জের'),
      run: () => vendorProfile ? onOpenVendorWork?.('ledger') : setOpeningOpen(true)
    },
    {
      id: 'note', icon: StickyNote, label: text('Add note', 'নোট লিখুন'),
      helper: text('Write a note for this party', 'মন্তব্য যোগ করুন'),
      run: () => setTab('notes')
    },
    {
      id: 'edit', icon: Pencil, label: text('Edit party', 'পার্টির তথ্য বদলান'),
      helper: text('Update party details', 'পার্টির তথ্য বদলান'), run: onEditParty
    },
    {
      id: 'print', icon: Printer, label: text('Print statement', 'হিসাব প্রিন্ট'),
      helper: text('Print the party ledger', 'স্টেটমেন্ট প্রিন্ট'), run: onStatement
    },
    ...(!vendorProfile && (relationship === 'Customer' || relationship === 'Supplier') ? [{
      id: 'refund', icon: HandCoins, label: text('Refund credit', 'জমা টাকা ফেরত'),
      helper: text('Return available customer or supplier credit', 'জমা টাকা ফেরত দিন'),
      run: () => setRefundOpen(true),
      disabledReason: balanceSummary.refundableCredit > 0 ? undefined : text('No verified refundable credit yet', 'ফেরত দেওয়ার মতো নিশ্চিত জমা টাকা নেই')
    }] : []),
    ...(!vendorProfile && (['Owner','Lender','Borrower'] as PartyRole[]).includes(relationship) ? [{
      id: 'finance', icon: HandCoins, label: text('Record finance transaction', 'অর্থের লেনদেন'),
      helper: text('Capital, borrow, lend or repay', 'মূলধন বা ধার লেনদেন'),
      run: () => setFinanceOpen(true)
    }] : []),
    ...(vendorProfile ? [{
      id: 'vendor', icon: BookOpen, label: text('Open Vendor Work', 'ভেন্ডরের কাজ খুলুন'),
      helper: text('Purchases and vendor settlements', 'ক্রয় ও ভেন্ডরের হিসাব'),
      run: () => onOpenVendorWork?.('taken')
    }, {
      id: 'vendor-payment', icon: HandCoins, label: text('Vendor payments', 'ভেন্ডরের পেমেন্ট'),
      helper: text('Open pay and receive options', 'টাকা দেওয়া ও নেওয়া'),
      run: () => onOpenVendorWork?.('payments')
    }] : []),
    {
      id: 'send', icon: Send, label: text('Send statement', 'হিসাব পাঠান'),
      helper: text('Send via SMS when connected', 'SMS-এর মাধ্যমে পাঠান'),
      run: () => toast(text('SMS service is not connected to the UI preview', 'এই প্রিভিউতে SMS চালু নেই')),
      disabledReason: text('SMS service is not connected to the UI preview', 'এই প্রিভিউতে SMS চালু নেই')
    }
  ];

  const menuItem = (item: typeof menuActions[number], close: () => void) => {
    const Icon = item.icon;
    const disabled = Boolean(item.disabledReason);
    return <button key={item.id} type="button" role="menuitem"
      disabled={disabled} title={item.disabledReason}
      onClick={() => { close(); item.run(); }}
      className="flex min-h-14 w-full items-start gap-3 rounded-lg px-2.5 py-3 text-left transition-colors hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-50">
      <Icon className="mt-0.5 size-[18px] shrink-0 text-ink-600" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium leading-snug text-ink">{item.label}</span>
        <span className="block font-bn text-[13px] leading-snug text-ink-500">
          {item.disabledReason || item.helper}
        </span>
      </span>
    </button>;
  };

  return (
    <div className="min-w-0 rounded-xl border border-border bg-card shadow-card">

      <header className="border-b border-border px-4 pb-4 pt-4 md:px-5 md:pt-5">
        <div className="flex min-w-0 items-start gap-3 md:gap-4">
          <PartyAvatar name={party.name} color={party.avatarColor} image={party.image} size={52} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="break-words text-[18px] font-semibold leading-tight tracking-tight text-ink md:text-[20px]">{party.name}</h2>
              {party.nameBn && <span lang="bn" className="font-bn text-sm text-ink-500">{party.nameBn}</span>}
              <Button size="sm" variant="ghost" className="hidden h-7 px-2 md:inline-flex" onClick={onEditParty}>
                <Pencil className="size-3" /> {text('Edit party', 'তথ্য বদলান')}
              </Button>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-ink-500">
              <span className="flex flex-wrap items-center gap-1">{party.roles.map(r => <RoleBadge key={r} role={r} />)}</span>
              {party.phone && <a href={'tel:' + party.phone.replace(/[^+0-9]/g, '')}
                className="hidden items-center gap-1 rounded hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500 md:inline-flex">
                <Phone className="size-3.5" aria-hidden="true" /> {party.phone}
              </a>}
              {party.area && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5 shrink-0" aria-hidden="true" />{party.area}</span>}
              {party.lastActivity && <span className="hidden items-center gap-1 sm:inline-flex"><Clock className="size-3.5" aria-hidden="true" />{text('Last activity', 'শেষ লেনদেন')} {party.lastActivity}</span>}
            </div>
            {party.roles.length>1 && <div className="mt-2 max-w-44">
              <FormSelect title={text('Relationship', 'সম্পর্কের ধরন')} value={relationship} options={party.roles} onChange={event=>onRoleChange(event.target.value as PartyRole)} />
            </div>}
          </div>
          <div className="hidden max-w-[280px] shrink-0 min-[900px]:block lg:hidden xl:block">
            {vendorProfile ?
              <div className="divide-y divide-border rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between gap-3 p-3">
                  <span className="text-xs text-danger">{text('You owe', 'আপনাকে দিতে হবে')}</span>
                  <strong className="text-right text-lg text-danger">{taka(vendorProfile.summary.takenDuePaisa/100)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3 p-3">
                  <span className="text-xs text-ink-500">{text('Vendor owes', 'ভেন্ডরের কাছে পাওনা')}</span>
                  <strong className="text-right text-lg text-ink">{taka(vendorProfile.summary.givenDuePaisa/100)}</strong>
                </div>
                {vendorProfile.summary.priceNotSetBaseQty>0 && <p className="px-3 py-2 text-xs text-warning">
                  {vendorProfile.summary.priceNotSetBaseQty} {text('units · Price not set','একক · দাম ঠিক হয়নি')}
                </p>}
              </div> :
              <div className={isReceivable ? 'rounded-xl bg-teal-50 px-4 py-3 text-right' : currentBalance < 0 ? 'rounded-xl bg-danger-bg px-4 py-3 text-right' : 'rounded-xl bg-ink-50 px-4 py-3 text-right'}>
                <p className="text-[13px] font-semibold text-ink-600">{balanceLabel}</p>
                <p className="mt-1 break-words text-[26px] font-semibold leading-tight text-ink">{taka(Math.abs(currentBalance))}</p>
              </div>}
          </div>
          <Button size="sm" variant="outline" className="hidden shrink-0 items-center gap-1.5 md:inline-flex lg:hidden" onClick={onChangeParty}>
            <ArrowLeftRight className="size-4" /> {text('Change party', 'পার্টি বদলান')}
          </Button>
        </div>
        <div className="mt-4 min-[900px]:hidden lg:block xl:hidden">
          {vendorProfile ? <div className="divide-y divide-border rounded-lg border border-border bg-card">
            <div className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5">
              <span className="text-sm font-semibold text-danger">{text('You owe', 'আপনাকে দিতে হবে')}</span>
              <strong className="break-words text-right text-xl text-danger">{taka(vendorProfile.summary.takenDuePaisa/100)}</strong>
            </div>
            <div className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5">
              <span className="text-sm font-semibold text-ink">{text('Vendor owes', 'ভেন্ডরের কাছে পাওনা')}</span>
              <strong className="break-words text-right text-xl text-ink">{taka(vendorProfile.summary.givenDuePaisa/100)}</strong>
            </div>
          </div> : <div className={isReceivable ? 'flex min-w-0 items-center justify-between gap-3 rounded-lg bg-teal-50 px-3.5 py-3' : currentBalance < 0 ? 'flex min-w-0 items-center justify-between gap-3 rounded-lg bg-danger-bg px-3.5 py-3' : 'flex min-w-0 items-center justify-between gap-3 rounded-lg bg-ink-50 px-3.5 py-3'}>
            <span className="min-w-0 text-sm font-semibold text-ink-700">{balanceLabel}</span>
            <strong className="min-w-0 break-words text-right text-[22px] leading-tight text-ink">{taka(Math.abs(currentBalance))}</strong>
          </div>}
          {vendorProfile && vendorProfile.summary.priceNotSetBaseQty>0 && <p className="mt-1 text-xs text-warning">{vendorProfile.summary.priceNotSetBaseQty} {text('units · Price not set', 'একক · দাম ঠিক হয়নি')}</p>}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:hidden">
          {party.phone ?
            <a href={'tel:' + party.phone.replace(/[^+0-9]/g, '')}
              aria-label={text('Call', 'ফোন করুন')+' '+party.phone}
              className="flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-md border border-border px-2 text-sm text-ink focus-visible:ring-2 focus-visible:ring-teal-500">
              <Phone className="size-4 shrink-0" aria-hidden="true" /><span className="truncate">{party.phone}</span>
            </a> :
            <Button size="sm" variant="outline" onClick={onEditParty}>{text('Edit party', 'তথ্য বদলান')}</Button>}
          <Button size="sm" variant="outline" className="min-h-10" onClick={onChangeParty}>
            <ArrowLeftRight className="size-4 shrink-0" /> {text('Change party', 'পার্টি বদলান')}
          </Button>
        </div>
      </header>


      <div className="grid grid-cols-2 gap-2 border-b border-border px-4 pb-4 md:hidden">
        {vendorProfile ? <>
          <Button size="sm" className="col-span-2 min-h-11 text-[15px] font-semibold" onClick={() => onOpenVendorWork?.('payments')}>
            <HandCoins className="size-[18px]" />{text('Pay Vendor', 'ভেন্ডরকে টাকা দিন')}
          </Button>
          <Button size="sm" variant="outline" className="min-h-11" onClick={() => onOpenVendorWork?.('payments')}>
            {text('Receive Money', 'টাকা নিন')}
          </Button>
        </> : relationship === 'Customer' || relationship === 'Supplier' ? <>
          <Button size="sm" className="col-span-2 min-h-11 text-[15px] font-semibold" onClick={() => setPaymentOpen(true)}>
            <HandCoins className="size-[18px]" />{payable ? text('Make payment', 'টাকা দিন') : text('Receive payment', 'টাকা নিন')}
          </Button>
          {relationship === 'Customer' ? <Button size="sm" variant="outline" className="min-h-11" disabled={party.status==='Inactive'} onClick={onNewInvoice}>
            <Plus className="size-4" />{text('New invoice', 'নতুন বিল')}
          </Button> : <Button size="sm" variant="outline" className="min-h-11" onClick={() => setOpeningOpen(true)}>
            <BookOpen className="size-4" />{text('Opening balance', 'শুরুর জের')}
          </Button>}
        </> : <>
          <Button size="sm" className="col-span-2 min-h-11 whitespace-normal text-[15px] font-semibold"
            aria-label={text(`Record ${relationship.toLowerCase()} finance`, 'টাকা লেনদেন লিখুন')}
            onClick={() => (['Owner','Lender','Borrower'] as PartyRole[]).includes(relationship) ? setFinanceOpen(true) : setOpeningOpen(true)}>
            <HandCoins className="size-[18px] shrink-0"/>
            {relationship==='Owner' ? text('Capital / withdrawal','মূলধন জমা / তোলা') :
             relationship==='Lender' ? text('Borrow / repay','ধার নেওয়া / শোধ') :
             relationship==='Borrower' ? text('Lend / receive','ধার দেওয়া / আদায়') :
             text('Opening balance','শুরুর জের')}
          </Button>
          <Button size="sm" variant="outline" className="min-h-11" onClick={() => setOpeningOpen(true)}>
            <BookOpen className="size-4" />{text('Opening balance','শুরুর জের')}
          </Button>
        </>}
        <Button size="sm" variant="outline" className="min-h-11" aria-haspopup="dialog"
          aria-expanded={mobileActionsOpen} onClick={() => setMobileActionsOpen(true)}>
          <MoreHorizontal className="size-[17px]" />{text('More', 'আরও')}
          <span className="sr-only"> {text('actions', 'কাজ')}</span>
        </Button>
      </div>

      <div className="hidden flex-wrap items-center gap-2 border-b border-border px-5 pb-4 md:flex">
        {vendorProfile ? <>
          <Button size="sm" onClick={() => onOpenVendorWork?.('payments')}>{text('Pay Vendor', 'ভেন্ডরকে টাকা দিন')}</Button>
          <Button size="sm" variant="outline" onClick={() => onOpenVendorWork?.('payments')}>{text('Receive Money', 'টাকা নিন')}</Button>
        </> : (relationship==='Customer' || relationship==='Supplier') ? <>
          <Button size="sm" onClick={() => setPaymentOpen(true)}><HandCoins className="size-4" />{payable?text('Make payment','টাকা দিন'):text('Receive payment','টাকা নিন')}</Button>
          {relationship==='Customer' && <Button size="sm" variant="outline" onClick={onNewInvoice} disabled={party.status==='Inactive'}>
            <Plus className="size-4" />{text('New invoice','নতুন বিল')}
          </Button>}
        </> : <Button size="sm" onClick={() => setFinanceOpen(true)}
          aria-label={text(`Record ${relationship.toLowerCase()} finance`, 'টাকা লেনদেন লিখুন')}>
          <HandCoins className="size-4" />{text('Finance transaction', 'অর্থের লেনদেন')}
        </Button>}
        <FloatingPanel width={280} align="right" label={text('More actions', 'আরও কাজ')}
          trigger={({toggle,open}) => <Button size="sm" variant="outline" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
            <MoreHorizontal className="size-4" />{text('More', 'আরও')}
          </Button>}>
          {close => <div className="p-1" role="menu" aria-label={text('More actions', 'আরও কাজ')}>
            {menuActions.map(item => menuItem(item,close))}
          </div>}
        </FloatingPanel>
      </div>

      <PartyActionSheet open={mobileActionsOpen} onClose={() => setMobileActionsOpen(false)}
        title={text('More actions', 'আরও কাজ')} titleBn="আরও কাজ">
        <div role="group" aria-label={text('More actions', 'আরও কাজ')}>
          {menuActions.map(item => menuItem(item,() => setMobileActionsOpen(false)))}
        </div>
      </PartyActionSheet>

      <MotionTabList className="sticky top-14 z-20 flex gap-1 overflow-x-auto border-b border-border bg-card px-3 scrollbar-thin md:static md:z-auto" role="tablist">
        {tabs.map((t) =>
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          onClick={() => setTab(t.id)}
          className={`flex shrink-0 items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-medium transition-colors ${
          tab === t.id ? 'text-ink' : 'text-ink-500 hover:text-ink'}`
          }>
          
            {t.label}
            {t.count !== undefined &&
          <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{t.count}</span>
          }
          <MotionTabIndicator active={tab === t.id} /></button>
        )}
      </MotionTabList>

      {(vendorProfile?(!vendorProfile.documents.length&&!vendorProfile.payments.length&&!notes.length):entries.length===0) && tab !== 'notes' && tab !== 'ledger' ?
      <div className="px-4 py-14 text-center">
          <Receipt className="mx-auto size-8 text-helper" />
          <p className="mt-2 font-medium text-ink">{text('No transactions in this period','এই সময়ে কোনো লেনদেন নেই')}</p>
          <p className="mt-1 text-sm text-ink-500">{text('Invoices, payments and notes for','বিল, পেমেন্ট ও মন্তব্য দেখাবে:')} {party.name}</p>
        </div> :

      <div>
          {tab === 'ledger' && <>
            {vendorProfile&&<div className="flex flex-wrap items-center gap-2 border-b border-border bg-ink-50 px-3 py-2 text-xs">
              <span>{text('Account · কোন হিসাব?','কোন হিসাব?')}</span>
              <Button size="sm" variant={vendorSide==='payable'?'default':'outline'}
               onClick={()=>{setVendorSide('payable');onPage(1);}}>{text('Taken · You owe','নিয়েছেন · দেনা')}</Button>
              <Button size="sm" variant={vendorSide==='receivable'?'default':'outline'}
               onClick={()=>{setVendorSide('receivable');onPage(1);}}>{text('Given · Vendor owes','দিয়েছেন · পাওনা')}</Button>
              <span className="ml-auto text-ink-500">{text('Separate running balances','আলাদা চলতি জের')}</span>
             </div>}
            <PartyLedgerToolbar range={range} onRange={onRange} kind={kind} onKind={onKind}
              query={ledgerQuery} onQuery={onLedgerQuery} pageSize={pageSize} onPageSize={onPageSize}
              onStatement={onStatement} onReset={onResetLedger}/>
            <LedgerTable statement={shownStatement} visibleRows={shownRows} actionsForRow={shownActions}
              onAction={doRowAction} onOpenAttachment={()=>toast(text('No document available in preview','প্রিভিউতে কোনো ফাইল নেই'))}/>
            <nav aria-label={text('Ledger pages','খাতার পাতা')} className="flex flex-col gap-3 border-t border-border px-4 py-3 text-[13px] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <span aria-live="polite">{text('Showing','দেখাচ্ছে')} {shownRows.length===0?0:(page-1)*pageSize+1}–{Math.min(page*pageSize,vendorProfile?shownFiltered.length:shownStatement.rows.length)} {text('of','মোট')} {vendorProfile?shownFiltered.length:shownStatement.rows.length} {text('dated transactions','টি তারিখসহ লেনদেন')}</span>
                <div className="lg:hidden">
                  <AppSelect compact label={text('Rows per page','প্রতি পাতায়')} value={String(pageSize)}
                    options={['10','25','50','100']} onChange={value=>onPageSize(Number(value))}/>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
                <Button size="sm" variant="outline" className="min-h-9" disabled={page<=1} onClick={()=>onPage(page-1)}>
                  <ChevronLeft className="size-4" /> {text('Previous','আগের')}
                </Button>
                <span className="whitespace-nowrap text-center">{text('Page','পাতা')} {page} {text('of','মোট')} {shownPages}</span>
                <Button size="sm" variant="outline" className="min-h-9" disabled={page>=shownPages} onClick={()=>onPage(page+1)}>
                  {text('Next','পরের')} <ChevronRight className="size-4" />
                </Button>
              </div>
            </nav>
            {vendorProfile&&vendorSide==='payable'&&vendorProfile.takenStatement.unpricedSources.length>0&&
             <p className="px-4 py-2 text-xs text-ink-500">{text('Price not set · দাম ঠিক হয়নি','দাম ঠিক হয়নি')} — {vendorProfile.takenStatement.unpricedSources.length} {text('taken record(s). No money amount assigned.','টি নেওয়া পণ্য। এখনো কোনো টাকা ধরা হয়নি।')}</p>}
          </>}
          {(tab === 'invoices' || tab === 'payments') && vendorProfile&&
           <ul className="divide-y divide-border">
            {(tab==='invoices'?vendorProfile.documents:vendorProfile.payments).map(item=>
             <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-xs">
              <span className="min-w-0 flex-1"><strong className="text-ink">{item.reference}</strong>
               <span className="ml-2 text-ink-400">{item.date}</span>
               <p className="mt-1 text-ink-500">{item.description}</p></span>
              <strong className="text-ink">{item.moneyPaisa===null?text('Price not set','দাম ঠিক হয়নি'):taka(Math.abs(item.moneyPaisa)/100)}</strong>
              <Button size="sm" variant="ghost" onClick={()=>onOpenVendorWork?.(
                item.bucket==='vendor-receivable'?'given':item.bucket==='supplier-purchase'?'purchases':'taken',
                item.sourceEventId)}>{text('View','দেখুন')}</Button>
             </li>)}
            {!(tab==='invoices'?vendorProfile.documents:vendorProfile.payments).length&&
             <li className="p-8 text-center text-xs text-ink-500">{text('No records yet.','এখনো কোনো রেকর্ড নেই।')}</li>}
           </ul>}
          {(tab === 'invoices' || tab === 'payments') && !vendorProfile &&
        <ul className="divide-y divide-border">
              {(tab === 'invoices' ? invoices : payments).map((e) =>
          <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                    {tab === 'invoices' ? <FileText className="size-4" /> : <HandCoins className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{e.ref ?? text('Entry','এন্ট্রি')} <span className="font-normal text-ink-400">· {e.date}</span></p>
                    <p className="truncate text-xs text-ink-500">{e.description}</p>
                  </div>
                  <span className="font-semibold tabular-nums text-ink">{taka(e.debit || e.credit)}</span>
                </li>
          )}
              {(tab === 'invoices' ? invoices : payments).length === 0 &&
          <li className="px-4 py-10 text-center text-sm text-ink-500">{text('Nothing here yet.','এখনো কিছু নেই।')}</li>
          }
            </ul>
        }
          {tab === 'attachments' &&
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
              {attachments.map((e) =>
          <button key={e.id} onClick={() => setAttachment(e)} className="overflow-hidden rounded-lg border border-border text-left hover:border-teal-300">
                  <div className="flex aspect-[4/3] items-center justify-center bg-ink-50">
                    {e.attachment?.url ?
              <img src={e.attachment.url} alt="" className="h-full w-full object-cover" /> :

              <Paperclip className="size-6 text-helper" />
              }
                  </div>
                  <div className="px-2.5 py-1.5">
                    <p className="truncate text-xs font-medium text-ink">{e.attachment?.name}</p>
                    <p className="text-[11px] text-ink-500">{e.ref} · {e.date}</p>
                  </div>
                </button>
          )}
              {attachments.length === 0 && <p className="col-span-full py-8 text-center text-sm text-ink-500">{text('No attachments.','কোনো ফাইল নেই।')}</p>}
            </div>
        }
        </div>
      }

      {tab === 'notes' &&
      <div className="space-y-3 p-4">
          <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            onAddNote(note.trim());
            setNote('');
            toast.success(text('Note added','নোট যোগ হয়েছে'));
          }}>
          
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={text("Write a note… e.g. Promised payment on Sunday","নোট লিখুন… যেমন রবিবার টাকা দেবেন")} aria-label={text("New note","নতুন নোট")} />
            <Button type="submit" size="sm" className="h-9">
              <MessageSquare className="size-4" /> {text('Add note','নোট যোগ করুন')}
            </Button>
          </form>
          <ul className="space-y-2">
            {notes.map((n) =>
          <li key={n.id} className="rounded-lg border border-warning/20 bg-warning-bg/50 px-3 py-2 text-[13px] text-ink-700">
                <div className="flex items-start justify-between gap-2">
                  <span className="break-words">{n.description}</span>
                  <span className="flex shrink-0 gap-1">
                    <button type="button" aria-label={`${text('Edit note','নোট বদলান')} ${n.description}`} className="rounded p-1 text-ink-500 hover:bg-ink-100" onClick={()=>{setEditingNote(n);setEditText(n.description);}}><Pencil className="size-3.5"/></button>
                    <button type="button" aria-label={`${text('Delete note','নোট মুছুন')} ${n.description}`} className="rounded p-1 text-danger hover:bg-danger-bg" onClick={()=>setDeleteNote(n)}><Trash2 className="size-3.5"/></button>
                  </span>
                </div>
                <span className="mt-0.5 block text-[11px] text-ink-400">{n.date} · {text('Preview','প্রিভিউ')}</span>
              </li>
          )}
            {notes.length === 0 && <li className="py-6 text-center text-sm text-ink-500">{text('No notes yet.','এখনো কোনো নোট নেই।')}</li>}
          </ul>
        </div>
      }

      <PartyOpeningDialog open={openingOpen} onClose={()=>setOpeningOpen(false)}
        party={party} relationship={relationship} existing={existingOpening} onSubmit={onSetOpening}/>
      <PartyStatementDialog open={statementOpen} onClose={onCloseStatement} party={party} statement={shownStatement}/>
      {(relationship==='Customer'||relationship==='Supplier')&&<>
        <PartyPaymentDialog open={paymentOpen} party={party} relationship={relationship} sources={sources}
          onClose={()=>setPaymentOpen(false)} onSubmit={onRecordPayment}/>
        <PartyCreditRefundDialog open={refundOpen} party={party} relationship={relationship} sources={sources}
          onClose={()=>setRefundOpen(false)} onSubmit={onRefundCredit}/>
      </>}
      {(['Owner','Lender','Borrower'] as PartyRole[]).includes(relationship)&&
        <PartyFinanceDialog open={financeOpen} party={party} relationship={relationship as FinanceRole}
          onClose={()=>setFinanceOpen(false)} onSubmit={onRecordFinance}/>}
      <PartyTransactionDialog row={editorRow} mode={editorMode}
        source={sources.find(item=>item.id===editorRow?.sourceId)??null}
        onClose={()=>setEditorRow(null)} onEdit={onEditSourcePayment} onReverse={onReverseSource}/>
      <Dialog open={!!viewedRow} onOpenChange={open=>!open&&setViewedRow(null)}>
        <DialogContent role="dialog" aria-modal="true" aria-label={text("Party transaction details","পার্টির লেনদেনের তথ্য")} className="sm:max-w-md">
          <DialogHeader><DialogTitle>{text('Transaction details','লেনদেনের তথ্য')}</DialogTitle><DialogDescription>{text('Read-only source reference in the UI preview.','এটি প্রিভিউতে লেনদেনের মূল সূত্র। এখানে বদলানো যাবে না।')}</DialogDescription></DialogHeader>
          {viewedRow&&<div className="space-y-2 text-sm">
            <p><strong>{text('Source:','উৎস:')}</strong> {viewedRow.source}</p><p><strong>{text('Reference:','নম্বর:')}</strong> {viewedRow.reference??viewedRow.id}</p>
            <p><strong>{text('Date:','তারিখ:')}</strong> {viewedRow.date}</p><p><strong>{text('Details:','বিবরণ:')}</strong> {viewedRow.description}</p>
            <p><strong>{text('Debit:','ডেবিট:')}</strong> {taka(viewedRow.debit)} · <strong>{text('Credit:','ক্রেডিট:')}</strong> {taka(viewedRow.credit)}</p>
          </div>}
          <div className="flex justify-end"><Button onClick={()=>setViewedRow(null)} >{text('Close','বন্ধ করুন')}</Button></div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editingNote} onOpenChange={(open)=>!open&&setEditingNote(null)}>
        <DialogContent role="dialog" aria-modal="true" aria-label={text("Edit party note","পার্টির নোট বদলান")} className="sm:max-w-md">
          <DialogHeader><DialogTitle>{text('Edit note','নোট বদলান')}</DialogTitle><DialogDescription>{text("Updates this party's preview note only.",'এখানে শুধু প্রিভিউর নোট বদলাবে।')}</DialogDescription></DialogHeader>
          <Input aria-label={text("Edit note","নোট বদলান")} value={editText} onChange={event=>setEditText(event.target.value)}/>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setEditingNote(null)} >{text('Cancel','বাতিল')}</Button><Button onClick={()=>{if(editingNote&&editText.trim()){onEditNote(editingNote.id,editText.trim());setEditingNote(null);toast.success(text('Note updated','নোট বদলানো হয়েছে'));}}} >{text('Save note','নোট রাখুন')}</Button></div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteNote} onOpenChange={(open)=>!open&&setDeleteNote(null)}>
        <DialogContent role="dialog" aria-modal="true" aria-label={text("Delete party note","পার্টির নোট মুছুন")} className="sm:max-w-md">
          <DialogHeader><DialogTitle>{text('Delete note?','নোট মুছবেন?')}</DialogTitle><DialogDescription>{text('This removes the note from the active preview and preserves an audit entry.','প্রিভিউতে নোটটি মুছে যাবে, তবে পরিবর্তনের ইতিহাস রাখা হবে।')}</DialogDescription></DialogHeader>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleteNote(null)} >{text('Keep note','নোট রাখুন')}</Button><Button onClick={()=>{if(deleteNote){onDeleteNote(deleteNote.id);setDeleteNote(null);toast.success(text('Note deleted','নোট মুছে গেছে'));}}} >{text('Confirm delete','নিশ্চিত মুছুন')}</Button></div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!attachment} onOpenChange={(o) => !o && setAttachment(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Paperclip className="size-4" /> {attachment?.attachment?.name}</DialogTitle>
            <DialogDescription>{attachment?.ref} · {attachment?.date} · {taka(attachment?.debit || attachment?.credit || 0)}</DialogDescription>
          </DialogHeader>
          <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-lg bg-ink-50">
            {attachment?.attachment?.url ?
            <img src={attachment.attachment.url} alt={`${text('Attachment','ফাইল')} ${attachment.attachment.name}`} className="max-h-[60vh] w-full object-contain" /> :

            <div className="py-12 text-center text-sm text-ink-500">
                <FileText className="mx-auto mb-2 size-8 text-helper" />
                {text('Preview not available','প্রিভিউ দেখা যাচ্ছে না')} · {formatNumber(84)} KB
              </div>
            }
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}
