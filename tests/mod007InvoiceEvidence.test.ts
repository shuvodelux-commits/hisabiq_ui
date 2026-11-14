import test from 'node:test';
import assert from 'node:assert/strict';
import { invoiceReceipt, invoiceQuantity, returnDocument } from '../src/utils/salesDocuments.ts';
import { salesInvoices, salesReturns } from '../src/data/sales.ts';
import type { SalesInvoice, SalesReturn } from '../src/types/erp.ts';

/**
 * MOD-007 V7-14: source-immutable invoice evidence, PREVIEW-only.
 * These tests do not assert that any preview invoice was posted to Nest/PG.
 */
function copyInvoice(index: number): SalesInvoice {
  const sample = salesInvoices[index];
  assert.ok(sample);
  return structuredClone(sample);
}

test('issued receipt snapshot remains authoritative after product, price and party edits', () => {
  const invoice = copyInvoice(2);
  const frozen = invoiceReceipt(invoice);
  invoice.documentSnapshot = structuredClone(frozen);
  invoice.invoice = 'EDITED-CLIENT-NUMBER';
  invoice.party = 'Changed Party Name';
  invoice.subtotal += 9999;
  invoice.total += 9999;
  invoice.paid = 0;
  invoice.due = 9999;
  invoice.lines[0].name = 'Renamed in catalogue';
  invoice.lines[0].price = 99999;
  invoice.lines[0].quantity = '9999 Cartons';
  invoice.payments[0].amount = 99999;
  assert.deepEqual(invoiceReceipt(invoice), frozen);
});

test('issued receipt returns independent deep copies across calls and nested serial edits', () => {
  const invoice = copyInvoice(3);
  invoice.documentSnapshot = invoiceReceipt(invoice);
  const before = structuredClone(invoice.documentSnapshot);
  const first = invoiceReceipt(invoice);
  const second = invoiceReceipt(invoice);
  assert.notStrictEqual(first, second);
  assert.notStrictEqual(first.lines[0], second.lines[0]);
  first.lines[0].serials?.push('INJECTED');
  if (first.lines[0].warranty) first.lines[0].warranty.terms = 'CHANGED TERMS';
  first.invoice = 'HACKED';
  assert.deepEqual(invoice.documentSnapshot, before);
  assert.deepEqual(second, before);
});

test('preview receipt materialization must not alias source line serials or warranty', () => {
  const source = copyInvoice(3);
  const initialSerials = [...(source.lines[0].serials ?? [])];
  const originalTerms = source.lines[0].warranty?.terms;
  const receipt = invoiceReceipt(source);
  source.lines[0].serials?.push('ADDED-LATER');
  if (source.lines[0].warranty) source.lines[0].warranty.terms = 'New terms';
  assert.deepEqual(receipt.lines[0].serials, initialSerials);
  assert.equal(receipt.lines[0].warranty?.terms, originalTerms);
});

test('editing a returned preview receipt must not write back to source invoice', () => {
  const source = copyInvoice(3);
  const receipt = invoiceReceipt(source);
  receipt.lines[0].serials?.push('VIEW-ONLY');
  if (receipt.lines[0].warranty) receipt.lines[0].warranty.terms = 'VIEW-ONLY';
  assert.deepEqual(source.lines[0].serials, ['LB12-3001', 'LB12-3002']);
  assert.equal(source.lines[0].warranty?.terms,
    'Original invoice required. Physical damage is not covered.');
});

test('bundle invoice receipt keeps historical component recipe independent of source edits', () => {
  const source = salesInvoices.find(row => row.id === 'sample-bundle-return');
  assert.ok(source, 'demo bundle source exists only to test preview serialization');
  const invoice = structuredClone(source);
  const receipt = invoiceReceipt(invoice);
  const before = structuredClone(receipt.lines[0].bundleSnapshot);
  assert.ok(before);
  const bundle = invoice.lines[0].bundleSnapshot;
  assert.ok(bundle);
  bundle.components[0].name = 'Edited component name';
  bundle.components[0].lotAllocations[0].quantity = 9999;
  assert.deepEqual(receipt.lines[0].bundleSnapshot, before);
});

test('receipt bundle snapshot must not write into source when print copy is edited', () => {
  const original = salesInvoices.find(row => row.id === 'sample-bundle-return');
  assert.ok(original);
  const invoice = structuredClone(original);
  const oldName = invoice.lines[0].bundleSnapshot?.components[0].name;
  const receipt = invoiceReceipt(invoice);
  assert.ok(receipt.lines[0].bundleSnapshot);
  receipt.lines[0].bundleSnapshot.components[0].name = 'print-only';
  assert.equal(invoice.lines[0].bundleSnapshot?.components[0].name, oldName);
});

for (const [index, status] of [[0, 'Due'], [1, 'Paid'], [2, 'Partial'], [3, 'Part returned']] as const) {
  test('receipt must preserve original posted amounts and no synthetic posting for ' + status, () => {
    const source = copyInvoice(index);
    const before = structuredClone(source);
    const printed = invoiceReceipt(source);
    assert.equal(printed.invoice, source.invoice);
    assert.equal(printed.subtotal, source.subtotal);
    assert.equal(printed.discount, source.discount);
    assert.equal(printed.rounding, source.rounding);
    assert.equal(printed.total, source.total);
    assert.equal(printed.paid, source.paid);
    assert.equal(printed.due, source.due);
    assert.equal(printed.payments?.length, source.payments.length);
    assert.deepEqual(source, before, 'printing cannot alter source data');
  });
}

test('split payment copies preserve account identities and do not fabricate cash settlements', () => {
  const source = copyInvoice(2);
  const receipt = invoiceReceipt(source);
  assert.equal(receipt.method, 'Multiple');
  assert.deepEqual(receipt.payments?.map(p => [p.method, p.account, p.amount]),
    source.payments.map(p => [p.method, p.account, p.amount]));
  source.payments[0].amount = 99999;
  assert.notEqual(receipt.payments?.[0]?.amount, 99999);
  const unpaid = invoiceReceipt(copyInvoice(0));
  assert.deepEqual(unpaid.payments, []);
  assert.equal(unpaid.paid, 0);
  assert.ok(unpaid.due > 0);
});

test('exact source discount/rounding and due are printed, never recomputed', () => {
  const source = copyInvoice(2);
  source.discount = 13.25;
  source.rounding = -0.25;
  source.total = 9876;
  source.paid = 4321;
  source.due = 5555;
  const receipt = invoiceReceipt(source);
  assert.equal(receipt.discount, 13.25);
  assert.equal(receipt.rounding, -0.25);
  assert.equal(receipt.total, 9876);
  assert.equal(receipt.paid, 4321);
  assert.equal(receipt.due, 5555);
});

for (const [qty, unit, expected] of [
  ['2 Box', 'Pcs', '2 Box Pcs'],
  ['3 Box 6 Pcs', 'Pcs', '3 Box 6 Pcs'],
  ['220', 'Kg', '220 Kg'],
] as const) {
  test('quantity presentation keeps literal compound labels: ' + qty, () => {
    assert.equal(invoiceQuantity({ ...copyInvoice(0).lines[0], quantity: qty, unit }), expected);
  });
}

test('source-linked return report never invents a Cash/Bank refund for advance credit', () => {
  const source = structuredClone(salesReturns[0]);
  assert.ok(source);
  const item: SalesReturn = {
    ...source, id: 'SRETURN-QA', invoices: ['INV-ORIGINAL-01', 'INV-ORIGINAL-02'],
    settlement: 'Customer credit', refundMethod: undefined, refundAccount: undefined,
  };
  const report = returnDocument(item, 'English');
  assert.deepEqual(report.rows.find(row => row[0] === 'Original invoices'),
    ['Original invoices', 'INV-ORIGINAL-01, INV-ORIGINAL-02']);
  assert.deepEqual(report.rows.find(row => row[0] === 'Refund method'), ['Refund method', '—']);
  assert.deepEqual(report.rows.find(row => row[0] === 'Refund account'), ['Refund account', '—']);
});

test('refund method/account copy exactly the source, with no alternative account', () => {
  const source = structuredClone(salesReturns[0]);
  assert.ok(source);
  const item: SalesReturn = {
    ...source, settlement: 'Cash refund',
    refundMethod: 'Bank', refundAccount: 'DBBL Test Source 123',
  };
  const report = returnDocument(item, 'English');
  assert.deepEqual(report.rows.find(row => row[0] === 'Refund method'), ['Refund method', 'Bank']);
  assert.deepEqual(report.rows.find(row => row[0] === 'Refund account'),
    ['Refund account', 'DBBL Test Source 123']);
});
