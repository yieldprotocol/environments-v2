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

# Phase 6: Assets
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-23.ts # add assets, deploying joins - propose
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-23.ts # add assets, deploying joins - approve
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-23.ts # add assets, deploying joins - execute
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-24.ts # orchestrate joins, make bases, make ilks - propose
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-24.ts # orchestrate joins, make bases, make ilks - approve
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-24.ts # orchestrate joins, make bases, make ilks - execute

# Phase 7: Series, Pools, Strategies
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-25.ts # add series - propose
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-25.ts # add series - approve
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-25.ts # add series - execute

$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-26.ts # deploy strategies

$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-27.ts # orchestrate fyToken and strategies, initialize pools and strategies - propose
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-27.ts # orchestrate fyToken and strategies, initialize pools and strategies - approve
$RUN scripts/governance/newEnvironment/ethereum/newEnvironment-27.ts # orchestrate fyToken and strategies, initialize pools and strategies - execute
