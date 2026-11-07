import { useRef, useState, type KeyboardEvent } from 'react';

/** Both directory presentations use the same search-to-results and listbox focus model. */
export function usePartyDirectoryKeyboard(parties: readonly { id: string }[], selectedId: string) {
  const listRef = useRef<HTMLUListElement>(null);
  const [focusedId, setFocusedId] = useState(selectedId);
  const tabStopId = parties.find(party => party.id === focusedId)?.id
    ?? parties.find(party => party.id === selectedId)?.id ?? parties[0]?.id;
  const options = () => Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); options()[0]?.focus(); }
  };
  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const list = options();
    const index = list.indexOf(document.activeElement as HTMLButtonElement);
    let next = index;
    if (event.key === 'ArrowDown') next = Math.min(list.length - 1, index + 1);
    else if (event.key === 'ArrowUp') next = Math.max(0, index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = list.length - 1;
    else return;
    event.preventDefault(); list[next]?.focus();
  };
  return { listRef, tabStopId, onSearchKeyDown, onListKeyDown, onOptionFocus: setFocusedId };
}
