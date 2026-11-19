import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve('src/magic-saas');
function tsxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? tsxFiles(target) : entry.name.endsWith('.tsx') ? [target] : [];
  });
}

test('SaaS visual components use shared theme surfaces and proportional typography', () => {
  const violations: string[] = [];
  const forbidden = [
    { pattern: /\bbg-white\b/g, rule: 'use semantic bg-card/bg-popover for dark and light themes' },
    { pattern: /\bfont-mono\b/g, rule: 'use the ERP proportional interface font' },
    { pattern: /\btabular-nums\b/g, rule: 'use proportional numerals, not forced tabular numerals' },
  ];
  for (const file of tsxFiles(root)) {
    const source = readFileSync(file, 'utf8');
    for (const { pattern, rule } of forbidden) {
      const matches = [...source.matchAll(pattern)];
      for (const match of matches) {
        const line = source.slice(0, match.index).split('\n').length;
        violations.push(path.relative(process.cwd(), file) + ':' + line + ': ' + rule);
      }
    }
  }
  assert.deepEqual(violations, [], 'SaaS UI visual token drift:\n' + violations.join('\n'));
});
