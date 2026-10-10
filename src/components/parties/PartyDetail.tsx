import React, { useState } from 'react';
import { FileText, HandCoins, MapPin, MessageSquare, Paperclip, Phone, Plus, Receipt, Send, StickyNote, Pencil, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Input } from '../Input';
import { FormSelect } from '../FormSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../Dialog';
import { PartyAvatar } from '../PartyAvatar';
import { RoleBadge } from './RoleBadge';
import { LedgerTable } from './LedgerTable';
import { PartyLedgerToolbar } from './PartyLedgerToolbar';
import { PartyStatementDialog } from './PartyStatementDialog';
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
  party, entries, relationship, onRoleChange, onEditParty, onAddNote, onEditNote, onDeleteNote,
  statement, balanceSummary, visibleRows, range, onRange, kind, onKind, ledgerQuery, onLedgerQuery,
  pageSize, onPageSize, onResetLedger, onStatement, page, pages, onPage, actionsForRow,
  onLedgerAction, statementOpen, onCloseStatement, sources, onRecordPayment, onRefundCredit,
  onEditSourcePayment, onReverseSource, onRecordFinance, onSetOpening,
  vendorProfile,onOpenVendorWork
}: PartyDetailProps) {
  const [tab, setTab] = useState<Tab>('ledger');
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
    [r.reference??'',r.description].some(x=>x.toLowerCase().includes(ledgerQuery.toLowerCase()))):[];
  const shownRows=vendorProfile?shownFiltered.slice(Math.max(0,(page-1)*pageSize),page*pageSize):visibleRows;
  const shownPages=vendorProfile?Math.max(1,Math.ceil(shownFiltered.length/pageSize)):pages;
  const shownActions=(r:PartyLedgerRow)=>vendorProfile?
   [{action:'view' as const,enabled:true},{action:'source' as const,enabled:true}]:actionsForRow(r);

  const tabs: {id: Tab;label: string;count?: number;}[] = [
  { id: 'ledger', label: 'Ledger' },
  { id: 'invoices', label:vendorProfile?'Bills & Memos':'Invoices', count:vendorProfile?vendorProfile.documents.length:invoices.length },
  { id: 'payments', label: 'Payments', count:vendorProfile?vendorProfile.payments.length:payments.length },
  { id: 'notes', label: 'Notes', count: notes.length },
  { id: 'attachments', label: 'Attachments', count: attachments.length }];


  const currentBalance=balanceSummary.netBalance;
  const isReceivable = currentBalance > 0;
  const payable = ['Supplier','Lender','Owner','Payee','Vendor'].includes(relationship);
  const balanceLabel = relationship==='Owner'?'Owner capital · মূলধন':
    relationship==='Lender'?'Lender loan · ঋণ':relationship==='Borrower'?'Borrower balance · পাওনা':
    relationship==='Supplier'?'Supplier payable · দেনা':
    relationship==='Customer'?'Customer balance · কাস্টমার খাতা':relationship+' balance';

  return (
    <div className="min-w-0 rounded-xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-start gap-4 border-b border-border p-4">
        <PartyAvatar name={party.name} color={party.avatarColor} image={party.image} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-ink">{party.name}</h2>
            {party.nameBn && <span className="font-bn text-sm text-ink-500">{party.nameBn}</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={onEditParty}><Pencil className="size-3"/> Edit party</Button>
            {party.roles.length>1 && <div className="min-w-32"><FormSelect title="Relationship" value={relationship} options={party.roles} onChange={event=>onRoleChange(event.target.value as PartyRole)}/></div>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
            <span className="flex gap-1">{party.roles.map((r) => <RoleBadge key={r} role={r} />)}</span>
            <span className="flex items-center gap-1"><Phone className="size-3" /> {party.phone}</span>
            <span className="flex items-center gap-1"><MapPin className="size-3" /> {party.area}</span>
            <span>Last activity {party.lastActivity}</span>
          </div>
        </div>
        {vendorProfile?<div className="flex flex-wrap gap-2">
         <div className="rounded-xl bg-danger-bg px-3 py-2 text-right">
          <p className="text-[11px] text-danger">You owe · দেনা</p>
          <p className="text-xl font-semibold text-danger">{taka(vendorProfile.summary.takenDuePaisa/100)}</p></div>
         <div className="rounded-xl bg-ink-50 px-3 py-2 text-right">
          <p className="text-[11px] text-ink-600">Vendor owes · পাওনা</p>
          <p className="text-xl font-semibold text-ink">{taka(vendorProfile.summary.givenDuePaisa/100)}</p>
          {vendorProfile.summary.priceNotSetBaseQty>0&&<p className="text-[11px] text-warning">
           {vendorProfile.summary.priceNotSetBaseQty} units · Price not set</p>}
         </div></div>:<>
        <div className={`rounded-xl px-4 py-2.5 text-right ${isReceivable ? 'bg-teal-50' : currentBalance < 0 ? 'bg-danger-bg' : 'bg-ink-50'}`}>
          <p className={`text-[11px] font-medium ${isReceivable ? 'text-teal-800' : currentBalance < 0 ? 'text-danger' : 'text-ink-500'}`}>
            {balanceLabel}
          </p>
          <p className={`text-2xl font-semibold tabular-nums tracking-tight ${isReceivable ? 'text-teal-800' : currentBalance < 0 ? 'text-danger' : 'text-ink'}`}>
            {taka(Math.abs(currentBalance))}
          </p>
        </div>
        </>}
      </div>

      {vendorProfile?<div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <Button size="sm" onClick={()=>onOpenVendorWork?.('payments')}>Pay Vendor · টাকা দিন</Button>
        <Button size="sm" variant="outline" onClick={()=>onOpenVendorWork?.('payments')}>Receive Money · টাকা নিন</Button>
        <Button size="sm" variant="outline" onClick={()=>onOpenVendorWork?.('ledger')}>
         <BookOpen className="size-4"/> Opening Balance</Button>
        <Button size="sm" variant="outline" onClick={()=>onOpenVendorWork?.('taken')}>Open Vendor Work</Button>
        <Button size="sm" variant="ghost" onClick={()=>setTab('notes')}><StickyNote className="size-4"/> Add Note</Button>
       </div>:<>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <Button size="sm" disabled={relationship!=='Customer'&&relationship!=='Supplier'}
          title={relationship==='Customer'||relationship==='Supplier'?'Record payment in browser preview':'Finance-role payments require the separate finance workflow'}
          onClick={()=>setPaymentOpen(true)}>
          <HandCoins className="size-4" /> {payable ? 'Make payment' : 'Receive payment'}
        </Button>
        {(relationship==='Customer'||relationship==='Supplier')&&
          <Button size="sm" variant="outline" disabled={balanceSummary.refundableCredit<=0}
            title={balanceSummary.refundableCredit>0?'Refund verified credit as of the selected date':'No verified refundable credit yet'}
            onClick={()=>setRefundOpen(true)}>
            Refund credit
          </Button>}
        <Button size="sm" variant="outline" onClick={()=>setOpeningOpen(true)}
          aria-label={existingOpening?'Edit opening balance':'Set opening balance'}>
          <BookOpen className="size-4"/> {existingOpening?'Edit opening':'Opening balance'}
        </Button>
        <Button size="sm" variant="outline" disabled title="Open a new invoice from the POS until the Party source action is connected">
          <Plus className="size-4" /> New invoice
        </Button>
        <Button size="sm" variant="outline" disabled title="SMS service is not connected to the UI preview">
          <Send className="size-4" /> Send statement
        </Button>
        {(['Owner','Lender','Borrower'] as PartyRole[]).includes(relationship)&&
          <Button size="sm" variant="outline" aria-label={`Record ${relationship.toLowerCase()} finance`}
            onClick={()=>setFinanceOpen(true)}>
            <HandCoins className="size-4"/> {relationship==='Owner'?'Capital / withdrawal':
              relationship==='Lender'?'Borrow / repay':'Lend / receive'}
          </Button>}
        <Button size="sm" variant="ghost" onClick={() => setTab('notes')}>
          <StickyNote className="size-4" /> Add note
        </Button>
      </div>
       </>}

      <div className="flex gap-1 border-b border-border px-3" role="tablist">
        {tabs.map((t) =>
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          onClick={() => setTab(t.id)}
          className={`flex items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-medium transition-colors ${
          tab === t.id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'}`
          }>
          
            {t.label}
            {t.count !== undefined &&
          <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{t.count}</span>
          }
          </button>
        )}
      </div>

      {entries.length === 0 && tab !== 'notes' && tab !== 'ledger' ?
      <div className="px-4 py-14 text-center">
          <Receipt className="mx-auto size-8 text-helper" />
          <p className="mt-2 font-medium text-ink">No transactions in this period</p>
          <p className="mt-1 text-sm text-ink-500">Invoices, payments and notes for {party.name} will appear here.</p>
        </div> :

      <div>
          {tab === 'ledger' && <>
            <PartyLedgerToolbar range={range} onRange={onRange} kind={kind} onKind={onKind}
              query={ledgerQuery} onQuery={onLedgerQuery} pageSize={pageSize} onPageSize={onPageSize}
              onStatement={onStatement} onReset={onResetLedger}/>
            <LedgerTable statement={statement} visibleRows={visibleRows} actionsForRow={actionsForRow}
              onAction={doRowAction} onOpenAttachment={()=>toast('No document available in preview')}/>
            <div className="flex items-center justify-between gap-2 px-4 py-2 text-xs text-ink-500">
              <span>Page {page} of {pages} · {statement.rows.length} dated transactions</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page<=1} onClick={()=>onPage(page-1)}>Previous</Button>
                <Button size="sm" variant="outline" disabled={page>=pages} onClick={()=>onPage(page+1)}>Next</Button>
              </div>
            </div>
          </>}
          {(tab === 'invoices' || tab === 'payments') &&
        <ul className="divide-y divide-border">
              {(tab === 'invoices' ? invoices : payments).map((e) =>
          <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-[13px]">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                    {tab === 'invoices' ? <FileText className="size-4" /> : <HandCoins className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{e.ref ?? 'Entry'} <span className="font-normal text-ink-400">· {e.date}</span></p>
                    <p className="truncate text-xs text-ink-500">{e.description}</p>
                  </div>
                  <span className="font-semibold tabular-nums text-ink">{taka(e.debit || e.credit)}</span>
                </li>
          )}
              {(tab === 'invoices' ? invoices : payments).length === 0 &&
          <li className="px-4 py-10 text-center text-sm text-ink-500">Nothing here yet.</li>
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
              {attachments.length === 0 && <p className="col-span-full py-8 text-center text-sm text-ink-500">No attachments.</p>}
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
            toast.success('Note added');
          }}>
          
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write a note… e.g. Promised payment on Sunday" aria-label="New note" />
            <Button type="submit" size="sm" className="h-9">
              <MessageSquare className="size-4" /> Add note
            </Button>
          </form>
          <ul className="space-y-2">
            {notes.map((n) =>
          <li key={n.id} className="rounded-lg border border-warning/20 bg-warning-bg/50 px-3 py-2 text-[13px] text-ink-700">
                <div className="flex items-start justify-between gap-2">
                  <span className="break-words">{n.description}</span>
                  <span className="flex shrink-0 gap-1">
                    <button type="button" aria-label={`Edit note ${n.description}`} className="rounded p-1 text-ink-500 hover:bg-ink-100" onClick={()=>{setEditingNote(n);setEditText(n.description);}}><Pencil className="size-3.5"/></button>
                    <button type="button" aria-label={`Delete note ${n.description}`} className="rounded p-1 text-danger hover:bg-danger-bg" onClick={()=>setDeleteNote(n)}><Trash2 className="size-3.5"/></button>
                  </span>
                </div>
                <span className="mt-0.5 block text-[11px] text-ink-400">{n.date} · Preview</span>
              </li>
          )}
            {notes.length === 0 && <li className="py-6 text-center text-sm text-ink-500">No notes yet.</li>}
          </ul>
        </div>
      }

      <PartyOpeningDialog open={openingOpen} onClose={()=>setOpeningOpen(false)}
        party={party} relationship={relationship} existing={existingOpening} onSubmit={onSetOpening}/>
      <PartyStatementDialog open={statementOpen} onClose={onCloseStatement} party={party} statement={statement}/>
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
        <DialogContent role="dialog" aria-modal="true" aria-label="Party transaction details" className="sm:max-w-md">
          <DialogHeader><DialogTitle>Transaction details</DialogTitle><DialogDescription>Read-only source reference in the UI preview.</DialogDescription></DialogHeader>
          {viewedRow&&<div className="space-y-2 text-sm">
            <p><strong>Source:</strong> {viewedRow.source}</p><p><strong>Reference:</strong> {viewedRow.reference??viewedRow.id}</p>
            <p><strong>Date:</strong> {viewedRow.date}</p><p><strong>Details:</strong> {viewedRow.description}</p>
            <p><strong>Debit:</strong> {taka(viewedRow.debit)} · <strong>Credit:</strong> {taka(viewedRow.credit)}</p>
          </div>}
          <div className="flex justify-end"><Button onClick={()=>setViewedRow(null)}>Close</Button></div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editingNote} onOpenChange={(open)=>!open&&setEditingNote(null)}>
        <DialogContent role="dialog" aria-modal="true" aria-label="Edit party note" className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit note</DialogTitle><DialogDescription>Updates this party's preview note only.</DialogDescription></DialogHeader>
          <Input aria-label="Edit note" value={editText} onChange={event=>setEditText(event.target.value)}/>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setEditingNote(null)}>Cancel</Button><Button onClick={()=>{if(editingNote&&editText.trim()){onEditNote(editingNote.id,editText.trim());setEditingNote(null);toast.success('Note updated');}}}>Save note</Button></div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteNote} onOpenChange={(open)=>!open&&setDeleteNote(null)}>
        <DialogContent role="dialog" aria-modal="true" aria-label="Delete party note" className="sm:max-w-md">
          <DialogHeader><DialogTitle>Delete note?</DialogTitle><DialogDescription>This removes the note from the active preview and preserves an audit entry.</DialogDescription></DialogHeader>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleteNote(null)}>Keep note</Button><Button onClick={()=>{if(deleteNote){onDeleteNote(deleteNote.id);setDeleteNote(null);toast.success('Note deleted');}}}>Confirm delete</Button></div>
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
            <img src={attachment.attachment.url} alt={`Attachment ${attachment.attachment.name}`} className="max-h-[60vh] w-full object-contain" /> :

            <div className="py-12 text-center text-sm text-ink-500">
                <FileText className="mx-auto mb-2 size-8 text-helper" />
                Preview not available · {formatNumber(84)} KB
              </div>
            }
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}
