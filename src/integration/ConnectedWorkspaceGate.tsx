import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from './SessionProvider.tsx';

/**
 * No connected-mode business route may mount AppShell or preview financial stores.
 * F0-07 verifies real authentication; first real module owns workspace activation.
 */
export function ConnectedWorkspaceGate({ children }: { children: ReactNode }) {
  const { mode, snapshot } = useSession();
  const location = useLocation();
  if (mode === 'preview') return <>{children}</>;

  if (snapshot.status === 'authenticating') {
    return <main role="status" aria-live="polite" className="p-6 text-sm">
      Verifying your session… আপনার সেশন যাচাই করা হচ্ছে…
    </main>;
  }

  if (snapshot.status === 'authenticated') {
    return <Navigate to="/login?workspace=pending" replace state={{ from: location.pathname }} />;
  }

  if (snapshot.status === 'locked') {
    return <Navigate to="/login/pin" replace />;
  }

  // In connected mode the unauthenticated user must sign in, not see fixture data.
  return <Navigate to="/login" replace />;
}
