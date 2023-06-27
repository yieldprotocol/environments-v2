#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"

export CONF=$PWD/$HERE/../../base.mainnet.config

$RUN $HERE/../../../../shared/execute.ts
