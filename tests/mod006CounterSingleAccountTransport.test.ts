import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ApiError } from '../src/integration/errors.ts';
import {
  counterTakaToMinor, recordSingleAccountCounterSettlement,
} from '../src/integration/counter-single-account.ts';

const shop = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const customer = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const supplier = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const sale = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const operation = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const token = 'verified-connected-session-token';
const account = (type = 'BANK', overrides = {}) => ({
  id: shop, name: 'Account', type, holderName: null, reference: null, isDrawer: false,
  status: 'ACTIVE', balanceMinor: 100_000, openingAmountMinor: 100_000,
  openingDate: '2026-01-01', version: 1, ...overrides,
});
const tender = (type = 'BANK', method = 'Bank', amount = '23.50') =>
  ({ method, account: account(type), amount });
const draft = (kind = 'CUSTOMER_RECEIPT', overrides = {}) => ({
  kind, partyId: kind === 'CUSTOMER_RECEIPT' ? customer : supplier,
  operationId: operation, sources: [tender()], ...overrides,
});
const customerReply = (overrides = {}) => ({ data: {
  id: operation, number: 'CR-001', customerPartyId: customer,
  customerName: 'Customer', accountCode: 'BANK:' + shop, accountName: 'Account',
  amountMinor: 2350, settledMinor: 1000, advanceMinor: 1350,
  businessDate: '2026-11-15', note: null,
  allocations: [{ saleId: sale, saleNumber: 'S-001', amountMinor: 1000 }],
  status: 'POSTED', entryMode: 'ON_TIME', voidReason: null, version: 1,
  ...overrides,
} });
const supplierReply = (overrides = {}) => ({ data: {
  id: operation, number: 'SP-001', supplierPartyId: supplier,
  supplierName: 'Supplier', accountCode: 'BANK:' + shop, accountName: 'Account',
  amountMinor: 2350, businessDate: '2026-11-15', note: null,
  allocations: [{ purchaseId: sale, purchaseNumber: 'P-001', amountMinor: 2350 }],
  outstandingAfterMinor: 7650, createdAt: '2026-11-15T04:00:00.000Z',
  status: 'POSTED', entryMode: 'ON_TIME', voidReason: null, version: 1,
  ...overrides,
} });

const initialFetch = globalThis.fetch;
const initialLocation = Object.getOwnPropertyDescriptor(globalThis, 'location');
Object.defineProperty(globalThis, 'location', {
  value: { origin: 'https://erp.local.test' }, configurable: true,
});
after(() => {
  globalThis.fetch = initialFetch;
  if (initialLocation) Object.defineProperty(globalThis, 'location', initialLocation);
  else delete globalThis.location;
});

let calls = [];
function reply(body, status = 201) {
  calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify(body), {
      status, headers: { 'content-type': 'application/json' },
    });
  };
}
async function invalid(input, expected = 'protocol') {
  calls = [];
  globalThis.fetch = async () => {
    calls.push('unexpected');
    throw new Error('must not send');
  };
  await assert.rejects(
    recordSingleAccountCounterSettlement(token, input),
    error => error instanceof ApiError && error.kind === expected,
  );
  assert.equal(calls.length, 0, 'invalid draft must not reach network');
}

test('exact decimal taka becomes integer poisha without floating-point rounding', () => {
  assert.equal(counterTakaToMinor('0.01'), 1);
  assert.equal(counterTakaToMinor('0.10'), 10);
  assert.equal(counterTakaToMinor('2'), 200);
  assert.equal(counterTakaToMinor('23.50'), 2350);
  assert.equal(counterTakaToMinor('90071992547409.91'), 9007199254740991);
  for (const value of ['0', '0.00', '0.001','12.345','-2','1e3','NaN','1,500',
    '', ' 1.20', '90071992547409.92']) {
    assert.throws(() => counterTakaToMinor(value), { name: 'ApiError' }, value);
  }
});

test('customer BANK oldest-first POST uses exact Nest fields, token and stable operation id', async () => {
  reply(customerReply());
  const source = draft();
  const result = await recordSingleAccountCounterSettlement(token, source);
  assert.equal(result.kind, 'CUSTOMER_RECEIPT');
  assert.equal(result.data.id, operation);
  if (result.kind === 'CUSTOMER_RECEIPT') {
    assert.equal(result.data.allocations[0].saleId, sale);
    assert.equal(result.data.allocations[0].saleNumber, 'S-001');
  }
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://erp.local.test/api/v1/customer-payments');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.get('Authorization'), 'Bearer ' + token);
  assert.equal(calls[0].options.headers.get('Idempotency-Key'), operation);
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    customerPartyId: customer, accountCode: 'BANK:' + shop,
    amountMinor: 2350, saleIds: [], note: null,
  });
  assert.equal(source.sources[0].amount, '23.50', 'no draft mutation');
});

test('supplier BANK oldest-first POST uses source-specific route and settlement schema', async () => {
  reply(supplierReply({ businessDate: '2026-11-14', note: 'Oldest bill' }));
  const result = await recordSingleAccountCounterSettlement(token, draft('SUPPLIER_PAYMENT', {
    businessDate: '2026-11-14', note: 'Oldest bill',
  }));
  assert.equal(result.kind, 'SUPPLIER_PAYMENT');
  assert.equal(result.data.outstandingAfterMinor, 7650);
  if (result.kind === 'SUPPLIER_PAYMENT') {
    assert.equal(result.data.allocations[0].purchaseId, sale);
    assert.equal(result.data.allocations[0].purchaseNumber, 'P-001');
  }
  assert.equal(calls[0].url, 'https://erp.local.test/api/v1/suppliers/payments');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    supplierPartyId: supplier, amountMinor: 2350, accountCode: 'BANK:' + shop,
    purchaseId: null, note: 'Oldest bill', businessDate: '2026-11-14',
  });
});

test('CASH and Mobile Banking resolve through real account type; MFS journal is BANK', async () => {
  reply(customerReply({ accountCode: 'CASH:' + shop }));
  await recordSingleAccountCounterSettlement(token, draft('CUSTOMER_RECEIPT',{
    sources: [tender('CASH','Cash')],
  }));
  assert.equal(JSON.parse(calls[0].options.body).accountCode, 'CASH:' + shop);

  reply(customerReply());
  await recordSingleAccountCounterSettlement(token, draft('CUSTOMER_RECEIPT',{
    sources: [tender('MFS','Mobile Banking')],
  }));
  assert.equal(JSON.parse(calls[0].options.body).accountCode, 'BANK:' + shop);
});

test('rejects split tender, zero sources, discount and unverified invoice mapping before POST', async () => {
  await invalid(draft('CUSTOMER_RECEIPT', { sources: [] }));
  await invalid(draft('CUSTOMER_RECEIPT', { sources: [tender(),tender()] }));
  await invalid(draft('CUSTOMER_RECEIPT', { discount: '5' }));
  await invalid(draft('SUPPLIER_PAYMENT', { invoiceId: sale }));
  await invalid(draft('CUSTOMER_RECEIPT', { discountReason: 'unmapped settlement' }));
});

test('rejects preview party/account IDs, stale inactive/LOAN sources and method mismatch', async () => {
  await invalid(draft('CUSTOMER_RECEIPT', { partyId:'preview-123' }));
  await invalid(draft('CUSTOMER_RECEIPT', { operationId:'counter-' + Date.now() }));
  await invalid(draft('CUSTOMER_RECEIPT', { sources: [tender('BANK','Cash')] }));
  await invalid(draft('CUSTOMER_RECEIPT', { sources: [tender('LOAN','Bank')] }));
  await invalid(draft('CUSTOMER_RECEIPT', { sources: [{
    ...tender(), account: account('BANK',{ status: 'INACTIVE' }),
  }] }));
  await invalid(draft('CUSTOMER_RECEIPT', { sources: [{
    ...tender(), account: account('BANK',{ id: 'preview-bank' }),
  }] }));
  await invalid(draft('CUSTOMER_RECEIPT', { sources: [tender('BANK','Bank','0.00001')] }));
});

test('rejects invalid date, untrusted token, unsupported business action or invalid timeout', async () => {
  await invalid(draft('CUSTOMER_RECEIPT', { businessDate: '2026-02-30' }));
  await invalid(draft('FINANCE_OWNER_CREDIT'));
  calls = [];
  globalThis.fetch = async () => { calls.push('unexpected'); throw Error('unexpected'); };
  await assert.rejects(recordSingleAccountCounterSettlement('bad token',draft()),
    { name: 'ApiError', kind: 'protocol' });
  await assert.rejects(recordSingleAccountCounterSettlement(token,draft(),undefined,0),
    { name: 'ApiError', kind: 'protocol' });
  assert.equal(calls.length, 0);
});

test('HTTP denial and state conflicts preserve the caller operation id and never retry', async () => {
  for (const status of [400,403,409,500]) {
    reply({ error: { code:'CONFLICT',message:'Denied',details:{},traceId:'test-trace' }},status);
    const source = draft();
    await assert.rejects(recordSingleAccountCounterSettlement(token,source), error =>
      error instanceof ApiError && error.kind === 'http' && error.status === status);
    assert.equal(calls.length, 1);
    assert.equal(source.operationId, operation);
  }
});

test('malformed or mismatched server response is never reported as a posted receipt', async () => {
  const cases = [
    { data: {} }, { data: { ...customerReply().data, customerPartyId:supplier } },
    customerReply({ accountCode:'CASH:' + shop }),
    customerReply({ amountMinor: 2351 }),
    customerReply({ settledMinor: 2000 }),
    customerReply({ allocations: [{ saleId: 'local-sale',saleNumber:'S-1',amountMinor:1000 }] }),
    customerReply({ status:'VOIDED' }),
  ];
  for (const data of cases) {
    reply(data);
    await assert.rejects(recordSingleAccountCounterSettlement(token,draft()),
      { name:'ApiError',kind:'protocol' });
    assert.equal(calls.length, 1);
  }
});

test('network uncertainty never triggers an automatic second payment', async () => {
  calls = [];
  globalThis.fetch = async (url,options) => {
    calls.push({url,options});
    throw new TypeError('offline / lost response');
  };
  const source = draft();
  await assert.rejects(recordSingleAccountCounterSettlement(token,source),
    { name:'ApiError',kind:'network' });
  assert.equal(calls.length, 1);
  assert.equal(source.operationId, operation);
  assert.equal(source.sources[0].amount, '23.50');
});

test('caller-initiated replay retains the SAME idempotency key, not a new payment', async () => {
  reply(customerReply());
  const source = draft();
  await recordSingleAccountCounterSettlement(token,source);
  await recordSingleAccountCounterSettlement(token,source);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.headers.get('Idempotency-Key'),operation);
  assert.equal(calls[1].options.headers.get('Idempotency-Key'),operation);
});

test('caller aborted request never sends an operation', async () => {
  const controller = new AbortController();
  controller.abort();
  calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({url,options});
    assert.equal(options.signal.aborted,true);
    throw new DOMException('Aborted','AbortError');
  };
  await assert.rejects(recordSingleAccountCounterSettlement(token,draft(),controller.signal),
    { name:'ApiError',kind:'network' });
  assert.equal(calls.length,1); // transport receives aborted signal; no successful posting
});

test('transport remains unmounted and existing Counter/Finance preview and workspace gate remain intact', () => {
  const code = readFileSync(new URL('../src/integration/counter-single-account.ts',import.meta.url),'utf8');
  const workspace = readFileSync(new URL('../src/integration/ConnectedWorkspaceGate.tsx',import.meta.url),'utf8');
  const counter = readFileSync(new URL('../src/components/finance/CounterWorkspace.tsx',import.meta.url),'utf8');
  assert.doesNotMatch(code,/dispatchPartyPreview|setAccounts\(|getFinancePreviewSnapshot|localStorage/);
  assert.match(workspace,/workspace=pending/);
  assert.match(counter,/dispatchPartyPreview\(\{type:'record-payment',payload\}/);
  assert.doesNotMatch(counter,/counter-single-account/);
});
