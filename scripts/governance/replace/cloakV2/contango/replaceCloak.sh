#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/replaceCloak.mainnet.config
RUN="npx hardhat run --network localhost"
# RUN="npx hardhat run --network tenderly"

$RUN $HERE/replaceCloak.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts
