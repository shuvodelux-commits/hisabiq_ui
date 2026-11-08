export type DocCopyKey =
  | 'invoice' | 'receipt' | 'invoiceNo' | 'date' | 'billTo' | 'item' | 'qty' | 'rate' | 'amount'
  | 'subtotal' | 'discount' | 'total' | 'paid' | 'due' | 'inWords' | 'customerSign' | 'authorizedSign'
  | 'thanks' | 'servedBy' | 'warranty' | 'serial' | 'sku' | 'terms';

/** One dictionary for every printed document. Mixed = English label with a small Bangla helper. */
export const documentCopy: Record<DocCopyKey, { en: string; bn: string }> = {
  invoice: { en: 'Invoice', bn: 'চালান' },
  receipt: { en: 'Sales receipt', bn: 'বিক্রয় রসিদ' },
  invoiceNo: { en: 'Invoice no.', bn: 'চালান নং' },
  date: { en: 'Date', bn: 'তারিখ' },
  billTo: { en: 'Bill to', bn: 'ক্রেতা' },
  item: { en: 'Item', bn: 'বিবরণ' },
  qty: { en: 'Qty', bn: 'পরিমাণ' },
  rate: { en: 'Rate', bn: 'দর' },
  amount: { en: 'Amount', bn: 'টাকা' },
  subtotal: { en: 'Subtotal', bn: 'উপমোট' },
  discount: { en: 'Discount', bn: 'ছাড়' },
  total: { en: 'Total', bn: 'মোট' },
  paid: { en: 'Paid', bn: 'পরিশোধ' },
  due: { en: 'Due', bn: 'বাকি' },
  inWords: { en: 'In words', bn: 'কথায়' },
  customerSign: { en: 'Customer signature', bn: 'ক্রেতার স্বাক্ষর' },
  authorizedSign: { en: 'Authorized signature', bn: 'বিক্রেতার স্বাক্ষর' },
  thanks: { en: 'Thank you for shopping with us', bn: 'আমাদের সাথে কেনাকাটার জন্য ধন্যবাদ' },
  servedBy: { en: 'Served by', bn: 'বিক্রেতা' },
  warranty: { en: 'Warranty', bn: 'ওয়ারেন্টি' },
  serial: { en: 'Serial', bn: 'সিরিয়াল' },
  sku: { en: 'SKU', bn: 'কোড' },
  terms: { en: 'Goods once sold are exchangeable within 7 days with this invoice.', bn: 'বিক্রিত পণ্য এই চালানসহ ৭ দিনের মধ্যে পরিবর্তনযোগ্য।' },
};

export const paymentLabels: Record<string, { en: string; bn: string }> = {
  Cash: { en: 'Cash', bn: 'নগদ' },
  bKash: { en: 'bKash', bn: 'বিকাশ' },
  Nagad: { en: 'Nagad', bn: 'নগদ (মোবাইল)' },
  Bank: { en: 'Bank', bn: 'ব্যাংক' },
  Card: { en: 'Card', bn: 'কার্ড' },
};
