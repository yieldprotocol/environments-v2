#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/newEnvironment.arb_rinkeby.config
RUN="npx hardhat run --network arb_rinkeby"

# Phase 4: Core
$RUN $HERE/../deployCauldron.ts
$RUN $HERE/../deployLadle.ts # deploy Ladle, using WETH9 from the config file
$RUN $HERE/../deployWitch.ts

$RUN $HERE/../orchestrateCore.ts # orchestrate core - propose
$RUN $HERE/../orchestrateCore.ts # orchestrate core - approve
$RUN $HERE/../orchestrateCore.ts # orchestrate core - execute

# Phase 5: Assets, Series, Strategies
$RUN $HERE/../deployJoins.ts # deploy joins
$RUN $HERE/../deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../deployPools.ts # deploy pools

$RUN $HERE/addAssets.ts # orchestrate joins, make bases, make ilks - propose
$RUN $HERE/addAssets.ts # orchestrate joins, make bases, make ilks - approve
$RUN $HERE/addAssets.ts # orchestrate joins, make bases, make ilks - execute

$RUN $HERE/../addSeries.ts # add series - propose
$RUN $HERE/../addSeries.ts # add series - approve
$RUN $HERE/../addSeries.ts # add series - execute

$RUN $HERE/../deployStrategies.ts # deploy strategies (needs to be after adding assets)

$RUN $HERE/../initStrategies.ts # orchestrate and initialize strategies - propose
$RUN $HERE/../initStrategies.ts # orchestrate and initialize strategies - approve
$RUN $HERE/../initStrategies.ts # orchestrate and initialize strategies - execute
