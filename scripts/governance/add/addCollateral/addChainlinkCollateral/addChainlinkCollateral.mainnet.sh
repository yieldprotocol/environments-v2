#!/bin/bash

set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"
export CONF=$PWD/$HERE/addChainlinkCollateral.mainnet.config

$RUN $HERE/../../../redeploy/deployJoins.ts # Deploy Join
$RUN $HERE/addChainlinkCollateralWithWand.ts # Orchestrate Join, add asset, make ilk, add ilk to series - propose
$RUN $HERE/addChainlinkCollateralWithWand.ts # Orchestrate Join, add asset, make ilk, add ilk to series - approve
$RUN $HERE/addChainlinkCollateralWithWand.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
$RUN $HERE/addChainlinkCollateral.test.ts # Orchestrate Join, add asset, make ilk, add ilk to series - execute
