#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"

# Phase 1: Deploy Contracts
# export CONF=$PWD/$HERE/migrateStrategies.arbitrum.deployments
# $RUN $HERE/../../../../shared/deploy.ts

# Phase 2: Proposal
export CONF=$PWD/$HERE/migrateStrategies.arbitrum.config

# $RUN $HERE/migrateStrategies.arbitrum.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
