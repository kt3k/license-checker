test:
	deno test --unstable --allow-read --allow-write --allow-run test.ts

cov:
	deno test --coverage=coverage --unstable --allow-read --allow-write --allow-run test.ts
	deno coverage --unstable --lcov coverage > coverage/lcov.info

codecov:
	curl -s https://codecov.io/bash | bash

fmt:
	deno fmt

lint:
	deno lint

license:
	deno run --unstable --allow-read main.ts

dnt:
	deno run --unstable --allow-read --allow-write --allow-env --allow-run=npm --allow-net=deno.land dnt.ts

.PHONY: test cov codecov fmt lint license npm
