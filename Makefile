.PHONY: test
test:
	deno test --unstable --allow-read --allow-write --allow-run --allow-net=0.0.0.0:8000 test.ts

.PHONY: cov
cov:
	deno test --coverage=coverage --unstable --allow-read --allow-write --allow-run test.ts
	deno coverage --unstable --lcov coverage > coverage/lcov.info

.PHONY: codecov
codecov:
	curl -s https://codecov.io/bash | bash

.PHONY: fmt
fmt:
	deno fmt

.PHONY: lint
lint:
	deno lint

.PHONY: license
license:
	deno run --unstable --allow-read main.ts

.PHONY: dnt
dnt:
	deno run --unstable --allow-read --allow-write --allow-env --allow-run=npm,cmd --allow-net=deno.land dnt.ts

.PHONY: udd
udd:
	deno run -A https://deno.land/x/udd@0.5.0/main.ts deps.ts dev_deps.ts dnt.ts
