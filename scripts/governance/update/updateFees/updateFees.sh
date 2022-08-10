#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateFees.mainnet.config
RUN="npx hardhat run --network tenderly"

# $RUN $HERE/updateFees.ts
$RUN $HERE/updateFees.ts
$RUN $HERE/updateFees.ts