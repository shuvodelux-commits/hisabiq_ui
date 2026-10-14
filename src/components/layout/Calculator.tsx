import React, { useState } from 'react';
import { Copy, Delete } from 'lucide-react';
import { toast } from 'sonner';
import { formatNumber } from '../../utils/currency';
import { useUiCopy } from '../../i18n/useUiCopy';

type Op = '+' | '−' | '×' | '÷';

function apply(a: number, b: number, op: Op): number {
  switch (op) {
    case '+':
      return a + b;
    case '−':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? 0 : a / b;
  }
}

export function Calculator() {
  const { text } = useUiCopy();
  const [display, setDisplay] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(true);
  const [history, setHistory] = useState('');

  const value = parseFloat(display) || 0;

  const input = (d: string) => {
    if (fresh) {
      setDisplay(d === '.' ? '0.' : d);
      setFresh(false);
      return;
    }
    if (d === '.' && display.includes('.')) return;
    setDisplay(display === '0' && d !== '.' ? d : display + d);
  };

  const chooseOp = (next: Op) => {
    if (acc !== null && op && !fresh) {
      const r = apply(acc, value, op);
      setAcc(r);
      setDisplay(String(r));
      setHistory(`${formatNumber(r, r % 1 ? 2 : 0)} ${next}`);
    } else {
      setAcc(value);
      setHistory(`${formatNumber(value, value % 1 ? 2 : 0)} ${next}`);
    }
    setOp(next);
    setFresh(true);
  };

  const equals = () => {
    if (acc === null || !op) return;
    const r = Math.round(apply(acc, value, op) * 100) / 100;
    setHistory(`${formatNumber(acc, acc % 1 ? 2 : 0)} ${op} ${formatNumber(value, value % 1 ? 2 : 0)} =`);
    setDisplay(String(r));
    setAcc(null);
    setOp(null);
    setFresh(true);
  };

  const clear = () => {
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setHistory('');
    setFresh(true);
  };

  const percent = () => setDisplay(String(acc !== null ? acc * value / 100 : value / 100));
  const back = () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0');

  const keys: {label: React.ReactNode;onClick: () => void;kind?: 'op' | 'eq' | 'muted';}[] = [
  { label: 'AC', onClick: clear, kind: 'muted' },
  { label: '%', onClick: percent, kind: 'muted' },
  { label: <Delete className="mx-auto size-4" aria-label={text("Backspace","আগের সংখ্যা মুছুন")} />, onClick: back, kind: 'muted' },
  { label: '÷', onClick: () => chooseOp('÷'), kind: 'op' },
  ...['7', '8', '9'].map((d) => ({ label: d, onClick: () => input(d) })),
  { label: '×', onClick: () => chooseOp('×'), kind: 'op' as const },
  ...['4', '5', '6'].map((d) => ({ label: d, onClick: () => input(d) })),
  { label: '−', onClick: () => chooseOp('−'), kind: 'op' as const },
  ...['1', '2', '3'].map((d) => ({ label: d, onClick: () => input(d) })),
  { label: '+', onClick: () => chooseOp('+'), kind: 'op' as const },
  { label: '00', onClick: () => {input('0');input('0');} },
  { label: '0', onClick: () => input('0') },
  { label: '.', onClick: () => input('.') },
  { label: '=', onClick: equals, kind: 'eq' as const }];


  const shown = parseFloat(display);

  return (
    <div className="p-3">
      <div className="mb-3 rounded-lg bg-ink-50 px-3 py-2.5 text-right">
        <div className="h-4 text-xs text-ink-500">{history}</div>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(display);
              toast.success(text('Copied to clipboard','কপি হয়েছে'));
            }}
            className="rounded p-1 text-ink-400 hover:bg-card hover:text-ink"
            aria-label={text("Copy result","ফলাফল কপি করুন")}>
            
            <Copy className="size-3.5" />
          </button>
          <output className="truncate text-2xl font-semibold tabular-nums tracking-tight text-ink">
            {display.endsWith('.') ? display : formatNumber(shown, display.includes('.') ? Math.min(display.split('.')[1].length, 2) : 0)}
          </output>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {keys.map((k, i) =>
        <button
          key={i}
          onClick={k.onClick}
          className={`h-10 rounded-lg text-[15px] font-medium transition-colors active:scale-[0.97] ${
          k.kind === 'eq' ?
          'bg-teal-600 text-primary-foreground hover:bg-teal-700' :
          k.kind === 'op' ?
          'bg-teal-50 text-teal-700 hover:bg-teal-100' :
          k.kind === 'muted' ?
          'bg-ink-50 text-ink-600 hover:bg-ink-100' :
          'border border-border bg-card text-ink hover:bg-ink-50'}`
          }>
          
            {k.label}
          </button>
        )}
      </div>
    </div>);

}
