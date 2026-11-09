import React from 'react';
import { documentCopy, paymentLabels, type DocCopyKey } from './documentCopy';
import type { InvoiceContentKey, InvoiceDesignId, PaperSize } from './invoiceDesigns';
import { sampleInvoice, type InvoiceData, type SampleLine } from './sampleInvoice';
import { docAmountWords, docDate, docMoney, docNumber, type DocLanguage } from './bangla';

export type InvoiceDocumentProps = {
  design: InvoiceDesignId;
  paper: PaperSize;
  lang: DocLanguage;
  accent: string;
  content: Record<InvoiceContentKey, boolean>;
  /** Business Pad: blank space (mm) left at the top for the pre-printed letterhead */
  padOffset?: number;
  footer?: string;
  /** Marks receipts made while the device was offline */
  offline?: boolean;
  /** Real sale to print; the settings preview uses the sample sale. */
  invoice?: InvoiceData;
};

const widths: Record<PaperSize, number> = { a4: 595, pad: 595, '80mm': 302, '58mm': 220 };

/**
 * UI-only copy of the original Magic Patterns invoice preview renderer. Production printing is not connected in Phase 1.
 * Six designs × A4 / thermal / Business Pad, in English, English + Bangla helpers, or Full Bangla.
 */
export function InvoiceDocument({ design, paper, lang, accent, content, padOffset = 30, footer, offline, invoice }: InvoiceDocumentProps) {
  const inv = invoice ?? sampleInvoice;
  const bn = lang === 'bn';
  const thermal = paper === '80mm' || paper === '58mm';
  const L = (key: DocCopyKey) =>
    lang === 'mixed' ? (
      <>
        {documentCopy[key].en}
        <span className="ml-1 font-bn text-[0.82em] font-normal opacity-60">{documentCopy[key].bn}</span>
      </>
    ) : (
      documentCopy[key][lang]
    );
  const T = (key: DocCopyKey) => documentCopy[key][bn ? 'bn' : 'en'];
  const M = (n: number) => docMoney(n, lang);
  const N = (n: string | number) => docNumber(n, lang);
  const subtotal = inv.lines.reduce((s, l) => s + l.qty * l.rate, 0);
  const discount = content.discount ? inv.discount : 0;
  const total = subtotal - discount;
  const due = Math.max(0, total - inv.paid);
  const biz = { name: bn ? inv.business.nameBn : inv.business.name, address: bn ? inv.business.addressBn : inv.business.address };
  const cust = { name: bn ? inv.customer.nameBn : inv.customer.name, address: bn ? inv.customer.addressBn : inv.customer.address };
  const pay = paymentLabels[inv.payment]?.[bn ? 'bn' : 'en'] ?? inv.payment;
  const number = offline && !invoice ? 'INV-OFF-0015' : inv.number;
  const fontCls = `${bn ? 'font-bn leading-[1.55]' : ''} ${design === 'elegant' && !bn ? 'font-serif' : ''}`;
  const thanks = footer || T('thanks');
  const lineExtra = (l: SampleLine) =>
    [content.sku && `${T('sku')}: ${l.sku}`, content.serial && l.serial && `${T('serial')}: ${N(l.serial)}`, content.warranty && l.warranty && `${T('warranty')}: ${bn ? l.warrantyBn : l.warranty}`].filter(Boolean).join(' · ');

  const Logo = ({ size = 40 }: { size?: number }) =>
    content.logo ? (
      <div
        aria-hidden="true"
        style={{ width: size, height: size, background: design === 'bold' ? '#fff' : accent, color: design === 'bold' ? accent : '#fff' }}
        className={`flex shrink-0 items-center justify-center font-semibold ${design === 'elegant' ? 'rounded-full' : 'rounded-md'}`}
      >
        <span style={{ fontSize: size * 0.4 }}>{bn ? 'ন' : 'NH'}</span>
      </div>
    ) : null;

  const totals = (
    <>
      <Row label={L('subtotal')} value={M(subtotal)} />
      {content.discount && <Row label={L('discount')} value={`- ${M(discount)}`} />}
      <Row label={L('total')} value={M(total)} strong accent={design === 'standard' || design === 'elegant' ? accent : undefined} />
      {content.payments && <Row label={<>{L('paid')} · {pay}</>} value={M(inv.paid)} />}
      {content.due && due > 0 && <Row label={L('due')} value={M(due)} danger />}
    </>
  );

  if (thermal) {
    const small = paper === '58mm';
    return (
      <article style={{ width: widths[paper] }} className={`theme-light bg-white px-3 py-4 text-ink ${small ? 'text-[9.5px]' : 'text-[11px]'} ${fontCls} ${design === 'compact' ? 'leading-tight' : ''}`} aria-label="Receipt preview">
        {design === 'bold' ? (
          <header style={{ background: accent }} className="-mx-3 -mt-4 mb-3 flex flex-col items-center gap-1 px-3 py-3 text-center text-white">
            <Logo size={small ? 26 : 32} />
            <p className="text-[1.25em] font-bold">{biz.name}</p>
            {content.businessInfo && <p className="opacity-90">{biz.address} · {N(inv.business.phone)}</p>}
          </header>
        ) : (
          <header className="mb-2 flex flex-col items-center gap-1 text-center">
            <Logo size={small ? 26 : 32} />
            <p className="text-[1.2em] font-semibold">{biz.name}</p>
            {content.businessInfo && <p className="text-ink-500">{biz.address}<br />{N(inv.business.phone)}</p>}
          </header>
        )}
        <Dash />
        <p className="text-center font-semibold">{L('receipt')}{offline && <span className="ml-1 rounded border border-ink-300 px-1 text-[0.8em] font-medium">Offline</span>}</p>
        <div className="mt-1 flex justify-between text-ink-600"><span>{N(number)}</span><span>{docDate(inv.date, lang)}</span></div>
        {content.customer && <p className="mt-1">{L('billTo')}: {cust.name}{content.phone && ` · ${N(inv.customer.phone)}`}</p>}
        <Dash />
        <ul className={design === 'compact' ? 'space-y-0.5' : 'space-y-1.5'}>
          {inv.lines.map((l) => (
            <li key={l.sku}>
              <div className="flex justify-between gap-2"><span className="min-w-0">{bn ? l.nameBn : l.name}</span><span className="shrink-0 ">{M(l.qty * l.rate)}</span></div>
              <div className="text-ink-500 ">{N(l.qty)} {bn ? l.unitBn : l.unit} × {M(l.rate)}{lineExtra(l) && ` · ${lineExtra(l)}`}</div>
            </li>
          ))}
        </ul>
        <Dash />
        <div className="space-y-0.5">{totals}</div>
        {content.amountWords && <p className="mt-2 text-ink-600">{L('inWords')}: {docAmountWords(total, lang)}</p>}
        <Dash />
        {content.servedBy && <p className="text-center text-ink-500">{L('servedBy')}: {bn ? inv.servedByBn : inv.servedBy}</p>}
        {content.terms && <p className="mt-1 text-center text-ink-500">{T('terms')}</p>}
        <p className="mt-2 text-center font-medium">{thanks}</p>
      </article>
    );
  }

  const cellPad = design === 'compact' ? 'py-1' : 'py-2';
  const bordered = design === 'classic' ? 'border border-ink' : '';
  const headCls =
    design === 'classic' ? 'border border-ink bg-ink-50' : design === 'elegant' ? 'border-y border-ink-300 text-[10px] uppercase tracking-wider text-ink-600' : design === 'modern' ? 'border-b-2 border-current' : design === 'bold' ? '' : 'bg-ink-50 text-ink-600';
  const title = <span className={design === 'elegant' ? 'uppercase tracking-[0.2em]' : ''}>{L('invoice')}</span>;
  const bizInfo = content.businessInfo && <p className="text-[11px] opacity-80">{biz.address} · {N(inv.business.phone)}</p>;

  let header: React.ReactNode;
  if (paper === 'pad') {
    header = <div style={{ height: padOffset * 2 }} className="flex items-end justify-center border-b border-dashed border-ink-200 pb-1 text-[10px] text-ink-400">Letterhead area · {padOffset}mm</div>;
  } else if (design === 'bold') {
    header = (
      <header style={{ background: accent }} className="-mx-8 -mt-8 flex items-center justify-between gap-4 px-8 py-6 text-white">
        <div className="flex items-center gap-3"><Logo size={44} /><div><p className="text-lg font-bold">{biz.name}</p>{bizInfo}</div></div>
        <p className="text-2xl font-black">{title}</p>
      </header>
    );
  } else if (design === 'elegant') {
    header = (
      <header className="flex flex-col items-center gap-2 border-b border-ink-200 pb-4 text-center">
        <Logo size={46} />
        <p className="text-xl font-semibold">{biz.name}</p>
        {bizInfo}
        <p className="mt-1 text-[13px] text-ink-600">{title}</p>
      </header>
    );
  } else if (design === 'classic') {
    header = (
      <header className="border-2 border-ink p-3 text-center">
        <p className="text-lg font-bold">{biz.name}</p>
        {bizInfo}
        <p className="mx-auto mt-2 w-fit border border-ink px-3 py-0.5 text-[12px] font-semibold">{title}</p>
      </header>
    );
  } else {
    header = (
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo size={design === 'compact' ? 32 : 42} />
          <div><p className={`${design === 'compact' ? 'text-sm' : 'text-lg'} font-semibold`}>{biz.name}</p>{bizInfo}</div>
        </div>
        <p style={{ color: accent }} className={design === 'modern' ? 'text-3xl font-light' : design === 'compact' ? 'text-base font-semibold' : 'text-xl font-semibold'}>{title}</p>
      </header>
    );
  }

  return (
    <article style={{ width: widths[paper], minHeight: Math.round(widths[paper] * 1.414) }} className={`theme-light relative flex flex-col bg-white p-8 text-[11px] text-ink ${fontCls}`} aria-label="Invoice preview">
      {design === 'modern' && paper !== 'pad' && <span aria-hidden="true" style={{ background: accent }} className="absolute inset-y-0 left-0 w-1.5" />}
      {header}
      <div className={`flex items-start justify-between gap-4 ${design === 'compact' ? 'mt-3' : 'mt-6'}`}>
        {content.customer ? (
          <div>
            <p className={`text-[10px] font-semibold ${design === 'elegant' ? 'uppercase tracking-wider' : ''}`} style={{ color: design === 'classic' ? undefined : accent }}>{L('billTo')}</p>
            <p className="font-semibold">{cust.name}</p>
            {content.phone && <p className="text-ink-600">{N(inv.customer.phone)}</p>}
            {content.address && <p className="text-ink-600">{cust.address}</p>}
          </div>
        ) : <span />}
        <div className="space-y-0.5 text-right">
          <p className="text-ink-500">{L('invoiceNo')}: <span className="font-semibold text-ink">{N(number)}</span></p>
          <p className="text-ink-500">{L('date')}: <span className="text-ink">{docDate(inv.date, lang)}</span></p>
        </div>
      </div>
      <table data-erp-table className={`w-full border-collapse ${design === 'compact' ? 'mt-3 text-[10px]' : 'mt-5 text-[11px]'}`}>
        <thead>
          <tr style={design === 'bold' ? { background: accent, color: '#fff' } : design === 'modern' ? { color: accent } : undefined} className={headCls}>
            {(['item', 'qty', 'rate', 'amount'] as DocCopyKey[]).map((k, i) => (
              <th key={k} className={`px-2 ${cellPad} font-semibold ${i === 0 ? 'text-left' : 'text-right'} ${bordered}`}>{L(k)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {inv.lines.map((l, i) => (
            <tr key={l.sku} className={design === 'classic' ? 'border border-ink' : design === 'compact' ? 'border-b border-dashed border-ink-200' : 'border-b border-ink-100'}>
              <td className={`px-2 ${cellPad} ${bordered}`}>
                <span className="mr-1 text-ink-400">{N(i + 1)}.</span>
                {bn ? l.nameBn : l.name}
                {lineExtra(l) && <span className="block pl-4 text-[0.88em] text-ink-500">{lineExtra(l)}</span>}
              </td>
              <td className={`px-2 text-right  ${bordered}`}>{N(l.qty)} {bn ? l.unitBn : l.unit}</td>
              <td className={`px-2 text-right  ${bordered}`}>{M(l.rate)}</td>
              <td className={`px-2 text-right  ${bordered}`}>{M(l.qty * l.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div className="max-w-[55%] space-y-2 text-ink-600">
          {content.amountWords && <p><span className="font-medium text-ink">{L('inWords')}:</span> {docAmountWords(total, lang)}</p>}
          {content.servedBy && <p>{L('servedBy')}: {bn ? inv.servedByBn : inv.servedBy}</p>}
        </div>
        {design === 'modern' || design === 'bold' ? (
          <div className="w-[44%] space-y-1">
            {content.discount && <Row label={L('subtotal')} value={M(subtotal)} />}
            {content.discount && <Row label={L('discount')} value={`- ${M(discount)}`} />}
            <div style={{ background: design === 'bold' ? '#0b1a2c' : accent }} className="flex items-center justify-between rounded-md px-3 py-2.5 text-white">
              <span className="text-[12px] font-medium">{L('total')}</span>
              <span className="text-lg font-bold ">{M(total)}</span>
            </div>
            {content.payments && <Row label={<>{L('paid')} · {pay}</>} value={M(inv.paid)} />}
            {content.due && due > 0 && <Row label={L('due')} value={M(due)} danger />}
          </div>
        ) : (
          <div className={`w-[44%] space-y-1 ${design === 'classic' ? 'border border-ink p-2' : ''}`}>{totals}</div>
        )}
      </div>
      <div className="mt-auto pt-10">
        {content.signatures && (
          <div className="flex justify-between gap-6 text-ink-500">
            <span className="w-40 border-t border-ink-300 pt-1 text-center">{L('customerSign')}</span>
            <span className="w-40 border-t border-ink-300 pt-1 text-center">{L('authorizedSign')}</span>
          </div>
        )}
        {content.terms && <p className="mt-4 text-center text-[10px] text-ink-500">{T('terms')}</p>}
        <p className={`mt-1 text-center text-[10.5px] font-medium ${design === 'elegant' ? 'italic' : ''}`} style={{ color: design === 'classic' ? undefined : accent }}>{thanks}</p>
      </div>
    </article>
  );
}

function Row({ label, value, strong, danger, accent }: { label: React.ReactNode; value: string; strong?: boolean; danger?: boolean; accent?: string }) {
  return (
    <div className={`flex items-center justify-between gap-3  ${strong ? 'border-t border-ink-200 pt-1 text-[1.12em] font-semibold' : 'text-ink-600'} ${danger ? 'font-medium text-danger' : ''}`}>
      <span>{label}</span>
      <span style={accent ? { color: accent } : undefined}>{value}</span>
    </div>
  );
}

function Dash() {
  return <hr className="my-2 border-t border-dashed border-ink-300" />;
}
