import React, { createContext, useContext } from 'react';
import { useSaasCore } from '../hooks/saas/useSaasCore';
import { useTenantCommands } from '../hooks/saas/useTenantCommands';
import { useBillingCommands } from '../hooks/saas/useBillingCommands';
import { useCatalogCommands } from '../hooks/saas/useCatalogCommands';
import { useSupportCommands } from '../hooks/saas/useSupportCommands';
import { useAdminCommands } from '../hooks/saas/useAdminCommands';

export { effectivePlan, type EffectiveFeature } from '../hooks/saas/useTenantCommands';
export type { Result } from '../types/saas';

function useSaasStore(staffId: string) {
  const core = useSaasCore(staffId);
  const tenant = useTenantCommands(core);
  const billing = useBillingCommands(core);
  const catalog = useCatalogCommands(core);
  const support = useSupportCommands(core);
  const admin = useAdminCommands(core);
  return {
    state: core.state,
    staff: core.staff,
    setStaffId: core.setStaffId,
    can: core.can,
    canFor: core.canFor,
    inScope: core.inScope,
    reset: core.reset,
    ...tenant,
    ...billing,
    ...catalog,
    ...support,
    ...admin,
  };
}

export type SaasApi = ReturnType<typeof useSaasStore>;
const Ctx = createContext<SaasApi | null>(null);

export function SaasProvider({ staffId, children }: { staffId: string; children: React.ReactNode }) {
  const api = useSaasStore(staffId);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useSaas(): SaasApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSaas must be used inside SaasProvider');
  return v;
}
