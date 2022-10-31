// Copyright 2020-2022 Yoshiya Hinosawa. All rights reserved. MIT license.

import { blue, copy, green, red } from "./deps.ts";
import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { StringReader } from "https://deno.land/std@0.161.0/io/readers.ts";
import serve from "./serve.ts";
import { run } from "./util.ts";
import { isNode } from "https://deno.land/x/which_runtime@0.2.0/mod.ts";

const normalize = (output: string) =>
  output
    .trim()
    .replace(/\\/g, "/")
    .split(/\r?\n/)
    .sort();

const baseArgs = isNode ? ["node", "../../main.js"] : [
  Deno.execPath(),
  "run",
  "--unstable",
  "--allow-read",
  "--allow-write",
  "--allow-net=localhost:8000",
  "../../main.ts",
];

Deno.test("normal", async () => {
  const data = normalize(
    await run([...baseArgs], "testdata/normal"),
  );
  assertEquals(
    data,
    normalize(`
Using config file ".licenserc.json"
.js is a directory. Skipping this item.
1.js ... ${green("ok")}
1.ts ... ${green("ok")}
2.js ${red("missing copyright!")}
foo/1.js ... ${green("ok")}
foo/2.js ${red("missing copyright!")}
foo/bar/1.js ... ${green("ok")}
foo/bar/2.js ${red("missing copyright!")}
foo/bar/baz/1.js ... ${green("ok")}
foo/bar/baz/2.js ${red("missing copyright!")}
`),
  );
});

Deno.test("url config", async () => {
  const close = serve();
  const data = normalize(
    await run([
      ...baseArgs,
      "--config",
      "http://localhost:8000/licenserc.json",
    ], "testdata/normal"),
  );
  assertEquals(
    data,
    normalize(`
Using config file "http://localhost:8000/licenserc.json"
.js is a directory. Skipping this item.
1.js ${red("missing copyright!")}
1.ts ... ${green("ok")}
2.js ${red("missing copyright!")}
foo/1.js ${red("missing copyright!")}
foo/2.js ${red("missing copyright!")}
foo/bar/1.js ${red("missing copyright!")}
foo/bar/2.js ${red("missing copyright!")}
foo/bar/baz/1.js ${red("missing copyright!")}
foo/bar/baz/2.js ${red("missing copyright!")}
`),
  );
  await close();
});

Deno.test("quiet", async () => {
  const data = normalize(
    await run([...baseArgs, "-q"], "testdata/normal"),
  );
  assertEquals(
    data,
    normalize(`
Using config file ".licenserc.json"
2.js ${red("missing copyright!")}
foo/2.js ${red("missing copyright!")}
foo/bar/2.js ${red("missing copyright!")}
foo/bar/baz/2.js ${red("missing copyright!")}
`),
  );
});

Deno.test("multiline", async () => {
  const data = normalize(
    await run([...baseArgs], "testdata/multiline"),
  );
  assertEquals(
    data,
    normalize(`
Using config file ".licenserc.json"
1.ts ... ${green("ok")}
foo/bar/baz/1.ts ... ${green("ok")}
foo/bar/baz/2.ts ${red("missing copyright!")}
`),
  );
});

Deno.test("multiconfig", async () => {
  const data = normalize(
    await run([...baseArgs], "testdata/multiconfig"),
  );
  assertEquals(
    data,
    normalize(`
Using config file ".licenserc.json"
1.ts ... ${green("ok")}
2.ts ... ${green("ok")}
`),
  );
});

Deno.test("inject", async () => {
  try {
    const confJson = JSON.parse(
      readFileText("testdata/inject/.licenserc.json"),
    );
    const liceses = confJson["**/*.ts"].join("\n");
    const t1 = readFileText("testdata/inject/1.ts.tmp");
    const t2 = readFileText("testdata/inject/2.ts.tmp");
    const f1 = await Deno.open(
      "testdata/inject/1.ts",
      { write: true, truncate: true },
    );
    const f2 = await Deno.open(
      "testdata/inject/2.ts",
      { write: true, truncate: true },
    );
    await copy(new StringReader(t1), f1);
    await copy(new StringReader(t2), f2);
    f1.close();
    f2.close();
    const data = normalize(
      await run(
        [...baseArgs, "--inject"],
        "testdata/inject",
      ),
    );
    assertEquals(
      data,
      normalize(`
Using config file ".licenserc.json"
1.ts ... ${green("ok")}
2.ts ${blue("missing copyright. injecting ... done")}
`),
    );
    assertEquals(readFileText("testdata/inject/1.ts"), t1);
    assertEquals(
      readFileText("testdata/inject/2.ts"),
      `${liceses}\n${t2}`,
    );
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    const f1 = await Deno.open("testdata/inject/1.ts", { write: true });
    const f2 = await Deno.open("testdata/inject/2.ts", { write: true });
    f1.close();
    f2.close();
  }
});

function readFileText(file: string) {
  return Deno.readTextFileSync(file);
}
