#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/contango.arb_mainnet.config
RUN="npx hardhat run --network tenderly"

# Phase 1: Deploy Cauldron + Ladle
$RUN $HERE/deployContangoCauldron.ts
$RUN $HERE/deployContangoLadle.ts

# Phase 2: Deploy CompositeMultiOracle + IdentityOracle
$RUN $HERE/../../deploy/deployCompositeOracle.ts
$RUN $HERE/deployIdentityOracle.ts

# Phase 3: Orchestrate
$RUN $HERE/orchestrateContango.ts # propose
$RUN $HERE/orchestrateContango.ts # approve
$RUN $HERE/orchestrateContango.ts # execute

# Phase 4: Deploy Joins and configure fyTokens as collateral
$RUN $HERE/../../deploy/deployJoins.ts

$RUN $HERE/fyTokenAsCollateral.ts # propose
$RUN $HERE/fyTokenAsCollateral.ts # approve
$RUN $HERE/fyTokenAsCollateral.ts # execute
