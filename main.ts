// Copyright 2020 Yoshiya Hinosawa. All rights reserved. MIT license.

import writeFile = Deno.writeFile;

const { exit, args, readFile } = Deno;
import { blue, contains, expandGlob, green, parse, red } from "./deps.ts";

import { decode, delay, encode, relative } from "./util.ts";
import type { Config } from "./lib.ts";
import { checkLicense } from "./lib.ts";

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
    console.log("3.0.4");
    exit(0);
  }

  const configList = await readConfig();

  if (
    await checkLicense(configList, {
      inject: opts.inject,
      quiet: opts.quiet,
    })
  ) {
    exit(0);
  } else {
    exit(1);
  }
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
