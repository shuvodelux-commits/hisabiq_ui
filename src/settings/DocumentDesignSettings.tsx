import { useState } from "react";
import { ArrowUp, ArrowDown, Printer } from "lucide-react";
import { Button, Input, SettingsField, SettingCard } from "./ui";
import { AppSelect } from "../components/AppSelect";
import {
  ReceiptPreview,
  type ReceiptPreviewProps,
} from "../components/brand/ReceiptPreview";
import { printReceipt } from "../components/brand/printReceipt";
import {
  invoiceDesignDefaults,
  type InvoiceDesign,
  type InvoiceSection,
} from "../documents/profile";
import type { InvoiceSettings, BusinessSettings } from "./model";
const galleryDesigns: { name: string; bn: string; description: string; template: InvoiceDesign["template"] | null }[] = [
  { name: "Standard", bn: "সাধারণ", description: "Clean invoice layout, suitable for every shop.", template: "Standard" },
  { name: "Classic", bn: "ক্লাসিক", description: "Traditional boxed header and bordered table.", template: "Classic" },
  { name: "Compact", bn: "কমপ্যাক্ট", description: "Dense invoice layout for long bills and thermal rolls.", template: "Compact" },
  { name: "Modern", bn: "মডার্ন", description: "Magic Patterns design; print renderer integration pending.", template: null },
  { name: "Elegant", bn: "এলিগ্যান্ট", description: "Magic Patterns design; print renderer integration pending.", template: null },
  { name: "Bold", bn: "বোল্ড", description: "Magic Patterns design; print renderer integration pending.", template: null },
];
const paperChoices: { id: InvoiceDesign["paper"]; label: string; helper: string }[] = [
  { id: "A4", label: "A4 page", helper: "Office printer" },
  { id: "80 mm", label: "80mm roll", helper: "Thermal receipt printer" },
  { id: "58 mm", label: "58mm roll", helper: "Small thermal printer" },
  { id: "Business Pad", label: "Business Pad", helper: "Pre-printed letterhead" },
];
const documentLanguages: { id: InvoiceDesign["language"]; label: string }[] = [
  { id: "English", label: "Full English" },
  { id: "English + Bangla", label: "English + বাংলা" },
  { id: "Bangla", label: "সম্পূর্ণ বাংলা" },
];

export function DocumentDesignSettings({
  value,
  business,
  saved,
  onChange,
  disabled,
}: {
  value: InvoiceSettings;
  business: BusinessSettings;
  saved?: InvoiceSettings;
  onChange: (v: InvoiceSettings) => void;
  disabled: boolean;
}) {
  const [compare, setCompare] = useState(false);
  const [notice, setNotice] = useState("");
  const isChanged = Boolean(saved && JSON.stringify(value) !== JSON.stringify(saved));
  const d = { ...invoiceDesignDefaults(), ...value.design };
  const update = (patch: Partial<InvoiceDesign>) => {
    const design = { ...d, ...patch };
    onChange({
      ...value,
      design,
      paper: design.paper === "Business Pad" ? "A4" : design.paper,
      showLogo: design.showLogo,
      showBangla: design.language !== "English",
      showSerial: design.showSerial,
      showWarranty: design.showWarranty,
      footer: design.footer,
    });
  };
  const sample: ReceiptPreviewProps = {
    invoice: value.prefix + "-PREVIEW",
    customer: "Rahim Traders",
    customerPhone: "01712 345678",
    customerAddress: "Natore, Rajshahi",
    lines: [
      {
        name: "LED bulb",
        nameBn: "এলইডি বাল্ব",
        sku: "LED-001",
        qty: "2 Pcs",
        price: 250,
        total: 500,
      },
      {
        name: "Electric cable",
        nameBn: "বৈদ্যুতিক তার",
        sku: "WIRE-001",
        qty: "1 Roll",
        price: 1500,
        total: 1500,
      },
    ],
    subtotal: 2000,
    discount: 0,
    rounding: 0,
    total: 2000,
    paid: 1500,
    due: 500,
    method: "Cash",
    payments: [
      { method: "Cash", amount: 1000 },
      { method: "bKash", amount: 500 },
    ],
    dateTime: "27 Oct 2026",
    branding: {
      ...business,
      showLogo: d.showLogo,
      footer: d.footer,
      design: d,
    },
  };
  const previewSettings = compare && saved ? saved : value;
  const previewDesign = { ...invoiceDesignDefaults(), ...previewSettings.design };
  const previewSample: ReceiptPreviewProps = {
    ...sample,
    invoice: previewSettings.prefix + "-PREVIEW",
    branding: {
      ...business,
      showLogo: previewDesign.showLogo,
      footer: previewDesign.footer,
      design: previewDesign,
    },
  };
  const flags: [keyof InvoiceDesign, string, string][] = [
    ["showLogo", "Business logo", "ব্যবসার লোগো"],
    ["showBusiness", "Business information", "ব্যবসার পরিচিতি"],
    ["showCustomer", "Customer name", "ক্রেতার নাম"],
    ["showPhone", "Customer phone", "ফোন"],
    ["showAddress", "Customer address", "ঠিকানা"],
    ["showGuardian", "Guardian name", "অভিভাবক"],
    ["showSku", "SKU / product code", "পণ্যের কোড"],
    ["showBarcode", "Barcode value", "বারকোড"],
    ["showDiscount", "Discount breakdown", "ছাড়ের বিবরণ"],
    ["showPayments", "Payment breakdown", "পেমেন্টের বিবরণ"],
    ["showDue", "Due amount", "বাকি"],
    ["showWords", "Amount in words", "কথায় টাকা"],
    ["showSignatures", "Signature lines", "স্বাক্ষর"],
    ["showSerial", "Serial numbers", "সিরিয়াল"],
    ["showWarranty", "Warranty details", "ওয়ারেন্টি"],
  ];
  const move = (section: InvoiceSection, delta: number) => {
    const sections = [...d.sections],
      i = sections.indexOf(section),
      j = i + delta;
    if (j < 0 || j >= sections.length) return;
    [sections[i], sections[j]] = [sections[j], sections[i]];
    update({ sections });
  };
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-2">
      <div className="space-y-4">
        <SettingCard title="Choose a design" titleBn="ডিজাইন বাছাই" description="Choose a printable HisabIQ layout. Three additional Magic Patterns designs are shown for reference until supported by the print renderer.">
          <div role="radiogroup" aria-label="Invoice design" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galleryDesigns.map((item) => {
              const active = d.template === item.template;
              const supported = item.template !== null;
              return (
                <button
                  key={item.name}
                  type="button"
                  role="radio"
                  aria-checked={supported && active}
                  disabled={disabled || !supported}
                  onClick={() => {
                    if (!item.template) return;
                    update({ template: item.template });
                    setCompare(false);
                  }}
                  className={`relative overflow-hidden rounded-xl border bg-card text-left transition-[border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 disabled:cursor-not-allowed ${active ? "border-teal-600 ring-2 ring-teal-500/20" : "border-ink-100 hover:border-ink-200 hover:shadow-card"}`}
                >
                  <div className="relative h-[150px] overflow-hidden border-b border-ink-100 bg-ink-50/60">
                    {supported && item.template ? (
                      <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 shadow-card" style={{ width: 150, height: 145, overflow: "hidden" }}>
                        <div style={{ width: 468, transform: "scale(0.32)", transformOrigin: "top left" }}>
                          <ReceiptPreview
                            {...sample}
                            branding={{
                              ...business,
                              showLogo: d.showLogo,
                              footer: d.footer,
                              design: { ...d, template: item.template, paper: "A4" },
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mx-auto mt-3 w-24 space-y-2 rounded bg-card px-3 py-4 shadow-card" aria-hidden="true">
                        <div className="mx-auto h-2 w-14 rounded bg-ink-200" />
                        <div className="mx-auto h-1 w-16 rounded bg-ink-100" />
                        <div className="mt-3 h-8 rounded border border-ink-100" />
                        <div className="h-1 rounded bg-ink-100" />
                        <div className="h-1 w-2/3 rounded bg-ink-100" />
                      </div>
                    )}
                    {active && supported && (
                      <span className="absolute left-2 top-2 flex size-5 items-center justify-center rounded-full bg-teal-600 text-white" aria-label="Selected">✓</span>
                    )}
                    {!supported && (
                      <span className="absolute right-2 top-2 rounded-md bg-inverse px-1.5 py-0.5 text-[10.5px] font-medium text-white">Not available</span>
                    )}
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-[13px] font-medium text-ink">
                      {item.name} <span lang="bn" className="font-bn text-[11px] font-normal text-ink-400">{item.bn}</span>
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-500">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </SettingCard>

        <SettingCard title="Paper & language" titleBn="কাগজ ও ভাষা" description="Pick the printer you use. Language changes the printed labels and amounts.">
          <div role="radiogroup" aria-label="Paper size" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {paperChoices.map((item) => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={d.paper === item.id}
                disabled={disabled}
                onClick={() => update({ paper: item.id })}
                className={`rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 disabled:cursor-not-allowed disabled:opacity-40 ${d.paper === item.id ? "border-teal-600 bg-teal-50/60" : "border-ink-100 hover:border-ink-200"}`}
              >
                <span className="block text-[13px] font-medium text-ink">{item.label}</span>
                <span className="block text-[11px] text-ink-500">{item.helper}</span>
              </button>
            ))}
          </div>
          {d.paper === "Business Pad" && (
            <label className="block text-[12px] font-medium text-ink-700">
              Space for your letterhead: {d.topOffset}mm
              <input
                type="range" min={0} max={100} step={5} value={d.topOffset}
                disabled={disabled}
                onChange={(event) => update({ topOffset: Number(event.target.value) })}
                className="mt-2 block w-full accent-teal-600"
              />
              <span className="mt-1 block text-[11px] font-normal text-ink-500">
                Measure from the top of your printed pad to where the invoice should begin.
              </span>
            </label>
          )}
          <div className="space-y-1.5">
            <p className="text-[12px] font-medium text-ink-700">
              Document language <span lang="bn" className="font-bn font-normal text-ink-400">চালানের ভাষা</span>
            </p>
            <div role="radiogroup" aria-label="Document language" className="inline-flex max-w-full flex-wrap overflow-hidden rounded-md border border-ink-100">
              {documentLanguages.map((item) => (
                <button
                  type="button"
                  role="radio"
                  key={item.id}
                  aria-checked={d.language === item.id}
                  disabled={disabled}
                  onClick={() => update({ language: item.id })}
                  className={`min-h-9 border-r border-ink-100 px-3 text-[12px] last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 ${d.language === item.id ? "bg-teal-50 font-medium text-teal-700" : "bg-card text-ink-600 hover:bg-ink-50"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-ink-500">
              {d.language === "Bangla"
                ? "Print labels and totals in Bangla. Product names use saved Bangla names when available."
                : d.language === "English + Bangla"
                  ? "English with Bangla helpers, recommended for most shops."
                  : "Full English for customers who prefer English invoices."}
            </p>
          </div>
          <details className="border-t border-ink-100 pt-3">
            <summary className="cursor-pointer text-xs font-medium text-ink-600">More print settings · Orientation & margins</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <SettingsField label="Orientation" bn="দিক">
                {(id) => (
                  <AppSelect
                    id={id}
                    label="Orientation"
                    value={d.orientation}
                    disabled={disabled || d.paper.includes("mm")}
                    onChange={(next) => update({ orientation: next as InvoiceDesign["orientation"] })}
                    options={["Portrait", "Landscape"]}
                  />
                )}
              </SettingsField>
              <SettingsField label="Page margins (mm)" bn="মার্জিন">
                {(id) => (
                  <Input
                    id={id} aria-label="Page margins (mm)" type="number"
                    min={2} max={30} disabled={disabled || d.paper.includes("mm")}
                    value={d.margin} onChange={(event) => update({ margin: Number(event.target.value) })}
                  />
                )}
              </SettingsField>
            </div>
          </details>
        </SettingCard>

        <SettingCard title="Brand color" titleBn="রং" description="The current three HisabIQ print templates use fixed colors.">
          <div className="flex items-center gap-3 text-xs text-ink-500">
            <span className="size-8 rounded-full border border-ink-100 bg-teal-700" aria-hidden="true" />
            <span>Custom brand colors from Magic Patterns are not connected to the current print renderer.</span>
          </div>
        </SettingCard>
        <SettingCard title="What to show on the invoice" titleBn="চালানে কী দেখাবে" description="Turn off information customers do not need. The live preview updates as you click.">
          <div className="grid gap-3 sm:grid-cols-2">
            {flags.map(([key, en, bn]) => (
              <label
                key={key}
                className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-1 text-[13px] text-ink-700 hover:bg-ink-50"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-teal-600"
                  disabled={disabled}
                  checked={d[key] as boolean}
                  onChange={(event) => update({ [key]: event.target.checked })}
                />
                <span>{en}</span>
                <span lang="bn" className="font-bn text-[11px] text-ink-400">{bn}</span>
              </label>
            ))}
          </div>
          <label className="block text-[12px] font-medium text-ink-700">
            Thank-you line
            <Input
              className="mt-1.5 block w-full"
              value={d.footer}
              disabled={disabled}
              maxLength={2000}
              placeholder={d.language === "Bangla" ? "আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ" : "Thank you for shopping with us"}
              onChange={(event) => update({ footer: event.target.value })}
            />
            <span className="mt-1 block text-[11px] font-normal text-ink-500">
              Printed at the bottom of the invoice.
            </span>
          </label>
          <p className="text-xs text-helper">
            Internal cost/margin is never included in customer output. Identity,
            source and financial totals are retained.
          </p>
        </SettingCard>
        <SettingCard title="More invoice content" titleBn="আরও বিবরণ" description="Optional notes, terms and section ordering.">
          {(["terms", "note", "message"] as const).map((k) => (
            <SettingsField
              key={k}
              label={
                k === "terms"
                  ? "Terms & conditions"
                  : k === "note"
                    ? "Additional note"
                    : k === "message"
                      ? "Custom message"
                      : "Footer"
              }
              bn={
                k === "terms"
                  ? "শর্তাবলী"
                  : k === "note"
                    ? "নোট"
                    : k === "message"
                      ? "বার্তা"
                      : "শেষের লেখা"
              }
            >
              {(id) => (
                <textarea
                  id={id}
                  maxLength={2000}
                  disabled={disabled}
                  className="min-h-20 w-full rounded-lg border border-input bg-card p-3 text-[13px]"
                  value={d[k]}
                  onChange={(e) => update({ [k]: e.target.value })}
                />
              )}
            </SettingsField>
          ))}
          <details>
            <summary className="cursor-pointer text-sm font-medium">
              Section order · অংশের ক্রম
            </summary>
            <ol className="mt-2 space-y-1">
              {d.sections.map((s, i) => (
                <li
                  key={s}
                  className="flex items-center justify-between gap-2 border-b border-border py-1 text-[13px]"
                >
                  <span>{s}</span>
                  <span className="flex gap-1">
                    <Button
                      aria-label={`Move ${s} up`}
                      variant="ghost"
                      disabled={disabled || i === 0}
                      onClick={() => move(s, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      aria-label={`Move ${s} down`}
                      variant="ghost"
                      disabled={disabled || i === d.sections.length - 1}
                      onClick={() => move(s, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                  </span>
                </li>
              ))}
            </ol>
          </details>
        </SettingCard>
      </div>
      <aside className="min-w-0 xl:sticky xl:top-20 xl:self-start">
        <section className="rounded-xl border border-ink-100 bg-card shadow-card">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Live preview</h2>
              <p className="text-xs text-ink-500">
                {previewDesign.template} · {previewDesign.paper}{compare ? " · current" : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isChanged && (
                <div className="inline-flex rounded-md border border-ink-100" role="radiogroup" aria-label="Compare invoice design">
                  <button type="button" role="radio" aria-checked={!compare} onClick={() => setCompare(false)}
                    className={`h-9 px-3 text-xs ${!compare ? "bg-teal-50 font-medium text-teal-700" : "text-ink-600"}`}>New</button>
                  <button type="button" role="radio" aria-checked={compare} onClick={() => setCompare(true)}
                    className={`h-9 px-3 text-xs ${compare ? "bg-teal-50 font-medium text-teal-700" : "text-ink-600"}`}>Current</button>
                </div>
              )}
              <Button variant="ghost" onClick={() => {
                if (!printReceipt(previewSample)) setNotice("Allow print popups and try again.");
                else setNotice("Print preview opened. Use the browser to print or save as PDF.");
              }}>
                <Printer className="size-4" aria-hidden="true" />
                Print
              </Button>
            </div>
          </header>
          <div className="max-h-[70vh] overflow-auto bg-ink-50/70 p-4">
            <div className="mx-auto w-fit shadow-pop">
              <ReceiptPreview {...previewSample} />
            </div>
          </div>
          {notice && <p role="status" className="px-4 py-2 text-xs text-ink-500">{notice}</p>}
          <p className="px-4 py-3 text-[11px] text-ink-500">
            Sample data. Preview and print use HisabIQ's existing invoice renderer. Previously issued invoices keep their original data.
          </p>
        </section>
      </aside>
    </div>
  );
}
