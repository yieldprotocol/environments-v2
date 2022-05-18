#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateRatio.arb_mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/updateRatio.ts
$RUN $HERE/updateRatio.ts
$RUN $HERE/updateRatio.ts
