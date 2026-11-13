import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  reopenConnectedPurchaseDraftReadOnly,
  connectedPurchaseResumeIsCurrent,
  extractPurchaseDraftSourceSelection,
} from '../src/integration/purchase-editor-resume.ts';
import { encodePurchaseEditorDraft } from '../src/integration/purchase-draft-editor.ts';
import type { PurchaseDraftInput } from '../src/data/purchaseDraftsPreviewStore.ts';
import type { ServerProduct } from '../src/integration/products.ts';
import type { ServerPurchaseSupplier } from '../src/integration/purchase-suppliers.ts';
import type { ServerPurchaseDraft } from '../src/integration/purchase-drafts.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';

const ORIGIN = 'https://verified-hisabiq-drafts.test';
const tenant = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const user = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const supplierId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const draftId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
function session(changes: Record<string,unknown> = {}): SessionSnapshot {
  return {
    status:'authenticated',tenantId:tenant,userId:user,epoch:5,
    accessToken:'verified-user-jwt',timezone:'Asia/Dhaka',username:'owner',
    displayName:'Owner',roleName:'Owner',businessName:'Hardware',
    permissions:['purchase.bill.create','inventory.cost.view',
      'party.supplier.view','catalog.product.view'],features:[],persistence:'memory',
    ...changes,
  } as SessionSnapshot;
}
function supplier(changes: Partial<ServerPurchaseSupplier> = {}): ServerPurchaseSupplier {
  return {
    id:supplierId,name:'Rahman Traders',roles:['CUSTOMER','SUPPLIER'],
    phone:null,address:null,guardianName:null,nid:null,email:null,notes:null,
    customerGroupId:null,customerGroupName:null,creditLimitMinor:null,
    status:'ACTIVE',isSystemReserved:false,version:1,
    balance:{netMinor:0,direction:'SETTLED',outstandingMinor:0,advanceMinor:0},
    hasLedgerEntries:false,...changes,
  };
}
function product(changes: Partial<ServerProduct> = {}): ServerProduct {
  return {
    id:productId,name:'Copper Cable',displayName:'Copper Cable',
    brandId:null,brandName:null,categoryId:null,categoryName:null,
    parentCategoryName:null,sku:null,barcode:null,description:null,
    baseUnitId:tenant,baseUnitName:'Feet',sellingPriceMinor:2400,
    purchasePriceMinor:1700,minStockQty:0,status:'ACTIVE',
    defaultDiscountType:null,defaultDiscountValue:null,
    offerEnabled:false,offerPriceMinor:null,offerStartDate:null,
    offerEndDate:null,offerLive:false,hasImage:false,tracksExpiry:false,
    tracksSerial:false,conversion:{unitId:user,unitName:'Pipe',factorQty:20000},
    stockQty:100000,stockStatus:'IN_STOCK',hasStockHistory:true,
    usualSupplierId:supplierId,usualSupplierName:'Rahman Traders',
    minOrderQty:null,warrantyMonths:null,supplierWarrantyMonths:null,version:1,
    ...changes,
  };
}
function editor(): PurchaseDraftInput {
  return {
    tenantId:tenant,supplierId,supplierName:'Rahman Traders',
    date:'2026-11-13',backdateReason:'',referenceNo:'INV-100',
    notes:'Do not flatten price or unit details',photos:[],total:123.45,
    discount:'5',discountMode:'percent',
    lines:[{
      id:'line-1',product:{
        id:productId,name:'Copper Cable',sku:'CC-1',
        unit:'Feet',altUnit:{unit:'Pipe',factor:20},
        unitRelations:[{leftUnit:'Box',rightUnit:'Pipe',quantity:12},
          {leftUnit:'Pipe',rightUnit:'Feet',quantity:20}],
        unitPurchasePrices:{Box:3100,Pipe:260,Feet:17},
        unitSellPrices:{Pipe:325,Feet:24},
        purchasePrice:17,sellPrice:24,stock:100,active:true,
        minStock:0,category:'Copper',
      },
      bigQty:'1',smallQty:'3',unitQuantities:{Box:'1',Pipe:'2',Feet:'3'},
      cost:'260',costUnit:'Pipe',lotSellPrice:'36.125',lotSellUnit:'Feet',
      detailsOpen:true,serialText:'SER-1',batchNumber:'LOT-1',
      manufactureDate:'2026-11-01',expiryDate:'2027-11-01',
    }],
    payments:[{id:'p1',method:'Cash',account:'Drawer A',amount:'23.45'},
      {id:'p2',method:'Bank',account:'Bank 01',amount:'100'}],
  } as PurchaseDraftInput;
}
function stored(changes: Partial<ServerPurchaseDraft> = {}, input: PurchaseDraftInput = editor()): ServerPurchaseDraft {
  const s=session() as Extract<SessionSnapshot,{status:'authenticated'}>;
  const payload=encodePurchaseEditorDraft(s,{
    tenantId:tenant,productIds:new Set([productId]),
    supplierNames:new Map([[supplierId,'Rahman Traders']]),
  },input);
  return {
    ...payload,id:draftId,version:1,businessDate:'2026-11-13',
    savedAt:'2026-11-13T08:00:00.000Z',
    createdAt:'2026-11-13T07:59:00.000Z',
    deletedAt:null,recoverableUntilEpochMs:null,...changes,
  };
}
const protocol=(error:unknown):boolean=>error instanceof ApiError&&error.kind==='protocol';
const response=(value:unknown,status=200):Response=>new Response(JSON.stringify(value),{
  status,headers:{'content-type':'application/json'},
});
async function withFetch(fetcher:typeof fetch, run:()=>Promise<void>):Promise<void>{
  const oldFetch=globalThis.fetch;
  const oldWindow=(globalThis as any).window;
  const oldLocation=(globalThis as any).location;
  (globalThis as any).fetch=fetcher;
  (globalThis as any).window={location:{origin:ORIGIN}};
  (globalThis as any).location={origin:ORIGIN};
  try{await run();}finally{
    globalThis.fetch=oldFetch;
    if(oldWindow===undefined)delete (globalThis as any).window;
    else (globalThis as any).window=oldWindow;
    if(oldLocation===undefined)delete (globalThis as any).location;
    else (globalThis as any).location=oldLocation;
  }
}
function mockedServer(options:{
  draft?:ServerPurchaseDraft;
  supplier?:ServerPurchaseSupplier;
  product?:ServerProduct;
  onRead?:(path:string)=>void;
}={}){
  const calls:string[]=[];
  const fake:typeof fetch=async(request,init)=>{
    const url=new URL(String(request)), path=url.pathname+url.search;
    calls.push(path);
    assert.equal(url.origin,ORIGIN);
    assert.equal(init?.method,'GET');
    assert.equal(init?.credentials,'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer verified-user-jwt');
    assert.equal(init?.body,undefined);
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'),false);
    options.onRead?.(path);
    if(path==='/api/v1/purchases/drafts/'+draftId)
      return response({data:options.draft??stored()});
    if(path==='/api/v1/parties/'+supplierId+'?role=SUPPLIER')
      return response({data:options.supplier??supplier()});
    if(path==='/api/v1/products/'+productId)
      return response({data:options.product??product()});
    throw Error('Unexpected source GET '+path);
  };
  return {fake,calls};
}

test('read-only resume preserves EVERY nested mixed-unit, serial, lot, price and split payment snapshot',async()=>{
  const archived=stored();
  const {fake,calls}=mockedServer({draft:archived});
  let active=session();
  await withFetch(fake,async()=>{
    const out=await reopenConnectedPurchaseDraftReadOnly(()=>active,draftId);
    assert.equal(out.canEdit,false);
    assert.equal(out.canPost,false);
    assert.equal(out.paymentAccountsVerified,false);
    assert.equal(out.serverAdvancedUnitsVerified,false);
    assert.equal(out.draft.id,draftId);
    assert.equal(out.draft.version,1);
    assert.deepEqual(out.draft.editor,(archived.cart as any).editor);
    assert.notEqual(out.draft.editor,(archived.cart as any).editor);
    assert.equal(out.draft.editor.lines[0]?.unitQuantities?.Box,'1');
    assert.equal(out.draft.editor.lines[0]?.serialText,'SER-1');
    assert.equal(out.draft.editor.lines[0]?.lotSellPrice,'36.125');
    assert.equal(out.draft.editor.payments[1]?.amount,'100');
    assert.equal(out.sources.sources.supplierNames.get(supplierId),'Rahman Traders');
    assert.equal(out.sources.products.get(productId)?.purchasePriceMinor,1700);
    assert.ok(out.lineReviews[0]?.codes.includes('ADVANCED_UNITS_UNVERIFIED'));
    assert.ok(out.lineReviews[0]?.codes.includes('INDEPENDENT_PRICES_UNVERIFIED'));
    assert.ok(out.lineReviews[0]?.codes.includes('LOT_FIELDS_UNVERIFIED'));
    assert.equal(connectedPurchaseResumeIsCurrent(out,active),true);
    active=session({epoch:6});
    assert.equal(connectedPurchaseResumeIsCurrent(out,active),false);
  });
  assert.deepEqual(calls,[
    '/api/v1/purchases/drafts/'+draftId,
    '/api/v1/parties/'+supplierId+'?role=SUPPLIER',
    '/api/v1/products/'+productId,
  ]);
});

test('review flags differences without overwriting source snapshots or changing historical cost',async()=>{
  const {fake}=mockedServer({product:product({
    name:'Renamed Cable',baseUnitName:'Pcs',
    purchasePriceMinor:1800,conversion:null,
    tracksSerial:true,tracksExpiry:true,
  })});
  await withFetch(fake,async()=>{
    const opened=await reopenConnectedPurchaseDraftReadOnly(()=>session(),draftId);
    assert.equal(opened.draft.editor.lines[0]?.product?.name,'Copper Cable');
    assert.equal(opened.draft.editor.lines[0]?.product?.purchasePrice,17);
    assert.equal(opened.sources.products.get(productId)?.name,'Renamed Cable');
    const codes=opened.lineReviews[0]!.codes;
    for (const flag of ['PRODUCT_NAME_CHANGED','BASE_UNIT_CHANGED',
      'ALTERNATE_UNIT_CHANGED','PRODUCT_COST_CHANGED',
      'SERIAL_OR_EXPIRY_POLICY_UNVERIFIED']) assert.ok(codes.includes(flag as any),flag);
    assert.equal(opened.canEdit,false);
  });
});

test('basic unit profile may have zero review flags but is still never writable or postable',async()=>{
  const plain=editor();
  plain.lines=[{
    ...plain.lines[0]!,
    product:{...plain.lines[0]!.product,unit:'Feet',
      purchasePrice:17,name:'Copper Cable',altUnit:undefined,
      unitRelations:undefined,unitPurchasePrices:undefined,unitSellPrices:undefined},
    cost:'17',costUnit:'Feet',lotSellUnit:'Feet',lotSellPrice:'',
    unitQuantities:undefined,serialText:'',batchNumber:'',
    manufactureDate:'',expiryDate:'',
  }];
  const server=product({conversion:null});
  const {fake}=mockedServer({draft:stored({},plain),product:server});
  await withFetch(fake,async()=>{
    const opened=await reopenConnectedPurchaseDraftReadOnly(()=>session(),draftId);
    assert.deepEqual(opened.lineReviews[0]?.codes,[]);
    assert.equal(opened.canEdit,false);
    assert.equal(opened.canPost,false);
  });
});

test('invalid session, tenant, permissions, token or draft ID are rejected BEFORE any fetch',async()=>{
  let count=0;
  await withFetch((async()=>{count++;throw Error('No network expected')}) as typeof fetch,async()=>{
    for(const altered of [
      {tenantId:'t1'}, {userId:'preview-user'}, {accessToken:''},
      {permissions:['purchase.bill.create','inventory.cost.view']},
      {permissions:['party.supplier.view','catalog.product.view']},
    ]) await assert.rejects(reopenConnectedPurchaseDraftReadOnly(
      ()=>session(altered),draftId),protocol);
    await assert.rejects(reopenConnectedPurchaseDraftReadOnly(
      ()=>({status:'preview',epoch:0}),draftId),protocol);
    await assert.rejects(reopenConnectedPurchaseDraftReadOnly(
      ()=>session(),'preview-draft'),protocol);
    const aborted=new AbortController();aborted.abort();
    await assert.rejects(reopenConnectedPurchaseDraftReadOnly(
      ()=>session(),draftId,aborted.signal),protocol);
  });
  assert.equal(count,0);
});

test('bad cart sources and inline photos are rejected BEFORE supplier/product requests',async()=>{
  const base=stored();
  const bads=[
    {...base,cart:{...(base.cart as any),schema:'other-v2'}},
    {...base,cart:{...(base.cart as any),tenantId:user}},
    {...base,cart:{...(base.cart as any),editor:{
      ...(base.cart as any).editor,tenantId:user,
    }}},
    {...base,cart:{...(base.cart as any),editor:{
      ...(base.cart as any).editor,supplierId:'preview-supplier',
    }}},
    {...base,cart:{...(base.cart as any),editor:{
      ...(base.cart as any).editor,lines:[{
        ...(base.cart as any).editor.lines[0],product:{id:'demo-product'},
      }],
    }}},
    {...base,cart:{...(base.cart as any),editor:{
      ...(base.cart as any).editor,photos:['data:image/png;base64,AAAA'],
    }}},
    {...base,cart:{...(base.cart as any),editor:{
      ...(base.cart as any).editor,lines:[{
        ...(base.cart as any).editor.lines[0],lotSellPrice:{untrusted:'object'},
      }],
    }}},
  ];
  for(const draft of bads){
    const {fake,calls}=mockedServer({draft:draft as ServerPurchaseDraft});
    await withFetch(fake,async()=>{
      await assert.rejects(reopenConnectedPurchaseDraftReadOnly(()=>session(),draftId),protocol);
    });
    assert.deepEqual(calls,['/api/v1/purchases/drafts/'+draftId]);
  }
});

test('inactive or mismatched source identities and stale supplier name fail closed',async()=>{
  for(const variations of [
    {supplier:supplier({status:'INACTIVE'})},
    {supplier:supplier({roles:['CUSTOMER']})},
    {supplier:supplier({name:'Changed Company'})},
    {product:product({id:user})},
    {product:product({status:'INACTIVE'})},
  ]){
    const {fake}=mockedServer(variations);
    await withFetch(fake,async()=>{
      await assert.rejects(reopenConnectedPurchaseDraftReadOnly(()=>session(),draftId),protocol);
    });
  }
});

test('deleted draft cannot launch a supplier or product probe',async()=>{
  const deletion='2026-11-13T08:30:00.000Z';
  const deleted=stored({deletedAt:deletion,recoverableUntilEpochMs:
    Date.parse(deletion)+30*86_400_000,version:2});
  const {fake,calls}=mockedServer({draft:deleted});
  await withFetch(fake,async()=>{
    await assert.rejects(reopenConnectedPurchaseDraftReadOnly(()=>session(),draftId),protocol);
  });
  assert.deepEqual(calls,['/api/v1/purchases/drafts/'+draftId]);
});

test('changing session after draft GET prevents all supplier/product probes',async()=>{
  let active=session();
  const {fake,calls}=mockedServer({onRead:path=>{
    if(path.startsWith('/api/v1/purchases/drafts/'))active=session({tenantId:user,epoch:6});
  }});
  await withFetch(fake,async()=>{
    await assert.rejects(reopenConnectedPurchaseDraftReadOnly(()=>active,draftId),protocol);
  });
  assert.deepEqual(calls,['/api/v1/purchases/drafts/'+draftId]);
});

test('token rotation after source detail fetch cannot return stale draft',async()=>{
  let active=session();
  const {fake,calls}=mockedServer({onRead:path=>{
    if(path==='/api/v1/products/'+productId)active=session({accessToken:'rotated-jwt'});
  }});
  await withFetch(fake,async()=>{
    await assert.rejects(reopenConnectedPurchaseDraftReadOnly(()=>active,draftId),protocol);
  });
  assert.equal(calls.length,3);
});

test('extractor deduplicates repeated products but rejects duplicate line IDs',()=>{
  const base=stored();
  const c=(base.cart as any);
  const dupeProduct={...c,editor:{...c.editor,lines:[
    c.editor.lines[0],{...c.editor.lines[0],id:'line-2'},
  ]}};
  assert.deepEqual(extractPurchaseDraftSourceSelection(dupeProduct,tenant),
    {supplierId,productIds:[productId]});
  const duplicateLines={...c,editor:{...c.editor,lines:[
    c.editor.lines[0],c.editor.lines[0],
  ]}};
  assert.throws(()=>extractPurchaseDraftSourceSelection(duplicateLines,tenant),protocol);
});
