import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/4XkAAAAASUVORK5CYII=', 'base64');
const base = {language:'EN',defaultTemplate:'A4',showLogo:true,showBusinessBlock:true,showCustomerBlock:true,showSku:false,showBarcode:false,showDiscount:true,showPaymentBreakdown:true,showDue:true,showAmountInWords:true,headerText:null,showHeaderText:true,invoiceTitle:null,businessNameEn:null,proprietorName:null,proprietorNote:null,businessDescription:null,businessPhone2:null,contactPhones:[],mfsNumbers:[],terms:[],paymentTermsDays:0,paymentTermsLabel:null,thermalPaper:'80mm',showSignatureLines:true,hasLogo:false,businessName:null,businessAddress:null,businessPhone:null,footerText:null,termsText:null,businessPadEnabled:false,businessPadTopMm:40,pageMarginMm:10};
const file = (name:string,type:string,bytes:Uint8Array, read?:()=>Promise<ArrayBuffer>) => ({name,type,size:bytes.length,arrayBuffer:read??(async()=>Uint8Array.from(bytes).buffer)}) as File;
const tick = () => new Promise(resolve=>setTimeout(resolve,0));

test('selection is dirty but inert; validated upload and confirmed delete each send once',async()=>{
 const server=await createServer({cacheDir:'/tmp/issue-343-logo-vite-cache',server:{middlewareMode:true,hmr:false}});
 const oldFetch=globalThis.fetch, oldWindow=(globalThis as any).window;
 (globalThis as any).window={location:{origin:'https://logo-actions.test'}};
 const calls:Array<{method:string|undefined;token:string|null;body:any}>=[];
 globalThis.fetch=(async(_url,init)=>{calls.push({method:init?.method,token:new Headers(init?.headers).get('Authorization'),body:init?.body?JSON.parse(String(init.body)):null});return new Response(JSON.stringify({data:{...base,hasLogo:init?.method==='POST'}}),{headers:{'Content-Type':'application/json'}})}) as typeof fetch;
 try{
  const {createConnectedInvoiceLogoActionsController}=await server.ssrLoadModule('/src/settings/magic/invoice/ConnectedInvoiceLogoActions.tsx');
  const states:any[]=[];const confirmed:any[]=[];
  const c=createConnectedInvoiceLogoActionsController((s:any)=>states.push(s),(d:any)=>confirmed.push(d));
  c.configure({identityKey:'tenant-A:user:1',accessToken:'token-A',canEdit:true,blocked:false});
  c.select(file('logo.png','image/png',png));
  assert.equal(calls.length,0);assert.equal(states.at(-1).selectedName,'logo.png');
  await c.upload();assert.equal(calls.length,1);assert.equal(calls[0].method,'POST');assert.equal(calls[0].token,'Bearer token-A');assert.equal(calls[0].body.mime,'image/png');assert.equal(calls[0].body.dataBase64,png.toString('base64'));assert.equal(confirmed[0].hasLogo,true);
  assert.equal(states.at(-1).selectedName,null);
  await c.remove();assert.equal(calls.length,1,'delete requires explicit confirmation');
  c.requestDelete();assert.equal(calls.length,1);await c.remove();assert.equal(calls.length,2);assert.equal(calls[1].method,'DELETE');assert.equal(calls[1].body,null);assert.equal(confirmed[1].hasLogo,false);
  c.dispose();
 }finally{globalThis.fetch=oldFetch;if(oldWindow===undefined)delete (globalThis as any).window;else (globalThis as any).window=oldWindow;await server.close();}
});

test('invalid files, guards, unknown outcomes and identity changes fail closed',async()=>{
 const server=await createServer({cacheDir:'/tmp/issue-343-logo-vite-cache',server:{middlewareMode:true,hmr:false}});
 const oldFetch=globalThis.fetch, oldWindow=(globalThis as any).window;
 (globalThis as any).window={location:{origin:'https://logo-actions.test'}};
 let calls=0;let status=200;let hold:((value:Response)=>void)|null=null;
 globalThis.fetch=(async()=>{calls++;if(hold)return await new Promise<Response>(resolve=>{hold=resolve});if(status===0)throw TypeError('offline');return new Response(JSON.stringify({data:{...base,hasLogo:true}}),{status,headers:{'Content-Type':'application/json'}})}) as typeof fetch;
 try{
  const {createConnectedInvoiceLogoActionsController}=await server.ssrLoadModule('/src/settings/magic/invoice/ConnectedInvoiceLogoActions.tsx');
  const states:any[]=[];const confirmed:any[]=[];
  const c=createConnectedInvoiceLogoActionsController((s:any)=>states.push(s),(d:any)=>confirmed.push(d));
  c.configure({identityKey:'A',accessToken:'token-A',canEdit:true,blocked:false});
  for(const bad of [file('x.svg','image/svg+xml',png),file('x.jpg','image/jpeg',png),file('x.png','image/png',new Uint8Array()),file('x.png','image/png',new Uint8Array(256*1024+1)),file('x.png','image/png',new Uint8Array([1,2,3,4,5,6,7,8]))]){c.select(bad);await c.upload();}
  assert.equal(calls,0);
  c.configure({identityKey:'A',accessToken:'token-A',canEdit:false,blocked:false});c.select(file('x.png','image/png',png));await c.upload();assert.equal(calls,0);
  c.configure({identityKey:'A',accessToken:'token-A',canEdit:true,blocked:true});c.select(file('x.png','image/png',png));await c.upload();assert.equal(calls,0);
  c.configure({identityKey:'A',accessToken:'token-A',canEdit:true,blocked:false});c.select(file('x.png','image/png',png));status=0;await c.upload();assert.equal(calls,1);await c.upload();assert.equal(calls,1,'unknown result cannot retry');assert.equal(states.at(-1).unknown,true);
  c.serverRefreshed();status=403;await c.upload();assert.equal(calls,2);assert.equal(states.at(-1).denied,true);await c.upload();assert.equal(calls,2);
  c.configure({identityKey:'B',accessToken:'token-B',canEdit:true,blocked:false});assert.equal(states.at(-1).selectedName,null);assert.equal(states.at(-1).denied,false);
  status=200;hold=(_response:Response)=>{ /* response is retained until identity changes */ };c.select(file('x.png','image/png',png));const pending=c.upload();await tick();c.configure({identityKey:'C',accessToken:'token-C',canEdit:true,blocked:false});hold?.(new Response(JSON.stringify({data:{...base,hasLogo:true}}),{headers:{'Content-Type':'application/json'}}));await pending;assert.equal(confirmed.length,0);assert.equal(states.at(-1).selectedName,null);
  c.dispose();
 }finally{globalThis.fetch=oldFetch;if(oldWindow===undefined)delete (globalThis as any).window;else (globalThis as any).window=oldWindow;await server.close();}
});
