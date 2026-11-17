"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

/** Supabase in the browser (the bar panel): the signed-in member's session, anon key. */
export const supabaseBrowser = () =>
  createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
