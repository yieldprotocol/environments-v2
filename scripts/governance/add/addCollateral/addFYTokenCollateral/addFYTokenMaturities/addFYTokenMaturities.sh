#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addFYTokenMaturities.mainnet.config
RUN="npx hardhat run --network mainnet"

$RUN $HERE/../deployJoins.ts # Deploy Joins

$RUN $HERE/addFYTokenMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - propose
$RUN $HERE/addFYTokenMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - approve
$RUN $HERE/addFYTokenMaturities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - execute
