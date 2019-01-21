// Copyright 2019 Yoshiya Hinosawa. All rights reserved. MIT license.
import { run, platform } from "deno"

const decoder = new TextDecoder()
export const decode = data => decoder.decode(data)

export const xrun = async (args) =>
  decode(await run({
    args: platform.os === 'win' ? ['cmd.exe', '/c', ...args] : args,
    stdout: 'piped'
  }).output())
