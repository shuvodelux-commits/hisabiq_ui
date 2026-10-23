/* Lightweight source-level inventory/guard of the shared action hierarchy.
   No browser, network, compilation, or package install is required. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const source = path.join(root, 'src');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    if (item.name === '_designSystem') return [];
    const file = path.join(dir, item.name);
    return item.isDirectory() ? files(file) : item.name.endsWith('.tsx') ? [file] : [];
  });
}

const css = read('src/index.css');
const header = read('src/components/PageHeader.tsx');
const button = read('src/components/Button.tsx');
assert.match(header, /data-hisabiq-action-context="page"/, 'PageHeader needs an explicit action context');
assert.match(css, /\[data-hisabiq-action-context="page"\].*\[data-hisabiq-variant="default"\]/,
  'Primary page action priority styling is missing');
assert.match(css, /min-height: 44px/, 'Prominent action height token is missing');
assert.match(css, /min-height: 36px/, 'Standard action height token is missing');
assert.match(css, /min-height: 32px/, 'Compact action height token is missing');
assert.match(button, /data-hisabiq-size/, 'Shared Button size markers must be preserved');
assert.match(read('src/pages/Sales.tsx'), /<Button size="lg" onClick=\{\(\) => setCustomerPaymentOpen\(true\)\}/,
  'Receiving customer payment must be a prominent contextual action');
assert.match(read('src/components/parties/PartyDetailResponsive.tsx'),
  /<Button size="lg" onClick=\{\(\) => setPaymentOpen\(true\)\}/,
  'Party money action must be prominent on desktop');
assert.match(read('src/pages/Reconciliation.tsx'), /<Button size="lg" disabled=\{Boolean\(matchError\)/,
  'Match transaction must be a prominent contextual action');

const groups = new Map();
let total = 0;
for (const file of files(source)) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const text = fs.readFileSync(file, 'utf8');
  const componentTags = [...text.matchAll(/<Button\b/g)].length;
  const nativeTags = [...text.matchAll(/<button\b/g)].length;
  const explicitSmall = [...text.matchAll(/<Button\s[^>]*\bsize="sm"/g)].length;
  const explicitLarge = [...text.matchAll(/<Button\s[^>]*\bsize="lg"/g)].length;
  const key = rel.startsWith('src/pages/') ? 'ERP page'
    : rel.startsWith('src/saas/') ? 'SaaS'
    : rel.startsWith('src/settings/') ? 'Settings' : 'Shared/components';
  const item = groups.get(key) ?? { files: 0, sharedButtons: 0, nativeButtons: 0, explicitSmall: 0, explicitLarge: 0 };
  item.files++;
  item.sharedButtons += componentTags;
  item.nativeButtons += nativeTags;
  item.explicitSmall += explicitSmall;
  item.explicitLarge += explicitLarge;
  groups.set(key, item);
  total += componentTags;
}
assert.ok(total > 100, 'The inventory should cover the existing ERP component families');
console.log('HisabIQ shared action priority contract: PASS');
console.table(Object.fromEntries(groups));
console.log('Native buttons and page-local size overrides remain an inventory, not a claim of visual certification.');
