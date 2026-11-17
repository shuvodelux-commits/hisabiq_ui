import type { SessionStore } from '../integration/session.ts';

type LiveStore = Pick<SessionStore, 'getSnapshot' | 'revalidateAccess'>;
type Visibility = Pick<Document, 'hidden' | 'addEventListener' | 'removeEventListener'>;
type Browser = Pick<Window, 'navigator' | 'addEventListener' | 'removeEventListener' | 'setInterval' | 'clearInterval'>;
type Clock = {
  setInterval: (callback: () => void, ms: number) => number;
  clearInterval: (id: number) => void;
};

/** Only mount this in live connected Settings, never in the preview AppShell. */
export function watchConnectedAuthority(
  store: LiveStore,
  setPending: (pending: boolean) => void,
  environment: { document: Visibility; window: Browser; clock?: Clock },
): () => void {
  const doc = environment.document;
  const win = environment.window;
  const clock = environment.clock ?? {
    setInterval: (fn: () => void, ms: number) => win.setInterval(fn, ms),
    clearInterval: (id: number) => win.clearInterval(id),
  };
  let active = true;
  let inFlight = false;
  let mustRecheck = false;

  const verify = (foreground = false) => {
    if (!active) return;
    if (doc.hidden || !win.navigator.onLine) {
      setPending(true); // Never expose cached tenant data when returning unverified.
      return;
    }
    if (store.getSnapshot().status !== 'authenticated') {
      setPending(false);
      return;
    }
    if (foreground) setPending(true);
    if (inFlight) {
      if (foreground) mustRecheck = true;
      return;
    }
    inFlight = true;
    let request: Promise<void>;
    try { request = store.revalidateAccess(); }
    catch { inFlight = false; setPending(true); return; }
    void request.catch(() => undefined).finally(() => {
      inFlight = false;
      if (!active) return;
      if (mustRecheck) {
        mustRecheck = false;
        verify(true);
      } else if (!doc.hidden && win.navigator.onLine) {
        setPending(false); // SessionStore independently hides denied/locked identity.
      }
    });
  };
  const onVisibility = () => doc.hidden ? setPending(true) : verify(true);
  const onFocus = () => verify(true);
  const onOffline = () => setPending(true);
  const onOnline = () => verify(true);
  const ticker = clock.setInterval(() => verify(), 3_000);
  doc.addEventListener('visibilitychange', onVisibility);
  win.addEventListener('focus', onFocus);
  win.addEventListener('offline', onOffline);
  win.addEventListener('online', onOnline);
  if (doc.hidden || !win.navigator.onLine) setPending(true);

  return () => {
    active = false;
    clock.clearInterval(ticker);
    doc.removeEventListener('visibilitychange', onVisibility);
    win.removeEventListener('focus', onFocus);
    win.removeEventListener('offline', onOffline);
    win.removeEventListener('online', onOnline);
  };
}
