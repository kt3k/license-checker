test:
	deno test --unstable --allow-read --allow-write --allow-run

cov:
	deno test --coverage=coverage --unstable --allow-read --allow-write --allow-run
	deno coverage --unstable --lcov coverage > coverage/lcov.info

codecov:
	curl -s https://codecov.io/bash | bash

fmt:
	deno fmt

lint:
	deno lint

license:
	deno run --unstable --allow-read main.ts

npm:
	deno run --allow-read --allow-write --allow-env --allow-run=npm build_npm.ts

.PHONY: test cov codecov fmt lint license npm
