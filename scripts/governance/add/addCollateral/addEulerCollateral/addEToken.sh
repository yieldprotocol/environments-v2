#!/bin/bash

set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network mainnet"
export CONF=$PWD/$HERE/addEToken.mainnet.config

# We only need to deploy the Oracle or the Module once
$RUN $HERE/deployEulerOracle.ts # Deploy Oracle
$RUN $HERE/deployEulerJoins.ts # Deploy Join

$RUN $HERE/addEToken.ts # Orchestrate Join, add asset, make ilk, add ilk to series - propose
$RUN $HERE/addEToken.ts # Orchestrate Join, add asset, make ilk, add ilk to series - approve
$RUN $HERE/addEToken.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
