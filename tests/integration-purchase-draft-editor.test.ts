import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { readFileSync } from 'node:fs';
import {
  decodePurchaseEditorDraft,
  encodePurchaseEditorDraft,
  listPurchaseEditorDrafts,
  loadPurchaseEditorDraft,
  preparePurchaseEditorDraftCreate,
  recyclePurchaseEditorDraft,
  restorePurchaseEditorDraft,
  savePurchaseEditorDraft,
} from '../src/integration/purchase-draft-editor.ts';
import type { PurchaseDraftInput } from '../src/data/purchaseDraftsPreviewStore.ts';
import type { ConnectedPurchaseSession, PurchaseDraftSources } from '../src/integration/purchase-draft-editor.ts';
import type { ServerPurchaseDraft } from '../src/integration/purchase-drafts.ts';

const origin = 'https://hisabiq-real-drafts.test';
const tenant = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const actor = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const supplier = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const product = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const draftId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';

function session(overrides: Record<string, unknown> = {}): ConnectedPurchaseSession {
  return {
    status: 'authenticated', tenantId: tenant, userId: actor, epoch: 7,
    accessToken: 'real-user-jwt', timezone: 'Asia/Dhaka', username: 'owner',
    displayName: 'Owner', roleName: 'Owner', businessName: 'Dhaka Hardware',
    permissions: ['purchase.bill.create', 'inventory.cost.view'], features: [],
    persistence: 'memory',
    ...overrides,
  } as ConnectedPurchaseSession;
}
function sources(overrides: Partial<PurchaseDraftSources> = {}): PurchaseDraftSources {
  return {
    tenantId: tenant,
    supplierNames: new Map([[supplier, 'Rahman Supply']]),
    productIds: new Set([product]),
    ...overrides,
  };
}
function editor(): PurchaseDraftInput {
  return {
    tenantId: tenant, supplierId: supplier, supplierName: 'Rahman Supply',
    date: '2026-11-13', backdateReason: '', referenceNo: 'PO-001', notes: 'keep all multi-unit details',
    discount: '5', discountMode: 'percent', photos: [], total: 123.45,
    lines: [{
      id: 'line-1', product: {
        id: product, name: 'Wire Gauge', unit: 'Pcs',
        purchasePrice: 20, sellPrice: 35,
        unitRelations: [{unit:'Box',factor:12},{unit:'Pcs',factor:1}],
      },
      bigQty: '2', smallQty: '3', cost: '36.30', costUnit: 'Box',
      unitQuantities: { Box: '2', Pcs: '3' }, lotSellPrice: '',
      lotSellUnit: 'Pcs', detailsOpen: true, serialText: 'SER-1',
      batchNumber: 'B-7', manufactureDate: '2026-10-01', expiryDate: '2027-10-01',
      optionalEditorProperty: undefined,
    }],
    payments: [
      {id:'pay-cash',method:'Cash',account:'Cash drawer',amount:'23.45'},
      {id:'pay-bank',method:'Bank',account:'Bank account',amount:'100'},
    ],
  } as unknown as PurchaseDraftInput;
}

const payload = () => encodePurchaseEditorDraft(session(), sources(), editor());
function stored(
  version = 1,
  modifications: Partial<ServerPurchaseDraft> = {},
): ServerPurchaseDraft {
  return {
    ...payload(),
    id: draftId, version, businessDate: '2026-11-13',
    savedAt: '2026-11-13T06:00:00.000Z',
    createdAt: '2026-11-13T05:55:00.000Z',
    deletedAt: null, recoverableUntilEpochMs: null,
    ...modifications,
  };
}
function isProtocol(e: unknown): boolean {
  return e instanceof ApiError && e.kind === 'protocol';
}
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>) {
  const previousFetch = globalThis.fetch;
  const previousWindow = (globalThis as any).window;
  const previousLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); } finally {
    (globalThis as any).fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    if (previousLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = previousLocation;
  }
}

test('full editor snapshot preserves mixed units, serials, split payments and precise poisha', () => {
  const result = payload();
  assert.equal(result.itemCount, 1);
  assert.equal(result.grandTotalMinor, 12345);
  assert.equal(result.supplierName, 'Rahman Supply');
  const cart = result.cart as any;
  assert.equal(cart.schema, 'hisabiq.purchase-editor.draft.v1');
  assert.equal(cart.tenantId, tenant);
  assert.equal(cart.editor.lines[0].unitQuantities.Box, '2');
  assert.equal(cart.editor.lines[0].unitQuantities.Pcs, '3');
  assert.equal(cart.editor.lines[0].serialText, 'SER-1');
  assert.equal(cart.editor.lines[0].batchNumber, 'B-7');
  assert.equal(cart.editor.lines[0].product.id, product);
  assert.equal(cart.editor.payments[0].amount, '23.45');
  assert.equal(cart.editor.payments[1].amount, '100');
  assert.equal(cart.editor.lines[0].optionalEditorProperty, undefined);
  assert.equal('optionalEditorProperty' in cart.editor.lines[0], false);
  assert.equal(editor().lines.length, 1);
  assert.equal(decodePurchaseEditorDraft(session(), sources(), stored()).editor.lines[0]?.id, 'line-1');
});

test('preview business and unknown or foreign supplier/product references cannot pass to server', () => {
  const wrongTenant = {...editor(), tenantId:'t1'};
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), wrongTenant), isProtocol);
  const wrongProduct = editor();
  (wrongProduct.lines[0]!.product as any).id = 'preview-product-1';
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), wrongProduct), isProtocol);
  const unverifiedProduct = sources({productIds:new Set()});
  assert.throws(() => encodePurchaseEditorDraft(session(), unverifiedProduct, editor()), isProtocol);
  const wrongSupplier = editor(); wrongSupplier.supplierId = 'supplier-5';
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), wrongSupplier), isProtocol);
  const changedSupplier = editor(); changedSupplier.supplierName = 'Wrong Label';
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), changedSupplier), isProtocol);
  assert.throws(() => encodePurchaseEditorDraft(session(), sources({tenantId:actor}), editor()), isProtocol);
  assert.throws(() => encodePurchaseEditorDraft(session({tenantId:actor}), sources(), editor()), isProtocol);
  assert.throws(() => encodePurchaseEditorDraft(session({permissions:['purchase.bill.create']}), sources(), editor()), isProtocol);
});

test('receipt photos and lossy or unbounded snapshots fail before any network write', () => {
  const withPhoto = editor(); withPhoto.photos=['data:image/png;base64,abc'];
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), withPhoto), isProtocol);
  const withAsset = editor(); withAsset.photos=['unverified-asset-id'];
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), withAsset), isProtocol);
  const withBadAmount = editor(); withBadAmount.total=123.456;
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), withBadAmount), isProtocol);
  const withHugeText = editor(); withHugeText.notes='X'.repeat(121_000);
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), withHugeText), isProtocol);
  const withFunc = editor(); (withFunc.lines[0] as any).randomFunction=()=>1;
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), withFunc), isProtocol);
  const withSparse = editor(); withSparse.payments=Array(3) as any;
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), withSparse), isProtocol);
  const circular = editor(); (circular.lines[0] as any).cycle=circular.lines[0];
  assert.throws(() => encodePurchaseEditorDraft(session(), sources(), circular), isProtocol);
});

test('decoding rejects tampered source identity, amount, item count, cart and unknown schema', () => {
  const saved = stored();
  assert.equal(decodePurchaseEditorDraft(session(), sources(), saved).editor.referenceNo,'PO-001');
  assert.throws(() => decodePurchaseEditorDraft(session(), sources(), {
    ...saved, grandTotalMinor: 12000,
  }), isProtocol);
  assert.throws(() => decodePurchaseEditorDraft(session(), sources(), {
    ...saved, itemCount: 3,
  }), isProtocol);
  assert.throws(() => decodePurchaseEditorDraft(session(), sources(), {
    ...saved, cart: {...saved.cart,tenantId:actor},
  }), isProtocol);
  assert.throws(() => decodePurchaseEditorDraft(session(), sources(), {
    ...saved, cart: {...saved.cart,schema:'other-v2'},
  }), isProtocol);
  assert.throws(() => decodePurchaseEditorDraft(session(), sources({productIds:new Set()}), saved), isProtocol);
});

test('create → refresh → resume → versioned edit → recycle → restore uses only draft routes', async () => {
  let current: ServerPurchaseDraft | null = null;
  const attempt = preparePurchaseEditorDraftCreate(session(), sources(), editor());
  assert.match(attempt.operationId, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  assert.equal(Object.isFrozen(attempt), true);
  const calls: string[] = [];
  await withFetch((async (url, init) => {
    const route = new URL(String(url)).pathname;
    const method = init?.method;
    calls.push(method + ' ' + route);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer real-user-jwt');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    if (method === 'POST' && route.endsWith('/drafts')) {
      assert.deepEqual(body, { ...payload(), operationId: attempt.operationId });
      current = stored();
      return json({data:current},201);
    }
    if (method === 'GET' && route.endsWith('/drafts')) return json({data:current?[current]:[]});
    if (method === 'GET' && route.endsWith('/'+draftId)) return json({data:current});
    assert.ok(current);
    if (method === 'PUT') {
      assert.equal(body.expectedVersion,current.version);
      current = {...current,...body,version:current.version+1};
      delete (current as any).expectedVersion;
      return json({data:current});
    }
    if (method === 'DELETE') {
      assert.equal(body.expectedVersion,current.version);
      const deletion = '2026-11-13T08:00:00.000Z';
      current = {...current,version:current.version+1,deletedAt:deletion,
        recoverableUntilEpochMs:Date.parse(deletion)+30*86_400_000};
      return json({data:current});
    }
    if (method === 'POST' && route.endsWith('/restore')) {
      assert.equal(body.expectedVersion,current.version);
      current = {...current,version:current.version+1,
        deletedAt:null,recoverableUntilEpochMs:null};
      return json({data:current});
    }
    throw Error('Unexpected endpoint '+method+' '+route);
  }) as typeof fetch, async () => {
    const first=await savePurchaseEditorDraft(session(),sources(),editor(),
      null, undefined, attempt);
    assert.equal(first.version,1);
    // Refresh: a new caller with no cached draft loads the real server row.
    assert.equal((await listPurchaseEditorDrafts(session(),sources())).length,1);
    const resumed=await loadPurchaseEditorDraft(session(),sources(),first.id);
    assert.equal(resumed.editor.lines[0]?.unitQuantities?.Box,'2');
    const revised=editor(); revised.notes='edited after browser refresh';
    const saved=await savePurchaseEditorDraft(session(),sources(),revised,
      {id:first.id,version:resumed.version});
    assert.equal(saved.version,2);
    assert.equal(saved.editor.notes,'edited after browser refresh');
    const deleted=await recyclePurchaseEditorDraft(session(),sources(),{id:saved.id,version:saved.version});
    assert.equal(deleted.version,3);
    assert.equal(deleted.deletedAt !== null,true);
    const restored=await restorePurchaseEditorDraft(session(),sources(),{id:deleted.id,version:deleted.version});
    assert.equal(restored.deletedAt,null);
    assert.equal(restored.version,4);
  });
  assert.deepEqual(calls, [
    'POST /api/v1/purchases/drafts',
    'GET /api/v1/purchases/drafts',
    'GET /api/v1/purchases/drafts/'+draftId,
    'PUT /api/v1/purchases/drafts/'+draftId,
    'DELETE /api/v1/purchases/drafts/'+draftId,
    'POST /api/v1/purchases/drafts/'+draftId+'/restore',
  ]);
  assert.equal(calls.filter(c=>!c.includes('/drafts')).length,0);
});

test('stale version 409 is not retried; no preview fallback or silent success', async()=>{
  let calls=0;
  await withFetch((async()=>{
    calls++;
    return json({error:{code:'CONFLICT_STALE_VERSION',message:'Reload draft',
      details:{},traceId:'t-123'}},409);
  }) as typeof fetch,async()=>{
    await assert.rejects(savePurchaseEditorDraft(session(),sources(),editor(),
      {id:draftId,version:1}),(e:unknown)=>e instanceof ApiError&&e.kind==='http'&&e.status===409);
  });
  assert.equal(calls,1);
});


test('first-create requires opaque prepared intent: no implicit new operation ID or HTTP writes', async () => {
  let calls = 0;
  await withFetch((async () => { calls += 1; return json({ data: stored() }, 201); }) as typeof fetch, async () => {
    await assert.rejects(savePurchaseEditorDraft(session(), sources(), editor()),
      isProtocol);
    const forged = { operationId: '01ARZ3NDEKTSV4RRFFQ69G5FB0' };
    await assert.rejects(savePurchaseEditorDraft(session(), sources(), editor(),
      null, undefined, forged), isProtocol);
    const prepared = preparePurchaseEditorDraftCreate(session(), sources(), editor());
    await assert.rejects(savePurchaseEditorDraft(session(), sources(), editor(),
      { id: draftId, version: 1 }, undefined, prepared), isProtocol);
  });
  assert.equal(calls, 0);
});

test('lost create response reuses same operation ID and exact original editor snapshot', async () => {
  const original = editor();
  const prepared = preparePurchaseEditorDraftCreate(session(), sources(), original);
  let calls = 0;
  const createBodies: unknown[] = [];
  await withFetch((async (_url, init) => {
    calls += 1;
    const requestBody = JSON.parse(String(init?.body));
    createBodies.push(requestBody);
    assert.equal(init?.method, 'POST');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    if (calls === 1) throw new TypeError('Connection lost after commit');
    return json({ data: stored() }, 201);
  }) as typeof fetch, async () => {
    await assert.rejects(savePurchaseEditorDraft(session(), sources(), original,
      null, undefined, prepared), (e: unknown) => e instanceof ApiError && e.kind === 'network');
    assert.equal(calls, 1, 'network ambiguity does not automatically send again');
    const recovered = await savePurchaseEditorDraft(session(), sources(), original,
      null, undefined, prepared);
    assert.equal(recovered.id, draftId);
    assert.equal(recovered.editor.lines[0]?.unitQuantities?.Box, '2');
    assert.equal(recovered.editor.payments[1]?.amount, '100');
  });
  assert.deepEqual(createBodies[0], createBodies[1]);
  assert.deepEqual(createBodies[0], { ...payload(), operationId: prepared.operationId });
  assert.equal(calls, 2);
});

test('rejects changed editor, session, token rotation and new-account source before POST', async () => {
  const prepared = preparePurchaseEditorDraftCreate(session(), sources(), editor());
  const mutated = editor(); mutated.notes = 'changed after uncertain POST';
  let calls = 0;
  await withFetch((async () => { calls += 1; return json({ data: stored() }, 201); }) as typeof fetch, async () => {
    for (const attempted of [
      () => savePurchaseEditorDraft(session(), sources(), mutated, null, undefined, prepared),
      () => savePurchaseEditorDraft(session({ epoch: 8 }), sources(), editor(), null, undefined, prepared),
      () => savePurchaseEditorDraft(session({ accessToken: 'rotated' }), sources(), editor(),
        null, undefined, prepared),
      () => savePurchaseEditorDraft(session({ userId: product }), sources(), editor(),
        null, undefined, prepared),
      () => savePurchaseEditorDraft(session({ tenantId: supplier }), sources(), editor(),
        null, undefined, prepared),
      () => savePurchaseEditorDraft(session(), sources({ productIds: new Set() }), editor(),
        null, undefined, prepared),
    ]) await assert.rejects(attempted(), isProtocol);
  });
  assert.equal(calls, 0);
});

test('new independently prepared intent has a different ID; no preview, session storage or editor import', () => {
  const first = preparePurchaseEditorDraftCreate(session(), sources(), editor());
  const next = preparePurchaseEditorDraftCreate(session(), sources(), editor());
  assert.notEqual(first.operationId, next.operationId);
  assert.deepEqual(Object.keys(first), ['operationId'], 'private JWT/editor never exposed');
  const source = requireSource();
  assert.doesNotMatch(source, /sessionStorage|localStorage|createPreviewPurchase|erpDemoStore/);
});
function requireSource(): string {
  return readFileSync(new URL('../src/integration/purchase-draft-editor.ts', import.meta.url), 'utf8');
}
