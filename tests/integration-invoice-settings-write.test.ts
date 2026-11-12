import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  updateServerInvoicePreference,
  type ServerInvoiceSettings,
} from '../src/integration/invoice-settings.ts';

const origin = 'https://hisabiq-invoice-write-test.example';
const base: ServerInvoiceSettings = {
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
function json(value: unknown, status=200): Response {
  return new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
}
async function withFetch(fake:typeof fetch,action:()=>Promise<void>): Promise<void> {
  const before=globalThis.fetch, w=(globalThis as any).window, loc=(globalThis as any).location;
  (globalThis as any).fetch=fake;
  (globalThis as any).window={location:{origin}};
  (globalThis as any).location={origin};
  try { await action(); } finally {
    globalThis.fetch=before;
    if(w===undefined)delete (globalThis as any).window;else (globalThis as any).window=w;
    if(loc===undefined)delete (globalThis as any).location;else (globalThis as any).location=loc;
  }
}
test('single property PUT to verified invoice endpoint with server-confirmed full response',async()=>{
  let count=0;
  await withFetch((async(url,init)=>{
    count++;
    assert.equal(String(url),origin+'/api/v1/sales/invoice-settings');
    assert.equal(init?.method,'PUT');
    assert.equal(init?.redirect,'error');
    assert.equal(init?.credentials,'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer tenant-A');
    assert.deepEqual(JSON.parse(String(init?.body)),{language:'BN'});
    assert.equal(String(init?.body).includes('hasLogo'),false);
    return json({data:{...base,language:'BN'}});
  }) as typeof fetch,async()=>{
    const reply=await updateServerInvoicePreference('tenant-A',base,'language','BN');
    assert.equal(reply.data.language,'BN');
    assert.deepEqual(base.language,'EN');
    assert.deepEqual(reply.data.hasLogo,false);
  });
  assert.equal(count,1);
});
test('all and only supported server fields preserve their precise wire types',async()=>{
  const cases:Array<[string,unknown]> = [
    ['language','BN'],
    ['defaultTemplate','THERMAL_80'],
    ['thermalPaper','58mm'],
    ['showLogo',false],
    ['showCustomerBlock',false],
    ['showDiscount',false],
    ['showPaymentBreakdown',false],
    ['showDue',false],
    ['showAmountInWords',false],
  ];
  let count=0;
  await withFetch((async(_url,init)=>{
    count++;
    const body=JSON.parse(String(init?.body));
    assert.equal(Object.keys(body).length,1);
    return json({data:{...base,...body}});
  }) as typeof fetch,async()=>{
    for(const [key,value] of cases){
      const reply=await updateServerInvoicePreference('owner-token',base,key as any,value as any);
      assert.deepEqual((reply.data as any)[key],value);
    }
  });
  assert.equal(count,cases.length);
});
test('forbid unsupported design/MIXED/hasLogo, wrong value and no-op before network',async()=>{
  let count=0;
  await withFetch((async()=>{count++;return json({data:base})}) as typeof fetch,async()=>{
    for(const [key,value] of [
      ['hasLogo',true],['designId','premium'],['accentHex','#009999'],['premium',true],
      ['language','MIXED'],['language','EN'],['language',true],
      ['defaultTemplate','Standard'],['thermalPaper','42mm'],
      ['showDiscount','false'],['showDue',true],['showCustomerBlock',0],
      ['businessName','Forgery'],['terms',['x']],
    ] as Array<[string,unknown]>) {
      await assert.rejects(
        updateServerInvoicePreference('verified',base,key as any,value as any),
        (err:unknown)=>err instanceof ApiError&&err.kind==='protocol',
      );
    }
    for(const invalid of [
      {...base,hasLogo:'yes'}, {...base,unsafeAdminRole:'OWNER'},
      {...base,contactPhones:[{label:'x',number:'y',token:'z'}]},
    ]){
      await assert.rejects(
        updateServerInvoicePreference('verified',invalid as ServerInvoiceSettings,'language','BN'),
        (err:unknown)=>err instanceof ApiError&&err.kind==='protocol',
      );
    }
    for(const timeout of [-1,0,2.5,120001]){
      await assert.rejects(
        updateServerInvoicePreference('verified',base,'language','BN',undefined,timeout),
        (err:unknown)=>err instanceof ApiError&&err.kind==='protocol',
      );
    }
  });
  assert.equal(count,0);
});
test('server mismatch or malformed full response is protocol failure, no optimism',async()=>{
  const broken=[
    {data:base},{data:{...base,language:'MIXED'}},{data:{...base,language:'BN',hasLogo:'true'}},
    {data:{...base,language:'BN',unknown:'preview'}},{data:null},
    {data:{...base,language:'BN',showLogo:undefined}},
  ];
  for(const response of broken){
    let count=0;
    await withFetch((async()=>{count++;return json(response)}) as typeof fetch,async()=>{
      await assert.rejects(
        updateServerInvoicePreference('token',base,'language','BN'),
        (err:unknown)=>err instanceof ApiError&&err.kind==='protocol',
      );
    });
    assert.equal(count,1);
  }
});
test('401,403,422,500 fail once; not an idempotency-keyed request',async()=>{
  for(const status of [401,403,422,500]){
    let count=0;
    await withFetch((async()=>{count++;return json({error:{code:'DENIED',message:'Unavailable',details:{},traceId:'test'}},status)}) as typeof fetch,async()=>{
      await assert.rejects(
        updateServerInvoicePreference('token',base,'language','BN'),
        (err:unknown)=>err instanceof ApiError&&err.kind==='http'&&err.status===status,
      );
    });
    assert.equal(count,1);
  }
});
test('offline, abort and timeout never replay unknown financial settings outcome',async()=>{
  for(const reason of ['offline','abort','timeout']){
    let count=0;
    const controller=new AbortController();
    await withFetch((async(_url,init)=>{
      count++;
      if(reason==='offline')throw new TypeError('Disconnected');
      return await new Promise<Response>((_resolve,reject)=>{
        init?.signal?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
        if(reason==='abort')controller.abort();
      });
    }) as typeof fetch,async()=>{
      await assert.rejects(
        updateServerInvoicePreference('token',base,'language','BN',controller.signal,5),
        (err:unknown)=>err instanceof ApiError&&err.kind==='network',
      );
    });
    assert.equal(count,1);
  }
});
test('separate tenant bearer requests carry only own requested change, never tenant ID',async()=>{
  const observed:Array<{token:string|null;body:unknown}>=[];
  await withFetch((async(_url,init)=>{
    const token=new Headers(init?.headers).get('Authorization');
    const body=JSON.parse(String(init?.body));
    observed.push({token,body});
    return json({data:{...base,...body}});
  }) as typeof fetch,async()=>{
    await updateServerInvoicePreference('tenant-A-token',base,'language','BN');
    await updateServerInvoicePreference('tenant-B-token',base,'showDue',false);
  });
  assert.deepEqual(observed,[
    {token:'Bearer tenant-A-token',body:{language:'BN'}},
    {token:'Bearer tenant-B-token',body:{showDue:false}},
  ]);
});
