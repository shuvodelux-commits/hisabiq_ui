import { Button, Modal } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { Badge } from '../SaasBits';
import { TicketThread } from './TicketThread';
import { fmtDateTime } from '../../../utils/saas';

export function TicketDialog({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const saas = useSaas();
  const t = saas.state.tickets.find((x) => x.id === ticketId);
  if (!t) return null;
  const tenant = saas.state.tenants.find((x) => x.id === t.tenantId);
  return (
    <Modal title={`${t.id} · ${t.subject}`} onClose={onClose} footer={<Button onClick={onClose}>Close</Button>}>
      <div className="space-y-3 text-[13px]">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-600">
          <span>{tenant?.name}</span>·<span>via {t.channel}</span>·<span>SLA {fmtDateTime(t.slaDueAt)}</span>
          <Badge tone={t.priority === 'High' ? 'danger' : 'neutral'}>{t.priority}</Badge>
        </div>
        <TicketThread ticket={t} onSent={onClose} />
      </div>
    </Modal>
  );
}
