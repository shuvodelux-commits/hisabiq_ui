import type { ReactNode } from "react";
import {
  BookOpen,
  Building2,
  ShoppingCart,
  Package,
  Truck,
  Wallet,
  Printer,
  Users,
  Bell,
  SlidersHorizontal,
  UserRound,
  ShieldCheck,
  Database,
} from "lucide-react";
import type { SettingsSection } from "./model";
import type { SettingsTab } from "./SettingsTabs";

const icons: Record<SettingsSection, typeof BookOpen> = {
  financialTerminology: BookOpen,
  business: Building2,
  sales: ShoppingCart,
  products: Package,
  purchases: Truck,
  money: Wallet,
  invoices: Printer,
  team: Users,
  notifications: Bell,
  interface: SlidersHorizontal,
  personal: UserRound,
  security: ShieldCheck,
  data: Database,
};

/** In-page Settings directory modelled on Party Ledger's selected-row directory.
 * The normal ERP sidebar and header remain mounted; this is not a second app shell.
 */
export function SettingsDirectory({
  items,
  selected,
  onSelect,
  id,
  panelId,
  language,
  search,
  mobile = false,
}: {
  items: readonly SettingsTab[];
  selected: string;
  onSelect: (next: string) => void;
  id: string;
  panelId: string;
  language: string;
  search?: ReactNode;
  mobile?: boolean;
}) {
  const shown = items;
  const text = (english: string, bangla: string) =>
    language === "Bangla" ? bangla : english;
  return (
    <aside
      data-settings-directory
      aria-label={text("Settings directory", "সেটিংস তালিকা")}
      className={
        (mobile ? "block" : "hidden lg:block") +
        " min-w-0 self-start rounded-xl border border-border bg-card shadow-card"
      }
    >
      {search && <div className="border-b border-border p-3">{search}</div>}
      <nav
        role="tablist"
        aria-orientation="vertical"
        aria-label={text("Settings categories", "সেটিংস বিভাগ")}
        className="py-2"
      >
        {shown.map((item, index) => {
          const Icon = icons[item.id as SettingsSection];
          const active = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${id}-${item.id}`}
              data-settings-section={item.id}
              aria-controls={panelId}
              aria-selected={active}
              tabIndex={
                active || (!shown.some((x) => x.id === selected) && index === 0)
                  ? 0
                  : -1
              }
              onClick={() => onSelect(item.id)}
              onKeyDown={(event) => {
                if (
                  !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
                )
                  return;
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? shown.length - 1
                      : (index +
                          (event.key === "ArrowUp" ? -1 : 1) +
                          shown.length) %
                        shown.length;
                document.getElementById(`${id}-${shown[next]?.id}`)?.focus();
              }}
              className={
                "flex min-h-9 w-full min-w-0 items-center gap-2 border-l-2 px-3 py-2 text-left text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary " +
                (active
                  ? "border-primary bg-accent font-medium text-accent-foreground"
                  : "border-transparent text-ink-700 hover:bg-ink-50")
              }
            >
              {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
              <span className="min-w-0 flex-1">
                {text(item.label, item.bn)}
              </span>
            </button>
          );
        })}
        {!shown.length && (
          <p
            role="status"
            className="px-3 py-6 text-center text-xs text-helper"
          >
            {text("No matching sections.", "কোনো বিভাগ পাওয়া যায়নি।")}
          </p>
        )}
      </nav>
    </aside>
  );
}
