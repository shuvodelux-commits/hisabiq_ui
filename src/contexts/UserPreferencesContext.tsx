import React, { createContext, useContext, useMemo, useState } from 'react';
import type { EntryDateView, TerminologyMode } from '../types/transactions';

const terminologyKey = 'hisabiq-terminology-mode';
const dateViewKey = 'hisabiq-entry-date-view';

type UserPreferencesValue = {
  terminologyMode: TerminologyMode;
  entryDateView: EntryDateView;
  setTerminologyMode: (mode: TerminologyMode) => void;
  setEntryDateView: (view: EntryDateView) => void;
};

const UserPreferencesContext = createContext<UserPreferencesValue | null>(null);

function readTerminology(): TerminologyMode {
  if (typeof window === 'undefined') return 'simple';
  return window.localStorage.getItem(terminologyKey) === 'accounting' ? 'accounting' : 'simple';
}

function readDateView(): EntryDateView {
  if (typeof window === 'undefined') return 'transaction';
  return window.localStorage.getItem(dateViewKey) === 'created' ? 'created' : 'transaction';
}

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [terminologyMode, setTerminologyState] = useState<TerminologyMode>(readTerminology);
  const [entryDateView, setEntryDateViewState] = useState<EntryDateView>(readDateView);

  const value = useMemo<UserPreferencesValue>(() => ({
    terminologyMode,
    entryDateView,
    setTerminologyMode: (mode) => {
      setTerminologyState(mode);
      try {
        window.localStorage.setItem(terminologyKey, mode);
      } catch {
        // Keep the in-session preference when browser storage is unavailable.
      }
    },
    setEntryDateView: (view) => {
      setEntryDateViewState(view);
      try {
        window.localStorage.setItem(dateViewKey, view);
      } catch {
        // Keep the in-session preference when browser storage is unavailable.
      }
    }
  }), [entryDateView, terminologyMode]);

  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>;
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) throw new Error('useUserPreferences must be used inside UserPreferencesProvider');
  return context;
}
