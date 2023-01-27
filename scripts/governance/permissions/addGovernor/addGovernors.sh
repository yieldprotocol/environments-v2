#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/addGovernors.mainnet.config
RUN="npx hardhat run --network mainnet"
# RUN="npx hardhat run --network tenderly"

$RUN $HERE/addGovernors.ts
# $RUN $HERE/../../../../shared/approve.ts
# $RUN $HERE/../../../../shared/execute.ts