#!/bin/bash

set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network mainnet"
export CONF=$PWD/$HERE/addFCash.mainnet.config

# We only need to deploy the Oracle or the Module once
# $RUN $HERE/deployNotionalOracle.ts # Deploy Oracle
# $RUN $HERE/deployTransfer1155Module.ts # Deploy Module
$RUN $HERE/deployNotionalJoins.ts # Deploy Join

$RUN $HERE/addFCash.ts # Orchestrate Join, add asset, make ilk, add ilk to series - propose
$RUN $HERE/addFCash.ts # Orchestrate Join, add asset, make ilk, add ilk to series - approve
$RUN $HERE/addFCash.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
