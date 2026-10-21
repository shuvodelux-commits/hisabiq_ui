import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(file, 'utf8');

test('ERP-wide button polish retains existing component events and variants', () => {
  const button = read('src/components/Button.tsx');
  const css = read('src/index.css');
  for (const value of ['DesignButton', '{...props}', 'size={size}', 'variant={variant}', 'hisabiq-button']) {
    assert.ok(button.includes(value), value);
  }
  for (const value of ['data-hisabiq-variant="outline"', 'data-hisabiq-variant="secondary"',
    'background-color: var(--card)', 'min-height: 40px', 'data-hisabiq-size="sm"']) {
    assert.ok(css.includes(value), value);
  }
  assert.ok(css.includes('data-cart-row'));
});

test('Ledger closing balances provide contextual meanings without modifying ledger numbers', () => {
  const component = read('src/components/parties/PartyClosingBalance.tsx');
  for (const name of ['receivable', 'payable', 'credit', 'capital', 'settled', 'Customer credit',
    'taka(Math.abs(balance))', 'data-testid="party-closing-balance"']) assert.ok(component.includes(name), name);
  for (const file of ['LedgerTable.tsx', 'LedgerTableResponsive.tsx', 'PartyStatementDialog.tsx']) {
    assert.ok(read('src/components/parties/' + file).includes('<PartyClosingBalance'), file);
  }
});

test('Invoice/source quick previews use real store records with safe missing-source fallback', () => {
  const preview = read('src/components/parties/PartySourceQuickPreview.tsx');
  for (const name of ['getSalesPreviewSnapshot', 'availablePurchases', 'sale.lines.map', 'purchase.cartSnapshot',
    'source.method', 'source.financeType', 'partySourceRoute', 'Item-level source data is unavailable',
    'data-testid="party-source-quick-preview"']) assert.ok(preview.includes(name), name);
  for (const name of ['PartyDetail.tsx', 'PartyDetailResponsive.tsx']) {
    const detail = read('src/components/parties/' + name);
    assert.ok(detail.includes('<PartySourceQuickPreview'), name);
    assert.ok(detail.includes("onLedgerAction('source', row)"), name);
    assert.ok(detail.includes('onOpenAttachment={openLedgerAttachment}'), name);
  }
});

test('Attachment quick preview offers image/PDF rendering and safe file URLs', () => {
  const viewer = read('src/components/parties/PartyAttachmentQuickPreview.tsx');
  for (const value of ['safeUrl', "parsed.protocol === 'https:'", 'data:application', '<iframe',
    '<img', 'Open file', 'data-testid="party-attachment-preview"']) assert.ok(viewer.includes(value), value);
  const party = read('src/pages/Parties.tsx');
  assert.ok(party.includes('receiptByPurchase'));
  assert.ok(party.includes('attachment:source.kind'));
});

test('Ledger amount colors are neutral while semantic movement icons are colored on every viewport', () => {
  const renderer = read('src/components/parties/LedgerImpactAmount.tsx');
  for(const kind of ["in: 'text-emerald-700", "out: 'text-rose-700", "adjustment: 'text-amber-700",
    "due: 'text-ink-400", "opening: 'text-ink-400"]) {
    assert.ok(renderer.includes(kind), 'Icon mapping ' + kind);
  }
  assert.ok(renderer.includes('font-semibold leading-tight text-ink'),'Money amount has neutral ink');
  assert.ok(renderer.includes('font-normal leading-tight text-ink-500'),'Caption has muted neutral ink');
  const desktop=read('src/components/parties/LedgerTable.tsx');
  const tablet=read('src/components/parties/LedgerTableResponsive.tsx');
  assert.ok(desktop.includes('<LedgerImpactAmount'),'Desktop uses shared semantic movement presentation');
  assert.ok(tablet.includes('<LedgerImpactAmount'),'Tablet and phone use shared semantic movement presentation');
  assert.ok(!tablet.includes('<CompactAmount'),'Plain tablet amount renderer is no longer used');
});
