import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Settings2, ArrowLeft } from "lucide-react";
import { Button } from "../components/Button";
import { SettingsPageContent } from "./TenantSettingsPage";
import type { SettingsSection } from "./model";
import { useUiCopy } from "../i18n/useUiCopy";
const modules: Record<
  string,
  {
    label: string;
    section: SettingsSection;
  }
> = {
  dashboard: { label: "Dashboard", section: "personal" },
  pos: { label: "POS", section: "sales" },
  sales: { label: "Sales", section: "sales" },
  products: { label: "Products", section: "products" },
  purchases: { label: "Purchases", section: "purchases" },
  parties: { label: "Parties", section: "financialTerminology" },
  vendors: { label: "Vendors", section: "financialTerminology" },
  finance: { label: "Finance", section: "money" },
  accounts: { label: "Accounts", section: "financialTerminology" },
  daybook: { label: "Daybook", section: "financialTerminology" },
  expenses: { label: "Expenses", section: "money" },
  reports: { label: "Reports", section: "invoices" },
  warranty: { label: "Warranty", section: "products" },
  quotations: { label: "Quotations", section: "invoices" },
  "online-sales": { label: "Online sales", section: "sales" },
};

/**
 * Each module provides one shared action that the page header can render
 * alongside Export / Import / Add actions, without creating a second row.
 */
const ModuleSettingsToolbarContext = createContext<ReactNode>(null);

export function useModuleSettingsAction(): ReactNode {
  return useContext(ModuleSettingsToolbarContext);
}

export function ModuleSettingsEntry({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { text } = useUiCopy();
  const [moduleOpen, setOpen] = useState(false);
  const backButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (moduleOpen) backButtonRef.current?.focus();
  }, [moduleOpen]);

  const mod = modules[location.pathname.split("/")[2]];
  if (!mod) return <>{children}</>;

  const closeModuleSettings = () => {
    const blocked = document.querySelector("[data-settings-dirty=true]");
    if (
      blocked &&
      !window.confirm(
        text(
          "Discard unsaved module settings?",
          "সেটিংসের পরিবর্তন বাদ দেবেন?",
        ),
      )
    ) return;
    setOpen(false);
  };

  const settingsAction = (
    <Button
      variant="outline"
      size="sm"
      aria-label={text(`${mod.label} settings`, `${mod.label} সেটিংস`)}
      aria-expanded={moduleOpen}
      aria-controls="module-settings-content"
      onClick={() => setOpen(true)}
    >
      <Settings2 className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">{text("Settings", "সেটিংস")}</span>
    </Button>
  );

  return (
    <ModuleSettingsToolbarContext.Provider value={settingsAction}>
      <div hidden={moduleOpen}>{children}</div>
      {moduleOpen && (
        <section id="module-settings-content" aria-label={`${mod.label} settings`}>
          <div className="mb-3 flex items-center">
            <Button ref={backButtonRef} variant="outline" size="sm" onClick={closeModuleSettings}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              {text("Back to", "ফিরুন")} {mod.label}
            </Button>
          </div>
          <SettingsPageContent
            key={location.pathname}
            sectionOverride={mod.section}
            embedded
          />
        </section>
      )}
    </ModuleSettingsToolbarContext.Provider>
  );
}
