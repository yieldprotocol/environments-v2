#!/bin/bash

set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network rinkeby"
export CONF=$PWD/$HERE/addChainlinkCollateral.rinkeby.config

$RUN $HERE/../../redeploy/deployJoins.ts # Deploy Join
$RUN $HERE/addChainlinkCollateral.ts # Orchestrate Join, add asset, make ilk, add ilk to series - propose
$RUN $HERE/addChainlinkCollateral.ts # Orchestrate Join, add asset, make ilk, add ilk to series - approve
$RUN $HERE/addChainlinkCollateral.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
