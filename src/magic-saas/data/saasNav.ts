import type { SaasPermission } from '../types/saas';

export type NavItem = { to: string; label: string; bn: string; perm: SaasPermission; icon: string };
export type NavGroup = { label: string; bn: string; items: NavItem[] };

export const saasNav: NavGroup[] = [
  {
    label: 'Customers',
    bn: 'গ্রাহক',
    items: [
      { to: '/saas/tenants', label: 'Businesses', bn: 'ব্যবসা', perm: 'tenants.view', icon: 'Building2' },
      { to: '/saas/subscriptions', label: 'Subscriptions', bn: 'সাবস্ক্রিপশন', perm: 'subscriptions.view', icon: 'RefreshCw' },
    ],
  },
  {
    label: 'Revenue',
    bn: 'আয়',
    items: [
      { to: '/saas/invoices', label: 'Invoices', bn: 'ইনভয়েস', perm: 'invoices.view', icon: 'FileText' },
      { to: '/saas/payments', label: 'Payment verification', bn: 'পেমেন্ট যাচাই', perm: 'payments.view', icon: 'BadgeCheck' },
      { to: '/saas/refunds', label: 'Refunds & adjustments', bn: 'রিফান্ড', perm: 'payments.view', icon: 'Undo2' },
    ],
  },
  {
    label: 'Catalog',
    bn: 'ক্যাটালগ',
    items: [
      { to: '/saas/plans', label: 'Plans', bn: 'প্ল্যান', perm: 'plans.view', icon: 'Layers' },
      { to: '/saas/addons', label: 'Add-ons & packages', bn: 'অ্যাড-অন', perm: 'plans.view', icon: 'PackagePlus' },
      { to: '/saas/offers', label: 'Offers', bn: 'অফার', perm: 'plans.view', icon: 'Tag' },
    ],
  },
  {
    label: 'Operations',
    bn: 'পরিচালনা',
    items: [
      { to: '/saas/tickets', label: 'Support tickets', bn: 'টিকিট', perm: 'tickets.view', icon: 'LifeBuoy' },
      { to: '/saas/support', label: 'Support access', bn: 'সাপোর্ট অনুমতি', perm: 'support.access', icon: 'KeyRound' },
      { to: '/saas/services', label: 'Services', bn: 'সার্ভিস', perm: 'services.view', icon: 'Wrench' },
      { to: '/saas/sms', label: 'SMS', bn: 'এসএমএস', perm: 'sms.view', icon: 'MessageSquareText' },
      { to: '/saas/data-requests', label: 'Data requests', bn: 'ডেটা অনুরোধ', perm: 'data.view', icon: 'DatabaseBackup' },
      { to: '/saas/knowledge', label: 'Knowledge base', bn: 'নলেজ বেস', perm: 'kb.view', icon: 'BookOpen' },
    ],
  },
  {
    label: 'Admin',
    bn: 'প্রশাসন',
    items: [
      { to: '/saas/team', label: 'Team & roles', bn: 'টিম ও রোল', perm: 'team.view', icon: 'UsersRound' },
      { to: '/saas/announcements', label: 'Announcements', bn: 'ঘোষণা', perm: 'announcements.view', icon: 'Megaphone' },
      { to: '/saas/reports', label: 'Reports', bn: 'রিপোর্ট', perm: 'reports.view', icon: 'BarChart3' },
      { to: '/saas/audit', label: 'Audit log', bn: 'অডিট', perm: 'audit.view', icon: 'History' },
      { to: '/saas/settings', label: 'Platform settings', bn: 'প্ল্যাটফর্ম সেটিংস', perm: 'settings.view', icon: 'Settings' },
    ],
  },
];
