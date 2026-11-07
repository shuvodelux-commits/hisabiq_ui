import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Search, Wand2 } from 'lucide-react';
import { SetupWizard } from './SetupWizard';
import { useMagicSettingsState } from './settingsBridge';
import { settingsSections, type SettingsSectionId } from './settingsSections';
import { popularSearches, settingsSearchIndex, setupTasks, type SetupTaskId } from './settingsTasks';

type Props = { urlFor: (id: SettingsSectionId) => string };

/** Settings landing page: setup progress, goal search in English or Bangla, and task cards. */
export function SettingsHome({ urlFor }: Props) {
  const { state, sec, saved, defaultInvoiceDesign } = useMagicSettingsState();
  const reduced = useReducedMotion();
  const [query, setQuery] = useState('');
  const s = state.settings;
  const [wizard, setWizard] = useState(false);

  const done: Record<SetupTaskId, boolean> = {
    profile: s.businessName.trim().length > 1,
    contact: s.phone !== '01700000000' && s.address.trim().length > 3,
    receipt: JSON.stringify(saved) !== JSON.stringify(defaultInvoiceDesign),
    payment: !!s.defaultPayment,
    stock: s.stockAlert > 0,
    staff: state.staff.filter((x) => x.active).length > 1,
    security: s.pinEnabled,
    sms: s.smsEnabled,
    offline: !!sec.offline.deviceId,
  };
  const count = setupTasks.filter((t) => done[t.id]).length;
  const pct = count / setupTasks.length;
  const ordered = [...setupTasks].sort((a, b) => Number(done[a.id]) - Number(done[b.id]));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return settingsSearchIndex.filter((e) => e.label.toLowerCase().includes(q) || e.keywords.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const sectionName = (id: SettingsSectionId) => settingsSections.find((x) => x.id === id)?.label ?? '';
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <div className="space-y-5">
      {!s.setupDone && (
        <section className="flex flex-wrap items-center gap-3 rounded-xl border border-teal-600/20 bg-teal-50/60 p-4">
          <Wand2 className="size-5 shrink-0 text-teal-700" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-ink">New here? Set up your shop in 5 quick steps</p>
            <p className="text-xs text-ink-600">Shop details, business type, payments, receipt look and staff. About 3 minutes — skip any time.</p>
          </div>
          <button type="button" onClick={() => setWizard(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-[13px] font-medium text-white hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            Start guided setup
          </button>
        </section>
      )}
      {wizard && <SetupWizard onClose={() => setWizard(false)} />}
      <section className="flex flex-wrap items-center gap-4 rounded-xl border border-ink-100 bg-card p-4 shadow-card">
        <svg viewBox="0 0 64 64" className="size-16 shrink-0 -rotate-90" role="img" aria-label={`${count} of ${setupTasks.length} setup steps done`}>
          <circle cx="32" cy="32" r={R} fill="none" strokeWidth="7" className="stroke-ink-100" />
          <motion.circle
            cx="32" cy="32" r={R} fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-teal-600"
            strokeDasharray={C}
            initial={reduced ? false : { strokeDashoffset: C }}
            animate={{ strokeDashoffset: C * (1 - pct) }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-ink">Your shop is {count} of {setupTasks.length} steps ready</h2>
          <p className="text-xs text-ink-500">
            <span className="font-bn">{count === setupTasks.length ? 'সব সেটআপ সম্পূর্ণ' : 'আপনার দোকান প্রায় তৈরি'}</span> ·{' '}
            {count === setupTasks.length ? 'Everything is set. You can still change anything below.' : `Finish ${setupTasks.length - count} more to get the most out of HisabIQ.`}
          </p>
        </div>
        {ordered[0] && !done[ordered[0].id] && (
          <Link to={urlFor(ordered[0].section)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 text-[13px] font-medium text-white hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            Next: {ordered[0].title}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </section>

      <section aria-label="Search settings" className="rounded-xl border border-ink-100 bg-card p-4 shadow-card">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to change? Try “logo”, “রসিদ”, “VAT”, “PIN”…"
            aria-label="Search settings by goal"
            className="h-10 w-full rounded-lg border border-ink-200 bg-card pl-9 pr-3 text-[13px] text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20"
          />
        </div>
        {query.trim() ? (
          results.length ? (
            <ul className="mt-2 divide-y divide-ink-100">
              {results.map((r) => (
                <li key={r.label}>
                  <Link to={urlFor(r.section)} className="flex items-center justify-between gap-3 rounded-md px-2 py-2.5 text-[13px] hover:bg-ink-50">
                    <span className="text-ink">{r.label}</span>
                    <span className="flex items-center gap-1 text-xs text-ink-500">{sectionName(r.section)}<ArrowRight className="size-3.5" aria-hidden="true" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[13px] text-ink-500">Nothing matches “{query}”. Try a simpler word, like “print” or “staff”.</p>
          )
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-500">Popular:</span>
            {popularSearches.map((p) => {
              const e = settingsSearchIndex.find((x) => x.label === p);
              return e ? (
                <Link key={p} to={urlFor(e.section)} className="rounded-full border border-ink-200 px-2.5 py-1 text-xs text-ink-700 hover:border-teal-600 hover:text-teal-700">{p}</Link>
              ) : null;
            })}
          </div>
        )}
      </section>

      <section aria-label="Setup tasks">
        <h2 className="mb-2 text-sm font-semibold text-ink">Set up your shop <span className="font-bn text-[11px] font-normal text-ink-400">দোকান সেটআপ</span></h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((t) => (
            <li key={t.id}>
              <Link
                to={urlFor(t.section)}
                className="group flex h-full flex-col rounded-xl border border-ink-100 bg-card p-4 shadow-card transition-colors hover:border-teal-600/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
              >
                <span className="text-[13px] font-semibold text-ink">{t.title}</span>
                <span className="font-bn text-[11px] text-ink-400">{t.bn}</span>
                <span className="mt-1 text-xs text-ink-500">{t.helper}</span>
                <span className="mt-auto flex items-center justify-between pt-3 text-xs">
                  {done[t.id] ? (
                    <span className="inline-flex items-center gap-1 font-medium text-success"><CheckCircle2 className="size-3.5" aria-hidden="true" />Done</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-warning"><Clock className="size-3.5" aria-hidden="true" />Not set · {t.minutes} min</span>
                  )}
                  <ArrowRight className="size-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-700" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-ink-500">
        {s.setupDone && (
          <>
            <button type="button" onClick={() => setWizard(true)} className="font-medium text-teal-700 hover:underline">Run guided setup again</button> ·{' '}
          </>
        )}
        Need help? <Link to={urlFor('support')} className="font-medium text-teal-700 hover:underline">Ask HisabIQ support</Link>
      </p>
    </div>
  );
}
