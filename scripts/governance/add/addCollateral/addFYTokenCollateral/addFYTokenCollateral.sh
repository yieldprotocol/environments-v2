#!/bin/bash

set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network mainnet"
export CONF=$PWD/$HERE/addFYTokenCollateral.mainnet.config

# We only need to deploy the Oracle or the Module once
$RUN $HERE/deployTWAROracle.ts # Deploy Oracle
$RUN $HERE/../redeploy/deployJoins.ts # Deploy Join

$RUN $HERE/addFYTokenCollateral.ts # Orchestrate Join, add asset, make ilk, add ilk to series - propose
$RUN $HERE/addFYTokenCollateral.ts # Orchestrate Join, add asset, make ilk, add ilk to series - approve
$RUN $HERE/addFYTokenCollateral.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
