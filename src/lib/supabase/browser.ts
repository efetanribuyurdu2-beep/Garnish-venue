"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Supabase in the browser (the bar panel): the signed-in member's session, anon key. */
export const supabaseBrowser = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
