import { Copy, ExternalLink, Eye, MoreHorizontal, Pencil, Printer, Trash2 } from 'lucide-react';
import { FloatingPanel } from '../layout/FloatingPanel';
import { ActionMenuList, ActionMenuItem, ActionMenuDivider } from '../layout/ActionMenu';
import type { UnifiedTransaction } from '../../types/transactions';
import { daybookActionAvailability, demoPermissions } from '../../utils/permissions';
import { daybookContextActions } from '../../utils/moduleUiActions';

export function DaybookActions({
  transaction,
  onOpen,
  onEdit,
  onDelete,
  onGoToSource,
  onPrint,
  onDuplicate
}: {
  transaction: UnifiedTransaction;
  onOpen: (transaction: UnifiedTransaction) => void;
  onEdit: (transaction: UnifiedTransaction) => void;
  onDelete: (transaction: UnifiedTransaction) => void;
  onGoToSource: (transaction: UnifiedTransaction) => void;
  onPrint: (transaction: UnifiedTransaction) => void;
  onDuplicate: (transaction: UnifiedTransaction) => void;
}) {
  const availability = daybookActionAvailability(transaction.source, demoPermissions);
  const extra = daybookContextActions(transaction.source);
  const canOpen = availability.open;


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
        <ActionMenuList>
          {canOpen && <ActionMenuItem icon={Eye} onClick={() => { close(); onOpen(transaction); }}>Open</ActionMenuItem>}
          {availability.edit && transaction.status !== 'Deleted' && <ActionMenuItem icon={Pencil} onClick={() => { close(); onEdit(transaction); }}>Edit</ActionMenuItem>}
          {extra.includes('print') && <ActionMenuItem icon={Printer} onClick={() => { close(); onPrint(transaction); }}>Print</ActionMenuItem>}
          {extra.includes('duplicate') && transaction.status !== 'Deleted' && <ActionMenuItem icon={Copy} onClick={() => { close(); onDuplicate(transaction); }}>Duplicate</ActionMenuItem>}
          {extra.includes('go-source') && canOpen && <ActionMenuItem icon={ExternalLink} onClick={() => { close(); onGoToSource(transaction); }}>Go to source</ActionMenuItem>}
          {availability.delete && transaction.status !== 'Deleted' && <>
            <ActionMenuDivider />
            <ActionMenuItem icon={Trash2} tone="destructive" onClick={() => { close(); onDelete(transaction); }}>Review reversal</ActionMenuItem>
          </>}
        </ActionMenuList>
      )}
    </FloatingPanel>
  );
}
