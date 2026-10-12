import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { StatusBadge } from '../StatusBadge';
import { recentSales } from '../../data/sales';
import { taka } from '../../utils/currency';

export function RecentSalesTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-8 pl-4 text-xs">Invoice</TableHead>
          <TableHead className="h-8 text-xs">Customer</TableHead>
          <TableHead className="h-8 text-xs">Status</TableHead>
          <TableHead className="h-8 text-right text-xs">Total</TableHead>
          <TableHead className="h-8 pr-4 text-right text-xs">Due</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentSales.map((s) => {
          const due = s.total - s.paid;
          return (
            <TableRow key={s.id} className="text-[13px]">
              <TableCell className="py-2 pl-4">
                <span className="font-medium text-ink">{s.invoice}</span>
                <span className="block text-[11px] text-ink-400">{s.date} · {s.time}</span>
              </TableCell>
              <TableCell className="py-2 text-ink-700">{s.party}</TableCell>
              <TableCell className="py-2">
                {due === 0 ?
                <StatusBadge tone="success" dot>Paid · {s.method}</StatusBadge> :
                s.paid > 0 ?
                <StatusBadge tone="warning" dot>Partial</StatusBadge> :

                <StatusBadge tone="danger" dot>Due</StatusBadge>
                }
              </TableCell>
              <TableCell className="py-2 text-right tabular-nums font-medium text-ink">{taka(s.total)}</TableCell>
              <TableCell className={`py-2 pr-4 text-right tabular-nums ${due > 0 ? 'text-danger' : 'text-ink-400'}`}>
                {due > 0 ? taka(due) : '—'}
              </TableCell>
            </TableRow>);

        })}
      </TableBody>
    </Table>);

}