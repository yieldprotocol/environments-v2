#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"

# Phase 1: Deploy Contracts
export CONF=$PWD/$HERE/contango.mainnet.deployments
$RUN $HERE/../../../../../shared/deploy.ts

# # Phase 2: Orchestrate
export CONF=$PWD/$HERE/contango.mainnet.config
$RUN $HERE/orchestrate.ts

$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../tools/pokePoolOracle.ts
$RUN $HERE/../../../../../shared/execute.ts
