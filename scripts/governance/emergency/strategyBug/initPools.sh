#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network arb_mainnet"

export CONF=$PWD/$HERE/initPools.arbitrum.config

# $RUN $HERE/../../../../tools/timelockBalances.ts

# $RUN $HERE/initPools.ts
# $RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
