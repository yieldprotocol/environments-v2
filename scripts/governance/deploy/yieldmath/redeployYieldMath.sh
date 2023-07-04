#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network localhost"

export CONF=$PWD/$HERE/redeployYieldMath.arb_mainnet.config

$RUN $HERE/../../../../shared/deploy.ts
