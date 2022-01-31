// Copyright 2020 Yoshiya Hinosawa. All rights reserved. MIT license.

const { exit, args } = Deno;
import { parse } from "./deps.ts";
import { decode, readConfigFile } from "./util.ts";
import type { Config } from "./lib.ts";
import { checkLicense } from "./lib.ts";

async function readConfig(
  config = ".licenserc.json",
): Promise<Array<Config>> {
  let data: Uint8Array;
  let configObj;
  try {
    data = await readConfigFile(config);
    console.log(`Using config file "${config}"`);
  } catch (_e) {
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
  config?: string;
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
    console.log("3.1.7");
    exit(0);
  }

  const configList = await readConfig(opts.config);

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
    string: ["config"],
    boolean: ["quiet", "help", "version", "inject"],
    alias: {
      q: "quiet",
      i: "inject",
      h: "help",
      v: "version",
      c: "config",
    },
    // deno-lint-ignore no-explicit-any
  }) as any,
);
