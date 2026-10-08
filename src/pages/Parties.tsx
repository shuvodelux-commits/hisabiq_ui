import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { PartyDirectory } from '../components/parties/PartyDirectory';
import { PartyDetail } from '../components/parties/PartyDetail';
import { availableParties, availableLedgerEntries } from '../data/erpDemoStore';
import type { LedgerEntry, PartyRole } from '../types/erp';
import { taka } from '../utils/currency';

export function Parties() {
  const [params, setParams] = useSearchParams();
  const allParties = useMemo(availableParties, []);
  const selectedId = params.get('id') ?? 'c1';
  const [role, setRole] = useState<PartyRole | 'All'>('All');
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<LedgerEntry[]>(availableLedgerEntries);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allParties.filter(
      (p) => (role === 'All' || p.roles.includes(role)) && (p.name.toLowerCase().includes(q) || p.phone.includes(q))
    );
  }, [role, query, allParties]);

  const party = allParties.find((p) => p.id === selectedId) ?? allParties[0];
  const partyEntries = entries.filter((e) => e.partyId === party.id);

  const receivable = allParties.filter((p) => p.balance > 0).reduce((s, p) => s + p.balance, 0);
  const payable = allParties.filter((p) => p.balance < 0).reduce((s, p) => s - p.balance, 0);

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Parties & Ledger"
        titleBn="পার্টি ও খাতা"
        description={`Everyone you deal with, in one place · Receivable ${taka(receivable)} · Payable ${taka(payable)}`}
        actions={
        <>
            <Button variant="outline" size="sm" onClick={() => toast('Import from contacts or Excel')}>
              <Upload className="size-4" /> Import
            </Button>
            <Button size="sm" onClick={() => toast('New party form')}>
              <Plus className="size-4" /> Add party
            </Button>
          </>
        } />
      
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
        <PartyDirectory
          parties={filtered}
          selectedId={party.id}
          onSelect={(id) => setParams({ id })}
          role={role}
          onRole={setRole}
          query={query}
          onQuery={setQuery} />
        
        <PartyDetail
          key={party.id}
          party={party}
          entries={partyEntries}
          onAddNote={(text) =>
          setEntries((es) => [
          ...es,
          { id: `n${Date.now()}`, partyId: party.id, date: '01 Oct 2026', type: 'note', description: text, debit: 0, credit: 0 }]
          )
          } />
        
      </div>
    </div>);

}