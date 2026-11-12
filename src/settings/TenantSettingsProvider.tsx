import {publishPreviewSettings} from '../documents/previewSettings';
import { useSession } from '../integration/SessionProvider.tsx';
import {
  connectedPersonalScope, personalStorageKey,
  readConnectedPersonal, writeConnectedPersonal,
} from './connectedPersonalPreferences.ts';
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  canManage,
  currentBusinessId,
  parseSettings,
  personalDefaults,
  personalKey,
  saveSection,
  settingsKey,
  validPersonal,
  type BusinessSection,
  type PersonalSettings,
  type SettingsSections,
  type TenantSettings,
} from "./model";

function readInitial() {
  try {
    const loaded = parseSettings(
      localStorage.getItem(settingsKey(currentBusinessId)),
      currentBusinessId,
    );
    const raw = localStorage.getItem(personalKey);
    let personal = { ...personalDefaults };
    if (raw) {
      try {
        const value = JSON.parse(raw);
        if (validPersonal(value)) personal = { ...personalDefaults, ...value };
      } catch {
        /* Recover preferences without discarding valid business settings. */
      }
    } else {
      personal.terminology =
        localStorage.getItem("hisabiq-terminology-mode") === "accounting"
          ? "accounting"
          : "simple";
      personal.dateView =
        localStorage.getItem("hisabiq-entry-date-view") === "created"
          ? "created"
          : "transaction";
    }
    return {
      ...loaded,
      personal,
      warning: loaded.recovered
        ? "Saved business settings were invalid. Example defaults have been restored."
        : "",
    };
  } catch {
    return {
      ...parseSettings(null, currentBusinessId),
      personal: { ...personalDefaults },
      warning:
        "Browser storage is unavailable. Changes will stay in memory for this session.",
    };
  }
}
type SettingsContextValue = {
  state: TenantSettings;
  personal: PersonalSettings;
  warning: string;
  actorId: string;
  currentAuthority: () => {state:TenantSettings;actorId:string};
  setActorId: (id: string) => void;
  save: <K extends BusinessSection>(
    section: K,
    value: SettingsSections[K],
    expectedRevision: number,
  ) => { ok: boolean; error?: string; persisted?:boolean; revision?:number };
  updatePersonal: (patch: Partial<PersonalSettings>) => void;
  restore: (
    value: TenantSettings,
    expectedRevision: number,
  ) => { ok: boolean; error?: string };
};
const SettingsContext = createContext<SettingsContextValue | null>(null);
function connectedStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
export function TenantSettingsProvider({ children }: { children: ReactNode }) {
  const { mode, snapshot } = useSession();
  const connected = mode === 'connected';
  // Never load legacy demo business or global personal keys in connected mode.
  // Business fixture state remains structurally required by legacy components;
  // the connected AppShell stays gated until a separate safe-route task.
  const [initial] = useState(() => connected
    ? { ...parseSettings(null, currentBusinessId), personal: { ...personalDefaults }, warning: '' }
    : readInitial());
  const [state, setState] = useState(initial.state);
  const ref = useRef(state);
  useLayoutEffect(() => {
    if (!connected) publishPreviewSettings(state);
  }, [state, connected]);
  useEffect(() => () => {
    if (!connected) publishPreviewSettings(undefined);
  }, [connected]);

  const scope = connected ? connectedPersonalScope(snapshot) : null;
  const scopeIdentity = scope ? personalStorageKey(scope) + ':' + scope.epoch : null;
  const [previewPersonal, setPreviewPersonal] = useState(initial.personal);
  const [connectedRecord, setConnectedRecord] = useState<{
    identity: string; value: PersonalSettings;
  } | null>(null);
  const connectedRecordRef = useRef(connectedRecord);
  const identityRef = useRef(scopeIdentity);
  identityRef.current = scopeIdentity;
  // Previous tenant/user values disappear synchronously on a new render,
  // before a read effect or the previous request's cleanup can execute.
  const personal = connected
    ? connectedRecord?.identity === scopeIdentity && scopeIdentity !== null
      ? connectedRecord.value : { ...personalDefaults }
    : previewPersonal;
  const personalRef = useRef(previewPersonal);
  const [warning, setWarning] = useState(initial.warning);
  useEffect(() => {
    if (!connected) return;
    if (scope === null || scopeIdentity === null) {
      connectedRecordRef.current = null;
      setConnectedRecord(null);
      setWarning('');
      return;
    }
    const value = readConnectedPersonal(connectedStorage(), scope);
    const record = { identity: scopeIdentity, value };
    connectedRecordRef.current = record;
    setConnectedRecord(record);
    setWarning('');
  }, [connected, scopeIdentity]);

  const [actorId, changeActorId] = useState(connected ? '' : 'mahmud');
  const actorRef=useRef(actorId);
  const authorityActive=useRef(true);
  useEffect(()=>{authorityActive.current=true;return()=>{authorityActive.current=false;};},[]);
  const setActorId=(id:string)=>{
    if (connected) return;
    actorRef.current=id;changeActorId(id);
  };
  const currentAuthority=()=>{
    if(connected || !authorityActive.current) throw Error('Preview authority is unavailable in a connected session.');
    return {state:ref.current,actorId:actorRef.current};
  };
  useEffect(() => {
    if (connected) return;
    const storage = (event: StorageEvent) => {
      if (event.key !== settingsKey(currentBusinessId) && event.key !== null)
        return;
      const loaded = parseSettings(event.newValue, currentBusinessId);
      if (loaded.recovered) {
        setWarning(
          "Another tab saved invalid settings. Your current settings have been kept.",
        );
        return;
      }
      ref.current = loaded.state;
      setState(loaded.state);
    };
    window.addEventListener("storage", storage);
    return () => window.removeEventListener("storage", storage);
  }, [connected]);
  function persist(next: TenantSettings) {
    if (connected) return false;
    ref.current = next;
    setState(next);
    try {
      localStorage.setItem(settingsKey(next.tenantId), JSON.stringify(next));
      setWarning("");
      return true;
    } catch {
      setWarning(
        "Changes are in memory only: browser storage is unavailable or full. Download a settings backup before leaving.",
      );
      return false;
    }
  }
  const save: SettingsContextValue["save"] = (
    section,
    value,
    expectedRevision,
  ) => {
    if (connected) return { ok: false, error: 'Connected business settings require the verified server API.' };
    const result = saveSection(
      ref.current,
      actorId,
      section,
      value,
      expectedRevision,
      new Date().toISOString(),
    );
    if (!result.ok) return result;
    const persisted=persist(result.state);
    return { ok: true, persisted,revision:result.state.revision };
  };
  function updatePersonal(patch: Partial<PersonalSettings>) {
    if (connected) {
      // Locked, signed out and unverified sessions have no personal storage
      // authority; never derive a key from the preview actor or old scope.
      if (scope === null || scopeIdentity === null || identityRef.current !== scopeIdentity) return;
      const source = connectedRecordRef.current?.identity === scopeIdentity
        ? connectedRecordRef.current.value : readConnectedPersonal(connectedStorage(), scope);
      const next = { ...source, ...patch };
      if (!validPersonal(next)) return;
      const saved = writeConnectedPersonal(connectedStorage(), scope, next);
      if (identityRef.current !== scopeIdentity) return;
      const record = { identity: scopeIdentity, value: next };
      connectedRecordRef.current = record;
      setConnectedRecord(record);
      setWarning(saved ? '' :
        'Personal preferences are in memory only because browser storage is unavailable or full.');
      return;
    }
    // Preserve the original Magic preview keys and migration fallback.
    const next = { ...personalRef.current, ...patch };
    if (!validPersonal(next)) return;
    personalRef.current = next;
    setPreviewPersonal(next);
    try {
      localStorage.setItem(personalKey, JSON.stringify(next));
      localStorage.setItem("hisabiq-terminology-mode", next.terminology);
      localStorage.setItem("hisabiq-entry-date-view", next.dateView);
    } catch {
      setWarning(
        "Personal preferences are in memory only because browser storage is unavailable or full.",
      );
    }
  }
  function restore(value: TenantSettings, expectedRevision: number) {
    if (connected) return { ok: false, error: 'Connected backup restore is not enabled.' };
    if (!canManage(ref.current, actorId, "import"))
      return {
        ok: false,
        error: "Only an authorized owner can restore settings.",
      };
    const parsed = parseSettings(JSON.stringify(value), ref.current.tenantId);
    if (parsed.recovered)
      return { ok: false, error: "Choose a valid backup for this business." };
    if (expectedRevision !== ref.current.revision)
      return { ok: false, error: "Settings changed. Review the backup again." };
    const next = structuredClone(ref.current);
    next.sections = parsed.state.sections;
    next.revision++;
    next.events.unshift({
      id: `restore-${next.revision}`,
      at: new Date().toISOString(),
      actor: ref.current.sections.team.employees.find((e) => e.id === actorId)!
        .name,
      section: "Backup restore",
      changes: Object.keys(next.sections),
    });
    persist(next);
    return { ok: true };
  }
  return (
    <SettingsContext.Provider
      value={{
        state,
        personal,
        warning,
        actorId,
        currentAuthority,
        setActorId,
        save,
        updatePersonal,
        restore,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
export function useTenantSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw Error("TenantSettingsProvider is missing");
  return value;
}
