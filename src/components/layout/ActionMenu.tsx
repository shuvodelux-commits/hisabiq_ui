import { type ButtonHTMLAttributes, type ComponentType, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { MoreHorizontal } from 'lucide-react';

/** Presentation-only actions for existing FloatingPanel menus. Never changes handlers or permissions. */
export function ActionMenuList({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const enabled = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[data-action-menu-item]:not(:disabled)'));
    if (!enabled.length) return;
    const active = enabled.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1
      : active < 0 ? (event.key === 'ArrowDown' ? 0 : enabled.length - 1)
      : (active + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
    event.preventDefault();
    enabled[next]?.focus();
  };
  return <div {...props} role={props.role ?? 'group'} data-action-menu="" className={'p-1 ' + className} onKeyDown={onKeyDown}>{children}</div>;
}

export function ActionMenuDivider() {
  return <div role="separator" data-action-menu-divider="" className="mx-2 my-1 border-t border-border" />;
}

type ActionMenuItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  icon: ComponentType<{className?: string}>;
  tone?: 'neutral' | 'destructive';
  children: ReactNode;
};

export function ActionMenuItem({ icon: Icon, tone = 'neutral', className = '', children, ...props }: ActionMenuItemProps) {
  const danger = tone === 'destructive';
  return <button
    {...props}
    type="button"
    data-action-menu-item=""
    data-tone={tone}
    className={'flex min-h-10 w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40 ' +
      (danger ? 'text-danger hover:bg-danger-bg focus-visible:bg-danger-bg ' : 'text-ink-700 hover:bg-ink-50 focus-visible:bg-ink-50 ') + className}>
    <Icon className={'size-4 shrink-0 ' + (danger ? 'text-danger' : 'text-ink-500')} aria-hidden="true" />
    <span className="min-w-0 flex-1">{children}</span>
  </button>;
}

/** Opt-in 36px row-action trigger. Keeps FloatingPanel's own positioning/motion. */
type ActionMenuTriggerProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children'> & {
  label: string;
  expanded: boolean;
};

export function ActionMenuTrigger({ label, expanded, className = '', ...props }: ActionMenuTriggerProps) {
  return <button
    {...props}
    type="button"
    data-action-menu-trigger=""
    aria-label={label}
    aria-haspopup="dialog"
    aria-expanded={expanded}
    className={'grid size-9 shrink-0 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ' + className}
  >
    <MoreHorizontal className="size-4" aria-hidden="true" />
  </button>;
}
