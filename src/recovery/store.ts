import type {RecoveryAdapter,RecoveryContext,RecoveryRecord} from './model.ts';
function immutable<T>(value:T):T{if(value&&typeof value==='object'){Object.values(value).forEach(immutable);Object.freeze(value);}return value;}
export function createRecoveryStore(){
 let rows:readonly RecoveryRecord[]=[];
 const adapters=new Map<string,RecoveryAdapter<unknown>>(),listeners=new Set<()=>void>();
 const publish=()=>listeners.forEach(fn=>fn());
 function permit(ctx:RecoveryContext,module?:string){if(!ctx.actorId||!ctx.tenantId||!ctx.view||module&&!ctx.modules.includes(module))throw Error('Recovery permission denied.');}
 function adapter(kind:string,ctx:RecoveryContext){const a=adapters.get(kind);if(!a)throw Error('Source adapter unavailable.');permit(ctx,a.module);if(ctx.tenantId!==a.tenantId)throw Error('Source belongs to another business.');return a;}
 function row(id:string,ctx:RecoveryContext){permit(ctx);const r=rows.find(r=>r.deletionId===id&&r.tenantId===ctx.tenantId);if(!r)throw Error('Recovery record unavailable for this business.');permit(ctx,r.module);return r;}
 const api={
 register<T>(a:RecoveryAdapter<T>){adapters.set(a.kind,{...a,label:p=>a.label(p as T),revision:p=>a.revision(p as T),checkDelete:p=>a.checkDelete?.(p as T),checkRestore:p=>a.checkRestore(p as T),restore:p=>a.restore(p as T)});},
 subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn);};},
 snapshot:()=>Object.freeze(rows),
 list(ctx:RecoveryContext){permit(ctx);return structuredClone(rows.filter(r=>r.tenantId===ctx.tenantId&&ctx.modules.includes(r.module)));},
 delete(kind:string,id:string,ctx:RecoveryContext,now=new Date().toISOString(),expectedRevision?:string){const a=adapter(kind,ctx),p=a.get(id);if(!p)throw Error('Source no longer exists.');const revision=a.revision(p);if(expectedRevision!==undefined&&revision!==expectedRevision)throw Error('Source changed. Reopen its review.');a.checkDelete?.(p);const stamp=Date.parse(now);if(!Number.isFinite(stamp))throw Error('Invalid deletion date.');const r:RecoveryRecord={deletionId:crypto.randomUUID(),kind,module:a.module,sourceId:id,label:a.label(p),tenantId:ctx.tenantId,deletedBy:ctx.actorId,deletedAt:now,expiresAt:new Date(stamp+30*86400000).toISOString(),revision,state:'deleted',payload:immutable(structuredClone(p))};Object.freeze(r);rows=Object.freeze([r,...rows]);try{a.remove(id);}catch(e){rows=rows.filter(item=>item!==r);throw e;}publish();return structuredClone(r);},
 restore(id:string,ctx:RecoveryContext,now=new Date().toISOString()){const r=row(id,ctx);if(!ctx.restore)throw Error('Restore permission denied.');if(r.state!=='deleted')throw Error('Record already '+r.state+'.');if(!Number.isFinite(Date.parse(now))||Date.parse(now)>=Date.parse(r.expiresAt))throw Error('The 30-day recovery window has expired.');const a=adapter(r.kind,ctx);if(a.get(r.sourceId))throw Error('Original identity already exists.');const p=structuredClone(r.payload);a.checkRestore(p);rows=rows.map(item=>item===r?Object.freeze({...r,state:'restored' as const,payload:undefined}):item);try{a.restore(p);}catch(e){rows=rows.map(item=>item.deletionId===id?r:item);throw e;}publish();},
 bulkRestore(ids:readonly string[],ctx:RecoveryContext,now=new Date().toISOString()){return ids.map(deletionId=>{try{api.restore(deletionId,ctx,now);return {deletionId};}catch(e){return {deletionId,error:e instanceof Error?e.message:String(e)};}});},
 purge(id:string,ctx:RecoveryContext,confirmation:string){const r=row(id,ctx);if(!ctx.owner||!ctx.purge)throw Error('Only an authorized owner may permanently delete.');if(confirmation!==r.label)throw Error('Type the exact confirmation text.');if(r.state!=='deleted')throw Error('Only deleted records may be purged.');rows=rows.map(item=>item===r?Object.freeze({...r,state:'purged' as const,payload:undefined}):item);publish();}
 };return api;
}
export const recoveryStore=createRecoveryStore();
