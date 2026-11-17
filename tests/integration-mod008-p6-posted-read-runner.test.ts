import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const runner = fileURLToPath(new URL('../scripts/mod008-p6-posted-read-browser.cjs', import.meta.url));

function refuse(env: Record<string, string>, expected: RegExp): void {
  const output = spawnSync(process.execPath, [runner], {
    encoding: 'utf8', timeout: 5000,
    env: { PATH: process.env.PATH ?? '', ...env },
  });
  assert.notEqual(output.status, 0, 'unapproved signed-posting QA cannot run');
  assert.match(output.stderr, expected);
  assert.doesNotMatch(output.stderr, /Bearer\s|Authorization\s*:|postgres:\/\/|JWT_SECRET/);
}

test('P6POSTED-01 has a dedicated opt-in runner, no production changes', () => {
  assert.ok(existsSync(runner));
  const src = readFileSync(runner, 'utf8');
  assert.match(src, /mod008-p6-posted-647-20261116/);
  assert.match(src, /hisabiq-mod008-p5d-pg16/);
  assert.match(src, /mod008-p5d-501/);
  assert.match(src, /connected-purchase-real-read-browser\.cjs/);
  assert.match(src, /Module\._compile/);
  assert.doesNotMatch(src, /(?:rm\s+-rf|podman\s+rm|TRUNCATE\s+TABLE)/);
});

test('P6POSTED-02 denies missing opt-in before any DB/process activity', () => {
  refuse({}, /P6 posted QA acknowledgement missing/);
});

test('P6POSTED-03 rejects arbitrary API origins and database containers', () => {
  refuse({ HISABIQ_P6_POSTED_ACK: 'isolated-p6-posted-react',
    HISABIQ_P5D_API_ORIGIN: 'https://example.org' }, /P6 posted QA API origin mismatch/);
  refuse({ HISABIQ_P6_POSTED_ACK: 'isolated-p6-posted-react',
    HISABIQ_P5D_API_ORIGIN: 'http://127.0.0.1:3230',
    HISABIQ_P5D_PG_CONTAINER: 'production-db' }, /P6 posted QA container mismatch/);
});

test('P6POSTED-04 enforces signed two-tenant source, fixed PG image and run-owner', () => {
  const src = readFileSync(runner, 'utf8');
  assert.match(src, /hisabiq\.owner/);
  assert.match(src, /PG_MAJOR=16/);
  assert.match(src, /POSTGRES_DB=sher_test/);
  assert.match(src, /HISABIQ_P5D_JWT_A/);
  assert.match(src, /HISABIQ_P5D_JWT_B/);
  assert.match(src, /HISABIQ_P5D_SUPPLIER_/);
  assert.match(src, /HISABIQ_P5D_PRODUCT_/);
  assert.match(src, /UPDATE users SET username/);
  assert.match(src, /createHmac\('sha256'/);
});

test('P6POSTED-05 uses real POSTED source writes then enforces GET-only browser nonposting', () => {
  const src = readFileSync(runner, 'utf8');
  assert.match(src, /\/api\/v1\/purchases/);
  assert.match(src, /\/api\/v1\/purchase-returns/);
  assert.match(src, /journal_lines/);
  assert.match(src, /stock_movements/);
  assert.match(src, /audit_events/);
  assert.match(src, /outbox/);
  assert.match(src, /assert\.deepEqual\(after, before/);
  assert.match(src, /startVite/); // inherited from the exact existing GET-only harness
});
