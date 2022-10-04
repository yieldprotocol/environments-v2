#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/sendBaseTokens.arbitrum.config
# RUN="npx hardhat run --network arb_mainnet"
# RUN="npx hardhat run --network localhost"
RUN="npx hardhat run --network tenderly"

$RUN $HERE/sendBaseTokens.ts
$RUN $HERE/sendBaseTokens.ts
$RUN $HERE/sendBaseTokens.ts