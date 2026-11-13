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
  const show = (draft: ResolvedPurchaseEditorDraft) => {
    current.current = draft;
    setDraftId(draft.id);
    setDraftVersion(draft.version);
    setReadNotes(draft.editor.notes);
  };
  const authenticate = (who: 'a' | 'b') => action('login-' + who, async () => {
    await store.loginWithPassword('p5c-' + who, 'test-only-password');
    // A tenant transition must never leave the previous business draft on screen.
    current.current = null;
    setDraftId('');
    setDraftVersion(0);
    setReadNotes('');
    setListCount(-1);
  });
  const prepare = () => action('prepare', () => {
    const session = signed();
    originalEditor.current = incompleteEditor(session.tenantId);
    intent.current = preparePurchaseEditorDraftCreate(session, emptySourceSet(), originalEditor.current);
    current.current = null;
    setDraftId('');
    setDraftVersion(0);
    setOperationId(intent.current.operationId);
  });
  const save = () => action('create', async () => {
    if (!intent.current || !originalEditor.current) throw Error('Prepare draft first');
    const draft = await savePurchaseEditorDraft(
      signed(), emptySourceSet(), originalEditor.current, null, undefined, intent.current);
    show(draft);
  });
  const load = () => action('load', async () => {
    if (!draftId) throw Error('No source draft ID');
    show(await loadPurchaseEditorDraft(signed(), emptySourceSet(), draftId));
  });
  const list = (state: 'active' | 'deleted') => action('list-' + state, async () => {
    const drafts = await listPurchaseEditorDrafts(signed(), emptySourceSet(), state);
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
    const saved = await savePurchaseEditorDraft(signed(), emptySourceSet(), edited, existing);
    show(saved);
  });
  const recycle = () => action('recycle', async () => {
    if (!current.current) throw Error('No current source draft');
    show(await recyclePurchaseEditorDraft(signed(), emptySourceSet(), current.current));
  });
  const restore = () => action('restore', async () => {
    if (!current.current) throw Error('No current source draft');
    show(await restorePurchaseEditorDraft(signed(), emptySourceSet(), current.current));
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
