#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addUSDTSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../../../shared/deploy.ts
# # $RUN $HERE/addUSDTSeries.ts
# # $RUN $HERE/../../../../../shared/approve.ts
# # $RUN $HERE/../../../../../tools/advanceTimeThreeDays.ts
# $RUN $HERE/../../../../../shared/execute.ts

# $RUN $HERE/../../../deploy/deployJoins.ts # deploy fyTokens
# $RUN $HERE/../../../deploy/deployFYTokens.ts # deploy fyTokens
# $RUN $HERE/../../../deploy/deployEulerPools.ts # deploy pools
# $RUN $HERE/../../../deploy/deployStrategies.ts # deploy strategies
# # Add funds to the timelock
# $RUN $HERE/loadTimelock.ts

# $RUN $HERE/addFraxSeries.ts
# $RUN $HERE/addFraxSeries.ts
# $RUN $HERE/addFraxSeries.ts

# $RUN $HERE/addFraxSeries.test.ts