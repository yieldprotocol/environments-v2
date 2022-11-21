#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addEthRewards.mainnet.config
RUN="npx hardhat run --network localhost"
# RUN="npx hardhat run --network mainnet"


$RUN $HERE/addEthRewards.ts