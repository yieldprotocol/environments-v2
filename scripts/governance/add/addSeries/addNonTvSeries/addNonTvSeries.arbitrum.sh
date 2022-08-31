#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addNonTvSeries.arbitrum.config
RUN="npx hardhat run --network localhost"
# RUN="npx hardhat run --network arb_main"

$RUN $HERE/../../../deploy/deployYieldMath.ts # deploy YieldMath
$RUN $HERE/../../../deploy/deployNonTVPools.ts # deploy pools
# $RUN $HERE/../../../deploy/deployStrategies.ts # TODO: Haven't updated this yet

$RUN $HERE/addNonTvSeries.ts
# $RUN $HERE/addNonTvSeries.ts
# $RUN $HERE/addNonTvSeries.ts