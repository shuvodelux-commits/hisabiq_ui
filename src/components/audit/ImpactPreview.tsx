import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { AuditImpact } from '../../types/audit';
import { auditFieldLabel, formatAuditValue } from '../../utils/auditDisplay';

export function ImpactPreview({ preview }: { preview: AuditImpact }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-[13px] font-semibold text-ink">Review changes</p>
          <p className="font-bn text-[10.5px] text-ink-400">সেভ করার আগে কী বদলাচ্ছে দেখে নিন</p>
        </div>
        <div className="divide-y divide-border">
          {preview.changes.map((change) => (
            <div key={change.field} className="grid gap-2 px-3 py-2.5 text-[12px] sm:grid-cols-[150px_minmax(0,1fr)]">
              <span className="font-medium text-ink-500">{auditFieldLabel(change.field)}</span>
              <div className="grid min-w-0 grid-cols-2 gap-2">
                <div className="min-w-0">
                  <span className="block text-[10.5px] text-ink-400">Before</span>
                  <span className="block break-words text-ink-500">{formatAuditValue(change.field, change.before)}</span>
                </div>
                <div className="relative min-w-0 pl-3">
                  <ArrowRight className="absolute left-0 top-1 size-3 text-helper" aria-hidden="true" />
                  <span className="block text-[10.5px] text-ink-400">After</span>
                  <span className="block break-words font-medium text-ink">{formatAuditValue(change.field, change.after)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3">
        <p className="text-[12px] font-semibold text-teal-800">Affected areas <span className="font-bn font-normal">· নমুনা প্রিভিউ</span></p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {preview.impacts.map((impact) => (
            <span key={impact} className="inline-flex items-center gap-1 rounded-md border border-teal-100 bg-card px-2 py-1 text-[11px] text-teal-800">
              <CheckCircle2 className="size-3" /> {impact}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

