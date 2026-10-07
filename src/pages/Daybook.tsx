import React from 'react';
import { CalendarRange, Search } from 'lucide-react';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { useUserPreferences } from '../contexts/UserPreferencesContext';

export function Daybook() {
  const { entryDateView, terminologyMode } = useUserPreferences();

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Daybook"
        titleBn="দৈনিক লেনদেন"
        description="Find and manage all business transactions from one place."
      />
      <div className="rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex flex-col gap-2 border-b border-ink-100 p-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <Input className="pl-8" placeholder="Search transaction, party, reference or amount" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
            <CalendarRange className="size-3.5" />
            {entryDateView === 'transaction' ? 'Transaction Date' : 'Created Date'}
          </div>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-ink">Unified transaction view</p>
          <p className="mt-1 font-bn text-xs text-ink-400">
            {terminologyMode === 'simple' ? 'সব ব্যবসার লেনদেন এক জায়গায় দেখুন' : 'হিসাবের সব পোস্টিং এক জায়গায় দেখুন'}
          </p>
        </div>
      </div>
    </div>
  );
}
