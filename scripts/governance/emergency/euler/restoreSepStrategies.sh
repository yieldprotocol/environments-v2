#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"

# Phase 1: Deploy Contracts
# export CONF=$PWD/$HERE/restoreSepStrategies.deployments
# $RUN $HERE/../../../../shared/deploy.ts

# Phase 2: Proposal
export CONF=$PWD/$HERE/restoreSepStrategies.config

# $RUN $HERE/restoreSepStrategies.ts
# $RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
