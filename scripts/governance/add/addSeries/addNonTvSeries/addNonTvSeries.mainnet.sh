#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addNonTvSeries.mainnet.config
RUN="npx hardhat run --network localhost"
# RUN="npx hardhat run --network tenderly"
# RUN="npx hardhat run --network mainnet"

$RUN $HERE/../../../../../shared/deploy.ts

# $RUN $HERE/../../../deploy/deployYieldMath.ts
# $RUN $HERE/../../../deploy/deployNonTVPools.ts
# $RUN $HERE/../../../deploy/deployStrategies.ts

# $RUN $HERE/loadTimelockFraxMainnet.ts # need 200 dai and 200 usdc 100 each for pool and strategy

# $RUN $HERE/addNonTvSeries.ts
# $RUN $HERE/addNonTvSeries.ts
# $RUN $HERE/addNonTvSeries.ts