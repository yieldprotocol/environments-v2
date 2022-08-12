#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.mainnet.config
RUN="npx hardhat run --network mainnet"

$RUN $HERE/addFCashMaturitiesWand.ts
