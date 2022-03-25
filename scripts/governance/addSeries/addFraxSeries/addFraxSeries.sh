#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addFraxSeries.mainnet.config
RUN="npx hardhat run --network mainnet"

# Add funds to the timelock
# $RUN $HERE/loadTimelock.ts

# $RUN $HERE/deployWrapFraxerModule.ts # deploy WrapFraxerModule
# $RUN $HERE/../../newEnvironment/deployFYTokens.ts # deploy fyTokens
# $RUN $HERE/../../newEnvironment/deployPools.ts # deploy pools
# $RUN $HERE/../../newEnvironment/deployStrategies.ts # deploy strategies

$RUN $HERE/addFraxSeries.ts
# $RUN $HERE/addFraxSeries.ts
# $RUN $HERE/addFraxSeries.ts