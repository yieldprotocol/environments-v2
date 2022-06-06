#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDecSeries.goerli.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../deploy/deployFYTokens.ts # deploy fyTokens
$RUN $HERE/../../../deploy/deployYVPools.ts # deploy pools
$RUN $HERE/../../../deploy/deployNonTVPools.ts # deploy pools