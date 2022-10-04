#!/bin/bash

set -eux
HERE=$(dirname $0)
# export CONF=$PWD/scripts/governance/update/updateSolvency/updateSolvency.mainnet.config
export CONF=$PWD/scripts/governance/base.arb_mainnet.config
RUN="npx hardhat run --network arb_mainnet"

$RUN $HERE/../../deploy/deploySolvency.ts

# $RUN $HERE/updateSolvency.ts
# $RUN $HERE/updateSolvency.ts
# $RUN $HERE/advanceTimeThreeDays.ts
# $RUN $HERE/updateSolvency.ts
# 
# $RUN $HERE/solvencyCheck.ts
