#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.goerli.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/loadTimelock.ts
# $RUN $HERE/advanceToMaturity.ts
# 
# $RUN $HERE/activateDecSeries.ts
# $RUN $HERE/activateDecSeries.ts
# $RUN $HERE/activateDecSeries.ts