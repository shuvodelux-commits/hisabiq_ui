import {canManage,type TenantSettings} from '../settings/model.ts';
import {effectivePermissions} from '../settings/rbac.ts';
import type {RecoveryContext} from './model.ts';
import type {createRecoveryStore} from './store.ts';
export type CurrentAuthority={state:TenantSettings;actorId:string};
export function resolveRecoveryContext({state,actorId}:CurrentAuthority):RecoveryContext{
 const held=effectivePermissions(state.sections.team,actorId);
 const owner=!!state.sections.team.employees.find(e=>e.id===actorId&&e.active&&e.roleIds.includes('owner'));
 return {tenantId:state.tenantId,actorId,owner,view:held.includes('recovery.view'),restore:held.includes('recovery.restore'),purge:held.includes('recovery.purge'),modules:['sales','purchases','products','parties'].filter(m=>canManage(state,actorId,(m==='parties'?'business':m) as 'sales'))};
}
/** Resolve on invocation: a toast can outlive its originating source component. */
export function restoreWithCurrentAuthority(store:ReturnType<typeof createRecoveryStore>,deletionId:string,current:()=>CurrentAuthority){store.restore(deletionId,resolveRecoveryContext(current()));}
