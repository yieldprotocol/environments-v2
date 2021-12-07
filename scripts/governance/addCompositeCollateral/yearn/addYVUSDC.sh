#!/bin/bash

set -eux
RUN="npx hardhat run --network localhost"
HERE=$(dirname $0)

$RUN scripts/fragments/oracles/deployYearnOracle.ts
$RUN $HERE/addYVUSDC-2.ts # Set oracles - propose
$RUN $HERE/addYVUSDC-2.ts # Set oracles - approve
$RUN $HERE/addYVUSDC-2.ts # Set oracles - execute
$RUN $HERE/addYVUSDC-3.ts # Add asset - propose
$RUN $HERE/addYVUSDC-3.ts # Add asset - approve
$RUN $HERE/addYVUSDC-3.ts # Add asset - execute
$RUN $HERE/addYVUSDC-4.ts # Orchestrate join, make ilk, add ilk to series
$RUN $HERE/addYVUSDC-4.ts # Orchestrate join, make ilk, add ilk to series
$RUN $HERE/addYVUSDC-4.ts # Orchestrate join, make ilk, add ilk to series
