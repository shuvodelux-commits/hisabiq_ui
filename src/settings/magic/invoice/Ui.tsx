// Source-faithful Magic Patterns Invoice Studio visual primitives only.
// Scaffolding is local to Settings, not a second global design system.
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
const MOTION_EASE = [0.16, 1, 0.3, 1] as const;

export function Button({children,onClick,kind='outline',type='button',disabled=false,className='',title,workflow=false}:{children:React.ReactNode;onClick?:()=>void;kind?:'primary'|'outline'|'danger'|'ghost';type?:'button'|'submit';disabled?:boolean;className?:string;title?:string;workflow?:boolean}){
return <button type={type} onClick={onClick} disabled={disabled} title={title} data-erp-workflow-action={workflow?'complete':undefined} className={'ref-action inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 '+(workflow?'h-12 px-4 ':'h-9 ')+(kind==='primary'?'ref-button-primary border-teal-600 bg-teal-600 text-white hover:bg-teal-700':kind==='danger'?'border-danger/25 bg-danger-bg text-danger hover:border-danger/40':kind==='ghost'?'border-transparent bg-transparent text-ink-600 hover:bg-ink-50 hover:text-ink':'ref-button-outline border-ink-200 bg-white text-ink-700 hover:border-teal-300 hover:bg-teal-50/60 hover:text-ink')+' '+className}>{children}</button>}

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

export function Segmented({options,value,onChange,label}:{options:{id:string;label:string}[];value:string;onChange:(id:string)=>void;label:string}){
  const reduced=useReducedMotion();const scope=React.useId();
  return <LayoutGroup id={scope}><div role="radiogroup" aria-label={label} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
    {options.map(o=>{const active=o.id===value;return <button key={o.id} type="button" role="radio" aria-checked={active} onClick={()=>onChange(o.id)} className={'relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 '+(active?'text-white':'text-ink-500 hover:bg-ink-50 hover:text-ink')}>
      {active&&<motion.span aria-hidden="true" layoutId={reduced?undefined:'segmented-active'} transition={{duration:0.2,ease:MOTION_EASE}} className="absolute inset-0 rounded-md bg-inverse"/>}
      <span className="relative">{o.label}</span></button>})}
  </div></LayoutGroup>}

