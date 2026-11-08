/** Pinned Magic Patterns Staff Activity source, isolated Phase-1 UI preview.
 * Synthetic source events only, no real audit queries or mutations.
 */
function downloadCsv(name: string, rows: (string | number)[][]) {
  const escaped = rows.map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const url = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + escaped);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
}
import { useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Download, Printer, RotateCcw, Search } from 'lucide-react';
import { Button } from '../invoice/Ui';
import { Select, Tag } from './SessionsUi';
import { Input } from '../../../components/Input';
import { SettingCard } from '../../ui';
import { StatTile } from './StatTile';
import { dhakaTime } from './sessionPreview';
import { useActivityPreview } from './activityPreview';
import { PREVIEW_NOW } from './sessionPreview';
import type { ActivityArea, ActivityEntry } from './activityPreview';
import { lakhGroup } from './activityPreview';

const areas: ActivityArea[] = ['Sales', 'Stock', 'Money', 'Purchases', 'Settings', 'Sign-in', 'Recycle Bin'];
const dayKey = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date(iso));

/** Owner tool: append-only, plain-language timeline of what each staff member did. */
export function ActivityPage({ canView }: { canView: boolean }) {
  const sec = useActivityPreview();
  const reduced = useReducedMotion();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [personId, setPersonId] = useState('');
  const [area, setArea] = useState('');
  const [period, setPeriod] = useState('today');
  const [lookOnly, setLookOnly] = useState(params.get('look') === '1');
  const [open, setOpen] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const today = dayKey(PREVIEW_NOW);
  const weekAgo = new Date(new Date(PREVIEW_NOW).getTime() - 7 * 86400000).toISOString();
  const name = (id: string) => sec.person(id)?.name ?? 'Unknown';

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sec.activity.filter(
      (a) =>
        (!personId || a.personId === personId) &&
        (!area || a.area === area) &&
        (period === 'all' || (period === 'today' ? dayKey(a.at) >= today : a.at >= weekAgo)) &&
        (!lookOnly || a.level !== 'normal') &&
        (!q || `${a.summary} ${sec.person(a.personId)?.name} ${a.device}`.toLowerCase().includes(q)),
    );
  }, [sec, query, personId, area, period, lookOnly, today, weekAgo]);

  const looks = rows.filter((r) => r.level !== 'normal').length;
  const salesRows = rows.filter((r) => r.area === 'Sales' && r.summary.startsWith('Sold'));
  const salesTotal = salesRows.reduce((s, r) => s + (r.amount ?? 0), 0);
  const reset = () => { setQuery(''); setPersonId(''); setArea(''); setPeriod('today'); setLookOnly(false); };

  if (!canView) {
    return (
      <SettingCard title="Staff activity" titleBn="কর্মীদের কাজের লগ">
        <p className="text-[13px] text-ink-600">Only the owner, or someone the owner allows to “See staff activity”, can open this page.</p>
      </SettingCard>
    );
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden" data-settings-magic-activity>
      <p role="note" className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800">UI preview · All activity entries are synthetic examples from 3 November 2026, not your business audit records. Filters are local; exported CSV and printing show demo data only.</p>
      {notice && <p role="status" className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800">{notice}</p>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Things done" value={rows.length} hint={period === 'today' ? 'Today' : period === 'week' ? 'Last 7 days' : 'All time'} />
        <StatTile label="Needs a look" value={looks} tone={looks ? 'danger' : 'neutral'} hint="Deletes, big discounts, odd sign-ins" />
        <StatTile label="Sales recorded" value={salesRows.length} hint={`৳ ${lakhGroup(salesTotal, 0)}`} />
        <StatTile label="People active" value={new Set(rows.map((r) => r.personId)).size} />
      </div>

      {personId && (
        <motion.div initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-[13px] text-teal-900">
          <b>{name(personId)}</b> · {salesRows.length} sales worth ৳ {lakhGroup(salesTotal, 0)} · {rows.filter((r) => /discount/i.test(r.summary)).length} discounts · {rows.filter((r) => /deleted|voided|refunded/i.test(r.summary)).length} deletes or refunds · {rows.filter((r) => r.area === 'Sign-in').length} sign-in events
        </motion.div>
      )}

      <section className="min-w-0 max-w-full overflow-hidden rounded-xl border border-ink-100 bg-card shadow-card">
        <div className="grid gap-2 border-b border-ink-100 p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} onClear={() => setQuery('')} clearable placeholder="Search what happened" aria-label="Search activity" className="ref-control h-9 w-full rounded-md border border-input bg-card pl-9 pr-3 text-[13px] text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20" />
          </div>
          <Select label="Person" value={personId} onChange={setPersonId} options={[{ value: '', label: 'Everyone' }, ...sec.staff.map((s) => ({ value: s.id, label: `${s.name} · ${s.role}` }))]} />
          <Select label="Area" value={area} onChange={setArea} options={[{ value: '', label: 'All areas' }, ...areas.map((a) => ({ value: a, label: a }))]} />
          <Select label="Period" value={period} onChange={setPeriod} options={[{ value: 'today', label: 'Today' }, { value: 'week', label: 'Last 7 days' }, { value: 'all', label: 'All time' }]} />
          <Button kind="ghost" onClick={reset}><RotateCcw className="size-4" />Reset</Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs text-ink-500">Showing {rows.length} of {sec.activity.length}</p>
            <label className="flex items-center gap-2 text-xs font-medium text-ink-700">
              <input type="checkbox" className="size-4 accent-teal-600" checked={lookOnly} onChange={(e) => setLookOnly(e.target.checked)} />
              Needs a look only
            </label>
          </div>
          <div className="flex gap-2">
            <Button kind="ghost" onClick={() => { downloadCsv(`sample-staff-activity-${today}.csv`, [['Time', 'Person', 'Area', 'What happened', 'Before', 'After', 'Device'], ...rows.map((r) => [dhakaTime(r.at), name(r.personId), r.area, r.summary, r.before ?? '', r.after ?? '', r.device])]); setNotice('Sample activity CSV downloaded. No actual audit records were accessed or exported.'); }}>
              <Download className="size-4" />Export
            </Button>
            <Button kind="ghost" onClick={() => { setNotice('Printing the demo activity page only; no real audit records were accessed.'); window.print(); }}><Printer className="size-4" />Print</Button>
          </div>
        </div>
        <ol className="mt-2 divide-y divide-ink-100">
          {rows.map((r) => (
            <ActivityRow key={r.id} entry={r} name={name(r.personId)} role={sec.person(r.personId)?.role ?? ''} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} onPerson={() => setPersonId(r.personId)} onOpenRecord={() => setNotice('This record link is a sample. Open-record navigation will be connected only after Phase 2 approval.')} />
          ))}
        </ol>
        {rows.length === 0 && <p className="px-4 py-10 text-center text-[13px] text-ink-500">Nothing matches these filters. Try “Last 7 days”.</p>}
        <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">This log can’t be edited or deleted by anyone, including the owner.</p>
      </section>
    </div>
  );
}

type RowProps = { entry: ActivityEntry; name: string; role: string; open: boolean; onToggle: () => void; onPerson: () => void; onOpenRecord: () => void };

function ActivityRow({ entry: r, name, role, open, onToggle, onPerson, onOpenRecord }: RowProps) {
  const reduced = useReducedMotion();
  const detailsId = useId();
  const hasDetail = !!(r.before || r.after || r.link);
  return (
    <li className={r.level === 'alert' ? 'bg-danger-bg/40' : r.level === 'look' ? 'bg-warning-bg/30' : ''}>
      <div className="flex items-start gap-3 px-4 py-3">
        <span aria-hidden="true" className={`mt-1.5 size-2 shrink-0 rounded-full ${r.level === 'alert' ? 'bg-danger' : r.level === 'look' ? 'bg-warning' : 'bg-ink-200'}`} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-ink">
            <button type="button" onClick={onPerson} className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40">{name}</button>{' '}
            <span className="text-ink-700">{r.summary.charAt(0).toLowerCase() + r.summary.slice(1)}</span>
            {r.amount != null && <span className="ml-1 font-medium">· ৳ {lakhGroup(r.amount, 0)}</span>}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
            <span>{dhakaTime(r.at)}</span><span>·</span><span>{role}</span><span>·</span><span>{r.area}</span>
            {r.level !== 'normal' && <Tag color={r.level === 'alert' ? 'danger' : 'warning'}>{r.level === 'alert' ? 'Needs a look' : 'Worth checking'}</Tag>}
          </p>
        </div>
        {hasDetail && (
          <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={detailsId} aria-label={open ? `Hide details for ${name}` : `Show details for ${name}`} className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-ink-500 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40">
            <ChevronDown className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={detailsId} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={reduced ? undefined : { height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="mx-4 mb-3 ml-9 grid gap-2 rounded-lg border border-ink-100 bg-card p-3 text-xs sm:grid-cols-3">
              {r.before && <p><span className="text-ink-500">Before</span><br /><span className="text-ink">{r.before}</span></p>}
              {r.after && <p><span className="text-ink-500">After</span><br /><span className="font-medium text-ink">{r.after}</span></p>}
              <p><span className="text-ink-500">Device</span><br /><span className="text-ink">{r.device}</span></p>
              {r.link && <Link to={r.link} onClick={e => { e.preventDefault(); onOpenRecord(); }} className="font-medium text-teal-700 hover:underline sm:col-span-3">Open the record →</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
