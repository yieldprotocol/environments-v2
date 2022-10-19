#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addUSDTSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../deploy/deployJoins.ts # deploy fyTokens
$RUN $HERE/../../../deploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../deploy/deployEulerPools.ts # deploy pools
# $RUN $HERE/../../../deploy/deployStrategies.ts # deploy strategies
# # Add funds to the timelock
# $RUN $HERE/loadTimelock.ts

# $RUN $HERE/addFraxSeries.ts
# $RUN $HERE/addFraxSeries.ts
# $RUN $HERE/addFraxSeries.ts

# $RUN $HERE/addFraxSeries.test.ts