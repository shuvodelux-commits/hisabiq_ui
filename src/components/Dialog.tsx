import {createContext,forwardRef,useContext,useEffect,useId,useRef,useState,type HTMLAttributes,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {
 Dialog as DesignDialog,DialogContent as DesignContent,DialogTitle as DesignTitle,
 DialogDescription as DesignDescription,
} from '../_designSystem/ds-6551b66a-cfd3-4df9-a9b1-9ead8d7fe7e9';
export * from '../_designSystem/ds-6551b66a-cfd3-4df9-a9b1-9ead8d7fe7e9';

type ModalState={open:boolean;close:()=>void;id:string;opener:HTMLElement|null};
const ModalContext=createContext<ModalState|null>(null);
let scrollLocks=0;
let originalOverflow='';
const focusable='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Retain the exported design; add shared keyboard and viewport behavior to every form. */
export function Dialog({open,defaultOpen=false,onOpenChange,children}:{open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void;children:ReactNode}){
 const [local,setLocal]=useState(defaultOpen);
 const active=open??local;
 const id=useId().replace(/:/g,'');
 const wasOpen=useRef(false);
 const opener=useRef<HTMLElement|null>(null);
 if(active&&!wasOpen.current)opener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
 wasOpen.current=active;
 const change=(value:boolean)=>{if(open===undefined)setLocal(value);onOpenChange?.(value);};
 return <ModalContext.Provider value={{open:active,close:()=>change(false),id,opener:opener.current}}><DesignDialog open={active} onOpenChange={change}>{children}</DesignDialog></ModalContext.Provider>;
}

export const DialogContent=forwardRef<HTMLDivElement,HTMLAttributes<HTMLDivElement>&{showCloseButton?:boolean}>(function DialogContent({children,...props},forwarded){
 const modal=useContext(ModalContext);
 const ref=useRef<HTMLDivElement|null>(null);
 const closeRef=useRef(modal?.close);closeRef.current=modal?.close;
 useEffect(()=>{
  if(!modal?.open||!ref.current)return;
  const element=ref.current;
  const previous=modal.opener;
  if(scrollLocks++===0){originalOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
  const portals=()=>{
   const owned:Array<HTMLElement>=[];
   element.querySelectorAll<HTMLElement>('[aria-controls]').forEach(anchor=>{
    anchor.getAttribute('aria-controls')?.split(' ').forEach(id=>{const popup=document.getElementById(id);if(popup&&!element.contains(popup)&&popup.getClientRects().length)owned.push(popup);});
   });
   document.querySelectorAll<HTMLElement>('[data-dialog-owner]').forEach(popup=>{if(popup.dataset.dialogOwner===modal.id&&popup.getClientRects().length)owned.push(popup);});
   return owned;
  };
  const controls=()=>[...element.querySelectorAll<HTMLElement>(focusable),...portals().flatMap(popup=>Array.from(popup.querySelectorAll<HTMLElement>(focusable)))].filter(node=>node.getClientRects().length&&!node.closest('[hidden],[inert]'));
  const frame=requestAnimationFrame(()=>{
   if(!element.contains(document.activeElement))(element.querySelector<HTMLElement>('[autofocus],[data-autofocus]')??controls()[0]??element).focus();
   if(element.querySelector('#'+modal.id+'-description'))element.setAttribute('aria-describedby',modal.id+'-description');
  });
  const keydown=(event:KeyboardEvent)=>{
   const roots=document.querySelectorAll('[data-dialog-root]');
   if(roots[roots.length-1]!==element||event.defaultPrevented)return;
   if(event.key==='Escape'){
    if(portals().length)return; // The calendar/select/menu handles Escape first.
    event.preventDefault();event.stopPropagation();closeRef.current?.();return;
   }
   if(event.key!=='Tab')return;
   const items=controls();const first=items[0],last=items[items.length-1];
   if(!first){event.preventDefault();element.focus();return;}
   const active=document.activeElement;
   if(event.shiftKey&&(active===first||!items.includes(active as HTMLElement))){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&(active===last||!items.includes(active as HTMLElement))){event.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',keydown);
  return ()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',keydown);if(--scrollLocks===0)document.body.style.overflow=originalOverflow;if(previous?.isConnected)previous.focus();};
 },[modal?.open,modal?.id]);
 if(!modal?.open)return null;
 return createPortal(<DesignContent {...props} ref={(node:HTMLDivElement|null)=>{ref.current=node;if(typeof forwarded==='function')forwarded(node);else if(forwarded)forwarded.current=node;}}
  role="dialog" aria-modal="true" aria-labelledby={props['aria-label']?undefined:modal.id+'-title'}
  data-dialog-root={modal.id} data-dialog-id={modal.id} tabIndex={-1}>{children}</DesignContent>,document.body);
});
export const DialogTitle=forwardRef<HTMLHeadingElement,HTMLAttributes<HTMLHeadingElement>>(function DialogTitle(props,ref){const modal=useContext(ModalContext);return <DesignTitle {...props} id={props.id??modal?.id+'-title'} ref={ref}/>;});
export const DialogDescription=forwardRef<HTMLParagraphElement,HTMLAttributes<HTMLParagraphElement>>(function DialogDescription(props,ref){const modal=useContext(ModalContext);return <DesignDescription {...props} id={props.id??modal?.id+'-description'} ref={ref}/>;});
