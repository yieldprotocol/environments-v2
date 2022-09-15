#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/restorePlan.arbitrum.config
# RUN="npx hardhat run --network arb_mainnet"
RUN="npx hardhat run --network arb_mainnet"

# $RUN $HERE/updateLimits.ts
# $RUN $HERE/updateLimits.ts
$RUN $HERE/restorePlan.ts