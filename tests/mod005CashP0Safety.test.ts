import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const context = readFileSync(new URL('../src/contexts/CashSessionContext.tsx', import.meta.url), 'utf8');
const dialog = readFileSync(new URL('../src/components/layout/CashSessionDialog.tsx', import.meta.url), 'utf8');

test('cash day remains independently readable when account list is permission-denied', () => {
  assert.match(context, /const day = await fetchCashDay\(/);
  assert.match(context, /Promise\.allSettled\(/);
  assert.match(context, /accountsAccess:/);
  assert.match(context, /PERMISSION_DENIED|permission-denied/);
  assert.doesNotMatch(context, /Promise\.all\(\[\s*fetchCashHistory[\s\S]*fetchCashAccounts/);
});

test('account denial never silently substitutes preview fixtures or leaks loan liabilities', () => {
  assert.match(dialog, /accountsAccess/);
  assert.match(dialog, /a\.type === 'CASH' \|\| a\.type === 'BANK'/);
  assert.match(dialog, /serverAccounts\.filter\(a=>a\.type === 'CASH' \|\| a\.type === 'BANK'\)/);
  assert.match(context, /mode === 'preview'/);
});

test('same-identity verified bearer refresh must not reset the outstanding economic intent', () => {
  assert.match(context, /lifecycleIdentity/);
  assert.match(context, /if \(identityChanged\)/);
  assert.match(context, /pendingOperation\.current = null/);
  assert.match(context, /pendingOperation\.current\?\.id \?\? generateOperationId\(\)/);
  assert.match(context, /pendingOperation\.current = \{ identity, fingerprint, id: operationId \}/);
  assert.doesNotMatch(context, /useEffect\(\(\) => \{[\s\S]{0,200}pendingOperation\.current = null;[\s\S]{0,500}\}, \[identity, refresh\]\)/);
});

test('old credential results may not overwrite a newly verified identity revision', () => {
  assert.match(context, /activeVerifiedSnapshot/);
  assert.match(context, /activeVerifiedSnapshot\.current === auth/);
  assert.match(context, /readGeneration\.current/);
  assert.match(context, /controller\.signal\.aborted/);
});

test('connected account choices do not rely on absent bank/account permissions', () => {
  assert.match(dialog, /accountsAccess !== 'available'/);
  assert.match(dialog, /text\('Account choices unavailable/);
  assert.match(dialog, /OWNER_CURRENT_ACCOUNT/);
});
