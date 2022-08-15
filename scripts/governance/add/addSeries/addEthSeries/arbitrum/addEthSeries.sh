#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthSeries.arb_mainnet.config
RUN="npx hardhat run --network localhost"

# Add funds to the timelock
$RUN $HERE/../loadTimelock.ts

$RUN $HERE/../../../deploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../deploy/deployPools.ts # deploy pools
$RUN $HERE/../../../deploy/deployStrategies.ts # deploy strategies

$RUN $HERE/addEthSeries.ts
$RUN $HERE/addEthSeries.ts
$RUN $HERE/addEthSeries.ts
