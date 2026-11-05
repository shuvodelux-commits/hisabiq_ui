import { Copy, ExternalLink, Eye, Pencil, Printer, Trash2 } from 'lucide-react';
import { FloatingPanel } from '../layout/FloatingPanel';
import { ActionMenuList, ActionMenuItem, ActionMenuDivider, ActionMenuTrigger } from '../layout/ActionMenu';
import type { UnifiedTransaction } from '../../types/transactions';
import { daybookActionAvailability, demoPermissions } from '../../utils/permissions';
import { daybookContextActions } from '../../utils/moduleUiActions';
import { useUiCopy } from '../../i18n/useUiCopy';

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
  const { text } = useUiCopy();
  const label = `${text('Actions for', 'কাজ')} ${transaction.reference}`;
  const availability = daybookActionAvailability(transaction.source, demoPermissions);
  const extra = daybookContextActions(transaction.source);
  const canOpen = availability.open;


  return (
    <FloatingPanel
      label={label}
      width={190}
      trigger={({ toggle, open }) => (
        <ActionMenuTrigger label={label} expanded={open} onClick={toggle} />
      )}>
      {(close) => (
        <ActionMenuList>
          {canOpen && <ActionMenuItem icon={Eye} onClick={() => { close(); onOpen(transaction); }}>{text('Open','খুলুন')}</ActionMenuItem>}
          {availability.edit && transaction.status !== 'Deleted' && <ActionMenuItem icon={Pencil} onClick={() => { close(); onEdit(transaction); }}>{text('Edit','সম্পাদনা')}</ActionMenuItem>}
          {extra.includes('print') && <ActionMenuItem icon={Printer} onClick={() => { close(); onPrint(transaction); }}>{text('Print','প্রিন্ট')}</ActionMenuItem>}
          {extra.includes('duplicate') && transaction.status !== 'Deleted' && <ActionMenuItem icon={Copy} onClick={() => { close(); onDuplicate(transaction); }}>{text('Duplicate','নকল তৈরি')}</ActionMenuItem>}
          {extra.includes('go-source') && canOpen && <ActionMenuItem icon={ExternalLink} onClick={() => { close(); onGoToSource(transaction); }}>{text('Go to source','মূল লেনদেনে যান')}</ActionMenuItem>}
          {availability.delete && transaction.status !== 'Deleted' && <>
            <ActionMenuDivider />
            <ActionMenuItem icon={Trash2} tone="destructive" onClick={() => { close(); onDelete(transaction); }}>{text('Review reversal','বাতিল যাচাই')}</ActionMenuItem>
          </>}
        </ActionMenuList>
      )}
    </FloatingPanel>
  );
}
