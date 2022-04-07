#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addFraxSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../redeploy/arbitrum/deployAccumulatorOracle.ts # deploy fyTokens
$RUN $HERE/../../redeploy/deployJoins.ts # deploy fyTokens
$RUN $HERE/../../redeploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../redeploy/deployPools.ts # deploy pools
$RUN $HERE/../../redeploy/deployStrategies.ts # deploy strategies
# Add funds to the timelock
$RUN $HERE/loadTimelock.ts

$RUN $HERE/deployOnChainTest.ts
$RUN $HERE/addFraxSeries.ts
$RUN $HERE/addFraxSeries.ts
$RUN $HERE/addFraxSeries.ts

$RUN $HERE/addFraxSeries.test.ts 