#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/scripts/governance/base.mainnet.config
RUN="npx hardhat run --network tenderly"

$RUN $HERE/deployNotionalJoins.ts
