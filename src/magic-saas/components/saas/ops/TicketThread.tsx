import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Textarea } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { fmtDateTime } from '../../../utils/saas';
import type { Ticket } from '../../../types/saas';

/** Conversation with public replies and internal notes kept visibly apart. */
export function TicketThread({ ticket, onSent }: { ticket: Ticket; onSent?: () => void }) {
  const saas = useSaas();
  const [kind, setKind] = useState<'public' | 'internal'>('public');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const canReply = saas.canFor('tickets.edit', ticket.tenantId) && ticket.status !== 'Resolved';

  return (
    <div className="space-y-3">
      <ol className="space-y-2" aria-label="Conversation">
        {ticket.replies.map((r) => (
          <li key={r.id} className={`rounded-lg border px-3 py-2 text-[13px] ${r.kind === 'internal' ? 'border-warning/30 bg-warning-bg' : r.kind === 'owner' ? 'border-ink-100 bg-ink-50' : 'border-teal-200 bg-teal-50'}`}>
            <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-500">
              {r.kind === 'internal' && <Lock className="size-3 text-warning" aria-hidden="true" />}
              <span className="font-medium text-ink-700">{r.by}</span>
              <span>· {r.kind === 'owner' ? 'Owner' : r.kind === 'internal' ? 'Internal note — owner can’t see' : 'Reply to owner'}</span>
              <span>· {fmtDateTime(r.at)}</span>
            </p>
            <p className="mt-0.5 whitespace-pre-wrap font-bn text-ink">{r.text}</p>
          </li>
        ))}
      </ol>
      {canReply ? (
        <div className="rounded-lg border border-ink-100 p-2">
          <div role="tablist" aria-label="Message type" className="mb-2 flex gap-1">
            {(['public', 'internal'] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={`rounded-md px-2.5 py-1 text-xs font-medium ${kind === k ? (k === 'public' ? 'bg-teal-50 text-teal-800' : 'bg-warning-bg text-warning') : 'text-ink-500 hover:bg-ink-50'}`}>
                {k === 'public' ? 'Reply to owner' : 'Internal note'}
              </button>
            ))}
          </div>
          <Textarea value={text} onChange={setText} placeholder={kind === 'public' ? 'Write a reply in simple words…' : 'Only HisabIQ staff will see this'} />
          <div className="mt-2 flex items-center justify-between gap-2">
            {error ? <span role="alert" className="text-xs text-danger">{error}</span> : <span className="text-[11px] text-ink-500">{kind === 'public' ? 'Sending a reply marks the ticket “Waiting”.' : 'Notes don’t change the status.'}</span>}
            <Button kind="primary" onClick={() => { const r = saas.replyTicket(ticket.id, kind, text); if (!r.ok) return setError(r.message); toast.success(r.message); setText(''); setError(''); onSent?.(); }}>{kind === 'public' ? 'Send reply' : 'Save note'}</Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-ink-500">{ticket.status === 'Resolved' ? 'Resolved. Reopen to reply.' : 'View only — you can’t reply to tickets for this business.'}</p>
      )}
    </div>
  );
}
