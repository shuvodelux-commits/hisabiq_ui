import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider, useTenantSettings } from '../../src/settings/TenantSettingsProvider.tsx';
import { GeneralSettingsSection } from '../../src/settings/magic/GeneralSettingsSection.tsx';
import { TeamSettings } from '../../src/settings/magic/TeamSettings.tsx';
import { settingsSections } from '../../src/settings/magic/settingsSections.ts';
import { Input } from '../../src/components/Input.tsx';
import { Button } from '../../src/components/Button.tsx';
import '../../src/index.css';

// Isolated acceptance mount only: no AppShell, fixture identity or business data.
const business = settingsSections.find(section => section.id === 'business')!;
const unchanged = () => undefined;
function Acceptance() {
  const { snapshot, store } = useSession();
  const { personal, updatePersonal } = useTenantSettings();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  return <main className="min-w-0 space-y-4 p-3">
    <h1>MOD-001 real server read acceptance</h1>
    <form className="grid min-w-0 gap-2" onSubmit={event => {
      event.preventDefault(); setError('');
      const secret = password; setPassword('');
      void store.loginWithPassword(identifier, secret).catch(() => setError('Sign-in failed · প্রবেশ করা যায়নি'));
    }}>
      <label>Identifier<Input autoComplete="off" value={identifier} onChange={event => setIdentifier(event.target.value)} /></label>
      <label>Password<Input type="password" autoComplete="off" value={password} onChange={event => setPassword(event.target.value)} /></label>
      <Button type="submit">Sign in</Button>
      <Button type="button" onClick={() => { void store.logout(); }}>Sign out</Button>
      <Button type="button" onClick={() => store.lock()}>Lock session</Button>
    </form>
    <p role="status" data-session-status>{snapshot.status}</p>
    {error && <p role="alert">{error}</p>}
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => updatePersonal({ language: 'English' })}>English</Button>
      <Button onClick={() => updatePersonal({ language: 'Bangla' })}>বাংলা</Button>
    </div>
    <output aria-label="Selected language">{personal.language}</output>
    <GeneralSettingsSection section={business} canEdit={false} onDirtyChange={unchanged} />
    <TeamSettings canEdit={false} onDirtyChange={unchanged} />
  </main>;
}
createRoot(document.getElementById('root')!).render(
  <SessionProvider mode="connected"><TenantSettingsProvider><Acceptance /></TenantSettingsProvider></SessionProvider>,
);
