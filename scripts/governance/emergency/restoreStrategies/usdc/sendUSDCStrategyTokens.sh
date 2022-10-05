#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/sendUSDCStrategyTokens.arbitrum.config
# RUN="npx hardhat run --network arb_mainnet"
# RUN="npx hardhat run --network localhost"
RUN="npx hardhat run --network tenderly"

$RUN $HERE/sendUSDCStrategyTokens.ts
$RUN $HERE/sendUSDCStrategyTokens.ts
$RUN $HERE/sendUSDCStrategyTokens.ts