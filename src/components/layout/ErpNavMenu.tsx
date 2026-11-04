import { useId } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useVisibleErpNavigation, sectionedNav } from '../../navigation/useVisibleErpNavigation';
import { useUiCopy } from '../../i18n/useUiCopy';

const MotionLink = motion(Link);
type Props = {
  mode: 'desktop' | 'mobile';
  onNavigate?: () => void;
  collapsed?: boolean;
  onExpandSidebar?: () => void;
};

/** Direct Sabab NavTree pattern. The active module reveals its child links only.
 * HisabIQ route, permission and bilingual data are kept as the source of truth.
 */
export function ErpNavMenu({ mode, onNavigate, collapsed = false }: Props) {
  const { nav, active, personal } = useVisibleErpNavigation();
  const { text } = useUiCopy();
  const scope = useId();
  const reduce = useReducedMotion();
  const isBangla = personal.language === 'Bangla';
  const both = personal.language === 'English + Bangla';
  const sections = sectionedNav(nav);
  const labelFor = (label: string, bn?: string) => isBangla ? (bn ?? label) : label;

  return (
    <LayoutGroup id={scope}>
      <nav
        data-sabab-nav-tree=""
        className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-2.5 py-2 scrollbar-thin"
        aria-label={mode === 'mobile' ? text('Mobile ERP navigation','মোবাইল ERP মেনু') : text('Main','মূল মেনু')}
      >
        {sections.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                {labelFor(section.label, section.bn)}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.groups.map(group => {
                const Icon = group.icon;
                const selected = active?.groupId === group.id;
                const children = group.children ?? [];
                const target = children[0]?.path ?? group.landingPath;
                const name = labelFor(group.label, group.bn);
                return (
                  <li key={group.id}>
                    <MotionLink
                      to={target}
                      onClick={onNavigate}
                      aria-current={selected ? 'page' : undefined}
                      aria-label={collapsed ? name : undefined}
                      title={collapsed ? name : undefined}
                      data-nav-module={group.id}
                      className={
                        'group relative flex min-h-9 w-full min-w-0 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring ' +
                        (collapsed ? 'mx-auto size-10 justify-center px-0 ' : '') +
                        (selected ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground')
                      }
                    >
                      {selected && (
                        <motion.span
                          aria-hidden="true"
                          layoutId={reduce ? undefined : 'sabab-nav-indicator'}
                          initial={false}
                          className="pointer-events-none absolute inset-0 rounded-lg bg-sidebar-accent"
                          transition={{ duration: reduce ? 0 : 0.18 }}
                        />
                      )}
                      <Icon
                        aria-hidden="true"
                        className={
                          'relative size-[18px] shrink-0 transition-[color,transform] duration-150 motion-reduce:transition-none ' +
                          (selected ? 'text-sidebar-primary' : 'text-ink-400 group-hover:translate-x-0.5 group-hover:text-sidebar-primary')
                        }
                      />
                      {!collapsed && (
                        <span className="relative min-w-0 flex-1 truncate">
                          <span className={isBangla ? 'font-bn' : ''}>{name}</span>
                          {both && group.bn && <span className="font-bn ml-1 text-[10.5px] font-normal text-ink-400">{group.bn}</span>}
                        </span>
                      )}
                      {!collapsed && children.length > 0 && (
                        <ChevronRight
                          aria-hidden="true"
                          className={'relative size-3.5 shrink-0 text-ink-400 transition-transform duration-150 ' + (selected ? 'rotate-90' : '')}
                        />
                      )}
                      {!collapsed && group.id === 'pos' && <kbd className="relative ml-auto rounded border border-border px-1 text-[10px] font-normal text-ink-400">F1</kbd>}
                    </MotionLink>
                    {!collapsed && children.length > 0 && selected && (
                      <ul className="ml-[22px] mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2.5">
                        {children.map(child => {
                          const current = active?.childId === child.id;
                          return (
                            <li key={child.id}>
                              <Link
                                to={child.path}
                                onClick={onNavigate}
                                aria-current={current ? 'page' : undefined}
                                className={
                                  'relative flex min-h-8 items-center rounded-md px-2 text-[12.5px] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring ' +
                                  (current
                                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground before:absolute before:-left-[11px] before:top-1.5 before:h-5 before:w-0.5 before:rounded-full before:bg-sidebar-primary'
                                    : 'text-ink-500 hover:bg-sidebar-accent hover:text-sidebar-foreground')
                                }
                              >
                                {labelFor(child.label, child.bn)}
                                {both && child.bn && <span className="font-bn ml-1 text-[10.5px] text-ink-400">{child.bn}</span>}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </LayoutGroup>
  );
}
