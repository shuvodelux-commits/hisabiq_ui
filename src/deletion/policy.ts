export type DeleteKind = 'master' | 'posted' | 'projection' | 'setup' | 'immutable';
export function deleteEligibility(target:{kind:DeleteKind;used?:boolean;completeHistory?:boolean}):{allowed:boolean;reason?:string}{
 if(target.kind==='master')return target.used||!target.completeHistory?{allowed:false,reason:'Historical use or incomplete history prevents deletion. Use Deactivate.'}:{allowed:true};
 return {allowed:false,reason:{posted:'Posted records require their original audited cancellation or reversal command.',projection:'This is a derived row. No verified original source delete command is connected.',setup:'Setup recovery is not connected. Keep this record or use Deactivate.',immutable:'History is immutable. Correction requires a new audited operation.'}[target.kind]};
}
export function requireSourceDelete(target:{sourceId:string;safeCommand:boolean;linkedReturns?:number;permitted:boolean;actorId:string;reason:string}){
 if(!target.actorId||!target.permitted)throw Error('Current actor lacks permission for this module.');
 if(!target.sourceId||!target.safeCommand)throw Error('No verified original source delete command is connected.');
 if(target.linkedReturns)throw Error('Resolve linked returns before reversing this source.');
 if(!target.reason.trim())throw Error('Enter a reason for the source cancellation or reversal.');
}
