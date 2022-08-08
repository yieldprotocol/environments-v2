#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateLimits.mainnet.config
RUN="npx hardhat run --network mainnet"

# $RUN $HERE/updateLimits.ts
# $RUN $HERE/updateLimits.ts
$RUN $HERE/updateLimits.ts

# $RUN $HERE/updateLimits.test.ts 