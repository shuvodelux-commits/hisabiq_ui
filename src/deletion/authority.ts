import {canManage,type SettingsPermission} from '../settings/model.ts';
import type {CurrentAuthority} from '../recovery/authority.ts';
import {requireSourceDelete} from './policy.ts';
export function sourceDeleteAuthority(current:CurrentAuthority,module:SettingsPermission,sourceId:string,reason:string,sourceTenantId='t1'){
 const {state,actorId}=current;
 if(state.tenantId!==sourceTenantId)throw Error('Source belongs to another business tenant.');
 requireSourceDelete({sourceId,reason,actorId,permitted:!!state.tenantId&&canManage(state,actorId,module),safeCommand:true});
 return {actorId,tenantId:state.tenantId,at:new Date().toISOString(),reason:reason.trim()};
}
