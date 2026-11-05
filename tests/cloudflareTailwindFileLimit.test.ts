import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const inspect = `
  import config from './tailwind.config.js';
  import { readFileSync } from 'node:fs';
  const content = config.content;
  const entries = Array.isArray(content) ? content : content.files;
  const raws = entries.filter(item => typeof item === 'object' && typeof item.raw === 'string');
  const sourcePaths = [
    'index.html',
    'src/utils/productEntry.ts',
    'src/components/layout/TopBar.tsx',
    'src/components/Dialog.tsx'
  ];
  const preserves = Object.fromEntries(sourcePaths.map(path => [
    path, raws.some(item => item.raw.includes(readFileSync(path, 'utf8')))
  ]));
  process.stdout.write(JSON.stringify({
    numberOfRawEntries: raws.length,
    retainsBroadSourceGlob: entries.some(item =>
      typeof item === 'string' && item.includes('src/**/*')
    ),
    preserves
  }));
`;

test('Cloudflare Tailwind content keeps the complete scan without concurrent source globs', () => {
  const output = execFileSync(process.execPath, ['--input-type=module','--eval',inspect], {
    cwd: process.cwd(),
    env: {...process.env, CF_PAGES:'1'},
    encoding:'utf8',
    maxBuffer: 256 * 1024,
    timeout: 30000,
  });
  const result = JSON.parse(output);
  assert.equal(result.numberOfRawEntries, 1,
    'Cloudflare build must supply one sequentially gathered source-text entry');
  assert.equal(result.retainsBroadSourceGlob, false,
    'Cloudflare Tailwind must not also open all files through its parallel glob');
  for (const [path, included] of Object.entries(result.preserves)) {
    assert.equal(included, true, path + ' must retain its Tailwind source classes');
  }
});

test('Local development retains its file-scanning glob for HMR', () => {
  const output = execFileSync(process.execPath, ['--input-type=module','--eval',inspect], {
    cwd: process.cwd(),
    env: {...process.env, CF_PAGES:''},
    encoding:'utf8',
    maxBuffer: 256 * 1024,
    timeout: 30000,
  });
  const result = JSON.parse(output);
  assert.equal(result.retainsBroadSourceGlob, true);
});
