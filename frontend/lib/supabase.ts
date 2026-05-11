import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

// Browser client — no Database generic; we map rows to typed interfaces in each hook
export const supabase = createBrowserClient(supabaseUrl, supabaseKey)
