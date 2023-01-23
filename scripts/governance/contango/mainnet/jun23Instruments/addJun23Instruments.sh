#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"

# Phase 1: Deploy Joins
export CONF=$PWD/$HERE/contango.deployments
$RUN $HERE/../../../../../shared/deploy.ts

# Phase 2: Orchestrate
export CONF=$PWD/$HERE/contango.config
$RUN $HERE/../../shared/orchestrateNewInstruments.ts
$RUN $HERE/../../../../../shared/approve.ts
$RUN $HERE/../../../../../shared/execute.ts

