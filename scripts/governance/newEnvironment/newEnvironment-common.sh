#!/bin/bash

set -eux
RUN="npx hardhat run --network localhost"
HERE=$(dirname $0)

# Phase 1: Libraries
$RUN scripts/fragments/core/libraries/deployYieldMath.ts
$RUN scripts/fragments/core/libraries/deployYieldMathExtensions.ts
$RUN scripts/fragments/core/libraries/deployPoolView.ts
$RUN scripts/fragments/core/libraries/deploySafeERC20Namer.ts

# Phase 2: Governance
$RUN scripts/fragments/core/governance/deployTimelock.ts
$RUN scripts/fragments/core/governance/deployCloak.ts
$RUN $HERE/orchestrateCloak.ts # orchestrate Cloak - propose
$RUN $HERE/orchestrateCloak.ts # orchestrate Cloak - approve
$RUN $HERE/orchestrateCloak.ts # orchestrate Cloak - execute
$RUN $HERE/grantRoles.ts # grant developer and governor roles - propose
$RUN $HERE/grantRoles.ts # grant developer and governor roles - approve
$RUN $HERE/grantRoles.ts # grant developer and governor roles - execute

# Phase 3: Oracles
$RUN scripts/fragments/oracles/deployChainlinkOracle.ts
$RUN scripts/fragments/oracles/deployCompoundOracle.ts
$RUN scripts/fragments/oracles/deployCompositeOracle.ts
$RUN scripts/fragments/oracles/deployLidoOracle.ts
$RUN scripts/fragments/oracles/deployUniswapOracle.ts
$RUN scripts/fragments/oracles/deployYearnOracle.ts

$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - propose
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - approve
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - execute
