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
  const server = await createServer({ cacheDir, server: { middlewareMode: true, hmr: false } });
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
    controller.configure({ identityKey: 'tenant-A:session-1', accessToken: 'token-A', canEdit: true, blocked: false });
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
    const editable = { identityKey: 'tenant-A:session-1', accessToken: 'token-A', canEdit: true, blocked: false };
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
    controller.serverRefreshed(); // Called only after a verified GET by the parent.
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
    const editable = { identityKey: 'tenant-A:session-1', accessToken: 'token-A', canEdit: true, blocked: false };
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
    const editable = { identityKey: 'tenant-A:session-1', accessToken: 'token-A', canEdit: true, blocked: false };
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
