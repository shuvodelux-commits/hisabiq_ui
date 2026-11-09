import { createContext, useContext, type ReactNode } from 'react';
import type { UiLanguage } from '../i18n/uiCopy';
const personal: { language: UiLanguage } = { language: 'English + Bangla' };
const Settings = createContext({ personal });
/** Isolated design-library adapter; business preferences and transactions are untouched. */
export function TenantSettingsProvider({ children }: { children: ReactNode }) { return <Settings.Provider value={{ personal }}>{children}</Settings.Provider>; }
export function useTenantSettings() { return useContext(Settings); }
