#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateDust.mainnet.config
RUN="npx hardhat run --network mainnet"

# $RUN $HERE/updateDust.ts
# $RUN $HERE/updateDust.ts
$RUN $HERE/updateDust.ts

# $RUN $HERE/updateDust.test.ts 