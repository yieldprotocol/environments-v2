#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthSeries.mainnet.config
RUN="npx hardhat run --network mainnet"

# Add funds to the timelock
#$RUN $HERE/../../../../loadTimelock.ts

$RUN $HERE/../../newEnvironment/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../newEnvironment/deployPools.ts # deploy pools
$RUN $HERE/../../newEnvironment/deployStrategies.ts # deploy strategies

# Merge all the scripts below into a single one
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - propose
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - approve
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - execute

$RUN $HERE/addAssets.ts # make existing assets into bases and create new base/ilk pairs - propose
$RUN $HERE/addAssets.ts # make existing assets into bases and create new base/ilk pairs - approve
$RUN $HERE/addAssets.ts # make existing assets into bases and create new base/ilk pairs - execute

$RUN $HERE/../../newEnvironment/addSeries.ts # add series - propose
$RUN $HERE/../../newEnvironment/addSeries.ts # add series - approve
$RUN $HERE/../../newEnvironment/addSeries.ts # add series - execute

$RUN $HERE/../../newEnvironment/initStrategies.ts # orchestrate and initialize strategies - propose
$RUN $HERE/../../newEnvironment/initStrategies.ts # orchestrate and initialize strategies - approve
$RUN $HERE/../../newEnvironment/initStrategies.ts # orchestrate and initialize strategies - execute

