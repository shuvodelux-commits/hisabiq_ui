/** Saved UI-preview policies. Backend tax posting and authoritative numbering are separate services. */
export type RegionalPreferences = {
  currency: 'BDT';
  timezone: 'Asia/Dhaka';
  symbol: '৳' | 'BDT';
  grouping: 'Bangladesh' | 'International';
  digits: 'English' | 'Bangla';
  dateFormat: 'DD/MM/YYYY' | 'DD-MM-YYYY' | 'YYYY-MM-DD';
  timeFormat: '12-hour' | '24-hour';
  negativeFormat: 'Minus' | 'Parentheses';
};
export type VatRate = { id: string; label: string; percentage: number; active: boolean };
export type TaxPreferences = {
  enabled: boolean;
  registrationBin: string;
  pricing: 'Exclusive' | 'Inclusive';
  rates: VatRate[];
  defaultRateId: string;
  showOnInvoice: boolean;
};
export const documentKinds = [
  'sale', 'purchase', 'saleReturn', 'purchaseReturn', 'quotation',
  'draft', 'expense', 'receipt', 'transfer', 'adjustment'
] as const;
export type DocumentKind = typeof documentKinds[number];
export const documentLabels: Record<DocumentKind, { en: string; bn: string }> = {
  sale: { en: 'Sales invoice', bn: 'বিক্রয় চালান' },
  purchase: { en: 'Purchase invoice', bn: 'ক্রয়ের চালান' },
  saleReturn: { en: 'Sales return', bn: 'বিক্রয় ফেরত' },
  purchaseReturn: { en: 'Purchase return', bn: 'ক্রয় ফেরত' },
  quotation: { en: 'Quotation', bn: 'দরপত্র' },
  draft: { en: 'Sales draft', bn: 'বিক্রয়ের খসড়া' },
  expense: { en: 'Expense', bn: 'খরচ' },
  receipt: { en: 'Payment receipt', bn: 'টাকা প্রাপ্তির রসিদ' },
  transfer: { en: 'Account transfer', bn: 'হিসাব স্থানান্তর' },
  adjustment: { en: 'Stock adjustment', bn: 'স্টক সমন্বয়' },
};
export type DocumentNumberRule = {
  prefix: string;
  digits: number;
  nextNumber: number;
  year: 'None' | 'Calendar year';
};
export type DocumentNumberingPreferences = Record<DocumentKind, DocumentNumberRule>;

export function regionalDefaults(): RegionalPreferences {
  return {
    currency: 'BDT', timezone: 'Asia/Dhaka', symbol: '৳',
    grouping: 'Bangladesh', digits: 'English', dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour', negativeFormat: 'Minus'
  };
}
export function taxDefaults(): TaxPreferences {
  return {
    enabled: false, registrationBin: '', pricing: 'Exclusive', showOnInvoice: true,
    rates: [{ id: 'standard', label: 'Standard VAT · enter applicable rate', percentage: 0, active: true }],
    defaultRateId: 'standard'
  };
}
export function numberingDefaults(salePrefix = 'INV'): DocumentNumberingPreferences {
  const prefixes: Record<DocumentKind, string> = {
    sale: salePrefix, purchase: 'PUR', saleReturn: 'SRN', purchaseReturn: 'PRN',
    quotation: 'QTN', draft: 'DFT', expense: 'EXP', receipt: 'RCP',
    transfer: 'TRF', adjustment: 'ADJ'
  };
  return Object.fromEntries(documentKinds.map(kind => [
    kind, { prefix: prefixes[kind], digits: 6, nextNumber: 1, year: 'None' }
  ])) as DocumentNumberingPreferences;
}
const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const oneOf = (value: unknown, choices: readonly string[]) => typeof value === 'string' && choices.includes(value);
export function validateRegional(value: unknown): string | null {
  if (!isObject(value)) return 'Regional settings are missing.';
  if (value.currency !== 'BDT' || value.timezone !== 'Asia/Dhaka')
    return 'The UI preview supports BDT and Asia/Dhaka only.';
  const choices: Record<string, readonly string[]> = {
    symbol: ['৳', 'BDT'], grouping: ['Bangladesh', 'International'], digits: ['English', 'Bangla'],
    dateFormat: ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD'],
    timeFormat: ['12-hour', '24-hour'], negativeFormat: ['Minus', 'Parentheses']
  };
  for (const [key, options] of Object.entries(choices))
    if (!oneOf(value[key], options)) return 'Choose a valid ' + key + '.';
  return null;
}
export function validateTax(value: unknown): string | null {
  if (!isObject(value)) return 'Tax settings are missing.';
  if (typeof value.enabled !== 'boolean' || typeof value.showOnInvoice !== 'boolean' ||
    !oneOf(value.pricing, ['Exclusive', 'Inclusive'])) return 'Choose a valid VAT mode.';
  if (typeof value.registrationBin !== 'string' ||
    (value.registrationBin && !/^[A-Za-z0-9 -]{3,40}$/.test(value.registrationBin)))
    return 'Enter a valid tax registration reference (3–40 letters, numbers, spaces or hyphens).';
  if (!Array.isArray(value.rates) || value.rates.length < 1 || value.rates.length > 12)
    return 'Keep 1–12 VAT rates.';
  const rates = value.rates as unknown[];
  if (rates.some(rate => !isObject(rate) || typeof rate.id !== 'string' ||
    !/^[a-z0-9-]{1,50}$/.test(rate.id) || typeof rate.label !== 'string' ||
    !rate.label.trim() || rate.label.length > 80 ||
    typeof rate.active !== 'boolean' || typeof rate.percentage !== 'number' ||
    !Number.isFinite(rate.percentage) || rate.percentage < 0 || rate.percentage > 100 ||
    Math.round(rate.percentage * 10000) !== rate.percentage * 10000))
    return 'Each VAT rate needs a name and a percentage from 0 to 100 (up to four decimals).';
  const typed = rates as VatRate[];
  if (new Set(typed.map(r => r.id)).size !== typed.length ||
      new Set(typed.map(r => r.label.trim().toLowerCase())).size !== typed.length)
    return 'VAT rate names and IDs must be unique.';
  if (typeof value.defaultRateId !== 'string' ||
      !typed.some(rate => rate.id === value.defaultRateId && rate.active))
    return 'Choose an active default VAT rate.';
  return null;
}
export function validateNumbering(value: unknown): string | null {
  if (!isObject(value) || Object.keys(value).length !== documentKinds.length)
    return 'Document numbering rules are incomplete.';
  const prefixes: string[] = [];
  for (const kind of documentKinds) {
    const rule = value[kind];
    if (!isObject(rule) || typeof rule.prefix !== 'string' ||
      !/^[A-Z][A-Z0-9-]{0,11}$/.test(rule.prefix) || rule.prefix.endsWith('-'))
      return 'Use an uppercase prefix (1–12 letters, numbers or hyphens).';
    if (!Number.isInteger(rule.digits) || (rule.digits as number) < 3 || (rule.digits as number) > 10)
      return 'Sequence digits must be 3–10.';
    if (!Number.isSafeInteger(rule.nextNumber) || (rule.nextNumber as number) < 1 || (rule.nextNumber as number) > 999999999)
      return 'Next sequence must be a whole number from 1 to 999999999.';
    if (!oneOf(rule.year, ['None', 'Calendar year'])) return 'Choose a valid year format.';
    prefixes.push(rule.prefix);
  }
  if (new Set(prefixes).size !== prefixes.length) return 'Use a distinct prefix for each document type.';
  return null;
}
export function previewDocumentNumber(rule: DocumentNumberRule, year = 2026): string {
  const prefix = rule.prefix + (rule.year === 'Calendar year' ? '-' + year : '');
  return prefix + '-' + String(rule.nextNumber).padStart(rule.digits, '0');
}
export function regionalMoney(amount: number, config: RegionalPreferences): string {
  const formatted = Math.abs(amount).toLocaleString(
    config.grouping === 'Bangladesh' ? 'en-IN' : 'en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );
  const digits = config.digits === 'Bangla' ? formatted.replace(/[0-9]/g, digit => '০১২৩৪৫৬৭৮৯'[Number(digit)]) : formatted;
  const text = (config.symbol === 'BDT' ? 'BDT ' : '৳') + digits;
  return amount < 0 ? (config.negativeFormat === 'Parentheses' ? '(' + text + ')' : '−' + text) : text;
}
export function regionalDate(date: Date, config: RegionalPreferences): string {
  const d = String(date.getUTCDate()).padStart(2, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = String(date.getUTCFullYear());
  const result = config.dateFormat === 'YYYY-MM-DD' ? y + '-' + m + '-' + d :
    config.dateFormat === 'DD-MM-YYYY' ? d + '-' + m + '-' + y : d + '/' + m + '/' + y;
  return config.digits === 'Bangla' ? result.replace(/[0-9]/g, digit => '০১২৩৪৫৬৭৮৯'[Number(digit)]) : result;
}
/** Illustrative calculation only; no invoice, tax ledger or NBR posting occurs here. */
export function previewVat(amount: number, percentage: number, pricing: TaxPreferences['pricing']) {
  const grossPaisa = Math.round(amount * 100);
  if (pricing === 'Inclusive') {
    const basePaisa = Math.round(grossPaisa / (1 + percentage / 100));
    return { base: basePaisa / 100, tax: (grossPaisa - basePaisa) / 100, total: grossPaisa / 100 };
  }
  const taxPaisa = Math.round(grossPaisa * percentage / 100);
  return { base: grossPaisa / 100, tax: taxPaisa / 100, total: (grossPaisa + taxPaisa) / 100 };
}
