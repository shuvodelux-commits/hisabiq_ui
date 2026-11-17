import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { uploadServerInvoiceLogo, removeServerInvoiceLogo } from '../src/integration/invoice-logo.ts';
import type { ServerInvoiceSettings } from '../src/integration/invoice-settings.ts';

const origin='https://hisabiq-logo-acceptance.example';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/4XkAAAAASUVORK5CYII=';
const base: ServerInvoiceSettings={
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
function json(payload:unknown,status=200):Response{
 return new Response(JSON.stringify(payload),{status,headers:{'Content-Type':'application/json'}});
}
async function withFetch(fake:typeof fetch, task:()=>Promise<void>):Promise<void>{
 const old=globalThis.fetch,w=(globalThis as any).window,l=(globalThis as any).location;
 (globalThis as any).fetch=fake;
 (globalThis as any).window={location:{origin}};
 (globalThis as any).location={origin};
 try{await task()}finally{
  globalThis.fetch=old;
  if(w===undefined)delete (globalThis as any).window;else (globalThis as any).window=w;
  if(l===undefined)delete (globalThis as any).location;else (globalThis as any).location=l;
 }
}
test('upload uses exactly source DTO, authenticated one-shot POST, full confirmed hasLogo response',async()=>{
 let calls=0;
 await withFetch((async(url,init)=>{
  calls++;
  assert.equal(String(url),origin+'/api/v1/sales/invoice-logo');
  assert.equal(init?.method,'POST');
  assert.equal(init?.redirect,'error');
  assert.equal(init?.credentials,'omit');
  assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer tenant-A');
  assert.deepEqual(JSON.parse(String(init?.body)),{mime:'image/png',dataBase64:png});
  return json({data:{...base,hasLogo:true}});
 }) as typeof fetch,async()=>{
  const out=await uploadServerInvoiceLogo('tenant-A','image/png',png);
  assert.equal(out.data.hasLogo,true);
  assert.equal(base.hasLogo,false);
 });
 assert.equal(calls,1);
});
test('removal requires authenticated bodyless DELETE, strict false server response',async()=>{
 let calls=0;
 await withFetch((async(url,init)=>{
  calls++;
  assert.equal(String(url),origin+'/api/v1/sales/invoice-logo');
  assert.equal(init?.method,'DELETE');
  assert.equal(init?.body,undefined);
  assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer tenant-B');
  return json({data:{...base,hasLogo:false}});
 }) as typeof fetch,async()=>{
  const out=await removeServerInvoiceLogo('tenant-B');
  assert.equal(out.data.hasLogo,false);
 });
 assert.equal(calls,1);
});
test('only four backend MIME formats and matching image signatures are accepted',async()=>{
 const valid = [
  ['image/png',png],
  ['image/jpeg',Buffer.from([255,216,255,224,0,16,74,70,73,70,0,1,1,0,0,1,0,1,0,0]).toString('base64')],
  ['image/webp',Buffer.from('RIFF0000WEBPVP8 ','binary').toString('base64')],
  ['image/gif',Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00','binary').toString('base64')],
 ] as const;
 let calls=0;
 await withFetch((async(_url,init)=>{
  calls++;
  const body=JSON.parse(String(init?.body));
  assert.ok(valid.some(v=>v[0]===body.mime && v[1]===body.dataBase64));
  return json({data:{...base,hasLogo:true}});
 }) as typeof fetch,async()=>{
  for(const [mime,data] of valid) {
   assert.equal((await uploadServerInvoiceLogo('token',mime,data)).data.hasLogo,true);
  }
 });
 assert.equal(calls,4);
});
test('invalid MIME, Base64, signatures and oversized data fail before network',async()=>{
 let calls=0;
 await withFetch((async()=>{calls++;return json({data:base})}) as typeof fetch,async()=>{
  for(const [mime,data] of [
   ['image/svg+xml',png],['image/png','data:image/png;base64,'+png],
   ['image/png',''],['image/png','!'.repeat(24)],['image/png',png+'\n'],
   ['image/png',Buffer.from('not-a-png-file-18chars').toString('base64')],
   ['image/jpeg',png],['image/webp',png],['image/gif',png],
   ['image/png',png.slice(0,-2)],['image/png','A'.repeat(2097156)],
  ] as Array<[string,string]>) {
   await assert.rejects(uploadServerInvoiceLogo('token',mime as any,data),
    (err:unknown)=>err instanceof ApiError&&err.kind==='protocol');
  }
  await assert.rejects(uploadServerInvoiceLogo('', 'image/png',png),
   (err:unknown)=>err instanceof ApiError&&err.kind==='protocol');
  await assert.rejects(uploadServerInvoiceLogo('token','image/png',png,undefined,0),
   (err:unknown)=>err instanceof ApiError&&err.kind==='protocol');
 });
 assert.equal(calls,0);
});
test('invalid full server envelope/incorrect logo confirmation rejects, no fallback',async()=>{
 for(const [operation,response] of [
  ['upload',{data:base}],
  ['upload',{data:{...base,hasLogo:true,designId:'magic'}}],
  ['upload',{data:{...base,hasLogo:'true'}}],
  ['upload',{data:null}],
  ['remove',{data:{...base,hasLogo:true}}],
  ['remove',{data:{...base,hasLogo:false,language:'MIXED'}}],
 ] as Array<[string,unknown]>) {
  await withFetch((async()=>json(response)) as typeof fetch,async()=>{
   await assert.rejects(operation==='upload' ?
    uploadServerInvoiceLogo('token','image/png',png):
    removeServerInvoiceLogo('token'),(err:unknown)=>err instanceof ApiError&&err.kind==='protocol');
  });
 }
});
test('401/403/422/500 errors never trigger duplicate image mutation',async()=>{
 for(const status of [401,403,422,500]){
  for(const operation of ['upload','remove']){
   let calls=0;
   await withFetch((async()=>{calls++;return json({error:{code:'DENIED',message:'Unavailable',details:{},traceId:'test'}},status)}) as typeof fetch,async()=>{
    await assert.rejects(operation==='upload' ?
     uploadServerInvoiceLogo('token','image/png',png):
     removeServerInvoiceLogo('token'),(e:unknown)=>e instanceof ApiError&&e.kind==='http'&&e.status===status);
   });
   assert.equal(calls,1);
  }
 }
});
test('offline, canceled and timed-out writes fail once without blind retry',async()=>{
 for(const reason of ['offline','abort','timeout']) {
  let calls=0;
  const controller=new AbortController();
  await withFetch((async(_url,init)=>{
   calls++;
   if(reason==='offline')throw new TypeError('offline');
   return await new Promise<Response>((_resolve,reject)=>{
    init?.signal?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
    if(reason==='abort')controller.abort();
   });
  }) as typeof fetch,async()=>{
   await assert.rejects(uploadServerInvoiceLogo('token','image/png',png,controller.signal,5),
    (e:unknown)=>e instanceof ApiError&&e.kind==='network');
  });
  assert.equal(calls,1);
 }
});
test('two verified tenant tokens cannot share a cached logo result or mutate each other',async()=>{
 const observed:Array<{token:string|null;method:string|undefined}>=[];
 await withFetch((async(_url,init)=>{
  observed.push({token:new Headers(init?.headers).get('Authorization'),method:init?.method});
  return json({data:{...base,hasLogo:init?.method==='POST'}});
 }) as typeof fetch,async()=>{
  await uploadServerInvoiceLogo('token-shop-A','image/png',png);
  await removeServerInvoiceLogo('token-shop-B');
 });
 assert.deepEqual(observed,[{token:'Bearer token-shop-A',method:'POST'},{token:'Bearer token-shop-B',method:'DELETE'}]);
});
