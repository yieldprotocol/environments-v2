#!/bin/bash

set -eux
HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"
export CONF=$PWD/$HERE/addFCashMaturities.mainnet.config

$RUN $HERE/../deployNotionalJoins.ts # Deploy Joins

$RUN $HERE/addFCashMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - propose
$RUN $HERE/addFCashMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - approve
$RUN $HERE/addFCashMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - execute
