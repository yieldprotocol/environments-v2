#!/bin/bash

# set -euxo pipefail
RUN="npx hardhat run --network localhost --no-compile"
HERE=$(dirname $0)

# Phase 1: Libraries
$RUN scripts/fragments/core/libraries/deployYieldMath.ts
$RUN scripts/fragments/core/libraries/deployYieldMathExtensions.ts
$RUN scripts/fragments/core/libraries/deployPoolView.ts
$RUN scripts/fragments/core/libraries/deploySafeERC20Namer.ts

# Phase 2: Governance
$RUN scripts/fragments/core/governance/deployTimelock.ts
$RUN scripts/fragments/core/governance/deployCloak.ts
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-07.ts # orchestrate Cloak - propose
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-07.ts # orchestrate Cloak - approve
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-07.ts # orchestrate Cloak - execute

# Phase 3: Oracles
$RUN scripts/fragments/oracles/deployChainlinkOracle.ts
$RUN scripts/fragments/oracles/deployCompoundOracle.ts
$RUN scripts/fragments/oracles/deployCompositeOracle.ts
$RUN scripts/fragments/oracles/deployLidoOracle.ts
$RUN scripts/fragments/oracles/deployUniswapOracle.ts

$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-13.ts # setup oracles, data sources and price derivation paths - propose
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-13.ts # setup oracles, data sources and price derivation paths - approve
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-13.ts # setup oracles, data sources and price derivation paths - execute

# Phase 4: Factories
$RUN scripts/fragments/core/factories/deployJoinFactory.ts
$RUN scripts/fragments/core/factories/deployFYTokenFactory.ts
$RUN scripts/fragments/core/factories/deployPoolFactory.ts

$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-17.ts # orchestrate factories - propose
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-17.ts # orchestrate factories - approve
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-17.ts # orchestrate factories - execute

# Phase 5: Core
$RUN scripts/fragments/core/deployCauldron.ts
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-19.ts # deploy Ladle, using WETH9 from the config file
$RUN scripts/fragments/core/deployWitch.ts
$RUN scripts/fragments/core/deployWand.ts

$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-22.ts # orchestrate core - propose
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-22.ts # orchestrate core - approve
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-22.ts # orchestrate core - execute
