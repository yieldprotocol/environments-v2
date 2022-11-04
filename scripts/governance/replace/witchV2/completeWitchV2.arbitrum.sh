#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/completeWitchV2.arb_mainnet.config
# RUN="npx hardhat run --network arb_mainnet"
# RUN="npx hardhat run --network localhost"
RUN="npx hardhat run --network tenderly_witchV2"

$RUN $HERE/../../../../shared/deploy.ts

# $RUN $HERE/activateWitchV2.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
