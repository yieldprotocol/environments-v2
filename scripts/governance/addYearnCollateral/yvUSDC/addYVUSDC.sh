#!/bin/bash

set -eux
RUN="npx hardhat run --network rinkeby"
HERE=$(dirname $0)

# $RUN scripts/fragments/oracles/deployYearnOracle.ts

$RUN $HERE/addYVUSDC-1.ts # Deploy Join

$RUN $HERE/addYVUSDC-2.ts # Orchestrate Join, add asset, make ilk, add ilk to series - propose
$RUN $HERE/addYVUSDC-2.ts # Orchestrate Join, add asset, make ilk, add ilk to series - approve
$RUN $HERE/addYVUSDC-2.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
