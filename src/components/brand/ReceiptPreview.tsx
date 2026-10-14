import { LogoMark } from './Logo';
import { formatNumber } from '../../utils/currency';
import { amountInWords } from '../../utils/amountInWords';
import type { WarrantySnapshot } from '../../types/erp';
import {uiText, type UiLanguage} from '../../i18n/uiCopy';
import {documentLabel,documentMethod} from '../../i18n/documentCopy';

export type ReceiptLine = {name: string;qty: string;price: number;total: number;serials?: string[];warranty?: WarrantySnapshot;};
export type ReceiptBranding = { name: string; nameBn: string; address: string; phone: string; logo: string; showLogo: boolean; footer: string };

export type ReceiptPreviewProps = {
  /** Explicit prop works in both app and standalone server-side print markup. */
  language?: UiLanguage;
  invoice: string;
  customer?: string;
  customerPhone?: string;
  guardianName?: string;
  customerAddress?: string;
  lines: ReceiptLine[];
  subtotal: number;
  discount: number;
  rounding: number;
  total: number;
  paid: number;
  due: number;
  method: string;
  dateTime?: string;
  branding?: ReceiptBranding;
};

const n = (v: number) => formatNumber(v, v % 1 ? 2 : 0);

export function ReceiptPreview(p: ReceiptPreviewProps) {
  const language=p.language??'English + Bangla';
  const label=(english:string)=>documentLabel(language,english);
  return (
    <div className="theme-light mx-auto w-[288px] bg-white px-5 py-5 text-[11.5px] leading-relaxed text-ink shadow-pop ring-1 ring-ink-100">
      <div className="flex flex-col items-center text-center">
        {p.branding ? p.branding.showLogo && p.branding.logo && <img src={p.branding.logo} alt="Business logo" className="size-8 object-contain" /> : <LogoMark size={28} tone="mono-ink" />}
        <p className="mt-2 text-[13px] font-semibold">{p.branding?.name ?? 'Nawabpur Hardware House'}</p>
        <p className="font-bn text-[11px] text-ink-600">{p.branding?.nameBn ?? 'নবাবপুর হার্ডওয়্যার হাউস'}</p>
        <p className="text-[10.5px] text-ink-500">{p.branding ? `${p.branding.address} · ${p.branding.phone}` : '142 Nawabpur Road, Dhaka 1100 · 01711-000245'}</p>
      </div>
      <div className="my-3 border-t border-dashed border-ink-300" />
      <div className="flex justify-between"><span>{p.invoice}</span><span>{p.dateTime ?? '01 Oct 2026, 11:58 AM'}</span></div>
      <div className="flex justify-between gap-3"><span>{label("Customer")}</span><span className="text-right">{p.customer ?? label('Walk-in')}</span></div>
      {p.customerPhone && <div className="flex justify-between gap-3"><span>{label("Phone")}</span><span className="text-right">{p.customerPhone}</span></div>}
      {p.guardianName && <div className="flex justify-between gap-3"><span>{label("Guardian")}</span><span className="text-right">{p.guardianName}</span></div>}
      {p.customerAddress && <div className="flex justify-between gap-3"><span>{label("Address")}</span><span className="max-w-[170px] text-right">{p.customerAddress}</span></div>}
      <div className="my-3 border-t border-dashed border-ink-300" />
      <ol className="space-y-1.5">
        {p.lines.map((l, i) =>
        <li key={i}>
            <div className="flex justify-between gap-2">
              <span className="truncate">{i + 1}. {l.name}</span>
              <span className="">{n(l.total)}</span>
            </div>
            <div className="pl-3.5 text-[10.5px] text-ink-500">{l.qty} × {n(l.price)}</div>
            {l.serials?.length ? <div className="pl-3.5 text-[9.5px] text-ink-500">{label('Serial')}: {l.serials.join(', ')}</div> : null}
            {l.warranty ? <div className="pl-3.5 text-[9.5px] text-ink-500">{label('Warranty')}: {l.warranty.duration} {l.warranty.durationUnit} · {l.warranty.type}{l.warranty.terms ? ` · ${l.warranty.terms}` : ''}</div> : null}
          </li>
        )}
      </ol>
      <div className="my-3 border-t border-dashed border-ink-300" />
      <div className="space-y-0.5">
        <div className="flex justify-between"><span>{label("Subtotal")}</span><span className="">{n(p.subtotal)}</span></div>
        {p.discount > 0 && <div className="flex justify-between"><span>{label("Discount")}</span><span className="">−{n(p.discount)}</span></div>}
        <div className="flex justify-between"><span>{label("Rounding")}</span><span className="">{p.rounding >= 0 ? '+' : '−'}{n(Math.abs(p.rounding))}</span></div>
        <div className="flex justify-between pt-1 text-[14px] font-semibold"><span>{label("Total")}</span><span className="">৳{n(p.total)}</span></div>
        <div className="text-[11px] leading-5">{amountInWords(p.total)}</div>
        <div className="flex justify-between"><span>{uiText(language,'Paid','জমা')} ({documentMethod(language,p.method)})</span><span className="">{n(p.paid)}</span></div>
        {p.due > 0 && <div className="flex justify-between font-medium"><span>{label("Due")}</span><span className="">{n(p.due)}</span></div>}
      </div>
      <div className="my-3 border-t border-dashed border-ink-300" />
      <p className="font-bn text-center text-[11px]">{p.branding?.footer ?? 'ধন্যবাদ, আবার আসবেন'}</p>
      <p className="mt-1 text-center text-[9.5px] text-ink-400">Powered by HisabIQ · সহজ হিসাব, স্মার্ট ব্যবসা</p>
    </div>);

}
