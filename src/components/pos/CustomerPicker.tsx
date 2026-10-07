import React, { useState } from 'react';
import { ChevronDown, UserRound, X } from 'lucide-react';
import { FloatingPanel } from '../layout/FloatingPanel';
import { PartyAvatar } from '../PartyAvatar';
import { parties } from '../../data/parties';
import { taka } from '../../utils/currency';
import type { Party } from '../../types/erp';

type CustomerPickerProps = {
  value: Party | null;
  onChange: (p: Party | null) => void;
};

export function CustomerPicker({ value, onChange }: CustomerPickerProps) {
  const [q, setQ] = useState('');
  const customers = parties.filter((p) => {
    if (!p.roles.includes('Customer') && !p.roles.includes('Borrower')) return false;
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return p.name.toLowerCase().includes(needle) || p.phone.toLowerCase().includes(needle);
  });

  return (
    <FloatingPanel
      label="Choose customer"
      align="left"
      width={320}
      trigger={({ toggle, open }) =>
      <div className="flex items-center gap-1">
          <button
          onClick={toggle}
          aria-expanded={open}
          className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 text-left hover:border-ink-200">
          
            {value ?
          <PartyAvatar name={value.name} color={value.avatarColor} size={26} /> :

          <span className="flex size-[26px] items-center justify-center rounded-full bg-ink-50 text-ink-400">
                <UserRound className="size-3.5" />
              </span>
          }
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13px] font-medium text-ink">{value ? value.name : 'Walk-in customer'}</span>
              <span className="block truncate text-[11px] text-ink-500">
                {value ?
              `${value.phone} · Prev. due ${taka(Math.max(0, value.balance))}` :
              'Cash sale · customer optional'}
              </span>
            </span>
            <ChevronDown className="size-4 text-ink-400" />
          </button>
          {value &&
        <button onClick={() => onChange(null)} aria-label="Clear customer" className="flex size-10 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink">
              <X className="size-4" />
            </button>
        }
        </div>
      }>
      
      {(close) =>
      <div>
          <div className="border-b border-border p-2">
            <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customer or phone…"
            className="h-9 w-full rounded-md border border-border px-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
          
          </div>
          <ul className="max-h-64 overflow-auto p-1">
            <li>
              <button
              onClick={() => {
                onChange(null);
                close();
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-ink-50">
              
                <span className="flex size-7 items-center justify-center rounded-full bg-ink-50 text-ink-400">
                  <UserRound className="size-3.5" />
                </span>
                <span className="text-[13px] text-ink">Walk-in customer</span>
              </button>
            </li>
            {customers.map((c) =>
          <li key={c.id}>
                <button
              onClick={() => {
                onChange(c);
                close();
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-ink-50">
              
                  <PartyAvatar name={c.name} color={c.avatarColor} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{c.name}</span>
                    <span className="block text-[11px] text-ink-500">{c.phone}</span>
                  </span>
                  {c.balance > 0 && <span className="text-xs tabular-nums text-danger">{taka(c.balance)}</span>}
                </button>
              </li>
          )}
          </ul>
        </div>
      }
    </FloatingPanel>);

}
