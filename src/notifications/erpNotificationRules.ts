/** Shared ERP notification rules. Preview only: never sends or charges for messages. */
export type ErpNotificationEvent=
 'order_confirmed'|'sale_completed'|'sale_payment_received'|'due_reminder'|
 'courier_handover'|'parcel_delivered'|'parcel_failed'|'cod_settled';
export type SmsLanguage='English'|'Bangla';
export type NotificationRule={enabled:boolean;language:SmsLanguage;template:string;requireConsent:boolean};
export type NotificationSnapshot={revision:number;rules:Record<ErpNotificationEvent,NotificationRule>};
export const notificationEvents:Array<{id:ErpNotificationEvent;label:string;bn:string;source:string}>=[
 {id:'order_confirmed',label:'Online order confirmed',bn:'অর্ডার নিশ্চিত',source:'Online Sales'},
 {id:'sale_completed',label:'Sales invoice completed',bn:'বিক্রি সম্পন্ন',source:'POS / Sales'},
 {id:'sale_payment_received',label:'Payment / due collection received',bn:'বকেয়া আদায়',source:'POS / Party ledger'},
 {id:'due_reminder',label:'Outstanding due reminder',bn:'বকেয়া মনে করানো',source:'Party ledger'},
 {id:'courier_handover',label:'Courier handover',bn:'কুরিয়ারে হস্তান্তর',source:'Online Sales'},
 {id:'parcel_delivered',label:'Courier delivered',bn:'ডেলিভারি সম্পন্ন',source:'Online Sales'},
 {id:'parcel_failed',label:'Delivery failed / return',bn:'ডেলিভারি ব্যর্থ',source:'Online Sales'},
 {id:'cod_settled',label:'COD merchant settlement',bn:'ক্যাশ-অন-ডেলিভারি হিসাব',source:'Online Sales / Finance'}
];
export const defaultSmsTemplates:Record<ErpNotificationEvent,string>={
 order_confirmed:'{business}: Order {number} confirmed. Total BDT {total}. Thank you.',
 sale_completed:'{business}: Invoice {number} total BDT {total}. Due BDT {due}.',
 sale_payment_received:'{business}: Payment BDT {paid} received for {number}. Remaining due BDT {due}.',
 due_reminder:'{business}: Reminder for invoice {number}, outstanding BDT {due}. Contact us if already paid.',
 courier_handover:'{business}: Your order {number} handed to {courier}. Tracking: {tracking}.',
 parcel_delivered:'{business}: Order {number} is marked delivered. Thank you.',
 parcel_failed:'{business}: Delivery for order {number} needs attention. Please contact us.',
 cod_settled:'{business}: Courier settlement received for {number}.'
};
const makeDefaults=():NotificationSnapshot=>({revision:0,rules:Object.fromEntries(notificationEvents.map(e=>[e.id,{
 enabled:false,language:'English',template:defaultSmsTemplates[e.id],requireConsent:true
}])) as Record<ErpNotificationEvent,NotificationRule>});
let state=makeDefaults();
const listeners=new Set<()=>void>();
export const getNotificationSnapshot=()=>state;
export const subscribeNotificationRules=(f:()=>void)=>{listeners.add(f);return()=>listeners.delete(f);};
export function resetNotificationRulesForTest(){state=makeDefaults();listeners.forEach(f=>f());}
export function updateNotificationRule(event:ErpNotificationEvent,patch:Partial<NotificationRule>):NotificationRule{
 if(!notificationEvents.some(e=>e.id===event))throw new Error('Unknown ERP notification event.');
 const rule={...state.rules[event],...patch};
 if(!['English','Bangla'].includes(rule.language))throw new Error('Invalid SMS language.');
 if(!rule.template.trim()||rule.template.length>320||/\{[^{}]+\}/.test(rule.template.replace(/\{(?:business|number|total|paid|due|courier|tracking)\}/g,'')))
  throw new Error('Template must be 1–320 characters and contain only supported placeholders.');
 // Consent cannot be disabled for transactional SMS preview in this phase.
 if(rule.requireConsent!==true)throw new Error('Recipient consent is required for SMS.');
 state={revision:state.revision+1,rules:{...state.rules,[event]:rule}};
 listeners.forEach(f=>f());return rule;
}
const safe=Object.freeze(['business','number','total','paid','due','courier','tracking']);
export function renderNotificationPreview(event:ErpNotificationEvent,context:Record<string,string|number>){
 const rule=state.rules[event];
 if(!rule)throw new Error('Unknown event.');
 return rule.template.replace(/\{(business|number|total|paid|due|courier|tracking)\}/g,(_all,key:string)=>
  String(safe.includes(key)?context[key]??'—':'—'));
}
export function notificationEligibility(event:ErpNotificationEvent,opts:{phone:string;consent:boolean;gatewayConnected:boolean}){
 const rule=state.rules[event];
 if(!rule)throw new Error('Unknown event.');
 const reasons:string[]=[];
 if(!rule.enabled)reasons.push('Event is disabled');
 if(!opts.consent)reasons.push('Recipient has not consented');
 if(!/^(?:\+?880|0)1[3-9]\d{8}$/.test(opts.phone.replace(/[ -]/g,'')))reasons.push('Invalid Bangladesh phone');
 if(!opts.gatewayConnected)reasons.push('SMS gateway is not connected');
 // This UI preview NEVER transmits even when all conditions are satisfied.
 return {eligible:reasons.length===0,reasons,simulationOnly:true as const};
}
