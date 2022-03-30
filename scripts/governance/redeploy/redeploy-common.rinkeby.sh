#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/redeploy.rinkeby.config
RUN="npx hardhat run --network rinkeby"

# Phase 1: Libraries
$RUN $HERE/deployYieldMath.ts
$RUN $HERE/deployYieldMathExtensions.ts
$RUN $HERE/deployPoolView.ts
$RUN $HERE/deploySafeERC20Namer.ts

# Phase 2: Governance
$RUN $HERE/deployTimelock.ts
$RUN $HERE/deployCloak.ts
$RUN $HERE/orchestrateCloak.ts # orchestrate Cloak - propose
$RUN $HERE/orchestrateCloak.ts # orchestrate Cloak - approve
$RUN $HERE/orchestrateCloak.ts # orchestrate Cloak - execute
$RUN $HERE/grantRoles.ts # grant developer and governor roles - propose
$RUN $HERE/grantRoles.ts # grant developer and governor roles - approve
$RUN $HERE/grantRoles.ts # grant developer and governor roles - execute

# Phase 3: Oracles
$RUN $HERE/deployChainlinkOracle.ts
$RUN $HERE/deployCompoundOracle.ts
$RUN $HERE/deployCompositeOracle.ts
$RUN $HERE/deployLidoOracle.ts
$RUN $HERE/deployUniswapOracle.ts
$RUN $HERE/deployYearnOracle.ts

$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - propose
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - approve
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - execute
