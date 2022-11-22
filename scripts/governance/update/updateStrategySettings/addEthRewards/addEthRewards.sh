#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthRewards.mainnet.config
RUN="npx hardhat run --network tenderly"
# RUN="npx hardhat run --network mainnet"


$RUN $HERE/addEthRewards.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts
$RUN $HERE/addEthRewardsTest.ts