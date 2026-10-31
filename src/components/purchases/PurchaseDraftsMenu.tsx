import { useState } from 'react';
import { Copy, FileClock, Pencil, Search, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { FloatingPanel } from '../layout/FloatingPanel';
import { Input } from '../Input';
import { taka } from '../../utils/currency';
import type { PurchaseDraft } from '../../data/purchaseDraftsPreviewStore';

/** Compact, touch-friendly Purchase Drafts, following POS V2 Drafts styling. */
export function PurchaseDraftsMenu({ drafts, onResume, onDelete }: {
  drafts: readonly PurchaseDraft[];
  onResume: (draft: PurchaseDraft) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const filtered = drafts.filter(d =>
    [d.supplierName, d.referenceNo, d.id].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <FloatingPanel label="Purchase drafts · ক্রয়ের খসড়া" width={380}
      trigger={({ open, toggle }) => (
        <Button type="button" variant="outline" size="sm" data-purchase-drafts-trigger
          aria-expanded={open} className="h-10 rounded-full px-3 text-[13px]" onClick={toggle}>
          <Copy className="size-4" aria-hidden="true" />
          Drafts ({drafts.length})
        </Button>
      )}>
      {close => (
        <div data-purchase-drafts-menu className="max-w-full">
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-[13px] font-semibold text-ink">Purchase drafts <span className="font-bn font-normal text-ink-500">· ক্রয়ের খসড়া</span></p>
            <p className="text-[11px] text-ink-500">Saved in this preview session · No stock or money posted</p>
          </div>
          <div className="relative px-3 py-2">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input aria-label="Search purchase drafts" placeholder="Search supplier or draft" value={query}
              onChange={e => setQuery(e.target.value)} className="h-9 pl-8 text-[12px]" />
          </div>
          {filtered.length === 0
            ? <p className="px-3 py-6 text-center text-[12px] text-ink-500">No saved purchase drafts.</p>
            : <ul className="max-h-72 divide-y divide-border overflow-y-auto">
              {filtered.map(d => (
                <li key={d.id} className="px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <FileClock className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{d.supplierName || 'Supplier not selected'}</p>
                      <p className="text-[11px] text-ink-500">{d.lines.length} products · {d.date || 'No date'}</p>
                      <p className="text-[11px] text-ink-500">{d.referenceNo || d.id.slice(0,11)} · Saved {new Date(d.savedAt).toLocaleDateString('en-GB')}</p>
                    </div>
                    <span className="shrink-0 text-[13px] font-medium text-ink">{taka(d.total)}</span>
                  </div>
                  {deleteId === d.id ? (
                    <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                      <span className="mr-auto text-[11px] text-danger">Delete this draft?</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => setDeleteId(null)}>Cancel</Button>
                      <Button type="button" size="sm" className="bg-danger text-white hover:bg-danger/90"
                        onClick={() => { onDelete(d.id); setDeleteId(null); }}>Delete</Button>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setDeleteId(d.id)}>
                        <Trash2 className="size-3.5" aria-hidden="true"/> Delete
                      </Button>
                      <Button type="button" size="sm" onClick={() => { onResume(d); close(); }}>
                        <Pencil className="size-3.5" aria-hidden="true"/> Resume
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>}
        </div>
      )}
    </FloatingPanel>
  );
}
