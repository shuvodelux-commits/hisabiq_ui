export const settingsSubsections = {
  business: [
    { id: "general", label: "General", bn: "সাধারণ" },
    { id: "contact", label: "Other contacts", bn: "অন্যান্য যোগাযোগ" },
    { id: "branding", label: "Logo & branding", bn: "লোগো ও ব্র্যান্ডিং" },
    { id: "regional", label: "Regional & currency", bn: "আঞ্চলিক ও মুদ্রা" },
    { id: "tax", label: "Tax & VAT", bn: "কর ও ভ্যাট" },
  ],
  invoices: [
    { id: "invoice", label: "Invoice design", bn: "বিলের ডিজাইন" },
    { id: "numbering", label: "Document numbering", bn: "ডকুমেন্ট নম্বর" },
    {
      id: "output",
      label: "Ledger & report designs",
      bn: "খাতা ও রিপোর্টের ডিজাইন",
    },
  ],
} as const;
export function businessFieldGroup(key: string) {
  return key === "logo"
    ? "branding"
    : key === "financialYear"
      ? "regional"
      : ["email", "website"].includes(key)
        ? "contact"
        : "general";
}
