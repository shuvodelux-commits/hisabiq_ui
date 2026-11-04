import { useLocation } from 'react-router-dom';
import { useTenantSettings } from '../settings/TenantSettingsProvider';
import { canManage, type SettingsPermission } from '../settings/model';
import { erpNavigation, erpRoutePaths, erpFeatureIds, type ErpNavGroup } from './erpNavigation';
import { getVisibleNavigation, resolveNavLocation } from './resolveErpNavigation';

/** The existing HisabIQ route and permission system, shared by both Sabab-style navs. */
export function useVisibleErpNavigation() {
  const { state, actorId, personal } = useTenantSettings();
  const location = useLocation();
  const nav = getVisibleNavigation(erpNavigation, {
    availablePaths: erpRoutePaths,
    enabledFeatures: erpFeatureIds,
    canAccess: permission => permission === 'owner'
      ? Boolean(state.sections.team.employees.find(e => e.id === actorId)?.roleIds.includes('owner'))
      : canManage(state, actorId, permission as SettingsPermission)
  });
  return {
    nav,
    active: resolveNavLocation(location.pathname + location.search, nav),
    personal,
    location
  };
}

export const navSections: readonly { label: string; bn: string; ids: readonly string[] }[] = [
  { label: 'Workspace', bn: 'কাজের জায়গা', ids: ['dashboard', 'pos', 'counter'] },
  { label: 'Business', bn: 'ব্যবসা', ids: ['sales', 'purchases', 'vendor', 'products', 'parties'] },
  { label: 'Money & Accounts', bn: 'টাকা ও হিসাব', ids: ['expenses', 'finance', 'accounts', 'daybook'] },
  { label: 'Manage', bn: 'পরিচালনা', ids: ['warranty', 'reports', 'settings'] }
];

/** Preserve the source order of erpNavigation; category labels are presentation only. */
export function sectionedNav(nav: readonly ErpNavGroup[]) {
  return navSections.map(section => ({
    ...section,
    groups: nav.filter(item => section.ids.includes(item.id))
  })).filter(section => section.groups.length);
}
