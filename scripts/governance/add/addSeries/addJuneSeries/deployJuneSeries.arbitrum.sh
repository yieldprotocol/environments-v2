#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addJuneSeries.arbitrum.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../deploy/deployFYTokens.ts
$RUN $HERE/../../../deploy/deployNonTVPools.ts