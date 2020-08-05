#!/usr/bin/env deno --allow-run
// Copyright 2020 Yoshiya Hinosawa. All rights reserved. MIT license.

import writeFile = Deno.writeFile;

const { exit, args, readFile } = Deno;
import { parse, red, green, blue, expandGlob } from "./deps.ts";

import { decode, encode, relative } from "./util.ts";

type LicenseLines = string | string[];

interface Config {
  ignore?: string[];
  config: Array<[string, LicenseLines]>;
}

async function readConfig(
  config: string = ".licenserc.json",
): Promise<Array<Config>> {
  let data: Uint8Array;
  let configObj;
  try {
    data = await readFile(config);
  } catch (e) {
    console.log(`Error: config file "${config}" not found.`);
    exit(1);
  }

  try {
    configObj = JSON.parse(decode(data!));
  } catch (e) {
    console.log(`Error: Failed to parse "${config}" as JSON.`);
    console.log(e);
    exit(1);
  }

  let configObjArray: Array<Config>;

  if (Array.isArray(configObj)) {
    configObjArray = configObj;
  } else {
    configObjArray = [configObj];
  }

  return configObjArray.map(configObjToConfig);
}

function configObjToConfig(configObj: Config): Config {
  const ignore = configObj.ignore || [];
  delete configObj.ignore;

  const entries: Array<[string, string | string[]]> = Object.entries(configObj);

  return { ignore, config: entries };
}

const checkFile = async (
  filename: string,
  copyright: string | string[],
  quiet?: boolean,
  inject?: boolean,
): Promise<boolean> => {
  const sourceCode = decode(await readFile(filename));
  const copyrightLines: string[] = Array.isArray(copyright)
    ? copyright
    : [String(copyright)];
  if (copyrightLines.every((line) => sourceCode.includes(line))) {
    if (!quiet) {
      console.log(filename, "...", green("ok"));
    }
    return true;
  }

  if (inject) {
    console.log(`${filename} ${blue("missing copyright. injecting ... done")}`);
    await writeFile(
      filename,
      encode(copyrightLines.join("\n") + "\n" + sourceCode),
    );
    return true;
  } else {
    console.log(filename, red("missing copyright!"));
  }

  return false;
};

type Opts = {
  help?: boolean;
  version?: boolean;
  quiet?: boolean;
  inject?: boolean;
};

const main = async (opts: Opts) => {
  if (opts.help) {
    console.log(`
Usage: license_checker.ts [options]

Options:
  -H, --help               Show this help message and exit.
  -V, --version            Show the version number and exit.
  -q, --quiet              Don't print messages except errors.
  -i, --inject             Inject license into head if missing.
  -c, --config <filename>  Specify config filename. Default is '.licenserc.json'.
`);
    exit(0);
  }

  if (opts.version) {
    console.log("3.0.2");
    exit(0);
  }

  const configList = await readConfig();
  const cwd = Deno.cwd();

  const tasks = [];

  for (const { ignore, config } of configList) {
    for (const [glob, copyright] of config) {
      for await (const file of expandGlob(glob)) {
        const relPath = relative(cwd, file.path);
        if (ignore?.some((pattern) => relPath.includes(pattern))) {
          continue;
        }
        tasks.push(checkFile(relPath, copyright, opts.quiet, opts.inject));
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
  parse(args, {
    boolean: ["quiet", "help", "version", "inject"],
    alias: {
      q: "quiet",
      i: "inject",
      h: "help",
      v: "version",
    },
    // deno-lint-ignore no-explicit-any
  }) as any,
);
