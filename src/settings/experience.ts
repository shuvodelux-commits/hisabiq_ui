import type { BusinessSection } from "./model";
import type { SettingField } from "./fields";

/** Task groups replace the former Simple/Advanced visibility filter. */
export const settingTasks: Partial<
  Record<BusinessSection, { label: string; bn: string; keys: string[] }[]>
> = {
  business: [
    {
      label: "Shop details",
      bn: "দোকানের তথ্য",
      keys: ["name", "nameBn", "phone", "email", "address", "logo"],
    },
    {
      label: "Registration & reporting",
      bn: "নিবন্ধন ও রিপোর্ট",
      keys: ["website", "registration", "financialYear"],
    },
  ],
  sales: [
    {
      label: "At checkout",
      bn: "বিক্রির সময়",
      keys: ["barcode", "customerPhone", "guardian", "address"],
    },
    {
      label: "Payment & totals",
      bn: "টাকা ও মোট বিল",
      keys: ["defaultPayment", "rounding"],
    },
    {
      label: "Prices & returns",
      bn: "দাম, ছাড় ও ফেরত",
      keys: ["shortage", "priceOverride", "discountLimit", "returnDays"],
    },
  ],
  products: [
    {
      label: "Stock & units",
      bn: "স্টক ও একক",
      keys: [
        "lowStock",
        "defaultUnit",
        "priceEntry",
        "openingUnit",
        "minimumUnit",
        "allocation",
      ],
    },
    {
      label: "Serial, warranty & expiry",
      bn: "সিরিয়াল, ওয়ারেন্টি ও মেয়াদ",
      keys: ["serial", "warranty", "warrantyMonths", "expiry", "expiryDays"],
    },
  ],
  purchases: [
    {
      label: "Purchase bills",
      bn: "পণ্য কেনার বিল",
      keys: ["memo", "attachments", "defaultAccount"],
    },
    {
      label: "Dates & costs",
      bn: "তারিখ ও খরচ",
      keys: ["approval", "backdateDays", "costAllocation"],
    },
  ],
  money: [
    {
      label: "Payment accounts",
      bn: "টাকা দেওয়ার হিসাব",
      keys: ["defaultCash", "defaultBank", "defaultMobile"],
    },
    {
      label: "Cash & corrections",
      bn: "ক্যাশ ও হিসাব সংশোধন",
      keys: ["cashSession", "closeCount", "lockDate", "adjustment"],
    },
  ],
  invoices: [
    {
      label: "Numbering & copies",
      bn: "বিল নম্বর ও কপি",
      keys: ["prefix", "copies", "showPurchaseCost"],
    },
  ],
  notifications: [
    {
      label: "Notify me about",
      bn: "কিসের খবর পাবেন",
      keys: ["lowStock", "expiry", "dues"],
    },
    {
      label: "Delivery & timing",
      bn: "মাধ্যম ও সময়",
      keys: [
        "channel",
        "recipients",
        "time",
        "expiryDays",
        "dueDays",
        "smsTemplate",
      ],
    },
  ],
};

export function taskFields(section: BusinessSection, fields: SettingField[]) {
  return (settingTasks[section] ?? []).map((task) => ({
    ...task,
    fields: task.keys.flatMap((key) =>
      fields.filter((field) => field.key === key),
    ),
  }));
}

// Keep dependent values in the draft while their parent switch is off.
export function fieldDependency(section: string, key: string) {
  return section === "products"
    ? (
        { warrantyMonths: "warranty", expiryDays: "expiry" } as Record<
          string,
          string
        >
      )[key]
    : undefined;
}

const optionBangla: Record<string, string> = {
  "January–December": "জানুয়ারি–ডিসেম্বর",
  "July–June": "জুলাই–জুন",
  Cash: "ক্যাশ",
  Bank: "ব্যাংক",
  bKash: "বিকাশ",
  Nagad: "নগদ",
  "Nearest ৳5": "কাছের ৫ টাকা",
  "Nearest ৳1": "কাছের ১ টাকা",
  "No rounding": "যেমন আছে",
  "Ask every time": "প্রতিবার জিজ্ঞেস করুন",
  "Own stock": "নিজের স্টক",
  "Owner only": "শুধু মালিক",
  "Authorized employee": "অনুমতিপ্রাপ্ত কর্মী",
  "Selected unit": "বাছাই করা একক",
  "Base unit": "মূল একক",
  "Stock view unit": "স্টক দেখার একক",
  FIFO: "আগে আসা পণ্য আগে",
  FEFO: "মেয়াদ আগে শেষ হবে যেটির",
  Off: "বন্ধ",
  Optional: "ইচ্ছামতো",
  Required: "অবশ্যই",
  "By value": "পণ্যের দাম অনুযায়ী",
  "By quantity": "পণ্যের পরিমাণ অনুযায়ী",
  "Cash counter": "ক্যাশ কাউন্টার",
  "In-app only": "শুধু অ্যাপে",
  "In-app + SMS": "অ্যাপ ও এসএমএস",
  Compact: "কমপ্যাক্ট",
  Comfortable: "একটু ফাঁকা",
  Light: "হালকা",
  Dark: "গাঢ়",
  System: "ডিভাইস অনুযায়ী",
  "English + Bangla": "ইংরেজি ও বাংলা",
  English: "ইংরেজি",
  Bangla: "বাংলা",
};
export function settingOption(value: string, language: string) {
  return language === "Bangla" ? (optionBangla[value] ?? value) : value;
}

export const fieldHelpBangla: Record<string, string> = {
  "business.name": "বিলে দোকানের এই নাম দেখাবে।",
  "business.nameBn": "দোকানের বাংলা নাম।",
  "business.logo": "PNG, JPEG বা WebP ছবি দিন, সর্বোচ্চ ২৫০ KB।",
  "business.phone": "ক্রেতারা এই নম্বরে যোগাযোগ করবেন।",
  "business.email": "ইমেইল থাকলে দিন।",
  "business.address": "বিলে এই ঠিকানা দেখাবে।",
  "business.website": "ওয়েবসাইট থাকলে https:// দিয়ে লিখুন।",
  "business.financialYear":
    "রিপোর্টের বছরের নমুনা নিয়ম। পুরোনো তারিখ বদলাবে না।",
  "business.registration": "নিবন্ধন নম্বর থাকলে দিন।",
  "sales.barcode": "বারকোড ব্যবহারের নমুনা পছন্দ।",
  "sales.customerPhone": "বিক্রির ফর্মে ফোন রাখার নমুনা।",
  "sales.guardian": "বিক্রির ফর্মে অভিভাবকের নাম রাখার নমুনা।",
  "sales.address": "বিক্রির ফর্মে ঠিকানা রাখার নমুনা।",
  "sales.defaultPayment":
    "নতুন বিক্রিতে প্রথমে এই মাধ্যম থাকবে। পরে অন্য মাধ্যমও যোগ করা যাবে।",
  "sales.rounding":
    "বিক্রির মোট টাকা এই নিয়মে পূর্ণ হবে। পণ্যের পরিমাণ বদলাবে না।",
  "sales.shortage": "স্টক কম থাকলে কী করবেন তার নমুনা পছন্দ।",
  "sales.priceOverride": "দাম বদলানোর অনুমতির নমুনা নিয়ম।",
  "sales.discountLimit": "০ থেকে ১০০ শতাংশ। নমুনা নিয়ম, এখনও প্রয়োগ হয় না।",
  "sales.returnDays": "বিক্রির কত দিনের মধ্যে ফেরত নেওয়া যাবে তার নমুনা।",
  "products.lowStock":
    "কম স্টকের সতর্কতার নমুনা। প্রতিটি পণ্যে আলাদা সীমা থাকবে।",
  "products.defaultUnit":
    "নতুন পণ্যে প্রথমে এই একক থাকবে। বাক্সে কত পিস তা প্রতিটি পণ্যে দিন।",
  "products.priceEntry": "যে এককে দাম লিখবেন। এককের হিসাব আগের নিয়মে হবে।",
  "products.openingUnit": "নতুন পণ্যের শুরুর স্টক লেখার একক।",
  "products.minimumUnit": "নতুন পণ্যে কম স্টকের সীমা লেখার একক।",
  "products.allocation":
    "আগে আসা পণ্য, অথবা আগে মেয়াদ শেষ হবে এমন পণ্য আগে বাছুন। নতুন পণ্যে প্রযোজ্য।",
  "products.serial": "চালু করলে প্রতিটি পণ্যের আলাদা সিরিয়াল লাগতে পারে।",
  "products.warranty": "নতুন পণ্যের ফর্মে ওয়ারেন্টি চালু থাকবে।",
  "products.warrantyMonths":
    "নতুন পণ্যের ওয়ারেন্টির মাস। পুরোনো বিক্রির ওয়ারেন্টি বদলাবে না।",
  "products.expiry": "নতুন পণ্যের ফর্মে মেয়াদ লেখা চালু থাকবে।",
  "products.expiryDays": "মেয়াদ শেষের কত দিন আগে সতর্ক করবে।",
  "purchases.memo": "সরবরাহকারীর মেমো নম্বর রাখার নমুনা।",
  "purchases.attachments": "ক্রয়ের রসিদ সংযুক্ত করার নমুনা পছন্দ।",
  "purchases.defaultAccount": "ক্রয়ের টাকা দেওয়ার হিসাবের নমুনা পছন্দ।",
  "purchases.approval":
    "অনুমোদনের নমুনা নিয়ম। এই প্রিভিউতে অনুমোদনের অপেক্ষায় বিল রাখা হয় না।",
  "purchases.backdateDays": "আগের তারিখে বিল লেখার নমুনা সীমা।",
  "purchases.costAllocation":
    "পরিবহনসহ অতিরিক্ত খরচ পণ্যে ভাগ করার নমুনা নিয়ম।",
  "money.defaultCash": "ক্যাশ হিসাবের নমুনা পছন্দ।",
  "money.defaultBank": "ব্যাংক হিসাবের নমুনা পছন্দ।",
  "money.defaultMobile": "মোবাইল ব্যাংকিং হিসাবের নমুনা পছন্দ।",
  "money.cashSession": "ক্যাশ খোলা ও বন্ধের control দেখাবে।",
  "money.closeCount": "ক্যাশ বন্ধে টাকা গোনার নমুনা নিয়ম।",
  "money.lockDate":
    "এই তারিখ পর্যন্ত লেনদেন বন্ধ রাখার নমুনা। এখানে লেনদেন বন্ধ হয় না।",
  "money.adjustment": "হিসাব সংশোধনের অনুমতির নমুনা নিয়ম।",
  "invoices.prefix": "বিল নম্বরের শুরুর নমুনা। পুরোনো বিল নম্বর বদলাবে না।",
  "invoices.copies": "এক থেকে পাঁচ কপি প্রিন্টের নমুনা পছন্দ।",
  "invoices.showPurchaseCost":
    "শুধু কর্মীর নমুনায় ক্রয়মূল্য। ক্রেতার বিলে কখনও দেখাবে না।",
  "notifications.lowStock": "কম স্টকের খবরের নমুনা।",
  "notifications.expiry": "মেয়াদ শেষ হওয়ার খবরের নমুনা।",
  "notifications.dues": "ক্রেতার বাকি টাকার খবরের নমুনা।",
  "notifications.channel":
    "এই প্রিভিউ থেকে এসএমএস যায় না। সংযুক্ত হলে এসএমএসে ক্রেডিট লাগবে।",
  "notifications.recipients": "কারা খবর পাবেন তার নমুনা নাম বা ভূমিকা।",
  "notifications.time":
    "বাংলাদেশের সময়। এই প্রিভিউতে নির্ধারিত সময়ে খবর পাঠানো হয় না।",
  "notifications.expiryDays": "মেয়াদের কত দিন আগে খবর পাবেন।",
  "notifications.dueDays": "কত দিন পরপর বাকি টাকার খবর পাবেন।",
  "notifications.smsTemplate": "নমুনা বার্তা। দেখতে কোনো ক্রেডিট লাগবে না।",
};

export const settingsErrorBangla: Record<string, string> = {
  "Business name is required.": "দোকানের নাম লিখুন।",
  "Enter a valid business email.": "সঠিক ইমেইল ঠিকানা লিখুন।",
  "Website must start with https:// or http://.":
    "ওয়েবসাইটের শুরুতে https:// বা http:// দিন।",
  "Discount must be 0–100%; return days must be a whole number.":
    "ছাড় ০–১০০% এবং ফেরতের দিন পূর্ণ সংখ্যা দিন।",
  "Use whole warning days and at least one warranty month.":
    "সতর্কতার দিন পূর্ণ সংখ্যা এবং ওয়ারেন্টি অন্তত ১ মাস দিন।",
  "Use a 1–12 character uppercase prefix and 1–5 copies.":
    "বিল নম্বরের শুরুতে ১–১২টি বড় ইংরেজি অক্ষর এবং কপি ১–৫ দিন।",
  "Enter a valid posting lock date.": "লেনদেন বন্ধের সঠিক তারিখ দিন।",
  "Choose a valid notification time.": "বিজ্ঞপ্তির সঠিক সময় দিন।",
  "You do not have permission to change this section.":
    "এই সেটিংস বদলানোর অনুমতি আপনার নেই।",
  "Settings changed in another tab. Reload this section and try again.":
    "অন্য ট্যাবে সেটিংস বদলেছে। সংরক্ষিত তথ্য আবার খুলে চেষ্টা করুন।",
  "Settings changed since you opened this form. Discard to load the latest values.":
    "অন্য ট্যাবে সেটিংস বদলেছে। বাতিল চাপলে সর্বশেষ সংরক্ষিত তথ্য আসবে।",
};
