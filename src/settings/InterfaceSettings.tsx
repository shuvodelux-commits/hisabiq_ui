import { useState } from "react";
import { useTenantSettings } from "./TenantSettingsProvider";
import {
  moduleViewCatalog,
  type ModuleViews,
  type ViewModule,
} from "./moduleViews";
import { useModuleColumns } from "./useModuleColumns";
import { Button, SettingCard, SettingsField } from "./ui";
import { AppSelect } from "../components/AppSelect";
function Columns({
  module,
  value,
  onChange,
  disabled,
}: {
  module: ViewModule;
  value: ModuleViews;
  onChange: (v: ModuleViews) => void;
  disabled: boolean;
}) {
  const { personal: preferences } = useTenantSettings();
  const text = (en: string, bn: string) =>
    preferences.language === "Bangla" ? bn : en;
  const names: Record<string, string> = {
    invoice: "বিল",
    customer: "ক্রেতা",
    items: "পণ্য",
    total: "মোট",
    profit: "লাভ",
    paid: "পরিশোধ",
    due: "বাকি",
    payment: "মাধ্যম",
    status: "অবস্থা",
    index: "ক্রম",
    product: "পণ্য",
    category: "ধরন",
    stock: "স্টক",
    stockValue: "স্টকের দাম",
    unit: "একক",
    purchase: "ক্রয়মূল্য",
    selling: "বিক্রিমূল্য",
  };
  const [scope, setScope] = useState("mine");
  const def = moduleViewCatalog[module];
  const personal = useModuleColumns(
    module,
    def.key,
    Object.fromEntries(def.columns.map((k) => [k, true])),
  );
  const columns =
    scope === "mine"
      ? personal.columns
      : {
          ...Object.fromEntries(def.columns.map((k) => [k, true])),
          ...value[module],
        };
  return (
    <SettingCard
      title={`${def.label} columns`}
      titleBn={module === "sales" ? "বিক্রির কলাম" : "পণ্যের কলাম"}
    >
      {" "}
      <SettingsField label="Apply to" bn="কার জন্য">
        {(id) => (
          <AppSelect
            id={id}
            label={text("Apply to", "কার জন্য")}
            value={scope}
            onChange={setScope}
            options={[
              {
                value: "mine",
                label: text(
                  "My view · Saves instantly",
                  "আমার জন্য · সঙ্গে সঙ্গে সংরক্ষণ",
                ),
              },
              ...(!disabled
                ? [
                    {
                      value: "business",
                      label: text(
                        "Whole shop · Save to apply",
                        "পুরো দোকান · শেষে সংরক্ষণ করুন",
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </SettingsField>
      <div className="grid gap-3 sm:grid-cols-2">
        {def.columns.map((k) => {
          const essential = (def.essential as readonly string[]).includes(k);
          return (
            <label
              key={k}
              className="flex items-center justify-between gap-2 text-[13px]"
            >
              <span>
                {text(
                  k
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (x) => x.toUpperCase()),
                  names[k] ?? k,
                )}
                {essential && (
                  <span className="ml-2 text-xs text-helper">
                    {text("Required", "অবশ্যই")}
                  </span>
                )}
              </span>
              <input
                type="checkbox"
                disabled={essential || (scope === "business" && disabled)}
                checked={essential || columns[k] !== false}
                onChange={(e) =>
                  scope === "mine"
                    ? personal.setColumns({
                        ...personal.columns,
                        [k]: e.target.checked,
                      })
                    : onChange({
                        ...value,
                        [module]: { ...value[module], [k]: e.target.checked },
                      })
                }
              />
            </label>
          );
        })}
      </div>
      <Button
        variant="outline"
        onClick={() =>
          scope === "mine"
            ? personal.reset()
            : onChange({ ...value, [module]: {} })
        }
      >
        {text("Reset columns", "কলাম আগের মতো করুন")}
      </Button>
      <p role="status" className="text-xs text-helper">
        {personal.warning ||
          (scope === "mine"
            ? text(
                "Saved instantly, for this browser only.",
                "সঙ্গে সঙ্গে সংরক্ষণ হয়, শুধু এই ব্রাউজারে।",
              )
            : text(
                "For the whole shop. Save changes to apply.",
                "পুরো দোকানের জন্য। প্রয়োগ করতে সংরক্ষণ করুন।",
              ))}
      </p>
      <p className="text-xs text-helper">
        {text(
          "Hiding columns changes layout, not data access.",
          "কলাম লুকালে শুধু সাজানো বদলায়, তথ্য দেখার অনুমতি নয়।",
        )}
      </p>
    </SettingCard>
  );
}
export function InterfaceSettings(props: {
  value: ModuleViews;
  onChange: (v: ModuleViews) => void;
  disabled: boolean;
}) {
  const [module, setModule] = useState<ViewModule>("sales");
  return (
    <div className="space-y-3">
      <SettingsField label="Module" bn="মডিউল">
        {(id) => (
          <AppSelect
            id={id}
            label="Module"
            value={module}
            onChange={(v) => setModule(v as ViewModule)}
            options={Object.entries(moduleViewCatalog).map(([value, d]) => ({
              value,
              label: d.label,
            }))}
          />
        )}
      </SettingsField>
      <Columns key={module} module={module} {...props} />
    </div>
  );
}
