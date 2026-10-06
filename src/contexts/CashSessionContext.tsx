import React, { createContext, useContext, useState } from 'react';

type CashSessionContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  sessionOpen: boolean;
  setSessionOpen: (value: boolean) => void;
};

const CashSessionContext = createContext<CashSessionContextValue | null>(null);

export function CashSessionProvider({ children }: {children: React.ReactNode;}) {
  const [open, setOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(true);
  return (
    <CashSessionContext.Provider value={{ open, setOpen, sessionOpen, setSessionOpen }}>
      {children}
    </CashSessionContext.Provider>);

}

export function useCashSession() {
  const ctx = useContext(CashSessionContext);
  if (!ctx) throw new Error('useCashSession must be used inside CashSessionProvider');
  return ctx;
}