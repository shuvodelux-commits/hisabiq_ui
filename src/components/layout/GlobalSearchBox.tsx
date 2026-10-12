import {useEffect,useId,useMemo,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {ArrowUpRight,Search,X} from 'lucide-react';
import {useTenantSettings} from '../../settings/TenantSettingsProvider';
import {globalSearchRecords} from '../../utils/globalSearchRecords';
import {searchResults,type SearchResult} from '../../utils/globalSearch';

/** Instant, keyboard-accessible global ERP search. Never submits to a separate results page. */
export function GlobalSearchBox(){
 const {state,actorId,personal}=useTenantSettings();
 const navigate=useNavigate();
 const location=useLocation();
 const [query,setQuery]=useState('');
 const [open,setOpen]=useState(false);
 const [active,setActive]=useState(0);
 const field=useRef<HTMLInputElement>(null);
 const root=useRef<HTMLDivElement>(null);
 const listId=useId();
 const records=useMemo(()=>globalSearchRecords(state,actorId,personal.language),[state,actorId,personal.language,query]);
 const results=useMemo(()=>query.trim()?searchResults(records,query,personal.searchMode??'Default').slice(0,8):[],[query,records,personal.searchMode]);
 const visible=open&&Boolean(query.trim());
 const selected=Math.min(active,Math.max(0,results.length-1));
 const openResult=(item:SearchResult)=>{
  setOpen(false);setQuery('');setActive(0);
  navigate(item.path);
 };
 useEffect(()=>{
  setOpen(false);setQuery('');setActive(0);
 },[location.pathname,location.search]);
 useEffect(()=>{
  const shortcut=(event:KeyboardEvent)=>{
   if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
    if(Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"],[data-slot="dialog-content"]'))
      .some(dialog=>dialog.getClientRects().length))return;
    event.preventDefault();
    field.current?.focus();field.current?.select();
    if(field.current?.value.trim())setOpen(true);
   }
  };
  window.addEventListener('keydown',shortcut);
  return()=>window.removeEventListener('keydown',shortcut);
 },[]);
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{
   if(!root.current?.contains(event.target as Node))setOpen(false);
  };
  document.addEventListener('pointerdown',outside);
  return()=>document.removeEventListener('pointerdown',outside);
 },[open]);
 const clear=()=>{setQuery('');setOpen(false);setActive(0);field.current?.focus();};
 return <div ref={root} role="search" className="relative order-last w-full min-w-0 basis-full sm:order-none sm:max-w-md sm:basis-auto sm:flex-1">
  <Search className="pointer-events-none absolute left-3 top-[10px] z-10 size-4 text-ink-400" aria-hidden="true"/>
  <input ref={field} type="search" aria-label="Global search" role="combobox"
   aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={visible}
   aria-controls={visible?listId:undefined}
   aria-activedescendant={visible&&results.length?listId+'-option-'+selected:undefined}
   autoComplete="off" value={query}
   onChange={event=>{setQuery(event.target.value);setOpen(!!event.target.value.trim());setActive(0);}}
   onFocus={()=>{if(query.trim())setOpen(true);}}
   onKeyDown={event=>{
    if(event.key==='Escape'){if(visible){event.preventDefault();setOpen(false);}else if(query){clear();}return;}
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
     event.preventDefault();setOpen(true);setActive(index=>results.length?(index+(event.key==='ArrowDown'?1:-1)+results.length)%results.length:0);
     return;
    }
    if(event.key==='Enter'){
     event.preventDefault();const first=results[selected]??results[0];
     if(first)openResult(first);
    }
    if(event.key==='Tab')setOpen(false);
   }}
   placeholder="Search products, parties, invoices…" className="h-9 w-full min-w-0 appearance-none rounded-lg border border-border bg-ink-50 pl-9 pr-11 text-sm text-ink placeholder:text-ink-400 focus:border-teal-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-teal-500/20 [&::-webkit-search-cancel-button]:hidden"/>
  {query?<button type="button" aria-label="Clear global search" title="Clear"
    onMouseDown={event=>event.preventDefault()} onClick={clear}
    className="absolute right-1.5 top-[4px] flex size-7 items-center justify-center rounded-md text-ink-400 hover:bg-ink-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30">
    <X className="size-4" aria-hidden="true"/>
   </button>:<kbd className="pointer-events-none absolute right-2 top-[8px] hidden rounded border border-ink-200 bg-card px-1.5 py-0.5 text-[10px] text-ink-500 sm:block">Ctrl K</kbd>}
  {visible&&<div className="absolute inset-x-0 top-full z-[80] mt-2 overflow-hidden rounded-xl border border-border bg-popover text-ink shadow-xl">
   <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-[11px] text-ink-500">
    <span>{personal.searchMode==='Advanced'?'Advanced fuzzy search':'Instant search'} · {results.length} {results.length===1?'match':'matches'}{results.length===8?' shown':''}</span>
    <span className="hidden sm:inline">↑↓ Navigate · Enter Open · Esc Close</span>
   </div>
   <div id={listId} role="listbox" aria-label="Global search suggestions" className="max-h-[min(60vh,360px)] overflow-auto p-1 scrollbar-thin">
    {results.length?results.map((item,index)=><button key={item.kind+':'+item.id+':'+item.path}
      id={listId+'-option-'+index} type="button" role="option" aria-selected={selected===index}
      onMouseDown={event=>event.preventDefault()}
      onMouseEnter={()=>setActive(index)} onClick={()=>openResult(item)}
      className={'flex min-h-12 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 '+(selected===index?'bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-200':'hover:bg-ink-50')}>
      <span className="min-w-0 flex-1"><span className="block truncate font-medium">{item.label}</span>
       <span className="block truncate text-xs text-ink-500">{item.helper}</span></span>
      <span className="shrink-0 text-[10px] text-ink-500">{item.kind}</span>
      <ArrowUpRight className="size-3.5 shrink-0 text-ink-400" aria-hidden="true"/>
     </button>):<p role="status" className="px-3 py-5 text-sm text-ink-500">No matching records. Try fewer words. <span lang="bn">আরেকবার খুঁজুন।</span></p>}
   </div>
   <div className="border-t border-border px-3 py-2 text-[11px] text-ink-500">Preview search · Only records and modules you can access</div>
  </div>}
 </div>;
}
