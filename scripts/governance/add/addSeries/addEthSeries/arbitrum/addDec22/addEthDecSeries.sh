#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthDecSeries.arb_mainnet.config
RUN="npx hardhat run --network localhost"

# Add funds to the timelock
$RUN $HERE/../../loadTimelock.ts

$RUN $HERE/../../../../../deploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../../../deploy/deployNonTVPools.ts # deploy pools
$RUN $HERE/../../../../../deploy/deployStrategies.ts # deploy strategies

$RUN $HERE/addEthDecSeries.ts
$RUN $HERE/addEthDecSeries.ts
$RUN $HERE/addEthDecSeries.ts
$RUN $HERE/../addEthSeries.test.ts