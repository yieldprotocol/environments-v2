all: build

node_modules/.installed: yarn.lock
	yarn install --immutable && cp yarn.lock node_modules/.installed

build/env: node_modules/.installed
	yarn build

clean/env:
	yarn cache clean

test/env:
	yarn test

build/liquidator: build/liquidator.router build/liquidator.cargo
	cd modules/liquidator && \
	yarn install --immutable && yarn build && yarn run hardhat export-abi && \
	npm run buildRouter && \
	cargo build

modules/liquidator/node_modules/.installed: modules/liquidator/yarn.lock
	cd modules/liquidator && \
		yarn install --immutable  && cp yarn.lock node_modules/.installed

build/liquidator.yarn: modules/liquidator/node_modules/.installed
	cd modules/liquidator && \
	yarn build && yarn run hardhat export-abi

build/liquidator.router: build/liquidator.yarn
	cd modules/liquidator && \
	npm run buildRouter

build/liquidator.cargo: build/liquidator.yarn
	cd modules/liquidator && \
	cargo build

clean/liquidator:
	cd modules/liquidator && \
	yarn cache clean

test/liquidator:
	cd modules/liquidator && \
	yarn test

_regression_tests := $(patsubst regression_tests/test_%.ts,regression.%,$(wildcard regression_tests/test_*.ts))

regression.%:
# pass NODE_OPTIONS to increase the node max memory size - it runs OOM in CI otherwise
	NODE_OPTIONS="--max-old-space-size=4096" npx hardhat test regression_tests/test_$*.ts

build: build/env build/liquidator
clean: clean/env clean/liquidator
test: test/env test/liquidator
regressions: $(_regression_tests)

.PHONY: build clean regressions test
