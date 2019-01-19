# deno_license_checker v0.0.0

This tool checks the license banners in the files in a git repository. You can configure which files should have which license texts with `.licenserc.json`.

# Usage

Create `.licenserc.json` like the following:

```json
{
  "**/*.ts": "// Copyright 2019 Foo. All rights reserved. MIT license."
}
```

Then run:

```console
deno https://raw.githubusercontent.com/kt3k/deno_license_checker/master/main.ts
```

This checks the license lines in the files in your repository.

# LICENSE

MIT
