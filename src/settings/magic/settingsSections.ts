import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Bell,
  BookOpen,
  Building2,
  MonitorSmartphone,
  WifiOff,
  CreditCard,
  Database,
  LifeBuoy,
  Package,
  Palette,
  Printer,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Users,
  Wallet,
} from 'lucide-react';

export type SettingsSectionId =
  | 'business'
  | 'names'
  | 'sales'
  | 'products'
  | 'purchases'
  | 'invoices'
  | 'finance'
  | 'notifications'
  | 'interface'
  | 'team'
  | 'data'
  | 'sessions'
  | 'activity'
  | 'offline'
  | 'support'
  | 'subscription'
  | 'personal'
  | 'security';

export type SettingsGroup = 'Business' | 'Workspace' | 'You';

export type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  bn: string;
  icon: LucideIcon;
  desc: string;
  group: SettingsGroup;
  /** business = owner edits, others view; personal = each user; everyone = handled inside the screen */
  scope: 'business' | 'personal' | 'everyone';
  nested?: boolean;
};

export const settingsGroups: SettingsGroup[] = ['Business', 'Workspace', 'You'];

export const settingsSections: SettingsSection[] = [
  { id: 'business', label: 'Business profile', bn: 'ব্যবসার পরিচিতি', icon: Building2, desc: 'Name, phone and address used on invoices.', group: 'Business', scope: 'business' },
  { id: 'names', label: 'Names & Khata', bn: 'নাম ও খাতা', icon: BookOpen, desc: 'Call money words what your customers call them, and order the ledger columns.', group: 'Business', scope: 'business' },
  { id: 'sales', label: 'Sales & POS', bn: 'বিক্রি ও পিওএস', icon: ShoppingCart, desc: 'Checkout defaults and sale policy.', group: 'Business', scope: 'business' },
  { id: 'products', label: 'Products & stock', bn: 'পণ্য ও স্টক', icon: Package, desc: 'Stock alerts and serial tracking defaults.', group: 'Business', scope: 'business' },
  { id: 'purchases', label: 'Purchases', bn: 'ক্রয়', icon: ReceiptText, desc: 'Supplier receipts and purchase payment defaults.', group: 'Business', scope: 'business' },
  { id: 'invoices', label: 'Invoices & printing', bn: 'বিল ও প্রিন্ট', icon: Printer, desc: 'Invoice numbering and printing defaults.', group: 'Business', scope: 'business' },
  { id: 'finance', label: 'Money & accounts', bn: 'টাকা ও হিসাব', icon: Wallet, desc: 'Where cash, bank and mobile money go by default, and when old entries lock.', group: 'Business', scope: 'business' },
  { id: 'notifications', label: 'Notifications & SMS', bn: 'বার্তা ও এসএমএস', icon: Bell, desc: 'Customer messages and sender name.', group: 'Business', scope: 'business' },
  { id: 'interface', label: 'Interface & workflows', bn: 'ইন্টারফেস ও কাজের ধারা', icon: SlidersHorizontal, desc: 'Columns, details, record links and quick actions per module.', group: 'Workspace', scope: 'everyone' },
  { id: 'team', label: 'Users & roles', bn: 'ব্যবহারকারী ও ভূমিকা', icon: Users, desc: 'Team members, roles and what each role can see.', group: 'Workspace', scope: 'business' },
  { id: 'sessions', label: 'Logged-in devices', bn: 'লগইন করা ডিভাইস', icon: MonitorSmartphone, desc: 'See who is signed in where, and sign out or pause anyone.', group: 'Workspace', scope: 'business', nested: true },
  { id: 'activity', label: 'Staff activity', bn: 'কর্মীদের কাজের লগ', icon: Activity, desc: 'Plain-language log of sales, discounts, deletes and sign-ins.', group: 'Workspace', scope: 'business', nested: true },
  { id: 'data', label: 'Data & backup', bn: 'ডেটা ও ব্যাকআপ', icon: Database, desc: 'Download a backup, restore it, or import data.', group: 'Workspace', scope: 'business' },
  { id: 'offline', label: 'Offline selling', bn: 'অফলাইন বিক্রি', icon: WifiOff, desc: 'Choose the one device that can keep selling without internet.', group: 'Workspace', scope: 'business' },
  { id: 'support', label: 'Support & changes', bn: 'সাপোর্ট', icon: LifeBuoy, desc: 'Approve support setting changes and see recent changes.', group: 'Workspace', scope: 'everyone' },
  { id: 'subscription', label: 'Plan & billing', bn: 'প্ল্যান ও বিল', icon: CreditCard, desc: 'Compare plans and what each one includes.', group: 'Workspace', scope: 'business' },
  { id: 'personal', label: 'Appearance', bn: 'থিম ও পছন্দ', icon: Palette, desc: 'Language and date display. Saves automatically for you.', group: 'You', scope: 'personal' },
  { id: 'security', label: 'Account & security', bn: 'অ্যাকাউন্ট ও নিরাপত্তা', icon: ShieldCheck, desc: 'Screen lock, trusted devices and PIN option.', group: 'You', scope: 'business' },
];

