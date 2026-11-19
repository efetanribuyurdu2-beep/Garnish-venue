// Lets plain Node (`node --test`) import the app's TypeScript: "@/x" → src/x, and
// extensionless relative imports get ".ts". Type stripping does the rest, so
// only modules without JSX can be loaded this way.
import { register } from "node:module";
register("./alias-hooks.mjs", import.meta.url);
