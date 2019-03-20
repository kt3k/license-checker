#!/usr/bin/env deno --allow-run
// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.

import writeFile = Deno.writeFile

const { exit, args, readFile } = Deno
import { parse, red, green, blue, globrex, encode } from "./deps.ts"

import { xrun, decode } from "./util.ts"

function match(filename, glob) {
  return globrex(glob, { globstar: true }).regex.test(filename)
}

async function readConfig(config = ".licenserc.json") {
  let data
  let configObj
  try {
    data = await readFile(config)
  } catch (e) {
    console.log(`Error: config file "${config}" not found.`)
    exit(1)
  }

  try {
    configObj = JSON.parse(decode(data))
  } catch (e) {
    console.log(`Error: Failed to parse "${config}" as JSON.`)
    console.log(e)
    exit(1)
  }

  const ignore: string[] = configObj.ignore || []
  delete configObj.ignore

  const entries: Array<[string, string | string[]]> = Object.entries(configObj)

  return { ignore, config: entries }
}

const checkFile = async (
  filename: string,
  copyright: string | string[],
  quiet: boolean,
  inject: boolean
) => {
  const sourceCode = decode(await readFile(filename))
  const copyrightLines: string[] = Array.isArray(copyright)
    ? copyright
    : [String(copyright)]
  if (copyrightLines.every(line => sourceCode.includes(line))) {
    if (!quiet) {
      console.log(filename, "...", green("ok"))
    }
    return true
  }

  if (inject) {
    console.log(`${filename} ${blue("missing copyright. injecting ... done")}`)
    await writeFile(
      filename,
      encode(copyrightLines.join("\n") + "\n" + sourceCode)
    )
    return true
  } else {
    console.log(filename, red("missing copyright!"))
  }

  return false
}

const main = async opts => {
  if (opts.help) {
    console.log(`
Usage: license_checker.ts [options]

Options:
  -H, --help               Show this help message and exit.
  -V, --version            Show the version number and exit.
  -q, --quiet              Don't print messages except errors.
  -i, --inject             Inject license into head if missing.
  -c, --config <filename>  Specify config filename. Default is '.licenserc.json'.
`)
    exit(0)
  }

  if (opts.version) {
    console.log("1.5.0")
    exit(0)
  }

  const { config, ignore } = await readConfig()
  const filenames = (await xrun(["git", "ls-files"])).trim().split("\n")

  const tasks = []

  for (const filename of filenames) {
    for (const [glob, copyright] of config) {
      if (ignore.some(pattern => filename.includes(pattern))) {
        continue
      }
      if (match(filename, glob)) {
        tasks.push(checkFile(filename, copyright, opts.quiet, opts.inject))
      }
    }
  }

  const results = await Promise.all(tasks)

  if (results.includes(false)) {
    exit(1)
    return
  }
  exit(0)
}

main(
  parse(args.slice(1), {
    boolean: ["quiet", "help", "version", "inject"],
    alias: {
      q: "quiet",
      i: "inject",
      H: "help",
      V: "version"
    }
  })
)
