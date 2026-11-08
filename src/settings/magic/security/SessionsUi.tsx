/** Presentation-only adapters for the pinned Magic Patterns Sessions UI. */
import type { ReactNode } from 'react';
import { AppSelect } from '../../../components/AppSelect';

export function Select({ label, value, onChange, options }: {
 label: string; value: string; onChange: (next: string) => void;
 options: Array<{value: string; label: string}>;
}) {
 return <AppSelect label={label} value={value} onChange={onChange} options={options} className="w-full" />;
}
export function Tag({ children, color = 'neutral' }: { children: ReactNode; color?: 'neutral'|'warning'|'danger'|'success' }) {
 const styles = { neutral:'bg-ink-50 text-ink-600',warning:'bg-warning-bg text-warning',danger:'bg-danger-bg text-danger',success:'bg-success-bg text-success' };
 return <span data-table-badge className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${styles[color]}`}>{children}</span>;
}
