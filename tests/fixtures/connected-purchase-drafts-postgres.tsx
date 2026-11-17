import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../../src/integration/SessionProvider.tsx';
import {
  listPurchaseEditorDrafts,
  loadPurchaseEditorDraft,
  preparePurchaseEditorDraftCreate,
  recyclePurchaseEditorDraft,
  restorePurchaseEditorDraft,
  savePurchaseEditorDraft,
} from '../../src/integration/purchase-draft-editor.ts';
import type {
  PreparedPurchaseDraftCreate,
  PurchaseDraftSources,
  ResolvedPurchaseEditorDraft,
} from '../../src/integration/purchase-draft-editor.ts';
import {
  purchaseSourceIdentity,
  readPurchaseEditorSourceChoices,
  resolvePurchaseEditorSources,
  type ResolvedPurchaseEditorSources,
} from '../../src/integration/purchase-editor-sources.ts';
import type { PurchaseCartLine } from '../../src/utils/purchaseCart.ts';
import type { PurchaseDraftInput } from '../../src/data/purchaseDraftsPreviewStore.ts';
import '../../src/index.css';

/**
 * QA ONLY: real React + connected bridge against a separately started disposable
 * Nest/PostgreSQL API. No production route imports this fixture. The two test
 * users are injected by the Playwright runner's auth-only mocked login and /me;
 * ALL Purchase Draft operations traverse the actual Nest guard, RLS and DB.
 *
 * This first P5C slice deliberately uses an UNFINISHED draft with NO selected
 * supplier/products. It tests durable nonposting snapshots, not the unresolved
 * authoritative multilevel unit / stock / supplier identity contracts.
 */
/** Test-flag only: this is never routed from Purchases.tsx. */
const populatedMode = new URLSearchParams(window.location.search).get('source') === 'p5d';

function populatedEditor(tenantId: string, selected: ResolvedPurchaseEditorSources): PurchaseDraftInput {
  const supplier = selected.supplier;
  const product = [...selected.products.values()][0];
  if (!supplier || !product || product.purchasePriceMinor === undefined || !product.conversion) {
    throw Error('Real selected supplier, product, cost and first conversion required');
  }
  // These are opaque user-entered draft values; NOT a server-accepted purchase
  // price, unit-chain conversion, cost posting or inventory calculation.
  const preview = {
    id: product.id, name: product.displayName, unit: product.baseUnitName,
    purchasePrice: product.purchasePriceMinor / 100,
    unitPurchasePrices: {
      [product.baseUnitName]: 1.875,
      [product.conversion.unitName]: 37.125,
    },
  } as unknown as PurchaseCartLine['product'];
  return {
    tenantId, supplierId: supplier.id, supplierName: supplier.name,
    date: '2026-11-13', backdateReason: '', referenceNo: 'P5D-REAL-SOURCES',
    notes: 'Nonposting verified source snapshot',
    lines: [{
      id: 'p5d-line-1', product: preview, bigQty: '1', smallQty: '3',
      unitQuantities: { [product.conversion.unitName]: '1', [product.baseUnitName]: '3' },
      cost: '37.125', costUnit: product.conversion.unitName,
      lotSellPrice: '2.9999', lotSellUnit: product.baseUnitName,
      detailsOpen: true, serialText: 'QA-SERIAL-01\\nQA-SERIAL-02',
      batchNumber: 'P5D-LOT-01', manufactureDate: '2026-09-01',
      expiryDate: '2027-09-01',
    }],
    payments: [
      { id: 'p5d-cash', method: 'Cash', account: 'Preview only cash', amount: '23.45' },
      { id: 'p5d-bank', method: 'Bank', account: 'Preview only bank', amount: '100' },
    ],
    discount: '10.5', discountMode: 'percent', photos: [], total: 123.45,
  };
}

function incompleteEditor(tenantId: string): PurchaseDraftInput {
  return {
    tenantId, supplierId: '', supplierName: '',
    date: '2026-11-13', backdateReason: '',
    referenceNo: 'P5C-EMPTY-SOURCE-DRAFT', notes: 'Opaque draft; no financial posting',
    lines: [],
    payments: [
      { id: 'cash-preview', method: 'Cash', account: 'Preview drawer', amount: '23.45' },
      { id: 'bank-preview', method: 'Bank', account: 'Preview bank', amount: '100' },
    ],
    discount: '5', discountMode: 'amount', photos: [], total: 123.45,
  };
}

function DraftBrowserFixture() {
  const { snapshot, store } = useSession();
  const intent = useRef<PreparedPurchaseDraftCreate | null>(null);
  const originalEditor = useRef<PurchaseDraftInput | null>(null);
  const current = useRef<ResolvedPurchaseEditorDraft | null>(null);
  const selectedSources = useRef<ResolvedPurchaseEditorSources | null>(null);
  const [sourceSupplierId, setSourceSupplierId] = useState('');
  const [sourceProductId, setSourceProductId] = useState('');
  const [sourceFactorQty, setSourceFactorQty] = useState(0);
  const [lineJson, setLineJson] = useState('');
  const [paymentJson, setPaymentJson] = useState('');
  const [result, setResult] = useState('idle');
  const [error, setError] = useState('');
  const [draftId, setDraftId] = useState('');
  const [draftVersion, setDraftVersion] = useState(0);
  const [listCount, setListCount] = useState(-1);
  const [readNotes, setReadNotes] = useState('');
  const [operationId, setOperationId] = useState('');

  const action = async (name: string, work: () => Promise<void> | void) => {
    setError('');
    try {
      await work();
      setResult(name + ':ok');
    } catch (reason) {
      const err = reason as { kind?: string; message?: string };
      setError(name + ':' + (err.kind || err.message || String(reason)));
      setResult(name + ':error');
    }
  };
  const signed = () => {
    if (snapshot.status !== 'authenticated') throw Error('Authenticated test tenant required');
    return snapshot;
  };
  const emptySourceSet = (): PurchaseDraftSources => ({
    tenantId: signed().tenantId,
    productIds: new Set(),
    supplierNames: new Map(),
  });
  const sourceSet = (): PurchaseDraftSources => {
    if (!populatedMode) return emptySourceSet();
    if (!selectedSources.current ||
        purchaseSourceIdentity(store.getSnapshot()) !== selectedSources.current.identity) {
      throw Error('Verified connected source selection is stale');
    }
    return selectedSources.current.sources;
  };
  const selectSources = () => action('select-sources', async () => {
    if (!populatedMode) throw Error('Source-backed mode is disabled');
    const session = signed();
    const identity = purchaseSourceIdentity(session);
    const choices = await readPurchaseEditorSourceChoices(session, { search: 'P5D', limit: 25 });
    if (choices.identity !== identity ||
        purchaseSourceIdentity(store.getSnapshot()) !== identity) {
      throw Error('Authentication changed during source list');
    }
    const supplier = choices.suppliers.data.find(row => row.roles.includes('SUPPLIER'));
    const product = choices.products.data.find(row => row.conversion !== null);
    if (!supplier || !product) throw Error('P5D seeded sources missing from live Nest');
    const resolved = await resolvePurchaseEditorSources(session, {
      supplierId: supplier.id, productIds: [product.id],
    });
    if (resolved.identity !== identity ||
        purchaseSourceIdentity(store.getSnapshot()) !== identity) {
      throw Error('Authentication changed during selected source details');
    }
    selectedSources.current = resolved;
    setSourceSupplierId(supplier.id);
    setSourceProductId(product.id);
    setSourceFactorQty(product.conversion?.factorQty ?? 0);
  });
  const probeInvalidSource = (kind: 'wrong-role' | 'inactive-product' |
    'foreign-product' | 'foreign-supplier') => action('probe-' + kind, async () => {
    if (!populatedMode) throw Error('P5D only');
    const verified = selectedSources.current;
    const product = verified && [...verified.products.keys()][0];
    if (!verified?.supplier || !product) throw Error('Verify sources before a negative probe');
    const query = new URLSearchParams(window.location.search);
    const option = kind === 'wrong-role' ? 'wrongRole' :
      kind === 'inactive-product' ? 'inactiveProduct' :
        kind === 'foreign-product' ? 'foreignProduct' : 'foreignSupplier';
    const id = query.get(option);
    if (!id || !/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(id)) {
      throw Error('Missing seeded negative-source identity');
    }
    const supplierId = kind === 'wrong-role' || kind === 'foreign-supplier'
      ? id : verified.supplier.id;
    const productIds = kind === 'inactive-product' || kind === 'foreign-product'
      ? [id] : [product];
    await resolvePurchaseEditorSources(signed(), { supplierId, productIds });
    throw Error('Unexpectedly accepted an unverified source');
  });
  const probeMissingSource = () => action('probe-missing-source', async () => {
    if (!populatedMode) throw Error('P5D only');
    const supplier = selectedSources.current?.supplier;
    if (!supplier) throw Error('Select verified sources first');
    // An actual Nest 404, not a mocked response or a preview fallback.
    await resolvePurchaseEditorSources(signed(), {
      supplierId: supplier.id, productIds: ['01ARZ3NDEKTSV4RRFFQ69G5FAX'],
    });
    throw Error('Missing product unexpectedly resolved');
  });
  const show = (draft: ResolvedPurchaseEditorDraft) => {
    current.current = draft;
    setDraftId(draft.id);
    setDraftVersion(draft.version);
    setReadNotes(draft.editor.notes);
    setLineJson(JSON.stringify(draft.editor.lines));
    setPaymentJson(JSON.stringify(draft.editor.payments));
  };
  const authenticate = (who: 'a' | 'b') => action('login-' + who, async () => {
    await store.loginWithPassword('p5c-' + who, 'test-only-password');
    // A tenant transition must never leave the previous business draft on screen.
    current.current = null;
    selectedSources.current = null;
    setSourceSupplierId('');
    setSourceProductId('');
    setSourceFactorQty(0);
    setLineJson('');
    setPaymentJson('');
    setDraftId('');
    setDraftVersion(0);
    setReadNotes('');
    setListCount(-1);
  });
  const prepare = () => action('prepare', () => {
    const session = signed();
    originalEditor.current = populatedMode
      ? populatedEditor(session.tenantId, selectedSources.current ?? (() => { throw Error('Choose sources first'); })())
      : incompleteEditor(session.tenantId);
    intent.current = preparePurchaseEditorDraftCreate(session, sourceSet(), originalEditor.current);
    current.current = null;
    setDraftId('');
    setDraftVersion(0);
    setOperationId(intent.current.operationId);
  });
  const save = () => action('create', async () => {
    if (!intent.current || !originalEditor.current) throw Error('Prepare draft first');
    const draft = await savePurchaseEditorDraft(
      signed(), sourceSet(), originalEditor.current, null, undefined, intent.current);
    show(draft);
  });
  const load = () => action('load', async () => {
    if (!draftId) throw Error('No source draft ID');
    show(await loadPurchaseEditorDraft(signed(), sourceSet(), draftId));
  });
  const list = (state: 'active' | 'deleted') => action('list-' + state, async () => {
    const drafts = await listPurchaseEditorDrafts(signed(), sourceSet(), state);
    setListCount(drafts.length);
    if (state === 'active' && drafts.length === 1 && !current.current) show(drafts[0]);
  });
  const update = (stale = false) => action(stale ? 'stale' : 'update', async () => {
    if (!current.current) throw Error('No current source draft');
    const edited = { ...current.current.editor, notes: 'Versioned edit after replay' };
    const existing = {
      id: current.current.id,
      version: stale ? 1 : current.current.version,
    };
    const saved = await savePurchaseEditorDraft(signed(), sourceSet(), edited, existing);
    show(saved);
  });
  const recycle = () => action('recycle', async () => {
    if (!current.current) throw Error('No current source draft');
    show(await recyclePurchaseEditorDraft(signed(), sourceSet(), current.current));
  });
  const restore = () => action('restore', async () => {
    if (!current.current) throw Error('No current source draft');
    show(await restorePurchaseEditorDraft(signed(), sourceSet(), current.current));
  });

  return (
    <main className="mx-auto max-w-xl space-y-3 p-3">
      <h1>Test-only PostgreSQL Purchase Draft bridge</h1>
      <p data-test-session="">
        {snapshot.status === 'authenticated'
          ? 'Verified:' + snapshot.businessName
          : 'Session:' + snapshot.status}
      </p>
      <section aria-label="Isolated authentication" className="flex flex-wrap gap-2">
        <button data-test-login-a="" onClick={() => void authenticate('a')}>Sign in A</button>
        <button data-test-login-b="" onClick={() => void authenticate('b')}>Sign in B</button>
      </section>
      {populatedMode && <section aria-label="Real authenticated source verification">
        <button data-test-select-sources="" onClick={() => void selectSources()}>Verify supplier and product</button>
        <button data-test-probe-missing-source="" onClick={() => void probeMissingSource()}>Probe missing source</button>
        <button data-test-probe-wrong-role="" onClick={() => void probeInvalidSource('wrong-role')}>Probe wrong-role supplier</button>
        <button data-test-probe-inactive-product="" onClick={() => void probeInvalidSource('inactive-product')}>Probe inactive product</button>
        <button data-test-probe-foreign-product="" onClick={() => void probeInvalidSource('foreign-product')}>Probe foreign product</button>
        <button data-test-probe-foreign-supplier="" onClick={() => void probeInvalidSource('foreign-supplier')}>Probe foreign supplier</button>
      </section>}
      <section aria-label="Nonposting draft actions" className="flex flex-wrap gap-2">
        <button data-test-prepare="" onClick={() => void prepare()}>Prepare</button>
        <button data-test-create="" onClick={() => void save()}>Create or replay</button>
        <button data-test-load="" onClick={() => void load()}>Load</button>
        <button data-test-update="" onClick={() => void update()}>Update</button>
        <button data-test-stale="" onClick={() => void update(true)}>Stale version</button>
        <button data-test-recycle="" onClick={() => void recycle()}>Recycle</button>
        <button data-test-restore="" onClick={() => void restore()}>Restore</button>
        <button data-test-list-active="" onClick={() => void list('active')}>List active</button>
        <button data-test-list-deleted="" onClick={() => void list('deleted')}>List deleted</button>
      </section>
      <output data-test-result="" aria-live="polite">{result}</output>
      {error && <p data-test-error="" role="alert">{error}</p>}
      <output hidden data-test-source-supplier="">{sourceSupplierId}</output>
      <output hidden data-test-source-product="">{sourceProductId}</output>
      <output hidden data-test-source-factor="">{sourceFactorQty}</output>
      <output hidden data-test-line-json="">{lineJson}</output>
      <output hidden data-test-payment-json="">{paymentJson}</output>
      <p data-test-operation-id="">{operationId}</p>
      <p data-test-draft-id="">{draftId}</p>
      <p data-test-version="">{draftVersion}</p>
      <p data-test-list-count="">{listCount}</p>
      <p data-test-notes="">{readNotes}</p>
      <p data-test-boundary="">No Purchase confirmation, inventory or money API is mounted.</p>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw Error('Isolated P5C fixture root is missing');
createRoot(root).render(
  <SessionProvider mode="connected">
    <DraftBrowserFixture />
  </SessionProvider>,
);
