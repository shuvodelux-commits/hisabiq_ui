import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/4XkAAAAASUVORK5CYII=', 'base64');
const settings = {
  language: 'EN', defaultTemplate: 'A4', showLogo: true, showBusinessBlock: true,
  showCustomerBlock: true, showSku: false, showBarcode: false, showDiscount: true,
  showPaymentBreakdown: true, showDue: true, showAmountInWords: true,
  headerText: null, showHeaderText: true, invoiceTitle: null, businessNameEn: null,
  proprietorName: null, proprietorNote: null, businessDescription: null, businessPhone2: null,
  contactPhones: [], mfsNumbers: [], terms: [], paymentTermsDays: 0, paymentTermsLabel: null,
  thermalPaper: '80mm', showSignatureLines: true, hasLogo: true, businessName: null,
  businessAddress: null, businessPhone: null, footerText: null, termsText: null,
  businessPadEnabled: false, businessPadTopMm: 40, pageMarginMm: 10,
};
const ok = (hasLogo: boolean) => new Response(JSON.stringify({ data: { ...settings, hasLogo } }), {
  headers: { 'content-type': 'application/json' },
});
const file = (read?: () => Promise<ArrayBuffer>) => ({
  name: 'logo.png', type: 'image/png', size: png.length,
  arrayBuffer: read ?? (async () => Uint8Array.from(png).buffer),
}) as File;
const tick = () => new Promise(resolve => setTimeout(resolve, 0));

async function withController(run: (make: any) => Promise<void>) {
  const cacheDir = await mkdtemp(join(tmpdir(), 'mod001-logo-authorization-'));
  const server = await createServer({ configFile: false, cacheDir, server: { middlewareMode: true, hmr: false } });
  const previousWindow = (globalThis as any).window;
  const previousFetch = globalThis.fetch;
  (globalThis as any).window = { location: { origin: 'https://hisabiq-mod001.test' } };
  try {
    const module = await server.ssrLoadModule('/src/settings/magic/invoice/ConnectedInvoiceLogoActions.tsx');
    await run(module.createConnectedInvoiceLogoActionsController);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    await server.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
}

test('revoking edit permission during file read cancels the selection before a POST is sent', async () => {
  await withController(async make => {
    let release!: (bytes: ArrayBuffer) => void;
    const reading = new Promise<ArrayBuffer>(resolve => { release = resolve; });
    let calls = 0;
    globalThis.fetch = (async () => { calls++; return ok(true); }) as typeof fetch;
    const states: any[] = [], confirmed: any[] = [];
    const controller = make((s: any) => states.push(s), (v: any) => confirmed.push(v));
    controller.configure({ identityKey: 'tenant-A:session-1', accessToken: 'token-A', canEdit: true, blocked: false, confirmCurrent: async () => true });
    controller.select(file(() => reading));
    const pending = controller.upload();
    assert.equal(states.at(-1).busy, true, 'file verification is in progress');
    controller.configure({ identityKey: 'tenant-A:session-1', accessToken: 'token-A', canEdit: false, blocked: false });
    release(Uint8Array.from(png).buffer);
    await pending;
    assert.equal(calls, 0, 'revoked user must not send delayed logo bytes');
    assert.equal(confirmed.length, 0);
    assert.equal(states.at(-1).selectedName, null);
    assert.equal(states.at(-1).busy, false);
    controller.dispose();
  });
});

test('blocking an in-flight upload aborts it and retains unknown-outcome lock until server refresh', async () => {
  await withController(async make => {
    let finish!: (result: Response) => void;
    let networkSignal: AbortSignal | undefined;
    let requests = 0;
    globalThis.fetch = (async (_url, init) => {
      requests++;
      if (requests === 1) {
        networkSignal = init?.signal ?? undefined;
        return await new Promise<Response>(resolve => { finish = resolve; });
      }
      return ok(true);
    }) as typeof fetch;
    const states: any[] = [], confirmed: any[] = [];
    const controller = make((s: any) => states.push(s), (v: any) => confirmed.push(v));
    const editable = { identityKey: 'tenant-A:session-1', accessToken: 'token-A', canEdit: true, blocked: false, confirmCurrent: async () => true };
    controller.configure(editable);
    controller.select(file());
    const pending = controller.upload();
    await tick();
    assert.equal(requests, 1, 'one upload request sent');
    controller.configure({ ...editable, blocked: true });
    assert.equal(networkSignal?.aborted, true, 'permission gate must cancel pending request');
    finish(ok(true)); // Late response may arrive despite cancellation.
    await pending;
    assert.equal(confirmed.length, 0, 'stale success must not update the invoice editor');
    assert.equal(states.at(-1).busy, false);
    assert.equal(states.at(-1).selectedName, null);
    assert.equal(states.at(-1).unknown, true, 'server may have committed before cancellation');

    controller.configure(editable);
    controller.select(file());
    await controller.upload();
    assert.equal(requests, 1, 'unblocking cannot replay an unknown write');
    await controller.serverRefreshed(); // Called only after a verified GET by the parent.
    controller.select(file());
    await controller.upload();
    assert.equal(requests, 2, 'explicit refresh allows one new deliberate action');
    assert.equal(confirmed.length, 1);
    controller.dispose();
  });
});

test('revoking edit permission during a DELETE aborts it and forbids stale confirmation or re-delete', async () => {
  await withController(async make => {
    let finish!: (result: Response) => void;
    let networkSignal: AbortSignal | undefined;
    const methods: string[] = [];
    globalThis.fetch = (async (_url, init) => {
      methods.push(init?.method ?? '?');
      networkSignal = init?.signal ?? undefined;
      return await new Promise<Response>(resolve => { finish = resolve; });
    }) as typeof fetch;
    const states: any[] = [], confirmed: any[] = [];
    const controller = make((s: any) => states.push(s), (v: any) => confirmed.push(v));
    const editable = { identityKey: 'tenant-A:session-1', accessToken: 'token-A', canEdit: true, blocked: false, confirmCurrent: async () => true };
    controller.configure(editable);
    controller.requestDelete();
    const pending = controller.remove();
    await tick();
    assert.deepEqual(methods, ['DELETE']);
    controller.configure({ ...editable, canEdit: false });
    assert.equal(networkSignal?.aborted, true);
    finish(ok(false));
    await pending;
    assert.equal(confirmed.length, 0);
    assert.equal(states.at(-1).confirmDelete, false);
    assert.equal(states.at(-1).busy, false);
    assert.equal(states.at(-1).unknown, true);
    controller.configure(editable);
    controller.requestDelete();
    await controller.remove();
    assert.deepEqual(methods, ['DELETE'], 'renewed permission is not a reconciliation result');
    controller.dispose();
  });
});

test('unknown upload outcome remains locked after unrelated UI blocking toggles', async () => {
  await withController(async make => {
    let calls = 0;
    globalThis.fetch = (async () => { calls++; throw new TypeError('connection lost after send'); }) as typeof fetch;
    const states: any[] = [];
    const controller = make((s: any) => states.push(s), () => assert.fail('unknown outcome cannot confirm'));
    const editable = { identityKey: 'tenant-A:session-1', accessToken: 'token-A', canEdit: true, blocked: false, confirmCurrent: async () => true };
    controller.configure(editable);
    controller.select(file());
    await controller.upload();
    assert.equal(states.at(-1).unknown, true);
    controller.configure({ ...editable, blocked: true });
    controller.configure(editable);
    controller.select(file());
    await controller.upload();
    assert.equal(calls, 1);
    assert.equal(states.at(-1).unknown, true);
    controller.dispose();
  });
});

for (const action of ['upload', 'remove']) test(`${action}: fresh authorization rejects stale success and preserves uncertainty across remount`, async () => {
  await withController(async make => {
    let authorized = true, checks = 0, writes = 0;
    const states: any[] = [], confirmed: any[] = [];
    globalThis.fetch = (async () => { writes++; authorized = false; return ok(action === 'upload'); }) as typeof fetch;
    const context = { identityKey: 'A:user:1', uncertaintyKey: `race-${action}`, accessToken: 'token', canEdit: true, blocked: false,
      confirmCurrent: async () => { checks++; return authorized; } };
    const first = make((s: any) => states.push(s), (v: any) => confirmed.push(v));
    first.configure(context);
    if (action === 'upload') first.select(file()); else first.requestDelete();
    await first[action]();
    assert.equal(writes, 1);
    assert.equal(checks, 2, 'check immediately before dispatch and after response');
    assert.equal(confirmed.length, 0, 'held HTTP200 is not fresh authorization');
    assert.equal(states.at(-1).unknown, true);
    first.dispose();
    const second = make((s: any) => states.push(s), () => assert.fail('must reconcile first'));
    authorized = true;
    second.configure({ ...context, identityKey: 'A:user:2', accessToken: 'rotated' });
    second.select(file()); await second.upload();
    assert.equal(writes, 1, 'remount and token rotation must not unlock uncertain writes');
    assert.equal(states.at(-1).unknown, true);
    await second.serverRefreshed(); second.dispose();
  });
});

for (const action of ['upload', 'remove']) test(`${action}: denied fresh grant sends nothing`, async () => {
  await withController(async make => {
    let writes = 0;
    globalThis.fetch = (async () => { writes++; return ok(true); }) as typeof fetch;
    const controller = make(() => { return; }, () => assert.fail('denied action cannot confirm'));
    controller.configure({ identityKey: 'denied:user:1', accessToken: 'token', canEdit: true, blocked: false,
      confirmCurrent: async () => false });
    if (action === 'upload') controller.select(file()); else controller.requestDelete();
    await controller[action]();
    assert.equal(writes, 0);
    controller.dispose();
  });
});

test('manual refresh cannot clear uncertainty with a stale or denied grant', async () => {
  await withController(async make => {
    let authorized = true;
    const states: any[] = [];
    globalThis.fetch = (async () => { throw new TypeError('lost response'); }) as typeof fetch;
    const controller = make((s: any) => states.push(s), () => assert.fail('unconfirmed'));
    controller.configure({ identityKey: 'refresh:user:1', uncertaintyKey: 'refresh:user', accessToken: 'token', canEdit: true, blocked: false,
      confirmCurrent: async () => authorized });
    controller.select(file()); await controller.upload();
    authorized = false;
    await controller.serverRefreshed();
    assert.equal(states.at(-1).unknown, true);
    authorized = true;
    await controller.serverRefreshed();
    assert.equal(states.at(-1).unknown, false);
    controller.dispose();
  });
});

 test('missing fresh-authorization callback fails closed', async () => {
  await withController(async make => {
    let writes = 0;
    globalThis.fetch = (async () => { writes++; return ok(true); }) as typeof fetch;
    const controller = make(() => { return; }, () => assert.fail('missing grant'));
    controller.configure({identityKey:'missing:user:1',accessToken:'token',canEdit:true,blocked:false});
    controller.select(file()); await controller.upload();
    assert.equal(writes, 0);
    controller.dispose();
  });
});
