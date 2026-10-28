import { SettingsSqlBackup } from "./SettingsSqlBackup";
import { SettingsActivity } from "./SettingsActivity";
import { DraftRecovery } from "./DraftRecovery";
import { AppSelect } from "../components/AppSelect";
import { useState, useId } from "react";
import { SettingsTabs } from "./SettingsTabs";
import { Link } from "react-router-dom";
import { Download, Upload } from "lucide-react";
import { canManage, parseSettings, type TenantSettings } from "./model";
import { useTenantSettings } from "./TenantSettingsProvider";
import { Button, SettingCard, SettingsDialog, download } from "./ui";
import { sectionNames } from "./fields";
import { settingsCopy } from "../i18n/settingsCopy";

async function readFile(file: File, reportError: (message: string) => void) {
  try {
    return await file.text();
  } catch {
    reportError("Could not read that file. Please choose it again.");
    return null;
  }
}

export function DataSettings() {
  const { state, actorId, restore, personal } = useTenantSettings();
  const text = (en: string, bn: string) =>
    personal.language === "Bangla" ? bn : en;
  const copy = (message: string) => settingsCopy(personal.language, message);
  const [tab, setTab] = useState("backup");
  const tabsId = "data-" + useId().replace(/:/g, "");
  const [backup, setBackup] = useState<TenantSettings | null>(null),
    [revision, setRevision] = useState(0),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [csv, setCsv] = useState<string[][]>([]),
    [mapping, setMapping] = useState<Record<string, string>>({}),
    [preview, setPreview] = useState(false);
  const exportAllowed = canManage(state, actorId, "export"),
    importAllowed = canManage(state, actorId, "import");
  const changed = backup
    ? Object.keys(state.sections).filter(
        (k) =>
          JSON.stringify(state.sections[k as keyof typeof state.sections]) !==
          JSON.stringify(backup.sections[k as keyof typeof state.sections]),
      )
    : [];
  return (
    <div className="space-y-5">
      <SettingsTabs
        secondary
        inline
        id={tabsId}
        panelId={`${tabsId}-panel`}
        label={text("Data tasks", "ডেটার কাজ")}
        language={personal.language}
        value={tab}
        onChange={setTab}
        items={[
          { id: "backup", label: "Backup & restore", bn: "ব্যাকআপ" },
          { id: "records", label: "Record files", bn: "রেকর্ডের ফাইল" },
          { id: "recovery", label: "Recover drafts", bn: "খসড়া ফেরত" },
          ...(canManage(state, actorId, "audit.event.view")
            ? [{ id: "activity", label: "History", bn: "পরিবর্তনের ইতিহাস" }]
            : []),
        ]}
      />
      <div
        id={`${tabsId}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-${tab}`}
        className="space-y-4"
      >
        <div hidden={tab !== "recovery"}>
          <DraftRecovery />
        </div>
        <div hidden={tab !== "backup"}>
          <SettingsSqlBackup
            state={state}
            exportAllowed={exportAllowed}
            importAllowed={importAllowed}
            onReview={(backup) => {
              setError("");
              setBackup(backup);
              setRevision(state.revision);
            }}
          />
        </div>
        <div className="space-y-4">
          <details hidden={tab !== "backup"} className="text-[13px]">
            <summary className="cursor-pointer text-primary">
              {text("JSON backup", "JSON ব্যাকআপ")}
            </summary>
            <div className="mt-3">
              <SettingCard title="Settings backup" titleBn="সেটিংসের ব্যাকআপ">
                <p className="text-sm text-ink-600">
                  {text(
                    "Settings and staff access for",
                    "দোকানের সেটিংস ও কর্মীর অনুমতি:",
                  )}{" "}
                  {state.sections.business.name}
                </p>
                <Button
                  disabled={!exportAllowed}
                  variant="outline"
                  onClick={() =>
                    download(
                      `hisabiq-settings-${state.tenantId}.json`,
                      JSON.stringify(state, null, 2),
                    )
                  }
                >
                  <Download className="size-4" />
                  {text("Download settings backup", "ব্যাকআপ নামান")}
                </Button>
                <label className="block space-y-2 text-sm font-medium">
                  {text("Restore settings backup", "ব্যাকআপ ফেরত আনুন")}
                  <input
                    aria-label={text(
                      "Restore settings backup",
                      "ব্যাকআপ ফেরত আনুন",
                    )}
                    disabled={!importAllowed}
                    type="file"
                    accept="application/json,.json"
                    className="block w-full text-xs text-ink-600 file:mr-3 file:rounded-md file:border file:border-input file:bg-card file:px-3 file:py-2 file:text-ink"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setError("");
                      if (file.size > 1000000)
                        return setError(
                          "Choose a settings backup smaller than 1 MB.",
                        );
                      const content = await readFile(file, setError);
                      if (content === null) return;
                      const loaded = parseSettings(content, state.tenantId);
                      if (loaded.recovered)
                        return setError(
                          "Invalid backup or a backup from another business.",
                        );
                      setBackup(loaded.state);
                      setRevision(state.revision);
                    }}
                  />
                </label>
                <p className="text-xs text-ink-500">
                  {text(
                    "Only settings are replaced. Bills, stock and ledger records stay unchanged.",
                    "শুধু সেটিংস বদলাবে। বিল, স্টক ও খাতার রেকর্ড ঠিক থাকবে।",
                  )}
                </p>
              </SettingCard>
            </div>
          </details>
          <div hidden={tab !== "records"}>
            <SettingCard
              title="Record exports & import preview"
              titleBn="রেকর্ডের ফাইল ও আমদানির নমুনা"
            >
              <div className="flex flex-wrap gap-2">
                <Link
                  className="rounded-md border border-input px-3 py-2 text-sm text-ink"
                  to="/app/products"
                >
                  {text("Product exports", "পণ্যের ফাইল")}
                </Link>
                <Link
                  className="rounded-md border border-input px-3 py-2 text-sm text-ink"
                  to="/app/sales"
                >
                  {text("Sales records", "বিক্রির রেকর্ড")}
                </Link>
                <Link
                  className="rounded-md border border-input px-3 py-2 text-sm text-ink"
                  to="/app/daybook"
                >
                  {text("Daybook exports", "দিনের হিসাবের ফাইল")}
                </Link>
              </div>
              <p className="text-xs text-ink-500">
                {text(
                  "Download records from their own section. CSV here is a sample; no products are imported.",
                  "নিজের বিভাগ থেকে রেকর্ড নামান। এখানকার CSV শুধু নমুনা; পণ্য যোগ হবে না।",
                )}
              </p>
              <label className="block space-y-2 text-sm font-medium">
                {text("Product CSV preview", "পণ্যের CSV নমুনা")}
                <input
                  aria-label={text("Product CSV preview", "পণ্যের CSV নমুনা")}
                  disabled={!importAllowed}
                  type="file"
                  accept="text/csv,.csv"
                  className="block w-full text-xs text-ink-600 file:mr-3 file:rounded-md file:border file:border-input file:bg-card file:px-3 file:py-2 file:text-ink"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    if (file.size > 100000)
                      return setError("Choose a CSV smaller than 100 KB.");
                    const content = await readFile(file, setError);
                    if (content === null) return;
                    if (content.includes('"'))
                      return setError(
                        "This preview accepts plain comma-separated rows without quoted fields.",
                      );
                    const rows = content
                      .trim()
                      .split(/\r?\n/)
                      .map((row) => row.split(",").map((v) => v.trim()));
                    if (
                      rows.length < 2 ||
                      !rows[0].length ||
                      rows.some((row) => row.length !== rows[0].length)
                    )
                      return setError(
                        "CSV must have a header and consistent columns.",
                      );
                    setCsv(rows);
                    setMapping({});
                    setPreview(false);
                    setError("");
                  }}
                />
              </label>
              {csv.length > 0 && (
                <div className="space-y-3">
                  {["Product name", "Category", "Base unit"].map((field) => (
                    <label
                      key={field}
                      className="block space-y-1 text-xs font-medium"
                    >
                      {text(
                        field,
                        (
                          {
                            "Product name": "পণ্যের নাম",
                            Category: "ধরন",
                            "Base unit": "মূল একক",
                          } as Record<string, string>
                        )[field],
                      )}
                      <AppSelect
                        label={text(
                          `Map ${field}`,
                          `${({ "Product name": "পণ্যের নাম", Category: "ধরন", "Base unit": "মূল একক" } as Record<string, string>)[field]} এর কলাম`,
                        )}
                        value={mapping[field] || ""}
                        onChange={(next) =>
                          setMapping({ ...mapping, [field]: next })
                        }
                        options={[
                          {
                            value: "",
                            label: text("Choose CSV column", "CSV কলাম বাছুন"),
                          },
                          ...csv[0].map((header, i) => ({
                            value: String(i),
                            label: header,
                          })),
                        ]}
                      />
                    </label>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!mapping["Product name"])
                        return setError(
                          "Map a product name column before previewing.",
                        );
                      setPreview(true);
                      setError("");
                    }}
                  >
                    {text("Preview import", "আমদানির নমুনা দেখুন")}
                  </Button>
                  {preview && (
                    <div
                      role="status"
                      className="rounded-lg bg-accent p-3 text-sm text-accent-foreground"
                    >
                      {csv.length - 1}{" "}
                      {text(
                        "rows ready for review. First product:",
                        "টি সারি দেখা যাবে। প্রথম পণ্য:",
                      )}{" "}
                      {csv[1][Number(mapping["Product name"])] ||
                        text("(empty name)", "(নাম ফাঁকা)")}
                      . {text("No records imported.", "কোনো রেকর্ড যোগ হয়নি।")}
                    </div>
                  )}
                </div>
              )}
            </SettingCard>
          </div>
        </div>
        {error && !backup && (
          <p
            role="alert"
            className="rounded-lg bg-danger-bg p-3 text-sm text-danger"
          >
            {copy(error)}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-lg bg-success-bg p-3 text-sm text-success"
          >
            {copy(notice)}
          </p>
        )}
        {canManage(state, actorId, "audit.event.view") && (
          <div hidden={tab !== "activity"}>
            <SettingsActivity events={state.events} />
          </div>
        )}
      </div>
      <SettingsDialog
        title={text("Review settings restore", "ফেরত আনার আগে দেখে নিন")}
        description={text(
          "Review the affected sections before replacing their saved settings.",
          "কোন বিভাগের সেটিংস বদলাবে দেখে নিন।",
        )}
        open={!!backup}
        onClose={() => setBackup(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            {text("Business", "দোকান")}: {backup?.sections.business.name}
          </p>
          {changed.length ? (
            <ul className="list-inside list-disc space-y-1 text-sm">
              {changed.map((k) => (
                <li key={k}>
                  {text(
                    sectionNames[k as keyof typeof sectionNames].label,
                    sectionNames[k as keyof typeof sectionNames].bn,
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-500">
              {copy("This backup matches the current settings.")}
            </p>
          )}
          {error && (
            <p role="alert" className="text-[13px] text-danger">
              {copy(error)}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBackup(null)}>
              {text("Cancel", "বাতিল")}
            </Button>
            <Button
              disabled={!changed.length || !importAllowed}
              onClick={() => {
                if (!backup) return;
                const result = restore(backup, revision);
                if (!result.ok)
                  return setError(result.error || "Restore failed");
                setBackup(null);
                setNotice(
                  "Business settings restored. Existing records were preserved.",
                );
              }}
            >
              <Upload className="size-4" />
              {text("Restore settings", "সেটিংস ফেরত আনুন")}
            </Button>
          </div>
        </div>
      </SettingsDialog>
    </div>
  );
}
