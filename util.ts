// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
//
const decoder = new TextDecoder();
export const decode = (data: Uint8Array): string => decoder.decode(data);

const encoder = new TextEncoder();
export const encode = (str: string): Uint8Array => encoder.encode(str);

export function run(args: string[], cwd?: string) {
  return Deno.run({
    cmd: Deno.build.os === "windows" ? ["cmd.exe", "/c", ...args] : args,
    stdout: "piped",
    cwd,
  });
}

export async function xrun(args: string[], cwd?: string) {
  return decode(await run(args, cwd).output());
}
