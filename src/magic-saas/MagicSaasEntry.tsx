import { SaasProvider } from './contexts/SaasContext';
import { ControlCenterShell } from './components/saas/ControlCenterShell';

/** Isolated Magic Patterns admin workspace (demo data only). */
export function MagicSaasEntry() {
  return <SaasProvider staffId="tanvir"><ControlCenterShell /></SaasProvider>;
}
