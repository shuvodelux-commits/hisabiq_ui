import type {Party,SalesInvoice} from '../types/erp.ts';

export type ReturnCustomerChoice=
 |{kind:'existing';customerId:string}
 |{kind:'create';name:string;phone:string}
 |{kind:'none'};

/** Compare valid Bangladeshi mobile numbers only; never normalize a name into an identity. */
export function normalizeBdMobile(raw:string):string|null {
 const compact=raw.trim().replace(/[\s.()\-]/g,'');
 const local=compact.startsWith('+880')?'0'+compact.slice(4):
  compact.startsWith('880')?'0'+compact.slice(3):compact;
 if(!/^01[3-9]\d{8}$/.test(local)||/^01[3-9]0{8}$/.test(local))return null;
 return local;
}

export function suggestReturnInvoices(selected:SalesInvoice,invoices:readonly SalesInvoice[]):SalesInvoice[] {
 if(selected.partyId)return [];
 const key=normalizeBdMobile(selected.phone??'');
 if(!key)return [];
 return invoices.filter(invoice=>invoice.id!==selected.id&&!invoice.partyId&&
  normalizeBdMobile(invoice.phone??'')===key);
}
export function findReturnCustomerCandidates(phone:string,parties:readonly Party[]):Party[] {
 const key=normalizeBdMobile(phone);
 if(!key)return [];
 return parties.filter(p=>p.roles.includes('Customer')&&p.status!=='Inactive'&&normalizeBdMobile(p.phone)===key);
}

/** An explicit customer choice is required whenever a return generates Customer Credit. */
export function validateReturnCustomerChoice(
 selected:readonly SalesInvoice[],choice:ReturnCustomerChoice,parties:readonly Party[],requiresCredit:boolean
):string[] {
 const issues:string[]=[];
 if(!selected.length){issues.push('Select invoices to return.');return issues;}
 const known=new Set(selected.map(x=>x.partyId).filter((x):x is string=>!!x));
 if(known.size>1)issues.push('Selected invoices reference different customer accounts.');
 const phones=selected.map(x=>normalizeBdMobile(x.phone??'')).filter((x):x is string=>!!x);
 if(new Set(phones).size>1)issues.push('Selected invoices have different phone numbers.');
 if(!requiresCredit)return issues;
 if(choice.kind==='none')issues.push('Confirm a customer before saving customer credit.');
 if(choice.kind==='existing'){
  const target=parties.find(p=>p.id===choice.customerId&&p.roles.includes('Customer')&&p.status!=='Inactive');
  if(!target)issues.push('Choose an active customer account.');
  if(known.size&&(!known.has(choice.customerId)))issues.push('Customer account conflicts with the original invoice.');
  const number=normalizeBdMobile(target?.phone??'');
  if(number&&phones.length&&phones.some(p=>p!==number))issues.push('Customer phone differs from the selected invoices.');
 }
 if(choice.kind==='create'){
  if(known.size)issues.push('Use the existing invoiced customer account.');
  const normalized=normalizeBdMobile(choice.phone);
  if(!choice.name.trim()||!normalized)issues.push('Enter the customer name and valid mobile phone.');
  if(normalized&&phones.length&&phones.some(p=>p!==normalized))issues.push('New customer phone differs from the original invoice.');
  const exact=parties.some(p=>p.roles.includes('Customer')&&
    p.name.trim().toLocaleLowerCase()===choice.name.trim().toLocaleLowerCase()&&
    normalizeBdMobile(p.phone)===normalized);
  if(exact)issues.push('This customer already exists. Confirm their account instead.');
 }
 return issues;
}
