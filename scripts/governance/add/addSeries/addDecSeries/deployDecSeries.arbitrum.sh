#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.arbitrum.config
# RUN="npx hardhat run --network arb_mainnet"
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../deploy/deployYieldMath.ts # deploy YieldMath
$RUN $HERE/../../../deploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../deploy/deployNonTVPools.ts # deploy pools
$RUN $HERE/../../../deploy/deployRoller.ts # deploy roller