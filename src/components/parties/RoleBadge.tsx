import { StatusBadge, type StatusTone } from '../StatusBadge';
import type { PartyRole } from '../../types/erp';

const roleTone: Record<PartyRole, StatusTone> = {
  Customer: 'teal',
  Supplier: 'info',
  Vendor: 'neutral',
  Lender: 'warning',
  Borrower: 'warning',
  Payee: 'neutral',
  Owner: 'ink'
};

export function RoleBadge({ role }: {role: PartyRole;}) {
  return (
    <StatusBadge tone={roleTone[role]} className="h-[18px] px-1 text-[10.5px]">
      {role}
    </StatusBadge>);

}