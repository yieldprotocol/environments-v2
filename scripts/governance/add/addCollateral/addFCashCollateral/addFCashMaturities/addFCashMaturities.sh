#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addFCashDecMaturities.mainnet.config
RUN="npx hardhat run --network localhost"

# $RUN $HERE/../deployNotionalJoins.ts # Deploy Joins

$RUN $HERE/addFCashMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - propose
# $RUN $HERE/addFCashMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - approve
# $RUN $HERE/advanceTimeThreeDays.ts # AdvanceTime
# $RUN $HERE/addFCashMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - execute
