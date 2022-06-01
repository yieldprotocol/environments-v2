#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.arbitrum.config
RUN="npx hardhat run --network arb_mainnet"

$RUN $HERE/addDecSeries-3.ts
$RUN $HERE/addDecSeries-3.ts
$RUN $HERE/addDecSeries-3.ts