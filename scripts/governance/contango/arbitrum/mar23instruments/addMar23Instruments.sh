#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/contango.arb_mainnet.mar23.config
RUN="npx hardhat run --network tenderly"

# # Phase 1: Deploy Joins
# $RUN $HERE/../../../deploy/deployJoins.ts

# # Phase 2: initialise PoolOracle snapshots
# $RUN $HERE/../../../../fragments/witchV2/initialisePoolOracle.ts

# # Phase 3: Orchestrate
# $RUN $HERE/../../shared/orchestrateNewInstruments.ts # propose
$RUN $HERE/../../shared/orchestrateNewInstruments.ts # approve
$RUN $HERE/../../shared/orchestrateNewInstruments.ts # execute
