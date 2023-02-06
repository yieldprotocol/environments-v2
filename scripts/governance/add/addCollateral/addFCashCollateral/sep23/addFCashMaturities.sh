#!/bin/bash

set -eux
export HERE=$(dirname $0)

RUN="npx hardhat run --network localhost"

# export CONF=$PWD/$HERE/addFCashSep23.mainnet.deployments
# $RUN $HERE/../../../../../../shared/deploy.ts

export CONF=$PWD/$HERE/addFCashSep23.mainnet.config
# $RUN $HERE/../addFCashMaturities.ts
$RUN $HERE/../../../../../../shared/approve.ts
$RUN $HERE/../../../../../../shared/execute.ts
