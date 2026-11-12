import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../integration/errors.ts';
import { readServerInvoiceLogo } from '../../../integration/invoice-logo.ts';

type LogoStatus = 'waiting' | 'loading' | 'decoding' | 'ready' | 'empty' | 'denied' | 'error';
type LogoState = { status: LogoStatus; url?: string };
type LogoSource = {
  identityKey: string | null;
  accessToken: string | null;
  hasLogo: boolean;
};
type Props = LogoSource & { refreshKey?: number };

/** Owns one private download and one browser object URL at a time. */
export function createConnectedInvoiceLogoController(emit: (state: LogoState) => void) {
  let operation: AbortController | null = null;
  let currentUrl: string | null = null;
  let generation = 0;
  const release = () => {
    operation?.abort();
    operation = null;
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  };
  return {
    load(source: LogoSource) {
      release();
      const request = ++generation;
      if (!source.identityKey || !source.accessToken) {
        emit({ status: 'denied' });
        return;
      }
      if (!source.hasLogo) {
        emit({ status: 'empty' });
        return;
      }
      const controller = new AbortController();
      operation = controller;
      emit({ status: 'loading' });
      void readServerInvoiceLogo(source.accessToken, controller.signal).then(({ mime, bytes }) => {
        if (controller.signal.aborted || request !== generation) return;
        const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: mime }));
        if (controller.signal.aborted || request !== generation) {
          URL.revokeObjectURL(url);
          return;
        }
        currentUrl = url;
        emit({ status: 'decoding', url });
      }).catch((error: unknown) => {
        if (controller.signal.aborted || request !== generation) return;
        const denied = error instanceof ApiError && (error.status === 401 || error.status === 403);
        emit({ status: denied ? 'denied' : 'error' });
      });
    },
    imageLoaded(url: string) {
      if (url === currentUrl) emit({ status: 'ready', url });
    },
    imageFailed(url: string) {
      if (url !== currentUrl) return;
      URL.revokeObjectURL(url);
      currentUrl = null;
      emit({ status: 'error' });
    },
    dispose() {
      ++generation;
      release();
    },
  };
}

/** Display only. Logo bytes never enter a public image URL or shared cache. */
export function ConnectedInvoiceLogo({ identityKey, accessToken, hasLogo, refreshKey }: Props) {
  const [record, setRecord] = useState<(LogoSource & { refreshKey?: number; state: LogoState }) | null>(null);
  const controller = useRef<ReturnType<typeof createConnectedInvoiceLogoController> | null>(null);
  useEffect(() => {
    const next = createConnectedInvoiceLogoController(state => {
      setRecord({ identityKey, accessToken, hasLogo, refreshKey, state });
    });
    controller.current = next;
    next.load({ identityKey, accessToken, hasLogo });
    return () => {
      next.dispose();
      if (controller.current === next) controller.current = null;
    };
  }, [identityKey, accessToken, hasLogo, refreshKey]);

  const state = record?.identityKey === identityKey &&
    record.accessToken === accessToken && record.hasLogo === hasLogo &&
    record.refreshKey === refreshKey ? record.state : { status: 'waiting' as const };
  const message = state.status === 'empty' ? 'No uploaded logo · লোগো নেই'
    : state.status === 'denied' ? 'Verified session required for logo · লোগোর জন্য যাচাইকৃত সেশন প্রয়োজন'
      : state.status === 'error' ? 'Logo unavailable · লোগো অনুপলব্ধ'
        : state.status === 'ready' ? 'Uploaded logo · আপলোড করা লোগো'
          : 'Loading logo… · লোগো লোড হচ্ছে…';
  return (
    <div className="mt-3 flex min-w-0 items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-[12px] text-ink-600" data-connected-invoice-logo>
      {state.url && (state.status === 'decoding' || state.status === 'ready') && (
        <img
          src={state.url}
          alt="Invoice logo · চালানের লোগো"
          className={state.status === 'ready' ? 'h-9 max-w-28 object-contain' : 'sr-only'}
          onLoad={() => { if (state.url) controller.current?.imageLoaded(state.url); }}
          onError={() => { if (state.url) controller.current?.imageFailed(state.url); }}
        />
      )}
      <span role="status" aria-live="polite">{message}</span>
    </div>
  );
}
