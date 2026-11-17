/** Canonical settings-only Data & Backup workflows inside the approved Magic Settings shell.
 * The existing DataSettings component already uses shared SettingCard/SettingsTabs.
 * Its provider controls authorization, tenant validation and restore revision checks.
 * This is NOT a full ERP data backup or a server-side database restore.
 */
import { DataSettings as CanonicalDataSettings } from '../DataSettings';

export function DataSettings() {
  return <div className="min-w-0 max-w-full" data-settings-magic-data>
    <CanonicalDataSettings />
  </div>;
}
