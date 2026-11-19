import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = new URL("../../src/", import.meta.url);

function withExt(url) {
  const path = fileURLToPath(url);
  for (const ext of ["", ".ts", "/index.ts"]) if (existsSync(path + ext) && (ext || /\.[cm]?[jt]s$/.test(path))) return pathToFileURL(path + ext).href;
  return null;
}

export async function resolve(spec, ctx, next) {
  if (spec.startsWith("@/")) {
    const hit = withExt(new URL(spec.slice(2), SRC));
    if (hit) return { url: hit, shortCircuit: true };
  } else if ((spec.startsWith("./") || spec.startsWith("../")) && ctx.parentURL?.includes("/src/")) {
    const hit = withExt(new URL(spec, ctx.parentURL));
    if (hit) return { url: hit, shortCircuit: true };
  }
  return next(spec, ctx);
}
