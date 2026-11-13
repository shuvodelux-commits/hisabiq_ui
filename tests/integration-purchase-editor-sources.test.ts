import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  decodePurchaseSupplier,
  decodePurchaseSupplierList,
  readPurchaseSupplier,
  readPurchaseSuppliers,
  type ServerPurchaseSupplier,
} from '../src/integration/purchase-suppliers.ts';
import {
  purchaseSourceIdentity,
  readPurchaseEditorSourceChoices,
  resolvePurchaseEditorSources,
} from '../src/integration/purchase-editor-sources.ts';
import type { ServerProduct } from '../src/integration/products.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';
import { encodePurchaseEditorDraft } from '../src/integration/purchase-draft-editor.ts';
import type { PurchaseDraftInput } from '../src/data/purchaseDraftsPreviewStore.ts';

const ORIGIN = 'https://trusted-hisabiq.test';
const tenant = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const user = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const supplierId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const productId2 = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';

function session(other: Record<string, unknown> = {}): SessionSnapshot {
  return {
    status: 'authenticated', tenantId: tenant, userId: user, epoch: 11,
    accessToken: 'signed-user-token', timezone: 'Asia/Dhaka',
    username: 'owner', displayName: 'Owner', roleName: 'Owner',
    businessName: 'Hardware', persistence: 'memory', features: [],
    permissions: ['purchase.bill.create', 'inventory.cost.view',
      'party.supplier.view', 'catalog.product.view'],
    ...other,
  } as SessionSnapshot;
}
function party(overrides: Partial<ServerPurchaseSupplier> = {}): ServerPurchaseSupplier {
  return {
    id: supplierId, name:'Rahman Traders',
    roles:['CUSTOMER','SUPPLIER'], phone:null, address:null,
    guardianName:null,nid:null,email:null,notes:null,
    customerGroupId:null,customerGroupName:null,creditLimitMinor:null,
    status:'ACTIVE',isSystemReserved:false,version:1,hasLedgerEntries:false,
    balance:{netMinor:0,direction:'SETTLED',outstandingMinor:0,advanceMinor:0},
    ...overrides,
  };
}
function product(overrides: Partial<ServerProduct> = {}): ServerProduct {
  return {
    id:productId,name:'Copper Cable',displayName:'Copper Cable',
    brandId:null,brandName:null,categoryId:null,categoryName:null,
    parentCategoryName:null,sku:null,barcode:null,description:null,
    baseUnitId:tenant,baseUnitName:'Pcs',
    sellingPriceMinor:2500,purchasePriceMinor:1700,
    minStockQty:0,status:'ACTIVE',defaultDiscountType:null,
    defaultDiscountValue:null,offerEnabled:false,offerPriceMinor:null,
    offerStartDate:null,offerEndDate:null,offerLive:false,
    hasImage:false,tracksExpiry:false,tracksSerial:false,
    conversion:null,stockQty:12000,stockStatus:'IN_STOCK',
    hasStockHistory:true,usualSupplierId:supplierId,
    usualSupplierName:'Rahman Traders',minOrderQty:null,
    warrantyMonths:null,supplierWarrantyMonths:null,version:1,
    ...overrides,
  };
}
const supplierSummary = {
  total:1,active:1,inactive:0,ungrouped:0,
  totalOutstandingMinor:0,totalAdvanceMinor:0,overCreditLimit:0,
};
function listSuppliers(rows: ServerPurchaseSupplier[] = [party()],hasMore=false) {
  return {data:rows,page:{nextCursor:hasMore?supplierId:null,hasMore},summary:supplierSummary};
}
function listProducts(rows: ServerProduct[] = [product()],hasMore=false) {
  return {
    data:rows,page:{nextCursor:hasMore?productId:null,hasMore},
    summary:{total:rows.length,active:rows.length,inactive:0,withoutBarcode:rows.length},
  };
}
const isProtocol = (reason: unknown) =>
  reason instanceof ApiError && reason.kind === 'protocol';
function response(data: unknown,status=200): Response {
  return new Response(JSON.stringify(data), {
    status,headers:{'content-type':'application/json'},
  });
}
async function mockedFetch(handler: typeof fetch, run:()=>Promise<void>) {
  const oldFetch=globalThis.fetch;
  const oldWindow=(globalThis as any).window;
  const oldLocation=(globalThis as any).location;
  (globalThis as any).fetch=handler;
  (globalThis as any).window={location:{origin:ORIGIN}};
  (globalThis as any).location={origin:ORIGIN};
  try { await run(); } finally {
    globalThis.fetch=oldFetch;
    if (oldWindow===undefined) delete (globalThis as any).window;
    else (globalThis as any).window=oldWindow;
    if (oldLocation===undefined) delete (globalThis as any).location;
    else (globalThis as any).location=oldLocation;
  }
}
function fakeServer(override?: (url:URL,init?:RequestInit)=>Response) {
  const calls:string[]=[];
  const fake: typeof fetch = async (request,init) => {
    const url = new URL(String(request));
    calls.push(url.pathname+url.search);
    assert.equal(url.origin,ORIGIN);
    assert.equal(init?.method,'GET');
    assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer signed-user-token');
    assert.equal(init?.credentials,'omit');
    assert.equal(init?.body,undefined);
    if (override) return override(url,init);
    if (url.pathname==='/api/v1/parties') return response(listSuppliers());
    if (url.pathname==='/api/v1/products') return response(listProducts());
    if (url.pathname==='/api/v1/parties/'+supplierId)
      return response({data:party()});
    if (url.pathname==='/api/v1/products/'+productId)
      return response({data:product()});
    if (url.pathname==='/api/v1/products/'+productId2)
      return response({data:product({id:productId2})});
    throw Error('Unexpected source read: '+url.pathname);
  };
  return {fake,calls};
}

test('strict Nest party response retains supplier role and role-scoped balance without fabrication',()=>{
  assert.equal(decodePurchaseSupplier({data:party()}).data.name,'Rahman Traders');
  assert.equal(decodePurchaseSupplierList(listSuppliers()).data[0]?.id,supplierId);
  assert.throws(()=>decodePurchaseSupplier({data:party({roles:['CUSTOMER','CUSTOMER']})}),isProtocol);
  assert.throws(()=>decodePurchaseSupplier({data:party({
    balance:{netMinor:-500,direction:'RECEIVABLE',outstandingMinor:0,advanceMinor:500},
  })}),isProtocol);
  assert.throws(()=>decodePurchaseSupplierList({
    ...listSuppliers(),page:{hasMore:true,nextCursor:null},
  }),isProtocol);
  assert.throws(()=>decodePurchaseSupplierList({
    ...listSuppliers(),data:[party(),party()],
  }),isProtocol);
  assert.throws(()=>decodePurchaseSupplier({data:{...party(),unexpectedTenantId:tenant}}),isProtocol);
});

test('purchase supplier list and detail use only authenticated SUPPLIER role endpoints',async()=>{
  const {fake,calls}=fakeServer();
  await mockedFetch(fake,async()=>{
    const list=await readPurchaseSuppliers('signed-user-token',{
      status:'ACTIVE',search:'Rahman',limit:50,cursor:supplierId,
    });
    assert.equal(list.data[0]?.roles.includes('SUPPLIER'),true);
    const result=await readPurchaseSupplier('signed-user-token',supplierId);
    assert.equal(result.data.id,supplierId);
  });
  assert.equal(calls.length,2);
  for (const url of calls) assert.equal(new URL(url,ORIGIN).searchParams.get('role'),'SUPPLIER');
  assert.equal(new URL(calls[0]!,ORIGIN).searchParams.get('status'),'ACTIVE');
  assert.equal(new URL(calls[0]!,ORIGIN).searchParams.get('cursor'),supplierId);
  assert.ok(calls[1]?.endsWith('?role=SUPPLIER'));
});

test('client cannot pass fixture ids, arbitrary query keys, invalid tokens or unauthorized sessions',async()=>{
  let requests=0;
  await mockedFetch(async()=>{requests++;throw Error('Should never fetch')},async()=>{
    for(const changed of [
      {tenantId:'t1'}, {userId:'preview-user'}, {accessToken:''},
      {permissions:['purchase.bill.create','inventory.cost.view']},
      {permissions:['purchase.bill.create','catalog.product.view','party.supplier.view']},
      {permissions:['inventory.cost.view','catalog.product.view','party.supplier.view']},
    ]) assert.throws(()=>purchaseSourceIdentity(session(changed)),isProtocol);
    assert.throws(()=>purchaseSourceIdentity({status:'preview',epoch:0}),isProtocol);
    await assert.rejects(readPurchaseSupplier('signed-user-token','preview-supplier'),isProtocol);
    await assert.rejects(readPurchaseSuppliers('signed-user-token',{
      extra:'BAD',
    } as any),isProtocol);
    await assert.rejects(resolvePurchaseEditorSources(session(),{
      supplierId:'preview-supplier',productIds:[],
    }),isProtocol);
    await assert.rejects(resolvePurchaseEditorSources(session(),{
      supplierId:'',productIds:[productId,productId],
    }),isProtocol);
    await assert.rejects(readPurchaseEditorSourceChoices(
      session(),{limit:201}),isProtocol);
  });
  assert.equal(requests,0);
});

test('two independent paginated source lists remain explicit about incomplete catalogs',async()=>{
  const {fake,calls}=fakeServer((url)=>{
    if(url.pathname==='/api/v1/parties')return response(listSuppliers([party()],true));
    if(url.pathname==='/api/v1/products')return response(listProducts([product()],true));
    throw Error('Unexpected source read');
  });
  await mockedFetch(fake,async()=>{
    const result=await readPurchaseEditorSourceChoices(session(),{
      search:'Wire',limit:25,supplierCursor:supplierId,productCursor:productId,
    });
    assert.equal(result.suppliers.data[0]?.id,supplierId);
    assert.equal(result.products.data[0]?.id,productId);
    assert.equal(result.completeSupplierList,false);
    assert.equal(result.completeProductList,false);
    assert.equal(result.identity,purchaseSourceIdentity(session()));
  });
  assert.equal(calls.length,2);
  assert.ok(calls.some(url=>url.startsWith('/api/v1/products?')));
  assert.ok(calls.some(url=>url.startsWith('/api/v1/parties?')));
  for (const item of calls) {
    const q=new URL(item,ORIGIN).searchParams;
    assert.equal(q.get('status'),'ACTIVE');
    assert.equal(q.get('limit'),'25');
    assert.equal(q.get('search'),'Wire');
  }
});

test('source list rejects inactive, role-only vendor, redacted costs or inconsistent cursor',async()=>{
  for(const target of ['supplier-role','supplier-inactive','product-inactive','redacted','cursor']) {
    const {fake}=fakeServer(url=>{
      if(url.pathname==='/api/v1/parties') {
        if(target==='supplier-role')return response(listSuppliers([party({roles:['VENDOR']})]));
        if(target==='supplier-inactive')return response(listSuppliers([party({status:'INACTIVE'})]));
        return response(listSuppliers());
      }
      if(url.pathname==='/api/v1/products') {
        if(target==='product-inactive')return response(listProducts([product({status:'INACTIVE'})]));
        if(target==='redacted') {
          const redacted=product(); delete (redacted as any).purchasePriceMinor;
          return response(listProducts([redacted]));
        }
        if(target==='cursor')return response({
          ...listProducts(),page:{hasMore:true,nextCursor:null},
        });
        return response(listProducts());
      }
      throw Error('Unexpected source read');
    });
    await mockedFetch(fake,async()=>{
      await assert.rejects(readPurchaseEditorSourceChoices(session()),isProtocol);
    });
  }
});

test('exact selected real IDs resolve from detail, independent of first catalog page',async()=>{
  const {fake,calls}=fakeServer();
  await mockedFetch(fake,async()=>{
    const resolved=await resolvePurchaseEditorSources(session(),{
      supplierId,productIds:[productId,productId2],
    });
    assert.equal(resolved.identity,purchaseSourceIdentity(session()));
    assert.equal(resolved.sources.tenantId,tenant);
    assert.equal(resolved.sources.supplierNames.get(supplierId),'Rahman Traders');
    assert.deepEqual([...resolved.sources.productIds].sort(),[productId,productId2].sort());
    assert.equal(resolved.products.get(productId2)?.purchasePriceMinor,1700);
    assert.equal(resolved.supplier?.roles.includes('SUPPLIER'),true);
    const snapshot:PurchaseDraftInput={
      tenantId:tenant,supplierId,supplierName:'Rahman Traders',
      date:'2026-11-13',backdateReason:'',referenceNo:'INV-55',
      notes:'retain units',lines:[{id:'line-real-1',product:{id:productId,name:'Copper Cable',unit:'Pcs'},
        bigQty:'2',smallQty:'0',cost:'17',costUnit:'Pcs',unitQuantities:{Pcs:'2'},
        lotSellUnit:'Pcs',lotSellPrice:'',detailsOpen:true,
        serialText:'SER-1',batchNumber:'LOT-1',manufactureDate:'',expiryDate:''} as any],
      payments:[],discount:'',discountMode:'amount',photos:[],total:34,
    };
    const encoded=encodePurchaseEditorDraft(session() as any,resolved.sources,snapshot);
    assert.equal(encoded.grandTotalMinor,3400);
    assert.equal(encoded.itemCount,1);
    assert.equal((encoded.cart.editor as any).lines[0].serialText,'SER-1');
  });
  assert.equal(calls.some(path=>path.startsWith('/api/v1/products?')),false);
  assert.equal(calls.length,3);
});

test('empty unfinished draft resolves without pretending that suppliers or products exist',async()=>{
  const {fake,calls}=fakeServer();
  await mockedFetch(fake,async()=>{
    const result=await resolvePurchaseEditorSources(session(),{
      supplierId:'',productIds:[],
    });
    assert.equal(result.supplier,null);
    assert.equal(result.products.size,0);
    assert.equal(result.sources.supplierNames.size,0);
    assert.equal(result.sources.productIds.size,0);
  });
  assert.equal(calls.length,0);
});

test('missing, inactive, role-wrong, mismatched and redacted detail source fail closed',async()=>{
  for (const variation of ['missing','inactive','wrong-role','wrong-id','redacted']) {
    const {fake}=fakeServer(url=>{
      if(url.pathname==='/api/v1/parties/'+supplierId) {
        if (variation==='wrong-role') return response({data:party({roles:['VENDOR']})});
        return response({data:party()});
      }
      if(url.pathname==='/api/v1/products/'+productId) {
        if (variation==='missing') return response({error:{
          code:'NOT_FOUND',message:'missing',details:{},traceId:'t-1',
        }},404);
        if (variation==='inactive')return response({data:product({status:'INACTIVE'})});
        if (variation==='wrong-id')return response({data:product({id:productId2})});
        if (variation==='redacted') {
          const redacted=product(); delete (redacted as any).purchasePriceMinor;
          return response({data:redacted});
        }
        return response({data:product()});
      }
      throw Error('Unexpected source detail');
    });
    await mockedFetch(fake,async()=>{
      await assert.rejects(resolvePurchaseEditorSources(session(),{
        supplierId,productIds:[productId],
      }), variation==='missing'
        ? (error:unknown)=>error instanceof ApiError && error.kind==='http' && error.status===404
        : isProtocol);
    });
  }
});

test('permission and network errors do not silently load previews or retry',async()=>{
  let requests=0;
  await mockedFetch(async()=>{requests++;throw Error('Offline')},async()=>{
    await assert.rejects(resolvePurchaseEditorSources(session(),{
      supplierId:'',productIds:[productId],
    }),(e:unknown)=>e instanceof ApiError && e.kind==='network');
  });
  assert.equal(requests,1);
  const abort=new AbortController();abort.abort();
  await mockedFetch(async()=>{requests++;throw Error('Should not fetch')},async()=>{
    await assert.rejects(resolvePurchaseEditorSources(session(),{
      supplierId,productIds:[productId],
    },abort.signal),isProtocol);
  });
  assert.equal(requests,1);
});
