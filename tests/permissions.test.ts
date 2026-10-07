import test from 'node:test';
import assert from 'node:assert/strict';
import type { TransactionSource } from '../src/types/transactions.ts';

async function permissionsModule() {
  const mod = await import('../src/utils/permissions.ts').catch(() => null);
  assert.ok(mod, 'permissions module should exist');
  return mod;
}

test('Daybook edit and delete inherit source-module permissions', async () => {
  const mod = await permissionsModule();
  const source: TransactionSource = 'sale';
  const granted = new Set(['daybook.view', 'sales.view', 'sales.edit']);

  assert.equal(mod.canDaybookAction('open', source, granted), true);
  assert.equal(mod.canDaybookAction('edit', source, granted), true);
  assert.equal(mod.canDaybookAction('delete', source, granted), false);
});

test('Audit correction and delete require both Audit Ledger and source permissions', async () => {
  const mod = await permissionsModule();
  const source: TransactionSource = 'expense';
  const granted = new Set(['audit.view', 'audit.correct', 'expenses.view', 'expenses.edit']);

  assert.equal(mod.canAuditAction('view', source, granted), true);
  assert.equal(mod.canAuditAction('correct', source, granted), true);
  assert.equal(mod.canAuditAction('delete', source, granted), false);
});

test('source groups map finance and accounting records to their owning modules', async () => {
  const mod = await permissionsModule();
  assert.equal(mod.sourcePermissionGroup('transfer'), 'finance');
  assert.equal(mod.sourcePermissionGroup('adjustment'), 'accounts');
  assert.equal(mod.sourcePermissionGroup('stock-adjustment'), 'products');
});
