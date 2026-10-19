import { useId } from 'react';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { MotionNavIndicator } from '../../motion/MotionNavIndicator';
import { useEffect, useState } from 'react';

const MotionLink = motion(Link);

import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTenantSettings } from '../../settings/TenantSettingsProvider';
import { canManage, type SettingsPermission } from '../../settings/model';
import { erpNavigation, erpRoutePaths, erpFeatureIds } from '../../navigation/erpNavigation';
import { getVisibleNavigation, resolveNavLocation } from '../../navigation/resolveErpNavigation';

type Props = {
  mode: 'desktop' | 'mobile';
  onNavigate?: () => void;
  collapsed?: boolean;
  onExpandSidebar?: () => void;
};

/**
 * Shadcn sidebar-07 navigation pattern: one full-width trigger per expandable
 * group, with a chevron inside the trigger and leaf links underneath it.
 * Opening a group never changes the route; leaf links do.
 */
export function ErpNavMenu({ mode, onNavigate, collapsed = false, onExpandSidebar }: Props) {
  const { state, actorId, personal } = useTenantSettings();
  const location = useLocation();
  const navScope=useId();
  const reducedMotion=useReducedMotion();
  const canHover=typeof window!=='undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hoverMotion=canHover&&!reducedMotion ? { backgroundColor: 'var(--sidebar-accent)' } : undefined;
  const current = location.pathname + location.search;
  const nav = getVisibleNavigation(erpNavigation, {
    availablePaths: erpRoutePaths,
    enabledFeatures: erpFeatureIds,
    canAccess: permission => permission === 'owner'
      ? Boolean(state.sections.team.employees.find(e => e.id === actorId)?.roleIds.includes('owner'))
      : canManage(state, actorId, permission as SettingsPermission)
  });
  const active = resolveNavLocation(current, nav);
  const [expanded, setExpanded] = useState<string | null>(active?.groupId ?? null);
  useEffect(() => {
    if (active?.groupId) setExpanded(active.groupId);
  }, [active?.groupId, location.pathname, location.search]);

  const labelFor = (name: string, bangla?: string) => personal.language === 'Bangla' ? (bangla ?? name) : name;
  const bilingualLabel = (name: string, bangla?: string) => {
    const isBangla = personal.language === 'Bangla';
    return <span className="min-w-0 flex-1 text-left leading-[1.25]">
      <span className="block truncate text-[13px] font-medium">{isBangla ? (bangla ?? name) : name}{' '}</span>
      {personal.language === 'English + Bangla' && bangla &&
        <span className="font-bn mt-0.5 block truncate text-[10.5px] font-normal text-ink-400">
          {bangla}
        </span>}
    </span>;
  };

  const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar';
  const baseRow = 'group flex w-full min-w-0 items-center gap-2.5 rounded-lg text-left motion-nav-row ' + focus;
  const parentRow = baseRow + ' min-h-10 px-2.5 py-2';
  const collapsedRow = baseRow + ' mx-auto size-10 justify-center px-0';
  const activeParent = 'text-sidebar-accent-foreground';
  const idleParent = 'text-ink-600 hover:text-sidebar-foreground';

  return <LayoutGroup id={navScope}><nav
    aria-label={personal.language === 'Bangla' ? (mode === 'mobile' ? 'মোবাইল ERP মেনু' : 'মূল মেনু') : (mode === 'mobile' ? 'Mobile ERP navigation' : 'Main')}
    className={'min-h-0 flex-1 overflow-x-hidden overflow-y-auto py-2 scrollbar-thin ' + (collapsed ? 'px-1.5' : 'px-2.5')}
  >
    <p className={collapsed
      ? 'sr-only'
      : 'px-3 pb-2 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400'}>
      {personal.language === 'Bangla' ? 'কাজের মেনু' : 'Workspace'}
    </p>
    <div className="space-y-0.5">
      {nav.map(group => {
        const Icon = group.icon;
        const children = group.children ?? [];
        const hasChildren = children.length > 0;
        const open = expanded === group.id;
        const selected = active?.groupId === group.id;
        const childSelected = selected && Boolean(active?.childId);
        const panelId = mode + '-erp-' + group.id;
        const separate = group.id === 'settings';
        const parentTitle = personal.language === 'Bangla' ? (open ? 'বন্ধ করুন: ' : 'খুলুন: ') + labelFor(group.label, group.bn) : (open ? 'Collapse ' : 'Expand ') + group.label + (personal.language === 'English + Bangla' && group.bn ? ' ' + group.bn : '');
        const highlighted = selected ? activeParent : idleParent;
        return <div key={group.id} className={separate ? 'mt-3 border-t border-sidebar-border pt-3' : ''}>
          {collapsed ? (
            hasChildren ? <motion.button
              type="button"
              aria-label={personal.language === 'Bangla' ? 'সাইডবার খুলে ' + labelFor(group.label, group.bn) + ' দেখুন' : 'Expand sidebar to open ' + group.label}
              title={labelFor(group.label, group.bn)}
              aria-current={selected ? 'page' : undefined}
              onClick={() => { setExpanded(group.id); onExpandSidebar?.(); }}
              whileHover={hoverMotion} transition={{ duration: 0.11 }}
              className={collapsedRow + ' ' + highlighted}
            >
              <MotionNavIndicator active={selected} layoutId="erp-parent-selection" />
              <Icon className="size-[18px] shrink-0" aria-hidden="true"/>
            </motion.button> : <MotionLink
              to={group.landingPath}
              aria-label={labelFor(group.label, group.bn)}
              title={labelFor(group.label, group.bn)}
              aria-current={selected ? 'page' : undefined}
              onClick={onNavigate}
              whileHover={hoverMotion} transition={{ duration: 0.11 }}
              className={collapsedRow + ' ' + highlighted}
            >
              <MotionNavIndicator active={selected} layoutId="erp-parent-selection" />
              <Icon className="size-[18px] shrink-0" aria-hidden="true"/>
            </MotionLink>
          ) : (
            hasChildren ? <motion.button
              type="button"
              aria-label={parentTitle}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setExpanded(open ? null : group.id)}
              whileHover={hoverMotion} transition={{ duration: 0.11 }}
              className={parentRow + ' ' + highlighted}
            >
              <MotionNavIndicator active={selected} layoutId="erp-parent-selection" />
              <Icon className={'size-[18px] shrink-0 ' + (selected ? 'text-sidebar-primary' : 'text-ink-400')} aria-hidden="true"/>
              {bilingualLabel(group.label, group.bn)}
              <ChevronRight aria-hidden="true"
                className={'ml-auto size-4 shrink-0 text-ink-400 transition-transform duration-200 ' + (open ? 'rotate-90' : '')}
              />
            </motion.button> : <MotionLink
              to={group.landingPath}
              aria-current={selected && !childSelected ? 'page' : undefined}
              onClick={onNavigate}
              whileHover={hoverMotion} transition={{ duration: 0.11 }}
              className={parentRow + ' ' + highlighted}
            >
              <MotionNavIndicator active={selected} layoutId="erp-parent-selection" />
              <Icon className={'size-[18px] shrink-0 ' + (selected ? 'text-sidebar-primary' : 'text-ink-400')} aria-hidden="true"/>
              {bilingualLabel(group.label, group.bn)}
              {group.id === 'pos' &&
                <kbd className="ml-auto rounded border border-sidebar-border px-1.5 py-0.5 text-[10px] font-normal text-ink-400">F1</kbd>}
            </MotionLink>
          )}
          {hasChildren && !collapsed && (
            <div
              id={panelId}
              role="group"
              aria-label={personal.language === 'Bangla' ? labelFor(group.label, group.bn) + ' এর অংশ' : group.label + ' sections'}
              hidden={!open}
              className="mb-1 ml-[18px] mt-1 space-y-0.5 border-l border-sidebar-border pl-3"
            >
              {children.map(child => {
                const isCurrent = selected && active?.childId === child.id;
                return <MotionLink
                  key={child.id}
                  to={child.path}
                  aria-current={isCurrent ? 'page' : undefined}
                  onClick={onNavigate}
                  whileHover={hoverMotion} transition={{ duration: 0.11 }}
                  className={baseRow + ' min-h-9 px-2.5 py-1.5 ' +
                    (isCurrent
                      ? 'font-medium text-sidebar-primary'
                      : 'text-ink-500 hover:text-sidebar-foreground')}
                >
                  <MotionNavIndicator active={isCurrent} layoutId="erp-child-selection" />
                  {bilingualLabel(child.label, child.bn)}
                </MotionLink>;
              })}
            </div>
          )}
        </div>;
      })}
    </div>
  </nav></LayoutGroup>;
}
