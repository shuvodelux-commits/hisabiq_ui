import React,{useState} from 'react';
import {Link} from 'react-router-dom';
import {ChevronsUpDown,Palette,PanelLeftClose,PanelLeftOpen,LifeBuoy} from 'lucide-react';
import {useTenantSettings} from '../../settings/TenantSettingsProvider';
import {LogoLockup,LogoMark} from '../brand/Logo';
import {ErpNavMenu} from './ErpNavMenu';

export function Sidebar(){
 const {state}=useTenantSettings();
 const [collapsed,setCollapsed]=useState(false);
 return <aside data-print-hide className={'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-sidebar transition-[width] lg:flex '+(collapsed?'w-[68px]':'w-[236px]')}>
  <div className="flex h-14 items-center justify-between gap-1 px-3">
   <Link to="/app/dashboard" aria-label="HisabIQ dashboard" className="min-w-0">
    {collapsed?<LogoMark size={27}/>:<LogoLockup size={26}/>}
   </Link>
   {!collapsed&&<button type="button" aria-label="Collapse sidebar" title="Collapse sidebar" onClick={()=>setCollapsed(true)}
    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500">
    <PanelLeftClose className="size-4"/>
   </button>}
  </div>
  {collapsed?<button type="button" aria-label="Expand sidebar" title="Expand sidebar" onClick={()=>setCollapsed(false)}
   className="mx-auto mb-2 flex size-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50">
   <PanelLeftOpen className="size-4"/>
  </button>:<div className="mx-3 mb-2 flex items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-2 shadow-card">
   <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-xs font-semibold text-teal-700">NH</span>
   <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium text-ink">{state.sections.business.name}</span>
    <span className="block truncate text-[11px] text-ink-500">Main branch · Dhaka</span></span>
   <ChevronsUpDown className="size-3.5 text-ink-400" aria-hidden="true"/>
  </div>}
  <ErpNavMenu mode="desktop" collapsed={collapsed} onExpandSidebar={()=>setCollapsed(false)}/>
  <div className="space-y-0.5 border-t border-border p-2">
   <Link to="/app/support" aria-label="Help & support" title="Help & support" className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-ink-600 hover:bg-card/70 hover:text-ink">
    <LifeBuoy className="size-4 shrink-0 text-ink-400"/>{!collapsed&&'Help & Support'}
   </Link>
   <Link to="/design-system" aria-label="Brand guide" title="Brand guide" className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-ink-600 hover:bg-card/70 hover:text-ink">
    <Palette className="size-4 shrink-0 text-ink-400"/>{!collapsed&&'Brand guide'}
   </Link>
  </div>
 </aside>;
}
