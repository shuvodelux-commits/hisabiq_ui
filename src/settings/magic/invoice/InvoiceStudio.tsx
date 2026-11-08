import { SettingsToggle } from '../SettingsToggle';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Crown, Lock, Printer } from 'lucide-react';
import { Button, Modal, Segmented } from './Ui';
import { brandColors, contentToggles, invoiceDesigns, paperOptions, type InvoiceDesignId, type PaperSize } from './invoiceDesigns';
import { defaultInvoiceDesign, type InvoiceDesignSettings } from './invoiceState';
import { InvoiceDocument } from './InvoiceDocument';
import { SettingCard } from '../../ui';
import { SaveBar } from '../SaveBar';
import { DesignGallery } from './DesignGallery';

type Props = { canEdit: boolean; onDirtyChange: (dirty: boolean) => void };

const langOptions = [
  { id: 'en', label: 'Full English' },
  { id: 'mixed', label: 'English + বাংলা' },
  { id: 'bn', label: 'সম্পূর্ণ বাংলা' },
];

/** Invoices & printing → Invoice design: gallery, paper, language, color, content and a sticky live preview. */
export function InvoiceStudio({ canEdit, onDirtyChange }: Props) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  // In Phase 1 this visual preview uses the source's Free-plan gallery state.
  // Subscription entitlements and invoice persistence reconnect in Phase 2.
  const premium = false;
  const saved = defaultInvoiceDesign;
  const [draft, setDraft] = useState<InvoiceDesignSettings>(saved);
  const [locked, setLocked] = useState<InvoiceDesignId | 'pad' | 'color' | null>(null);
  const [compare, setCompare] = useState(false);
  const [feedback, setFeedback] = useState('');

  const changes = useMemo(() => {
    const list: string[] = [];
    if (draft.design !== saved.design) list.push('design');
    if (draft.paper !== saved.paper) list.push('paper');
    if (draft.lang !== saved.lang) list.push('language');
    if (draft.accent !== saved.accent) list.push('color');
    if (draft.padOffset !== saved.padOffset) list.push('pad space');
    if (draft.footer !== saved.footer) list.push('thank-you line');
    if (contentToggles.some((t) => draft.content[t.key] !== saved.content[t.key])) list.push('what to show');
    return list;
  }, [draft, saved]);
  const dirty = changes.length > 0;
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);
  useEffect(() => { if (!dirty) setCompare(false); }, [dirty]);

  const design = invoiceDesigns.find((d) => d.id === draft.design) ?? invoiceDesigns[0];
  const set = (patch: Partial<InvoiceDesignSettings>) => setDraft((d) => ({ ...d, ...patch }));

  const pickDesign = (id: InvoiceDesignId) => {
    const d = invoiceDesigns.find((x) => x.id === id)!;
    if (d.premium && !premium) return setLocked(id);
    set({ design: id, paper: d.papers.includes(draft.paper) ? draft.paper : 'a4' });
  };
  const pickPaper = (p: PaperSize) => {
    if (p === 'pad' && !premium) return setLocked('pad');
    set({ paper: p });
  };
  const doSave = () => {
    setFeedback('UI preview only. Invoice design has NOT been saved to your business. Persistence and the production print engine will be connected in Phase 2.');
  };

  const shown = compare ? saved : draft;
  const zoom = shown.paper === 'a4' || shown.paper === 'pad' ? 0.78 : 1;

  return (
    <div className="space-y-4" data-settings-magic-invoice-studio>
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
        <div className="min-w-0 space-y-4">
          <SettingCard title="Choose a design" titleBn="ডিজাইন বাছাই" description={premium ? 'All 6 designs are included in your plan.' : 'Standard is free. The other 5 designs come with Premium (Plus).'}>
            <DesignGallery value={draft} premium={premium} disabled={!canEdit} onPick={pickDesign} />
          </SettingCard>

          <SettingCard title="Paper & language" titleBn="কাগজ ও ভাষা" description="Pick the printer you use. Language changes every label, number and date on the printed page.">
            <div role="radiogroup" aria-label="Paper size" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {paperOptions.map((p) => {
                const supported = design.papers.includes(p.id);
                const active = draft.paper === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!canEdit || !supported}
                    title={supported ? undefined : `${design.name} doesn’t print on this paper`}
                    onClick={() => pickPaper(p.id)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'border-teal-600 bg-teal-50/60' : 'border-ink-100 hover:border-ink-200'}`}
                  >
                    <span className="flex items-center gap-1 text-[13px] font-medium text-ink">
                      {p.label}
                      {p.premium && !premium && <Lock className="size-3 text-ink-400" aria-label="Premium" />}
                    </span>
                    <span className="block text-[11px] text-ink-500">{p.helper}</span>
                  </button>
                );
              })}
            </div>
            {draft.paper === 'pad' && (
              <label className="block text-[12px] font-medium text-ink-700">
                Space for your letterhead: {draft.padOffset}mm
                <input type="range" min={0} max={100} step={5} value={draft.padOffset} disabled={!canEdit} onChange={(e) => set({ padOffset: Number(e.target.value) })} className="mt-2 block w-full accent-teal-600" />
                <span className="ref-helper mt-1 block font-normal">Measure from the top of your printed pad to where the bill should start.</span>
              </label>
            )}
            <div className="space-y-1.5">
              <p className="text-[12px] font-medium text-ink-700">Document language <span className="font-bn font-normal text-ink-400">চালানের ভাষা</span></p>
              <Segmented label="Document language" options={langOptions} value={draft.lang} onChange={(id) => canEdit && set({ lang: id as InvoiceDesignSettings['lang'] })} />
              <p className="ref-helper">
                {draft.lang === 'bn'
                  ? 'সব লেখা, সংখ্যা (০–৯), তারিখ ও কথায় টাকা বাংলায় ছাপা হবে। Free on every plan.'
                  : draft.lang === 'mixed'
                    ? 'English labels with a small Bangla helper. Recommended for most shops.'
                    : 'Everything in English, for corporate customers.'}
              </p>
            </div>
          </SettingCard>

          <SettingCard
            title="Brand color"
            titleBn="রং"
            description="Used for the title, total and accents."
            actions={!premium && <span className="inline-flex items-center gap-1 rounded-md bg-ink-50 px-2 py-1 text-[11px] font-medium text-ink-600"><Crown className="size-3.5" aria-hidden="true" />Premium</span>}
          >
            <div className="flex flex-wrap items-center gap-2">
              {brandColors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.label}
                  aria-pressed={draft.accent === c.hex}
                  disabled={!canEdit}
                  onClick={() => (!premium && c.id !== 'teal' ? setLocked('color') : set({ accent: c.hex }))}
                  style={{ background: c.hex }}
                  className={`size-8 rounded-full ring-offset-2 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${draft.accent === c.hex ? 'ring-2 ring-ink' : ''}`}
                />
              ))}
              <label className={`ml-1 inline-flex items-center gap-2 text-[12px] text-ink-600 ${premium ? '' : 'opacity-50'}`}>
                Custom
                <input type="color" value={draft.accent} disabled={!canEdit || !premium} onChange={(e) => set({ accent: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-ink-200 bg-card p-0.5" />
              </label>
            </div>
            {contrastRatio(draft.accent) < 4.5 && <p className="text-xs text-warning">This color is light — totals may be hard to read on paper. Pick a darker shade.</p>}
          </SettingCard>

          <SettingCard title="What to show on the invoice" titleBn="চালানে কী দেখাবে" description="Turn off anything your customers don’t need. The preview updates as you click.">
            <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
              {contentToggles.map((t) => (
                <div key={t.key} className="flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-md px-1 hover:bg-ink-50">
                  <label htmlFor={`settings-invoice-content-${t.key}`} className="min-w-0 cursor-pointer text-[13px] text-ink-700">
                    {t.label} <span className="font-bn text-[11px] text-ink-400">{t.bn}</span>
                  </label>
                  <SettingsToggle
                    id={`settings-invoice-content-${t.key}`}
                    aria-label={t.label}
                    checked={draft.content[t.key]}
                    disabled={!canEdit}
                    onCheckedChange={value => set({ content: { ...draft.content, [t.key]: value } })}
                  />
                </div>
              ))}
            </div>
            <label className="block text-[12px] font-medium text-ink-700">
              Thank-you line
              <input
                className="ref-control mt-1.5 block h-9 w-full rounded-md border border-input bg-card px-3 text-[13px] font-normal text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20"
                value={draft.footer}
                disabled={!canEdit}
                placeholder={draft.lang === 'bn' ? 'আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ' : 'Thank you for shopping with us'}
                onChange={(e) => set({ footer: e.target.value.slice(0, 80) })}
              />
              <span className="ref-helper mt-1 block font-normal">Printed at the bottom. Leave empty to use the default in the chosen language.</span>
            </label>
          </SettingCard>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-20 xl:self-start">
          <section className="rounded-xl border border-ink-100 bg-card shadow-card">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">Live preview</h2>
                <p className="text-xs text-ink-500">{invoiceDesigns.find((d) => d.id === shown.design)?.name} · {paperOptions.find((p) => p.id === shown.paper)?.label}{compare ? ' · current' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {dirty && <Segmented label="Compare" options={[{ id: 'draft', label: 'New' }, { id: 'saved', label: 'Current' }]} value={compare ? 'saved' : 'draft'} onChange={(id) => setCompare(id === 'saved')} />}
                <Button kind="ghost" onClick={() => setFeedback('This sample invoice is a UI preview; production printing will be connected in Phase 2.')} title="Print preview"><Printer className="size-4" />Print</Button>
              </div>
            </header>
            <div className="max-h-[70vh] overflow-auto bg-ink-50/70 p-4">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${shown.design}-${shown.paper}-${shown.lang}-${compare}`}
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="mx-auto w-fit shadow-pop"
                  style={{ zoom }}
                >
                  <InvoiceDocument {...shown} />
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </aside>
      </div>

      <SaveBar
        dirty={dirty}
        saving={false}
        readOnly={!canEdit}
        status={feedback || (canEdit ? 'UI preview only · No invoice changes are saved until Phase 2.' : 'Only the owner can edit this preview.')}
        dirtyLabel={feedback || `${changes.length} UI preview change${changes.length === 1 ? '' : 's'}: ${changes.join(', ')} (not saved)`}
        onSave={doSave}
        onDiscard={() => { setDraft(saved); setFeedback('Preview changes discarded. Business settings were not affected.'); }}
        onRestore={() => { setDraft({ ...defaultInvoiceDesign, content: { ...defaultInvoiceDesign.content } }); setFeedback('Source defaults loaded into this UI preview only.'); }}
        saveLabel="Save changes"
      />

      {feedback && <p role="status" className="text-xs text-ink-600">{feedback}</p>}

      {locked && (
        <Modal
          title="Premium invoice designs"
          onClose={() => setLocked(null)}
          footer={
            <>
              <Button onClick={() => setLocked(null)}>Keep current design</Button>
              <Button kind="primary" onClick={() => { setLocked(null); navigate('/app/subscription'); }}>
                <Crown className="size-4" />See Premium plan
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-[13px] text-ink-700">
              {locked === 'pad'
                ? 'Business Pad printing lets you print on your own pre-printed letterhead.'
                : locked === 'color'
                  ? 'Custom brand colors make every invoice match your shop.'
                  : `${invoiceDesigns.find((d) => d.id === locked)?.name} is one of 5 extra designs in Premium.`}{' '}
              Your current design stays as it is.
            </p>
            {locked !== 'pad' && locked !== 'color' && (
              <div className="max-h-[50vh] overflow-auto rounded-lg bg-ink-50 p-3">
                <div className="mx-auto w-fit shadow-card" style={{ zoom: 0.62 }}>
                  <InvoiceDocument {...draft} design={locked} paper="a4" />
                </div>
              </div>
            )}
            <p className="text-xs text-ink-500">Full Bangla invoices stay free on every plan.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

/** Contrast of a hex color against white paper (WCAG). */
function contrastRatio(hex: string): number {
  const m = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (lum + 0.05);
}
