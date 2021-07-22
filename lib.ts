// Copyright 2020 Yoshiya Hinosawa. All rights reserved. MIT license.

import writeFile = Deno.writeFile;

const { readFile } = Deno;
import { blue, contains, expandGlob, green, red } from "./deps.ts";

import { decode, delay, encode, relative } from "./util.ts";

type LicenseLines = string | string[];

export interface Config {
  ignore?: string[];
  config: Array<[string, LicenseLines]>;
}

const checkFile = async (
  filename: string,
  copyrightLines: Uint8Array[],
  quiet: boolean,
  inject: boolean,
): Promise<boolean> => {
  const file = await Deno.open(filename, { read: true });
  // We assume copyright header appears in first 8KB of each file.
  const sourceCode = new Uint8Array(8192);
  await Deno.read(file.rid, sourceCode);
  Deno.close(file.rid);

  if (copyrightLines.every((line) => contains(sourceCode, line))) {
    if (!quiet) {
      console.log(filename, "...", green("ok"));
    }
    return true;
  }

  if (inject) {
    const sourceCode = await readFile(filename);
    console.log(`${filename} ${blue("missing copyright. injecting ... done")}`);
    await writeFile(
      filename,
      encode(copyrightLines.map(decode).join("\n") + "\n" + decode(sourceCode)),
    );
    return true;
  } else {
    console.log(filename, red("missing copyright!"));
  }

  return false;
};

type CheckOptions = {
  cwd?: string;
  quiet?: boolean;
  inject?: boolean;
};

export const checkLicense = async (
  configs: Config[],
  opts: CheckOptions = {},
): Promise<boolean> => {
  const cwd = opts.cwd ?? Deno.cwd();
  const quiet = opts.quiet ?? false;
  const inject = opts.inject ?? false;
  const tasks = [];

  for (const { ignore, config } of configs) {
    for (const [glob, copyright] of config) {
      const copyrightLines = Array.isArray(copyright)
        ? copyright.map(encode)
        : [encode(copyright)];
      for await (const file of expandGlob(glob)) {
        const relPath = relative(cwd, file.path);
        if (ignore?.some((pattern) => relPath.includes(pattern))) {
          continue;
        }
        tasks.push(checkFile(relPath, copyrightLines, quiet, inject));
        await delay(1);
      }
    }
  }

  const results = await Promise.all(tasks);

  return !results.includes(false);
};
