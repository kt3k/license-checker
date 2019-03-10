// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
import { test, runTests } from "https://deno.land/std@v0.3.1/testing/mod.ts";
import { assertEquals } from "https://deno.land/std@v0.3.1/testing/asserts.ts";
import { green, red } from "https://deno.land/std@v0.3.1/colors/mod.ts";
const { chdir } = Deno;
import { xrun, decode } from "./util.ts";

const normalize = (output: string) =>
  output
    .trim()
    .split(/\r?\n/)
    .sort();

const perms = ["--allow-read", "--allow-run"];

test(async function normal() {
  const data = normalize(
    await xrun(["deno", ...perms, "../../main.ts"], "testdata/normal")
  );
  assertEquals(
    data,
    normalize(`
1.js ... ${green("ok")}
1.ts ... ${green("ok")}
2.js ${red("missing copyright!")}
foo/1.js ... ${green("ok")}
foo/2.js ${red("missing copyright!")}
foo/bar/1.js ... ${green("ok")}
foo/bar/2.js ${red("missing copyright!")}
foo/bar/baz/1.js ... ${green("ok")}
foo/bar/baz/2.js ${red("missing copyright!")}
`)
  );
});

test(async function quiet() {
  const data = normalize(
    await xrun(["deno", ...perms, "../../main.ts", "-q"], "testdata/normal")
  );
  assertEquals(
    data,
    normalize(`
2.js ${red("missing copyright!")}
foo/2.js ${red("missing copyright!")}
foo/bar/2.js ${red("missing copyright!")}
foo/bar/baz/2.js ${red("missing copyright!")}
`)
  );
});

test(async function multiline() {
  const data = normalize(
    await xrun(["deno", ...perms, "../../main.ts"], "testdata/multiline")
  );
  assertEquals(
    data,
    normalize(`
1.ts ... ${green("ok")}
foo/bar/baz/1.ts ... ${green("ok")}
foo/bar/baz/2.ts ${red("missing copyright!")}
`)
  );
});

runTests();
