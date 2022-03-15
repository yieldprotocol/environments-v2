#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthSeries.rinkeby.config
RUN="npx hardhat run --network rinkeby"

# Add funds to the timelock
# $RUN $HERE/loadTimelock.ts

$RUN $HERE/deployWrapEtherModule.ts # deploy WrapEtherModule
# $RUN $HERE/../../newEnvironment/deployFYTokens.ts # deploy fyTokens
# $RUN $HERE/../../newEnvironment/deployPools.ts # deploy pools
# $RUN $HERE/../../newEnvironment/deployStrategies.ts # deploy strategies
# 
# $RUN $HERE/addEthSeries.ts
# $RUN $HERE/addEthSeries.ts
# $RUN $HERE/addEthSeries.ts