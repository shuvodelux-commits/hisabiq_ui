import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ApiError } from '../../../integration/errors.ts';
import { removeServerInvoiceLogo, uploadServerInvoiceLogo, type InvoiceLogoMime } from '../../../integration/invoice-logo.ts';
import type { ServerInvoiceSettings } from '../../../integration/invoice-settings.ts';
import { Button } from './Ui';

const maxBytes = 250 * 1024;
const formats: Record<string, InvoiceLogoMime> = { png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', gif:'image/gif' };
type Context = { identityKey:string; accessToken:string; canEdit:boolean; blocked:boolean };
type State = { selectedName:string|null; busy:boolean; unknown:boolean; denied:boolean; confirmDelete:boolean; message:string };
const initial:State = {selectedName:null,busy:false,unknown:false,denied:false,confirmDelete:false,message:''};
function signature(mime:InvoiceLogoMime, b:Uint8Array) {
 const at=(i:number)=>b[i];
 if(mime==='image/png')return b.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>at(i)===v);
 if(mime==='image/jpeg')return b.length>=3&&at(0)===255&&at(1)===216&&at(2)===255;
 if(mime==='image/gif')return b.length>=6&&String.fromCharCode(...b.subarray(0,6)).match(/^GIF8[79]a$/)!==null;
 return b.length>=12&&String.fromCharCode(...b.subarray(0,4))==='RIFF'&&String.fromCharCode(...b.subarray(8,12))==='WEBP';
}
function mimeFor(file:File):InvoiceLogoMime|null {
 const ext=file.name.toLowerCase().match(/\.([a-z]+)$/)?.[1];
 return ext && formats[ext]===file.type ? formats[ext] : null;
}
function encode(bytes:Uint8Array):string {
 let binary='';
 for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return btoa(binary);
}
/** One action at a time, bound to the verified principal. A failed/unknown write never replays itself. */
export function createConnectedInvoiceLogoActionsController(emit:(state:State)=>void, confirmed:(settings:ServerInvoiceSettings)=>void) {
 let context:Context|null=null;
 let state={...initial};
 let file:File|null=null;
 let operation:AbortController|null=null;
 let requestDispatched=false;
 let generation=0;
 let disposed=false;
 const update=(patch:Partial<State>)=>{state={...state,...patch};if(!disposed)emit(state);};
 const allowed=()=>!!context?.identityKey&&!!context.accessToken&&context.canEdit&&!context.blocked&&!state.busy&&!state.unknown&&!state.denied;
 const reset=()=>{operation?.abort();operation=null;requestDispatched=false;generation++;file=null;update({...initial});};
 return {
  configure(next:Context){
   if(disposed)return;
   if(context && (context.identityKey!==next.identityKey||context.accessToken!==next.accessToken)){
    reset();
   }else if(context && (
    (context.canEdit && !next.canEdit) ||
    (!context.blocked && next.blocked && !state.unknown)
   )){
    // Permission may change while the selected file is being read or a write
    // is in flight. Abort and invalidate both stages. Dispatched writes have
    // an unknown server outcome until a separate authenticated refresh.
    const uncertain=operation!==null && requestDispatched;
    operation?.abort();
    operation=null;requestDispatched=false;generation++;file=null;
    update({
     selectedName:null,busy:false,confirmDelete:false,
     unknown:state.unknown||uncertain,
     message:state.denied||state.unknown?state.message
      : uncertain?'Access changed during a logo write. Refresh from server before retrying. · আবার লোড করুন।'
      :'Access changed; selected file cleared. · অনুমতি বদলেছে।',
    });
   }
   context=next;
  },
  select(next:File|null){
   if(!allowed())return;
   file=next;
   update({selectedName:next?.name??null,confirmDelete:false,message:next?'Selected only. Press Upload to save. · আপলোড করতে বোতাম চাপুন।':''});
  },
  cancel(){if(state.busy)return;file=null;update({selectedName:null,confirmDelete:false,message:'Selection cleared. · নির্বাচন বাতিল।'});},
  requestDelete(){if(!allowed()||file)return;update({confirmDelete:true,message:'Confirm removal of this business logo. · লোগো মুছতে নিশ্চিত করুন।'});},
  cancelDelete(){update({confirmDelete:false,message:'Removal canceled. · মুছে ফেলা বাতিল।'});},
  serverRefreshed(){if(state.busy)return;update({unknown:false,message:'Server state refreshed. Review before another action. · সার্ভার তথ্য যাচাই হয়েছে।'});},
  async upload(){
   if(!allowed()||!file)return;
   const chosen=file,mime=mimeFor(chosen);
   if(!mime||!Number.isSafeInteger(chosen.size)||chosen.size<1||chosen.size>maxBytes){update({message:'Choose a nonempty PNG, JPEG, WebP or GIF up to 250 KiB. · ২৫০ KiB পর্যন্ত ছবি বাছুন।'});return;}
   const request=++generation,ctl=new AbortController();operation=ctl;requestDispatched=false;update({busy:true,message:'Checking selected file… · ছবি যাচাই হচ্ছে…'});
   let sent=false;
   try{
    const raw=await chosen.arrayBuffer();
    if(ctl.signal.aborted||request!==generation)return;
    if(raw.byteLength!==chosen.size||raw.byteLength>maxBytes||raw.byteLength===0)throw new Error('Invalid file length');
    const bytes=new Uint8Array(raw);
    if(!signature(mime,bytes))throw new Error('File type does not match image bytes');
    const data=encode(bytes);
    if(ctl.signal.aborted||request!==generation)return;
    sent=true;requestDispatched=true;
    update({message:'Uploading… · আপলোড হচ্ছে…'});
    const result=await uploadServerInvoiceLogo(context!.accessToken,mime,data,ctl.signal);
    if(ctl.signal.aborted||request!==generation)return;
    file=null;update({selectedName:null,confirmDelete:false,message:'Logo saved to this business. · লোগো সংরক্ষিত হয়েছে।'});
    confirmed(result.data);
   }catch(error:unknown){
    if(ctl.signal.aborted||request!==generation)return;
    if(error instanceof ApiError&&(error.status===401||error.status===403))update({denied:true,message:'Permission denied. Sign in again. · অনুমতি নেই।'});
    else if(sent)update({unknown:true,message:'Upload outcome unknown. Refresh from server before another action. · সার্ভার থেকে পুনরায় লোড করুন।'});
    else update({message:'Invalid or unreadable image. Check type, bytes and 250 KiB limit. · ছবিটি যাচাই করুন।'});
   }finally{if(operation===ctl){operation=null;requestDispatched=false;}if(request===generation)update({busy:false});}
  },
  async remove(){
   if(!allowed()||!state.confirmDelete||file)return;
   const request=++generation,ctl=new AbortController();operation=ctl;requestDispatched=true;update({busy:true,confirmDelete:false,message:'Removing… · মুছে ফেলা হচ্ছে…'});
   try{
    const result=await removeServerInvoiceLogo(context!.accessToken,ctl.signal);
    if(ctl.signal.aborted||request!==generation)return;
    update({message:'Logo removed from this business. · লোগো মুছে ফেলা হয়েছে।'});confirmed(result.data);
   }catch(error:unknown){
    if(ctl.signal.aborted||request!==generation)return;
    if(error instanceof ApiError&&(error.status===401||error.status===403))update({denied:true,message:'Permission denied. Sign in again. · অনুমতি নেই।'});
    else update({unknown:true,message:'Removal outcome unknown. Refresh from server before another action. · সার্ভার থেকে পুনরায় লোড করুন।'});
   }finally{if(operation===ctl){operation=null;requestDispatched=false;}if(request===generation)update({busy:false});}
  },
  dispose(){disposed=true;reset();},
 };
}

type Props=Context & {hasLogo:boolean; refreshKey:number; onSelectedChange:(selected:boolean)=>void; onBusyChange:(busy:boolean)=>void; onUnknownChange:(unknown:boolean)=>void; onDenied:()=>void; onConfirmed:(settings:ServerInvoiceSettings)=>void};
export function ConnectedInvoiceLogoActions(props:Props){
 const [state,setState]=useState<State>(initial);
 const callbacks=useRef(props);callbacks.current=props;
 const controller=useRef<ReturnType<typeof createConnectedInvoiceLogoActionsController>|null>(null);
 if(!controller.current)controller.current=createConnectedInvoiceLogoActionsController(next=>{
  setState(next);callbacks.current.onSelectedChange(next.selectedName!==null);callbacks.current.onBusyChange(next.busy);callbacks.current.onUnknownChange(next.unknown);if(next.denied)callbacks.current.onDenied();
 },data=>callbacks.current.onConfirmed(data));
 // Do not synchronously emit parent setState callbacks during this component's
 // render. Commit the access/identity change before paint and abort any pending
 // operation through the controller's existing generation/unknown-outcome rules.
 useLayoutEffect(()=>{
  controller.current?.configure({identityKey:props.identityKey,accessToken:props.accessToken,canEdit:props.canEdit,blocked:props.blocked});
 },[props.identityKey,props.accessToken,props.canEdit,props.blocked]);
 useEffect(()=>{controller.current?.serverRefreshed();},[props.refreshKey]);
 useEffect(()=>()=>{controller.current?.dispose();callbacks.current.onSelectedChange(false);callbacks.current.onBusyChange(false);},[]);
 const disabled=!props.canEdit||props.blocked||state.busy||state.unknown||state.denied;
 return <div className="mt-3 space-y-2 rounded-md border border-border bg-card px-3 py-2 text-[12px] text-ink-600" data-connected-invoice-logo-actions>
  <label className="block font-medium text-ink-700" htmlFor="invoice-logo-file">Invoice logo · চালানের লোগো</label>
  <input id="invoice-logo-file" type="file" accept=".png,.jpg,.jpeg,.webp,.gif,image/png,image/jpeg,image/webp,image/gif" disabled={disabled} onChange={e=>{controller.current?.select(e.target.files?.[0]??null);e.target.value='';}} className="block w-full min-w-0 text-[12px] file:mr-2 file:h-9 file:rounded-md file:border file:border-ink-200 file:bg-card file:px-3 file:text-ink-700 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:opacity-50" />
  <p>PNG, JPEG, WebP or GIF · maximum 250 KiB · original file, no crop/resize · ২৫০ KiB সর্বোচ্চ</p>
  {state.selectedName&&<p>Selected: {state.selectedName} · এখনো আপলোড হয়নি</p>}
  <div className="flex flex-wrap gap-2">
   <Button kind="primary" disabled={disabled||!state.selectedName} onClick={()=>void controller.current?.upload()}>Upload logo</Button>
   {state.selectedName&&<Button disabled={state.busy} onClick={()=>controller.current?.cancel()}>Cancel selection</Button>}
   {props.hasLogo&&!state.selectedName&&!state.confirmDelete&&<Button kind="danger" disabled={disabled} onClick={()=>controller.current?.requestDelete()}>Remove logo</Button>}
   {state.confirmDelete&&<><Button kind="danger" disabled={disabled} onClick={()=>void controller.current?.remove()}>Confirm removal</Button><Button disabled={state.busy} onClick={()=>controller.current?.cancelDelete()}>Keep logo</Button></>}
  </div>
  {state.message&&<p role="status" aria-live="polite" className={state.unknown||state.denied?'text-danger':''}>{state.message}</p>}
 </div>;
}
