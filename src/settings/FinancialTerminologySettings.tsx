import { useState } from "react";
import { AppSelect } from "../components/AppSelect";
import { Input, SettingCard, SettingsField, Button } from "./ui";
import {
  applyFinancialPreset,
  financialPreview,
  financialContexts,
  financialDefaults,
  financialTerms,
  financialColumns,
  financialLabel,
  type FinancialDisplay,
  type FinancialContext,
  type FinancialTerm,
  type FinancialProfile,
} from "../financial-display/model";
import { taka } from "../utils/currency";
export function FinancialTerminologySettings({
  value,
  onChange,
  disabled,
  language,
}: {
  value: FinancialDisplay;
  onChange: (value: FinancialDisplay) => void;
  disabled: boolean;
  language: string;
}) {
  const [context, setContext] = useState<FinancialContext>("Customer"),
    [query, setQuery] = useState(""),
    [showAll, setShowAll] = useState(false),
    [editing, setEditing] = useState(false);
  const text = (en: string, bn: string) => (language === "Bangla" ? bn : en);
  const contextNames: Record<string, string> = {
    "Cash & bank": "ক্যাশ ও ব্যাংক",
    Customer: "ক্রেতা",
    Supplier: "সরবরাহকারী",
    Owner: "মালিক",
    Lender: "ঋণদাতা",
    Borrower: "ঋণগ্রহীতা",
    Vendor: "ভেন্ডর",
    Payee: "খরচের প্রাপক",
    Reports: "রিপোর্ট",
  };
  const presetNames: Record<string, string> = {
    Accounting: "প্রচলিত হিসাবের নাম",
    "Money movement": "টাকা আসা ও যাওয়া",
    "Local party Khata": "দোকানের খাতা",
    Custom: "নিজের নাম",
  };
  const profile = value.contexts[context];
  const update = (patch: Partial<FinancialProfile>) =>
    onChange({
      ...value,
      contexts: { ...value.contexts, [context]: { ...profile, ...patch } },
    });
  const sample = financialPreview(context);
  const rows = sample.rows;
  const terms = (Object.keys(financialTerms) as FinancialTerm[]).filter((k) =>
    [k, ...financialTerms[k], profile.terms[k].en, profile.terms[k].bn]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const edit = (
    key: FinancialTerm,
    field: "en" | "bn" | "helper",
    text: string,
  ) =>
    update({
      preset: "Custom",
      terms: {
        ...profile.terms,
        [key]: { ...profile.terms[key], [field]: text },
      },
    });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <SettingsField label="Account / relationship" bn="হিসাবের ধরন">
          {(id) => (
            <AppSelect
              id={id}
              label={text("Account / relationship", "হিসাবের ধরন")}
              value={context}
              onChange={(v) => setContext(v as FinancialContext)}
              options={financialContexts.map((value) => ({
                value,
                label: text(value, contextNames[value] ?? value),
              }))}
            />
          )}
        </SettingsField>
        <SettingsField label="Naming preset" bn="নামের ধরন">
          {(id) => (
            <AppSelect
              id={id}
              label={text("Naming preset", "নামের ধরন")}
              value={profile.preset}
              disabled={disabled}
              onChange={(v) =>
                update(
                  applyFinancialPreset(
                    profile,
                    v as FinancialProfile["preset"],
                    context,
                  ),
                )
              }
              options={(context === "Cash & bank"
                ? ["Accounting", "Money movement", "Custom"]
                : ["Accounting", "Local party Khata", "Custom"]
              ).map((value) => ({
                value,
                label: text(value, presetNames[value]),
              }))}
            />
          )}
        </SettingsField>
        <SettingsField label="Column order" bn="কলামের অবস্থান">
          {(id) => (
            <AppSelect
              id={id}
              label={text("Column order", "কলামের অবস্থান")}
              value={profile.order}
              disabled={disabled}
              onChange={(v) =>
                update({ order: v as FinancialProfile["order"] })
              }
              options={[
                {
                  value: "debit-first",
                  label: text(
                    "Debit left · Credit right",
                    `${financialLabel(value, context, "debit", "Bangla")} আগে · ${financialLabel(value, context, "credit", "Bangla")} পরে`,
                  ),
                },
                {
                  value: "credit-first",
                  label: text(
                    "Credit left · Debit right",
                    `${financialLabel(value, context, "credit", "Bangla")} আগে · ${financialLabel(value, context, "debit", "Bangla")} পরে`,
                  ),
                },
              ]}
            />
          )}
        </SettingsField>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => update(financialDefaults().contexts[context])}
        >
          {text("Reset these names", "এই নামগুলো আগের মতো করুন")}
        </Button>
      </div>
      <p className="text-xs text-helper">
        {text(
          "Only names and column order change. Amounts stay the same.",
          "শুধু নাম ও কলামের ক্রম বদলাবে। টাকার হিসাব ঠিক থাকবে।",
        )}
      </p>
      <Button
        variant="outline"
        disabled={disabled}
        aria-expanded={editing}
        onClick={() => setEditing(!editing)}
      >
        {editing
          ? text("Close name editor", "নামের ঘর বন্ধ করুন")
          : text("Edit names", "নাম বদলান")}
      </Button>
      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        {editing && (
          <SettingCard
            title="Names & short explanations"
            titleBn="নাম ও ছোট ব্যাখ্যা"
          >
            <Input
              aria-label="Search financial terms"
              placeholder={text("Find a name…", "নাম খুঁজুন…")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {(query || showAll ? terms : terms.slice(0, 6)).map((key) => (
              <div
                key={key}
                className="space-y-2 border-b border-border pb-3"
                data-field-key={key}
              >
                <p className="text-[13px] font-medium">
                  {text(financialTerms[key][0], financialTerms[key][1])}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["en", "bn"] as const).map((field) => (
                    <Input
                      key={field}
                      aria-label={`${financialTerms[key][0]} ${field === "en" ? "English" : "Bangla"}`}
                      maxLength={60}
                      disabled={disabled}
                      value={profile.terms[key][field]}
                      onChange={(e) => edit(key, field, e.target.value)}
                    />
                  ))}
                </div>
                <Input
                  aria-label={`${financialTerms[key][0]} helper`}
                  placeholder={text(
                    "Short explanation (optional)",
                    "ছোট ব্যাখ্যা (ইচ্ছামতো)",
                  )}
                  maxLength={120}
                  disabled={disabled}
                  value={profile.terms[key].helper}
                  onChange={(e) => edit(key, "helper", e.target.value)}
                />
              </div>
            ))}
            {!query && (
              <Button variant="ghost" onClick={() => setShowAll((v) => !v)}>
                {showAll
                  ? text("Show fewer names", "কম নাম দেখান")
                  : text("Show all names", "সব নাম দেখান")}
              </Button>
            )}
            {terms.length === 0 && (
              <p className="text-xs text-helper">
                {text("No matching names.", "মিল পাওয়া যায়নি।")}
              </p>
            )}
          </SettingCard>
        )}
        <div
          className={
            "min-w-0 self-start " +
            (editing ? "xl:sticky xl:top-4" : "xl:col-span-2")
          }
        >
          <SettingCard title="Sample ledger" titleBn="নমুনা খাতা">
            <div>
              <strong>
                {context === "Cash & bank"
                  ? "Cash account"
                  : context === "Customer"
                    ? "Rahim Traders"
                    : context}
              </strong>
              <p className="text-xs text-helper">
                Opening {sample.balanceLabel} ৳2,000 · Sample entries
              </p>
            </div>
            <div
              tabIndex={0}
              role="region"
              aria-label={`${context} sample ledger`}
              className="overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <table data-erp-table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2">{text("Date", "তারিখ")}</th>
                    <th className="p-2">{text("Description", "বিবরণ")}</th>
                    {financialColumns(value, context).map((k) => (
                      <th key={k} className="p-2 text-right">
                        {financialLabel(value, context, k, language)}
                      </th>
                    ))}
                    <th className="p-2 text-right">{text("Balance", "জের")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.date} className="border-b border-border">
                      <td className="p-2">{r.date}</td>
                      <td className="p-2">{r.description}</td>
                      {financialColumns(value, context).map((k) => (
                        <td key={k} className="p-2 text-right">
                          {r[k] ? taka(r[k]) : "—"}
                        </td>
                      ))}
                      <td className="p-2 text-right">{taka(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-right text-sm font-semibold">
              Closing {sample.balanceLabel} ৳2,820
            </p>
          </SettingCard>
        </div>
      </div>
    </div>
  );
}
