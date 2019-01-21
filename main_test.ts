// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
import { test, assertEqual } from "https://deno.land/x/testing@v0.2.6/mod.ts";
import { color } from "https://deno.land/x/colors@v0.2.6/mod.ts"
import { chdir } from "deno"
import { xrun, decode } from "./util.ts"

test(async function normal() {
  chdir('testdata/normal')
  const data = (await xrun(['deno', '--allow-run', '../../main.ts'])).trim().split('\n').sort()
  assertEqual(data, `
1.js ... ${color.green('ok')}
1.ts ... ${color.green('ok')}
2.js ${color.red('missing copyright!')}
foo/1.js ... ${color.green('ok')}
foo/2.js ${color.red('missing copyright!')}
foo/bar/1.js ... ${color.green('ok')}
foo/bar/2.js ${color.red('missing copyright!')}
foo/bar/baz/1.js ... ${color.green('ok')}
foo/bar/baz/2.js ${color.red('missing copyright!')}
`.trim().split('\n').sort())
})

test(async function quiet() {
  const data = (await xrun(['deno', '--allow-run', '../../main.ts', '-q'])).trim().split('\n').sort()
  assertEqual(data, `
2.js ${color.red('missing copyright!')}
foo/2.js ${color.red('missing copyright!')}
foo/bar/2.js ${color.red('missing copyright!')}
foo/bar/baz/2.js ${color.red('missing copyright!')}
`.trim().split('\n').sort())
})
