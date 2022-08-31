#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addNonTvSeries.arbitrum.config
RUN="npx hardhat run --network localhost"
# RUN="npx hardhat run --network arb_main"

# Add funds to the timelock
# $RUN $HERE/loadTimelock.ts

$RUN $HERE/../../../deploy/deployYieldMath.ts # deploy YieldMath

$RUN $HERE/../../../deploy/deployNonTVPools.ts # deploy pools
# $RUN $HERE/../../../deploy/deployStrategies.ts # deploy strategies

# $RUN $HERE/addNonTvSeriess.ts
# $RUN $HERE/addNonTvSeriess.ts
# $RUN $HERE/addNonTvSeriess.ts