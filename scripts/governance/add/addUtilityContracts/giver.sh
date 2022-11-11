#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/../../base.mainnet.config
RUN="npx hardhat run --network tenderly"
$RUN $HERE/deployGiver.ts
$RUN $HERE/orchestrateGiver.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts