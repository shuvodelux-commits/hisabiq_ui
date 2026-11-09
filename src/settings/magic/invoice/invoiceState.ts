import { contentToggles, type InvoiceContentKey, type InvoiceDesignId, type PaperSize } from './invoiceDesigns';
import type { DocLanguage } from './bangla';

export type InvoiceDesignSettings = {
  design: InvoiceDesignId;
  paper: PaperSize;
  lang: DocLanguage;
  accent: string;
  padOffset: number;
  footer: string;
  content: Record<InvoiceContentKey, boolean>;
};

const off: InvoiceContentKey[] = ['address', 'sku', 'serial'];

/** Phase 1: visual defaults only; never read/write prototype localStorage. */
export const defaultInvoiceDesign: InvoiceDesignSettings = {
  design: 'standard',
  paper: 'a4',
  lang: 'mixed',
  accent: '#0d7c74',
  padOffset: 30,
  footer: '',
  content: Object.fromEntries(contentToggles.map((t) => [t.key, !off.includes(t.key)])) as Record<InvoiceContentKey, boolean>,
};

