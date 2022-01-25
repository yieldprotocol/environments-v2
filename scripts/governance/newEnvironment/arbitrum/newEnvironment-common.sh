#!/bin/bash

set -eux
RUN="npx hardhat run --network arb_rinkeby"
HERE=$(dirname $0)

# Phase 1: Libraries
$RUN $HERE/../deployYieldMath.ts
$RUN $HERE/../deployYieldMathExtensions.ts
$RUN $HERE/../deployPoolView.ts
$RUN $HERE/../deploySafeERC20Namer.ts

# Phase 2: Governance
$RUN $HERE/../deployTimelock.ts
$RUN $HERE/../deployCloak.ts
$RUN $HERE/../orchestrateCloak.ts # orchestrate Cloak - propose
$RUN $HERE/../orchestrateCloak.ts # orchestrate Cloak - approve
$RUN $HERE/../orchestrateCloak.ts # orchestrate Cloak - execute
$RUN $HERE/../grantRoles.ts # grant developer and governor roles - propose
$RUN $HERE/../grantRoles.ts # grant developer and governor roles - approve
$RUN $HERE/../grantRoles.ts # grant developer and governor roles - execute

# Phase 3: Oracles
$RUN $HERE/deployChainlinkL2USDOracle.ts
$RUN $HERE/deployAccumulatorOracle.ts

$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - propose
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - approve
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - execute
