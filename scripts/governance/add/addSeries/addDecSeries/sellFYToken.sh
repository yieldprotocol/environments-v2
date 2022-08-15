#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.mainnet.config
RUN="npx hardhat run --network localhost"
# RUN="npx hardhat run --network tenderly"

$RUN $HERE/sellFYToken.ts
