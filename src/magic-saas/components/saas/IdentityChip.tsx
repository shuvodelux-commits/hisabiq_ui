import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { FloatingPanel } from '../layout/FloatingPanel';
import { useSaas } from '../../contexts/SaasContext';
import { roleLabel, isScoped } from '../../utils/saasAccess';

/** Signed-in staff member and their stacked roles. Persona switching is prototype-only. */
export function IdentityChip() {
  const saas = useSaas();
  const me = saas.staff;
  const scoped = isScoped(me);
  return (
    <FloatingPanel
      label="Signed-in staff"
      width={300}
      trigger={({ open, toggle }) => (
        <button type="button" onClick={toggle} aria-expanded={open} className="flex items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[11px] font-semibold text-teal-800" aria-hidden="true">{initials(me.name)}</span>
          <span className="hidden min-w-0 leading-tight sm:block">
            <span className="block max-w-[180px] truncate text-xs font-medium text-ink">{me.name}</span>
            <span className="block max-w-[180px] truncate text-[11px] text-ink-500">{me.label}{scoped ? ' · limited' : ''}</span>
          </span>
          <ChevronDown className="size-3.5 text-ink-400" aria-hidden="true" />
        </button>
      )}
    >
      {(close) => (
        <div className="text-[13px]">
          <div className="border-b border-ink-100 px-3 py-2.5">
            <p className="font-medium text-ink">{me.name} <span className="font-normal text-ink-500">· {me.staffId}</span></p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-ink-600">
              {me.assignments.map((a) => (
                <li key={a.roleId}>{roleLabel({ assignments: [a] })} — {a.scope === 'ALL' ? 'all businesses' : `${a.scope.length} assigned businesses`}</li>
              ))}
            </ul>
          </div>
          <p className="px-3 pt-2 text-[11px] font-medium uppercase tracking-wide text-ink-400">Prototype · view as</p>
          <ul className="max-h-[300px] overflow-y-auto py-1" role="listbox" aria-label="View as staff member">
            {saas.state.staff.filter((s) => s.status === 'Active').map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={s.id === me.id}
                  onClick={() => { saas.setStaffId(s.id); close(); }}
                  className="flex w-full items-start gap-2 px-3 py-1.5 text-left hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
                >
                  <Check className={`mt-0.5 size-3.5 shrink-0 ${s.id === me.id ? 'text-teal-700' : 'text-transparent'}`} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-ink">{s.name}</span>
                    <span className="block truncate text-[11px] text-ink-500">{roleLabel(s)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </FloatingPanel>
  );
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('');
}
