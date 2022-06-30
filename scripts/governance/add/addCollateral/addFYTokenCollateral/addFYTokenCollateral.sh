#!/bin/bash

set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"
export CONF=$PWD/$HERE/addFYTokenCollateral.arb_mainnet.config

$RUN $HERE/../../../redeploy/deployJoins.ts # Deploy Join

$RUN $HERE/addFYTokenCollateral.ts # Orchestrate Join, add asset, make ilk, add ilk to series - propose
$RUN $HERE/addFYTokenCollateral.ts # Orchestrate Join, add asset, make ilk, add ilk to series - approve
$RUN $HERE/addFYTokenCollateral.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
