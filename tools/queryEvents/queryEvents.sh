#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/queryEvents.mainnet.config
RUN="npx hardhat run --network mainnet"


$RUN $HERE/queryBoughtVaults.ts
