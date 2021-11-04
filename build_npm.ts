import { build } from "https://deno.land/x/dnt@0.4.1/mod.ts";
import { copy } from "https://deno.land/std@0.113.0/fs/mod.ts";

await Deno.remove("npm", { recursive: true }).catch((_) => {});
await copy("testdata", "npm/esm/testdata", { overwrite: true });
await copy("testdata", "npm/umd/testdata", { overwrite: true });
await copy("README.md", "npm/README.md", { overwrite: true });

await build({
  entryPoints: ["./lib.ts", {
    kind: "bin",
    name: "license_checker",
    path: "./main.ts",
  }],
  outDir: "./npm",
  typeCheck: true,
  declaration: true,
  test: true,
  package: {
    // package.json properties
    name: "@kt3k/license-checker",
    version: "3.1.4",
    description: "📄 CLI tool for checking license headers in files",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/kt3k/deno_license_checker.git",
    },
    bugs: {
      url: "https://github.com/kt3k/deno_license_checker/issues",
    },
  },
});

await Deno.writeTextFile(
  "npm/.npmignore",
  "esm/testdata/\numd/testdata/\n",
  { append: true }
);