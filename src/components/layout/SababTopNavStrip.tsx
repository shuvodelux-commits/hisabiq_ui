import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVisibleErpNavigation, sectionedNav } from '../../navigation/useVisibleErpNavigation';
import type { ErpNavGroup } from '../../navigation/erpNavigation';

const EDGE = 12;
const PANEL_W = 232;

/** Direct Sabab TopNavStrip pattern: scrollable module row + viewport-clamped
 * chevron popover. HisabIQ routes, permissions and colors are wired in place.
 */
export function SababTopNavStrip() {
  const { nav, active, personal, location } = useVisibleErpNavigation();
  const reducedMotion = useReducedMotion();
  const sections = sectionedNav(nav);
  const items = sections.flatMap(s => s.groups);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const anchors = useRef<Record<string, HTMLLIElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<number>();
  const openItem = items.find(item => item.id === openId);
  const canHover = typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isBangla = personal.language === 'Bangla';
  const labelFor = (label: string, bn?: string) => isBangla ? (bn ?? label) : label;
  const activeModule = active?.groupId;

  const close = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    setOpenId(null);
  }, []);
  const show = useCallback((id: string) => {
    window.clearTimeout(closeTimer.current);
    const anchor = anchors.current[id];
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const left = Math.max(EDGE, Math.min(r.left, vw - PANEL_W - EDGE));
    setPos({ top: r.bottom + 4, left });
    setOpenId(id);
  }, []);
  const hideSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(close, 160);
  };

  useEffect(() => close(), [location.pathname, location.search, close]);
  useEffect(() => {
    if (!openId) return;
    const outside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchors.current[openId]?.contains(target)) return;
      close();
    };
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      const trigger = anchors.current[openId]?.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]');
      close();
      trigger?.focus({ preventScroll: true });
    };
    const scroll = (event: Event) => {
      if (!panelRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('mousedown', outside);
    document.addEventListener('touchstart', outside);
    document.addEventListener('keydown', keydown);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', outside);
      document.removeEventListener('touchstart', outside);
      document.removeEventListener('keydown', keydown);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', close);
    };
  }, [openId, close]);

  // The active module stays in view when moving across pages or query-based tabs.
  useEffect(() => {
    const current = items.find(item => item.id === activeModule);
    const el = current && anchors.current[current.id];
    const strip = stripRef.current;
    if (!el || !strip) return;
    const offset = el.offsetLeft - 52;
    if (offset < strip.scrollLeft || el.offsetLeft + el.offsetWidth > strip.scrollLeft + strip.clientWidth - 52)
      strip.scrollTo({ left: offset, behavior: reducedMotion ? 'instant' : 'smooth' });
  }, [activeModule, reducedMotion, personal.language]);

  const measure = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    setEdges({ left: strip.scrollLeft > 2, right: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    measure();
    strip.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(strip);
    return () => { strip.removeEventListener('scroll', measure); ro.disconnect(); };
  }, [measure, personal.language]);
  const nudge = (dir: 1 | -1) => {
    const strip = stripRef.current;
    if (strip) strip.scrollBy({
      left: dir * Math.max(160, strip.clientWidth * 0.6),
      behavior: reducedMotion ? 'instant' : 'smooth'
    });
  };

  const edgeButton = 'absolute top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-ink-500 shadow-sm hover:border-primary/40 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring';
  const menuVariants = {
    hidden: { opacity: 0, scale: 0.97, y: -4 },
    show: { opacity: 1, scale: 1, y: 0,
      transition: { duration: reducedMotion ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] as const } },
    exit: { opacity: 0, scale: 0.98,
      transition: { duration: reducedMotion ? 0 : 0.09, ease: [0.4, 0, 1, 1] as const } }
  };
  const renderModule = (item: ErpNavGroup) => {
    const activeItem = activeModule === item.id;
    const tabs = item.children ?? [];
    const hasTabs = tabs.length > 0;
    const name = labelFor(item.label, item.bn);
    const target = tabs[0]?.path ?? item.landingPath;
    return (
      <li
        key={item.id}
        data-module-id={item.id}
        ref={node => { anchors.current[item.id] = node; }}
        className="shrink-0"
        onMouseEnter={hasTabs && canHover ? () => show(item.id) : undefined}
        onMouseLeave={hasTabs && canHover ? hideSoon : undefined}
      >
        <div className={'flex h-8 items-center rounded-md transition-colors ' +
          (activeItem ? 'bg-accent text-accent-foreground' :
            'text-ink-500 hover:bg-muted hover:text-ink') +
          (openId === item.id && !activeItem ? ' bg-muted text-ink' : '')}>
          <Link
            to={target}
            aria-current={activeItem ? 'page' : undefined}
            className={'flex h-full items-center gap-1.5 rounded-md pl-2.5 text-[13px] font-medium ' +
              (hasTabs ? 'pr-1' : 'pr-2.5')}
          >
            <item.icon className={'size-4 shrink-0 ' + (activeItem ? 'text-primary' : 'text-ink-400')} aria-hidden="true"/>
            <span className={'whitespace-nowrap ' + (isBangla ? 'font-bn' : '')}>{name}</span>
          </Link>
          {hasTabs && (
            <button
              type="button"
              aria-label={item.label + ' tabs'}
              aria-haspopup="menu"
              aria-expanded={openId === item.id}
              onClick={() => openId === item.id ? close() : show(item.id)}
              className="grid h-full w-6 place-items-center rounded-md text-ink-400 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronDown className={'size-3.5 transition-transform ' +
                (openId === item.id ? 'rotate-180' : '')} aria-hidden="true"/>
            </button>
          )}
        </div>
      </li>
    );
  };

  return (
    <nav data-sabab-nav-strip="" aria-label="ERP modules"
      className="relative border-t border-border lg:hidden">
      {edges.left && (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-12 bg-card/90"/>
          <button type="button" onClick={() => nudge(-1)} aria-label="Scroll modules left" className={edgeButton + ' left-2'}>
            <ChevronLeft className="size-4"/>
          </button>
        </>
      )}
      {edges.right && (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-12 bg-card/90"/>
          <button type="button" onClick={() => nudge(1)} aria-label="Scroll modules right" className={edgeButton + ' right-2'}>
            <ChevronRight className="size-4"/>
          </button>
        </>
      )}
      <ul ref={stripRef} className="flex scroll-px-12 items-center gap-0.5 overflow-x-auto px-2 py-1.5 [scrollbar-width:none] sm:px-3 [&::-webkit-scrollbar]:hidden">
        {sections.map((section, i) => (
          <Fragment key={section.label}>
            {i > 0 && <li aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border"/>}
            {section.groups.map(renderModule)}
          </Fragment>
        ))}
      </ul>
      {createPortal(
        <AnimatePresence>
          {openItem && openItem.children?.length && pos && (
            <motion.div
              key={openItem.id}
              ref={panelRef}
              role="menu"
              aria-label={openItem.label + ' tabs'}
              data-floating-layer=""
              onMouseEnter={() => window.clearTimeout(closeTimer.current)}
              onMouseLeave={hideSoon}
              variants={menuVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{ position: 'fixed', top: pos.top, left: pos.left,
                width: PANEL_W, transformOrigin: 'top left' }}
              className="z-[100] rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-pop"
            >
              <p className="flex items-center gap-2 px-2 pb-1.5 pt-1 text-[13px] font-semibold">
                <openItem.icon className="size-4 text-primary" aria-hidden="true"/>
                {labelFor(openItem.label, openItem.bn)}
              </p>
              <ul className="space-y-0.5">
                {openItem.children.map(child => (
                  <li key={child.id}>
                    <Link
                      to={child.path}
                      role="menuitem"
                      aria-current={active?.childId === child.id ? 'page' : undefined}
                      onClick={close}
                      className={'flex min-h-8 items-center rounded-md px-2 text-[13px] transition-colors ' +
                        (active?.childId === child.id && activeModule === openItem.id
                          ? 'bg-accent font-medium text-accent-foreground'
                          : 'text-ink-500 hover:bg-muted hover:text-ink')}
                    >
                      {labelFor(child.label, child.bn)}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </nav>
  );
}
