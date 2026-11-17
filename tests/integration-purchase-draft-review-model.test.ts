import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../src/integration/errors.ts';
import { projectConnectedPurchaseDraftReview } from '../src/integration/purchase-draft-review-model.ts';
import type { ConnectedPurchaseResumeReadOnly } from '../src/integration/purchase-editor-resume.ts';

const tenant = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const supplier = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const product = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const draft = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const identity = '["tenant","user",7,"bearer-rotation"]';

function verified(): ConnectedPurchaseResumeReadOnly {
  const snapshot = {
    tenantId: tenant, supplierId: supplier, supplierName: 'Rahman Traders',
    date: '2026-11-13', backdateReason: 'Supplier delivery late',
    referenceNo: 'BILL-7', notes: 'Keep 1.2500 Feet entry',
    discount: '2.5', discountMode: 'percent', photos: [], total: 123.45,
    lines: [{
      id: 'line-1',
      product: {
        id: product, name: 'Copper Cable', unit: 'Feet', purchasePrice: 17,
        unitRelations: [
          {leftUnit:'Box', rightUnit:'Pipe', quantity:12},
          {leftUnit:'Pipe',rightUnit:'Feet',quantity:20},
        ],
        unitPurchasePrices: {Box: 3000.125, Pipe: 260.25, Feet: 17},
        unitSellPrices: {Box: 3600, Pipe: 330.125, Feet: 24},
      },
      bigQty:'2',smallQty:'1.2500',cost:'260.25',costUnit:'Pipe',
      unitQuantities:{Box:'1',Pipe:'2',Feet:'1.2500'},
      lotSellPrice:'36.125',lotSellUnit:'Feet',
      detailsOpen:true,serialText:'SER-1\nSER-2',
      batchNumber:'LOT-99',manufactureDate:'2026-10-01',expiryDate:'2027-10-01',
    }],
    payments: [
      {id:'pay1',method:'Cash',account:'Drawer A',amount:'23.45'},
      {id:'pay2',method:'Bank',account:'BRAC Bank',amount:'100'},
    ],
  };
  return {
    identity,
    draft: {id:draft,version:4,deletedAt:null,
      savedAt:'2026-11-13T08:00:00.000Z',
      recoverableUntilEpochMs:null, editor:snapshot,
    },
    sources: {
      identity,
      sources:{
        tenantId:tenant,productIds:new Set([product]),
        supplierNames:new Map([[supplier,'Rahman Traders']]),
      },
      supplier:null,
      products:new Map([[product,{id:product,name:'Current Cable'}]]),
    },
    lineReviews: [{
      lineId:'line-1',productId:product,
      codes:['ADVANCED_UNITS_UNVERIFIED','INDEPENDENT_PRICES_UNVERIFIED',
        'LOT_FIELDS_UNVERIFIED'],
    }],
    paymentAccountsVerified:false,serverAdvancedUnitsVerified:false,
    canEdit:false,canPost:false,
  } as unknown as ConnectedPurchaseResumeReadOnly;
}
const protocol = (e:unknown) => e instanceof ApiError && e.kind === 'protocol';

test('view projection preserves all historical quantities, 4-decimal prices and split payment strings', () => {
  const original = verified();
  const before = JSON.stringify(original.draft.editor);
  const display = projectConnectedPurchaseDraftReview(original,draft,4);
  assert.equal(display.totalMinor,12345);
  assert.equal(display.referenceNo,'BILL-7');
  assert.equal(display.supplierName,'Rahman Traders');
  assert.equal(display.backdateReason,'Supplier delivery late');
  assert.equal(display.notes,'Keep 1.2500 Feet entry');
  assert.equal(display.lines[0]?.unitQuantities[2]?.value,'1.2500');
  assert.equal(display.lines[0]?.purchasePrices[0]?.value,'3000.125');
  assert.equal(display.lines[0]?.sellingPrices[1]?.value,'330.125');
  assert.equal(display.lines[0]?.lotSellPrice,'36.125');
  assert.equal(display.lines[0]?.serialText,'SER-1\nSER-2');
  assert.equal(display.lines[0]?.batchNumber,'LOT-99');
  assert.equal(display.lines[0]?.manufactureDate,'2026-10-01');
  assert.equal(display.lines[0]?.expiryDate,'2027-10-01');
  assert.deepEqual(display.payments.map(p=>p.amount),['23.45','100']);
  assert.equal(display.paymentAccountsVerified,false);
  assert.equal(display.canEdit,false);
  assert.equal(display.canPost,false);
  assert.equal(JSON.stringify(original.draft.editor),before);
  assert.notEqual(display.lines[0]?.unitQuantities, original.draft.editor.lines[0]?.unitQuantities);
});

test('rejects wrong draft ID/version and deleted documents, never silently showing stale rows',()=>{
  const good=verified();
  assert.throws(()=>projectConnectedPurchaseDraftReview(good,product,4),protocol);
  assert.throws(()=>projectConnectedPurchaseDraftReview(good,draft,3),protocol);
  assert.throws(()=>projectConnectedPurchaseDraftReview(good,draft,0),protocol);
  assert.throws(()=>projectConnectedPurchaseDraftReview(good,'preview-draft',4),protocol);
  const deleted=verified(); (deleted.draft as any).deletedAt='2026-11-13T08:30:00.000Z';
  assert.throws(()=>projectConnectedPurchaseDraftReview(deleted,draft,4),protocol);
});

test('rejects attempted writable or postable status and unverified payment/advanced-unit policy',()=>{
  for(const [field,value] of [
    ['canEdit',true],['canPost',true],['paymentAccountsVerified',true],
    ['serverAdvancedUnitsVerified',true],
  ] as const){
    const unsafe=verified();
    (unsafe as any)[field]=value;
    assert.throws(()=>projectConnectedPurchaseDraftReview(unsafe,draft,4),protocol);
  }
});

test('rejects wrong source fingerprint, tenant, missing product and mismatched line review',()=>{
  const cases=[
    (v:ConnectedPurchaseResumeReadOnly)=>{(v.sources as any).identity='rotated';},
    (v:ConnectedPurchaseResumeReadOnly)=>{(v.sources.sources as any).tenantId=supplier;},
    (v:ConnectedPurchaseResumeReadOnly)=>{(v.sources.sources as any).productIds=new Set();},
    (v:ConnectedPurchaseResumeReadOnly)=>{(v.sources as any).products=new Map();},
    (v:ConnectedPurchaseResumeReadOnly)=>{(v.lineReviews as any)[0].productId=supplier;},
    (v:ConnectedPurchaseResumeReadOnly)=>{(v.lineReviews as any).push((v.lineReviews as any)[0]);},
  ];
  for(const mutate of cases){
    const v=verified();mutate(v);
    assert.throws(()=>projectConnectedPurchaseDraftReview(v,draft,4),protocol);
  }
});

test('rejects unsupported totals, invalid historical unit prices and unstaged photos',()=>{
  for(const total of [123.456,-1,Infinity]){
    const v=verified();(v.draft.editor as any).total=total;
    assert.throws(()=>projectConnectedPurchaseDraftReview(v,draft,4),protocol);
  }
  const invalidPrice=verified();
  (invalidPrice.draft.editor.lines[0]?.product.unitPurchasePrices as any).Box=-100;
  assert.throws(()=>projectConnectedPurchaseDraftReview(invalidPrice,draft,4),protocol);
  const photo=verified();(photo.draft.editor as any).photos=['data:image/png;base64,unsafe'];
  assert.throws(()=>projectConnectedPurchaseDraftReview(photo,draft,4),protocol);
});

test('connected Review remains behind existing gate and never mounts fixture PurchaseEditor',()=>{
  const path=new URL('../src/components/purchases/ConnectedPurchaseDraftsPanel.tsx',import.meta.url);
  const source=readFileSync(path,'utf8');
  const gate=readFileSync(new URL('../src/integration/ConnectedWorkspaceGate.tsx',import.meta.url),'utf8');
  const page=readFileSync(new URL('../src/pages/Purchases.tsx',import.meta.url),'utf8');
  assert.match(source,/reopenConnectedPurchaseDraftReadOnly/);
  assert.match(source,/connectedPurchaseResumeIsCurrent/);
  assert.match(source,/setReview\(\{ key: identity, readKey, id: row.id, version: row.version \}\)/);
  assert.match(source,/snapshot.permissions.includes\('party.supplier.view'\)/);
  assert.match(source,/snapshot.permissions.includes\('catalog.product.view'\)/);
  assert.doesNotMatch(source,/from ['"].*erpDemoStore/);
  assert.doesNotMatch(source,/createPreviewPurchase|<PurchaseEditor\s/);
  assert.match(gate,/workspace=pending/);
  const connected=page.indexOf('function ConnectedPurchasesRead()');
  const preview=page.indexOf('function PreviewPurchases(');
  assert.ok(connected >= 0 && preview > connected);
  assert.match(page.slice(connected,preview),/<ConnectedPurchaseDraftsPanel\s*\/>/);
  assert.doesNotMatch(page.slice(preview),/<ConnectedPurchaseDraftsPanel\s*\/>/);
});
