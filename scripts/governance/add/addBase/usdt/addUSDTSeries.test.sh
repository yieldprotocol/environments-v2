#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addFraxSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/addUSDTSeries.test.ts