import React from 'react';
import { BookOpen, FileText, Scale } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { useUserPreferences } from '../contexts/UserPreferencesContext';

export function Accounts() {
  const { terminologyMode } = useUserPreferences();
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Accounts"
        titleBn="হিসাব"
        description="Vouchers, ledgers and financial statements without mixing daily money operations."
      />
      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['Vouchers', 'টাকা পাওয়া, দেওয়া ও হিসাব ঠিক করার এন্ট্রি', FileText],
          ['Ledger', 'এই হিসাবের সব লেনদেন', BookOpen],
          ['Trial Balance', 'সব হিসাব ঠিকমতো মিলছে কি না', Scale]
        ].map(([label, helper, Icon]) => (
          <div key={String(label)} className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
            {React.createElement(Icon as React.ElementType, { className: 'size-4 text-teal-700' })}
            <p className="mt-3 text-sm font-semibold text-ink">{label}</p>
            <p className="mt-1 font-bn text-[11px] text-ink-400">{helper}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-ink-400">Terminology: {terminologyMode === 'simple' ? 'Simple' : 'Accounting'}</p>
    </div>
  );
}
