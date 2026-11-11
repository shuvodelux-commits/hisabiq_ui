import {useTenantSettings} from '../settings/TenantSettingsProvider';
import {resolveRecoveryContext} from './authority';
export function useRecoveryContext(){const {state,actorId}=useTenantSettings();return resolveRecoveryContext({state,actorId});}
