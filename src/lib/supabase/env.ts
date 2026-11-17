/**
 * Supabase address and public key. Accepts the names set by hand and the ones
 * the Vercel ↔ Supabase integration writes (it adds both ANON_KEY and, on newer
 * projects, PUBLISHABLE_KEY). Each name is written out in full so Next.js can
 * inline it into the browser bundle.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";
export const supabaseConfigured = () => Boolean(SUPABASE_URL && SUPABASE_KEY);
