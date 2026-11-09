
type Props = { label: string; value: string | number; tone?: 'neutral' | 'warning' | 'danger' | 'success'; hint?: string };

const toneCls = { neutral: 'text-ink', warning: 'text-warning', danger: 'text-danger', success: 'text-success' };

/** Small summary tile used across the owner tools (devices, activity, offline). */
export function StatTile({ label, value, tone = 'neutral', hint }: Props) {
  return (
    <div className="min-w-0 rounded-xl border border-ink-100 bg-card px-4 py-3 shadow-card">
      <p className="text-xs text-ink-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${toneCls[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-ink-400">{hint}</p>}
    </div>
  );
}
