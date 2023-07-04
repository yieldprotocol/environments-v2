#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network mainnet"

# Phase 1: Deploy Contracts
export CONF=$PWD/$HERE/trader.mainnet.deployments
$RUN $HERE/../../../../shared/deploy.ts

# Phase 2: Proposal
export CONF=$PWD/$HERE/rollDec23Series.mainnet.config

# $RUN $HERE/../rollSeries.ts
# $RUN $HERE/../../../../shared/approve.ts
# $RUN $HERE/../../../../shared/execute.ts
