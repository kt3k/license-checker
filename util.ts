// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
import { run as denoRun, platform } from "deno";

const decoder = new TextDecoder();
export const decode = data => decoder.decode(data);

export const run = args =>
  denoRun({
    args: platform.os === "win" ? ["cmd.exe", "/c", ...args] : args,
    stdout: "piped"
  });

export const xrun = async args => decode(await run(args).output());
