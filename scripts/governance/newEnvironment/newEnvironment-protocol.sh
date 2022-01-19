#!/bin/bash

set -eux
RUN="npx hardhat run --network localhost"
HERE=$(dirname $0)

# Phase 4: Core
$RUN scripts/fragments/core/deployCauldron.ts
$RUN $HERE/deployLadle.ts # deploy Ladle, using WETH9 from the config file
$RUN scripts/fragments/core/deployWitch.ts

$RUN $HERE/orchestrateCore.ts # orchestrate core - propose
$RUN $HERE/orchestrateCore.ts # orchestrate core - approve
$RUN $HERE/orchestrateCore.ts # orchestrate core - execute

# Phase 5: Assets, Series, Strategies
$RUN $HERE/deployJoins.ts # deploy joins
$RUN $HERE/deployFYTokens.ts # deploy fyTokens

# TODO: Deprecate the PoolFactory
$RUN scripts/fragments/core/factories/deployPoolFactory.ts
$RUN $HERE/orchestratePoolFactory.ts # orchestrate PoolFactory - propose
$RUN $HERE/orchestratePoolFactory.ts # orchestrate PoolFactory - approve
$RUN $HERE/orchestratePoolFactory.ts # orchestrate PoolFactory - execute
$RUN $HERE/deployPools.ts # deploy Pools - propose
$RUN $HERE/deployPools.ts # deploy Pools - approve
$RUN $HERE/deployPools.ts # deploy Pools - execute

$RUN $HERE/addAssets.ts # orchestrate joins, make bases, make ilks - propose
$RUN $HERE/addAssets.ts # orchestrate joins, make bases, make ilks - approve
$RUN $HERE/addAssets.ts # orchestrate joins, make bases, make ilks - execute

$RUN $HERE/addSeries.ts # add series - propose
$RUN $HERE/addSeries.ts # add series - approve
$RUN $HERE/addSeries.ts # add series - execute

$RUN $HERE/deployStrategies.ts # deploy strategies (needs to be after adding assets)

$RUN $HERE/initStrategies.ts # orchestrate and initialize strategies - propose
$RUN $HERE/initStrategies.ts # orchestrate and initialize strategies - approve
$RUN $HERE/initStrategies.ts # orchestrate and initialize strategies - execute
