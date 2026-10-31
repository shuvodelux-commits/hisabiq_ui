import { createContext, useContext, type ReactNode } from 'react';

/** The current module's Settings control, placed inside its existing header. */
export const ModuleSettingsToolbarContext = createContext<ReactNode>(null);

export function useModuleSettingsAction(): ReactNode {
  return useContext(ModuleSettingsToolbarContext);
}
