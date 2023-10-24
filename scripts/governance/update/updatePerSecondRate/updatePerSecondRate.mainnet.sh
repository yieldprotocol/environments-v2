#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network mainnet"

export CONF=$PWD/$HERE/updatePerSecondRate.mainnet.config

# $RUN $HERE/updatePerSecondRate.mainnet.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
