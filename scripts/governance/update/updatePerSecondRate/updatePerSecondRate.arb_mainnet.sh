#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network arb_mainnet"

export CONF=$PWD/$HERE/updatePerSecondRate.arb_mainnet.config

# $RUN $HERE/updatePerSecondRate.arb_mainnet.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
