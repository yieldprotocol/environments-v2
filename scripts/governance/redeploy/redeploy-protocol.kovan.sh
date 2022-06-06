#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/redeploy.kovan.config
RUN="npx hardhat run --network localhost"

# Phase 4: Core
$RUN $HERE/../deploy/deployCauldron.ts
$RUN $HERE/../deploy/deployLadle.ts # deploy Ladle, using WETH9 from the config file
$RUN $HERE/../deploy/deployWitch.ts

$RUN $HERE/orchestrateCore.ts # orchestrate core - propose
$RUN $HERE/orchestrateCore.ts # orchestrate core - approve
$RUN $HERE/orchestrateCore.ts # orchestrate core - execute

# Phase 5: Modules
$RUN $HERE/../add/addSeries/addEthSeries/deployWrapEtherModule.ts
$RUN $HERE/../add/addSeries/addEthSeries/orchestrateWrapEtherModule.ts
$RUN $HERE/../add/addSeries/addEthSeries/orchestrateWrapEtherModule.ts
$RUN $HERE/../add/addSeries/addEthSeries/orchestrateWrapEtherModule.ts

# Phase 6: Assets, Series, Strategies
$RUN $HERE/../deploy/deployJoins.ts # deploy joins
$RUN $HERE/../deploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../deploy/deployPools.ts # deploy pools
$RUN $HERE/addAssets.ts # orchestrate joins, make bases, make ilks - propose
$RUN $HERE/addAssets.ts # orchestrate joins, make bases, make ilks - approve
$RUN $HERE/addAssets.ts # orchestrate joins, make bases, make ilks - execute

$RUN $HERE/addSeries.ts # add series - propose
$RUN $HERE/addSeries.ts # add series - approve
$RUN $HERE/addSeries.ts # add series - execute

$RUN $HERE/../deploy/deployStrategies.ts # deploy strategies (needs to be after adding assets)

$RUN $HERE/initStrategies.ts # orchestrate and initialize strategies - propose
$RUN $HERE/initStrategies.ts # orchestrate and initialize strategies - approve
$RUN $HERE/initStrategies.ts # orchestrate and initialize strategies - execute
