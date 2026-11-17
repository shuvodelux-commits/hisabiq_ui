import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { readServerInvoiceLogo } from '../src/integration/invoice-logo.ts';
const origin='https://hisabiq-logo-binary.test';
const png=new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/4XkAAAAASUVORK5CYII=','base64'));
const formats:Array<{mime:string;bytes:Uint8Array}>= [
 {mime:'image/png',bytes:png},
 {mime:'image/jpeg',bytes:new Uint8Array([255,216,255,224,0,16,74,70,73,70,0,1,1,0,0,1,0,1,0,0])},
 {mime:'image/webp',bytes:new Uint8Array(Buffer.from('RIFF0000WEBPVP8 ','binary'))},
 {mime:'image/gif',bytes:new Uint8Array(Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00','binary'))},
];
function response(bytes:Uint8Array,mime='image/png',headers:Record<string,string>={}){
 return new Response(new Uint8Array(bytes),{status:200,headers:{'Content-Type':mime,...headers}});
}
async function mockFetch(fake:typeof fetch,action:()=>Promise<void>):Promise<void>{
 const before=globalThis.fetch,w=(globalThis as any).window,l=(globalThis as any).location;
 (globalThis as any).fetch=fake;
 (globalThis as any).window={location:{origin}};
 (globalThis as any).location={origin};
 try{await action();}finally{
  globalThis.fetch=before;
  if(w===undefined)delete (globalThis as any).window;else (globalThis as any).window=w;
  if(l===undefined)delete (globalThis as any).location;else (globalThis as any).location=l;
 }
}
test('GET binary with exact bearer, same origin, no cookies, redirect, cache or query leakage',async()=>{
 let calls=0;
 await mockFetch((async(url,init)=>{
  calls++;
  assert.equal(String(url),origin+'/api/v1/sales/invoice-logo');
  assert.equal(init?.method,'GET');
  assert.equal(init?.body,undefined);
  assert.equal(init?.credentials,'omit');
  assert.equal(init?.redirect,'error');
  assert.equal(init?.cache,'no-store');
  assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer tenant-A');
  assert.equal(new Headers(init?.headers).get('Accept'),'image/png, image/jpeg, image/webp, image/gif');
  return response(png,'image/png');
 }) as typeof fetch,async()=>{
  const img=await readServerInvoiceLogo('tenant-A');
  assert.equal(img.mime,'image/png');
  assert.deepEqual(img.bytes,png);
  assert.ok(img.bytes instanceof Uint8Array);
 });
 assert.equal(calls,1);
});
test('binary content accepts only source-supported matching signatures',async()=>{
 let calls=0;
 await mockFetch((async()=>{const item=formats[calls++];return response(item.bytes,item.mime)}) as typeof fetch,async()=>{
  for(const {mime,bytes} of formats){
   const img=await readServerInvoiceLogo('tenant-A');
   assert.equal(img.mime,mime);
   assert.deepEqual(img.bytes,bytes);
  }
 });
 assert.equal(calls,4);
});
test('invalid bearer, deadline or pre-aborted signal refuses request before network',async()=>{
 let calls=0;
 await mockFetch((async()=>{calls++;return response(png)}) as typeof fetch,async()=>{
  for(const token of ['', 'white space', 'x\nbad',null,123]){
   await assert.rejects(readServerInvoiceLogo(token as string),(e:unknown)=>e instanceof ApiError&&e.kind==='protocol');
  }
  for(const timeout of [0,-1,1.1,120001]){
   await assert.rejects(readServerInvoiceLogo('token',undefined,timeout),(e:unknown)=>e instanceof ApiError&&e.kind==='protocol');
  }
  const ctl=new AbortController();ctl.abort();
  await assert.rejects(readServerInvoiceLogo('token',ctl.signal),(e:unknown)=>e instanceof ApiError&&e.kind==='network');
 });
 assert.equal(calls,0);
});
test('non-image content, image with wrong signature, empty body and unsupported MIME fail closed',async()=>{
 const cases=[
  new Response(JSON.stringify({data:42}),{headers:{'Content-Type':'application/json'}}),
  response(png,'image/svg+xml'),
  response(png,'image/jpeg'),
  response(new Uint8Array(), 'image/png'),
  new Response(png,{status:200}),
  response(png,'image/png; charset=utf-8'),
 ];
 for(const bad of cases){
  let calls=0;
  await mockFetch((async()=>{calls++;return bad}) as typeof fetch,async()=>{
   await assert.rejects(readServerInvoiceLogo('token'),(e:unknown)=>e instanceof ApiError&&e.kind==='protocol');
  });
  assert.equal(calls,1);
 }
});
test('malformed or too-large Content-Length fails before body consumption',async()=>{
 for(const val of ['1572865','-1','NaN','1e9','', '0']){
  const res=response(png,'image/png',{'Content-Length':val});
  await mockFetch((async()=>res) as typeof fetch,async()=>{
   await assert.rejects(readServerInvoiceLogo('token'),(e:unknown)=>e instanceof ApiError&&e.kind==='protocol');
  });
 }
});
test('streamed oversized body stops at cap even without Content-Length',async()=>{
 let canceled=false;
 let generated=0;
 const stream=new ReadableStream<Uint8Array>({
  pull(controller){
   generated++;
   controller.enqueue(new Uint8Array(790000));
  },
  cancel(){canceled=true;},
 });
 await mockFetch((async()=>new Response(stream,{headers:{'Content-Type':'image/png'}})) as typeof fetch,async()=>{
  await assert.rejects(readServerInvoiceLogo('token'),(e:unknown)=>e instanceof ApiError&&e.kind==='protocol');
 });
 assert.ok(generated<=3,'must not drain unbounded body');
 assert.equal(canceled,true);
});
test('401,403,404 and 500 remain HTTP errors; one fetch only with no preview fallback',async()=>{
 for(const status of [401,403,404,500]){
  let calls=0;
  await mockFetch((async()=>{calls++;return new Response('denied',{status,headers:{'Content-Type':'application/json'}})}) as typeof fetch,async()=>{
   await assert.rejects(readServerInvoiceLogo('token'),(e:unknown)=>e instanceof ApiError&&e.kind==='http'&&e.status===status);
  });
  assert.equal(calls,1);
 }
});
test('offline, canceled and timed-out GET do not retry',async()=>{
 for(const cause of ['offline','abort','timeout']){
  let calls=0;
  const ctl=new AbortController();
  await mockFetch((async(_url,init)=>{
   calls++;
   if(cause==='offline')throw new TypeError('offline');
   return await new Promise<Response>((_resolve,reject)=>{
    init?.signal?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
    if(cause==='abort')ctl.abort();
   });
  }) as typeof fetch,async()=>{
   await assert.rejects(readServerInvoiceLogo('token',ctl.signal,5),(e:unknown)=>e instanceof ApiError&&e.kind==='network');
  });
  assert.equal(calls,1);
 }
});
test('separate tenant bearers receive distinct image bytes; no shared cache or object URLs',async()=>{
 const seen:string[]=[];
 await mockFetch((async(_url,init)=>{
  const token=new Headers(init?.headers).get('Authorization') ?? '';
  seen.push(token);
  return token==='Bearer tenant-A'?response(png):response(formats[1].bytes,'image/jpeg');
 }) as typeof fetch,async()=>{
  const a=await readServerInvoiceLogo('tenant-A');
  const b=await readServerInvoiceLogo('tenant-B');
  assert.equal(a.mime,'image/png');
  assert.equal(b.mime,'image/jpeg');
  assert.notDeepEqual(a.bytes,b.bytes);
 });
 assert.deepEqual(seen,['Bearer tenant-A','Bearer tenant-B']);
});
