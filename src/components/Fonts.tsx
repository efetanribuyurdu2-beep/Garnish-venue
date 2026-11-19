import { fontsHref } from "@/lib/fonts";
import type { WorldId } from "@/lib/types";

/** The Google Fonts stylesheet for these worlds (all of them when none are given), hoisted into <head> by React. */
export function Fonts({ worlds }: { worlds?: WorldId[] }) {
  return <link rel="stylesheet" href={fontsHref(worlds)} precedence="fonts" />;
}
