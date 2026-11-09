import React from 'react';
import { useSaas } from '../../../contexts/SaasContext';
import { AuditTable } from '../AuditTable';
import type { Tenant } from '../../../types/saas';

export function HistoryTab({ tenant }: { tenant: Tenant }) {
  const saas = useSaas();
  return <AuditTable events={saas.state.audit.filter((e) => e.tenantId === tenant.id)} />;
}
