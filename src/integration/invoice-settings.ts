/**
 * MOD-001 T04-R — verified, read-only NestSherERP invoice preferences.
 * Source: pinned adoption packages/core-contracts/src/sales.ts
 * invoiceSettingsSchema and GET /api/v1/sales/invoice-settings.
 *
 * No six-design ID, MIXED language, premium entitlement or accent color exists
 * in the current server DTO. Never infer them from this authenticated GET.
 */
import { requestJson } from './http.ts';
import { ApiError } from './errors.ts';

export interface ServerInvoicePhone { label: string; number: string }
export interface ServerInvoiceSettings {
  language: 'EN' | 'BN';
  defaultTemplate: 'A4' | 'THERMAL_80';
  showLogo: boolean;
  showBusinessBlock: boolean;
  showCustomerBlock: boolean;
  showSku: boolean;
  showBarcode: boolean;
  showDiscount: boolean;
  showPaymentBreakdown: boolean;
  showDue: boolean;
  showAmountInWords: boolean;
  headerText: string | null;
  showHeaderText: boolean;
  invoiceTitle: string | null;
  businessNameEn: string | null;
  proprietorName: string | null;
  proprietorNote: string | null;
  businessDescription: string | null;
  businessPhone2: string | null;
  contactPhones: ServerInvoicePhone[];
  mfsNumbers: ServerInvoicePhone[];
  terms: string[];
  paymentTermsDays: number;
  paymentTermsLabel: string | null;
  thermalPaper: '58mm' | '80mm';
  showSignatureLines: boolean;
  /** Derived from stored logo bytes. Never submit this in a PUT request. */
  hasLogo: boolean;
  businessName: string | null;
  businessAddress: string | null;
  businessPhone: string | null;
  footerText: string | null;
  termsText: string | null;
  businessPadEnabled: boolean;
  businessPadTopMm: number;
  pageMarginMm: number;
}
export interface ServerInvoiceSettingsEnvelope { data: ServerInvoiceSettings }

const flags = [
  'showLogo','showBusinessBlock','showCustomerBlock','showSku',
  'showBarcode','showDiscount','showPaymentBreakdown','showDue',
  'showAmountInWords','showHeaderText','showSignatureLines','hasLogo',
  'businessPadEnabled',
] as const;
const nullables = [
  'headerText','invoiceTitle','businessNameEn','proprietorName','proprietorNote',
  'businessDescription','businessPhone2','paymentTermsLabel','businessName',
  'businessAddress','businessPhone','footerText','termsText',
] as const;
const numerics = ['paymentTermsDays','businessPadTopMm','pageMarginMm'] as const;
const expectedKeys = [
  'language','defaultTemplate','thermalPaper',
  ...flags,...nullables,...numerics,'contactPhones','mfsNumbers','terms',
] as const;

function invalid(): never {
  throw new ApiError('protocol','Invalid API response or request');
}
function record(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw);
}
function exactKeys(raw: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(raw).length === keys.length &&
    keys.every(key=>Object.prototype.hasOwnProperty.call(raw,key));
}
function isNullableText(raw: unknown): raw is string | null {
  return raw === null || typeof raw === 'string';
}
function safeBoundedInt(raw: unknown, min: number, max: number): boolean {
  return typeof raw === 'number' && Number.isSafeInteger(raw) && raw >= min && raw <= max;
}
function validNumberPair(value: unknown): value is ServerInvoicePhone {
  return record(value) && exactKeys(value,['label','number']) &&
    typeof value.label === 'string' && value.label.length <= 40 &&
    typeof value.number === 'string' && value.number.length <= 40;
}
function decodeInvoiceSettings(raw: unknown): ServerInvoiceSettingsEnvelope {
  if (!record(raw) || !exactKeys(raw,['data']) || !record(raw.data)) return invalid();
  const d = raw.data;
  if (!exactKeys(d,expectedKeys) ||
      (d.language !== 'EN' && d.language !== 'BN') ||
      (d.defaultTemplate !== 'A4' && d.defaultTemplate !== 'THERMAL_80') ||
      (d.thermalPaper !== '58mm' && d.thermalPaper !== '80mm') ||
      !flags.every(key=>typeof d[key] === 'boolean') ||
      !nullables.every(key=>isNullableText(d[key])) ||
      !safeBoundedInt(d.paymentTermsDays,0,365) ||
      !safeBoundedInt(d.businessPadTopMm,0,150) ||
      !safeBoundedInt(d.pageMarginMm,0,50) ||
      !Array.isArray(d.contactPhones) || !d.contactPhones.every(validNumberPair) ||
      !Array.isArray(d.mfsNumbers) || !d.mfsNumbers.every(validNumberPair) ||
      !Array.isArray(d.terms) || !d.terms.every((x:unknown)=>typeof x==='string'&&x.length<=200)) return invalid();
  return raw as unknown as ServerInvoiceSettingsEnvelope;
}

export async function readInvoiceSettings(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerInvoiceSettingsEnvelope> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort',abort,{once:true});
  const deadline = globalThis.setTimeout(abort,timeoutMs);
  try {
    return await requestJson({
      method:'GET',
      path:'/api/v1/sales/invoice-settings',
      accessToken,
      signal:controller.signal,
    },decodeInvoiceSettings);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort',abort);
  }
}
