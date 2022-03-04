#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/replaceChainlinkL2USDOracle.arb_rinkeby.config
RUN="npx hardhat run --network arb_rinkeby"

$RUN $HERE/deployChainlinkL2USDOracle.ts
$RUN $HERE/setupOracles.ts
$RUN $HERE/setupOracles.ts
$RUN $HERE/setupOracles.ts
