#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addSeptSeries.arbitrum.config
RUN="npx hardhat run --network arb_mainnet"

$RUN $HERE/../../deploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../deploy/deployPools.ts # deploy pools