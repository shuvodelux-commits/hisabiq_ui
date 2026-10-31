import {sectionNames} from '../settings/fields.ts';
import type {LucideIcon} from 'lucide-react';
import {LayoutDashboard,ShoppingCart,HandCoins,FileText,ReceiptText,Store,Package,Users,Wallet,Landmark,BookOpen,ShieldCheck,PieChart,Settings} from 'lucide-react';

export type ErpNavChild={id:string;label:string;bn?:string;path:string;feature?:string;permission?:string};
export type ErpNavGroup={id:string;label:string;bn?:string;icon:LucideIcon;landingPath:string;children?:readonly ErpNavChild[];permission?:string};

/** Current App.tsx paths, not replacements. Child query values select existing in-module views. */
export const erpNavigation:readonly ErpNavGroup[]=[
 {id:'dashboard',label:'Dashboard',bn:'ড্যাশবোর্ড',icon:LayoutDashboard,landingPath:'/app/dashboard'},
 {id:'pos',label:'POS / New Sale',bn:'নতুন বিক্রি',icon:ShoppingCart,landingPath:'/app/pos'},
 {id:'counter',label:'Counter',bn:'কাউন্টার',icon:HandCoins,landingPath:'/app/counter'},
 {id:'sales',label:'Sales',bn:'বিক্রয়',icon:FileText,landingPath:'/app/sales',children:[
  {id:'sales-history',label:'Sales History',bn:'বিক্রয় তালিকা',path:'/app/sales'},
  {id:'sales-return',label:'Sales Returns',bn:'বিক্রয় ফেরত',path:'/app/sales?tab=return'},
  {id:'sales-return-history',label:'Return history',bn:'ফেরতের ইতিহাস',path:'/app/sales?tab=returns'},
  {id:'sales-credits',label:'Customer credit',bn:'ক্রেতার অগ্রিম',path:'/app/sales?tab=credits'},
  {id:'sales-drafts',label:'Drafts & templates',bn:'খসড়া ও নমুনা',path:'/app/sales?tab=drafts'},
  {id:'quotations',label:'Quotations & Estimates',bn:'মূল্য প্রস্তাব',path:'/app/quotations',feature:'quotations'},
  {id:'online-sales',label:'Online Sales & Orders',bn:'অনলাইন অর্ডার',path:'/app/online-sales',feature:'online-sales'}
 ]},
 {id:'purchases',label:'Purchases',bn:'ক্রয়',icon:ReceiptText,landingPath:'/app/purchases',children:[
  {id:'purchase-bills',label:'Purchase Bills',bn:'ক্রয় বিল',path:'/app/purchases'},
  {id:'purchase-returns',label:'Purchase Returns',bn:'ক্রয় ফেরত',path:'/app/purchases?tab=return'},
  {id:'purchase-return-history',label:'Return history',bn:'ফেরতের ইতিহাস',path:'/app/purchases?tab=return-history'}
 ]},
 {id:'vendor',label:'Vendor',bn:'ভেন্ডর লেনদেন',icon:Store,landingPath:'/app/vendors'},
 {id:'products',label:'Products & Stock',bn:'পণ্য ও মজুত',icon:Package,landingPath:'/app/products',children:[
  {id:'product-list',label:'Product List',bn:'পণ্যের তালিকা',path:'/app/products'},
  {id:'stock',label:'Stock lots',bn:'স্টক লট',path:'/app/products?view=lots'},
  {id:'stock-history',label:'Stock history',bn:'স্টক হিস্ট্রি',path:'/app/products?view=history'},
  {id:'product-settings',label:'Product Settings',bn:'পণ্যের সেটিংস',path:'/app/products?view=settings'}
 ]},
 {id:'parties',label:'Parties & Ledger',bn:'পার্টি ও খাতা',icon:Users,landingPath:'/app/parties',children:[
  {id:'all-parties',label:'All Parties',bn:'সকল পার্টি',path:'/app/parties'},
  {id:'customers',label:'Customers',bn:'ক্রেতা',path:'/app/parties?role=Customer'},
  {id:'suppliers',label:'Suppliers',bn:'সরবরাহকারী',path:'/app/parties?role=Supplier'},
  {id:'vendors',label:'Vendors',bn:'ভেন্ডর',path:'/app/parties?role=Vendor'},
  {id:'lenders',label:'Lenders',bn:'ঋণদাতা',path:'/app/parties?role=Lender'},
  {id:'borrowers',label:'Borrowers',bn:'ঋণগ্রহীতা',path:'/app/parties?role=Borrower'},
  {id:'payees',label:'Payees',bn:'প্রাপক',path:'/app/parties?role=Payee'},
  {id:'owners',label:'Owners',bn:'মালিক',path:'/app/parties?role=Owner'}
 ]},
 {id:'expenses',label:'Expenses',bn:'খরচ',icon:Wallet,landingPath:'/app/expenses'},
 {id:'finance',label:'Finance',bn:'টাকা-পয়সা',icon:Landmark,landingPath:'/app/finance',children:[
  {id:'cash',label:'Overview',bn:'সারাংশ',path:'/app/finance'},
  {id:'money-accounts',label:'Money Accounts',bn:'টাকার হিসাব',path:'/app/finance?tab=accounts'},
  {id:'finance-counter',label:'Counter',bn:'কাউন্টার',path:'/app/finance?tab=counter'},
  {id:'finance-people',label:'Loans & Owners',bn:'ঋণ ও মালিক',path:'/app/finance?tab=transactions'},
  {id:'cheques',label:'Cheques',bn:'চেক',path:'/app/finance?tab=cheques'},
  {id:'cash-sessions',label:'Cash Sessions',bn:'ক্যাশ সেশন',path:'/app/finance?tab=cash'}
 ]},
 {id:'accounts',label:'Accounts',bn:'হিসাব',icon:BookOpen,landingPath:'/app/accounts',children:[
  {id:'accounts-overview',label:'Accounts & Vouchers',bn:'হিসাব ও ভাউচার',path:'/app/accounts'},
  {id:'daybook',label:'Daybook',bn:'দৈনিক লেনদেন',path:'/app/daybook'},
  {id:'reconciliation',label:'Reconciliation',bn:'হিসাব মিলানো',path:'/app/reconciliation'},
  {id:'audit',label:'Audit Ledger',bn:'অডিট খাতা',path:'/app/audit-ledger',permission:'money'}
 ]},
 {id:'warranty',label:'Warranty',bn:'ওয়ারেন্টি',icon:ShieldCheck,landingPath:'/app/warranty'},
 {id:'reports',label:'Reports',bn:'রিপোর্ট',icon:PieChart,landingPath:'/app/reports'},
 {id:'settings',label:'Settings',bn:'সেটিংস',icon:Settings,landingPath:'/app/settings/interface',children:[
  // Reuse the Settings directory/tab source so new sections keep the same order.
  ...Object.entries(sectionNames).map(([section,item]):ErpNavChild=>({
   id:({business:'general',team:'users',personal:'appearance',security:'security',data:'data'} as Record<string,string>)[section]??`settings-${section}`,
   label:item.label,bn:item.bn,path:`/app/settings/${section}`,
   permission:({team:'team',data:'export',money:'money'} as Record<string,string>)[section]
  })),
  {id:'notifications',label:'Notifications & SMS',bn:'এসএমএস ও বার্তা',path:'/app/notifications',feature:'notifications',permission:'notifications'},
  {id:'subscription',label:'Subscription & Billing',bn:'সাবস্ক্রিপশন',path:'/app/subscription',permission:'owner'}
 ]}
];
/** Verified in App.tsx of the source branch. Query-driven children share these same route paths. */
export const erpRoutePaths=new Set([
 '/app/dashboard','/app/pos','/app/counter','/app/sales','/app/quotations','/app/online-sales',
 '/app/purchases','/app/purchases/new','/app/vendors','/app/products','/app/parties','/app/expenses',
 '/app/finance','/app/accounts','/app/daybook','/app/reconciliation','/app/audit-ledger',
 '/app/warranty','/app/reports','/app/settings/business','/app/settings/team',
 '/app/settings/data','/app/settings/personal','/app/settings/security','/app/notifications','/app/subscription',
 ...Object.keys(sectionNames).map(section=>`/app/settings/${section}`),
 '/app/support'
]);
export const erpFeatureIds=new Set(['quotations','online-sales','notifications']);
