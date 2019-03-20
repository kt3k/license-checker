// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
import { runTests, test } from "https://deno.land/std@v0.3.1/testing/mod.ts"
import { blue, green, red } from "https://deno.land/std@v0.3.1/colors/mod.ts"
import { xrun } from "./util.ts"
import { assertEquals } from "https://deno.land/std@v0.3.1/testing/asserts.ts"
import { StringReader } from "https://deno.land/std@v0.3.1/io/readers.ts"
import copy = Deno.copy

const normalize = (output: string) =>
  output
    .trim()
    .split(/\r?\n/)
    .sort()

const perms = ["--allow-read", "--allow-run", "--allow-write"]

test(async function normal() {
  const data = normalize(
    await xrun(["deno", ...perms, "../../main.ts"], "testdata/normal")
  )
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
  )
})

test(async function quiet() {
  const data = normalize(
    await xrun(["deno", ...perms, "../../main.ts", "-q"], "testdata/normal")
  )
  assertEquals(
    data,
    normalize(`
2.js ${red("missing copyright!")}
foo/2.js ${red("missing copyright!")}
foo/bar/2.js ${red("missing copyright!")}
foo/bar/baz/2.js ${red("missing copyright!")}
`)
  )
})

test(async function multiline() {
  const data = normalize(
    await xrun(["deno", ...perms, "../../main.ts"], "testdata/multiline")
  )
  assertEquals(
    data,
    normalize(`
1.ts ... ${green("ok")}
foo/bar/baz/1.ts ... ${green("ok")}
foo/bar/baz/2.ts ${red("missing copyright!")}
`)
  )
})

async function readFileText(file: string) {
  const f = await Deno.open(file)
  const buf = new Deno.Buffer()
  await copy(buf, f)
  f.close()
  return buf.toString()
}

test(async function inject() {
  try {
    const confJson = JSON.parse(
      await readFileText("testdata/inject/.licenserc.json")
    )
    const liceses = confJson["**/*.ts"].join("\n")
    const t1 = await readFileText("testdata/inject/1.ts.tmp")
    const t2 = await readFileText("testdata/inject/2.ts.tmp")
    let f1 = await Deno.open("testdata/inject/1.ts", "w")
    let f2 = await Deno.open("testdata/inject/2.ts", "w")
    await Deno.copy(f1, new StringReader(t1))
    await Deno.copy(f2, new StringReader(t2))
    f1.close()
    f2.close()
    const data = normalize(
      await xrun(
        ["deno", ...perms, "../../main.ts", "--inject"],
        "testdata/inject"
      )
    )
    assertEquals(
      data,
      normalize(`
1.ts ... ${green("ok")}
2.ts ${blue("missing copyright. injecting ... done")}
`)
    )
    assertEquals(await readFileText("testdata/inject/1.ts"), t1)
    assertEquals(
      await readFileText("testdata/inject/2.ts"),
      `${liceses}\n${t2}`
    )
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    await Deno.open("testdata/inject/1.ts", "w")
    await Deno.open("testdata/inject/2.ts", "w")
  }
})

runTests()
