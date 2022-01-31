// Copyright 2020 Yoshiya Hinosawa. All rights reserved. MIT license.

const { readFile } = Deno;
import { posix, win32 } from "./deps.ts";

const decoder = new TextDecoder();
export const decode = (data: Uint8Array): string => decoder.decode(data);

const encoder = new TextEncoder();
export const encode = (str: string): Uint8Array => encoder.encode(str);

async function run(args: string[], cwd?: string): Promise<Uint8Array> {
  const p = Deno.run({
    cmd: Deno.build.os === "windows" ? ["cmd.exe", "/c", ...args] : args,
    stdout: "piped",
    cwd,
  });
  const result = await p.output();
  p.close();
  return result;
}

export async function xrun(args: string[], cwd?: string): Promise<string> {
  return decode(await run(args, cwd));
}

export function relative(base: string, path: string): string {
  if (Deno.build.os === "windows") {
    return win32.relative(base, path);
  } else {
    return posix.relative(base, path);
  }
}

export function delay(n: number): Promise<void> {
  return new Promise((resolve, _) => {
    setTimeout(() => resolve(), n);
  });
}

export async function readConfigFile(config: string): Promise<Uint8Array> {
  if (
    config.startsWith("http://") || config.startsWith("https://") ||
    config.startsWith("file://")
  ) {
    const resp = await fetch(config);
    return new Uint8Array(await resp.arrayBuffer());
  }
  return readFile(config);
}
