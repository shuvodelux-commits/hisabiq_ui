import { useEffect, useRef, useState } from 'react';
import { useTenantSettings } from '../TenantSettingsProvider';
import { useSession } from '../../integration/SessionProvider.tsx';
import { readTenantSettings, type ServerSettings } from '../../integration/settings-team.ts';
import { ApiError } from '../../integration/errors.ts';

export type ServerSettingsRead =
  | { status: 'preview' | 'waiting' | 'loading' | 'locked' | 'denied' | 'error'; data: null }
  | { status: 'ready'; data: ServerSettings };

/** T01-R: one abort-safe read tied to the *verified* /me identity epoch.
 * Never use TenantSettingsProvider's browser fixture as live authorization.
 * A switch between tenants clears the rendered server data synchronously
 * before the prior request has time to settle or React's cleanup runs. */
export function useServerSettingsRead(): ServerSettingsRead {
  const { mode, snapshot } = useSession();
  const [last, setLast] = useState<{ key: string; state: ServerSettingsRead } | null>(null);
  const key = mode === 'connected' && snapshot.status === 'authenticated'
    ? `${snapshot.tenantId}:${snapshot.userId}:${snapshot.epoch}:${snapshot.accessToken}`
    : `${mode}:${snapshot.status}:${snapshot.epoch}`;
  const liveIdentity = useRef(key);
  liveIdentity.current = key;

  useEffect(() => {
    if (mode !== 'connected' || snapshot.status !== 'authenticated') return;
    if (!snapshot.permissions.includes('settings.setting.view')) return;
    const controller = new AbortController();
    const identity = key;
    let active = true;
    const token = snapshot.accessToken;
    setLast({ key: identity, state: { status: 'loading', data: null } });
    void readTenantSettings(token, controller.signal).then(response => {
      if (!active || liveIdentity.current !== identity || controller.signal.aborted) return;
      setLast({ key: identity, state: { status: 'ready', data: response.data } });
    }).catch((error: unknown) => {
      if (!active || liveIdentity.current !== identity || controller.signal.aborted) return;
      const denied = error instanceof ApiError && (error.status === 401 || error.status === 403);
      setLast({ key: identity, state: { status: denied ? 'denied' : 'error', data: null } });
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [mode, key, snapshot.status === 'authenticated' ? snapshot.permissions.includes('settings.setting.view') : false]);

  if (mode === 'preview') return { status: 'preview', data: null };
  if (snapshot.status === 'locked') return { status: 'locked', data: null };
  if (snapshot.status !== 'authenticated') return { status: 'waiting', data: null };
  if (!snapshot.permissions.includes('settings.setting.view')) return { status: 'denied', data: null };
  return last?.key === key ? last.state : { status: 'loading', data: null };
}

/** Preserve the exact existing Magic preview state. Connected mode has no
 * demo staff/permissions and only projects server-authoritative businessName.
 * Other Magic fields do not have a lossless mapped backend setting in T01-R. */
export function useMagicSettingsState() {
  const { state: tenant } = useTenantSettings();
  const { mode } = useSession();
  const server = useServerSettingsRead();
  const b = tenant.sections.business;
  const p = tenant.sections.products;
  const inv = tenant.sections.invoices;
  const n = tenant.sections.notifications;
  const connected = mode === 'connected';
  const state = {
    settings: {
      businessName: connected ? (server.status === 'ready' ? server.data.businessName : '') : b.name,
      phone: connected ? '' : b.phone,
      address: connected ? '' : b.address,
      defaultPayment: connected ? '' : tenant.sections.sales.defaultPayment,
      stockAlert: connected ? 0 : p.lowStock ? 1 : 0,
      pinEnabled: false, // A trusted PIN needs the auth server; never claim enabled from a UI fixture.
      smsEnabled: connected ? false : n.channel === 'In-app + SMS',
      setupDone: false, // No server setup-completed flag exists yet.
    },
    staff: connected ? [] : tenant.sections.team.employees,
  };
  const saved = connected ? { paper: '', showBangla: false, showLogo: false }
    : { paper: inv.paper, showBangla: inv.showBangla, showLogo: inv.showLogo };
  const defaultInvoiceDesign = { paper: 'A4', showBangla: true, showLogo: true };
  const sec = { offline: { deviceId: null as string | null } };
  return { state, sec, saved, defaultInvoiceDesign, server, connected };
}
