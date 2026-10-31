import {unitBanglaName} from '../data/productUnits.ts';

export type PrintQuantityLanguage = 'English' | 'Bangla' | 'English + Bangla';

/**
 * Printed quantity is display-only. Unit conversion, pricing and persisted
 * quantity keys are NEVER inferred from translated text.
 * Accept only whole sequences of (number, unit); leave other legacy text intact.
 */
const quantityPattern = /^\d+(?:\.\d+)?\s+\S+(?:\s+\d+(?:\.\d+)?\s+\S+)*$/u;
const tokenPattern = /(\d+(?:\.\d+)?)\s+(\S+)/gu;
const banglaDigits = '০১২৩৪৫৬৭৮৯';

export function freezeInvoiceUnitNames(quantity: string): Record<string, string> {
  if (!quantityPattern.test(quantity.trim())) return {};
  const result: Record<string, string> = {};
  for (const match of quantity.trim().matchAll(tokenPattern)) {
    result[match[2]] = unitBanglaName(match[2]) ?? '';
  }
  return result;
}

export function formatPrintQuantity(
  quantity: string,
  language: PrintQuantityLanguage,
  frozenUnitNames?: Readonly<Record<string,string>>
): string {
  if (language === 'English' || language === 'English + Bangla') return quantity;
  const raw = quantity.trim();
  if (!quantityPattern.test(raw)) return quantity;
  return raw.replace(tokenPattern, (_original, number: string, unit: string) => {
    const translated = frozenUnitNames === undefined
      ? unitBanglaName(unit)
      : Object.hasOwn(frozenUnitNames,unit) ? frozenUnitNames[unit] : undefined;
    const n = number.replace(/\d/g, digit => banglaDigits[Number(digit)]);
    return n + ' ' + (translated?.trim() || unit);
  });
}
