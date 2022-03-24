#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addSeptSeries.arbitrum.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../newEnvironment/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../newEnvironment/deployPools.ts # deploy pools