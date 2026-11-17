import { useSaas } from '../../contexts/SaasContext';
import { AuditTable } from '../../components/saas/AuditTable';
import { Denied, PageTitle } from '../../components/saas/SaasBits';
import { isScoped } from '../../utils/saasAccess';

export function AuditLog() {
  const saas = useSaas();
  if (!saas.can('audit.view')) return <Denied what="the audit log" role={saas.staff.label} />;
  const scoped = isScoped(saas.state.staff.find((s) => s.id === saas.staff.id) ?? saas.staff);
  const events = saas.state.audit.filter((e) => (e.tenantId ? saas.inScope(e.tenantId) : !scoped));
  return (
    <div className="space-y-4">
      <PageTitle title="Audit log" bn="অডিট" description={`Every pricing, payment, permission and support action — who did it and when.${scoped ? ' Showing your assigned businesses only.' : ''}`} />
      <AuditTable events={events} showBusiness />
    </div>
  );
}
