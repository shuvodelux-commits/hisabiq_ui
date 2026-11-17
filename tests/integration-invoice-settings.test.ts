import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { readInvoiceSettings, type ServerInvoiceSettings } from '../src/integration/invoice-settings.ts';

// Source faithful to pinned adoption packages/core-application/src/sales/sale-query-service.ts
const defaults: ServerInvoiceSettings = {
  language:'EN',defaultTemplate:'A4',showLogo:true,showBusinessBlock:true,
  showCustomerBlock:true,showSku:false,showBarcode:false,showDiscount:true,
  showPaymentBreakdown:true,showDue:true,showAmountInWords:true,
  headerText:null,showHeaderText:true,invoiceTitle:null,businessNameEn:null,
  proprietorName:null,proprietorNote:null,businessDescription:null,businessPhone2:null,
  contactPhones:[],mfsNumbers:[],terms:[],paymentTermsDays:0,paymentTermsLabel:null,
  thermalPaper:'80mm',showSignatureLines:true,hasLogo:false,
  businessName:null,businessAddress:null,businessPhone:null,footerText:null,termsText:null,
  businessPadEnabled:false,businessPadTopMm:40,pageMarginMm:10,
};
const origin='https://hisabiq-invoice-test.example';
function json(x:unknown,status=200): Response {
  return new Response(JSON.stringify(x),{status,headers:{'Content-Type':'application/json'}});
}
async function withFetch(fake:typeof fetch, action:()=>Promise<void>) {
 const old=globalThis.fetch, oldWindow=(globalThis as any).window, oldLocation=(globalThis as any).location;
 (globalThis as any).fetch=fake;
 (globalThis as any).window={location:{origin}};
 (globalThis as any).location={origin};
 try {await action();}
 finally {
  globalThis.fetch=old;
  if(oldWindow===undefined) delete (globalThis as any).window; else (globalThis as any).window=oldWindow;
  if(oldLocation===undefined) delete (globalThis as any).location; else (globalThis as any).location=oldLocation;
 }
}
test('exact GET request decodes full server response and sends no body or write',async()=>{
 let calls=0;
 await withFetch((async(url,init)=>{
  calls++;
  assert.equal(String(url),origin+'/api/v1/sales/invoice-settings');
  assert.equal(init?.method,'GET');
  assert.equal(init?.body,undefined);
  assert.equal(init?.redirect,'error');
  assert.equal(init?.credentials,'omit');
  assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer verified-token');
  return json({data:defaults});
 }) as typeof fetch,async()=>{
  const got=await readInvoiceSettings('verified-token');
  assert.deepEqual(got.data,defaults);
  assert.equal(got.data.hasLogo,false);
 });
 assert.equal(calls,1);
});
test('source-supported variants preserve 58mm width, nullable overrides and all existing fields',async()=>{
 const variant:ServerInvoiceSettings={
  ...defaults,language:'BN',defaultTemplate:'THERMAL_80',thermalPaper:'58mm',
  contactPhones:[{label:'Shop',number:'01700000000'}],
  mfsNumbers:[{label:'বিকাশ',number:'01800000000'}],
  terms:['Keep receipt'],businessPadEnabled:true,businessPadTopMm:150,
  pageMarginMm:50,footerText:'ধন্যবাদ',hasLogo:true,
 };
 await withFetch((async()=>json({data:variant})) as typeof fetch,async()=>{
  const out=await readInvoiceSettings('token');
  assert.deepEqual(out.data,variant);
  assert.equal(out.data.thermalPaper,'58mm');
 });
});
test('rejects any missing, extra or malformed required invoice setting',async()=>{
 const broken=[
  {},{data:{}},
  {data:{...defaults,designId:'modern'}},
  {data:{...defaults,language:'MIXED'}},
  {data:{...defaults,defaultTemplate:'THERMAL_58'}},
  {data:{...defaults,thermalPaper:'A4'}},
  {data:{...defaults,hasLogo:'true'}},
  {data:{...defaults,paymentTermsDays:366}},
  {data:{...defaults,pageMarginMm:-1}},
  {data:{...defaults,businessPadTopMm:1.4}},
  {data:{...defaults,contactPhones:[{label:'Shop',number:'017',token:'secret'}]}},
  {data:{...defaults,terms:[3]}},
  {data:{...defaults,footerText:12}},
  {data:{...defaults, showLogo: undefined}},
 ];
 for(const value of broken){
  await withFetch((async()=>json(value)) as typeof fetch,async()=>{
    await assert.rejects(readInvoiceSettings('token'),(err:unknown)=>err instanceof ApiError&&err.kind==='protocol');
  });
 }
});
test('no retry or preview fallback for permission denial and backend errors',async()=>{
 for(const status of [401,403,500]){
  let calls=0;
  await withFetch((async()=>{calls++;return json({error:{code:'DENIED',message:'Unavailable',details:{},traceId:'test'}},status)}) as typeof fetch,async()=>{
   await assert.rejects(readInvoiceSettings('token'),(e:unknown)=>e instanceof ApiError&&e.kind==='http'&&e.status===status);
  });
  assert.equal(calls,1);
 }
});
test('aborts, timeouts and offline fetches fail once without fallback',async()=>{
 for(const reason of ['abort','timeout','offline']){
  let calls=0;
  const controller=new AbortController();
  await withFetch((async(_url,init)=>{
   calls++;
   if(reason==='offline') throw new TypeError('Disconnected');
   return await new Promise<Response>((_resolve,reject)=>{
    init?.signal?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
    if(reason==='abort')controller.abort();
   });
  }) as typeof fetch,async()=>{
   await assert.rejects(readInvoiceSettings('token',controller.signal,5),(e:unknown)=>e instanceof ApiError&&e.kind==='network');
  });
  assert.equal(calls,1);
 }
});
test('different tenant tokens receive independent invoice settings without cache',async()=>{
 const names:string[]=[];
 await withFetch((async(_url,init)=>{
  const token=new Headers(init?.headers).get('Authorization');
  names.push(token||'missing');
  return json({data:{...defaults,businessName:token==='Bearer tenant-A'?'Shop A':'Shop B'}});
 }) as typeof fetch,async()=>{
  const a=await readInvoiceSettings('tenant-A');
  const b=await readInvoiceSettings('tenant-B');
  assert.equal(a.data.businessName,'Shop A');
  assert.equal(b.data.businessName,'Shop B');
 });
 assert.deepEqual(names,['Bearer tenant-A','Bearer tenant-B']);
});
