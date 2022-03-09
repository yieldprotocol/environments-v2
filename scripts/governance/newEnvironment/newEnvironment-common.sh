#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/newEnvironment.rinkeby.config
RUN="npx hardhat run --network rinkeby"

# Phase 1: Libraries
$RUN $HERE/deployYieldMath.ts*       >> output.txt
$RUN $HERE/deployYieldMathExtensions.ts*       >> output.txt
$RUN $HERE/deployPoolView.ts*       >> output.txt
$RUN $HERE/deploySafeERC20Namer.ts*       >> output.txt

# Phase 2: Governance
$RUN $HERE/deployTimelock.ts*       >> output.txt
$RUN $HERE/deployCloak.ts*       >> output.txt
$RUN $HERE/orchestrateCloak.ts*       >> output.txt # orchestrate Cloak - propose
$RUN $HERE/orchestrateCloak.ts*       >> output.txt # orchestrate Cloak - approve
$RUN $HERE/orchestrateCloak.ts*       >> output.txt # orchestrate Cloak - execute
$RUN $HERE/grantRoles.ts*       >> output.txt # grant developer and governor roles - propose
$RUN $HERE/grantRoles.ts*       >> output.txt # grant developer and governor roles - approve
$RUN $HERE/grantRoles.ts*       >> output.txt # grant developer and governor roles - execute

# Phase 3: Oracles
$RUN $HERE/deployChainlinkOracle.ts*       >> output.txt
$RUN $HERE/deployCompoundOracle.ts*       >> output.txt
$RUN $HERE/deployCompositeOracle.ts*       >> output.txt
$RUN $HERE/deployLidoOracle.ts*       >> output.txt
$RUN $HERE/deployUniswapOracle.ts*       >> output.txt
$RUN $HERE/deployYearnOracle.ts*       >> output.txt

$RUN $HERE/setupOracles.ts*       >> output.txt # setup oracles, data sources and price derivation paths - propose
$RUN $HERE/setupOracles.ts*       >> output.txt # setup oracles, data sources and price derivation paths - approve
$RUN $HERE/setupOracles.ts*       >> output.txt # setup oracles, data sources and price derivation paths - execute
