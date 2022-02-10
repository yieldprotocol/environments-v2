#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthSeries.arb_rinkeby.config
RUN="npx hardhat run --network arb_rinkeby"

# Add funds to the timelock
#$RUN $HERE/../../../../loadTimelock.ts

$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - propose
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - approve
$RUN $HERE/setupOracles.ts # setup oracles, data sources and price derivation paths - execute

$RUN $HERE/../../../../deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../../deployPools.ts # deploy pools

$RUN $HERE/../../../addAssets.ts # orchestrate joins, make bases, make ilks - propose
$RUN $HERE/../../../addAssets.ts # orchestrate joins, make bases, make ilks - approve
$RUN $HERE/../../../addAssets.ts # orchestrate joins, make bases, make ilks - execute

$RUN $HERE/../../../../addSeries.ts # add series - propose
$RUN $HERE/../../../../addSeries.ts # add series - approve
$RUN $HERE/../../../../addSeries.ts # add series - execute
