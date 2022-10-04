#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/turities.mainnet.config
RUN="npx hardhat run --network mainnet"

$RUN $HERE/../deployNotionalJoins.ts # Deploy Joins

$RUN $HERE/turities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - propose
$RUN $HERE/turities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - approve
$RUN $HERE/turities.ts # Orchestrate Joins, add assets, make ilks, add ilks to series - execute
