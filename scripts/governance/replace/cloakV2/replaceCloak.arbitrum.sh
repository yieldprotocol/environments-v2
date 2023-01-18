#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/replaceCloak.arbitrum.config
# RUN="npx hardhat run --network localhost"
# RUN="npx hardhat run --network tenderly"
RUN="npx hardhat run --network arb_mainnet"

# $RUN $HERE/../../../../shared/deploy.ts

$RUN $HERE/replaceCloak.arbitrum.ts
# $RUN $HERE/../../../../shared/approve.ts
# $RUN $HERE/../../../../shared/execute.ts
