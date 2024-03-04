// Copyright 2020-2022 Yoshiya Hinosawa. All rights reserved. MIT license.

/**
 * @module lib This module exports the main functionality of the license checker.
 */

import {
  blue,
  contains,
  delay,
  expandGlob,
  green,
  red,
  relative,
} from "./deps.ts";

/** */
const decoder: TextDecoder = new TextDecoder();
const decode: (data: Uint8Array) => string = (data: Uint8Array) =>
  decoder.decode(data);

const encoder: TextEncoder = new TextEncoder();
const encode: (str: string) => Uint8Array = (str: string) =>
  encoder.encode(str);

type LicenseLines = string | string[];

/**
 * The main config for the license checker.
 */
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
  const stat = await Deno.lstat(filename);
  if (stat.isDirectory) {
    if (!quiet) {
      console.log(filename, "is a directory. Skipping this item.");
    }
    return true;
  }
  const file = await Deno.open(filename, { read: true });
  // We assume copyright header appears in first 8KB of each file.
  const sourceCode = new Uint8Array(8192);
  await file.read(sourceCode);
  file.close();

  if (copyrightLines.every((line) => contains(sourceCode, line))) {
    if (!quiet) {
      console.log(filename, "...", green("ok"));
    }
    return true;
  }

  if (inject) {
    const sourceCode = await Deno.readFile(filename);
    console.log(`${filename} ${blue("missing copyright. injecting ... done")}`);
    await Deno.writeFile(
      filename,
      encode(copyrightLines.map(decode).join("\n") + "\n" + decode(sourceCode)),
    );
    return true;
  } else {
    console.log(filename, red("missing copyright!"));
  }

  return false;
};

/**
 * The options for the checkLicense function.
 */
export type CheckOptions = {
  cwd?: string;
  quiet?: boolean;
  inject?: boolean;
};

/**
 * Checks the license of the files in the given directory.
 */
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
