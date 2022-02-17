all: build test

build/env:
	yarn && yarn build

clean/env:
	yarn cache clean

test/env:
	yarn test

build/liquidator:
	cd modules/liquidator && \
	yarn && yarn build

clean/liquidator:
	cd modules/liquidator && \
	yarn cache clean && \

test/liquidator:
	cd modules/liquidator && \
	yarn test

_regression_tests := $(patsubst regression_tests/test_%.ts,regression.%,$(wildcard regression_tests/test_*.ts))

regression.%:
	npx hardhat test regression_tests/test_$*.ts

regression.flashLiquidator:
	pushd modules/liquidator && \
	npm run buildRouter && \
	popd && \
	npx hardhat test regression_tests/test_flashLiquidator.ts


build: build/env build/liquidator
clean: clean/env clean/liquidator
test: test/env test/liquidator
regressions: $(_regression_tests)

.PHONY: build clean regressions test