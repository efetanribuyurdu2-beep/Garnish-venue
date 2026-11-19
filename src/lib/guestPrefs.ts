"use client";

import { useCallback, useSyncExternalStore } from "react";
import { NO_PREFS, type GuestPrefs } from "./guestChoice";

/**
 * One set of guest preferences per menu, shared by the menu's filter sheet and
 * "Suggest a drink", kept for the browser tab (sessionStorage) so a refresh or
 * a visit to a drink's page does not lose them.
 */
const listeners = new Set<() => void>();
const cache = new Map<string, GuestPrefs>();
const keyOf = (menu: string) => `garnish-venue:prefs:${menu}`;

function read(menu: string): GuestPrefs {
  const hit = cache.get(menu);
  if (hit) return hit;
  let p = NO_PREFS;
  try {
    const raw = sessionStorage.getItem(keyOf(menu));
    if (raw) {
      const j = JSON.parse(raw);
      p = { zero: Boolean(j.zero), avoid: Array.isArray(j.avoid) ? j.avoid.filter((x: unknown) => typeof x === "string") : [] };
    }
  } catch {}
  cache.set(menu, p);
  return p;
}

function write(menu: string, p: GuestPrefs) {
  cache.set(menu, p);
  try {
    sessionStorage.setItem(keyOf(menu), JSON.stringify(p));
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useGuestPrefs(menu: string) {
  const prefs = useSyncExternalStore(
    subscribe,
    () => read(menu),
    () => NO_PREFS,
  );
  const set = useCallback((patch: Partial<GuestPrefs>) => write(menu, { ...read(menu), ...patch }), [menu]);
  return [prefs, set] as const;
}

const tableKey = (menu: string) => `garnish-venue:table:${menu}`;

/** the table number from a table card's QR (`?masa=7`), remembered for the tab so the Atelier's card can show it */
export function rememberTable(menu: string) {
  try {
    const n = new URLSearchParams(location.search).get("masa");
    if (n && /^[\w-]{1,8}$/.test(n)) sessionStorage.setItem(tableKey(menu), n);
  } catch {}
}

export function readTable(menu: string): string {
  try {
    return sessionStorage.getItem(tableKey(menu)) ?? "";
  } catch {
    return "";
  }
}

export function writeTable(menu: string, n: string) {
  try {
    if (n) sessionStorage.setItem(tableKey(menu), n);
    else sessionStorage.removeItem(tableKey(menu));
  } catch {}
}
