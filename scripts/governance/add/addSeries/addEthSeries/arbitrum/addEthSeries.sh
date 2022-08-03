#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthSeries.arb_mainnet.config
RUN="npx hardhat run --network arb_mainnet"

# Add funds to the timelock
$RUN $HERE/../loadTimelock.ts

$RUN $HERE/../deployWrapEtherModule.ts # deploy WrapEtherModule
$RUN $HERE/../../../../redeploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../../redeploy/deployPools.ts # deploy pools
$RUN $HERE/../../../../redeploy/deployStrategies.ts # deploy strategies

$RUN $HERE/addEthSeries.ts
$RUN $HERE/addEthSeries.ts
$RUN $HERE/addEthSeries.ts
