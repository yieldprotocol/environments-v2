#!/bin/bash

set -eux
export HERE=$(dirname $0)
RUN="npx hardhat run --network tenderly"

export CONF=$PWD/$HERE/strategyBug.mainnet.config

$RUN $HERE/../../../../tools/loadTimelock.ts

$RUN $HERE/burnStrategy.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
