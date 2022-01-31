import http from "http";

export default function () {
  const server = http.createServer((_req: any, res: any) => {
    res.end(JSON.stringify({
      "**/*.js": "Copyright js haha",
      "**/*.ts": "Copyright ts",
    }));
  });
  server.listen(8000);
  return () => {
    return new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  };
}
