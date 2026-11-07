// Original Magic Patterns Settings fields: artifact 238f01b4-0e3b-4eda-aac5-6d542fbf85cd.
// UI specification only; no prototype DemoStore or server save behavior.
import type { SettingsSectionId } from './settingsSections';

export type SettingField = {
  key: string;
  label: string;
  bn?: string;
  helper: string;
  kind: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  options?: string[];
  min?: number;
  max?: number;
  wide?: boolean;
  advanced?: boolean;
  seenIn?: string;
};

const payments = ['Cash', 'Bank', 'bKash', 'Nagad', 'Card'];

export const sourceSettingsFields: Partial<Record<SettingsSectionId, SettingField[]>> = {
  business: [
    { key: 'businessName', label: 'Business name', bn: 'ব্যবসার নাম', helper: 'Printed on invoices and receipts.', kind: 'text' },
    { key: 'phone', label: 'Business mobile', bn: 'মোবাইল', helper: 'Shown to customers on invoices.', kind: 'text' },
    { key: 'address', label: 'Business address', bn: 'ঠিকানা', helper: 'Shown in the invoice header.', kind: 'textarea', wide: true },
    { key: 'currency', label: 'Currency', helper: 'Bangladesh Taka (৳).', kind: 'select', options: ['BDT'] },
  ],
  names: [
    { key: 'dueLabel', label: 'What you call money owed', bn: 'বাকির নাম', helper: 'e.g. Baki, Due, Pawna. Shown in ledgers and receipts.', kind: 'select', options: ['Baki', 'Due', 'Pawna', 'Credit'], seenIn: 'Receipt · Khata' },
    { key: 'receivedLabel', label: 'What you call money received', bn: 'জমার নাম', helper: 'e.g. Joma, Paid, Received.', kind: 'select', options: ['Joma', 'Paid', 'Received'], seenIn: 'Khata · Reports' },
    { key: 'advanceLabel', label: 'What you call money paid in advance', bn: 'অগ্রিমের নাম', helper: 'e.g. Advance, Agrim.', kind: 'select', options: ['Advance', 'Agrim', 'Deposit'], seenIn: 'Khata' },
    { key: 'ledgerOrder', label: 'Khata column order', bn: 'খাতার কলাম', helper: 'How columns appear in customer and supplier ledgers.', kind: 'select', options: ['Date, Details, Sale, Joma, Baki', 'Date, Details, Joma, Sale, Baki', 'Date, Sale, Joma, Baki, Details'], advanced: true, seenIn: 'Khata · Print' },
  ],
  sales: [
    { key: 'defaultPayment', label: 'Default payment method', bn: 'পেমেন্ট মাধ্যম', helper: 'Selected first at checkout.', kind: 'select', options: payments, seenIn: 'POS' },
    { key: 'autoPrint', label: 'Open print after each sale', helper: 'Uses the browser print window.', kind: 'checkbox', seenIn: 'POS' },
    { key: 'negativeStock', label: 'Allow selling when stock is zero', helper: 'Use only if you record purchases later. Stock may show negative.', kind: 'checkbox', advanced: true, seenIn: 'POS · Products' },
    { key: 'priceOverride', label: 'Let staff change the price at checkout', helper: 'Turn off to keep everyone on the list price.', kind: 'checkbox', advanced: true, seenIn: 'POS' },
    { key: 'maxDiscount', label: 'Biggest discount staff can give (%)', bn: 'সর্বোচ্চ ছাড়', helper: 'e.g. 10 — larger discounts need the owner.', kind: 'number', min: 0, max: 100, advanced: true, seenIn: 'POS' },
    { key: 'returnDays', label: 'Accept returns within (days)', bn: 'ফেরতের সময়', helper: 'e.g. 7 days after the sale. 0 turns returns off.', kind: 'number', min: 0, max: 365, advanced: true, seenIn: 'Sales' },
  ],
  products: [
    { key: 'stockAlert', label: 'Warn me when stock drops to', bn: 'কম স্টক সতর্কতা', helper: 'e.g. 5 pcs — you’ll get a red badge in Products. Each product can change it.', kind: 'number', min: 0, max: 100000, seenIn: 'Products · Dashboard' },
    { key: 'requireSerial', label: 'Track serial numbers for new products', helper: 'Each product can still turn this off.', kind: 'checkbox', seenIn: 'Products · Receipt' },
    { key: 'expiryTracking', label: 'Track expiry dates', bn: 'মেয়াদ', helper: 'Useful for pharmacy and food. Sells the earliest expiry first.', kind: 'checkbox', advanced: true, seenIn: 'Products · POS' },
    { key: 'costMethod', label: 'How product cost is worked out', helper: 'Average is simplest. FIFO = first bought, first sold. Changes apply to new stock only.', kind: 'select', options: ['Average', 'FIFO', 'FEFO (earliest expiry first)'], advanced: true, seenIn: 'Reports · Profit' },
  ],
  purchases: [
    { key: 'purchaseReceipt', label: 'Ask for supplier receipt photo', helper: 'Reminds staff to attach the memo before saving.', kind: 'checkbox', seenIn: 'Purchases' },
    { key: 'defaultPayment', label: 'Default payment method', helper: 'Selected first when paying a supplier.', kind: 'select', options: payments, seenIn: 'Purchases' },
    { key: 'purchaseApproval', label: 'Owner approves purchases before stock goes in', helper: 'Staff can still save the bill as pending.', kind: 'checkbox', advanced: true, seenIn: 'Purchases · Stock' },
    { key: 'backdateDays', label: 'Allow backdating bills up to (days)', helper: 'e.g. 3 — older dates need the owner.', kind: 'number', min: 0, max: 90, advanced: true, seenIn: 'Purchases' },
  ],
  invoices: [
    { key: 'invoicePrefix', label: 'Invoice number prefix', bn: 'বিল নম্বরের শুরু', helper: '2–12 capital letters, numbers or hyphens. Example: INV-000241.', kind: 'text' },
    { key: 'autoPrint', label: 'Offer receipt printing', helper: 'Staff can still skip printing for any invoice.', kind: 'checkbox' },
  ],
  finance: [
    { key: 'cashAccount', label: 'Cash goes to', bn: 'নগদ', helper: 'The drawer or box where counter cash is kept.', kind: 'select', options: ['Cash drawer', 'Owner cash box'], seenIn: 'POS · Day book' },
    { key: 'mobileAccount', label: 'bKash / Nagad goes to', bn: 'মোবাইল ব্যাংকিং', helper: 'Your merchant or personal wallet.', kind: 'select', options: ['bKash Merchant', 'Nagad Merchant', 'bKash Personal'], seenIn: 'POS · Day book' },
    { key: 'bankAccount', label: 'Bank and card payments go to', bn: 'ব্যাংক', helper: 'Used for bank transfer and card sales.', kind: 'select', options: ['DBBL Current', 'City Bank', 'BRAC Bank'], seenIn: 'POS · Reconciliation' },
    { key: 'defaultPayment', label: 'Default payment method', helper: 'Used first in money in and money out forms.', kind: 'select', options: payments, seenIn: 'Money in / out' },
    { key: 'cashSession', label: 'Count the cash drawer at open and close', helper: 'Shows the difference between expected and counted cash.', kind: 'checkbox', advanced: true, seenIn: 'POS · Day book' },
    { key: 'lockDate', label: 'Lock old entries before', bn: 'পুরনো হিসাব লক', helper: 'e.g. 2026-10-31. Nobody can edit entries on or before this date. Leave empty for no lock.', kind: 'text', advanced: true, seenIn: 'All modules' },
  ],
  notifications: [
    { key: 'smsEnabled', label: 'Send SMS to customers', helper: 'Sale receipts and due reminders. No SMS is sent from this prototype.', kind: 'checkbox', seenIn: 'Customers’ phones' },
    { key: 'smsSender', label: 'Sender name', bn: 'প্রেরকের নাম', helper: 'Final sender name needs SMS provider approval.', kind: 'text' },
    { key: 'dueReminderDays', label: 'Remind customers about baki after (days)', helper: 'e.g. 7 — one reminder per invoice.', kind: 'number', min: 1, max: 90, advanced: true, seenIn: 'SMS' },
    { key: 'alertTime', label: 'Send daily low-stock alert at', helper: 'Dhaka time, 24-hour, e.g. 09:00.', kind: 'text', advanced: true, seenIn: 'Notifications' },
  ],
  personal: [
    { key: 'language', label: 'Interface language', bn: 'ভাষা', helper: 'English with Bangla helper text is recommended.', kind: 'select', options: ['English + Bangla', 'English', 'Bangla'] },
    { key: 'dateFormat', label: 'Date display', bn: 'তারিখ', helper: 'Only changes how dates look. Records are stored the same way.', kind: 'select', options: ['DD/MM/YYYY', 'YYYY-MM-DD'] },
  ],
  security: [
    { key: 'screenLock', label: 'Lock the screen when idle', helper: 'Asks for the PIN after the time below.', kind: 'checkbox' },
    { key: 'lockMinutes', label: 'Lock after (minutes)', helper: '1–180 minutes. Recommended: 30.', kind: 'number', min: 1, max: 180 },
    { key: 'trustedDays', label: 'Trust a device for (days)', helper: '1–365 days. Recommended: 90.', kind: 'number', min: 1, max: 365 },
    { key: 'pinEnabled', label: 'Allow 6-digit PIN sign-in', helper: 'Only after the device is trusted. Never enter a real PIN here.', kind: 'checkbox' },
  ],
};
