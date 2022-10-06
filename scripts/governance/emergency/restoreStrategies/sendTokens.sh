#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/sendTokens.arbitrum.config
# RUN="npx hardhat run --network arb_mainnet"
RUN="npx hardhat run --network localhost"
# RUN="npx hardhat run --network tenderly"

$RUN $HERE/sendTokens.ts
$RUN $HERE/sendTokens.ts
$RUN $HERE/sendTokens.ts