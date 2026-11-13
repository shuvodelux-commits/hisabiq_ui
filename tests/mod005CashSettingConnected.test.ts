import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** M5-01c scoped safeguards: connected settings must never silently fall
 * back to preview cash policy, or claim an uncertain POST was confirmed. */
const ui = readFileSync(new URL('../src/settings/magic/GeneralSettingsSection.tsx', import.meta.url), 'utf8');
const cashApi = readFileSync(new URL('../src/services/cashSessionApi.ts', import.meta.url), 'utf8');
const bridge = readFileSync(new URL('../src/settings/magic/settingsBridge.ts', import.meta.url), 'utf8');

test('reuses exact authorised settings transport, without a new settings writer', () => {
  assert.match(ui, /import \{ saveCashEnabled \} from '\.\.\/\.\.\/services\/cashSessionApi\.ts'/);
  assert.match(cashApi, /method: 'POST', path: '\/api\/v1\/settings\/value'/);
  assert.match(cashApi, /key: 'cash_session_enabled', value: enabled \? 'on' : 'off'/);
  assert.match(ui, /await saveCashEnabled\(token, enabled, controller\.signal\)/);
  assert.doesNotMatch(ui, /fetch\('\/api\/v1\/settings\/value'/);
});

test('connected toggle uses only server-verified on or off, never preview fallback', () => {
  assert.match(ui, /const serverCashValue = verified\?\.values\.cash_session_enabled/);
  assert.match(ui, /serverCashValue === 'on' \|\| serverCashValue === 'off'/);
  assert.match(ui, /checked=\{bridge\.connected \? serverCashValue === 'on' : tenant\.sections\.money\.cashSession\}/);
  assert.match(ui, /!cashValueKnown/);
  assert.match(ui, /Verified server setting is unavailable/);
});

test('connected write requires authenticated role and server settings permissions', () => {
  assert.match(ui, /section\.id === 'finance' && snapshot\.status === 'authenticated'/);
  assert.match(ui, /snapshot\.permissions\.includes\('settings\.setting\.view'\)/);
  assert.match(ui, /snapshot\.permissions\.includes\('settings\.setting\.edit'\)/);
  assert.match(ui, /!canWriteCash \|\| cashSaving \|\| cashNeedsReview/);
});

test('one pending operation, no implicit HTTP replay and identity-scoped result', () => {
  assert.match(ui, /cashPendingWrite\.current !== null/);
  assert.match(ui, /pendingWrite\.current !== null/);
  assert.match(ui, /const requestIdentity = identity/);
  assert.match(ui, /identityRef\.current !== requestIdentity/);
  assert.match(ui, /controller\.signal\.aborted/);
  assert.match(ui, /cashPendingWrite\.current\?\.abort\(\)/);
  assert.doesNotMatch(ui, /setTimeout\([^\n]*saveCashEnabled|setInterval\([^\n]*saveCashEnabled/);
});

test('save acknowledgement merges only confirmed values into existing verified settings', () => {
  assert.match(ui, /confirmed\.values\.cash_session_enabled !== \(enabled \? 'on' : 'off'\)/);
  assert.match(ui, /bridge\.server\.acceptWrite\(\{/);
  assert.match(ui, /\.\.\.verified, values: \{\.\.\.verified\.values, \.\.\.confirmed\.values\}/);
  assert.doesNotMatch(ui, /save\('money',\{\.\.\.current\.state\.sections\.money,cashSession:value\},current\.state\.revision\);\s*if\s*\(bridge\.connected\)/);
  assert.match(bridge, /acceptWrite: \(data: ServerSettings\) => boolean/);
});

test('denial, conflict and ambiguous outcomes preserve old server value', () => {
  assert.match(ui, /\[401, 403\]/);
  assert.match(ui, /\[400, 409, 422\]/);
  assert.match(ui, /setCashNeedsReview\(true\)/);
  assert.match(ui, /Reload verified settings before changing cash sessions again/);
  assert.match(ui, /setCashSaving\(false\)/);
});

test('existing preview cash policy and saved business-name workflow survive unchanged', () => {
  assert.match(ui, /const current=currentAuthority\(\)/);
  assert.match(ui, /canManage\(current\.state,current\.actorId,'money'\)/);
  assert.match(ui, /const result=save\('money',\{\.\.\.current\.state\.sections\.money,cashSession:value\},current\.state\.revision\)/);
  assert.match(ui, /updateBusinessProfile\(token, verified, name, controller\.signal\)/);
  assert.match(ui, /onDirtyChange\(dirty\)/);
  assert.match(ui, /<SaveBar/);
});
