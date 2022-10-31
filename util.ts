// Copyright 2020-2022 Yoshiya Hinosawa. All rights reserved. MIT license.

const { readFile } = Deno;

const decoder = new TextDecoder();
export const decode = (data: Uint8Array) => decoder.decode(data);

const encoder = new TextEncoder();
export const encode = (str: string) => encoder.encode(str);

export async function run(args: string[], cwd?: string) {
  const p = Deno.run({
    cmd: args,
    stdout: "piped",
    cwd,
  });
  const result = await p.output();
  p.close();
  return decode(result);
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
