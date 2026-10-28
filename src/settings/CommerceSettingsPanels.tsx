import { useState } from 'react';
import { Plus, Trash2, CircleAlert, FileHash, BadgePercent, Globe2 } from 'lucide-react';
import { AppSelect } from '../components/AppSelect';
import { useUiCopy } from '../i18n/useUiCopy';
import { businessToday } from '../utils/dateRange';
import { Button, Input, Switch, SettingCard, SettingsField } from './ui';
import {
  documentKinds, documentLabels, previewDocumentNumber, previewVat,
  regionalMoney, regionalDate, validateTax, validateNumbering,
  type DocumentKind, type DocumentNumberingPreferences, type RegionalPreferences, type TaxPreferences
} from './commercePolicies';

type RegionalProps = { value: RegionalPreferences; financialYear: string; disabled: boolean; onChange: (value: RegionalPreferences) => void };
type TaxProps = { value: TaxPreferences; regional: RegionalPreferences; disabled: boolean; onChange: (value: TaxPreferences) => void };
type NumberingProps = { value: DocumentNumberingPreferences; disabled: boolean; onChange: (value: DocumentNumberingPreferences) => void };

function PolicySelect({ label, bn, hint, value, options, disabled, onChange }: {
  label: string; bn: string; hint: string; value: string; options: string[]; disabled: boolean; onChange: (value: string) => void;
}) {
  const { language } = useUiCopy();
  return <SettingsField label={label} bn={bn} language={language} hint={hint}>
    {(id, descriptionId) => <AppSelect id={id} describedBy={descriptionId} label={label} value={value}
      options={options} onChange={onChange} disabled={disabled} />}
  </SettingsField>;
}

export function RegionalCurrencySettings({ value, financialYear, disabled, onChange }: RegionalProps) {
  const { text } = useUiCopy();
  const set = <K extends keyof RegionalPreferences>(key: K, next: RegionalPreferences[K]) => onChange({ ...value, [key]: next });
  const sampleDate = new Date(Date.UTC(2026, 9, 28, 14, 30));
  const time = value.timeFormat === '12-hour' ? '2:30 PM' : '14:30';
  return <div data-settings-regional className="space-y-4">
    <SettingCard title={text('Regional & Currency', 'আঞ্চলিক ও মুদ্রা')}>
      <p className="flex items-start gap-2 text-xs text-helper"><Globe2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {text('BDT is the accounting currency, Asia/Dhaka is the business timezone. These display preferences do not convert stored money or change historical entries.',
          'হিসাবের মুদ্রা BDT এবং সময় অঞ্চল Asia/Dhaka। দেখানোর পছন্দ বদলালে পুরোনো লেনদেন বা জমা টাকার মান বদলাবে না।')}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="Accounting currency" bn="হিসাবের মুদ্রা" hint={text('Fixed to Bangladesh Taka in this ERP version.', 'এই সংস্করণে বাংলাদেশি টাকা নির্ধারিত।')}>
          {id => <Input id={id} readOnly value="BDT — Bangladesh Taka" aria-label="Accounting currency" />}
        </SettingsField>
        <SettingsField label="Business timezone" bn="সময় অঞ্চল" hint={text('Used for business-day context.', 'ব্যবসায়িক দিনের সময় নির্ধারণে ব্যবহৃত হয়।')}>
          {id => <Input id={id} readOnly value={value.timezone} aria-label="Business timezone" />}
        </SettingsField>
        <PolicySelect label="Currency symbol" bn="মুদ্রার চিহ্ন" hint="Display only; no currency conversion."
          value={value.symbol} options={['৳', 'BDT']} disabled={disabled}
          onChange={v=>set('symbol', v as RegionalPreferences['symbol'])}/>
        <PolicySelect label="Number grouping" bn="সংখ্যার বিন্যাস" hint="Bangladesh: 1,23,456; International: 123,456."
          value={value.grouping} options={['Bangladesh','International']} disabled={disabled}
          onChange={v=>set('grouping', v as RegionalPreferences['grouping'])}/>
        <PolicySelect label="Digits" bn="সংখ্যার অঙ্ক" hint="English or Bangla digits in supported output."
          value={value.digits} options={['English','Bangla']} disabled={disabled}
          onChange={v=>set('digits', v as RegionalPreferences['digits'])}/>
        <PolicySelect label="Date format" bn="তারিখের বিন্যাস" hint="Existing transaction dates are not rewritten."
          value={value.dateFormat} options={['DD/MM/YYYY','DD-MM-YYYY','YYYY-MM-DD']} disabled={disabled}
          onChange={v=>set('dateFormat', v as RegionalPreferences['dateFormat'])}/>
        <PolicySelect label="Time format" bn="সময়ের বিন্যাস" hint="12-hour AM/PM or 24-hour time."
          value={value.timeFormat} options={['12-hour','24-hour']} disabled={disabled}
          onChange={v=>set('timeFormat', v as RegionalPreferences['timeFormat'])}/>
        <PolicySelect label="Negative amounts" bn="ঋণাত্মক টাকার ধরন" hint="Display negative money as a minus sign or parentheses."
          value={value.negativeFormat} options={['Minus','Parentheses']} disabled={disabled}
          onChange={v=>set('negativeFormat', v as RegionalPreferences['negativeFormat'])}/>
      </div>
      <p className="border-t border-border pt-3 text-xs text-helper">
        {text('Financial year:', 'অর্থবছর:')} <strong className="font-medium text-ink">{financialYear}</strong> · {text('Edit this in this section’s financial-year control.', 'এই বিভাগের অর্থবছরের সেটিং থেকে পরিবর্তন করুন।')}
      </p>
    </SettingCard>
    <SettingCard title={text('Formatting preview', 'বিন্যাসের নমুনা')}>
      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded-lg border border-border bg-ink-50/30 p-3">
          <p className="mb-1 text-xs text-helper">{text('Example amount', 'টাকার উদাহরণ')}</p>
          <p className="text-lg font-semibold text-ink">{regionalMoney(123456.5, value)}</p>
          <p className="mt-1 text-xs text-helper">{regionalMoney(-1234.5, value)}</p>
        </div>
        <div className="rounded-lg border border-border bg-ink-50/30 p-3">
          <p className="mb-1 text-xs text-helper">{text('Example date and time', 'তারিখ ও সময়ের নমুনা')}</p>
          <p className="text-lg font-semibold text-ink">{regionalDate(sampleDate,value)}</p>
          <p className="mt-1 text-xs text-helper">{time} · Asia/Dhaka (example)</p>
        </div>
      </div>
      <p className="text-xs text-helper">{text('These settings are saved and previewed here. ERP-wide print and module formatting adapters are not yet connected.',
        'এই পছন্দগুলো এখানে সংরক্ষিত হয় এবং নমুনা দেখা যায়। সব মডিউল ও প্রিন্টে এখনো প্রয়োগ হয়নি।')}</p>
    </SettingCard>
  </div>;
}

export function TaxVatSettings({ value, regional, disabled, onChange }: TaxProps) {
  const { text, language } = useUiCopy();
  const patch = (next: Partial<TaxPreferences>) => onChange({ ...value, ...next });
  const rate = value.rates.find(r => r.id === value.defaultRateId && r.active);
  const calc = previewVat(1000, rate?.percentage ?? 0, value.pricing);
  const error = validateTax(value);
  return <div data-settings-tax className="space-y-4">
    <SettingCard title={text('Tax & VAT', 'ভ্যাট ও কর')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-ink">{text('Enable VAT configuration', 'ভ্যাট সেটিং চালু করুন')}</p>
          <p className="mt-1 text-xs text-helper">{text('Optional for businesses that use VAT. Does not automatically make the shop VAT registered.', 'ভ্যাট প্রযোজ্য ব্যবসার জন্য ঐচ্ছিক। চালু করলেই ব্যবসা ভ্যাট নিবন্ধিত হয় না।')}</p>
        </div>
        <Switch checked={value.enabled} onCheckedChange={enabled=>patch({enabled})} disabled={disabled} aria-label="Enable VAT configuration"/>
      </div>
      <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <SettingsField label="Tax registration / BIN" bn="ভ্যাট নিবন্ধন / BIN" language={language} hint={text('Optional registration reference. Verify accuracy before issuing regulated tax invoices.', 'ঐচ্ছিক নিবন্ধন নম্বর। কর চালান দেওয়ার আগে সঠিক কিনা যাচাই করুন।')}>
          {(id,desc) => <Input id={id} aria-describedby={desc} maxLength={40} value={value.registrationBin} disabled={disabled}
            onChange={e=>patch({registrationBin:e.target.value})} placeholder="Enter registration reference" />}
        </SettingsField>
        <PolicySelect label="Entered price includes VAT" bn="দামে ভ্যাট অন্তর্ভুক্ত" hint="Inclusive: VAT is within price; Exclusive: added to price."
          value={value.pricing} options={['Exclusive','Inclusive']} disabled={disabled}
          onChange={pricing=>patch({pricing:pricing as TaxPreferences['pricing']})}/>
      </div>
      <div className="flex items-start justify-between gap-4 border-t border-border pt-4">
        <div><p className="text-[13px] font-medium text-ink">{text('Show VAT breakdown on invoice', 'চালানে ভ্যাটের হিসাব দেখান')}</p>
          <p className="mt-1 text-xs text-helper">{text('Preview preference only; mandatory fields cannot be hidden in regulated invoices.', 'শুধু নমুনার সেটিং; আইনগতভাবে বাধ্যতামূলক তথ্য লুকানো যাবে না।')}</p></div>
        <Switch checked={value.showOnInvoice} onCheckedChange={showOnInvoice=>patch({showOnInvoice})} disabled={disabled} aria-label="Show VAT breakdown on invoice"/>
      </div>
    </SettingCard>
    <SettingCard title={text('VAT rates', 'ভ্যাটের হার')}>
      <div className="space-y-3">
        {value.rates.map((r,index)=><div key={r.id} data-tax-rate={r.id} className="grid min-w-0 items-end gap-2 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_105px_auto_auto]">
          <SettingsField label="Rate name" bn="হারের নাম" language={language}>
            {id=><Input id={id} value={r.label} maxLength={80} disabled={disabled}
              onChange={e=>patch({rates:value.rates.map(v=>v.id===r.id?{...v,label:e.target.value}:v)})}/>}
          </SettingsField>
          <SettingsField label="VAT %" bn="ভ্যাট %" language={language}>
            {id=><Input id={id} type="number" step="0.01" min={0} max={100} value={Number.isFinite(r.percentage)?r.percentage:''} disabled={disabled}
              onChange={e=>patch({rates:value.rates.map(v=>v.id===r.id?{...v,percentage:e.target.value===''?NaN:Number(e.target.value)}:v)})}/>}
          </SettingsField>
          <div className="flex h-9 items-center gap-2">
            <Switch checked={r.active} onCheckedChange={active=>patch({rates:value.rates.map(v=>v.id===r.id?{...v,active}:v)})} disabled={disabled}
              aria-label={'Active VAT rate: '+r.label}/>
            <span className="text-xs text-helper">{text('Active','চালু')}</span>
          </div>
          <Button variant="ghost" size="sm" aria-label={'Remove VAT rate '+r.label} title="Remove rate"
            disabled={disabled || value.rates.length===1 || value.defaultRateId===r.id}
            onClick={()=>patch({rates:value.rates.filter(v=>v.id!==r.id)})}><Trash2 className="size-4" aria-hidden="true"/></Button>
          <span className="sr-only">Rate {index+1}</span>
        </div>)}
        <Button variant="outline" size="sm" disabled={disabled || value.rates.length>=12} onClick={()=>{
          let index=value.rates.length+1;
          while(value.rates.some(r=>r.id==='rate-'+index))index++;
          patch({rates:[...value.rates,{id:'rate-'+index,label:'New rate '+index,percentage:0,active:true}]});
        }}><Plus className="size-4" aria-hidden="true"/>{text('Add VAT rate','ভ্যাটের হার যোগ করুন')}</Button>
        <PolicySelect label="Default VAT rate" bn="ডিফল্ট ভ্যাটের হার" hint="Choose an active rate. Product-specific assignments and server calculation are future integrations."
          value={value.defaultRateId} options={value.rates.filter(r=>r.active).map(r=>({value:r.id,label:r.label+' · '+r.percentage+'%'})).map(r=>r.value)}
          disabled={disabled} onChange={defaultRateId=>patch({defaultRateId})}/>
        <p className="text-xs text-helper">{value.rates.find(r=>r.id===value.defaultRateId)?.label ?? text('Choose an active rate','চালু হার বাছুন')}</p>
        {error && <p role="alert" className="flex items-center gap-2 text-xs text-danger"><CircleAlert className="size-4"/>{error}</p>}
      </div>
    </SettingCard>
    <SettingCard title={text('Illustrative VAT calculation · ৳1,000', 'ভ্যাটের হিসাবের নমুনা · ৳১,০০০')}>
      <div className="flex items-start gap-2 text-xs text-helper"><BadgePercent className="size-4 shrink-0" aria-hidden="true"/>
        {text('Preview only. No VAT is added to sales, purchases, returns, accounts or tax reports yet. Configure actual rates according to applicable NBR requirements.',
          'শুধু নমুনা। বিক্রি, ক্রয়, ফেরত, হিসাব বা কর রিপোর্টে এখনো ভ্যাট যোগ হয় না। প্রযোজ্য NBR বিধি অনুযায়ী হার নির্ধারণ করুন।')}</div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {([['Base',calc.base],['VAT',calc.tax],['Total',calc.total]] as const).map(([label,n])=><div key={label} className="rounded-lg border border-border bg-ink-50/30 p-2">
          <p className="text-helper">{label}</p><p className="mt-1 text-[14px] font-semibold text-ink">{regionalMoney(n,regional)}</p>
        </div>)}
      </div>
      <p className="text-xs text-helper">{value.enabled ? text('Enabled in settings; posting is not connected.','সেটিং চালু; লেনদেনে এখনো প্রয়োগ হয়নি।') : text('VAT disabled; amounts shown only to explain the selected rule.','ভ্যাট বন্ধ; শুধু নিয়ম বোঝাতে নমুনা দেখানো হয়েছে।')}</p>
    </SettingCard>
  </div>;
}

export function DocumentNumberingSettings({ value, disabled, onChange }: NumberingProps) {
  const { text, language } = useUiCopy();
  const [kind,setKind] = useState<DocumentKind>('sale');
  const rule=value[kind], currentYear=Number(businessToday().slice(0,4));
  const patch = (next: Partial<typeof rule>) => onChange({...value,[kind]:{...rule,...next}});
  const error=validateNumbering(value);
  return <div data-settings-numbering className="space-y-4">
    <SettingCard title={text('Document numbering', 'ডকুমেন্ট নম্বর')}>
      <div className="flex items-start gap-2 text-xs text-helper">
        <FileHash className="mt-0.5 size-4 shrink-0" aria-hidden="true"/>
        {text('Set prefixes and preview numbers for future documents. Issued reference numbers never change. These settings do not reserve numbers; the production backend must allocate unique sequences transactionally.',
          'নতুন ডকুমেন্টের নম্বর কেমন হবে তা ঠিক করুন। আগের নম্বর বদলাবে না। এটি নম্বর সংরক্ষণ করে না; সার্ভার থেকে নিরাপদে একক নম্বর দিতে হবে।')}
      </div>
      <SettingsField label="Document type" bn="ডকুমেন্টের ধরন" language={language} hint={text('Choose a document to edit its numbering rule.', 'নম্বরের নিয়ম পরিবর্তন করতে ডকুমেন্ট বাছুন।')}>
        {(id,desc)=><AppSelect id={id} describedBy={desc} label="Document type" value={kind} onChange={v=>setKind(v as DocumentKind)}
          options={documentKinds.map(k=>({value:k,label:documentLabels[k].en}))}/>}
      </SettingsField>
      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField label="Prefix" bn="নম্বরের শুরু" language={language} hint="1–12 uppercase letters, numbers or hyphens. Must be distinct.">
          {(id,desc)=><Input id={id} aria-describedby={desc} disabled={disabled} maxLength={12} value={rule.prefix}
            onChange={e=>patch({prefix:e.target.value.toUpperCase()})}/>}
        </SettingsField>
        <SettingsField label="Sequence digits" bn="নম্বরের ঘর" language={language} hint="3–10 digits, e.g. 000125.">
          {(id,desc)=><AppSelect id={id} describedBy={desc} label="Sequence digits" disabled={disabled} value={String(rule.digits)}
            options={['3','4','5','6','7','8','9','10']} onChange={v=>patch({digits:Number(v)})}/>}
        </SettingsField>
        <SettingsField label="Next sequence (preview)" bn="পরবর্তী সংখ্যা (নমুনা)" language={language} hint="Example starting sequence; not a live counter or issued number.">
          {(id,desc)=><Input id={id} aria-describedby={desc} type="number" min={1} max={999999999} step={1} disabled={disabled}
            value={Number.isFinite(rule.nextNumber)?rule.nextNumber:''}
            onChange={e=>patch({nextNumber:e.target.value===''?NaN:Number(e.target.value)})}/>}
        </SettingsField>
        <PolicySelect label="Show year in number" bn="নম্বরে বছর দেখান" hint="Calendar year is a label only; counters are not automatically reset."
          value={rule.year} options={['None','Calendar year']} disabled={disabled}
          onChange={v=>patch({year:v as typeof rule.year})}/>
      </div>
      <div className="rounded-lg border border-border bg-ink-50/30 p-3">
        <p className="text-xs text-helper">{text('Number preview', 'নম্বরের নমুনা')}</p>
        <p className="mt-1 break-all text-lg font-semibold text-ink">{previewDocumentNumber(rule,currentYear)}</p>
        <p className="mt-1 text-xs text-helper">{text('Format preview only · no document was issued', 'শুধু নমুনা · কোনো ডকুমেন্ট তৈরি হয়নি')}</p>
      </div>
      {error && <p role="alert" className="flex items-center gap-2 text-xs text-danger"><CircleAlert className="size-4"/>{error}</p>}
    </SettingCard>
    <SettingCard title={text('All document previews', 'সব ডকুমেন্টের নমুনা')}>
      <div className="divide-y divide-border">
        {documentKinds.map(k=><button key={k} type="button" aria-label={'Edit '+documentLabels[k].en+' numbering'}
          onClick={()=>setKind(k)} className={'flex w-full min-w-0 items-center justify-between gap-2 px-1 py-2 text-left text-xs hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring '+(kind===k?'font-semibold text-primary':'text-ink')}>
          <span className="min-w-0">{language==='Bangla'?documentLabels[k].bn:documentLabels[k].en}
            {language==='English + Bangla'&&<span className="ml-2 font-bn font-normal text-helper">{documentLabels[k].bn}</span>}</span>
          <span className="shrink-0 font-normal text-ink-600">{previewDocumentNumber(value[k],currentYear)}</span>
        </button>)}
      </div>
    </SettingCard>
  </div>;
}
