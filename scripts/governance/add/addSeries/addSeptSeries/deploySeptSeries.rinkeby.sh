#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addSeptSeries.rinkeby.config
RUN="npx hardhat run --network rinkeby"

$RUN $HERE/../../redeploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../redeploy/deployPools.ts # deploy pools