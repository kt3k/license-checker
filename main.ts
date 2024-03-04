// Copyright 2020-2022 Yoshiya Hinosawa. All rights reserved. MIT license.

import { parse } from "./deps.ts";
import { checkLicense, type Config } from "./lib.ts";

/**
 * This module is the main entry point for the license checker tool.
 *
 * Create `.licenserc.json` like the following:
 *
 * ```json
 * {
 *  "*.ts": "// Copyright 2019 My Name. All rights reserved. MIT license."
 * }
 * ```
 *
 * Then, run the command
 *
 * ```
 * deno run --allow-read jsr:@kt3k/license-checker
 * ```
 *
 * @module
 */

/** Reads Config */
async function readConfig(
  config = ".licenserc.json",
): Promise<Array<Config>> {
  let text: string;
  let configObj;
  try {
    if (
      config.startsWith("http://") || config.startsWith("https://") ||
      config.startsWith("file://")
    ) {
      const resp = await fetch(config);
      text = await resp.text();
    } else {
      text = await Deno.readTextFile(config);
    }
    console.log(`Using config file "${config}"`);
  } catch (_e) {
    console.log(_e);
    console.log(`Error: config file "${config}" not found.`);
    Deno.exit(1);
  }

  try {
    configObj = JSON.parse(text);
  } catch (e) {
    console.log(`Error: Failed to parse "${config}" as JSON.`);
    console.log(e);
    Deno.exit(1);
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
    Deno.exit(0);
  }

  if (opts.version) {
    console.log("3.2.6");
    Deno.exit(0);
  }

  const configList = await readConfig(opts.config);

  if (
    await checkLicense(configList, {
      inject: opts.inject,
      quiet: opts.quiet,
    })
  ) {
    Deno.exit(0);
  } else {
    Deno.exit(1);
  }
};

main(
  parse(Deno.args, {
    string: ["config"],
    boolean: ["quiet", "help", "version", "inject"],
    alias: {
      q: "quiet",
      i: "inject",
      h: "help",
      v: "version",
      c: "config",
    },
  }),
);
