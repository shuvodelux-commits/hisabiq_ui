import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import type {
  TradingLedger, TradingParty, TradingPartyList, TradingRole,
} from '../src/integration/party-reads.ts';
import {
  projectTradingDirectoryPage,
  projectTradingPartyDetail,
  projectTradingRoleLedger,
  tradingRoleForUi,
} from '../src/integration/party-read-model.ts';

const id = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const secondId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const entryId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const lineId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const sourceId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';

const customerNet = {
  netMinor: 500_000, direction: 'RECEIVABLE',
  outstandingMinor: 500_000, advanceMinor: 0,
} as const;
const supplierNet = {
  netMinor: -300_000, direction: 'PAYABLE',
  outstandingMinor: 0, advanceMinor: 300_000,
} as const;
const settled = {
  netMinor: 0, direction: 'SETTLED',
  outstandingMinor: 0, advanceMinor: 0,
} as const;

const shared: TradingParty = {
  id, name: 'Same Identity Hardware', roles: ['CUSTOMER', 'SUPPLIER'],
  phone: '01712345678', address: 'Private address', guardianName: 'Private guardian',
  nid: '1234567890', email: 'secret@example.test', notes: 'Private note',
  customerGroupId: secondId, customerGroupName: 'Retail',
  creditLimitMinor: 200_000, status: 'ACTIVE',
  isSystemReserved: false, version: 3,
  balance: customerNet, hasLedgerEntries: true,
};

function list(role: TradingRole, balance = customerNet as TradingParty['balance']): TradingPartyList {
  return {
    data: [{
      ...shared, roles: role === 'VENDOR' ? ['VENDOR'] : ['CUSTOMER', 'SUPPLIER'],
      customerGroupId: role === 'CUSTOMER' ? shared.customerGroupId : null,
      customerGroupName: role === 'CUSTOMER' ? shared.customerGroupName : null,
      creditLimitMinor: role === 'CUSTOMER' ? shared.creditLimitMinor : null,
      balance,
    }],
    summary: {
      total: 42, active: 40, inactive: 2, ungrouped: role === 'CUSTOMER' ? 9 : null,
      totalOutstandingMinor: 10_000_000,
      totalAdvanceMinor: 5_000_000,
      overCreditLimit: 7,
    },
    page: { nextCursor: secondId, hasMore: true },
  };
}

function validLedger(): TradingLedger {
  return {
    partyId: id,
    partyName: 'Same Identity Hardware',
    openingBalance: { ...settled, netMinor: 400_000, direction: 'RECEIVABLE', outstandingMinor: 400_000 },
    closingBalance: { ...settled, netMinor: 900_000, direction: 'RECEIVABLE', outstandingMinor: 900_000 },
    rows: [{
      journalEntryId: entryId, journalLineId: lineId,
      sourceDocumentType: 'OPENING_BALANCE',
      sourceDocumentId: sourceId, sourceNumber: 'OPN-000101',
      businessDate: '2026-08-01', account: 'AR',
      amountMinor: 100_000, debitMinor: 100_000, creditMinor: 0,
      runningBalanceMinor: 500_000,
    }],
    totalDebitMinor: 1_000_000, totalCreditMinor: 100_000,
    page: { nextCursor: lineId, hasMore: true },
  };
}

test('all seven UI relationship names are explicit; four finance roles and All are unsupported', () => {
  assert.equal(tradingRoleForUi('Customer'), 'CUSTOMER');
  assert.equal(tradingRoleForUi('Supplier'), 'SUPPLIER');
  assert.equal(tradingRoleForUi('Vendor'), 'VENDOR');
  for (const value of ['Lender', 'Borrower', 'Owner', 'Payee', 'All'] as const) {
    assert.equal(tradingRoleForUi(value), null);
  }
  assert.equal(tradingRoleForUi('unknown' as 'Customer'), null);
});

test('one identity Customer + Supplier keeps independent signed role nets in poisha', () => {
  const customer = projectTradingDirectoryPage('CUSTOMER', list('CUSTOMER'));
  const supplier = projectTradingDirectoryPage('SUPPLIER', list('SUPPLIER', supplierNet));
  assert.equal(customer.items[0]?.partyId, supplier.items[0]?.partyId);
  assert.deepEqual(customer.items[0]?.net, {
    signedMinor: 500_000, magnitudeMinor: 500_000, sign: 'POSITIVE_NET',
  });
  assert.deepEqual(supplier.items[0]?.net, {
    signedMinor: -300_000, magnitudeMinor: 300_000, sign: 'NEGATIVE_NET',
  });
  assert.equal(customer.selectedRole, 'CUSTOMER');
  assert.equal(supplier.selectedRole, 'SUPPLIER');
  assert.equal('balance' in (customer.items[0] ?? {}), false);
});

test('SUPPLIER and VENDOR cannot inherit Customer credit limits or group labels', () => {
  const supplier = projectTradingDirectoryPage('SUPPLIER', list('SUPPLIER', supplierNet));
  const vendor = projectTradingDirectoryPage('VENDOR', list('VENDOR', supplierNet));
  for (const view of [supplier, vendor]) {
    assert.equal(view.items[0]?.customerCreditLimitMinor, null);
    assert.equal(view.items[0]?.customerGroupName, null);
    assert.equal(view.selectedRoleSummary.ungroupedCustomers, null);
    assert.equal(view.selectedRoleSummary.overCustomerCreditLimit, null);
  }
  const customer = projectTradingDirectoryPage('CUSTOMER', list('CUSTOMER'));
  assert.equal(customer.items[0]?.customerCreditLimitMinor, 200_000);
  assert.equal(customer.items[0]?.customerGroupName, 'Retail');
  assert.equal(customer.selectedRoleSummary.ungroupedCustomers, 9);
});

test('server pagination summary is authoritative, not a total forged from current page', () => {
  const view = projectTradingDirectoryPage('CUSTOMER', list('CUSTOMER'));
  assert.equal(view.items.length, 1);
  assert.equal(view.selectedRoleSummary.total, 42);
  assert.equal(view.selectedRoleSummary.positiveNetTotalMinor, 10_000_000);
  assert.equal(view.selectedRoleSummary.negativeNetMagnitudeTotalMinor, 5_000_000);
  assert.deepEqual(view.page, { nextCursor: secondId, hasMore: true });
});

test('excludes private PII and party-wide hasLedgerEntries from presentation model', () => {
  const view = projectTradingPartyDetail('CUSTOMER', { data: shared });
  const serialized = JSON.stringify(view);
  assert.equal(serialized.includes('1234567890'), false);
  assert.equal(serialized.includes('Private address'), false);
  assert.equal(serialized.includes('Private guardian'), false);
  assert.equal(serialized.includes('Private note'), false);
  assert.equal(serialized.includes('secret@example.test'), false);
  assert.equal(serialized.includes('hasLedgerEntries'), false);
  assert.deepEqual(view.item.visibleTradingRoles, ['CUSTOMER', 'SUPPLIER']);
  assert.equal(view.item.version, 3);
});

test('a selected role not present in the returned list or detail is rejected', () => {
  assert.throws(() => projectTradingDirectoryPage('VENDOR', list('CUSTOMER')), ApiError);
  assert.throws(() => projectTradingPartyDetail('VENDOR', { data: shared }), ApiError);
  assert.throws(() => projectTradingDirectoryPage('OWNER' as TradingRole, list('CUSTOMER')), ApiError);
});

test('mixed role balances never get combined through one directory read model', () => {
  const customer = projectTradingDirectoryPage('CUSTOMER', list('CUSTOMER'));
  const supplier = projectTradingDirectoryPage('SUPPLIER', list('SUPPLIER', supplierNet));
  assert.equal(customer.items[0]?.net.signedMinor, 500_000);
  assert.equal(supplier.items[0]?.net.signedMinor, -300_000);
  assert.equal('allRolesNetMinor' in customer.selectedRoleSummary, false);
  assert.equal('allRolesNetMinor' in supplier.selectedRoleSummary, false);
});

test('ledger preserves posted source lineage without offering edit/reverse actions', () => {
  const result = projectTradingRoleLedger('CUSTOMER', id, validLedger());
  assert.equal(result.partyId, id);
  assert.equal(result.selectedRole, 'CUSTOMER');
  assert.deepEqual(result.rows[0], {
    journalEntryId: entryId, journalLineId: lineId,
    sourceDocumentType: 'OPENING_BALANCE', sourceDocumentId: sourceId,
    sourceNumber: 'OPN-000101', businessDate: '2026-08-01', controlAccount: 'AR',
    debitMinor: 100_000, creditMinor: 0, amountMinor: 100_000,
    runningRoleNet: { signedMinor: 500_000, magnitudeMinor: 500_000, sign: 'POSITIVE_NET' },
  });
  assert.equal('canEdit' in result.rows[0]!, false);
  assert.equal('canReverse' in result.rows[0]!, false);
});

test('filtered/paginated ledger opening snapshot is not relabeled historical opening', () => {
  const ledger = projectTradingRoleLedger('CUSTOMER', id, validLedger());
  assert.equal(ledger.serverOpeningNet.signedMinor, 400_000);
  assert.equal(ledger.serverClosingNet.signedMinor, 900_000);
  assert.equal(ledger.rows.at(-1)?.runningRoleNet.signedMinor, 500_000);
  assert.deepEqual(ledger.serverTotals, { debitMinor: 1_000_000, creditMinor: 100_000 });
  assert.deepEqual(ledger.page, { nextCursor: lineId, hasMore: true });
  assert.equal('historicalOpeningMinor' in ledger, false);
});

test('wrong ledger account family, foreign party, or invalid source is refused', () => {
  const valid = validLedger();
  assert.throws(() => projectTradingRoleLedger('SUPPLIER', id, valid), ApiError);
  assert.throws(() => projectTradingRoleLedger('CUSTOMER', secondId, valid), ApiError);
  assert.throws(() => projectTradingRoleLedger('CUSTOMER', id, {
    ...valid, rows: [{ ...valid.rows[0]!, account: 'AP' }],
  }), ApiError);
  assert.throws(() => projectTradingRoleLedger('CUSTOMER', id, {
    ...valid, rows: [{ ...valid.rows[0]!, sourceDocumentId: 'preview-sale-1' }],
  }), ApiError);
});

test('empty settled role is zero without manufacturing a receivable or payable', () => {
  const empty = list('CUSTOMER', settled);
  empty.page = { nextCursor: null, hasMore: false };
  empty.data = [{ ...empty.data[0]!, balance: settled }];
  const result = projectTradingDirectoryPage('CUSTOMER', empty);
  assert.deepEqual(result.items[0]?.net, {
    signedMinor: 0, magnitudeMinor: 0, sign: 'ZERO_NET',
  });
});
