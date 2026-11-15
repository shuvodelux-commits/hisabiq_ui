import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { PageBoundary } from '../components/layout/PageBoundary';
import { ConnectedWorkspaceGate } from './ConnectedWorkspaceGate.tsx';
import { useSession } from './SessionProvider.tsx';
import { TenantSettingsProvider, useTenantSettings } from '../settings/TenantSettingsProvider';
import { GeneralSettingsSection } from '../settings/magic/GeneralSettingsSection';
import { TeamSettings } from '../settings/magic/TeamSettings';
import { InvoiceStudio } from '../settings/magic/invoice/InvoiceStudio';
import { settingsSections } from '../settings/magic/settingsSections';
import { SettingsDialog } from '../settings/ui';

/** Connected-only Settings; never mount the demo AppShell or cash/finance stores. */
export function ConnectedSettingsWorkspace() {
  const { pathname } = useLocation();
  const { snapshot, mode } = useSession();
  const route = /^\/app\/settings(?:\/(.*))?$/.exec(pathname);
  if (mode !== 'connected' || !route) {
    return <ConnectedWorkspaceGate>{null}</ConnectedWorkspaceGate>;
  }
  if (snapshot.status === 'authenticating') {
    return <main role="status" aria-live="polite" className="p-6 text-sm">
      Verifying your session… · আপনার সেশন যাচাই হচ্ছে…
    </main>;
  }
  if (snapshot.status === 'locked') return <Navigate to="/login/pin" replace />;
  if (snapshot.status !== 'authenticated') return <Navigate to="/login" replace />;
  return <TenantSettingsProvider>
    <PageBoundary><ConnectedSettingsContent section={route[1] ?? ''} /></PageBoundary>
  </TenantSettingsProvider>;
}

function ConnectedSettingsContent({ section }: { section: string }) {
  const { snapshot } = useSession();
  const { connectedAuthorizationPending } = useTenantSettings();
  const navigate = useNavigate();
  const [dirty, setDirty] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const identity = snapshot.status === 'authenticated'
    ? [snapshot.tenantId, snapshot.userId, snapshot.epoch].join(':') : '';
  useEffect(() => { setDirty(false); setPendingUrl(null); }, [identity, section]);

  if (snapshot.status !== 'authenticated') return null;
  const canBusiness = snapshot.permissions.includes('settings.setting.view');
  const canUsers = snapshot.permissions.includes('user.account.view');
  const canRoles = snapshot.permissions.includes('user.role.view');
  const canTeam = canUsers || canRoles;
  const canInvoices = snapshot.permissions.includes('sale.invoice.view');
  const destinations = settingsSections.filter(item =>
    (item.id === 'business' && canBusiness) ||
    (item.id === 'team' && canTeam) || (item.id === 'invoices' && canInvoices));
  if (!section && !connectedAuthorizationPending) {
    if (destinations.length > 0) {
      return <Navigate to={'/app/settings/' + destinations[0].id} replace />;
    }
  }
  const authorized = (section === 'business' && canBusiness) ||
    (section === 'team' && canTeam) ||
    (section === 'invoices' && canInvoices);
  const supported = section === 'business' || section === 'team' || section === 'invoices';
  const business = settingsSections.find(item => item.id === 'business')!;

  const navigateWithDraft = (url: string, event: React.MouseEvent) => {
    if (!dirty) return;
    event.preventDefault();
    setPendingUrl(url);
  };

  return <div className="min-h-screen bg-background" data-connected-settings-workspace>
    <div className="erp-settings mx-auto min-w-0 max-w-[1280px] space-y-5 px-3 py-5 sm:px-4 lg:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-ink">
            Settings <span className="font-bn text-sm font-normal text-ink-500">সেটিংস</span>
          </h1>
          <p className="text-[13px] text-ink-500">
            {connectedAuthorizationPending ? 'Checking your access… · অনুমতি যাচাই হচ্ছে…'
              : snapshot.displayName + ' · ' + snapshot.roleName + ' · ' + snapshot.businessName}
          </p>
        </div>
      </header>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
        <nav aria-label="Connected settings" className="min-w-0 space-y-2">
          <p className="px-2 text-[11px] font-medium text-ink-500">
            Verified business settings · যাচাইকৃত সেটিংস
          </p>
          {destinations.map(item => {
            const Icon = item.icon;
            const target = '/app/settings/' + item.id;
            return <Link key={item.id} to={target}
              aria-current={section === item.id ? 'page' : undefined}
              onClick={event => navigateWithDraft(target, event)}
              className={'flex items-center gap-2 rounded-md px-3 py-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ' +
                (section === item.id ? 'bg-accent font-medium text-ink' : 'bg-card text-ink-600 hover:bg-ink-50')}>
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{item.label}<span className="ml-1.5 font-bn text-[11px] text-ink-500">{item.bn}</span></span>
            </Link>;
          })}
          <p className="px-2 text-[11px] text-ink-500">
            Other ERP modules remain unavailable until integration is verified.
          </p>
        </nav>
        <main id="connected-settings-main" tabIndex={-1} className="min-w-0">
          {connectedAuthorizationPending ? (
            <p role="status" aria-live="polite" className="p-3 text-sm text-ink-600">
              Verifying current permissions… · বর্তমান অনুমতি যাচাই হচ্ছে…
            </p>
          ) : !supported ? (
            <p role="status" className="rounded-md border border-ink-100 p-4 text-sm text-ink-600">
              This section is not yet connected. No preview data or local-only actions are available. · এই অংশটি এখনো সংযুক্ত নয়।
            </p>
          ) : !authorized ? (
            <p role="alert" className="rounded-md border border-ink-100 p-4 text-sm text-ink-600">
              You do not have permission to view this section. · এই অংশ দেখার অনুমতি নেই।
            </p>
          ) : (
            <fieldset disabled className="m-0 min-w-0 border-0 p-0">
              <p role="status" className="mb-3 rounded-md border border-ink-100 bg-ink-50 p-3 text-xs text-ink-600">
                Connected Settings are view-only until live write acceptance is complete.
                <span className="ml-1 font-bn">সার্ভার তথ্য দেখা যাবে; পরিবর্তন আপাতত বন্ধ।</span>
              </p>
              {section === 'business' ? (
                <GeneralSettingsSection key={identity} section={business}
                  canEdit={false} onDirtyChange={setDirty} />
              ) : section === 'team' ? (
                <TeamSettings key={identity} canEdit={false} onDirtyChange={setDirty} />
              ) : (
                <InvoiceStudio key={identity} canEdit={false} onDirtyChange={setDirty} />
              )}
            </fieldset>
          )}
        </main>
      </div>
      <SettingsDialog title="Leave without saving?"
        description="Your unsaved changes have not been confirmed by the server."
        open={pendingUrl !== null} onClose={() => setPendingUrl(null)}>
        <div className="flex justify-end gap-2">
          <button type="button" className="h-9 rounded-md border px-3 text-xs"
            onClick={() => setPendingUrl(null)}>Keep editing</button>
          <button type="button" className="h-9 rounded-md bg-teal-700 px-3 text-xs text-white"
            onClick={() => {
              const target = pendingUrl;
              setPendingUrl(null);
              setDirty(false);
              if (target) navigate(target);
            }}>Discard and continue</button>
        </div>
      </SettingsDialog>
    </div>
  </div>;
}
