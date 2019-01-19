#!/usr/bin/env deno --allow-run
// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
import minimatch from "https://raw.githubusercontent.com/kt3k/deno-minimatch/feature/update-paths/index.js"
import { args, run, readFile } from "deno"
import { parse } from "https://deno.land/x/flags/mod.ts"
import { red, green } from "https://deno.land/x/std/colors/mod.ts"

const decoder = new TextDecoder()
const decode = data => decoder.decode(data)

const readConfig = async (config = '.licenserc.json') =>
  Object.entries(JSON.parse(decode(await readFile(config))))

const main = async () => {
  const config = await readConfig()
  const p = run({
    args: ["git", "ls-files"],
    stdout: 'piped'
  })

  const filenames = decode(await p.output()).trim().split('\n')

  for (const filename of filenames) {
    for (const [glob, copyright] of config) {
      if (minimatch(filename, glob)) {
        if (decode(await readFile(filename)).includes(String(copyright))) {
          console.log(filename, '...', green('ok'))
        } else {
          console.log(filename, red('missing copyright!'))
        }
      }
    }
  }
}

main()
