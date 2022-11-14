#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/addFCashMaturities.mainnet.config
RUN="npx hardhat run --network localhost"

# $RUN $HERE/../deployNotionalJoins.ts # Deploy Joins
# 
$RUN $HERE/addFCashMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - propose
$RUN $HERE/../../../../../../shared/approve.ts
$RUN $HERE/../../../../../../shared/execute.ts
