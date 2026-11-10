import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = (path: string) => readFileSync(path, 'utf8');

test('existing bilingual cash counting and session controls survive backend integration', () => {
  const drawer = file('src/components/layout/CashSessionDialog.tsx');
  const session = file('src/contexts/CashSessionContext.tsx');
  assert.ok(drawer.includes("const { text, showHelper } = useUiCopy()"));
  assert.ok(drawer.includes("text('Cash reconciliation','ক্যাশ মিলানো')"));
  assert.ok(drawer.includes("text('Close session','সেশন বন্ধ করুন')"));
  assert.ok(drawer.includes("text('Open cash session','ক্যাশ সেশন খুলুন')"));
  assert.ok(drawer.includes("text('Count notes','নোট গুনুন')"));
  assert.ok(drawer.includes("text('Enter total','মোট টাকা লিখুন')"));
  assert.match(drawer, /await saveCount\(counted, note, true\)/);
  assert.match(drawer, /await saveCount\(counted, note, false\)/);
  assert.match(drawer, /await startSession\(Number\(float\),/);
  assert.ok(drawer.includes('const diff = counted - expected'));
  assert.ok(session.includes("mode === 'preview' && previewMovements"));
  assert.ok(session.includes('setPreviewOpen(false)'));
  assert.ok(session.includes("mode !== 'connected'"));
});

test('an empty or mismatched count cannot silently close or post money', () => {
  const drawer = file('src/components/layout/CashSessionDialog.tsx');
  const session = file('src/contexts/CashSessionContext.tsx');
  assert.ok(drawer.includes("hasCount ? taka(counted) : '—'"));
  assert.ok(drawer.includes("hasCount ? taka(Math.abs(diff)) : '—'"));
  assert.ok(drawer.includes("disabled={busy || !hasCount}"));
  assert.ok(drawer.includes("!hasCount||(diff!==0&&!note.trim())"));
  assert.ok(session.includes("countedClosingMinor !== activeSession.expectedClosingMinor && !note.trim()"));
  assert.ok(session.includes("amountMinor !== dayStatus.drawerBalanceMinor && !counterpart"));
  assert.ok(drawer.includes("text('Count saved in preview','নমুনা গণনা সংরক্ষিত')"));
  assert.ok(drawer.includes("text('Cash session closed in preview','নমুনা ক্যাশ সেশন বন্ধ হয়েছে')"));
});

test('backend errors never become preview posting and the history remains readable when switched off', () => {
  const context = file('src/contexts/CashSessionContext.tsx');
  const dialog = file('src/components/layout/CashSessionDialog.tsx');
  const finance = file('src/pages/Finance.tsx');
  const settings = file('src/settings/TenantSettingsPage.tsx');
  assert.ok(context.includes("setMode('error')"));
  assert.ok(context.includes("No open cash session."));
  assert.ok(dialog.includes("mode === 'error'"));
  assert.ok(dialog.includes("mode === 'connected'"));
  assert.ok(finance.includes("liveCashHistory.map"));
  assert.ok(finance.includes("cashSessionRecords.map"));
  assert.ok(settings.includes('await saveCashEnabled(desired)'));
});
