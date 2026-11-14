import { useId, useState } from 'react';
import { useUiCopy } from '../../i18n/useUiCopy';
import { useSession } from '../../integration/SessionProvider.tsx';
import { canReadSalesInvoices } from '../../integration/sales-read-permissions.ts';
import { ConnectedSalesInvoicesPanel } from './ConnectedSalesInvoicesPanel';
import { ConnectedSalesReturnHistoryPanel } from './ConnectedSalesReturnHistoryPanel';
import { ConnectedSalesReturnSourceReview } from './ConnectedSalesReturnSourceReview';

type ReviewTab = 'invoices' | 'source' | 'history';
type VerifiedSource = { identity: string; saleId: string };

/**
 * MOD-009 R09-SALES-BRIDGE-10 — UNMOUNTED connected Sales GET-only workspace.
 *
 * This is not src/pages/Sales.tsx. Do not mount it into App.tsx,
 * ConnectedWorkspaceGate or live routes until independently approved real
 * tenant/permissions/PG16/browser acceptance.
 *
 * The source ID can only arrive from the existing verified POSTED server
 * invoice detail, not from a user-input ID or preview ERP store. Permission
 * checks for invoice view, source returnability and return history remain
 * independent. This component has no financial or inventory write transport.
 */
export function ConnectedSalesReadWorkspace() {
  const { text } = useUiCopy();
  const { mode, snapshot } = useSession();
  const prefix = useId();
  const [tab, setTab] = useState<ReviewTab>('invoices');
  const [source, setSource] = useState<VerifiedSource | null>(null);

  const authenticated = mode === 'connected' && snapshot.status === 'authenticated';
  const canViewInvoices = canReadSalesInvoices(mode, snapshot);
  // GET returnability currently requires create permission, NOT return.view.
  const canReviewSource = canViewInvoices && snapshot.permissions.includes('sales.return.create');
  const canViewHistory = authenticated && snapshot.permissions.includes('sales.return.view');
  const identity = authenticated
    ? JSON.stringify([
        snapshot.tenantId, snapshot.userId, snapshot.epoch,
        snapshot.accessToken, snapshot.permissions,
      ])
    : JSON.stringify([mode, snapshot.status, snapshot.epoch]);

  // React render-time masking precedes any effect cleanup or session switch.
  const saleId = canReviewSource && source?.identity === identity ? source.saleId : null;

  const reviewPostedSource = (verifiedSaleId: string) => {
    if (!canReviewSource || !/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(verifiedSaleId)) return;
    // Child invokes this only after source-ID-matched server detail is loaded.
    setSource({ identity, saleId: verifiedSaleId });
    setTab('source');
  };
  const chooseTab = (next: ReviewTab) => {
    if (next === 'source' && !canReviewSource) return;
    if (next === 'history' && !canViewHistory) return;
    if (next === 'invoices') setSource(null);
    setTab(next);
  };

  const tabs: { id: ReviewTab; title: string; disabled: boolean }[] = [
    { id: 'invoices', title: text('Invoices', 'চালান'), disabled: !canViewInvoices },
    { id: 'source', title: text('Return source', 'ফেরতের মূল তথ্য'), disabled: !canReviewSource },
    { id: 'history', title: text('Return history', 'ফেরতের ইতিহাস'), disabled: !canViewHistory },
  ];

  return (
    <section data-connected-sales-read-workspace="" className="space-y-3">
      <div className="border-b border-border bg-card">
        <div role="tablist" aria-label={text('Connected Sales read-only sections', 'সংযুক্ত বিক্রির শুধু-পাঠ বিভাগ')}
          className="flex flex-wrap items-center gap-1 px-3">
          {tabs.map(item => (
            <button key={item.id} id={prefix + '-' + item.id} type="button"
              role="tab" aria-selected={tab === item.id}
              aria-controls={prefix + '-panel'}
              disabled={item.disabled}
              className={'min-h-9 px-3 py-2 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
                (tab === item.id
                  ? 'border-b-2 border-primary text-ink'
                  : 'text-ink-500 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50')}
              onClick={() => chooseTab(item.id)}>
              {item.title}
            </button>
          ))}
        </div>
      </div>
      <div id={prefix + '-panel'} role="tabpanel" aria-labelledby={prefix + '-' + tab}>
        {tab === 'invoices' ? (
          <ConnectedSalesInvoicesPanel onReviewReturnable={reviewPostedSource} />
        ) : tab === 'source' ? (
          <ConnectedSalesReturnSourceReview saleId={saleId} />
        ) : (
          <ConnectedSalesReturnHistoryPanel />
        )}
      </div>
      <p className="px-1 text-xs text-ink-500">
        {text(
          'Verified read-only records. Return source, history, refunds, customer credit and stock posting are distinct operations; no financial action is available here.',
          'শুধু সার্ভারের যাচাইকৃত তথ্য দেখা যাবে। মূল ফেরত, ইতিহাস, টাকা ফেরত, ক্রেতার জমা ও স্টক পোস্ট পৃথক কাজ; এখানে আর্থিক লেনদেন করা যাবে না।',
        )}
      </p>
    </section>
  );
}
