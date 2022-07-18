#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.mainnet.config
RUN="npx hardhat run --network tenderly"

# $RUN $HERE/loadTimelock.ts
# $RUN $HERE/joinLoan.ts
# $RUN $HERE/advanceTimeTwoWeeks.ts
$RUN $HERE/advanceTimeThreeDays.ts

$RUN $HERE/activateDecSeries.ts
# $RUN $HERE/activateDecSeries.ts
# $RUN $HERE/activateDecSeries.ts