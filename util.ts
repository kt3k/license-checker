// Copyright 2020-2022 Yoshiya Hinosawa. All rights reserved. MIT license.

const { readFile } = Deno;

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
