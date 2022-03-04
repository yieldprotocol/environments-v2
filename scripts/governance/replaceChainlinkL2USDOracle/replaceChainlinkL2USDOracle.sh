#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/replaceChainlinkL2USDOracle.arb_mainnet.config
RUN="npx hardhat run --network arb_mainnet"

$RUN $HERE/deployChainlinkL2USDOracle.ts
$RUN $HERE/setupOracles.ts
$RUN $HERE/setupOracles.ts
$RUN $HERE/setupOracles.ts
