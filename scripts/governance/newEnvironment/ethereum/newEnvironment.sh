#!/bin/bash

# set -euxo pipefail
RUN="npx hardhat run --network localhost --no-compile"
HERE=$(dirname $0)

## Phase 1: Libraries
#$RUN scripts/fragments/core/libraries/deployYieldMath.ts
#$RUN scripts/fragments/core/libraries/deployYieldMathExtensions.ts
#$RUN scripts/fragments/core/libraries/deployPoolView.ts
#$RUN scripts/fragments/core/libraries/deploySafeERC20Namer.ts
#
## Phase 2: Governance
#$RUN scripts/fragments/core/governance/deployTimelock.ts
#$RUN scripts/fragments/core/governance/deployCloak.ts
#$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-07.ts # orchestrate Cloak - propose
#$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-07.ts # orchestrate Cloak - approve
#$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-07.ts # orchestrate Cloak - execute
#
## Phase 3: Oracles
#$RUN scripts/fragments/oracles/deployChainlinkOracle.ts
#$RUN scripts/fragments/oracles/deployCompoundOracle.ts
#$RUN scripts/fragments/oracles/deployCompositeOracle.ts
#$RUN scripts/fragments/oracles/deployLidoOracle.ts
#$RUN scripts/fragments/oracles/deployUniswapOracle.ts

$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-13.ts # setup oracles, data sources and price derivation paths - propose
#$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-13.ts # setup oracles, data sources and price derivation paths - approve
#$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-13.ts # setup oracles, data sources and price derivation paths - execute
