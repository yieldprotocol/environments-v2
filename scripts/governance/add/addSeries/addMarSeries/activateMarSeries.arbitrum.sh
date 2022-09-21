#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addMarSeries.arbitrum.config
RUN="npx hardhat run --network arb_mainnet"
# RUN="npx hardhat run --network tenderly"

# $RUN $HERE/loadTimelock.ts
# $RUN $HERE/joinLoan.ts
# $RUN $HERE/advanceTimeTwoWeeks.ts
# $RUN $HERE/advanceTimeThreeDays.ts

$RUN $HERE/activateMarSeries.ts
# $RUN $HERE/activateMarSeries.ts
# $RUN $HERE/activateMarSeries.ts