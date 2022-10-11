#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addMarSeries.arbitrum.config
RUN="npx hardhat run --network arb_mainnet"
# RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../../tools/joinLoan.ts
# $RUN $HERE/../../../../../tools/loadTimelock.ts
# $RUN $HERE/../../../../../tools/advanceTimeToMaturity.ts
# $RUN $HERE/../../../../../tools/advanceTimeThreeDays.ts

$RUN $HERE/activateMarSeries.ts
# $RUN $HERE/activateMarSeries.ts
# $RUN $HERE/activateMarSeries.ts
