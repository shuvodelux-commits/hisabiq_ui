import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useSaas } from '../../contexts/SaasContext';

type Hit = { id: string; kind: string; title: string; detail: string; to: string };

/** ⌘K search across businesses, invoices, transaction IDs and tickets in the person's scope. */
export function GlobalSearch() {
  const saas = useSaas();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
    };
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 2) return [];
    const { tenants, orders, tickets } = saas.state;
    const visible = tenants.filter((t) => saas.inScope(t.id));
    const ids = new Set(visible.map((t) => t.id));
    const name = (id: string) => tenants.find((t) => t.id === id)?.name ?? id;
    const out: Hit[] = [];
    for (const t of visible) if (`${t.name} ${t.owner} ${t.phone} ${t.id}`.toLowerCase().includes(s)) out.push({ id: t.id, kind: 'Business', title: t.name, detail: `${t.owner} · ${t.phone} · ${t.id}`, to: `/saas/tenants/${t.id}` });
    if (saas.can('invoices.view') || saas.can('payments.view'))
      for (const o of orders.filter((x) => ids.has(x.tenantId)))
        if (o.id.toLowerCase().includes(s) || (o.reference && o.reference.toLowerCase().includes(s)))
          out.push({ id: o.id, kind: o.reference.toLowerCase().includes(s) ? 'Transaction' : 'Invoice', title: `${o.id} · ৳${o.total}`, detail: `${name(o.tenantId)} · ${o.method}${o.reference ? ` · TRX ${o.reference}` : ''}`, to: o.state === 'VERIFICATION_PENDING' && saas.can('payments.view') ? `/saas/payments?order=${o.id}` : `/saas/invoices?order=${o.id}` });
    if (saas.can('tickets.view'))
      for (const t of tickets.filter((x) => ids.has(x.tenantId)))
        if (`${t.id} ${t.subject}`.toLowerCase().includes(s)) out.push({ id: t.id, kind: 'Ticket', title: `${t.id} · ${t.subject}`, detail: name(t.tenantId), to: `/saas/tickets?ticket=${t.id}` });
    return out.slice(0, 8);
  }, [q, saas]);

  const go = (h: Hit) => {
    navigate(h.to);
    setQ('');
    setOpen(false);
  };

  return (
    <div ref={box} className="relative w-full max-w-[420px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
      <input
        ref={input}
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(hits.length - 1, a + 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
          if (e.key === 'Enter' && hits[active]) go(hits[active]);
          if (e.key === 'Escape') setOpen(false);
        }}
        role="combobox"
        aria-expanded={open && q.trim().length >= 2}
        aria-controls="cc-search-results"
        aria-label="Search businesses, invoices, TRX ID or tickets"
        placeholder="Search business, invoice, TRX ID…"
        className="ref-control w-full rounded-lg border border-ink-200 bg-ink-50/60 pl-9 pr-12 text-[13px] focus-visible:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600/40"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-ink-200 bg-white px-1.5 text-[10px] text-ink-500 md:block">⌘K</kbd>
      {open && q.trim().length >= 2 && (
        <ul id="cc-search-results" role="listbox" className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-pop">
          {hits.length === 0 && <li className="px-3 py-3 text-center text-xs text-ink-500">No match in your businesses.</li>}
          {hits.map((h, i) => (
            <li key={`${h.kind}-${h.id}`} role="option" aria-selected={i === active}>
              <button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(h)} className={`flex w-full items-start gap-3 px-3 py-2 text-left ${i === active ? 'bg-teal-50' : ''}`}>
                <span className="w-[76px] shrink-0 pt-0.5 text-[11px] text-ink-500">{h.kind}</span>
                <span className="min-w-0"><span className="block truncate text-[13px] font-medium text-ink">{h.title}</span><span className="block truncate text-[11px] text-ink-500">{h.detail}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
