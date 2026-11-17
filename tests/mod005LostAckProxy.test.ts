import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
type AckProxy = { endpoint: string; waitCommitted: Promise<{ status: number; data: string }>; close(): Promise<void> };
const { createLostAckProxy } = require('../scripts/mod005-lost-ack-proxy.cjs') as {
  createLostAckProxy(input: { target: string; matchPath: string }): Promise<AckProxy>;
};

test('upstream commits exactly once while HTTP client gets no acknowledgement', async () => {
  let committed = 0;
  const upstream = createServer(async (req, res) => {
    for await (const chunk of req) { assert.ok(chunk); }
    committed += 1;
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data: { id: 'committed-operation' } }));
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  const port = upstream.address().port;
  let proxy: AckProxy | undefined;
  try {
    proxy = await createLostAckProxy({
      target: 'http://127.0.0.1:' + port,
      matchPath: '/api/v1/money/day/start',
    });
    await assert.rejects(fetch(proxy.endpoint + '/api/v1/money/day/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationId: 'one-only' }),
    }), /fetch failed|terminated|socket hang up/i);
    const result = await proxy.waitCommitted;
    assert.equal(result.status, 201);
    assert.equal(committed, 1, 'committed upstream must survive lost client acknowledgement');
  } finally {
    if (proxy) await proxy.close();
    await new Promise(resolve => upstream.close(resolve));
  }
});

test('proxy refuses external origins and non-cash business mutation paths', async () => {
  await assert.rejects(createLostAckProxy({
    target: 'https://example.com', matchPath: '/api/v1/money/day/start',
  }), /restricted to localhost/);
  await assert.rejects(createLostAckProxy({
    target: 'http://127.0.0.1:12345', matchPath: '/api/v1/sales',
  }), /restricted to localhost/);
  await assert.rejects(createLostAckProxy({
    target: 'http://127.0.0.1:12345', matchPath: '/api/v1/money/day/not-a-ulid/reopen',
  }), /restricted to localhost/);
});

test('proxy allows one exact POST and never forwards a second operation', async () => {
  let committed = 0;
  const upstream = createServer(async (req, res) => {
    for await (const chunk of req) { assert.ok(chunk); }
    committed++;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data: { committed } }));
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  const listenAddress = upstream.address();
  assert.ok(listenAddress && typeof listenAddress !== 'string');
  let proxy: AckProxy | undefined;
  try {
    proxy = await createLostAckProxy({
      target: 'http://127.0.0.1:' + listenAddress.port,
      matchPath: '/api/v1/money/day/start',
    });
    const rejectedGet = await fetch(proxy.endpoint + '/api/v1/money/day/start');
    assert.equal(rejectedGet.status, 404);
    const rejectedPath = await fetch(proxy.endpoint + '/api/v1/money/day/movements', {
      method: 'POST', body: '{}',
    });
    assert.equal(rejectedPath.status, 404);
    assert.equal(committed, 0);
    await assert.rejects(fetch(proxy.endpoint + '/api/v1/money/day/start', {
      method: 'POST', body: '{}',
    }));
    assert.equal((await proxy.waitCommitted).status, 200);
    const repeated = await fetch(proxy.endpoint + '/api/v1/money/day/start', {
      method: 'POST', body: '{}',
    });
    assert.equal(repeated.status, 404);
    assert.equal(committed, 1);
  } finally {
    if (proxy) await proxy.close();
    await new Promise(resolve => upstream.close(resolve));
  }
});

test('failed upstream HTTP response must not be recorded as a committed ACK', async () => {
  const upstream = createServer(async (req, res) => {
    for await (const chunk of req) { assert.ok(chunk); }
    res.writeHead(409, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { code: 'CONFLICT' } }));
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  const listenAddress = upstream.address();
  assert.ok(listenAddress && typeof listenAddress !== 'string');
  let proxy: AckProxy | undefined;
  try {
    proxy = await createLostAckProxy({
      target: 'http://127.0.0.1:' + listenAddress.port,
      matchPath: '/api/v1/money/day/start',
    });
    const received = await fetch(proxy.endpoint + '/api/v1/money/day/start', {
      method: 'POST', body: '{}',
    });
    assert.equal(received.status, 502);
    await assert.rejects(proxy.waitCommitted, /HTTP 409/);
  } finally {
    if (proxy) await proxy.close();
    await new Promise(resolve => upstream.close(resolve));
  }
});
