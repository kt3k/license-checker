// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
//
const decoder = new TextDecoder();
export const decode = (data) => decoder.decode(data);

export function run(args: string[], cwd?: string) {
  return Deno.run({
    args: Deno.build.os === "win" ? ["cmd.exe", "/c", ...args] : args,
    stdout: "piped",
    cwd,
  });
}

export async function xrun(args: string[], cwd?: string) {
  return decode(await run(args, cwd).output());
}
