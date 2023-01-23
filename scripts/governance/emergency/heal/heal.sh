#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/heal.mainnet.config
# RUN="npx hardhat run --network mainnet"
RUN="npx hardhat run --network mainnet"

$RUN $HERE/../../../../tools/healVaults.ts