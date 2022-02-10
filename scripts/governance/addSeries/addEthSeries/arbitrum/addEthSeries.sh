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

$RUN $HERE/../../../newEnvironment/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../newEnvironment/deployPools.ts # deploy pools

$RUN $HERE/makeBases.ts # make existing assets into bases - propose
$RUN $HERE/makeBases.ts # make existing assets into bases - approve
$RUN $HERE/makeBases.ts # make existing assets into bases - execute

$RUN $HERE/../../../newEnvironment/addSeries.ts # add series - propose
$RUN $HERE/../../../newEnvironment/addSeries.ts # add series - approve
$RUN $HERE/../../../newEnvironment/addSeries.ts # add series - execute
