import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canReadSalesInvoices, SALES_INVOICE_VIEW_PERMISSION } from '../src/integration/sales-read-permissions.ts';

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), 'utf8');

test('R09-PERM-01 Nest canonical SaleQueryService SALE_VIEW code is exact', () => {
  assert.equal(SALES_INVOICE_VIEW_PERMISSION, 'sale.invoice.view');
});

test('R09-PERM-02 verified connected user with canonical sale.invoice.view sees invoices', () => {
  assert.equal(canReadSalesInvoices('connected', { status: 'authenticated', permissions: ['sale.invoice.view'] }), true);
  assert.equal(canReadSalesInvoices('connected', { status: 'authenticated', permissions: ['sale.invoice.view', 'sales.return.create'] }), true);
});

test('R09-PERM-03 legacy unrecognized sale.view alias never grants invoice access', () => {
  assert.equal(canReadSalesInvoices('connected', { status: 'authenticated', permissions: ['sale.view'] }), false);
  assert.equal(canReadSalesInvoices('connected', { status: 'authenticated', permissions: ['sales.return.view', 'sales.return.create'] }), false);
});

test('R09-PERM-04 return, cost, inventory, product and POS permissions are not invoice view', () => {
  for (const code of ['sales.return.create', 'sales.return.view', 'inventory.cost.view', 'product.view', 'sale.invoice.create']) {
    assert.equal(canReadSalesInvoices('connected', { status: 'authenticated', permissions: [code] }), false, code);
  }
});

test('R09-PERM-05 preview never accesses live invoices despite any permissions', () => {
  assert.equal(canReadSalesInvoices('preview', { status: 'authenticated', permissions: ['sale.invoice.view'] }), false);
});

test('R09-PERM-06 locked, offline, signed out and authenticating states mask invoice access', () => {
  for (const status of ['locked', 'signed-out', 'authenticating', 'preview', 'offline']) {
    assert.equal(canReadSalesInvoices('connected', { status, permissions: ['sale.invoice.view'] }), false, status);
  }
});

test('R09-PERM-07 absent/null/invalid permission sets fail closed', () => {
  assert.equal(canReadSalesInvoices('connected', { status: 'authenticated' }), false);
  assert.equal(canReadSalesInvoices('connected', { status: 'authenticated', permissions: null }), false);
  assert.equal(canReadSalesInvoices('connected', { status: 'authenticated', permissions: 'sale.invoice.view' as unknown as string[] }), false);
});

test('R09-PERM-08 revoking a permission synchronously denies access without cached grants', () => {
  const active = Object.freeze({ status: 'authenticated', permissions: Object.freeze(['sale.invoice.view']) });
  const revoked = Object.freeze({ status: 'authenticated', permissions: Object.freeze([] as string[]) });
  assert.equal(canReadSalesInvoices('connected', active), true);
  assert.equal(canReadSalesInvoices('connected', revoked), false);
  assert.equal(canReadSalesInvoices('connected', active), true);
});

test('R09-PERM-09 both unmounted connected Sales consumers use one canonical gate', () => {
  const panel = read('../src/components/sales/ConnectedSalesInvoicesPanel.tsx');
  const workspace = read('../src/components/sales/ConnectedSalesReadWorkspace.tsx');
  assert.match(panel, /canReadSalesInvoices\(mode,\s*snapshot\)/);
  assert.match(workspace, /canReadSalesInvoices\(mode,\s*snapshot\)/);
  assert.doesNotMatch(panel, /permissions\.includes\('sale\.view'\)/);
  assert.doesNotMatch(workspace, /permissions\.includes\('sale\.view'\)/);
});

test('R09-PERM-10 original preview, global route gate and return permissions remain separate', () => {
  const preview = read('../src/pages/Sales.tsx');
  const app = read('../src/App.tsx');
  const gate = read('../src/integration/ConnectedWorkspaceGate.tsx');
  const workspace = read('../src/components/sales/ConnectedSalesReadWorkspace.tsx');
  assert.match(preview, /subscribeSalesPreview/);
  assert.match(app, /ConnectedWorkspaceGate/);
  assert.match(gate, /workspace=pending/);
  assert.doesNotMatch(preview, /canReadSalesInvoices/);
  assert.doesNotMatch(app, /ConnectedSalesReadWorkspace/);
  assert.doesNotMatch(gate, /ConnectedSalesReadWorkspace/);
  assert.match(workspace, /snapshot\.permissions\.includes\('sales\.return\.create'\)/);
  assert.match(workspace, /snapshot\.permissions\.includes\('sales\.return\.view'\)/);
});
