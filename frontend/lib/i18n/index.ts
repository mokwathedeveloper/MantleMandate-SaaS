import { fr as frSettings } from './fr/settings'
import { fr as frShell } from './fr/shell'
import { fr as frDashboard } from './fr/dashboard'
import { fr as frTrading } from './fr/trading'
import { fr as frMandates } from './fr/mandates'
import { fr as frAgents } from './fr/agents'
import { fr as frOpsApi } from './fr/ops-api'
import { fr as frDocs } from './fr/docs'

const dictionaries: Record<string, Record<string, string>> = {
  French: {
    ...frSettings,
    ...frShell,
    ...frDashboard,
    ...frTrading,
    ...frMandates,
    ...frAgents,
    ...frOpsApi,
    ...frDocs,
  },
}

/** Translate a UI string into the given language; falls back to the original English. */
export function translate(text: string, language?: string): string {
  if (!language || language === 'English') return text
  return dictionaries[language]?.[text] ?? text
}

/** Maps a preference `language` value to a BCP-47 locale for Intl/date formatting. */
export const UI_LOCALES: Record<string, string> = {
  French: 'fr-FR',
}
