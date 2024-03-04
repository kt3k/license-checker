<img src="https://raw.githubusercontent.com/kt3k/deno_license_checker/main/.github/logo.svg" width="300">

# license-checker v3.2.4

![ci](https://github.com/kt3k/deno_license_checker/workflows/ci/badge.svg)
[![codecov](https://codecov.io/gh/kt3k/deno_license_checker/branch/main/graph/badge.svg?token=pbV4Qsg70v)](https://codecov.io/gh/kt3k/deno_license_checker)

A utility for checking license headers in the files in a directory.

# Usage

Use via Deno:

```shell
deno run --allow-read jsr:@kt3k/license-checker@3.2.4
```

Use via npx:

```shell
npx @kt3k/license-checker
```

# Usage

Create `.licenserc.json` like the following:

```json
{
  "**/*.ts": "// Copyright 2019 My Name. All rights reserved. MIT license."
}
```

Then run:

```console
deno run --allow-read jsr:@kt3k/license-checker@3.2.4
```

This checks the license lines in the files under the current directory.

# `.licenserc.json`

You can use any glob pattern in the keys of `.licenserc.json`

```json
{
  "**/*.ts": "Copyright 2019 My Name. All rights reserved. MIT license.",

  "**/*.{js,ts}": "This matches any .js and .ts files",

  "*.go": "This matches .go file in the project root, (not in subdirectories)",

  "src/**/*.ts": "This matches .ts file in `src` dir",

  "**/*.ts": [
    "You can put multiline headers like this",

    "Copyright Foo, Inc. and other Bar contributors.",

    "Permission is hereby granted, free of charge, to any person obtaining a",
    "copy of this software and associated documentation files (the",
    "\"Software\"), to deal in the Software without restriction, including",
    "without limitation the rights to use, copy, modify, merge, publish,",
    "distribute, sublicense, and/or sell copies of the Software, and to permit",
    "persons to whom the Software is furnished to do so, subject to the",
    "following conditions:",
    "..."
  ]
}
```

### Ignore files

`ignore` property in the config file allows you to ignore certain files:

```js
{
  "**/*.js": "// Copyright 2019 My Name. All rights reserved. MIT license.",

  "ignore": [
    "lib/vendor/jquery.js", // ignore this file
    "vendor/" // ignore all files under vendor
  ]
}
```

`ignore` needs to be an array, not a string.

### Multiple config in `.licenserc.json`

You can put multiple config in `.licenserc.json` like the below:

```json
[
  {
    "*.ts": "Copyright main",
    "ignore": [
      "vendor.ts"
    ]
  },
  {
    "vendor.ts": "Copyright some vendor"
  }
]
```

Each object in the main array is treated independently as a single config. This
is useful when the some license lines overlaps the ignore pattern of the other
config.

# Options

```
Usage: license_checker.ts [options]

Options:
  -h, --help               Show this help message and exit.
  -v, --version            Show the version number and exit.
  -q, --quiet              Don't print messages except errors.
  -i, --inject             Inject license into head if missing.
  -c, --config <filename>  Specify config filename. Default is '.licenserc.json'.
```

# API

```ts
import { checkLicense } from "jsr:@kt3k/license-checker@3.2.4/lib";
```

## `checkLicense(configs: Config[], options: Options): Promise<boolean>`

Where:

```ts
type Config = {
  ignore?: string[];
  config: Array<[string, (string | string[])]>;
};

// The tuple `[string, (string | string[])]` means
// The pair of (globPattern, license-headers)
// This checks whether license-headers exists files of globPattern.

type Options = {
  inject: boolean;
  quiet: boolean;
  cwd: string;
};
```

This checks the license headers according to the given config and options.

# LICENSE

MIT

# History

- 2022-02-01 v3.2.0 Support url config.
- 2022-01-22 v3.1.7 Update dependencies.
- 2021-11-05 v3.1.6 Add npm support.
- 2021-07-22 v3.1.4 Fix directory handling.
- 2020-08-05 v3.0.3 Update for the new registry.
- 2020-06-23 v2.0.1 Update for deno v1.1.0.
- 2019-03-10 v1.5.0 Add --inject flag
- 2019-03-10 v1.4.0 Update for deno v0.3.x
- 2019-02-24 v1.3.0 Support Multiline copyright header #3
- 2019-02-16 v1.2.0 Initial release

# Development

See dev commands:

```sh
deno task
```

Run test:

```sh
deno task test
```
