#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addMarSeries.mainnet.config
# RUN="npx hardhat run --network mainnet"
RUN="npx hardhat run --network localhost"

# $RUN $HERE/loadTimelock.ts
# $RUN $HERE/advanceTimeToMaturity.ts
 
$RUN $HERE/activateMarSeries.ts
# $RUN $HERE/activateMarSeries.ts
# $RUN $HERE/activateMarSeries.ts
