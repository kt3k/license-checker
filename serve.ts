// Copyright 2020-2022 Yoshiya Hinosawa. All rights reserved. MIT license.

export default function () {
  const controller = new AbortController();
  const { signal } = controller;
  const server = Deno.serve({ signal }, () => {
    return new Response(JSON.stringify({
      "**/*.js": "Copyright js haha",
      "**/*.ts": "Copyright ts",
    }));
  });
  return () => {
    controller.abort();
    return server.finished;
  };
}
