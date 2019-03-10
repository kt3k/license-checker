// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
import {assertEqual, test} from "https://deno.land/x/testing@v0.2.6/mod.ts";
import {color} from "https://deno.land/x/colors@v0.2.6/mod.ts";
import {xrun} from "./util.ts";
import {assertEquals} from "https://deno.land/std@v0.3.1/testing/asserts.ts";
import Reader = Deno.Reader;
import Buffer = Deno.Buffer;
import copy = Deno.copy;
import {StringReader} from "https://deno.land/std@v0.3.1/io/readers.ts";

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
  assertEqual(
    data,
    normalize(`
1.js ... ${color.green("ok")}
1.ts ... ${color.green("ok")}
2.js ${color.red("missing copyright!")}
foo/1.js ... ${color.green("ok")}
foo/2.js ${color.red("missing copyright!")}
foo/bar/1.js ... ${color.green("ok")}
foo/bar/2.js ${color.red("missing copyright!")}
foo/bar/baz/1.js ... ${color.green("ok")}
foo/bar/baz/2.js ${color.red("missing copyright!")}
`)
  );
});

test(async function quiet() {
  const data = normalize(
    await xrun(["deno", ...perms, "../../main.ts", "-q"], "testdata/normal")
  );
  assertEqual(
    data,
    normalize(`
2.js ${color.red("missing copyright!")}
foo/2.js ${color.red("missing copyright!")}
foo/bar/2.js ${color.red("missing copyright!")}
foo/bar/baz/2.js ${color.red("missing copyright!")}
`)
  );
});

test(async function multiline() {
  const data = normalize(
    await xrun(["deno", ...perms, "../../main.ts"], "testdata/multiline")
  );
  assertEqual(
    data,
    normalize(`
1.ts ... ${color.green("ok")}
foo/bar/baz/1.ts ... ${color.green("ok")}
foo/bar/baz/2.ts ${color.red("missing copyright!")}
`)
  );
});

async function toString(r: Reader) {
  const buf = new Buffer();
  await copy(buf, r);
  return buf.toString();
}

async function removeIfExist(path: string) {
  try {
    await Deno.stat(path);
    await Deno.remove(path);
  } catch (e) {

  }
}

async function readFileText(file: string) {
  const f = await Deno.open(file)
  const buf = new Deno.Buffer();
  await copy(buf, f);
  f.close();
  return buf.toString()
}

test(async function inject() {
  try {
    const conf = await Deno.open("testdata/inject/.licenserc.json");
    const confJson = JSON.parse(await toString(conf));
    conf.close();
    const liceses = confJson["**/*.ts"].join("\n");
    const t1 = await readFileText("testdata/inject/1.ts.tmp");
    const t2 = await readFileText("testdata/inject/2.ts.tmp");
    let f1 = await Deno.open("testdata/inject/1.ts", "w");
    let f2 = await Deno.open("testdata/inject/2.ts", "w");
    await Deno.copy(f1, new StringReader(t1));
    await Deno.copy(f2, new StringReader(t2));
    f1.close();
    f2.close();
    const data = normalize(
      await xrun(["deno", ...perms, "--allow-write", "../../main.ts", "--inject"], "testdata/inject")
    );
    assertEqual(
      data,
      normalize(`
1.ts ... ${color.green("ok")}
2.ts ${color.blue("missing copyright. injecting ... done")}
`)
    );
    f1 = await Deno.open("testdata/inject/1.ts");
    f2 = await Deno.open("testdata/inject/2.ts");
    assertEquals(
      await toString(f1),
      t1
    );
    assertEqual(
      await toString(f2),
      `${liceses}\n${t2}`
    );
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    await Deno.open("testdata/inject/1.ts", "w");
    await Deno.open("testdata/inject/2.ts", "w");
  }
});
