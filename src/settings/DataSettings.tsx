import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Upload, History } from "lucide-react";
import { canManage, parseSettings, type TenantSettings } from "./model";
import { useTenantSettings } from "./TenantSettingsProvider";
import {
  Button,
  SettingCard,
  SettingsDialog,
  controlClass,
  download,
} from "./ui";
import { sectionNames } from "./fields";

async function readFile(file: File, reportError: (message: string) => void) {
  try {
    return await file.text();
  } catch {
    reportError("Could not read that file. Please choose it again.");
    return null;
  }
}

export function DataSettings() {
  const { state, actorId, restore } = useTenantSettings();
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
      <div className="grid gap-4 xl:grid-cols-2">
        <SettingCard title="Settings backup">
          <p className="text-sm text-ink-600">
            Backup for {state.sections.business.name}. Includes business
            preferences and employee role configuration; personal appearance
            stays on this device.
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
            Download settings backup
          </Button>
          <label className="block space-y-2 text-sm font-medium">
            Restore settings backup
            <input
              aria-label="Restore settings backup"
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
            Restore updates settings only. It does not delete invoices, stock or
            ledger records.
          </p>
        </SettingCard>
        <SettingCard title="Record exports & import preview">
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-md border border-input px-3 py-2 text-sm text-ink"
              to="/app/products"
            >
              Product exports
            </Link>
            <Link
              className="rounded-md border border-input px-3 py-2 text-sm text-ink"
              to="/app/sales"
            >
              Sales records
            </Link>
            <Link
              className="rounded-md border border-input px-3 py-2 text-sm text-ink"
              to="/app/daybook"
            >
              Daybook exports
            </Link>
          </div>
          <p className="text-xs text-ink-500">
            Record exports stay in their owning modules. Preview a simple
            product CSV mapping below; this demo does not create products.
          </p>
          <label className="block space-y-2 text-sm font-medium">
            Product CSV preview
            <input
              aria-label="Product CSV preview"
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
                  {field}
                  <select
                    aria-label={`Map ${field}`}
                    className={controlClass}
                    value={mapping[field] || ""}
                    onChange={(e) =>
                      setMapping({ ...mapping, [field]: e.target.value })
                    }
                  >
                    <option value="">Choose CSV column</option>
                    {csv[0].map((header, i) => (
                      <option key={i} value={String(i)}>
                        {header}
                      </option>
                    ))}
                  </select>
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
                Preview import
              </Button>
              {preview && (
                <div
                  role="status"
                  className="rounded-lg bg-accent p-3 text-sm text-accent-foreground"
                >
                  {csv.length - 1} rows ready for review. First product:{" "}
                  {csv[1][Number(mapping["Product name"])] || "(empty name)"}.
                  No records imported.
                </div>
              )}
            </div>
          )}
        </SettingCard>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-danger-bg p-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-lg bg-success-bg p-3 text-sm text-success"
        >
          {notice}
        </p>
      )}
      <SettingCard title="Settings activity">
        <p className="flex items-center gap-2 text-xs text-ink-500">
          <History className="size-4" />
          Business settings changes · Asia/Dhaka
        </p>
        {!state.events.length ? (
          <p className="text-sm text-ink-500">
            No settings changes yet. Your first saved change will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-ink-500">
                <tr>
                  <th className="px-2 py-2">When</th>
                  <th className="px-2 py-2">Employee</th>
                  <th className="px-2 py-2">Section</th>
                  <th className="px-2 py-2">Changed fields</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {state.events.map((event) => (
                  <tr key={event.id}>
                    <td className="whitespace-nowrap px-2 py-3">
                      {new Date(event.at).toLocaleString("en-GB", {
                        timeZone: "Asia/Dhaka",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-2 py-3">{event.actor}</td>
                    <td className="px-2 py-3">
                      {sectionNames[event.section as keyof typeof sectionNames]
                        ?.label || event.section}
                    </td>
                    <td className="px-2 py-3 text-ink-500">
                      {event.changes.join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingCard>
      <SettingsDialog
        title="Review settings restore"
        description="Review the affected sections before replacing their saved settings."
        open={!!backup}
        onClose={() => setBackup(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-600">
            Business: {backup?.sections.business.name}
          </p>
          {changed.length ? (
            <ul className="list-inside list-disc space-y-1 text-sm">
              {changed.map((k) => (
                <li key={k}>
                  {sectionNames[k as keyof typeof sectionNames].label}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-500">
              This backup matches the current settings.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBackup(null)}>
              Cancel
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
              Restore settings
            </Button>
          </div>
        </div>
      </SettingsDialog>
    </div>
  );
}
