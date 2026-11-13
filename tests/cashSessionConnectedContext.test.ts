import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Explicit source ownership invariants for M5-01b-P1. UI browser and real API
// acceptance remain independent gates; these do not pretend to be E2E tests.
const context = readFileSync(new URL('../src/contexts/CashSessionContext.tsx', import.meta.url), 'utf8');
const dialog = readFileSync(new URL('../src/components/layout/CashSessionDialog.tsx', import.meta.url), 'utf8');
const topbar = readFileSync(new URL('../src/components/layout/TopBar.tsx', import.meta.url), 'utf8');
const finance = readFileSync(new URL('../src/pages/Finance.tsx', import.meta.url), 'utf8');
const gate = readFileSync(new URL('../src/integration/ConnectedWorkspaceGate.tsx', import.meta.url), 'utf8');

test('cash provider must preserve preview store and use verified session identity', () => {
  assert.match(context, /new CashSessionStore\(/);
  assert.match(context, /useSession\(/);
  assert.match(context, /auth\.accessToken/);
  assert.match(context, /auth\.tenantId/);
  assert.match(context, /auth\.epoch/);
  assert.doesNotMatch(context, /shererp_auth_token|localStorage/);
});

test('actual cash mutations require confirmed API, canonical operation and never preview fallback', () => {
  assert.match(context, /generateOperationId\(/);
  assert.match(context, /startCashDay\(/);
  assert.match(context, /closeCashDay\(/);
  assert.match(context, /reopenCashDay\(/);
  assert.match(context, /cashToMinor\(/);
  assert.match(context, /pendingOperation/);
  assert.match(context, /AbortController/);
  assert.match(dialog, /await .*startSession\(/);
  assert.match(dialog, /await .*saveCount\(/);
});

test('topbar and finance show tenant-authoritative session state without injected demo cash history', () => {
  assert.match(topbar, /enabled/);
  assert.match(finance, /cashMode/);
  assert.match(finance, /sampleCashSessions/);
  assert.match(finance, /cashMode\s*===\s*['"]preview['"]/);
});

test('global connected workspace safety gate remains in place', () => {
  assert.match(gate, /Navigate to="\/login\?workspace=pending"/);
  assert.match(gate, /snapshot\.status === 'authenticated'/);
});
