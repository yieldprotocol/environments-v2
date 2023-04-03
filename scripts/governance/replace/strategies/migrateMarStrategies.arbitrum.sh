#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"

# Phase 1: Deploy Contracts
export CONF=$PWD/$HERE/migrateMarStrategies.arbitrum.deployments
$RUN $HERE/../../../../shared/deploy.ts

# # Phase 2: Proposal
export CONF=$PWD/$HERE/migrateMarStrategies.arbitrum.config
# $RUN $HERE/../../../../tools/poolRollBalances.ts
# $RUN $HERE/../../../../tools/joinLoan.ts

$RUN $HERE/migrateMarStrategies.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts

# # Phase 3: Proposal USDC
export CONF=$PWD/$HERE/migrateMarUSDCStrategies.arbitrum.config

$RUN $HERE/migrateMarUSDCStrategy.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts