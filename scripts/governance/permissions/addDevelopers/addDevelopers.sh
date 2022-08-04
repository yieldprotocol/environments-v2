#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addDevelopers.mainnet.config
# RUN="npx hardhat run --network mainnet"
RUN="npx hardhat run --network localhost"

$RUN $HERE/addDevelopers.ts
# $RUN $HERE/addDevelopers.ts
# $RUN $HERE/addDevelopers.ts