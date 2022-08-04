#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addSeptSeries.rinkeby.config
RUN="npx hardhat run --network rinkeby"

$RUN $HERE/../../deploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../deploy/deployPools.ts # deploy pools