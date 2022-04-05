#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/addEthSeries.test.ts