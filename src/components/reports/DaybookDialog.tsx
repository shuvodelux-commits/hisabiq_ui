import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { StatusBadge } from '../StatusBadge';
import { daybook } from '../../data/finance';
import { formatNumber, taka } from '../../utils/currency';

export function DaybookDialog({ open, onOpenChange }: {open: boolean;onOpenChange: (o: boolean) => void;}) {
  const totalIn = daybook.reduce((s, d) => s + d.in, 0);
  const totalOut = daybook.reduce((s, d) => s + d.out, 0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Daybook <span className="font-bn text-sm font-normal text-ink-500">দৈনিক খাতা</span>
          </DialogTitle>
          <DialogDescription>Thursday, 1 October 2026 · every entry in order</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto rounded-lg border border-border scrollbar-thin">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-3 text-xs">Time</TableHead>
                <TableHead className="h-9 text-xs">Type</TableHead>
                <TableHead className="h-9 text-xs">Particulars</TableHead>
                <TableHead className="h-9 text-right text-xs">Cash in</TableHead>
                <TableHead className="h-9 pr-3 text-right text-xs">Cash out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daybook.map((d) =>
              <TableRow key={d.ref} className="text-[13px]">
                  <TableCell className="py-2 pl-3 text-ink-500">{d.time}</TableCell>
                  <TableCell className="py-2">
                    <StatusBadge tone={d.type === 'Sale' ? 'teal' : d.type === 'Expense' ? 'warning' : d.type === 'Receipt' ? 'success' : 'neutral'}>{d.type}</StatusBadge>
                  </TableCell>
                  <TableCell className="py-2">
                    <span className="font-medium text-ink">{d.ref}</span>
                    <span className="block text-xs text-ink-500">{d.particulars}</span>
                  </TableCell>
                  <TableCell className="py-2 text-right tabular-nums">{d.in ? formatNumber(d.in) : '—'}</TableCell>
                  <TableCell className="py-2 pr-3 text-right tabular-nums">{d.out ? formatNumber(d.out) : '—'}</TableCell>
                </TableRow>
              )}
              <TableRow className="bg-ink-50 font-semibold hover:bg-ink-50">
                <TableCell colSpan={3} className="py-2 pl-3 text-[13px]">Net cash movement · {taka(totalIn - totalOut)}</TableCell>
                <TableCell className="py-2 text-right text-[13px] tabular-nums">{taka(totalIn)}</TableCell>
                <TableCell className="py-2 pr-3 text-right text-[13px] tabular-nums">{taka(totalOut)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>);

}
