#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.arbitrum.config
# RUN="npx hardhat run --network arb_mainnet"
RUN="npx hardhat run --network localhost"

# $RUN $HERE/loadTimelock.ts
# $RUN $HERE/joinLoan.ts
# $RUN $HERE/advanceTimeTwoWeeks.ts
# $RUN $HERE/advanceTimeThreeDays.ts

$RUN $HERE/activateDecSeries.ts
$RUN $HERE/activateDecSeries.ts
$RUN $HERE/activateDecSeries.ts