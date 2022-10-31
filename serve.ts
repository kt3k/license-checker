// Copyright 2020 Yoshiya Hinosawa. All rights reserved. MIT license.

import { serve } from "./dev_deps.ts";

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
