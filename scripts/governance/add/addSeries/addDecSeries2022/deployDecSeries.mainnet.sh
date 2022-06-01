#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.mainnet.config
RUN="npx hardhat run --network localhost"
$RUN $HERE/../../../redeploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../redeploy/deployPools.ts # deploy pools