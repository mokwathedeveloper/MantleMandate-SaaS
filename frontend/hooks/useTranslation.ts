import { usePreferences, DEFAULT_PREFERENCES } from './usePreferences'
import { translate } from '@/lib/i18n'

/** Returns a `t(text)` function that translates UI strings based on the user's saved language preference. */
export function useTranslation() {
  const { data: prefs = DEFAULT_PREFERENCES } = usePreferences()
  return (text: string) => translate(text, prefs.language)
}
