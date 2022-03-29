#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/newEnvironment.rinkeby.config
RUN="npx hardhat run --network rinkeby"

# Phase 1: Libraries
$RUN $HERE/deployYieldMath.ts*       >> output.rinkeby.txt
$RUN $HERE/deployYieldMathExtensions.ts*       >> output.rinkeby.txt
$RUN $HERE/deployPoolView.ts*       >> output.rinkeby.txt
$RUN $HERE/deploySafeERC20Namer.ts*       >> output.rinkeby.txt

# Phase 2: Governance
$RUN $HERE/deployTimelock.ts*       >> output.rinkeby.txt
$RUN $HERE/deployCloak.ts*       >> output.rinkeby.txt
$RUN $HERE/orchestrateCloak.ts*       >> output.rinkeby.txt # orchestrate Cloak - propose
$RUN $HERE/orchestrateCloak.ts*       >> output.rinkeby.txt # orchestrate Cloak - approve
$RUN $HERE/orchestrateCloak.ts*       >> output.rinkeby.txt # orchestrate Cloak - execute
$RUN $HERE/grantRoles.ts*       >> output.rinkeby.txt # grant developer and governor roles - propose
$RUN $HERE/grantRoles.ts*       >> output.rinkeby.txt # grant developer and governor roles - approve
$RUN $HERE/grantRoles.ts*       >> output.rinkeby.txt # grant developer and governor roles - execute

# Phase 3: Oracles
$RUN $HERE/deployChainlinkOracle.ts*       >> output.rinkeby.txt
$RUN $HERE/deployCompoundOracle.ts*       >> output.rinkeby.txt
$RUN $HERE/deployCompositeOracle.ts*       >> output.rinkeby.txt
$RUN $HERE/deployLidoOracle.ts*       >> output.rinkeby.txt
$RUN $HERE/deployUniswapOracle.ts*       >> output.rinkeby.txt
$RUN $HERE/deployYearnOracle.ts*       >> output.rinkeby.txt

$RUN $HERE/setupOracles.ts*       >> output.rinkeby.txt # setup oracles, data sources and price derivation paths - propose
$RUN $HERE/setupOracles.ts*       >> output.rinkeby.txt # setup oracles, data sources and price derivation paths - approve
$RUN $HERE/setupOracles.ts*       >> output.rinkeby.txt # setup oracles, data sources and price derivation paths - execute
