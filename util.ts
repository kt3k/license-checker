// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
import { run as denoRun, platform } from "deno";

const decoder = new TextDecoder();
export const decode = data => decoder.decode(data);

export function run(args: string[], cwd?: string) {
  return denoRun({
    args: platform.os === "win" ? ["cmd.exe", "/c", ...args] : args,
    stdout: "piped",
    cwd
  });
}

export async function xrun(args: string[], cwd?: string) {
  return decode(await run(args, cwd).output());
}
