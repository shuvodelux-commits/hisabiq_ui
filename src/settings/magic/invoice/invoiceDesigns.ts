export type InvoiceDesignId = 'standard' | 'classic' | 'compact' | 'modern' | 'elegant' | 'bold';
export type PaperSize = 'a4' | '80mm' | '58mm' | 'pad';

export type InvoiceDesign = { id: InvoiceDesignId; name: string; bn: string; description: string; premium: boolean; papers: PaperSize[] };

export const invoiceDesigns: InvoiceDesign[] = [
  { id: 'standard', name: 'Standard', bn: 'সাধারণ', description: 'Clean ledger layout with teal accents. Works for every shop.', premium: false, papers: ['a4', '80mm', '58mm', 'pad'] },
  { id: 'classic', name: 'Classic', bn: 'ক্লাসিক', description: 'Boxed header and bordered table, like a traditional cash memo.', premium: true, papers: ['a4', 'pad'] },
  { id: 'compact', name: 'Compact', bn: 'কমপ্যাক্ট', description: 'Dense rows for long bills. Best on thermal printers.', premium: true, papers: ['a4', '80mm', '58mm', 'pad'] },
  { id: 'modern', name: 'Modern', bn: 'মডার্ন', description: 'Brand stripe, large total panel and generous white space.', premium: true, papers: ['a4', 'pad'] },
  { id: 'elegant', name: 'Elegant', bn: 'এলিগ্যান্ট', description: 'Serif headings, centered logo and thin rules.', premium: true, papers: ['a4', 'pad'] },
  { id: 'bold', name: 'Bold', bn: 'বোল্ড', description: 'Solid color header band and a high-contrast total for retail counters.', premium: true, papers: ['a4', '80mm', 'pad'] },
];

export const paperOptions: { id: PaperSize; label: string; helper: string; premium: boolean }[] = [
  { id: 'a4', label: 'A4 page', helper: 'Office printer', premium: false },
  { id: '80mm', label: '80mm roll', helper: 'Thermal receipt printer', premium: false },
  { id: '58mm', label: '58mm roll', helper: 'Small thermal printer', premium: false },
  { id: 'pad', label: 'Business Pad', helper: 'Pre-printed letterhead (A4)', premium: true },
];

export const brandColors = [
  { id: 'teal', label: 'HisabIQ teal', hex: '#0d7c74' },
  { id: 'ink', label: 'Ink', hex: '#0b1a2c' },
  { id: 'blue', label: 'Royal blue', hex: '#1d4ed8' },
  { id: 'green', label: 'Bottle green', hex: '#166534' },
  { id: 'maroon', label: 'Maroon', hex: '#9f1239' },
  { id: 'amber', label: 'Deep amber', hex: '#b45309' },
];

export type InvoiceContentKey =
  | 'logo' | 'businessInfo' | 'customer' | 'phone' | 'address' | 'sku' | 'discount' | 'payments' | 'due' | 'amountWords'
  | 'signatures' | 'serial' | 'warranty' | 'servedBy' | 'terms';

export const contentToggles: { key: InvoiceContentKey; label: string; bn: string }[] = [
  { key: 'logo', label: 'Shop logo', bn: 'লোগো' },
  { key: 'businessInfo', label: 'Shop phone & address', bn: 'দোকানের তথ্য' },
  { key: 'customer', label: 'Customer name', bn: 'ক্রেতার নাম' },
  { key: 'phone', label: 'Customer phone', bn: 'ক্রেতার মোবাইল' },
  { key: 'address', label: 'Customer address', bn: 'ক্রেতার ঠিকানা' },
  { key: 'sku', label: 'Product code (SKU)', bn: 'পণ্যের কোড' },
  { key: 'discount', label: 'Discount line', bn: 'ছাড়' },
  { key: 'payments', label: 'How the customer paid', bn: 'পেমেন্ট' },
  { key: 'due', label: 'Due (baki) amount', bn: 'বাকি' },
  { key: 'amountWords', label: 'Amount in words', bn: 'কথায় টাকা' },
  { key: 'signatures', label: 'Signature lines', bn: 'স্বাক্ষর' },
  { key: 'serial', label: 'Serial numbers', bn: 'সিরিয়াল' },
  { key: 'warranty', label: 'Warranty period', bn: 'ওয়ারেন্টি' },
  { key: 'servedBy', label: 'Who made the sale', bn: 'বিক্রেতা' },
  { key: 'terms', label: 'Return policy note', bn: 'শর্তাবলি' },
];
