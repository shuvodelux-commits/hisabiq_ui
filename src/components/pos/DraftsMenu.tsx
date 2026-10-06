import React from 'react';
import { FileClock, Save, Trash2 } from 'lucide-react';
import { FloatingPanel } from '../layout/FloatingPanel';
import { Button } from '../Button';
import type { SalesDraft } from '../../data/sales';
import { taka } from '../../utils/currency';

type DraftsMenuProps = {
  drafts: SalesDraft[];
  canSave: boolean;
  onSave: () => void;
  onResume: (d: SalesDraft) => void;
  onDelete: (id: string) => void;
};

export function DraftsMenu({ drafts, canSave, onSave, onResume, onDelete }: DraftsMenuProps) {
  return (
    <FloatingPanel
      label="Drafts"
      width={320}
      trigger={({ toggle, open }) =>
      <Button variant="outline" size="sm" onClick={toggle} aria-expanded={open}>
          <FileClock className="size-4" /> Drafts
          <span className="ml-0.5 rounded bg-teal-50 px-1.5 text-[11px] font-semibold text-teal-700">{drafts.length}</span>
        </Button>
      }>
      
      {(close) =>
      <div>
          <div className="flex items-center justify-between border-b border-ink-100 px-3 py-2.5">
            <p className="text-sm font-semibold">Held sales</p>
            <button
            disabled={!canSave}
            onClick={() => {
              onSave();
              close();
            }}
            className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline disabled:cursor-not-allowed disabled:text-ink-300 disabled:no-underline">
            
              <Save className="size-3.5" /> Hold current
            </button>
          </div>
          {drafts.length === 0 ?
        <p className="px-3 py-6 text-center text-sm text-ink-500">No held sales.</p> :

        <ul className="max-h-72 divide-y divide-ink-100 overflow-auto">
              {drafts.map((d) =>
          <li key={d.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-ink-50">
                  <button
              className="min-w-0 flex-1 text-left"
              onClick={() => {
                onResume(d);
                close();
              }}>
              
                    <p className="text-[13px] font-medium text-ink">
                      {d.label} <span className="font-normal text-ink-500">· {d.customer ?? 'Walk-in'}</span>
                    </p>
                    <p className="text-[11px] text-ink-500">
                      {d.items} items · saved {d.savedAt}
                    </p>
                  </button>
                  <span className="text-[13px] font-semibold tabular-nums">{taka(d.total)}</span>
                  <button onClick={() => onDelete(d.id)} aria-label={`Delete ${d.label}`} className="rounded p-1 text-ink-300 hover:bg-danger-bg hover:text-danger">
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
          )}
            </ul>
        }
        </div>
      }
    </FloatingPanel>);

}