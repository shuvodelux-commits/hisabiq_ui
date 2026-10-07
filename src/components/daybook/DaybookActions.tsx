import React from 'react';
import { ExternalLink, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { FloatingPanel } from '../layout/FloatingPanel';
import type { UnifiedTransaction } from '../../types/transactions';
import { canDaybookAction, demoPermissions } from '../../utils/permissions';

export function DaybookActions({
  transaction,
  onOpen,
  onEdit,
  onDelete,
  onGoToSource
}: {
  transaction: UnifiedTransaction;
  onOpen: (transaction: UnifiedTransaction) => void;
  onEdit: (transaction: UnifiedTransaction) => void;
  onDelete: (transaction: UnifiedTransaction) => void;
  onGoToSource: (transaction: UnifiedTransaction) => void;
}) {
  const itemClass = 'flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-ink-700 hover:bg-ink-50';
  const canOpen = canDaybookAction('open', transaction.source, demoPermissions);
  const canEdit = canDaybookAction('edit', transaction.source, demoPermissions);
  const canDelete = canDaybookAction('delete', transaction.source, demoPermissions);
  return (
    <FloatingPanel
      label={`Actions for ${transaction.reference}`}
      width={190}
      trigger={({ toggle }) => (
        <button onClick={toggle} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink" aria-label={`Actions for ${transaction.reference}`}>
          <MoreHorizontal className="size-4" />
        </button>
      )}>
      {(close) => (
        <div className="py-1">
          {canOpen && <button className={itemClass} onClick={() => { close(); onOpen(transaction); }}><Eye className="size-3.5" /> Open</button>}
          {canEdit && transaction.status !== 'Deleted' && <button className={itemClass} onClick={() => { close(); onEdit(transaction); }}><Pencil className="size-3.5" /> Edit</button>}
          {canOpen && <button className={itemClass} onClick={() => { close(); onGoToSource(transaction); }}><ExternalLink className="size-3.5" /> Go to source</button>}
          {canDelete && transaction.status !== 'Deleted' && <button className={`${itemClass} text-danger`} onClick={() => { close(); onDelete(transaction); }}><Trash2 className="size-3.5" /> Delete</button>}
        </div>
      )}
    </FloatingPanel>
  );
}
