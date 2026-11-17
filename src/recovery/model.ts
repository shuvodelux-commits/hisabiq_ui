/** Same-session preview authority. Production commands require server enforcement. */
export type RecoveryContext={tenantId:string;actorId:string;view:boolean;restore:boolean;purge:boolean;owner:boolean;modules:readonly string[]};
export type RecoveryRecord={deletionId:string;kind:string;module:string;sourceId:string;label:string;tenantId:string;deletedBy:string;deletedAt:string;expiresAt:string;revision:string;state:'deleted'|'restored'|'purged';payload?:unknown};
export type RecoveryAdapter<T={id:string}>={kind:string;module:string;tenantId:string;get:(id:string)=>T|undefined;label:(payload:T)=>string;revision:(payload:T)=>string;checkDelete?:(payload:T)=>void;checkRestore:(payload:T)=>void;remove:(id:string)=>void;restore:(payload:T)=>void};
