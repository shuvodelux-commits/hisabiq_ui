import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const png = new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/4XkAAAAASUVORK5CYII=', 'base64'));
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

test('connected logo lifecycle reads only a verified logo and revokes every URL', async () => {
  const server = await createServer({ cacheDir: '/tmp/issue-341-logo-vite-cache', server: { middlewareMode: true, hmr: false } });
  const beforeFetch = globalThis.fetch;
  const beforeWindow = (globalThis as any).window;
  const beforeMake = URL.createObjectURL;
  const beforeRevoke = URL.revokeObjectURL;
  const made: string[] = [], revoked: string[] = [];
  const blobs: Blob[] = [];
  let reads = 0;
  let status = 200;
  let body = png;
  let network = false;
  let pending: (() => void) | null = null;
  const origin = 'https://logo-test.example';
  (globalThis as any).window = { location: { origin } };
  URL.createObjectURL = blob => {
    assert.equal(blob.type, 'image/png');
    blobs.push(blob);
    const value = `blob:logo-${made.length + 1}`;
    made.push(value);
    return value;
  };
  URL.revokeObjectURL = value => { revoked.push(value); };
  globalThis.fetch = (async (url, init) => {
    reads++;
    assert.equal(String(url), origin + '/api/v1/sales/invoice-logo');
    assert.equal(init?.method, 'GET');
    assert.equal(new Headers(init?.headers).get('Authorization')?.startsWith('Bearer '), true);
    if (pending) await new Promise<void>(resolve => { pending = resolve; });
    if (network) throw Error('offline');
    return status === 200
      ? new Response(new Uint8Array(body), { status, headers: { 'Content-Type': 'image/png' } })
      : new Response(null, { status });
  }) as typeof fetch;
  try {
    const { createConnectedInvoiceLogoController, ConnectedInvoiceLogo } = await server.ssrLoadModule('/src/settings/magic/invoice/ConnectedInvoiceLogo.tsx');
    const states: Array<{ status: string; url?: string }> = [];
    const controller = createConnectedInvoiceLogoController((next: { status: string; url?: string }) => states.push(next));
    controller.load({ identityKey: null, accessToken: null, hasLogo: true });
    assert.equal(states.at(-1)?.status, 'denied');
    controller.load({ identityKey: 'tenant-A:user-A:1', accessToken: 'token-A', hasLogo: false });
    assert.equal(states.at(-1)?.status, 'empty');
    assert.equal(reads, 0);
    controller.load({ identityKey: 'tenant-A:user-A:1', accessToken: 'token-A', hasLogo: true });
    await tick();
    assert.equal(states.at(-1)?.status, 'decoding');
    assert.equal(made.length, 1);
    assert.deepEqual(new Uint8Array(await blobs[0].arrayBuffer()), png);
    controller.imageLoaded(made[0]);
    assert.equal(states.at(-1)?.status, 'ready');
    controller.load({ identityKey: 'tenant-A:user-A:1', accessToken: 'token-A', hasLogo: true });
    await tick();
    assert.ok(revoked.includes(made[0]), 'explicit refresh revokes the old image');
    assert.equal(states.at(-1)?.status, 'decoding');
    controller.imageLoaded(made[1]);
    controller.load({ identityKey: 'tenant-B:user-B:2', accessToken: 'token-B', hasLogo: false });
    assert.equal(states.at(-1)?.status, 'empty');
    assert.deepEqual(revoked, [made[0], made[1]]);

    for (const errorStatus of [401, 403, 404, 500]) {
      status = errorStatus;
      controller.load({ identityKey: `tenant-B:user-B:${errorStatus}`, accessToken: `token-${errorStatus}`, hasLogo: true });
      await tick();
      assert.equal(states.at(-1)?.status, errorStatus === 401 || errorStatus === 403 ? 'denied' : 'error');
      assert.equal(made.length, 2);
    }
    network = true;
    controller.load({ identityKey: 'tenant-B:user-B:offline', accessToken: 'token-offline', hasLogo: true });
    await tick();
    assert.equal(states.at(-1)?.status, 'error');
    network = false;
    status = 200;
    body = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4]);
    controller.load({ identityKey: 'tenant-B:user-B:broken', accessToken: 'token-broken', hasLogo: true });
    await tick();
    controller.imageFailed(made[2]);
    assert.equal(states.at(-1)?.status, 'error');
    assert.ok(revoked.includes(made[2]), 'decode failure revokes the failed blob');

    body = png;
    pending = () => { /* hold the old response until the identity changes */ };
    controller.load({ identityKey: 'tenant-C:user-C:3', accessToken: 'token-C', hasLogo: true });
    await tick();
    const release = pending;
    controller.load({ identityKey: 'tenant-D:user-D:4', accessToken: 'token-D', hasLogo: false });
    release?.();
    await tick();
    assert.equal(states.at(-1)?.status, 'empty', 'late prior principal cannot replace the current state');
    assert.equal(made.length, 3, 'stale response creates no object URL');
    controller.dispose();
    assert.deepEqual(made, revoked);

    const html = renderToStaticMarkup(createElement(ConnectedInvoiceLogo, { identityKey: null, accessToken: null, hasLogo: true }));
    assert.ok(!html.includes('<img'), 'denied or preview fallback has no image element');
    assert.ok(!html.includes('/api/v1/sales/invoice-logo'), 'private endpoint is never a public image src');
    assert.equal(reads, 9);
  } finally {
    globalThis.fetch = beforeFetch;
    if (beforeWindow === undefined) delete (globalThis as any).window; else (globalThis as any).window = beforeWindow;
    URL.createObjectURL = beforeMake;
    URL.revokeObjectURL = beforeRevoke;
    await server.close();
  }
});
