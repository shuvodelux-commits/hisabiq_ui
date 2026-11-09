import { createPortal as portal } from 'react-dom';
import type { ReactNode } from 'react';
/** Keeps exported theme utilities/variables around portalled library surfaces. */
export function createPortal(children: ReactNode, container: Element | DocumentFragment, key?: string | null) {
  return portal(<div className="hisabiq-library-host hisabiq-app" style={{ display: 'contents' }}>{children}</div>, container, key);
}
