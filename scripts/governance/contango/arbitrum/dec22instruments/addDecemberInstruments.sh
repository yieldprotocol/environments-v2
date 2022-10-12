#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/contango.arb_mainnet.dec22.config
RUN="npx hardhat run --network arb_mainnet"

# Phase 1: Deploy PoolOracle + YieldSpaceMultiOracle
$RUN $HERE/../../../deploy/deployPoolOracle.ts
$RUN $HERE/../../../deploy/deployYieldSpaceMultiOracle.ts

# # Phase 2: Deploy Joins
$RUN $HERE/../../../deploy/deployJoins.ts

# # Phase 3 initialise PoolOracle snapshots
$RUN $HERE/../../../../fragments/witchV2/initialisePoolOracle.ts # propose

# # Phase 4: Orchestrate
$RUN $HERE/../../shared/orchestrateNewInstruments.ts # propose
$RUN $HERE/../../shared/orchestrateNewInstruments.ts # approve
$RUN $HERE/../../shared/orchestrateNewInstruments.ts # execute
