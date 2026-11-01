import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = (path: string) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test('module Settings is provided through the shared toolbar rather than a standalone header row', () => {
  const source = file('src/settings/ModuleSettingsEntry.tsx');
  assert.match(source, /ModuleSettingsToolbarContext\.Provider value=\{moduleOpen \? null : settingsAction\}/);
  assert.doesNotMatch(source, /className="mb-3 flex items-center justify-end gap-2"/);
  assert.match(source, /closeModuleSettings/);
  assert.match(source, /data-settings-dirty=true/);
  assert.match(source, /sectionOverride=\{mod\.section\}/);
});

test('regular module headers include Settings before existing actions', () => {
  const source = file('src/components/PageHeader.tsx');
  assert.match(source, /const moduleSettingsAction = useModuleSettingsAction\(\)/);
  assert.match(source, /\{moduleSettingsAction\}\{actions\}/);

  const modules = [
    'Dashboard', 'Sales', 'Products', 'Purchases', 'Parties', 'Vendors',
    'Finance', 'Accounts', 'Daybook', 'Expenses', 'Reports', 'Warranty',
    'Quotations', 'OnlineSales',
  ];
  for (const moduleName of modules) {
    assert.match(file('src/pages/' + moduleName + '.tsx'), /<PageHeader\b/, moduleName + ' must use the shared header');
  }
});

test('POS keeps its original custom header and displays the same Settings control inline', () => {
  const source = file('src/pages/Pos.tsx');
  assert.match(source, /const moduleSettingsAction = useModuleSettingsAction\(\)/);
  assert.match(source, /\{moduleSettingsAction\}\s*<div className="hidden items-center gap-3/);
});
