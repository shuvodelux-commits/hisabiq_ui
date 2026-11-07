import type { SettingsSectionId } from './settingsSections';

export type SetupTaskId = 'profile' | 'contact' | 'receipt' | 'staff' | 'payment' | 'stock' | 'sms' | 'offline' | 'security';

export type SetupTask = {
  id: SetupTaskId;
  title: string;
  bn: string;
  helper: string;
  minutes: number;
  section: SettingsSectionId;
};

/** Goal-style setup tasks shown on the Settings home. Done/not-done is worked out from live settings. */
export const setupTasks: SetupTask[] = [
  { id: 'profile', title: 'Add your shop name & logo', bn: 'দোকানের নাম ও লোগো', helper: 'Printed on every receipt and invoice.', minutes: 1, section: 'business' },
  { id: 'contact', title: 'Add phone & address', bn: 'ফোন ও ঠিকানা', helper: 'Customers see it on the receipt.', minutes: 1, section: 'business' },
  { id: 'receipt', title: 'Choose how receipts look', bn: 'রসিদের ডিজাইন', helper: 'Design, paper size and Bangla or English.', minutes: 2, section: 'invoices' },
  { id: 'payment', title: 'Set how you take money', bn: 'টাকা নেওয়ার মাধ্যম', helper: 'Cash, bKash, Nagad or bank first.', minutes: 1, section: 'sales' },
  { id: 'stock', title: 'Set when to warn for low stock', bn: 'কম স্টকের সতর্কতা', helper: 'You’ll get a red badge in Products.', minutes: 1, section: 'products' },
  { id: 'staff', title: 'Add your staff', bn: 'কর্মী যোগ করুন', helper: 'Give each cashier their own login.', minutes: 2, section: 'team' },
  { id: 'security', title: 'Turn on the 6-digit PIN', bn: 'পিন চালু করুন', helper: 'Quick unlock on shared counters.', minutes: 1, section: 'security' },
  { id: 'sms', title: 'Send SMS receipts & due reminders', bn: 'এসএমএস রসিদ', helper: 'Customers get a message after each sale.', minutes: 2, section: 'notifications' },
  { id: 'offline', title: 'Pick your offline selling device', bn: 'অফলাইন ডিভাইস', helper: 'Keep selling when the internet drops.', minutes: 1, section: 'offline' },
];

export type SettingsSearchEntry = { label: string; section: SettingsSectionId; keywords: string };

/** Goal and bilingual search terms that jump to a section. */
export const settingsSearchIndex: SettingsSearchEntry[] = [
  { label: 'Shop name', section: 'business', keywords: 'shop name business দোকান নাম ব্যবসা' },
  { label: 'Logo', section: 'business', keywords: 'logo brand লোগো' },
  { label: 'Phone & address', section: 'business', keywords: 'phone address contact ফোন ঠিকানা' },
  { label: 'Receipt design', section: 'invoices', keywords: 'receipt invoice print design memo রসিদ চালান প্রিন্ট মেমো' },
  { label: 'Bangla invoice', section: 'invoices', keywords: 'bangla bengali language বাংলা ভাষা' },
  { label: 'Invoice number', section: 'invoices', keywords: 'invoice number prefix numbering নম্বর' },
  { label: 'Paper size (80mm, A4)', section: 'invoices', keywords: 'paper 80mm 58mm a4 pad কাগজ' },
  { label: 'VAT & tax', section: 'business', keywords: 'vat tax bin ভ্যাট কর' },
  { label: 'Default payment', section: 'sales', keywords: 'payment cash bkash nagad bank পেমেন্ট নগদ বিকাশ' },
  { label: 'Sell when stock is zero', section: 'sales', keywords: 'negative stock shortage zero স্টক শূন্য' },
  { label: 'Due / baki name', section: 'names', keywords: 'due baki credit joma advance khata ledger বাকি জমা খাতা' },
  { label: 'Discount limit', section: 'sales', keywords: 'discount limit price change ছাড়' },
  { label: 'Returns', section: 'sales', keywords: 'return refund exchange ফেরত' },
  { label: 'Cash, bank & bKash accounts', section: 'finance', keywords: 'account cash bank bkash nagad drawer হিসাব নগদ ব্যাংক' },
  { label: 'Lock old entries', section: 'finance', keywords: 'lock date close month লক' },
  { label: 'Expiry dates', section: 'products', keywords: 'expiry fefo pharmacy মেয়াদ' },
  { label: 'Low stock warning', section: 'products', keywords: 'low stock alert warning কম স্টক সতর্কতা' },
  { label: 'Serial numbers', section: 'products', keywords: 'serial imei warranty সিরিয়াল' },
  { label: 'Supplier receipt photo', section: 'purchases', keywords: 'purchase supplier memo photo ক্রয় সাপ্লায়ার' },
  { label: 'Staff & roles', section: 'team', keywords: 'staff user role cashier permission কর্মী ভূমিকা' },
  { label: 'Logged-in devices', section: 'sessions', keywords: 'device session login sign out ডিভাইস লগইন' },
  { label: 'Staff activity', section: 'activity', keywords: 'activity log audit history কাজ লগ' },
  { label: 'Offline selling', section: 'offline', keywords: 'offline internet sync অফলাইন ইন্টারনেট সিঙ্ক' },
  { label: 'Backup & restore', section: 'data', keywords: 'backup restore import export ব্যাকআপ' },
  { label: 'SMS', section: 'notifications', keywords: 'sms message reminder notification এসএমএস বার্তা' },
  { label: 'Password & PIN', section: 'security', keywords: 'password pin lock security পাসওয়ার্ড পিন নিরাপত্তা' },
  { label: 'Language & date', section: 'personal', keywords: 'language date theme ভাষা তারিখ' },
  { label: 'Plan & billing', section: 'subscription', keywords: 'plan billing premium upgrade প্ল্যান' },
];

export const popularSearches = ['Receipt design', 'Logo', 'Staff & roles', 'Low stock warning', 'Offline selling', 'Password & PIN'];
