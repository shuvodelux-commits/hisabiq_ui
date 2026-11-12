import { createContext, useContext, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import type { IntegrationMode } from './config.ts';
import { SessionStore, type SessionSnapshot } from './session.ts';

export interface SessionContextValue {
  mode: IntegrationMode;
  snapshot: SessionSnapshot;
  store: SessionStore;
}

const Context = createContext<SessionContextValue | null>(null);

export function SessionProvider({ mode, children }: { mode: IntegrationMode; children: ReactNode }) {
  const storeRef = useRef<SessionStore | null>(null);
  if (storeRef.current === null) storeRef.current = new SessionStore({ mode });
  const store = storeRef.current;
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    if (mode !== 'connected') return;
    // SessionStore owns the only refresh credential and validates /me before granting access.
    void store.restore();
    const activity = () => store.recordActivity();
    window.addEventListener('keydown', activity, { passive: true });
    window.addEventListener('pointerdown', activity, { passive: true });
    window.addEventListener('touchstart', activity, { passive: true });
    return () => {
      window.removeEventListener('keydown', activity);
      window.removeEventListener('pointerdown', activity);
      window.removeEventListener('touchstart', activity);
      store.dispose();
    };
  }, [mode, store]);

  return <Context.Provider value={{ mode, snapshot, store }}>{children}</Context.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(Context);
  if (context === null) throw new Error('SessionProvider is required for authenticated routes');
  return context;
}
