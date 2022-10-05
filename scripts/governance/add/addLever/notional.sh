#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/../../base.mainnet.config
RUN="npx hardhat run --network tenderly"

# $RUN $HERE/deployNotionalLever.ts
# $RUN $HERE/notionalLeverSetup.ts
# $RUN $HERE/notionalLeverSetup.ts
$RUN $HERE/notionalLeverSetup.ts
