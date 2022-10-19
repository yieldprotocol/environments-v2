#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addJuneSeries.arbitrum.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../../../tools/joinLoan.ts
# $RUN $HERE/../../../../../tools/loadTimelock.ts
# $RUN $HERE/../../../../../tools/advanceTimeToMaturity.ts
# $RUN $HERE/../../../../../tools/advanceTimeThreeDays.ts

$RUN $HERE/activateJuneSeries.ts
# $RUN $HERE/activateJuneSeries.ts
# $RUN $HERE/activateJuneSeries.ts
