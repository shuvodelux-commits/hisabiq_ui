import { useEffect, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Building2, ShoppingCart, Package, Truck, Wallet, Printer, Users, Bell, SlidersHorizontal, UserRound, ShieldCheck, Database, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { LogoLockup, LogoMark } from '../components/brand/Logo';
import { useTenantSettings } from './TenantSettingsProvider';
import { sectionNames } from './fields';
import type { SettingsSection } from './model';

const preferenceKey = 'hisabiq:settings-sidebar-collapsed';
const sections: { id: SettingsSection; icon: typeof BookOpen }[] = [
  { id: 'financialTerminology', icon: BookOpen },
  { id: 'business', icon: Building2 },
  { id: 'sales', icon: ShoppingCart },
  { id: 'products', icon: Package },
  { id: 'purchases', icon: Truck },
  { id: 'money', icon: Wallet },
  { id: 'invoices', icon: Printer },
  { id: 'team', icon: Users },
  { id: 'notifications', icon: Bell },
  { id: 'interface', icon: SlidersHorizontal },
  { id: 'personal', icon: UserRound },
  { id: 'security', icon: ShieldCheck },
  { id: 'data', icon: Database }
];

/** Replaces the ERP navigation while the dedicated Settings route is open.
 * On phone/tablet, the existing TopBar and horizontal SettingsTabs remain the navigation.
 */
export function SettingsWorkspaceSidebar() {
  const { personal } = useTenantSettings();
  const reduced = useReducedMotion();
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(preferenceKey) === 'true'; }
    catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem(preferenceKey, String(collapsed)); }
    catch { /* Browser storage is optional for this visual preference. */ }
  }, [collapsed]);
  const toggle = () => setCollapsed(v => !v);
  return <motion.aside
    data-print-hide data-settings-sidebar data-collapsible={collapsed ? 'icon' : 'none'}
    aria-label="Settings navigation"
    initial={false} animate={{ width: collapsed ? 64 : 282 }}
    transition={reduced ? { duration: 0 } : { duration: .18 }}
    className="sticky top-0 z-20 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar lg:flex">
    <div className={'flex h-[72px] shrink-0 items-center '+(collapsed?'justify-center px-1':'justify-between px-6')}>
      <Link to="/app/dashboard" aria-label="Return to HisabIQ dashboard"
        className="flex min-w-0 items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
        {collapsed ? <LogoMark size={28}/> : <LogoLockup size={30}/>}
      </Link>
      {!collapsed && <button type="button" onClick={toggle} title="Collapse Settings sidebar"
        aria-label="Collapse Settings sidebar" className="flex size-9 shrink-0 items-center justify-center rounded-md text-ink-600 hover:bg-sidebar-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
        <PanelLeftClose className="size-[17px]" aria-hidden="true"/>
      </button>}
    </div>
    {collapsed && <button type="button" onClick={toggle} title="Expand Settings sidebar"
      aria-label="Expand Settings sidebar" className="mx-auto mb-2 flex size-9 items-center justify-center rounded-lg text-ink-600 hover:bg-sidebar-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
      <PanelLeftOpen className="size-[17px]" aria-hidden="true"/>
    </button>}
    <div className={'flex shrink-0 items-center justify-between '+(collapsed?'px-2 pb-2':'px-6 pb-2 pt-1')}>
      {!collapsed && <span className="text-[12px] font-medium text-ink-500">{personal.language==='Bangla'?'সেটিংস':'Settings'}</span>}
      <button type="button" aria-label="Focus Search settings" title="Search settings"
        className={'flex size-8 items-center justify-center rounded-md text-ink-500 hover:bg-sidebar-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring '+(collapsed?'mx-auto':'')}
        onClick={()=>document.querySelector<HTMLInputElement>('input[aria-label="Search settings"]')?.focus()}>
        <Search className="size-[16px]" aria-hidden="true"/>
      </button>
    </div>
    <nav className={'min-h-0 flex-1 space-y-0.5 overflow-y-auto pb-5 '+(collapsed?'px-2':'px-2')}>
      {sections.map(({ id, icon: Icon }) => {
        const item = sectionNames[id];
        const label = personal.language === 'Bangla' ? item.bn : item.label;
        return <NavLink key={id} to={'/app/settings/'+id} aria-label={item.label+' · '+item.bn}
          title={collapsed ? label : undefined}
          className={({ isActive }) => 'relative flex h-11 w-full min-w-0 items-center rounded-md text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ' +
            (collapsed ? 'justify-center' : 'gap-3 px-4') +
            (isActive ? ' bg-accent text-primary before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary' : ' text-ink-700 hover:bg-sidebar-accent')}>
          <Icon className="size-[19px] shrink-0" aria-hidden="true"/>
          {!collapsed && <span className="truncate">{label}</span>}
        </NavLink>;
      })}
    </nav>
    <Link to="/app/dashboard" className={'m-2 flex h-10 shrink-0 items-center rounded-md border border-sidebar-border text-[12px] text-ink-600 hover:bg-sidebar-accent '+(collapsed?'justify-center':'justify-center px-3')}>
      {collapsed ? '↩' : (personal.language==='Bangla'?'মূল অ্যাপে ফিরুন':'Back to ERP')}
    </Link>
  </motion.aside>;
}
