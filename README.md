<img src="https://raw.githubusercontent.com/kt3k/deno_license_checker/master/media/deno_license_checker.png" width="100">

# deno_license_checker v3.0.4

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
deno run --unstable --allow-read https://deno.land/x/license_checker@v3.0.4/main.ts
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

  "**/*.ts": [
    "You can put multiline headers like this",

    "Copyright Foo, Inc. and other Bar contributors."

    "Permission is hereby granted, free of charge, to any person obtaining a"
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

Each object in the main array is treated independently as a single config. This is useful when the some license lines overlaps the ignore pattern of the other config.

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

```
import { checkLicense} from "https://deno.land/x/license_checker@03.0.4/lib.ts";
```

## `checkLicense(configs: Config[], options: Options): Promise<boolean>`

Where:

```
type Config = {
  ignore?: string[]
  config: Array<[string, (string | string[])]>
}

// The tuple `[string, (string | string[])]` means
// The pair of (globPattern, license-headers)
// This checks whether license-headers exists files of globPattern.

type Options = {
  inject: boolean
  quiet: boolean
  cwd: string
}
```

This checks the license headers according to the given config and options.

# LICENSE

MIT

# See also

- GitHub action version of this tool
  - https://github.com/kt3k/license_checker

# History

- 2020-08-05 v3.0.3 Update for the new registry.
- 2020-06-23 v2.0.1 Update for deno v1.1.0.
- 2019-03-10 v1.5.0 Add --inject flag
- 2019-03-10 v1.4.0 Update for deno v0.3.x
- 2019-02-24 v1.3.0 Support Multiline copyright header #3
- 2019-02-16 v1.2.0 Initial release

# Development

See dev commands:

```sh
./s
```

Run test:

```sh
./s test
```
