import React,{useEffect,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {ChevronDown,ChevronRight} from 'lucide-react';
import {useTenantSettings} from '../../settings/TenantSettingsProvider';
import {canManage,type SettingsPermission} from '../../settings/model';
import {erpNavigation,erpRoutePaths,erpFeatureIds} from '../../navigation/erpNavigation';
import {getVisibleNavigation,resolveNavLocation} from '../../navigation/resolveErpNavigation';

type Props={mode:'desktop'|'mobile';onNavigate?:()=>void;collapsed?:boolean;onExpandSidebar?:()=>void};
export function ErpNavMenu({mode,onNavigate,collapsed=false,onExpandSidebar}:Props){
 const {state,actorId,personal}=useTenantSettings();
 const location=useLocation();
 const current=location.pathname+location.search;
 const nav=getVisibleNavigation(erpNavigation,{availablePaths:erpRoutePaths,enabledFeatures:erpFeatureIds,
  canAccess:permission=>permission==='owner'
   ?Boolean(state.sections.team.employees.find(e=>e.id===actorId)?.roleIds.includes('owner'))
   :canManage(state,actorId,permission as SettingsPermission)});
 const active=resolveNavLocation(current,nav);
 const [expanded,setExpanded]=useState<string|null>(active?.groupId??null);
 useEffect(()=>{if(active?.groupId)setExpanded(active.groupId);},[active?.groupId,location.pathname,location.search]);
 const label=(label:string,bn?:string)=>{
  const isBn=personal.language==='Bangla';
  return <span className="min-w-0 flex-1 leading-tight">
   <span className="block truncate text-[13px]">{isBn?(bn??label):label}</span>
   {personal.language!=='English'&&bn&&<span className="font-bn block truncate text-[10.5px] font-normal text-ink-400">{isBn?label:bn}</span>}
  </span>;
 };
 const row='group flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-500';
 return <nav aria-label={mode==='mobile'?'Mobile ERP navigation':'Main'} className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
  <p className={collapsed?'sr-only':'px-2 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-ink-400'}>Workspace</p>
  {nav.map((group,index)=>{
   const Icon=group.icon,open=expanded===group.id,selected=active?.groupId===group.id;
   const children=group.children??[],hasChildren=children.length>0;
   const childSelected=selected&&Boolean(active?.childId);
   const prefix=mode+'-erp-'+group.id;
   const last=group.id==='settings';
   return <div key={group.id} className={last?'mt-2 border-t border-border pt-2':'mt-0.5'}>
    {collapsed? <button type="button" aria-label={'Expand sidebar to open '+group.label}
      title={group.label} onClick={()=>onExpandSidebar?.()} className={row+' w-full justify-center py-2 '+(selected?'bg-card text-teal-700 shadow-card':'text-ink-600 hover:bg-card/70')}>
     <Icon className="size-4" aria-hidden="true"/>
    </button>
    :<div className={'flex min-w-0 items-stretch rounded-lg '+(selected?'bg-card text-ink shadow-card ring-1 ring-ink-100':'text-ink-600 hover:bg-card/70')}>
      <Link to={group.landingPath} onClick={onNavigate}
       aria-current={selected&&!childSelected?'page':undefined}
       className={row+' min-w-0 flex-1 font-medium'}>
        <Icon className={'size-4 shrink-0 '+(selected?'text-teal-700':'text-ink-400')} aria-hidden="true"/>
        {label(group.label,group.bn)}
        {group.id==='pos'&&<kbd className="rounded border border-border bg-card px-1 text-[10px] text-ink-400">F1</kbd>}
      </Link>
      {hasChildren&&<button type="button"
       aria-label={(open?'Collapse ':'Expand ')+group.label}
       aria-expanded={open} aria-controls={prefix}
       onClick={()=>setExpanded(open?null:group.id)}
       className="flex size-9 shrink-0 items-center justify-center rounded-r-lg text-ink-500 hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500">
       {open?<ChevronDown className="size-4"/>:<ChevronRight className="size-4"/>}
      </button>}
    </div>}
    {hasChildren&&!collapsed&&open&&<div id={prefix} className="mt-1 ml-5 space-y-0.5 border-l border-border pl-2">
     {children.map(child=>{
      const isCurrent=selected&&active?.childId===child.id;
      return <Link key={child.id} to={child.path} onClick={onNavigate}
       aria-current={isCurrent?'page':undefined}
       className={row+' w-full '+(isCurrent?'bg-teal-50 font-medium text-teal-700':'text-ink-500 hover:bg-card/70 hover:text-ink')}>
       {label(child.label,child.bn)}
      </Link>;
     })}
    </div>}
   </div>;
  })}
 </nav>;
}
