import { useTenantSettings } from '../settings/TenantSettingsProvider';
import { showBanglaHelper, uiText, uiWord, type UiCopyKey } from './uiCopy';

/** Reads the live Settings language; no second preference or duplicated state. */
export function useUiCopy() {
  const { personal } = useTenantSettings();
  const language = personal.language;
  return {
    language,
    text: (english: string, bangla: string) => uiText(language, english, bangla),
    word: (key: UiCopyKey) => uiWord(language, key),
    showHelper: showBanglaHelper(language),
  };
}
