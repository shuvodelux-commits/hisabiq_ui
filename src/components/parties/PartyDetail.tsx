import React, { useState } from 'react';
import { FileText, HandCoins, MapPin, MessageSquare, Paperclip, Phone, Plus, Receipt, Send, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Input } from '../Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../Dialog';
import { PartyAvatar } from '../PartyAvatar';
import { RoleBadge } from './RoleBadge';
import { LedgerTable } from './LedgerTable';
import type { LedgerEntry, Party } from '../../types/erp';
import { formatNumber, taka } from '../../utils/currency';

type Tab = 'ledger' | 'invoices' | 'payments' | 'notes' | 'attachments';

type PartyDetailProps = {
  party: Party;
  entries: LedgerEntry[];
  onAddNote: (text: string) => void;
};

export function PartyDetail({ party, entries, onAddNote }: PartyDetailProps) {
  const [tab, setTab] = useState<Tab>('ledger');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState<LedgerEntry | null>(null);

  const invoices = entries.filter((e) => e.type === 'invoice' || e.type === 'purchase');
  const payments = entries.filter((e) => e.type === 'payment' || e.type === 'return');
  const notes = entries.filter((e) => e.type === 'note');
  const attachments = entries.filter((e) => e.attachment);

  const tabs: {id: Tab;label: string;count?: number;}[] = [
  { id: 'ledger', label: 'Ledger' },
  { id: 'invoices', label: 'Invoices', count: invoices.length },
  { id: 'payments', label: 'Payments', count: payments.length },
  { id: 'notes', label: 'Notes', count: notes.length },
  { id: 'attachments', label: 'Attachments', count: attachments.length }];


  const isReceivable = party.balance > 0;

  return (
    <div className="min-w-0 rounded-xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-start gap-4 border-b border-border p-4">
        <PartyAvatar name={party.name} color={party.avatarColor} image={party.image} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-ink">{party.name}</h2>
            {party.nameBn && <span className="font-bn text-sm text-ink-500">{party.nameBn}</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
            <span className="flex gap-1">{party.roles.map((r) => <RoleBadge key={r} role={r} />)}</span>
            <span className="flex items-center gap-1"><Phone className="size-3" /> {party.phone}</span>
            <span className="flex items-center gap-1"><MapPin className="size-3" /> {party.area}</span>
            <span>Last activity {party.lastActivity}</span>
          </div>
        </div>
        <div className={`rounded-xl px-4 py-2.5 text-right ${isReceivable ? 'bg-teal-50' : party.balance < 0 ? 'bg-danger-bg' : 'bg-ink-50'}`}>
          <p className={`text-[11px] font-medium ${isReceivable ? 'text-teal-800' : party.balance < 0 ? 'text-danger' : 'text-ink-500'}`}>
            {isReceivable ? 'Receivable · পাবো' : party.balance < 0 ? 'Payable · দেবো' : 'Settled'}
          </p>
          <p className={`text-2xl font-semibold tabular-nums tracking-tight ${isReceivable ? 'text-teal-800' : party.balance < 0 ? 'text-danger' : 'text-ink'}`}>
            {taka(Math.abs(party.balance))}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <Button size="sm" onClick={() => toast.success(isReceivable ? 'Payment received' : 'Payment recorded')}>
          <HandCoins className="size-4" /> {isReceivable || party.balance === 0 ? 'Receive payment' : 'Make payment'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast('New invoice started')}>
          <Plus className="size-4" /> New invoice
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast.success('Statement sent by SMS', { description: party.phone })}>
          <Send className="size-4" /> Send statement
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setTab('notes')}>
          <StickyNote className="size-4" /> Add note
        </Button>
      </div>

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

      {entries.length === 0 && tab !== 'notes' ?
      <div className="px-4 py-14 text-center">
          <Receipt className="mx-auto size-8 text-helper" />
          <p className="mt-2 font-medium text-ink">No transactions in this period</p>
          <p className="mt-1 text-sm text-ink-500">Invoices, payments and notes for {party.name} will appear here.</p>
        </div> :

      <div>
          {tab === 'ledger' && <LedgerTable entries={entries} onOpenAttachment={setAttachment} />}
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
              <MessageSquare className="size-4" /> Add
            </Button>
          </form>
          <ul className="space-y-2">
            {notes.map((n) =>
          <li key={n.id} className="rounded-lg border border-warning/20 bg-warning-bg/50 px-3 py-2 text-[13px] text-ink-700">
                {n.description}
                <span className="mt-0.5 block text-[11px] text-ink-400">{n.date} · Anisur Rahman</span>
              </li>
          )}
            {notes.length === 0 && <li className="py-6 text-center text-sm text-ink-500">No notes yet.</li>}
          </ul>
        </div>
      }

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
