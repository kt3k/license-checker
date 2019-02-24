#!/usr/bin/env deno --allow-run
// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.

import minimatch from "https://raw.githubusercontent.com/chrisdothtml/deno-minimatch/10f0d68f23f044e71b186112271633eb2c324835/index.js";
import { exit, args, readFile } from "deno";
import { parse } from "https://deno.land/x/flags@v0.2.6/mod.ts";
import { color } from "https://deno.land/x/colors@v0.2.6/mod.ts";

import { xrun, decode } from "./util.ts";

async function readConfig(config = ".licenserc.json") {
  let data;
  let configObj;
  try {
    data = await readFile(config);
  } catch (e) {
    console.log(`Error: config file "${config}" not found.`);
    exit(1);
  }

  try {
    configObj = JSON.parse(decode(data));
  } catch (e) {
    console.log(`Error: Failed to parse "${config}" as JSON.`);
    console.log(e);
    exit(1);
  }

  const ignore: string[] = configObj.ignore || [];
  delete configObj.ignore;

  const entries: Array<[string, string | string[]]> = Object.entries(configObj);

  return { ignore, config: entries };
}

const checkFile = async (
  filename: string,
  copyright: string | string[],
  quiet: boolean
) => {
  const sourceCode = decode(await readFile(filename));
  const copyrightLines: string[] = Array.isArray(copyright)
    ? copyright
    : [String(copyright)];
  if (copyrightLines.every(line => sourceCode.includes(line))) {
    if (!quiet) {
      console.log(filename, "...", color.green("ok"));
    }
    return true;
  }

  console.log(filename, color.red("missing copyright!"));
  return false;
};

const main = async opts => {
  if (opts.help) {
    console.log(`
Usage: license_checker.ts [options]

Options:
  -h, --help               Show this help message and exit.
  -v, --version            Show the version number and exit.
  -q, --quiet              Don't print messages except errors.
  -c, --config <filename>  Specify config filename. Default is '.licenserc.json'.
`);
    exit(0);
  }

  if (opts.version) {
    console.log("1.2.0");
    exit(0);
  }

  const { config, ignore } = await readConfig();
  const filenames = (await xrun(["git", "ls-files"])).trim().split("\n");

  const tasks = [];

  for (const filename of filenames) {
    for (const [glob, copyright] of config) {
      if (ignore.some(pattern => filename.includes(pattern))) {
        continue;
      }
      if (minimatch(filename, glob)) {
        tasks.push(checkFile(filename, copyright, opts.quiet));
      }
    }
  }

  const results = await Promise.all(tasks);

  if (results.includes(false)) {
    exit(1);
    return;
  }
  exit(0);
};

main(
  parse(args.slice(1), {
    boolean: ["quiet", "help", "version"],
    alias: {
      q: "quiet",
      h: "help",
      v: "version"
    }
  })
);
