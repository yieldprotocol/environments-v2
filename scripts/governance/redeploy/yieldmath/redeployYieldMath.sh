#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"

export CONF=$PWD/$HERE/redeployYieldMath.mainnet.config

$RUN $HERE/../../../../shared/deploy.ts
