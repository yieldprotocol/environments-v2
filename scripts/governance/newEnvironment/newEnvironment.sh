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
$RUN $HERE/newEnvironment-07.ts # orchestrate Cloak - propose
$RUN $HERE/newEnvironment-07.ts # orchestrate Cloak - approve
$RUN $HERE/newEnvironment-07.ts # orchestrate Cloak - execute

# Phase 3: Oracles
$RUN scripts/fragments/oracles/deployChainlinkOracle.ts
$RUN scripts/fragments/oracles/deployCompoundOracle.ts
$RUN scripts/fragments/oracles/deployCompositeOracle.ts
$RUN scripts/fragments/oracles/deployLidoOracle.ts
$RUN scripts/fragments/oracles/deployUniswapOracle.ts

$RUN $HERE/newEnvironment-13.ts # setup oracles, data sources and price derivation paths - propose
$RUN $HERE/newEnvironment-13.ts # setup oracles, data sources and price derivation paths - approve
$RUN $HERE/newEnvironment-13.ts # setup oracles, data sources and price derivation paths - execute

# Phase 4: Factories
$RUN scripts/fragments/core/factories/deployJoinFactory.ts        # To be deprecated alongside the Wand
$RUN scripts/fragments/core/factories/deployFYTokenFactory.ts     # To be deprecated alongside the Wand
$RUN scripts/fragments/core/factories/deployPoolFactory.ts        # To be deprecated alongside the Wand

$RUN $HERE/newEnvironment-17.ts # orchestrate factories - propose - To be deprecated alongside the Wand
$RUN $HERE/newEnvironment-17.ts # orchestrate factories - approve - To be deprecated alongside the Wand
$RUN $HERE/newEnvironment-17.ts # orchestrate factories - execute - To be deprecated alongside the Wand

# Phase 5: Core
$RUN scripts/fragments/core/deployCauldron.ts
$RUN $HERE/newEnvironment-19.ts # deploy Ladle, using WETH9 from the config file
$RUN scripts/fragments/core/deployWitch.ts
$RUN scripts/fragments/core/deployWand.ts

$RUN $HERE/newEnvironment-22.ts # orchestrate core - propose
$RUN $HERE/newEnvironment-22.ts # orchestrate core - approve
$RUN $HERE/newEnvironment-22.ts # orchestrate core - execute

# Phase 6: Assets
$RUN $HERE/newEnvironment-23.ts # deploy joins
$RUN $HERE/newEnvironment-24.ts # orchestrate joins, make bases, make ilks - propose
$RUN $HERE/newEnvironment-24.ts # orchestrate joins, make bases, make ilks - approve
$RUN $HERE/newEnvironment-24.ts # orchestrate joins, make bases, make ilks - execute

# Phase 7: Series, Pools, Strategies
### Breaks at this step because the Wand doesn't have rights on the Joins. Instead of fixing, finish deprecating the Wand
$RUN $HERE/newEnvironment-25.ts # add DAI series - propose
$RUN $HERE/newEnvironment-25.ts # add DAI series - approve
$RUN $HERE/newEnvironment-25.ts # add DAI series - execute
$RUN $HERE/newEnvironment-26.ts # add USDC series - propose
$RUN $HERE/newEnvironment-26.ts # add USDC series - approve
$RUN $HERE/newEnvironment-26.ts # add USDC series - execute

$RUN $HERE/newEnvironment-27.ts # deploy strategies

$RUN $HERE/newEnvironment-28.ts # orchestrate fyToken and strategies, initialize pools and strategies - propose
$RUN $HERE/newEnvironment-28.ts # orchestrate fyToken and strategies, initialize pools and strategies - approve
$RUN $HERE/newEnvironment-28.ts # orchestrate fyToken and strategies, initialize pools and strategies - execute
