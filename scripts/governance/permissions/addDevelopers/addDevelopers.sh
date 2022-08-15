#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDevelopers.config
# RUN="npx hardhat run --network arb_mainnet"
RUN="npx hardhat run --network tenderly"

$RUN $HERE/addDevelopers.ts
# $RUN $HERE/addDevelopers.ts
# $RUN $HERE/addDevelopers.ts