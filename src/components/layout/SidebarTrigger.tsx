import { PanelLeft } from 'lucide-react';
import { useUiCopy } from '../../i18n/useUiCopy';

/** Compact trigger matching the default shadcn/sidebar SidebarTrigger pattern. */
export function SidebarTrigger({
  collapsed,
  onToggle,
  className = ''
}: {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  const { text } = useUiCopy();
  const label = collapsed ? text('Expand sidebar','সাইডবার খুলুন') : text('Collapse sidebar','সাইডবার ছোট করুন');
  return <button
    type="button"
    aria-label={label}
    aria-keyshortcuts="Control+B Meta+B"
    title={label + ' (Ctrl+B)'}
    onClick={onToggle}
    className={'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ' + className}
  >
    <PanelLeft className="size-4" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </button>;
}
