#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addSeptSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../newEnvironment/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../newEnvironment/deployPools.ts # deploy pools

$RUN $HERE/loadTimelock.ts

$RUN $HERE/addSeptSeries-3.ts
$RUN $HERE/addSeptSeries-3.ts
$RUN $HERE/addSeptSeries-3.ts

# $RUN $HERE/advanceToMaturity.ts
# $RUN $HERE/debugEndRoll.ts