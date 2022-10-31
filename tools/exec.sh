#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/../scripts/governance/base.mainnet.config
RUN="npx hardhat run --network mainnet"

$RUN $HERE/joinRollDrain.ts