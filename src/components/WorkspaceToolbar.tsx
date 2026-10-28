import type { ReactNode } from "react";

/** ReportToolbar's layout; callers keep their own meaningful filters and actions. */
export function WorkspaceToolbar({ search, children, details }: { search: ReactNode; children?: ReactNode; details?: ReactNode }) {
  return <div data-workspace-toolbar className="space-y-3 rounded-xl border border-border bg-card p-3">
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[160px] flex-1">{search}</div>
      {children}
    </div>
    {details}
  </div>;
}
