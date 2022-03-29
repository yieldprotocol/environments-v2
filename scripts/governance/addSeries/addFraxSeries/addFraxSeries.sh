#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addFraxSeries.mainnet.config
RUN="npx hardhat run --network localhost"



$RUN $HERE/../../newEnvironment/arbitrum/deployAccumulatorOracle.ts # deploy fyTokens
$RUN $HERE/../../newEnvironment/deployJoins.ts # deploy fyTokens
$RUN $HERE/../../newEnvironment/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../newEnvironment/deployPools.ts # deploy pools

$RUN $HERE/addFraxSeries.ts
$RUN $HERE/addFraxSeries.ts
$RUN $HERE/addFraxSeries.ts

$RUN $HERE/../../newEnvironment/deployStrategies.ts # deploy strategies

# Add funds to the timelock
$RUN $HERE/loadTimelock.ts

$RUN $HERE/addFraxSeries-2.ts
$RUN $HERE/addFraxSeries-2.ts
$RUN $HERE/addFraxSeries-2.ts