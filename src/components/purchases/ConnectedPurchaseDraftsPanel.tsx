import { useEffect, useRef, useState } from 'react';
import { FileClock, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
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

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<PurchaseDraftFilter>('active');
  const [reload, setReload] = useState(0);
  const [list, setList] = useState<PurchaseDraftPanelReadState | null>(null);
  const [target, setTarget] = useState<Selected | null>(null);
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

  // Identity changes close the old panel, revoke the rendered rows and abort
  // in-flight mutations. An unrelated tenant must not inherit a modal.
  const previousIdentityRef = useRef(identity);
  useEffect(() => {
    if (previousIdentityRef.current !== identity) {
      previousIdentityRef.current = identity;
      setOpen(false);
      setList(null);
      setTarget(null);
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
        onClick={() => { setOpen(true); setFilter('active'); setTarget(null); setActionError(null); }}>
        <FileClock className="size-4" aria-hidden="true" />
        {text('Drafts', 'খসড়া')}
      </Button>
      <Dialog open={open && token !== null} onOpenChange={next => {
        if (!next && busy) return;
        setOpen(next);
        if (!next) { setTarget(null); setActionError(null); }
      }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{text('Purchase drafts', 'ক্রয়ের খসড়া')}</DialogTitle>
            <DialogDescription>
              {text('Server-saved drafts only. Saving, deleting and restoring drafts does not post stock, cash or supplier dues.',
                'শুধু সার্ভারে রাখা খসড়া। খসড়া সংরক্ষণ, মুছে ফেলা বা ফিরিয়ে আনায় মজুত, নগদ বা সরবরাহকারীর বাকি বদলায় না।')}
            </DialogDescription>
          </DialogHeader>
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
                setTarget(null); setActionError(null); setReload(value => value + 1);
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
            {text('Resume/edit requires verified server products and suppliers; the connected editor is not enabled yet.',
              'পুনরায় সম্পাদনার জন্য সার্ভারের পণ্য ও সরবরাহকারী যাচাই দরকার; সংযুক্ত এডিটর এখনও চালু নয়।')}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
