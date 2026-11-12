import test from 'node:test';
import assert from 'node:assert/strict';
import { type ServerInvoiceSettings } from '../src/integration/invoice-settings.ts';
import { type SessionSnapshot } from '../src/integration/session.ts';
import {
  stageInvoiceChoice, confirmInvoiceChoice, canSaveInvoiceChoice,
  verifiedInvoiceEditorIdentity, editableBooleanFields,
} from '../src/settings/magic/invoice/connectedInvoiceDraft.ts';

const tenantA='01J0F5JK4BXH01EFGN6DJPQ5XB';
const tenantB='01J0F5JK4BXH01EFGN6DJPQ5XC';
const userA='01J0F5JK4BXH01EFGN6DJPQ5XD';
const userB='01J0F5JK4BXH01EFGN6DJPQ5XE';
function session(tenantId=tenantA,userId=userA,epoch=1,accessToken='one'):SessionSnapshot {
  return {status:'authenticated',tenantId,userId,epoch,accessToken,
    permissions:['sale.invoice.view','settings.setting.edit'],features:[],
    username:'owner',displayName:'Owner',businessName:'Shop',roleName:'Owner',
    timezone:'Asia/Dhaka',persistence:'memory'};
}
const saved:ServerInvoiceSettings={
  language:'EN',defaultTemplate:'A4',thermalPaper:'80mm',
  showLogo:true,showBusinessBlock:true,showCustomerBlock:true,
  showSku:false,showBarcode:false,showDiscount:true,
  showPaymentBreakdown:true,showDue:true,showAmountInWords:true,
  headerText:null,showHeaderText:true,invoiceTitle:null,businessNameEn:null,
  proprietorName:null,proprietorNote:null,businessDescription:null,businessPhone2:null,
  contactPhones:[],mfsNumbers:[],terms:[],paymentTermsDays:0,paymentTermsLabel:null,
  showSignatureLines:true,hasLogo:false,businessName:null,businessAddress:null,
  businessPhone:null,footerText:null,termsText:null,businessPadEnabled:false,
  businessPadTopMm:40,pageMarginMm:10,
};
test('authenticated identity is unique by tenant/user/epoch/token, preview and locked identities rejected',()=>{
 const key=verifiedInvoiceEditorIdentity('connected',session());
 assert.ok(key);
 assert.notEqual(key,verifiedInvoiceEditorIdentity('connected',session(tenantB)));
 assert.notEqual(key,verifiedInvoiceEditorIdentity('connected',session(tenantA,userB)));
 assert.notEqual(key,verifiedInvoiceEditorIdentity('connected',session(tenantA,userA,2)));
 assert.notEqual(key,verifiedInvoiceEditorIdentity('connected',session(tenantA,userA,1,'two')));
 assert.equal(verifiedInvoiceEditorIdentity('preview',session()),null);
 assert.equal(verifiedInvoiceEditorIdentity('connected',{status:'locked',epoch:3,reason:'offline',persistence:'memory'}),null);
 assert.equal(verifiedInvoiceEditorIdentity('connected',{status:'signed-out',epoch:0}),null);
 assert.equal(verifiedInvoiceEditorIdentity('connected',session('t1')),null);
 assert.equal(verifiedInvoiceEditorIdentity('connected',session(tenantA,'mahmud')),null);
});
test('one-field draft and cancel: no-op resets; a second field cannot silently overwrite first',()=>{
 let chosen=stageInvoiceChoice(saved,null,'language','BN');
 assert.deepEqual(chosen,{field:'language',value:'BN'});
 assert.deepEqual(stageInvoiceChoice(saved,chosen,'showDue',false),chosen);
 assert.deepEqual(stageInvoiceChoice(saved,chosen,'language','BN'),chosen);
 assert.equal(stageInvoiceChoice(saved,chosen,'language','EN'),null);
 assert.equal(stageInvoiceChoice(saved,null,'language','EN'),null);
});
test('strict source allowlist: no MIXED, six designs, logo bytes, premium, arbitrary keys',()=>{
 const invalid=[
  ['language','MIXED'],['defaultTemplate','THERMAL_58'],['thermalPaper','A4'],
  ['accentHex','#00888A'],['design','premium'],['hasLogo',true],
  ['footerText','something'],['premium',true],['showDue','false'],['showLogo',1],
 ];
 for(const [field,value] of invalid){
  assert.equal(stageInvoiceChoice(saved,null,field as any,value as any),null,
    'must refuse '+String(field));
 }
 assert.deepEqual(editableBooleanFields,[
   'showLogo','showCustomerBlock','showDiscount',
   'showPaymentBreakdown','showDue','showAmountInWords',
 ]);
});
test('all nine source-supported choices can be staged with proper value types',()=>{
 for(const [field,value] of [
  ['language','BN'],['defaultTemplate','THERMAL_80'],['thermalPaper','58mm'],
  ...editableBooleanFields.map(field=>[field,false]),
 ] as Array<[string,unknown]>){
  const pending=stageInvoiceChoice(saved,null,field as any,value as any);
  assert.ok(pending,'should allow '+field);
  assert.equal(pending.field,field);
  assert.equal(pending.value,value);
 }
});
test('save enabled only with verified permission, dirty state, and no unknown outcome/inflight save',()=>{
 const selection=stageInvoiceChoice(saved,null,'showDue',false);
 assert.ok(selection);
 assert.equal(canSaveInvoiceChoice(selection,true,false,false),true);
 assert.equal(canSaveInvoiceChoice(null,true,false,false),false);
 assert.equal(canSaveInvoiceChoice(selection,false,false,false),false);
 assert.equal(canSaveInvoiceChoice(selection,true,true,false),false);
 assert.equal(canSaveInvoiceChoice(selection,true,false,true),false);
});
test('server response is accepted only for same identity and confirmed selected value',()=>{
 const identity=verifiedInvoiceEditorIdentity('connected',session())!;
 const choice=stageInvoiceChoice(saved,null,'showDue',false);
 assert.ok(choice);
 const confirmed={...saved,showDue:false};
 assert.deepEqual(confirmInvoiceChoice(identity,identity,choice,confirmed),confirmed);
 assert.equal(confirmInvoiceChoice('switched-user',identity,choice,confirmed),null);
 assert.equal(confirmInvoiceChoice(identity,identity,choice,saved),null);
 assert.equal(confirmInvoiceChoice(identity,identity,null,confirmed),null);
});
test('failed/ambiguous save preserves unchanged draft; fresh server GET can reconcile only same principal',()=>{
 const identity=verifiedInvoiceEditorIdentity('connected',session())!;
 const choice=stageInvoiceChoice(saved,null,'language','BN');
 assert.ok(choice);
 assert.equal(canSaveInvoiceChoice(choice,true,false,true),false,'must not retry blind');
 const fresh={...saved,language:'BN' as const};
 assert.deepEqual(confirmInvoiceChoice(identity,identity,choice,fresh),fresh);
 assert.equal(confirmInvoiceChoice(verifiedInvoiceEditorIdentity('connected',session(tenantB))!,identity,choice,fresh),null);
});
