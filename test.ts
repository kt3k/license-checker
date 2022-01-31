// Copyright 2020 Yoshiya Hinosawa. All rights reserved. MIT license.

import { blue, copy, green, red } from "./deps.ts";
import { assertEquals, isNode, StringReader } from "./dev_deps.ts";
import { xrun } from "./util.ts";

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
  "--allow-run",
  "--allow-write",
  "../../main.ts",
];

Deno.test("normal", async () => {
  const data = normalize(
    await xrun([...baseArgs], "testdata/normal"),
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
  const data = normalize(
    await xrun([
      ...baseArgs,
      "--config",
      new URL("./testdata/normal/.licenserc2.json", import.meta.url).href,
    ], "testdata/normal"),
  );
  assertEquals(
    data,
    normalize(`
Using config file "${new URL("./", import.meta.url).href}testdata/normal/.licenserc2.json"
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
});

Deno.test("quiet", async () => {
  const data = normalize(
    await xrun([...baseArgs, "-q"], "testdata/normal"),
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
    await xrun([...baseArgs], "testdata/multiline"),
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
    await xrun([...baseArgs], "testdata/multiconfig"),
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
      await xrun(
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
  return new TextDecoder().decode(Deno.readFileSync(file));
}
