import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Palette, LifeBuoy } from 'lucide-react';
import { useTenantSettings } from '../../settings/TenantSettingsProvider';
import { LogoLockup, LogoMark } from '../brand/Logo';
import { ErpNavMenu } from './ErpNavMenu';
import { SidebarTrigger } from './SidebarTrigger';

const COLLAPSED_KEY = 'hisabiq:sidebar-collapsed';

function getInitialCollapsed() {
  try { return window.localStorage.getItem(COLLAPSED_KEY) === 'true'; }
  catch { return false; }
}

export function Sidebar() {
  const { state } = useTenantSettings();
  const [collapsed, setCollapsed] = useState(getInitialCollapsed);
  const businessName = state.sections.business.name || 'Business';
  const businessInitials = businessName.trim().split(/\s+/).slice(0, 2).map(part => part[0] || '').join('').toUpperCase() || 'HQ';

  useEffect(() => {
    try { window.localStorage.setItem(COLLAPSED_KEY, String(collapsed)); }
    catch { /* Storage may be blocked; local navigation still works. */ }
  }, [collapsed]);

  // The standard shadcn SidebarTrigger shortcut works from the whole workspace.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setCollapsed(previous => !previous);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const linkStyle = 'flex min-h-10 items-center rounded-lg text-[13px] text-ink-600 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring';
  return <aside
    data-print-hide
    data-sidebar="sidebar"
    data-collapsible={collapsed ? 'icon' : 'none'}
    className={'group/sidebar relative sticky top-0 z-20 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-linear lg:flex ' +
      (collapsed ? 'w-[64px]' : 'w-[256px]')}
  >
    <div className={'flex h-14 shrink-0 items-center ' + (collapsed ? 'justify-center px-1' : 'justify-between px-3')}>
      <Link
        to="/app/dashboard"
        aria-label="HisabIQ dashboard"
        title={collapsed ? 'HisabIQ dashboard' : undefined}
        className="flex min-w-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        {collapsed ? <LogoMark size={28} /> : <LogoLockup size={26} />}
      </Link>
      {!collapsed &&
        <SidebarTrigger collapsed={collapsed} onToggle={() => setCollapsed(value => !value)} />}
    </div>

    {collapsed ? (
      <div className="flex shrink-0 flex-col items-center gap-1 border-b border-sidebar-border pb-3">
        <SidebarTrigger collapsed={collapsed} onToggle={() => setCollapsed(false)} />
        <span
          title={businessName + ' · Main branch · Dhaka'}
          aria-label={'Current business: ' + businessName}
          className="mt-1 flex size-9 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent text-xs font-semibold text-sidebar-primary"
        >
          {businessInitials}
        </span>
      </div>
    ) : (
      <div className="mx-3 mb-2 flex shrink-0 items-center gap-2.5 rounded-lg border border-sidebar-border bg-card px-2.5 py-2.5 shadow-card">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-xs font-semibold text-sidebar-primary">
          {businessInitials}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-semibold text-sidebar-foreground" title={businessName}>
            {businessName}
          </span>
          <span className="mt-1 block truncate text-[11px] text-ink-500">Main branch · Dhaka</span>
        </span>
      </div>
    )}

    <ErpNavMenu mode="desktop" collapsed={collapsed} onExpandSidebar={() => setCollapsed(false)} />

    <div className={'shrink-0 space-y-0.5 border-t border-sidebar-border py-2 ' + (collapsed ? 'px-2' : 'px-3')}>
      <Link to="/app/support" aria-label="Help & Support" title={collapsed ? 'Help & Support' : undefined}
        className={linkStyle + ' ' + (collapsed ? 'justify-center' : 'gap-2.5 px-2.5')}>
        <LifeBuoy className="size-[18px] shrink-0 text-ink-400" aria-hidden="true" />
        {!collapsed && <span>Help & Support</span>}
      </Link>
      <Link to="/design-system" aria-label="Brand guide" title={collapsed ? 'Brand guide' : undefined}
        className={linkStyle + ' ' + (collapsed ? 'justify-center' : 'gap-2.5 px-2.5')}>
        <Palette className="size-[18px] shrink-0 text-ink-400" aria-hidden="true" />
        {!collapsed && <span>Brand guide</span>}
      </Link>
    </div>
    <button
      type="button"
      aria-label="Toggle sidebar width"
      title="Toggle sidebar width"
      onClick={() => setCollapsed(value => !value)}
      className="absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-pointer rounded-full hover:bg-sidebar-primary/15 focus-visible:bg-sidebar-primary/20 focus-visible:outline-none lg:block"
    />
  </aside>;
}
