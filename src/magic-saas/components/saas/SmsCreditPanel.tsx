import React, { useState } from 'react';
import { Badge, EmptyRow, td, th } from './SaasBits';
import { SettingCard } from '../settings/SettingCard';
import { useSaas } from '../../contexts/SaasContext';
import { fmtDate, fmtDateTime, segmentInfo } from '../../utils/saas';
import { formatNumber } from '../../utils/currency';
import type { SmsMoveKind, Tenant } from '../../types/saas';

const moveLabel: Record<SmsMoveKind, string> = { PURCHASE: 'Purchase', BONUS: 'Offer bonus', GRANT: 'Plan / grant', RESERVE: 'Reserved', RELEASE: 'Released', SENT: 'Sent', EXPIRED: 'Expired', REFUND: 'Refund reversal' };
const deliveryTone = { Queued: 'neutral', Sent: 'info', Delivered: 'success', Failed: 'danger' } as const;

/** SMS credits: balance, Party Ledger-style movements, cost preview and delivery status. */
export function SmsCreditPanel({ tenant, onBuy }: { tenant: Tenant; onBuy: () => void }) {
  const saas = useSaas();
  const [all, setAll] = useState(false);
  const [text, setText] = useState('প্রিয় গ্রাহক, আপনার বকেয়া ৳৪,৪৫০। ধন্যবাদ।');
  const [recipients, setRecipients] = useState('40');
  const moves = saas.state.smsMoves.filter((m) => m.tenantId === tenant.id).sort((a, b) => b.at.localeCompare(a.at));
  const msgs = saas.state.smsMessages.filter((m) => m.tenantId === tenant.id).slice(0, 4);
  const seg = segmentInfo(text);
  const n = Math.max(0, Math.floor(Number(recipients) || 0));
  const needed = seg.segments * n;
  const nextExpiry = moves.filter((m) => m.credits > 0 && m.expiresAt && m.expiresAt >= '2026-10-25').map((m) => m.expiresAt!).sort()[0];

  return (
    <SettingCard title="SMS credits" titleBn="এসএমএস ক্রেডিট" bodyClassName="" actions={<button type="button" onClick={onBuy} className="text-xs font-medium text-teal-700 hover:underline">Buy credits</button>}>
      <dl className="grid grid-cols-3 gap-3 border-b border-ink-100 px-4 py-2.5 text-[13px]">
        <div><dt className="text-[11px] text-ink-500">Available</dt><dd className="font-semibold tabular-nums">{formatNumber(tenant.smsAvailable)}</dd></div>
        <div><dt className="text-[11px] text-ink-500">Reserved</dt><dd className="font-semibold tabular-nums">{formatNumber(tenant.smsReserved)}</dd><dd className="text-[11px] text-ink-500">Scheduled sends</dd></div>
        <div><dt className="text-[11px] text-ink-500">Next expiry</dt><dd className="font-semibold">{nextExpiry ? fmtDate(nextExpiry) : '—'}</dd><dd className="text-[11px] text-ink-500">Oldest credits used first</dd></div>
      </dl>

      <div className="overflow-x-auto">
        <table data-erp-table className="w-full text-[13px]">
          <thead><tr className="border-b border-ink-100"><th className={th}>Date</th><th className={th}>Movement</th><th className={`${th} text-right`}>Credits</th><th className={`${th} text-right`}>Balance</th></tr></thead>
          <tbody>
            {moves.length === 0 && <EmptyRow cols={4} text="No credit movements yet." />}
            {(all ? moves : moves.slice(0, 5)).map((m) => (
              <tr key={m.id} className="border-b border-ink-100 last:border-0">
                <td className={`${td} whitespace-nowrap text-ink-500`}>{fmtDateTime(m.at)}</td>
                <td className={td}>
                  <span className="font-medium">{moveLabel[m.kind]}</span> <span className="text-ink-500">· {m.ref}</span>
                  <span className="block text-[11px] text-ink-500">{m.note}{m.expiresAt ? ` · expires ${fmtDate(m.expiresAt)}` : ''}</span>
                </td>
                <td className={`${td} text-right font-medium tabular-nums ${m.credits > 0 ? 'text-success' : 'text-ink'}`}>{m.credits > 0 ? '+' : '−'}{formatNumber(Math.abs(m.credits))}</td>
                <td className={`${td} text-right tabular-nums`}>{formatNumber(m.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {moves.length > 5 && <button type="button" onClick={() => setAll((v) => !v)} className="w-full border-t border-ink-100 py-2 text-xs font-medium text-teal-700 hover:bg-ink-50">{all ? 'Show recent only' : `Show all ${moves.length}`}</button>}

      <div className="grid gap-4 border-t border-ink-100 p-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium text-ink-500">Cost preview <span className="font-bn text-[11px] font-normal text-ink-400">· খরচ দেখুন</span></p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="Message text" className="w-full rounded-lg border border-ink-200 px-3 py-2 text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600/40" />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-600">
            <span>{seg.encoding === 'Unicode' ? 'Bangla/Unicode' : 'English (GSM)'} · {seg.chars} chars · <b className="font-medium text-ink">{seg.segments} segment{seg.segments !== 1 ? 's' : ''}</b> ({seg.perSegment}/segment)</span>
            <label className="flex items-center gap-1.5">× <input type="number" min={0} value={recipients} onChange={(e) => setRecipients(e.target.value)} aria-label="Recipients" className="ref-control w-20 rounded-lg border border-ink-200 px-2 text-right text-[13px]" /> recipients</label>
          </div>
          <p className={`text-xs ${needed > tenant.smsAvailable ? 'text-danger' : 'text-ink-600'}`}>
            Needs <b className="font-medium tabular-nums">{formatNumber(needed)}</b> credits — {needed > tenant.smsAvailable ? `${formatNumber(needed - tenant.smsAvailable)} short. Credits are reserved when scheduled.` : 'enough credits.'}
          </p>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-ink-500">Recent delivery</p>
          <ul className="divide-y divide-ink-100 rounded-lg border border-ink-100 text-[13px]">
            {msgs.length === 0 && <li className="px-3 py-3 text-xs text-ink-500">No messages sent.</li>}
            {msgs.map((m) => (
              <li key={m.id} className="flex items-start justify-between gap-2 px-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-ink">{m.to} · {m.segments} seg</span>
                  <span className="block truncate text-[11px] text-ink-500">{m.provider} · {fmtDateTime(m.at)}</span>
                </span>
                <Badge tone={deliveryTone[m.status]} dot>{m.status}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-ink-500">Message text is visible to authorized staff only.</p>
        </div>
      </div>
    </SettingCard>
  );
}
