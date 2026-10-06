import React from 'react';
import { Search } from 'lucide-react';
import { PartyAvatar } from '../PartyAvatar';
import { RoleBadge } from './RoleBadge';
import { partyRoles } from '../../data/parties';
import type { Party, PartyRole } from '../../types/erp';
import { taka } from '../../utils/currency';

type PartyDirectoryProps = {
  parties: Party[];
  selectedId: string;
  onSelect: (id: string) => void;
  role: PartyRole | 'All';
  onRole: (r: PartyRole | 'All') => void;
  query: string;
  onQuery: (q: string) => void;
};

export function PartyDirectory({ parties, selectedId, onSelect, role, onRole, query, onQuery }: PartyDirectoryProps) {
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-ink-100 bg-white shadow-card">
      <div className="space-y-2 border-b border-ink-100 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search name or phone…"
            aria-label="Search parties"
            className="h-8 w-full rounded-md border border-ink-100 pl-8 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
          
        </div>
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filter by role">
          {(['All', ...partyRoles] as (PartyRole | 'All')[]).map((r) =>
          <button
            key={r}
            role="tab"
            aria-selected={role === r}
            onClick={() => onRole(r)}
            className={`h-6 rounded-md px-2 text-[11.5px] font-medium transition-colors ${
            role === r ? 'bg-ink text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'}`
            }>
            
              {r}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink-400">
        <span>{parties.length} parties</span>
        <span>Balance</span>
      </div>

      <ul className="max-h-[calc(100vh-290px)] min-h-[320px] flex-1 overflow-auto scrollbar-thin" role="listbox" aria-label="Parties">
        {parties.map((p) => {
          const active = p.id === selectedId;
          return (
            <li key={p.id} role="option" aria-selected={active}>
              <button
                onClick={() => onSelect(p.id)}
                className={`flex w-full items-center gap-2.5 border-l-2 px-3 py-2.5 text-left transition-colors ${
                active ? 'border-teal-600 bg-teal-50/60' : 'border-transparent hover:bg-ink-50'}`
                }>
                
                <PartyAvatar name={p.name} color={p.avatarColor} image={p.image} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{p.name}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    {p.roles.map((r) =>
                    <RoleBadge key={r} role={r} />
                    )}
                    <span className="truncate text-[11px] text-ink-400">· {p.lastActivity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[13px] font-semibold tabular-nums ${p.balance > 0 ? 'text-teal-700' : p.balance < 0 ? 'text-danger' : 'text-ink-400'}`}>
                    {p.balance === 0 ? '৳0' : taka(Math.abs(p.balance))}
                  </p>
                  <p className="text-[10.5px] text-ink-400">{p.balance > 0 ? 'Receivable' : p.balance < 0 ? 'Payable' : 'Settled'}</p>
                </div>
              </button>
            </li>);

        })}
        {parties.length === 0 && <li className="px-3 py-10 text-center text-sm text-ink-500">No parties found.</li>}
      </ul>
    </div>);

}