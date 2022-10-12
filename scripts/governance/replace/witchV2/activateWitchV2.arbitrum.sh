#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/witchV2.arbitrum.config
RUN="npx hardhat run --network arb_mainnet"
# RUN="npx hardhat run --network tenderly"

$RUN $HERE/activateWitchV2.ts
# $RUN $HERE/activateWitchV2.ts
# $RUN $HERE/activateWitchV2.ts
