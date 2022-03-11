#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/newEnvironment.rinkeby.config
RUN="npx hardhat run --network rinkeby"

# Phase 4: Core
$RUN $HERE/deployCauldron.ts*       >> output.txt
$RUN $HERE/deployLadle.ts*       >> output.txt # deploy Ladle, using WETH9 from the config file
$RUN $HERE/deployWitch.ts*       >> output.txt

$RUN $HERE/orchestrateCore.ts*       >> output.txt # orchestrate core - propose
$RUN $HERE/orchestrateCore.ts*       >> output.txt # orchestrate core - approve
$RUN $HERE/orchestrateCore.ts*       >> output.txt # orchestrate core - execute

# Phase 5: Assets, Series, Strategies
$RUN $HERE/deployJoins.ts*       >> output.txt # deploy joins
$RUN $HERE/deployFYTokens.ts*       >> output.txt # deploy fyTokens
$RUN $HERE/deployPools.ts*       >> output.txt # deploy pools

$RUN $HERE/addAssets.ts*       >> output.txt # orchestrate joins, make bases, make ilks - propose
$RUN $HERE/addAssets.ts*       >> output.txt # orchestrate joins, make bases, make ilks - approve
$RUN $HERE/addAssets.ts*       >> output.txt # orchestrate joins, make bases, make ilks - execute

$RUN $HERE/addSeries.ts*       >> output.txt # add series - propose
$RUN $HERE/addSeries.ts*       >> output.txt # add series - approve
$RUN $HERE/addSeries.ts*       >> output.txt # add series - execute

$RUN $HERE/deployStrategies.ts*       >> output.txt # deploy strategies (needs to be after adding assets)

$RUN $HERE/initStrategies.ts*       >> output.txt # orchestrate and initialize strategies - propose
$RUN $HERE/initStrategies.ts*       >> output.txt # orchestrate and initialize strategies - approve
$RUN $HERE/initStrategies.ts*       >> output.txt # orchestrate and initialize strategies - execute
