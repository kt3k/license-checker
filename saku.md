<!-- saku v1.2.0 -->

# test

> Run unit tests

    deno test --unstable --allow-read --allow-write --allow-run

# cov

> Make lcov.info

    deno test --coverage=coverage --unstable --allow-read --allow-write --allow-run
    deno coverage --unstable --lcov coverage > coverage/lcov.info

# codecov

> Send lcov.info to codecov

    bash <(curl -s https://codecov.io/bash)

# fmt

> Formats the source code

    deno fmt

# lint

> Formats the source code

    deno lint --unstable

# license

> Checks the licenses

    deno run --unstable --allow-read main.ts
