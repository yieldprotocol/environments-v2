#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/revokeDevelopers.config
RUN="npx hardhat run --network arb_mainnet"
TEST="npx hardhat test --network arb_mainnet"

$RUN $HERE/revokeDevelopers.ts
# $RUN $HERE/../../../../shared/approve.ts
# $RUN $HERE/../../../../shared/execute.ts
# $TEST $HERE/revokeDevelopers.test.ts