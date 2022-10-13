#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addJuneSeries.mainnet.config
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../deploy/deployFYTokens.ts
$RUN $HERE/../../../deploy/deployEulerPools.ts
$RUN $HERE/../../../deploy/deployNonTVPools.ts