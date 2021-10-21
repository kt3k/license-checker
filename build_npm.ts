import { build } from "https://deno.land/x/dnt/mod.ts";

await build({
  entryPoints: ["./main.ts"],
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
