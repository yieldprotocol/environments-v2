#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/contango.arb_mainnet.dec22.config
RUN="npx hardhat run --network localhost"

# Phase 1: Deploy PoolOracle + YieldSpaceMultiOracle
#$RUN $HERE/deployPoolOracle.ts
#$RUN $HERE/deployYieldSpaceMultiOracle.ts

# Phase 2: Deploy Joins
$RUN $HERE/../../../deploy/deployJoins.ts

# Phase 3: Orchestrate
$RUN $HERE/../../shared/orchestrateNewInstruments.ts # propose
$RUN $HERE/../../shared/orchestrateNewInstruments.ts # approve
$RUN $HERE/../../shared/orchestrateNewInstruments.ts # execute
