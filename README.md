# deno_license_checker v1.1.0

[![Build Status](https://travis-ci.org/kt3k/deno_license_checker.svg?branch=master)](https://travis-ci.org/kt3k/deno_license_checker)
[![Build status](https://ci.appveyor.com/api/projects/status/8gf0iwg0d6gwhu2a/branch/master?svg=true)](https://ci.appveyor.com/project/kt3k/deno-license-checker/branch/master)

This tool checks the license headers in the files in a git repository. You can configure which files should have which license texts with `.licenserc.json`.

# Usage

Create `.licenserc.json` like the following:

```json
{
  "**/*.ts": "// Copyright 2019 My Name. All rights reserved. MIT license."
}
```

Then run:

```console
deno --allow-run https://raw.githubusercontent.com/kt3k/deno_license_checker/v1.1.0/main.ts
```

This checks the license lines in the files in your repository.

# `.licenserc.json`

You can use any glob pattern in the keys of `.licenserc.json`

```json
{
  "**/*.ts": "Copyright 2019 My Name. All rights reserved. MIT license.",

  "**/*.{js,ts}": "This matches any .js and .ts files",

  "*.go": "This matches .go file in the project root, (not in subdirectories)",

  "src/**/*.ts": "This matches .ts file in `src` dir",
}
```

### Ignore certain files

You can ignore certain files by the `ignore` array in config.

```js
{
  "**/*.js": "// Copyright 2019 My Name. All rights reserved. MIT license.",

  "ignore": [
    "lib/vendor/jquery.js", // ignore this file
    "vendor/" // ignore all files under vendor
  ]
}
```

Note: `ignore` needs to be an array, not a string.

# Options

```
Usage: license_checker.ts [options]

Options:
  -h, --help               Show this help message and exit.
  -v, --version            Show the version number and exit.
  -q, --quiet              Don't print messages except errors.
  -c, --config <filename>  Specify config filename. Default is '.licenserc.json'.
```

# LICENSE

MIT
