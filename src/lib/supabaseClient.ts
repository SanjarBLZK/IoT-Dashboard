import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase credentials niet gevonden. Camera detecties worden alleen lokaal opgeslagen.\n' +
    'Voor database opslag: voeg VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY toe aan .env bestand.\n' +
    'Zie SUPABASE_SETUP.md voor instructies.'
  )
}

// Create client (will be undefined if credentials are missing)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Check if Supabase is enabled
export const isSupabaseEnabled = () => supabase !== null
