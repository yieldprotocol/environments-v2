#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addSeptSeries.arbitrum.config
RUN="npx hardhat run --network arb_mainnet"

$RUN $HERE/../../redeploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../redeploy/deployPools.ts # deploy pools