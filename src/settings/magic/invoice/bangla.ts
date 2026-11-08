import { amountInWords } from './amountInWords';

export type DocLanguage = 'en' | 'mixed' | 'bn';

const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Replaces Latin digits with Bangla digits (০–৯); everything else is kept. */
export function toBnDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

/** Bangladesh lakh grouping: 1234567.5 → "12,34,567.50". */
export function lakhGroup(value: number, decimals = 2): string {
  const neg = value < 0;
  const [int, frac] = Math.abs(value).toFixed(decimals).split('.');
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const grouped = rest ? `${rest},${last3}` : last3;
  return `${neg ? '-' : ''}${grouped}${frac ? `.${frac}` : ''}`;
}

/** Money for printed documents in the chosen document language. */
export function docMoney(value: number, lang: DocLanguage, decimals = 2): string {
  const s = `৳ ${lakhGroup(value, decimals)}`;
  return lang === 'bn' ? toBnDigits(s) : s;
}

export function docNumber(value: string | number, lang: DocLanguage): string {
  return lang === 'bn' ? toBnDigits(value) : String(value);
}

/** "3 Nov 2026" or "৩ নভেম্বর ২০২৬". */
export function docDate(iso: string, lang: DocLanguage): string {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', day: 'numeric', month: 'numeric', year: 'numeric' }).formatToParts(new Date(iso));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const day = get('day');
  const month = get('month') - 1;
  const year = get('year');
  return lang === 'bn' ? `${toBnDigits(day)} ${bnMonths[month]} ${toBnDigits(year)}` : `${day} ${enMonths[month]} ${year}`;
}

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const under100 = (n: number) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`);
const under1000 = (n: number) => [Math.floor(n / 100) ? `${ones[Math.floor(n / 100)]} Hundred` : '', n % 100 ? under100(n % 100) : ''].filter(Boolean).join(' ');

/** English amount in words with lakh/crore: "Twelve Thousand Four Hundred Taka Only". */
export function amountWordsEn(value: number): string {
  let taka = Math.floor(Math.abs(value));
  const paisa = Math.round((Math.abs(value) - taka) * 100);
  if (taka === 0 && paisa === 0) return 'Zero Taka Only';
  const parts: string[] = [];
  for (const [unit, label] of [[10000000, 'Crore'], [100000, 'Lakh'], [1000, 'Thousand']] as const) {
    if (taka >= unit) {
      parts.push(`${under1000(Math.floor(taka / unit))} ${label}`);
      taka %= unit;
    }
  }
  if (taka) parts.push(under1000(taka));
  return `${parts.join(' ')} Taka${paisa ? ` and ${under100(paisa)} Paisa` : ''} Only`;
}

export function docAmountWords(value: number, lang: DocLanguage): string {
  return lang === 'bn' ? amountInWords(value) : amountWordsEn(value);
}
