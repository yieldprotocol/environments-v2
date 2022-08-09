#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/../../../base.mainnet.config
RUN="npx hardhat run --network localhost"
$RUN $HERE/deployCollateralWand.ts
$RUN $HERE/collateralWandOrchestration.ts
$RUN $HERE/collateralWandOrchestration.ts
$RUN $HERE/collateralWandOrchestration.ts