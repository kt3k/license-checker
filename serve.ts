// Copyright 2020-2022 Yoshiya Hinosawa. All rights reserved. MIT license.

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

export default function () {
  const controller = new AbortController();
  const { signal } = controller;
  const server = serve(() => {
    return new Response(JSON.stringify({
      "**/*.js": "Copyright js haha",
      "**/*.ts": "Copyright ts",
    }));
  }, { signal });
  return () => {
    controller.abort();
    return server;
  };
}
