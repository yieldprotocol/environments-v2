#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthSeries.mainnet.config
RUN="npx hardhat run --network mainnet"

# Add funds to the timelock
# $RUN $HERE/loadTimelock.ts

# $RUN $HERE/../../deploy/deployPools.ts # deploy pools
# $RUN $HERE/../../deploy/deployStrategies.ts # deploy strategies

$RUN $HERE/addEthSeries.ts
# $RUN $HERE/addEthSeries.ts
# $RUN $HERE/addEthSeries.ts