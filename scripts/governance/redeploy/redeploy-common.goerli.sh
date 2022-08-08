#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/redeploy.goerli.config
RUN="npx hardhat run --network localhost"

# Phase 1: Libraries
$RUN $HERE/../deploy/deployYieldMath.ts
$RUN $HERE/../deploy/deployYieldMathExtensions.ts
$RUN $HERE/../deploy/deployPoolView.ts
$RUN $HERE/../deploy/deploySafeERC20Namer.ts

# Phase 2: Governance
$RUN $HERE/../deploy/deployTimelock.ts
$RUN $HERE/../deploy/deployCloak.ts
$RUN $HERE/orchestrateCloak.ts # orchestrate Cloak - propose
$RUN $HERE/orchestrateCloak.ts # orchestrate Cloak - approve
$RUN $HERE/orchestrateCloak.ts # orchestrate Cloak - execute
$RUN $HERE/grantRoles.ts # grant developer and governor roles - propose
$RUN $HERE/grantRoles.ts # grant developer and governor roles - approve
$RUN $HERE/grantRoles.ts # grant developer and governor roles - execute

# Phase 3: Oracles
$RUN $HERE/../deploy/deployChainlinkOracle.ts
$RUN $HERE/../deploy/deployCompoundOracle.ts
$RUN $HERE/../deploy/deployCompositeOracle.ts
$RUN $HERE/../deploy/deployLidoOracle.ts
$RUN $HERE/../deploy/deployUniswapOracle.ts
$RUN $HERE/../deploy/deployYearnOracle.ts
$RUN $HERE/arbitrum/deployAccumulatorOracle.ts

$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - propose
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - approve
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - execute