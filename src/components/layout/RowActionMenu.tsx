import type { ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../Button';
import { FloatingPanel } from './FloatingPanel';
import { ActionMenuList } from './ActionMenu';

/**
 * Standard HisabIQ row actions, matching Daybook and Audit Ledger.
 * Presentation only: callers own available commands, permissions and handlers.
 */
export function RowActionMenu({
  label,
  children,
  width = 210,
  className = ''
}: {
  label: string;
  children: (close: () => void) => ReactNode;
  width?: number;
  className?: string;
}) {
  return (
    <FloatingPanel label={label} width={width} className={className || 'inline-block'}
      trigger={({ toggle, open }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          data-action-menu-trigger=""
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={(event) => { event.stopPropagation(); toggle(); }}
          className="size-9 shrink-0 rounded-md text-ink-500 hover:bg-ink-50 hover:text-ink"
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      )}>
      {(close) => <ActionMenuList>{children(close)}</ActionMenuList>}
    </FloatingPanel>
  );
}
