import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = (path: string) => readFileSync(path, 'utf8');

test('Phase 7 translates only cash drawer presentation and not cash session records', () => {
  const drawer = file('src/components/layout/CashSessionDialog.tsx');
  const session = file('src/contexts/CashSessionContext.tsx');
  assert.ok(drawer.includes("const { text, showHelper } = useUiCopy()"));
  assert.ok(drawer.includes("text('Cash reconciliation','ক্যাশ মিলানো')"));
  assert.ok(drawer.includes("text('Close session','সেশন বন্ধ করুন')"));
  assert.ok(drawer.includes("text('Start cash session','ক্যাশ সেশন শুরু করুন')"));
  assert.ok(drawer.includes('saveCount(counted,note,true,reviewedRevision,operationId)'));
  assert.ok(drawer.includes('saveCount(counted,note,false,reviewedRevision,operationId)'));
  assert.ok(drawer.includes('startSession(float,counterpart,note,reviewedRevision,operationId)'));
  assert.ok(drawer.includes('const diff = counted - expected'));
  assert.ok(drawer.includes("diff!==0&&!note.trim()"));
  assert.ok(session.includes('previewActive?.expectedMinor'));
  assert.ok(session.includes('active?.expectedClosingMinor'));
  assert.ok(session.includes('store.count(authority(), {'));
  assert.ok(session.includes('counted: String(counted)'));
  assert.ok(session.includes('note, close, revision, operationId'));
});

test('An empty count is not shown as a counted or reconciled amount', () => {
  const drawer = file('src/components/layout/CashSessionDialog.tsx');
  assert.ok(drawer.includes("hasCount ? taka(counted) : '—'"));
  assert.ok(drawer.includes("hasCount ? taka(Math.abs(diff)) : '—'"));
  assert.ok(drawer.includes('disabled={busy||!canClose||!hasCount}'));
  assert.ok(drawer.includes('disabled={busy||!canClose||!hasCount||(diff!==0&&!note.trim())}'));
  assert.ok(drawer.includes("text('Count saved in preview','নমুনা গণনা সংরক্ষিত')"));
  assert.ok(drawer.includes("text('Cash session closed in preview','নমুনা ক্যাশ সেশন বন্ধ হয়েছে')"));
});
