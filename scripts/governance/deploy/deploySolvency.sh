#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/scripts/governance/base.arb_mainnet.config
RUN="npx hardhat run --network arb_mainnet"

$RUN $HERE/deploySolvency.ts