#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"

# Phase 1: Deploy Contracts
export CONF=$PWD/$HERE/replaceNotionalJoins.mainnet.deployments
$RUN $HERE/../../../../shared/deploy.ts

# # Phase 2: Orchestrate
export CONF=$PWD/$HERE/replaceNotionalJoins.mainnet.config
$RUN $HERE/replaceNotionalJoins.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
