import React,{createContext,useContext,useEffect,useState} from 'react';
import {X,Info} from 'lucide-react';
import {LayoutGroup,motion,useReducedMotion} from 'framer-motion';
import {MotionTabIndicator,MotionTabList} from '../hisabiq-library/motion/MotionTabList';
import {MOTION_EASE} from '../hisabiq-library/motion/tokens';
import {AppSelect} from '../hisabiq-library/components/AppSelect';
export function Button({children,onClick,kind='outline',type='button',disabled=false,className='',title,workflow=false}:{children:React.ReactNode;onClick?:()=>void;kind?:'primary'|'outline'|'danger'|'ghost';type?:'button'|'submit';disabled?:boolean;className?:string;title?:string;workflow?:boolean}){
return <button type={type} onClick={onClick} disabled={disabled} title={title} data-erp-workflow-action={workflow?'complete':undefined} className={'ref-action inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 '+(workflow?'h-12 px-4 ':'h-9 ')+(kind==='primary'?'ref-button-primary border-teal-600 bg-teal-600 text-white hover:bg-teal-700':kind==='danger'?'border-danger/25 bg-danger-bg text-danger hover:border-danger/40':kind==='ghost'?'border-transparent bg-transparent text-ink-600 hover:bg-ink-50 hover:text-ink':'ref-button-outline border-ink-200 bg-white text-ink-700 hover:border-teal-300 hover:bg-teal-50/60 hover:text-ink')+' '+className}>{children}</button>}
/** Field label flows into themed selects so the combobox keeps its accessible name. */
const FieldLabel=createContext<string|undefined>(undefined);
export function Field({label,children,hint}:{label:string;children:React.ReactNode;hint?:string}){return <FieldLabel.Provider value={label}><label className="block min-w-0 text-[12px] font-medium text-ink-700">{label}<span className="mt-1.5 block font-normal">{children}</span>{hint&&<span className="ref-helper mt-1 block font-normal">{hint}</span>}</label></FieldLabel.Provider>}
/* HisabIQ field contract: 36px, 8px radius, border-input, mint focus halo, 13px text. */
const controlCls='ref-control block h-9 w-full rounded-md border border-input bg-card px-3 text-[13px] font-normal text-ink shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20 disabled:cursor-not-allowed disabled:border-ink-100 disabled:bg-ink-50 disabled:text-ink-500';
export function Input({value,onChange,type='text',placeholder='',min,step,disabled=false}:{value:string|number;onChange:(v:string)=>void;type?:string;placeholder?:string;min?:number;step?:number|string;disabled?:boolean}){return <input data-hisabiq-input="" className={controlCls} value={value} onChange={e=>onChange(e.target.value)} type={type} placeholder={placeholder} min={min} step={step} disabled={disabled}/>}
/** Uses the HisabIQ AppSelect (themed popup, check mark, keyboard) instead of a native select. */
export function Select({value,onChange,options,disabled=false,label}:{value:string;onChange:(v:string)=>void;options:(string|{value:string;label:string})[];disabled?:boolean;label?:string}){const fieldLabel=useContext(FieldLabel);const first=options[0];const fallback=typeof first==='string'?first:first?.label;return <AppSelect label={label??fieldLabel??fallback??'Choose'} value={value} options={options} onChange={onChange} disabled={disabled} className="w-full"/>}
export function Textarea({value,onChange,placeholder='',disabled=false}:{value:string;onChange:(v:string)=>void;placeholder?:string;disabled?:boolean}){return <textarea rows={3} disabled={disabled} className="block w-full rounded-lg border border-input bg-card px-3 py-2 text-[13px] font-normal text-ink shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-ink-400 hover:border-ink-300 focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20 disabled:cursor-not-allowed disabled:border-ink-100 disabled:bg-ink-50 disabled:text-ink-500" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}
export function Panel({title,subtitle,actions,children}:{title?:string;subtitle?:string;actions?:React.ReactNode;children:React.ReactNode}){return <section className="min-w-0 rounded-xl border border-ink-100 bg-white p-4 shadow-card">{(title||subtitle||actions)&&<div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div>{title&&<h2 className="text-[15px] font-semibold text-ink">{title}</h2>}{subtitle&&<p className="ref-helper mt-0.5">{subtitle}</p>}</div>{actions}</div>}{children}</section>}
/** Dialog: overlay fades, panel rises 8px and scales from 0.98 (180ms). Escape closes; reduced motion is static. */
export function Modal({title,children,onClose,footer,wide=false}:{title:string;children:React.ReactNode;onClose:()=>void;footer?:React.ReactNode;wide?:boolean}){
  const reduced=useReducedMotion();
  useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!document.querySelector('[role="listbox"],[role="menu"]'))onClose()};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[onClose]);
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:reduced?0:0.16,ease:'easeOut'}} className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-3" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <motion.section initial={reduced?false:{opacity:0,y:8,scale:0.98}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.18,ease:MOTION_EASE}} role="dialog" aria-modal="true" aria-label={title} className={(wide?'max-w-3xl ':'max-w-xl ')+"flex max-h-[90vh] w-full flex-col rounded-xl border border-ink-100 bg-card shadow-pop"}>
      <header className="flex items-center justify-between border-b border-ink-100 px-4 py-3"><h2 className="text-base font-semibold text-ink">{title}</h2><button className="flex size-9 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40" aria-label="Close" onClick={onClose}><X className="size-4"/></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      {footer&&<footer className="flex flex-wrap justify-end gap-2 border-t border-ink-100 px-4 py-3">{footer}</footer>}
    </motion.section>
  </motion.div>}
/** Segmented switch (GitHub Audit Ledger "Transaction / Created date"): for 2–3 mutually exclusive views of the same data. */
export function Segmented({options,value,onChange,label}:{options:{id:string;label:string}[];value:string;onChange:(id:string)=>void;label:string}){
  const reduced=useReducedMotion();const scope=React.useId();
  return <LayoutGroup id={scope}><div role="radiogroup" aria-label={label} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
    {options.map(o=>{const active=o.id===value;return <button key={o.id} type="button" role="radio" aria-checked={active} onClick={()=>onChange(o.id)} className={'relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 '+(active?'text-white':'text-ink-500 hover:bg-ink-50 hover:text-ink')}>
      {active&&<motion.span aria-hidden="true" layoutId={reduced?undefined:'segmented-active'} transition={{duration:0.2,ease:MOTION_EASE}} className="absolute inset-0 rounded-md bg-inverse"/>}
      <span className="relative">{o.label}</span></button>})}
  </div></LayoutGroup>}
export function Notice({children}:{children:React.ReactNode}){return <div className="flex items-start gap-2 rounded-lg border border-teal-200 bg-teal-50 p-3 text-[12px] text-teal-800"><Info className="mt-0.5 size-4 shrink-0"/><div>{children}</div></div>}
/** HisabIQ module navigation follows the existing Party Ledger tab contract.
 * Actions remain buttons; tab navigation is plain text with a 2px teal underline.
 */
export function Tabs({items,value,onChange,label='Section tabs'}:{
  items:{id:string;label:string;count?:number}[];
  value:string;onChange:(x:string)=>void;label?:string;
}){
  const handleKey=(event:React.KeyboardEvent<HTMLButtonElement>,index:number)=>{
    const key=event.key;
    if(!['ArrowRight','ArrowLeft','Home','End'].includes(key))return;
    event.preventDefault();
    const next=key==='Home'?0:key==='End'?items.length-1:
      key==='ArrowRight'?(index+1)%items.length:(index+items.length-1)%items.length;
    onChange(items[next].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };
  /* GitHub MotionTabList: one shared-layout underline glides between tabs (200ms, ease-out-expo). */
  return <MotionTabList aria-label={label} data-hisabiq-ledger-tabs=""
    className="flex gap-1 overflow-x-auto border-b border-ink-100 px-3 scrollbar-thin">
    {items.map((t,index)=><button
      type="button" key={t.id} role="tab" aria-selected={value===t.id}
      tabIndex={value===t.id?0:-1} onClick={()=>onChange(t.id)}
      onKeyDown={event=>handleKey(event,index)}
      className={'relative flex h-11 shrink-0 items-center gap-1.5 px-2.5 text-[13px] font-medium transition-colors duration-150 focus-visible:rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500/30 '+
        (value===t.id?'text-ink':'text-ink-500 hover:text-ink')}>
      {t.label}
      {t.count!==undefined&&<span className={'min-w-[20px] rounded-md px-1.5 py-0.5 text-center text-[11px] font-semibold tabular-nums transition-colors duration-200 '+
        (value===t.id?'bg-teal-50 text-teal-800':'bg-ink-50 text-ink-500')}>{t.count}</span>}
      <MotionTabIndicator active={value===t.id}/>
    </button>)}
  </MotionTabList>;
}
export function Metric({label,value,helper}:{label:string;value:string;helper?:string}){return <div className="rounded-xl border border-ink-100 bg-white p-3 shadow-card"><p className="text-[12px] text-ink-500">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>{helper&&<p className="ref-helper mt-1">{helper}</p>}</div>}
export function downloadCsv(name:string,rows:(string|number)[][]){const escaped=rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url='data:text/csv;charset=utf-8,'+encodeURIComponent('\uFEFF'+escaped);const a=document.createElement('a');a.href=url;a.download=name;a.click();}
export function Tag({children,color='neutral'}:{children:React.ReactNode;color?:'neutral'|'success'|'danger'|'warning'}){return <span data-table-badge className={'inline-flex rounded-md px-2 py-1 text-[11px] font-medium '+(color==='success'?'bg-success-bg text-success':color==='danger'?'bg-danger-bg text-danger':color==='warning'?'bg-warning-bg text-warning':'bg-ink-50 text-ink-600')}>{children}</span>}
export function Empty({message='Nothing matches these filters'}:{message?:string}){return <div className="py-8 text-center text-sm text-ink-500">{message}</div>}
export function useFeedback(){const [feedback,setFeedback]=useState('');return {feedback,notify:(x:string)=>{setFeedback(x);},Feedback:()=>feedback?<p role="status" className="rounded-lg border border-teal-200 bg-teal-50 p-2 text-[12px] text-teal-700">{feedback}</p>:null}}
