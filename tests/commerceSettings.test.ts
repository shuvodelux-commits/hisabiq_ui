import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, parseSettings, saveSection, validateSection } from '../src/settings/model.ts';
import {
  regionalDefaults, taxDefaults, numberingDefaults, previewDocumentNumber, previewVat,
  regionalMoney, regionalDate, validateRegional, validateTax, validateNumbering,
  documentKinds
} from '../src/settings/commercePolicies.ts';

test('new regional tax and numbering settings migrate old saved snapshots without losing records', () => {
  const original=defaults();
  const old=structuredClone(original) as typeof original & {sections:{business:Record<string,unknown>;invoices:Record<string,unknown>}};
  delete old.sections.business.regional;
  delete old.sections.business.tax;
  delete old.sections.invoices.numbering;
  old.sections.invoices.prefix='INV';
  const loaded=parseSettings(JSON.stringify(old),'t1');
  assert.equal(loaded.recovered,false);
  assert.deepEqual(loaded.state.sections.business.regional,regionalDefaults());
  assert.deepEqual(loaded.state.sections.business.tax,taxDefaults());
  assert.equal(loaded.state.sections.invoices.numbering.sale.prefix,'INV');
  assert.equal(loaded.state.sections.team.employees.length, original.sections.team.employees.length);
});

test('regional money formatting changes display only',()=>{
  const input=regionalDefaults();
  assert.equal(regionalMoney(125400.5,input),'৳1,25,400.50');
  assert.equal(regionalMoney(-1234.5,input),'−৳1,234.50');
  assert.equal(regionalMoney(-1234.5,{...input, symbol:'BDT', grouping:'International',digits:'Bangla',negativeFormat:'Parentheses'}),'(BDT ১,২৩৪.৫০)');
  assert.equal(regionalDate(new Date('2026-10-28T00:00:00Z'),{...input,dateFormat:'YYYY-MM-DD'}),'2026-10-28');
  assert.equal(validateRegional({...input,currency:'USD'}), 'The UI preview supports BDT and Asia/Dhaka only.');
});

test('VAT calculation is accurate for inclusive and exclusive examples without altering invoice records',()=>{
  assert.deepEqual(previewVat(1000,15,'Exclusive'),{base:1000,tax:150,total:1150});
  assert.deepEqual(previewVat(1150,15,'Inclusive'),{base:1000,tax:150,total:1150});
  const tax={...taxDefaults(),enabled:true,rates:[{id:'vat15',label:'VAT 15%',percentage:15,active:true}],defaultRateId:'vat15'};
  assert.equal(validateTax(tax),null);
  assert.equal(validateTax({...tax,defaultRateId:'wrong'}),'Choose an active default VAT rate.');
  assert.ok(validateTax({...tax,rates:[{...tax.rates[0],percentage:101}]}));
  assert.ok(validateSection('business',{...defaults().sections.business,tax:{...tax,rates:[{...tax.rates[0],percentage:101}]}}));
});

test('document sequences are configurable per family, unique, and never allocated by preview',()=>{
  const numbering=numberingDefaults();
  assert.equal(documentKinds.length,10);
  assert.equal(previewDocumentNumber(numbering.sale), 'INV-000001');
  assert.equal(previewDocumentNumber({...numbering.purchase,prefix:'PUR',nextNumber:125,year:'Calendar year'},2026),'PUR-2026-000125');
  assert.equal(validateNumbering(numbering),null);
  assert.equal(previewDocumentNumber(numbering.sale),'INV-000001');
  assert.ok(validateNumbering({...numbering,purchase:{...numbering.purchase,prefix:'INV'}}));
  assert.ok(validateNumbering({...numbering,sale:{...numbering.sale,digits:2}}));
});

test('editing numbering remains an audited business settings save; issued labels are untouched',()=>{
  const state=defaults(), next=structuredClone(state.sections.invoices);
  next.numbering.sale.prefix='SALE';
  next.prefix='SALE';
  next.numbering.purchase.nextNumber=120;
  const saved=saveSection(state,'mahmud','invoices',next,state.revision,'2026-10-28T00:00:00Z');
  assert.equal(saved.ok,true);
  if(!saved.ok) return;
  assert.equal(saved.state.revision,1);
  assert.equal(saved.state.sections.invoices.numbering.sale.prefix,'SALE');
  assert.equal(saved.state.events[0].section,'invoices');
  assert.equal(state.sections.invoices.prefix,'INV');
  const invalid=saveSection(state,'mahmud','invoices',{...next,prefix:'OLD'},state.revision,'2026-10-28T00:00:00Z');
  assert.equal(invalid.ok,false);
});

test('new policies are not writable by a cashier and old backups still parse',()=>{
  const state=defaults();
  const target={...state.sections.business,regional:{...state.sections.business.regional,symbol:'BDT' as const}};
  const denied=saveSection(state,'rafiq','business',target,state.revision,'2026-10-28T00:00:00Z');
  assert.equal(denied.ok,false);
  assert.equal(validateSection('business',target),null);
  assert.equal(parseSettings(JSON.stringify(state),'t1').recovered,false);
});
