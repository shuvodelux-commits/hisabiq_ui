import test from 'node:test';
import assert from 'node:assert/strict';
import { watchConnectedAuthority } from '../src/settings/connectedAuthorityWatch.ts';

function setup() {
  const document = Object.assign(new EventTarget(), { hidden: false });
  const window = Object.assign(new EventTarget(), { navigator: { onLine: true } });
  const timers = new Map<number, () => void>();
  let timerId = 0;
  const clock = {
    setInterval(fn: () => void, ms: number) {
      assert.equal(ms, 3_000);
      timers.set(++timerId, fn); return timerId;
    },
    clearInterval(id: number) { timers.delete(id); },
  };
  const pending: boolean[] = [];
  let status: 'authenticated' | 'locked' = 'authenticated';
  let checks = 0;
  let validate: () => Promise<void> = async () => undefined;
  const store = {
    getSnapshot: () => ({ status }),
    revalidateAccess: () => { checks++; return validate(); },
  };
  const start = () => watchConnectedAuthority(store as any,
    (value: boolean) => pending.push(value), { document: document as any, window: window as any, clock });
  const fire = () => { for (const run of [...timers.values()]) run(); };
  const settle = () => new Promise<void>(resolve => setImmediate(resolve));
  return { document, window, pending, store, start, fire, settle,
    get checks() { return checks; }, get activeTimers() { return timers.size; },
    setStatus: (value: 'authenticated' | 'locked') => { status = value; },
    setValidate: (fn: () => Promise<void>) => { validate = fn; },
  };
}

test('connected Settings checks bearer on visible cadence without refreshing a preview or locked session', async () => {
  const h = setup(); const stop = h.start();
  assert.equal(h.activeTimers, 1);
  h.fire(); await h.settle();
  assert.equal(h.checks, 1);
  h.setStatus('locked');
  h.fire(); await h.settle();
  assert.equal(h.checks, 1);
  stop();
  assert.equal(h.activeTimers, 0);
  h.fire(); await h.settle();
  assert.equal(h.checks, 1);
});

test('hidden tab redacts immediately and suppresses remote reads until visible revalidation resolves', async () => {
  const h = setup(); const stop = h.start();
  let release!: () => void;
  h.setValidate(() => new Promise<void>(resolve => { release = resolve; }));
  h.document.hidden = true;
  h.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.pending.at(-1), true);
  h.fire(); assert.equal(h.checks, 0);
  h.document.hidden = false;
  h.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(h.pending.at(-1), true);
  assert.equal(h.checks, 1);
  await h.settle(); assert.equal(h.pending.at(-1), true);
  release(); await h.settle();
  assert.equal(h.pending.at(-1), false);
  stop();
});

test('focus events while an old check is pending force a second verification before unmasking', async () => {
  const h = setup(); const stop = h.start();
  const releases: Array<() => void> = [];
  h.setValidate(() => new Promise<void>(resolve => releases.push(resolve)));
  h.fire(); assert.equal(h.checks, 1);
  h.window.dispatchEvent(new Event('focus'));
  h.window.dispatchEvent(new Event('focus'));
  assert.equal(h.pending.at(-1), true);
  releases[0](); await h.settle();
  assert.equal(h.checks, 2);
  assert.equal(h.pending.at(-1), true);
  releases[1](); await h.settle();
  assert.equal(h.pending.at(-1), false);
  stop();
});

test('offline and visibility changes fail closed, clean up all listeners on unmount', async () => {
  const h = setup(); const stop = h.start();
  h.window.navigator.onLine = false;
  h.window.dispatchEvent(new Event('offline'));
  assert.equal(h.pending.at(-1), true);
  h.fire(); assert.equal(h.checks, 0);
  h.window.navigator.onLine = true;
  h.window.dispatchEvent(new Event('online'));
  await h.settle();
  assert.equal(h.checks, 1);
  assert.equal(h.pending.at(-1), false);
  stop();
  h.document.hidden = true;
  h.document.dispatchEvent(new Event('visibilitychange'));
  h.window.dispatchEvent(new Event('focus'));
  assert.equal(h.checks, 1);
  assert.equal(h.activeTimers, 0);
});
