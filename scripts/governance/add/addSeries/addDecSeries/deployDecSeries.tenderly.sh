#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.mainnet.config
RUN="npx hardhat run --network localhost"
# RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../deploy/deployYieldMath.ts # deploy YieldMath
$RUN $HERE/../../../deploy/deployFYTokens.ts # deploy fyTokens
# $RUN $HERE/../../../deploy/deployYVPools.ts # deploy pools
# $RUN $HERE/../../../deploy/deployEulerPools.ts # deploy pools
$RUN $HERE/../../../deploy/deployEulerPoolsMANUAL.ts # deploy pools
# $RUN $HERE/../../../deploy/deployNonTVPools.ts # deploy pools
$RUN $HERE/../../../deploy/deployNonTVPoolsMANUAL.ts # deploy pools

$RUN $HERE/../../../deploy/orchestrateNewPools.ts # deploy pools
$RUN $HERE/../../../deploy/deployRoller.ts # deploy roller