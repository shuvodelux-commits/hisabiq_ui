import { useId, type KeyboardEvent } from 'react';

/** Party-local tab behavior; MotionTabList continues to own presentation only. */
export function usePartyContentTabs<T extends string>(selected: T, onSelect: (tab: T) => void, tabs: readonly {id: T}[]) {
  const prefix = useId();
  const tabId = (id: T) => `${prefix}-tab-${id}`;
  const panelId = (id: T) => `${prefix}-panel-${id}`;
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: T) => {
    const index = tabs.findIndex(tab => tab.id === id);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
      : event.key === 'ArrowRight' ? (index + 1) % tabs.length
      : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length : -1;
    if (next < 0) return;
    event.preventDefault();
    onSelect(tabs[next].id);
    const target = document.getElementById(tabId(tabs[next].id));
    target?.focus({preventScroll: true});
    target?.scrollIntoView({block: 'nearest', inline: 'nearest'});
  };
  return { tabId, panelId, tabProps: (id: T) => ({
    id: tabId(id), 'aria-controls': panelId(id), tabIndex: selected === id ? 0 : -1,
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event, id)
  }) };
}
