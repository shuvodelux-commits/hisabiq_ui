import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CashSessionDialog } from "./CashSessionDialog";
import { CashSessionProvider } from "../../contexts/CashSessionContext";
import {
  TenantSettingsProvider,
  useTenantSettings,
} from "../../settings/TenantSettingsProvider";
import { UserPreferencesProvider } from "../../contexts/UserPreferencesContext";

function Workspace() {
  const { personal, warning } = useTenantSettings();
  return (
    <UserPreferencesProvider>
      <CashSessionProvider>
        <div
          data-density={personal.density}
          className="erp-workspace flex min-h-screen w-full bg-background"
        >
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="flex-1 px-4 py-5 lg:px-6">
              {warning && (
                <p
                  role="alert"
                  className="mb-4 rounded-lg bg-warning-bg p-3 text-sm text-warning"
                >
                  {warning}
                </p>
              )}
              <Outlet />
            </main>
          </div>
        </div>
        <CashSessionDialog />
      </CashSessionProvider>
    </UserPreferencesProvider>
  );
}

export function AppShell() {
  return (
    <TenantSettingsProvider>
      <Workspace />
    </TenantSettingsProvider>
  );
}
