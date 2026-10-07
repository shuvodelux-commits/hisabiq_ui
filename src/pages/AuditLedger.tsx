import React from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';

export function AuditLedger() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Audit Ledger"
        titleBn="হিসাব যাচাই"
        description="Review who posted a transaction, what changed, and safely correct posted records."
      />
      <div className="rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex items-center gap-2 border-b border-ink-100 p-3">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <Input className="pl-8" placeholder="Search invoice, voucher, party or reference" />
          </div>
        </div>
        <div className="flex flex-col items-center p-8 text-center">
          <span className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700"><ShieldCheck className="size-4" /></span>
          <p className="mt-3 text-sm font-medium text-ink">Source-aware audit workspace</p>
          <p className="mt-1 font-bn text-xs text-ink-400">কোন লেনদেন কে করেছেন, কী বদলেছে এবং কেন বদলেছে—সব এখানে দেখা যাবে</p>
        </div>
      </div>
    </div>
  );
}
