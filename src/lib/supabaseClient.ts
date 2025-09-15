import { createClient } from '@supabase/supabase-js';

/**
 * Obtain a browser Supabase client. Use ONLY public anon key here.
 */
export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase public env vars');
  return createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
}
