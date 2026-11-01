import { Clock3 } from 'lucide-react';
import type { AuditEvent } from '../../types/audit';
import { auditFieldLabel, formatAuditValue } from '../../utils/auditDisplay';

export function AuditTimeline({ events }: { events: readonly AuditEvent[] }) {
  if (!events.length) {
    return <div className="rounded-lg bg-ink-50 px-3 py-5 text-center text-xs text-ink-400">No changes recorded yet.</div>;
  }
  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="rounded-lg border border-border p-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-50"><Clock3 className="size-3 text-ink-400" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[12.5px] font-medium text-ink">{event.type}</p>
                <p className="text-[10.5px] text-ink-400">{event.at}</p>
              </div>
              <p className="text-[11px] text-ink-500">{event.user}{event.reason ? ' · ' + event.reason : ''}</p>
              {!!event.changes.length && (
                <div className="mt-2 space-y-1">
                  {event.changes.map((change) => (
                    <div key={change.field} className="grid min-w-0 gap-0.5 text-[11px] sm:grid-cols-[125px_minmax(0,1fr)]">
                      <span className="font-medium text-ink-600">{auditFieldLabel(change.field)}</span>
                      <span className="min-w-0 break-words text-ink-500">
                        <span className="text-ink-400">Before:</span> {formatAuditValue(change.field, change.before)}
                        <span className="px-1 text-helper" aria-hidden="true">→</span>
                        <span className="text-ink-400">After:</span> {formatAuditValue(change.field, change.after)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

