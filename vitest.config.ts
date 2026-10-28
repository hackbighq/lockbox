import { defineConfig } from "vitest/config";

// node:sqlite is a Node 22 builtin that Vite's resolver can't load. Intercept
// the import and hand back a tiny virtual module that pulls it in through
// createRequire at runtime, so src/db.ts can keep a clean `node:sqlite` import.
const VIRT = "\0node-sqlite-shim";
export default defineConfig({
  plugins: [
    {
      name: "node-sqlite-shim",
      enforce: "pre",
      resolveId(id) {
        if (id === "node:sqlite" || id === "sqlite") return VIRT;
      },
      load(id) {
        if (id === VIRT) {
          return 'import { createRequire } from "node:module";\n' +
            'const require = createRequire(import.meta.url);\n' +
            'export const { DatabaseSync } = require("node:sqlite");\n';
        }
      },
    },
  ],
});
