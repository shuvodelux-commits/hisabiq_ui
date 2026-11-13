import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Eye, FileClock, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { useUiCopy } from '../../i18n/useUiCopy';
import { useSession } from '../../integration/SessionProvider.tsx';
import { ApiError } from '../../integration/errors.ts';
import {
  readPurchaseDrafts,
  recyclePurchaseDraft,
  restorePurchaseDraft,
} from '../../integration/purchase-drafts.ts';
import {
  purchaseDraftPanelIdentity,
  purchaseDraftPanelReadKey,
  verifyPurchaseDraftListState,
  verifyPurchaseDraftTransition,
  visiblePurchaseDraftPanelState,
  type PurchaseDraftFilter,
  type PurchaseDraftPanelReadState,
} from '../../integration/purchase-draft-panel-model.ts';
import { purchaseMoney } from '../../integration/purchases-read-model.ts';
import type { SessionSnapshot } from '../../integration/session.ts';
import {
  connectedPurchaseResumeIsCurrent,
  reopenConnectedPurchaseDraftReadOnly,
} from '../../integration/purchase-editor-resume.ts';
import { purchaseSourceIdentity } from '../../integration/purchase-editor-sources.ts';
import {
  projectConnectedPurchaseDraftReview,
  type PurchaseDraftReviewView,
} from '../../integration/purchase-draft-review-model.ts';
import type { PurchaseResumeReviewCode } from '../../integration/purchase-editor-resume.ts';

type Selected = {
  key: string;
  id: string;
  version: number;
  label: string;
  action: 'recycle' | 'restore';
};

/**
 * The connected-only purchase draft management surface.
 * Does NOT mount PurchaseEditor, preview stores, draft cart or AppShell by itself.
 * ConnectedWorkspaceGate still independently controls workspace activation.
 */
export function ConnectedPurchaseDraftsPanel() {
  const { mode, snapshot } = useSession();
  const { text } = useUiCopy();
  const connection = purchaseDraftPanelIdentity(mode, snapshot);
  const identity = connection?.key ?? ['blocked', mode, snapshot.status, snapshot.epoch].join(':');
  const token = connection?.accessToken ?? null;
  const identityRef = useRef(identity);
  identityRef.current = identity;
  const currentSessionRef = useRef(snapshot);
  currentSessionRef.current = snapshot;
  const getCurrentSession = useCallback(() => currentSessionRef.current, []);
  const canReview = token !== null && mode === 'connected' &&
    snapshot.status === 'authenticated' &&
    snapshot.permissions.includes('party.supplier.view') &&
    snapshot.permissions.includes('catalog.product.view');

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<PurchaseDraftFilter>('active');
  const [reload, setReload] = useState(0);
  const [list, setList] = useState<PurchaseDraftPanelReadState | null>(null);
  const [target, setTarget] = useState<Selected | null>(null);
  const [review, setReview] = useState<{
    key: string; readKey: string; id: string; version: number;
  } | null>(null);
  const [working, setWorking] = useState<{ key: string; id: string } | null>(null);
  const [actionError, setActionError] = useState<{ key: string; message: string } | null>(null);
  const mutationRef = useRef<AbortController | null>(null);

  const readKey = purchaseDraftPanelReadKey(identity, filter, reload);
  const visible = visiblePurchaseDraftPanelState(list, readKey);
  const rows = open && token && visible.status === 'ready' ? visible.data : null;
  const busy = working !== null && working.key === identity;
  const confirmation = target?.key === identity && target.action ===
    (filter === 'active' ? 'recycle' : 'restore') ? target : null;
  const error = actionError?.key === identity ? actionError.message : null;
  const activeReview = canReview && review?.key === identity &&
    review.readKey === readKey && filter === 'active' &&
    rows?.some(row => row.id === review.id && row.version === review.version)
      ? review : null;

  // Identity changes close the old panel, revoke the rendered rows and abort
  // in-flight mutations. An unrelated tenant must not inherit a modal.
  const previousIdentityRef = useRef(identity);
  useEffect(() => {
    if (previousIdentityRef.current !== identity) {
      previousIdentityRef.current = identity;
      setOpen(false);
      setList(null);
      setTarget(null);
      setReview(null);
      setActionError(null);
      setFilter('active');
    }
    return () => {
      mutationRef.current?.abort();
    };
  }, [identity]);

  useEffect(() => {
    if (!open || token === null) return;
    const controller = new AbortController();
    setList({ key: readKey, status: 'loading', data: null });
    void readPurchaseDrafts(token, filter, controller.signal).then(({ data }) => {
      const verified = verifyPurchaseDraftListState(data, filter);
      if (!controller.signal.aborted && identityRef.current === identity) {
        setList({ key: readKey, status: 'ready', data: verified });
      }
    }).catch(reason => {
      if (!controller.signal.aborted && identityRef.current === identity) {
        const denied = reason instanceof ApiError &&
          (reason.status === 401 || reason.status === 403);
        setList({ key: readKey, status: denied ? 'denied' : 'error', data: null });
      }
    });
    return () => controller.abort();
  }, [open, token, identity, filter, reload, readKey]);

  function switchFilter(next: PurchaseDraftFilter) {
    if (next === filter || busy) return;
    setTarget(null);
    setReview(null);
    setActionError(null);
    setFilter(next);
  }

  async function performAction() {
    if (!token || !confirmation || busy || !rows || error) return;
    const row = rows.find(item =>
      item.id === confirmation.id && item.version === confirmation.version);
    if (!row) return;
    if (confirmation.action === 'restore' &&
        (row.recoverableUntilEpochMs === null ||
          row.recoverableUntilEpochMs <= Date.now())) return;

    const controller = new AbortController();
    mutationRef.current = controller;
    setWorking({ key: identity, id: row.id });
    setActionError(null);
    try {
      const result = confirmation.action === 'recycle'
        ? await recyclePurchaseDraft(token, row.id, { expectedVersion: row.version }, controller.signal)
        : await restorePurchaseDraft(token, row.id, { expectedVersion: row.version }, controller.signal);
      verifyPurchaseDraftTransition(row, result.data, confirmation.action);
      if (controller.signal.aborted || identityRef.current !== identity) return;
      setTarget(null);
      setList(null);
      setReload(value => value + 1);
      toast.success(confirmation.action === 'recycle'
        ? text('Moved to Recycle Bin', 'রিসাইকেল বিনে সরানো হয়েছে')
        : text('Purchase draft restored', 'ক্রয়ের খসড়া ফিরিয়ে আনা হয়েছে'));
    } catch (reason) {
      if (controller.signal.aborted || identityRef.current !== identity) return;
      const denied = reason instanceof ApiError &&
        (reason.status === 401 || reason.status === 403);
      setActionError({ key: identity, message: denied
        ? text('Permission denied. Your draft was not confirmed as changed.', 'অনুমতি নেই। পরিবর্তন নিশ্চিত হয়নি।')
        : text('Could not confirm the change. Refresh the list before taking another action.',
          'পরিবর্তন নিশ্চিত হয়নি। আবার চেষ্টা করার আগে তালিকা রিফ্রেশ করুন।') });
      // No automatic retry or automatic cache reconciliation after an ambiguous write.
      setTarget(null);
    } finally {
      if (mutationRef.current === controller) mutationRef.current = null;
      setWorking(current =>
        current?.key === identity && current.id === row.id ? null : current);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm"
        data-connected-purchase-drafts-trigger=""
        disabled={token === null}
        title={token === null
          ? text('Purchase create and cost permissions are required.', 'ক্রয় তৈরি ও খরচ দেখার অনুমতি প্রয়োজন।')
          : undefined}
        onClick={() => {
          setOpen(true); setFilter('active'); setTarget(null);
          setReview(null); setActionError(null);
        }}>
        <FileClock className="size-4" aria-hidden="true" />
        {text('Drafts', 'খসড়া')}
      </Button>
      <Dialog open={open && token !== null} onOpenChange={next => {
        if (!next && busy) return;
        setOpen(next);
        if (!next) { setTarget(null); setReview(null); setActionError(null); }
      }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{text('Purchase drafts', 'ক্রয়ের খসড়া')}</DialogTitle>
            <DialogDescription>
              {text('Server-saved drafts only. Saving, deleting and restoring drafts does not post stock, cash or supplier dues.',
                'শুধু সার্ভারে রাখা খসড়া। খসড়া সংরক্ষণ, মুছে ফেলা বা ফিরিয়ে আনায় মজুত, নগদ বা সরবরাহকারীর বাকি বদলায় না।')}
            </DialogDescription>
          </DialogHeader>
          {activeReview ? (
            <ConnectedDraftReadOnlyDetails
              key={activeReview.key + ':' + activeReview.id + ':' + activeReview.version}
              draftId={activeReview.id}
              expectedVersion={activeReview.version}
              getCurrentSession={getCurrentSession}
              onBack={() => { setReview(null); setReload(value => value + 1); }}
            />
          ) : <>
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
            <Button type="button" size="sm" variant={filter === 'active' ? 'default' : 'outline'}
              disabled={busy} onClick={() => switchFilter('active')}>
              {text('Active', 'সক্রিয়')}
            </Button>
            <Button type="button" size="sm" variant={filter === 'deleted' ? 'default' : 'outline'}
              disabled={busy} onClick={() => switchFilter('deleted')}>
              {text('Recycle Bin', 'রিসাইকেল বিন')}
            </Button>
            <Button type="button" size="sm" variant="outline" className="ml-auto"
              disabled={busy} onClick={() => {
                setTarget(null); setReview(null); setActionError(null); setReload(value => value + 1);
              }}>
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {text('Refresh', 'রিফ্রেশ')}
            </Button>
          </div>
          {error && <p role="alert" className="text-[12px] text-danger">{error}</p>}
          <div data-connected-purchase-drafts-list="" aria-live="polite" className="max-h-[55vh] min-h-20 overflow-y-auto">
            {visible.status === 'loading' && <p role="status" className="p-4 text-sm text-ink-500">
              {text('Loading saved drafts…', 'সংরক্ষিত খসড়া লোড হচ্ছে…')}
            </p>}
            {visible.status === 'denied' && <p role="alert" className="p-4 text-sm text-danger">
              {text('Your account cannot access purchase drafts.', 'এই অ্যাকাউন্টে ক্রয়ের খসড়া দেখার অনুমতি নেই।')}
            </p>}
            {visible.status === 'error' && <p role="alert" className="p-4 text-sm text-danger">
              {text('Drafts could not be verified from the server. No preview records were loaded.',
                'সার্ভার থেকে খসড়া যাচাই করা যায়নি। কোনো নমুনা তথ্য দেখানো হয়নি।')}
            </p>}
            {rows?.length === 0 && <p className="p-4 text-center text-sm text-ink-500">
              {text('No saved purchase drafts in this section.', 'এই অংশে কোনো সংরক্ষিত ক্রয়ের খসড়া নেই।')}
            </p>}
            {rows && rows.length > 0 && <ul className="divide-y divide-border">
              {rows.map(row => {
                const expired = row.recoverableUntilEpochMs !== null &&
                  row.recoverableUntilEpochMs <= Date.now();
                const selected = confirmation?.id === row.id &&
                  confirmation.version === row.version;
                return <li key={row.id} className="space-y-1 px-1 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-ink">{row.label}</p>
                      <p className="truncate text-[12px] text-ink-500">{row.supplierName ??
                        text('Supplier not selected', 'সরবরাহকারী নির্বাচন করা হয়নি')}</p>
                      <p className="text-[11px] text-ink-500">
                        {row.itemCount} {text('items', 'পণ্য')} · {row.businessDate} ·
                        {text(' Version', ' সংস্করণ')} {row.version}
                      </p>
                      {filter === 'deleted' && row.recoverableUntilEpochMs !== null &&
                        <p className="text-[11px] text-ink-500">
                          {expired ? text('Recovery expired', 'ফেরানোর সময় শেষ')
                            : text('Recover by', 'ফেরানোর শেষ সময়') + ' ' +
                              new Date(row.recoverableUntilEpochMs).toLocaleDateString('en-GB')}
                        </p>}
                    </div>
                    <div className="shrink-0 space-y-1 text-right">
                      <p className="text-[13px] font-medium text-ink">{purchaseMoney(row.grandTotalMinor)}</p>
                      {filter === 'active' && <Button type="button" variant="outline" size="sm"
                        disabled={busy || Boolean(error) || !canReview}
                        title={!canReview
                          ? text('Supplier and product view permissions required.', 'সরবরাহকারী ও পণ্য দেখার অনুমতি দরকার।')
                          : undefined}
                        onClick={() => {
                          setTarget(null);
                          setReview({ key: identity, readKey, id: row.id, version: row.version });
                        }}>
                        <Eye className="size-3.5" aria-hidden="true" />
                        {text('Review', 'দেখুন')}
                      </Button>}
                      <Button type="button" variant="outline" size="sm"
                        disabled={busy || Boolean(error) || (filter === 'deleted' && expired)}
                        onClick={() => {
                          setTarget({ key: identity, id: row.id, version: row.version, label: row.label,
                            action: filter === 'active' ? 'recycle' : 'restore' });
                        }}>
                        {filter === 'active'
                          ? <Trash2 className="size-3.5" aria-hidden="true" />
                          : <RotateCcw className="size-3.5" aria-hidden="true" />}
                        {filter === 'active'
                          ? text('Delete', 'মুছুন') : text('Restore', 'ফেরান')}
                      </Button>
                    </div>
                  </div>
                  {selected && <div role="group"
                    aria-label={text('Confirm draft action', 'খসড়ার কাজ নিশ্চিত করুন')}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background px-2 py-2">
                    <span className="min-w-0 flex-1 text-[12px] text-ink">
                      {filter === 'active'
                        ? text('Move this draft to Recycle Bin for 30-day recovery?',
                          'এই খসড়া ৩০ দিনের জন্য রিসাইকেল বিনে সরাবেন?')
                        : text('Restore this purchase draft?', 'এই ক্রয়ের খসড়া ফিরিয়ে আনবেন?')}
                    </span>
                    <Button type="button" size="sm" variant="outline" disabled={busy}
                      onClick={() => setTarget(null)}>{text('Cancel', 'বাতিল')}</Button>
                    <Button type="button" size="sm" disabled={busy}
                      onClick={() => void performAction()}>
                      {busy ? text('Working…', 'কাজ হচ্ছে…')
                        : filter === 'active' ? text('Confirm delete', 'মুছে দিন')
                          : text('Confirm restore', 'ফিরিয়ে আনুন')}
                    </Button>
                  </div>}
                </li>;
              })}
            </ul>}
          </div>
          <p className="border-t border-border pt-2 text-[11px] text-ink-500">
            {text('Review is read-only. Editing and posting require verified full unit, payment, and attachment contracts.',
              'শুধু দেখার সুবিধা। সম্পাদনা ও পোস্টিংয়ের আগে ইউনিট, পেমেন্ট ও সংযুক্তি যাচাই দরকার।')}
          </p>
          </>}
        </DialogContent>
      </Dialog>
    </>
  );
}


type ReadOnlyDetailState =
  | { status: 'loading' | 'denied' | 'error'; data: null }
  | { status: 'ready'; data: PurchaseDraftReviewView };

function reviewCodeLabel(
  code: PurchaseResumeReviewCode,
  translate: (english: string, bangla: string) => string,
): string {
  switch (code) {
    case 'PRODUCT_NAME_CHANGED': return translate('Product name changed', 'পণ্যের নাম বদলেছে');
    case 'BASE_UNIT_CHANGED': return translate('Base unit changed', 'মূল ইউনিট বদলেছে');
    case 'ALTERNATE_UNIT_CHANGED': return translate('Alternate unit changed', 'বিকল্প ইউনিট বদলেছে');
    case 'PRODUCT_COST_CHANGED': return translate('Current product cost changed', 'বর্তমান পণ্যের ক্রয়মূল্য বদলেছে');
    case 'ADVANCED_UNITS_UNVERIFIED': return translate('Multi-unit conversion needs verification', 'একাধিক ইউনিটের রূপান্তর যাচাই বাকি');
    case 'INDEPENDENT_PRICES_UNVERIFIED': return translate('Unit-specific prices need verification', 'ইউনিটভিত্তিক দাম যাচাই বাকি');
    case 'SERIAL_OR_EXPIRY_POLICY_UNVERIFIED': return translate('Serial/expiry rules need verification', 'সিরিয়াল/মেয়াদ নিয়ম যাচাই বাকি');
    case 'LOT_FIELDS_UNVERIFIED': return translate('Lot details need verification', 'লটের তথ্য যাচাই বাকি');
  }
}

/** Stays inside the already-connected Drafts dialog. All operations are GET. */
function ConnectedDraftReadOnlyDetails({
  draftId, expectedVersion, getCurrentSession, onBack,
}: {
  draftId: string;
  expectedVersion: number;
  getCurrentSession: () => SessionSnapshot;
  onBack: () => void;
}) {
  const { text } = useUiCopy();
  const [state, setState] = useState<ReadOnlyDetailState>({ status: 'loading', data: null });
  const [verifiedIdentity, setVerifiedIdentity] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void reopenConnectedPurchaseDraftReadOnly(getCurrentSession, draftId, controller.signal)
      .then(verified => {
        if (controller.signal.aborted ||
            !connectedPurchaseResumeIsCurrent(verified, getCurrentSession())) return;
        const projected = projectConnectedPurchaseDraftReview(verified, draftId, expectedVersion);
        if (controller.signal.aborted) return;
        setVerifiedIdentity(verified.identity);
        setState({ status: 'ready', data: projected });
      })
      .catch(reason => {
        if (controller.signal.aborted) return;
        const denied = reason instanceof ApiError &&
          (reason.status === 401 || reason.status === 403);
        setState({ status: denied ? 'denied' : 'error', data: null });
      });
    return () => controller.abort();
  }, [draftId, expectedVersion, getCurrentSession]);

  // Also revoke already-resolved content immediately during render if this
  // component's live session changes between a React commit and effect cleanup.
  let stillCurrent = false;
  try {
    stillCurrent = verifiedIdentity !== null &&
      purchaseSourceIdentity(getCurrentSession()) === verifiedIdentity;
  } catch { /* No authenticated source access. */ }
  const view = stillCurrent && state.status === 'ready' ? state.data : null;

  return <div data-connected-draft-readonly="" className="space-y-3">
    <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
      <Button type="button" size="sm" variant="outline" onClick={onBack}>
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        {text('Back to drafts', 'খসড়ার তালিকায় ফিরুন')}
      </Button>
      <span className="text-[11px] font-medium text-ink-500">
        {text('Read-only • No posting', 'শুধু দেখুন • পোস্টিং নয়')}
      </span>
    </div>
    {state.status === 'loading' && <p role="status" className="p-3 text-sm text-ink-500">
      {text('Verifying this draft and its suppliers/products…', 'খসড়া, সরবরাহকারী ও পণ্য যাচাই হচ্ছে…')}
    </p>}
    {state.status === 'denied' && <p role="alert" className="p-3 text-sm text-danger">
      {text('Access to this draft or its supplier/products was denied.',
        'এই খসড়া বা সরবরাহকারী/পণ্য দেখার অনুমতি নেই।')}
    </p>}
    {state.status === 'error' && <p role="alert" className="p-3 text-sm text-danger">
      {text('This draft could not be safely verified. No preview data was loaded.',
        'খসড়াটি নিরাপদে যাচাই হয়নি। কোনো নমুনা তথ্য দেখানো হয়নি।')}
    </p>}
    {view && <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] sm:grid-cols-3">
        <div><span className="text-ink-500">{text('Supplier', 'সরবরাহকারী')}</span>
          <p className="font-medium text-ink">{view.supplierName || '—'}</p></div>
        <div><span className="text-ink-500">{text('Date', 'তারিখ')}</span>
          <p className="font-medium text-ink">{view.businessDate}</p></div>
        <div><span className="text-ink-500">{text('Reference', 'রেফারেন্স')}</span>
          <p className="break-words font-medium text-ink">{view.referenceNo || '—'}</p></div>
      </div>
      {view.lines.map((line, index) => <section key={line.id}
        className="space-y-1.5 rounded-md border border-border p-2.5 text-[12px]">
        <p className="font-medium text-ink">{index + 1}. {line.historicalName}</p>
        <p className="text-ink-500">
          {text('Entered quantities', 'দেওয়া পরিমাণ')}: {line.unitQuantities.length
            ? line.unitQuantities.map(entry => entry.value + ' ' + entry.unit).join(' · ')
            : line.bigQty + ' ' + line.costUnit + ' + ' + line.smallQty + ' ' + line.baseUnit}
        </p>
        <p className="text-ink-700">{text('Entered cost', 'দেওয়া ক্রয়মূল্য')}:
          {' ৳' + line.cost + ' / ' + line.costUnit}</p>
        {line.purchasePrices.length > 0 && <p className="text-ink-500">
          {text('Unit purchase prices', 'ইউনিটের ক্রয়মূল্য')}: {line.purchasePrices.map(p =>
            p.unit + ': ৳' + p.value).join(' · ')}
        </p>}
        {line.sellingPrices.length > 0 && <p className="text-ink-500">
          {text('Unit selling prices', 'ইউনিটের বিক্রয়মূল্য')}: {line.sellingPrices.map(p =>
            p.unit + ': ৳' + p.value).join(' · ')}
        </p>}
        {line.lotSellPrice && <p className="text-ink-500">
          {text('Lot selling price', 'লটের বিক্রয়মূল্য')}: {'৳' + line.lotSellPrice + ' / ' + line.lotSellUnit}
        </p>}
        {(line.serialText || line.batchNumber) && <p className="break-words text-ink-500">
          {text('Serial', 'সিরিয়াল')}: {line.serialText || '—'} ·
          {text(' Batch', ' ব্যাচ')}: {line.batchNumber || '—'}
        </p>}
        {(line.manufactureDate || line.expiryDate) && <p className="text-ink-500">
          {text('Manufactured', 'তৈরি')}: {line.manufactureDate || '—'} ·
          {text(' Expires', 'মেয়াদ')}: {line.expiryDate || '—'}
        </p>}
        {line.codes.length > 0 && <ul className="space-y-0.5 border-t border-border pt-1.5">
          {line.codes.map(code => <li key={code} className="text-[11px] text-ink-500">
            <span aria-hidden="true">• </span>{reviewCodeLabel(code, text)}
          </li>)}
        </ul>}
      </section>)}
      {view.payments.length > 0 && <section className="space-y-1 border-t border-border pt-2">
        <h4 className="text-[12px] font-medium text-ink">
          {text('Entered payment splits (not verified as posted)', 'দেওয়া পেমেন্টের ভাগ (পোস্টিং যাচাই নয়)')}
        </h4>
        {view.payments.map(payment => <div key={payment.id}
          className="flex flex-wrap justify-between gap-2 text-[12px] text-ink-700">
          <span>{payment.method} · {payment.account || '—'}</span>
          <span>{'৳' + payment.amount}</span>
        </div>)}
      </section>}
      {(view.discount || view.backdateReason || view.notes) && <section
        className="space-y-1 border-t border-border pt-2 text-[12px] text-ink-500">
        {view.discount && <p>{text('Discount', 'ছাড়')}: {view.discount}
          {view.discountMode === 'percent' ? '%' : ' ৳'}</p>}
        {view.backdateReason && <p>{text('Backdate reason', 'পূর্বের তারিখের কারণ')}: {view.backdateReason}</p>}
        {view.notes && <p className="whitespace-pre-wrap break-words">{text('Notes', 'নোট')}: {view.notes}</p>}
      </section>}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
        <span className="text-[12px] font-medium text-ink">{text('Stored draft total', 'খসড়ার মোট')}</span>
        <span className="text-sm font-semibold text-ink">{purchaseMoney(view.totalMinor)}</span>
      </div>
      <p className="text-[11px] text-ink-500">
        {text('Historical values shown. Current unit rules, payment accounts and stock are not verified for posting.',
          'আগের তথ্য দেখানো হয়েছে। বর্তমান ইউনিটের নিয়ম, পেমেন্ট হিসাব ও মজুত পোস্টিংয়ের জন্য যাচাই হয়নি।')}
      </p>
    </div>}
  </div>;
}
