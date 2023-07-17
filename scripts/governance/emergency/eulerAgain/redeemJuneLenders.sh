#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"

export CONF=$PWD/$HERE/redeemJuneLenders.config

# $RUN $HERE/redeemJuneLenders.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
