#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network arb_mainnet"

# Phase 1: Deploy Contracts
# export CONF=$PWD/$HERE/migrateMarStrategies.arbitrum.deployments
# $RUN $HERE/../../../../shared/deploy.ts

# Phase 2: Proposal
# export CONF=$PWD/$HERE/migrateMarStrategies.arbitrum.config
# $RUN $HERE/../../../../tools/poolRollBalances.ts
# $RUN $HERE/../../../../tools/joinLoan.ts

# $RUN $HERE/../../../../tools/advanceTimeToMaturity.ts
# $RUN $HERE/migrateMarStrategies.ts
# $RUN $HERE/../../../../shared/approve.ts
# $RUN $HERE/../../../../shared/execute.ts
