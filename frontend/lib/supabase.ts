import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

type BrowserClient = ReturnType<typeof createBrowserClient>

// Use globalThis so the singleton survives Next.js Fast Refresh module re-evaluations.
// Without this, each HMR cycle calls createBrowserClient() again, triggering the
// "Multiple GoTrueClient instances detected" warning.
declare global {
  // eslint-disable-next-line no-var
  var __supabaseBrowserClient: BrowserClient | undefined
}

function getClient(): BrowserClient {
  if (typeof window === 'undefined') {
    // Server context (SSR / API routes): always create fresh — no global needed
    return createBrowserClient(supabaseUrl, supabaseKey)
  }
  if (!globalThis.__supabaseBrowserClient) {
    globalThis.__supabaseBrowserClient = createBrowserClient(supabaseUrl, supabaseKey)
  }
  return globalThis.__supabaseBrowserClient
}

// Browser client — no Database generic; we map rows to typed interfaces in each hook
export const supabase = getClient()
