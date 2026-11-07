// Source: Magic Patterns components/settings/KhataPreview.tsx — UI-only draft.
export type KhataPreviewDraft = Record<string, string | number | boolean>;

const rows = [
  { date: '01 Nov', details: 'INV-000236 · BRB cable', sale: 4200, joma: 2000 },
  { date: '03 Nov', details: 'Cash received', sale: 0, joma: 1500 },
  { date: '04 Nov', details: 'INV-000241 · LED bulbs', sale: 990, joma: 0 },
];

/** Live sample of a customer khata using the shop's own money words and column order. */
export function KhataPreview({ draft }: { draft: KhataPreviewDraft }) {
  let running = 0;
  const data = rows.map((r) => {
    running += r.sale - r.joma;
    return { ...r, baki: running };
  });
  const labels: Record<string, string> = { Date: 'Date', Details: 'Details', Sale: 'Sale', Joma: String(draft.receivedLabel || 'Joma'), Baki: String(draft.dueLabel || 'Baki') };
  const cols = String(draft.ledgerOrder || 'Date, Details, Sale, Joma, Baki').split(',').map((c) => c.trim());
  const cell = (c: string, r: (typeof data)[number]) => {
    if (c === 'Date') return r.date;
    if (c === 'Details') return r.details;
    const n = c === 'Sale' ? r.sale : c === 'Joma' ? r.joma : r.baki;
    return n ? `৳ ${n.toLocaleString('en-IN')}` : '—';
  };
  return (
    <section className="rounded-xl border border-ink-100 bg-card shadow-card" aria-label="Khata preview">
      <header className="border-b border-ink-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">Preview · Rahman Hardware</h3>
        <p className="text-xs text-ink-500">Updates as you change the words.</p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="bg-ink-50">
            <tr>{cols.map((c) => <th key={c} className={`px-3 py-2 font-medium text-ink-500 ${c === 'Date' || c === 'Details' ? 'text-left' : 'text-right'}`}>{labels[c]}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.date} className="border-t border-ink-100">
                {cols.map((c) => (
                  <td key={c} className={`px-3 py-2 ${c === 'Date' || c === 'Details' ? 'text-ink-700' : 'text-right'} ${c === 'Baki' ? 'font-medium text-danger' : ''}`}>{cell(c, r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-ink-100 px-4 py-2.5 text-xs text-ink-600">
        Total {String(draft.dueLabel || 'Baki').toLowerCase()}: <b className="text-danger">৳ {running.toLocaleString('en-IN')}</b> · {draft.advanceLabel} shows when a customer pays more than they owe.
      </p>
    </section>
  );
}
