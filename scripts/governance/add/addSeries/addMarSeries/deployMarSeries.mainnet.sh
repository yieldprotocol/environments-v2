#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addMarSeries.mainnet.config
RUN="npx hardhat run --network mainnet"

$RUN $HERE/../../../deploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../deploy/deployEulerPools.ts # deploy pools